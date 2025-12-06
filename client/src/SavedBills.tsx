import { useEffect, useState } from 'react'
import api from './api'
import { InvoicePrint } from './InvoicePrint'
import { useInvoice } from './store'

type SavedInvoice = {
  id: string
  billTo: any
  shipTo: any
  items: any[]
  billType: string
  date: string
  billNumber?: string
  taxes?: { cgstRate: number; sgstRate: number; igstRate: number }
  totals: any
  createdAt: string
  billToState?: string
  billToTaxIdLabel?: string
  billToTaxIdValue?: string
  shipToPhone?: string
  transport?: any
}

export function SavedBills({ onBack }: { onBack: () => void }) {
  const [bills, setBills] = useState<SavedInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<SavedInvoice | null>(null)
  const { set: setInvoiceState } = useInvoice()

  useEffect(() => {
    loadBills()
  }, [])

  async function loadBills() {
    try {
      const res = await api.get('/api/invoices')
      setBills(res.data)
    } catch (error) {
      console.error('Failed to load bills:', error)
    } finally {
      setLoading(false)
    }
  }

  function currency(n: number) {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n)
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function viewBill(bill: SavedInvoice) {
    // Load bill data into the invoice form
    setInvoiceState({
      billTo: bill.billTo,
      shipTo: bill.shipTo,
      items: bill.items,
      billType: bill.billType as any,
      date: bill.date,
      billNumber: bill.billNumber,
      cgstRate: bill.taxes?.cgstRate || 2.5,
      sgstRate: bill.taxes?.sgstRate || 2.5,
      igstRate: bill.taxes?.igstRate || 0,
      billToState: bill.billToState || '',
      billToTaxIdLabel: bill.billToTaxIdLabel as any || 'GSTIN',
      billToTaxIdValue: bill.billToTaxIdValue || '',
      shipToPhone: bill.shipToPhone || '',
      transport: bill.transport || { parcelDetails: 'Small White Bundle Bag', numberOfBags: 0, lrNumber: '', transportName: '' },
    })
    onBack()
  }

  async function deleteBill(bill: SavedInvoice) {
    if (!confirm(`Are you sure you want to delete this bill?\n\nBill To: ${bill.billTo.name}\nDate: ${new Date(bill.date).toLocaleDateString('en-GB')}\nTotal: ₹ ${currency(bill.totals.total)}\n\nThis action cannot be undone.`)) {
      return
    }

    try {
      await api.delete(`/api/invoices/${bill.id}`)
      // Reload the list after deletion
      await loadBills()
      // If we're viewing the deleted bill, go back to list
      if (selectedBill?.id === bill.id) {
        setSelectedBill(null)
      }
    } catch (error) {
      console.error('Failed to delete bill:', error)
      alert('❌ Failed to delete bill. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading saved bills...</div>
      </div>
    )
  }

  if (selectedBill) {
    return (
      <div className="container">
        <div style={{ marginBottom: 16 }}>
          <button className="btn secondary" onClick={() => setSelectedBill(null)} style={{ marginRight: 8 }}>
            ← Back to List
          </button>
          <button className="btn secondary" onClick={onBack} style={{ marginRight: 8 }}>← Back to Invoice</button>
          <button 
            className="btn secondary" 
            onClick={() => deleteBill(selectedBill)}
            style={{ 
              backgroundColor: '#dc2626',
              color: '#fff',
              border: 'none'
            }}
          >
            🗑️ Delete Bill
          </button>
        </div>
        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <h2>Bill Details - {selectedBill.billType}</h2>
            <div style={{ fontSize: 12, color: '#666' }}>
              {selectedBill.billNumber && <span style={{ fontWeight: 600 }}>Bill No.: {selectedBill.billNumber}</span>} | Created: {formatDate(selectedBill.createdAt)} | ID: {selectedBill.id}
            </div>
          </div>
          <div style={{ background: '#fff', padding: 16 }}>
            <InvoicePrint />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Saved Bills ({bills.length})</h2>
        <button className="btn secondary" onClick={onBack}>← Back to Invoice</button>
      </div>

      {bills.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No saved bills found.</p>
          <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            Bills will appear here when you save them with "Save: Yes" option.
          </p>
        </div>
      ) : (
        <div className="card">
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Date</th>
                <th>Bill Type</th>
                <th>Bill To</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td style={{ fontWeight: 600 }}>{bill.billNumber || 'N/A'}</td>
                  <td>{new Date(bill.date).toLocaleDateString('en-GB')}</td>
                  <td>{bill.billType}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{bill.billTo.name}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>{bill.billTo.address1}</div>
                  </td>
                  <td>{bill.items.length} item(s)</td>
                  <td style={{ fontWeight: 600 }}>₹ {currency(bill.totals.total)}</td>
                  <td>
                    <button className="btn secondary" onClick={() => setSelectedBill(bill)} style={{ marginRight: 4, fontSize: 12, padding: '6px 10px' }}>
                      View
                    </button>
                    <button className="btn" onClick={() => viewBill(bill)} style={{ marginRight: 4, fontSize: 12, padding: '6px 10px' }}>
                      Use
                    </button>
                    <button 
                      className="btn secondary" 
                      onClick={() => deleteBill(bill)}
                      style={{ 
                        fontSize: 12, 
                        padding: '6px 10px',
                        backgroundColor: '#dc2626',
                        color: '#fff',
                        border: 'none'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

