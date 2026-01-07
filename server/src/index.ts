import express from 'express'
import cors from 'cors'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(cors())
app.use(express.json())

// File path for storing invoices
const DATA_DIR = path.join(process.cwd(), 'data')
const INVOICES_FILE = path.join(DATA_DIR, 'invoices.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

// Load invoices from file
function loadInvoices(): Record<string, Invoice> {
  try {
    if (fs.existsSync(INVOICES_FILE)) {
      const data = fs.readFileSync(INVOICES_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading invoices:', error)
  }
  return {}
}

// Save invoices to file
function saveInvoices(invoices: Record<string, Invoice>) {
  try {
    fs.writeFileSync(INVOICES_FILE, JSON.stringify(invoices, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving invoices:', error)
  }
}

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

const InvoiceSchema = z.object({
  billTo: PartySchema,
  shipTo: PartySchema,
  items: z.array(ItemSchema),
  taxes: z.object({ cgstRate: z.number(), sgstRate: z.number(), igstRate: z.number() }),
  // optional meta fields mirrored from client
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

type Invoice = z.infer<typeof InvoiceSchema> & { id: string; billNumber?: string; totals: any; createdAt: string }

let invoices: Record<string, Invoice> = loadInvoices()

function calculateTotals(inv: z.infer<typeof InvoiceSchema>) {
  const subTotal = inv.items.reduce((s, it) => s + it.quantity * it.rate, 0)
  const cgst = (subTotal * inv.taxes.cgstRate) / 100
  const sgst = (subTotal * inv.taxes.sgstRate) / 100
  const igst = (subTotal * inv.taxes.igstRate) / 100
  const total = subTotal + cgst + sgst + igst
  return { subTotal, cgst, sgst, igst, total }
}

function generateBillNumber(): string {
  invoices = loadInvoices()
  
  // Get all saved invoices with bill numbers
  const usedNumbers = new Set<number>()
  Object.values(invoices).forEach(inv => {
    if (inv.billNumber) {
      // Parse bill number - it should be a simple number like "1", "2", "3"
      const num = parseInt(inv.billNumber, 10)
      if (!isNaN(num) && num > 0) {
        usedNumbers.add(num)
      }
    }
  })
  
  // Find the first available number (starting from 1)
  // If there are gaps (e.g., 1, 3, 5), use the first gap
  // Otherwise, use the next number after the max
  let nextNumber = 1
  if (usedNumbers.size > 0) {
    const maxNumber = Math.max(...Array.from(usedNumbers))
    // Find first gap
    for (let i = 1; i <= maxNumber; i++) {
      if (!usedNumbers.has(i)) {
        nextNumber = i
        break
      }
    }
    // If no gap found, use maxNumber + 1
    if (nextNumber === 1 && usedNumbers.has(1)) {
      nextNumber = maxNumber + 1
    }
  }
  
  return nextNumber.toString()
}

app.get('/health', (_req, res) => res.json({ ok: true }))

app.post('/api/invoices', (req, res) => {
  const parsed = InvoiceSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.format() })
  }
  const data = parsed.data
  
  // Check if custom bill number is provided in request body
  const customBillNumber = (req.body as any).billNumber
  
  let billNumber: string | undefined = undefined
  if (data.save) {
    if (customBillNumber && customBillNumber.trim()) {
      // Use custom bill number if provided
      invoices = loadInvoices()
      // Check if bill number already exists
      const existingBill = Object.values(invoices).find(inv => inv.billNumber === customBillNumber.trim())
      if (existingBill) {
        return res.status(400).json({ error: 'Bill number already exists. Please use a different number.' })
      }
      billNumber = customBillNumber.trim()
    } else {
      // Auto-generate if not provided
      billNumber = generateBillNumber()
    }
  }
  
  const totals = calculateTotals(data)
  const id = Date.now().toString()
  const record: Invoice = { ...data, billNumber, totals, id, createdAt: new Date().toISOString() }
  if (data.save) {
    invoices[id] = record
    saveInvoices(invoices)
  }
  res.json(record)
})

app.get('/api/invoices/:id', (req, res) => {
  const inv = invoices[req.params.id]
  if (!inv) return res.status(404).json({ error: 'Not found' })
  res.json(inv)
})

app.get('/api/invoices', (_req, res) => {
  // Reload from file to ensure we have latest data
  invoices = loadInvoices()
  const list = Object.values(invoices).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  res.json(list)
})

// Endpoint similar to the reference API structure
app.get('/api/get_bill_details', (_req, res) => {
  invoices = loadInvoices()
  const list = Object.values(invoices).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  res.json({ success: true, data: list })
})

// Delete invoice endpoint
app.delete('/api/invoices/:id', (req, res) => {
  invoices = loadInvoices()
  const id = req.params.id
  if (!invoices[id]) {
    return res.status(404).json({ error: 'Invoice not found' })
  }
  delete invoices[id]
  saveInvoices(invoices)
  res.json({ success: true, message: 'Invoice deleted successfully' })
})

const port = Number(process.env.PORT || 4000)
app.listen(port, () => console.log(`API listening on ${port}`))


