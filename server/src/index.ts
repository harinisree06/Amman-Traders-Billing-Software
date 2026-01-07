import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import mongoose from 'mongoose'

const app = express()
app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/billing'
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err))

// MongoDB Schema
const ItemSchema = z.object({
  description: z.string(),
  hsn: z.string().optional().default(''),
  quantity: z.number().nonnegative(),
  rate: z.number().nonnegative(),
  per: z.string().default('Piece'),
})

const PartySchema = z.object({
  name: z.string().default(''),
  address1: z.string().default(''),
  phone: z.string().optional().default(''),
  gstin: z.string().optional().default(''),
})

const InvoiceDataSchema = z.object({
  billTo: PartySchema,
  shipTo: PartySchema,
  items: z.array(ItemSchema),
  taxes: z.object({ cgstRate: z.number(), sgstRate: z.number(), igstRate: z.number() }),
  billType: z.string().optional(),
  date: z.string().optional(),
  billToState: z.string().optional(),
  billToTaxIdLabel: z.string().optional(),
  billToTaxIdValue: z.string().optional(),
  shipToPhone: z.string().optional(),
  transport: z
    .object({ parcelDetails: z.string(), numberOfBags: z.number().optional(), lrNumber: z.string().optional(), transportName: z.string().optional() })
    .optional(),
  save: z.boolean().default(false),
})

type InvoiceData = z.infer<typeof InvoiceDataSchema>

// Mongoose Model
const InvoiceSchema = new mongoose.Schema({
  billTo: {
    name: String,
    address1: String,
    phone: String,
    gstin: String,
  },
  shipTo: {
    name: String,
    address1: String,
    phone: String,
    gstin: String,
  },
  items: [{
    description: String,
    hsn: String,
    quantity: Number,
    rate: Number,
    per: String,
  }],
  taxes: {
    cgstRate: Number,
    sgstRate: Number,
    igstRate: Number,
  },
  billType: String,
  date: String,
  billNumber: String,
  billToState: String,
  billToTaxIdLabel: String,
  billToTaxIdValue: String,
  shipToPhone: String,
  transport: {
    parcelDetails: String,
    numberOfBags: Number,
    lrNumber: String,
    transportName: String,
  },
  totals: {
    subTotal: Number,
    cgst: Number,
    sgst: Number,
    igst: Number,
    total: Number,
  },
  createdAt: { type: Date, default: Date.now },
})

// Create unique index on billNumber
InvoiceSchema.index({ billNumber: 1 }, { unique: true, sparse: true })

const Invoice = mongoose.model('Invoice', InvoiceSchema)

function calculateTotals(inv: InvoiceData) {
  const subTotal = inv.items.reduce((s, it) => s + it.quantity * it.rate, 0)
  const cgst = (subTotal * inv.taxes.cgstRate) / 100
  const sgst = (subTotal * inv.taxes.sgstRate) / 100
  const igst = (subTotal * inv.taxes.igstRate) / 100
  const total = subTotal + cgst + sgst + igst
  return { subTotal, cgst, sgst, igst, total }
}

async function generateBillNumber(): Promise<string> {
  try {
    const invoices = await Invoice.find({ billNumber: { $exists: true, $ne: null } }).select('billNumber')
    
    const usedNumbers = new Set<number>()
    invoices.forEach(inv => {
      if (inv.billNumber) {
        const num = parseInt(inv.billNumber, 10)
        if (!isNaN(num) && num > 0) {
          usedNumbers.add(num)
        }
      }
    })
    
    let nextNumber = 1
    if (usedNumbers.size > 0) {
      const maxNumber = Math.max(...Array.from(usedNumbers))
      for (let i = 1; i <= maxNumber; i++) {
        if (!usedNumbers.has(i)) {
          nextNumber = i
          break
        }
      }
      if (nextNumber === 1 && usedNumbers.has(1)) {
        nextNumber = maxNumber + 1
      }
    }
    
    return nextNumber.toString()
  } catch (error) {
    console.error('Error generating bill number:', error)
    return '1'
  }
}

app.get('/health', (_req, res) => res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))

app.post('/api/invoices', async (req, res) => {
  try {
    const parsed = InvoiceDataSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.format() })
    }
    const data = parsed.data
    
    const customBillNumber = (req.body as any).billNumber
    
    let billNumber: string | undefined = undefined
    if (data.save) {
      if (customBillNumber && customBillNumber.trim()) {
        // Check if bill number already exists
        const existingBill = await Invoice.findOne({ billNumber: customBillNumber.trim() })
        if (existingBill) {
          return res.status(400).json({ error: 'Bill number already exists. Please use a different number.' })
        }
        billNumber = customBillNumber.trim()
      } else {
        // Auto-generate if not provided
        billNumber = await generateBillNumber()
      }
    }
    
    const totals = calculateTotals(data)
    const invoiceData = {
      ...data,
      billNumber,
      totals,
    }
    
    let record: any
    if (data.save) {
      const created = await Invoice.create(invoiceData)
      record = created.toObject() as any
      record.id = created._id.toString()
    } else {
      // Return without saving
      record = {
        ...invoiceData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }
    }
    
    res.json(record)
  } catch (error: any) {
    console.error('Error saving invoice:', error)
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bill number already exists. Please use a different number.' })
    }
    res.status(500).json({ error: 'Failed to save invoice' })
  }
})

app.get('/api/invoices/:id', async (req, res) => {
  try {
    const inv = await Invoice.findById(req.params.id)
    if (!inv) return res.status(404).json({ error: 'Not found' })
    const invoice: any = inv.toObject()
    invoice.id = inv._id.toString()
    res.json(invoice as any)
  } catch (error) {
    console.error('Error fetching invoice:', error)
    res.status(500).json({ error: 'Failed to fetch invoice' })
  }
})

app.get('/api/invoices', async (_req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 })
    const list = invoices.map(inv => {
      const invoice: any = inv.toObject()
      invoice.id = inv._id.toString()
      return invoice
    })
    res.json(list as any)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    res.status(500).json({ error: 'Failed to fetch invoices' })
  }
})

app.get('/api/get_bill_details', async (_req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 })
    const list = invoices.map(inv => {
      const invoice: any = inv.toObject()
      invoice.id = inv._id.toString()
      return invoice
    })
    res.json({ success: true, data: list as any })
  } catch (error) {
    console.error('Error fetching bills:', error)
    res.status(500).json({ error: 'Failed to fetch bills' })
  }
})

app.delete('/api/invoices/:id', async (req, res) => {
  try {
    const inv = await Invoice.findByIdAndDelete(req.params.id)
    if (!inv) {
      return res.status(404).json({ error: 'Invoice not found' })
    }
    res.json({ success: true, message: 'Invoice deleted successfully' })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    res.status(500).json({ error: 'Failed to delete invoice' })
  }
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`API listening on ${port}`))
