import { useMemo, useRef, useState } from 'react'
import api from './api'
import { InvoicePrint } from './InvoicePrint'
import { useInvoice } from './store'
import { CompanyHeader } from './CompanyHeader'
import { SavedBills } from './SavedBills'
// Note: Lazy-load html2pdf only when needed to avoid any import-time issues
import { INDIA_STATES } from './indiaStates'

// store moved to ./store

function currency(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
}

export function App() {
  const { billTo, shipTo, items, cgstRate, sgstRate, igstRate, set, addItem, removeItem, billType, date, save, billNumber, billToState, billToTaxIdLabel, billToTaxIdValue, shipToPhone, transport } = useInvoice()

  const subTotal = useMemo(() => items.reduce((sum, it) => sum + it.quantity * it.rate, 0), [items])
  const cgst = useMemo(() => (subTotal * cgstRate) / 100, [subTotal, cgstRate])
  const sgst = useMemo(() => (subTotal * sgstRate) / 100, [subTotal, sgstRate])
  const igst = useMemo(() => (subTotal * igstRate) / 100, [subTotal, igstRate])
  const total = useMemo(() => subTotal + cgst + sgst + igst, [subTotal, cgst, sgst, igst])

  const printRef = useRef<HTMLDivElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showSavedBills, setShowSavedBills] = useState(false)

  async function saveInvoice() {
    // Save to server if enabled, but do not block PDF generation on failure
    try {
      if (save) {
        const res = await api.post('/api/invoices', {
          billTo,
          shipTo,
          items,
          taxes: { cgstRate, sgstRate, igstRate },
          billType,
          date,
          billNumber: billNumber || undefined,
          billToState,
          billToTaxIdLabel,
          billToTaxIdValue,
          shipToPhone,
          transport,
          save,
        })
        // Store the generated bill number
        if (res.data.billNumber) {
          set({ billNumber: res.data.billNumber })
        }
        alert(`✅ Bill saved successfully! Bill Number: ${res.data.billNumber || 'N/A'}`)
      }
      } catch (err: any) {
      console.error('Failed to save invoice, continuing to generate PDF...', err)
      const errorMsg = err?.response?.data?.error || 'Failed to save bill'
      alert(`❌ ${errorMsg}. PDF will still be generated.`)
    }

    const target = printRef.current
    if (!target) {
      console.error("❌ printRef is null, nothing to print!")
      return
    }

    // Give React a moment to ensure offscreen content fully renders (fonts/images)
    await new Promise((resolve) => setTimeout(resolve, 300))

    // When preview is visible, capture it as-is; otherwise make hidden node visible-but-transparent
    let previousOpacity = ''
    let previousVisibility = ''
    const capturingVisiblePreview = showPreview === true
    if (!capturingVisiblePreview) {
      previousOpacity = (target.style && target.style.opacity) || ''
      previousVisibility = (target.style && target.style.visibility) || ''
      target.style.opacity = '0.01'
      target.style.visibility = 'visible'
    }

    const html2pdfModule = await import("html2pdf.js")
    const html2pdf = (html2pdfModule as any).default || html2pdfModule

    const rect = target.getBoundingClientRect()
    // Target A4 size in CSS pixels at ~96 DPI
    const a4WidthPx = 794
    const a4HeightPx = 1123
    const contentWidth = Math.ceil(rect.width || target.scrollWidth || 800)
    const contentHeight = Math.ceil(target.scrollHeight || rect.height || 1123)
    const scaleToFit = Math.min(1, a4WidthPx / contentWidth, a4HeightPx / contentHeight)

    // Temporarily set width and transform to fit a single page
    const previousTransform = target.style.transform || ''
    const previousTransformOrigin = target.style.transformOrigin || ''
    const previousWidth = target.style.width || ''
    target.style.width = a4WidthPx + 'px'
    target.style.transformOrigin = 'top left'
    target.style.transform = `scale(${scaleToFit})`
    const opt = {
      margin: [0.2, 0.2, 0.2, 0.2],
      filename: `invoice_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        backgroundColor: '#ffffff',
        letterRendering: true,
        windowWidth: a4WidthPx,
        windowHeight: a4HeightPx,
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: [] },
    }

    try {
      // Use built-in save to avoid blank PDFs; set order from(element)->set(options)
      await html2pdf().from(target).set(opt).save()
    } finally {
      // Restore visibility tweaks when we modified them
      if (!capturingVisiblePreview) {
        target.style.opacity = previousOpacity
        target.style.visibility = previousVisibility
      }
      // Restore transform and size
      target.style.transform = previousTransform
      target.style.transformOrigin = previousTransformOrigin
      target.style.width = previousWidth
    }
  }


  if (showSavedBills) {
    return <SavedBills onBack={() => setShowSavedBills(false)} />
  }

  return (
    <div className="container">
      <CompanyHeader />
      <div className="card no-print" style={{ marginBottom: 12 }}>
        <div className="row" style={{ alignItems:'center' }}>
          <div className="col">
            <label>Select Bill Type:</label>
            <select value={billType} onChange={(e)=>set({ billType: e.target.value as any })}>
              <option>Estimate/Proforma Invoice</option>
              <option>Invoice</option>
            </select>
          </div>
          <div className="col">
            <label>Date:</label>
            <input type="date" value={date} onChange={(e)=>set({ date: e.target.value })} />
          </div>
          <div className="col">
            <label>Bill Number:</label>
            <input 
              type="text" 
              value={billNumber || ''} 
              onChange={(e)=>set({ billNumber: e.target.value || undefined })} 
              placeholder="Auto-generated if empty"
              style={{ fontSize: 13 }}
            />
          </div>
          <div className="col">
            <label>Save:</label>
            <div>
              <label><input type="radio" checked={save===true} onChange={()=>set({ save:true })} /> yes</label>
              <label style={{ marginLeft: 10 }}><input type="radio" checked={save===false} onChange={()=>set({ save:false })} /> No</label>
            </div>
          </div>
          <div className="col" style={{ textAlign:'right' }}>
            <button className="btn secondary" style={{ marginRight: 8 }} onClick={()=>setShowSavedBills(true)}>View Saved Bills</button>
            <button className="btn secondary" style={{ marginRight: 8 }} onClick={()=>setShowPreview((v)=>!v)}>{showPreview? 'Hide Preview' : 'Preview'}</button>
            <button className="btn" onClick={saveInvoice}>Generate & Print</button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <div className="card">
            <h3>Bill To</h3>
            <div>
              <label>Name</label>
              <input value={billTo.name} onChange={(e)=>set({ billTo: { ...billTo, name: e.target.value } })} />
            </div>
            <div>
              <label>Address</label>
              <textarea rows={3} value={billTo.address1} onChange={(e)=>set({ billTo: { ...billTo, address1: e.target.value } })} />
            </div>
            <div className="row">
              <div className="col"><label>Phone</label><input value={billTo.phone||''} onChange={(e)=>set({ billTo: { ...billTo, phone: e.target.value } })} /></div>
              <div className="col"><label>{billToTaxIdLabel}</label><input value={billToTaxIdValue||''} onChange={(e)=>set({ billToTaxIdValue: e.target.value })} /></div>
            </div>
            <div className="row">
              <div className="col">
                <label>State</label>
                <select value={billToState} onChange={(e)=>set({ billToState: e.target.value })}>
                  {INDIA_STATES.map((s)=> (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div className="col">
                <label>GST or PAN</label>
                <select value={billToTaxIdLabel} onChange={(e)=>set({ billToTaxIdLabel: e.target.value as any })}>
                  <option>GSTIN</option>
                  <option>PAN</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <h3>Shipping To</h3>
            <div>
              <label>Name</label>
              <input value={shipTo.name} onChange={(e)=>set({ shipTo: { ...shipTo, name: e.target.value } })} />
            </div>
            <div>
              <label>Address</label>
              <textarea rows={3} value={shipTo.address1} onChange={(e)=>set({ shipTo: { ...shipTo, address1: e.target.value } })} />
            </div>
            <div className="row">
              <div className="col"><label>Mobile</label><input value={shipToPhone||''} onChange={(e)=>set({ shipToPhone: e.target.value })} /></div>
              <div className="col"><label>GSTIN</label><input value={shipTo.gstin||''} onChange={(e)=>set({ shipTo: { ...shipTo, gstin: e.target.value } })} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Transportation Details</h3>
        <div className="row">
          <div className="col">
            <label>LR Number</label>
            <input value={transport.lrNumber||''} onChange={(e)=>set({ transport: { ...transport, lrNumber: e.target.value } })} />
          </div>
          <div className="col">
            <label>Parcel Details</label>
            <select value={transport.parcelDetails} onChange={(e)=>set({ transport: { ...transport, parcelDetails: e.target.value } })}>
              <option>Small White Bundle Bag</option>
              <option>Big Bundle Bag</option>
              <option>Carton Box</option>
            </select>
          </div>
          <div className="col">
            <label>Number of Bags</label>
            <input type="number" value={transport.numberOfBags||0} onChange={(e)=>set({ transport: { ...transport, numberOfBags: Number(e.target.value) || 0 } })} />
          </div>
          <div className="col">
            <label>Transport Name</label>
            <input value={transport.transportName||''} onChange={(e)=>set({ transport: { ...transport, transportName: e.target.value } })} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Sl No.</th>
              <th>Description Of Goods</th>
              <th>HSN/SAC</th>
              <th>Quantity (Piece)</th>
              <th>Rate</th>
              <th>Per</th>
              <th className="right">Amount</th>
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i)=> (
              <tr key={i}>
                <td>{i+1}</td>
                <td><input value={it.description} onChange={(e)=>{
                  const v = e.target.value
                  set({ items: items.map((row, idx)=> idx===i? {...row, description:v}: row) })
                }} /></td>
                <td><input value={it.hsn} onChange={(e)=>{
                  const v = e.target.value
                  set({ items: items.map((row, idx)=> idx===i? {...row, hsn:v}: row) })
                }} /></td>
                <td><input type="number" value={it.quantity} onChange={(e)=>{
                  const v = Number(e.target.value || 0)
                  set({ items: items.map((row, idx)=> idx===i? {...row, quantity:v}: row) })
                }} /></td>
                <td><input type="number" value={it.rate} onChange={(e)=>{
                  const v = Number(e.target.value || 0)
                  set({ items: items.map((row, idx)=> idx===i? {...row, rate:v}: row) })
                }} /></td>
                <td><input value={it.per} onChange={(e)=>{
                  const v = e.target.value
                  set({ items: items.map((row, idx)=> idx===i? {...row, per:v}: row) })
                }} /></td>
                <td className="right">{currency(it.quantity * it.rate)}</td>
                <td className="no-print"><button className="btn secondary" onClick={()=>removeItem(i)}>Remove</button></td>
              </tr>
            ))}
            <tr>
              <td colSpan={8}>
                <button className="btn no-print" onClick={addItem}>Add Item</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="row" style={{ marginTop: 12 }}>
          <div className="col"></div>
          <div className="col">
            <div className="row">
              <div className="col"><label>CGST %</label><input type="number" value={cgstRate} onChange={(e)=>set({ cgstRate: Number(e.target.value||0) })} /></div>
              <div className="col"><label>SGST %</label><input type="number" value={sgstRate} onChange={(e)=>set({ sgstRate: Number(e.target.value||0) })} /></div>
              <div className="col"><label>IGST %</label><input type="number" value={igstRate} onChange={(e)=>set({ igstRate: Number(e.target.value||0) })} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <div className="col"></div>
        <div className="col">
          <table>
            <tbody>
              <tr><th>Subtotal</th><td className="right">₹ {currency(subTotal)}</td></tr>
              <tr><th>CGST</th><td className="right">₹ {currency(cgst)}</td></tr>
              <tr><th>SGST</th><td className="right">₹ {currency(sgst)}</td></tr>
              <tr><th>IGST</th><td className="right">₹ {currency(igst)}</td></tr>
              <tr><th>Total (With Tax)</th><td className="right"><strong>₹ {currency(total)}</strong></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview area (visible) or hidden print target */}
      {showPreview ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3 className="no-print" style={{ marginTop: 0 }}>Preview</h3>
          <div ref={printRef} style={{ background:'#ffffff', width: '210mm', maxWidth: '100%', margin: '0 auto' }}>
            <InvoicePrint />
          </div>
        </div>
      ) : (
        <div id="print-root" ref={printRef} className="no-print" style={{ position:'fixed', left:0, top:0, opacity:0, pointerEvents:'none', background:'#ffffff', width: '210mm' }}>
          <InvoicePrint />
        </div>
      )}
    </div>
  )
}


