import { useMemo } from 'react'
import { useInvoice } from './store'
import { numberToIndianWords } from './utils'
import { COMPANY } from './constants'
import { LogoSAT } from './LogoSAT'

export function InvoicePrint() {
  const { billTo, shipTo, items, cgstRate, sgstRate, igstRate, billType, date, billNumber, billToState, billToTaxIdLabel, billToTaxIdValue, shipToPhone, transport } = useInvoice()

  const subTotal = useMemo(() => items.reduce((s, it) => s + it.quantity * it.rate, 0), [items])
  const totalQuantity = useMemo(() => items.reduce((s, it) => s + it.quantity, 0), [items])
  const cgst = useMemo(() => (subTotal * cgstRate) / 100, [subTotal, cgstRate])
  const sgst = useMemo(() => (subTotal * sgstRate) / 100, [subTotal, sgstRate])
  const igst = useMemo(() => (subTotal * igstRate) / 100, [subTotal, igstRate])
  const total = useMemo(() => subTotal + cgst + sgst + igst, [subTotal, cgst, sgst, igst])
  const totalTax = useMemo(() => cgst + sgst + igst, [cgst, sgst, igst])

  function currency(n: number) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n) }

  return (
    <div className="printable" style={{ fontSize: 11, padding: '8mm 10mm', fontFamily: 'Arial, sans-serif', lineHeight: 1.4 }}>
      <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Tax Invoice</div>

      <table style={{ width: '100%', marginBottom: 8, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '60%', verticalAlign: 'top', padding: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{COMPANY.name}</div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 10, marginBottom: 2 }}>
                {COMPANY.addressLines.join(' ')}
              </div>
              <div style={{ fontSize: 10, marginBottom: 1 }}><strong>GSTIN</strong> <strong>{COMPANY.gstin}</strong>, <strong>PAN :</strong> <strong>{COMPANY.pan}</strong></div>
              <div style={{ fontSize: 10, marginBottom: 1 }}><strong>State:</strong> {COMPANY.stateDisplay}</div>
              <div style={{ fontSize: 10, marginBottom: 1 }}><strong>Mobile :</strong> <strong>{COMPANY.phoneDisplay}</strong></div>
              <div style={{ fontSize: 10 }}><strong>Email Id :</strong> {COMPANY.email}</div>
            </td>
            <td style={{ width: '40%', textAlign: 'right', verticalAlign: 'top', padding: 0 }}>
              <LogoSAT size={100} />
              <div style={{ fontSize: 9, marginTop: 2, textAlign: 'center' }}>{COMPANY.productTagline}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', marginBottom: 8, borderCollapse: 'collapse', border: '1px solid #000' }}>
        <tbody>
          <tr>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'left', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Bill To :</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'left', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Shipping To :</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'left', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Transportation Details</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'left', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Invoice/Estimate Details :</th>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', verticalAlign: 'top', padding: 4, fontSize: 10 }}>
              <div style={{ fontWeight: 700 }}>{billTo.name}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{billTo.address1}</div>
              {billTo.phone && <div><strong>Mob :</strong> <strong>{billTo.phone}</strong></div>}
              {billToTaxIdValue && <div><strong>{billToTaxIdLabel} :</strong> <strong>{billToTaxIdValue}</strong></div>}
              <div><strong>State:</strong> {billToState}</div>
            </td>
            <td style={{ border: '1px solid #000', verticalAlign: 'top', padding: 4, fontSize: 10 }}>
              <div style={{ fontWeight: 700 }}>{shipTo.name}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{shipTo.address1}</div>
              {shipToPhone && <div><strong>Mob :</strong> <strong>{shipToPhone}</strong></div>}
              {shipTo.gstin && <div><strong>GSTIN :</strong> <strong>{shipTo.gstin}</strong></div>}
            </td>
            <td style={{ border: '1px solid #000', verticalAlign: 'top', padding: 4, fontSize: 10 }}>
              <div><strong>Parcel Details :</strong> {transport.numberOfBags && transport.numberOfBags > 0 ? `${transport.numberOfBags} - ` : ''}{transport.parcelDetails}</div>
              <div><strong>Transport Name :</strong> {transport.transportName || '__________'}</div>
              <div><strong>LR Number :</strong> {transport.lrNumber || '__________'}</div>
            </td>
            <td style={{ border: '1px solid #000', verticalAlign: 'top', padding: 4, fontSize: 10 }}>
              <div style={{ fontWeight: 700 }}>{billType}</div>
              {billNumber && <div><strong>Bill No. :</strong> <strong>{billNumber}</strong></div>}
              <div><strong>Date :</strong> {new Date(date).toLocaleDateString('en-GB')}</div>
            </td>
          </tr>
        </tbody>
      </table>

      <table style={{ width: '100%', marginTop: 6, marginBottom: 6, borderCollapse: 'collapse', border: '1px solid #000' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Sl No.</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'left', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Description Of Goods</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>HSN/SAC</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Quantity</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Rate</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Per</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i)=> (
            <tr key={i}>
              <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 10 }}>{i+1}</td>
              <td style={{ border: '1px solid #000', padding: 4, fontSize: 10 }}>{it.description}</td>
              <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 10 }}>{it.hsn}</td>
              <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 10 }}>{it.quantity}</td>
              <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(it.rate)}</td>
              <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 10 }}>{it.per}</td>
              <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(it.quantity * it.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table style={{ width: '100%', marginBottom: 6, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: 2, fontSize: 10 }} colSpan={4}></td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>CGST</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>{cgstRate}%</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>₹ {currency(cgst)}</td>
          </tr>
          <tr>
            <td style={{ padding: 2, fontSize: 10 }} colSpan={4}></td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>SGST</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>{sgstRate}%</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>₹ {currency(sgst)}</td>
          </tr>
          <tr>
            <td style={{ padding: 2, fontSize: 10 }} colSpan={4}></td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>IGST</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>{igstRate}%</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>₹ {currency(igst)}</td>
          </tr>
          <tr>
            <td style={{ padding: 2, fontSize: 10 }} colSpan={4}></td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>Others</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}></td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>₹ 0.00</td>
          </tr>
          <tr>
            <td style={{ padding: 2, fontSize: 10 }} colSpan={4}></td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>TOTAL (Amount)</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}></td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>₹ {currency(subTotal)}</td>
          </tr>
          <tr>
            <td style={{ padding: 2, fontSize: 10 }} colSpan={4}></td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 11 }}>TOTAL (With Tax)</td>
            <td style={{ padding: 2, textAlign: 'right', fontSize: 10 }}>{totalQuantity}</td>
            <td style={{ padding: 2, textAlign: 'right', fontWeight: 700, fontSize: 11 }}>₹ {currency(total)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 4, marginBottom: 6, fontSize: 10 }}>
        <strong>Invoice Amount In Words : </strong>
        INR {numberToIndianWords(Math.round(total))} Only
      </div>

      <table style={{ width: '100%', marginTop: 4, marginBottom: 6, borderCollapse: 'collapse', border: '1px solid #000' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'left', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Tax type</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Taxable amount</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Rate</th>
            <th style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontWeight: 700, fontSize: 10, backgroundColor: '#f0f0f0' }}>Tax amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #000', padding: 4, fontSize: 10 }}>CGST</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(subTotal)}</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 10 }}>{cgstRate}%</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(cgst)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: 4, fontSize: 10 }}>SGST</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(subTotal)}</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 10 }}>{sgstRate}%</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(sgst)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: 4, fontSize: 10 }}>IGST</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(subTotal)}</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'center', fontSize: 10 }}>{igstRate}%</td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontSize: 10 }}>{currency(igst)}</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: 4, fontWeight: 700, fontSize: 10 }}>TOTAL</td>
            <td style={{ border: '1px solid #000', padding: 4, fontSize: 10 }}></td>
            <td style={{ border: '1px solid #000', padding: 4, fontSize: 10 }}></td>
            <td style={{ border: '1px solid #000', padding: 4, textAlign: 'right', fontWeight: 700, fontSize: 10 }}>₹ {currency(totalTax)}</td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 4, marginBottom: 4, fontSize: 10 }}>
        <strong>Tax Amount In Words : </strong>
        INR {numberToIndianWords(Math.round(totalTax))} Only
      </div>

      <table style={{ width: '100%', marginTop: 6, marginBottom: 4, borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ width: '33%', verticalAlign: 'top', padding: 4, fontSize: 9 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Terms and conditions:</div>
              <div style={{ lineHeight: 1.5 }}>* DELIVERY 2 TO 3 DAYS FROM ORDER CONFIRMATION.</div>
              <div style={{ lineHeight: 1.5 }}>* PAYMENTS 50% WITH ORDER CONFIRMATION REST ON INVOICE, E-WAY BILL, INVOICE & LR COPY OF LOGISTICS.</div>
              <div style={{ lineHeight: 1.5 }}>* NO REFUND ON ORDER CANCELLATION.</div>
            </td>
            <td style={{ width: '33%', verticalAlign: 'top', padding: 4, fontSize: 9 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Bank Details :</div>
              <div><strong>Bank Name :</strong> Canara Bank, Kaspapettai</div>
              <div><strong>Acc Name :</strong> SRI AMMAN TRADERS</div>
              <div><strong>Acc No :</strong> 120033443369</div>
              <div><strong>IFSC Code :</strong> CNRB0005372</div>
            </td>
            <td style={{ width: '33%', verticalAlign: 'top', padding: 4, fontSize: 9 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>Digital Payments:</div>
              <div><strong>GPay :</strong> __________</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ marginTop: 6, marginBottom: 4, fontSize: 9, fontStyle: 'italic' }}>
        <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct
      </div>

      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 9 }}></div>
        <div style={{ textAlign: 'right', fontSize: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 20 }}>For, SRI AMMAN TRADERS</div>
          <div style={{ fontWeight: 700 }}>Authorized Signatory</div>
        </div>
      </div>
    </div>
  )
}


