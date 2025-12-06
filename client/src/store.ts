import { create } from 'zustand'

export type Party = {
  name: string
  address1: string
  address2?: string
  city?: string
  state?: string
  phone?: string
  gstin?: string
}

export type Item = {
  description: string
  hsn: string
  quantity: number
  rate: number
  per: string
}

export type InvoiceState = {
  billTo: Party
  shipTo: Party
  cgstRate: number
  sgstRate: number
  igstRate: number
  items: Item[]
  billType: 'Invoice' | 'Estimate/Proforma Invoice'
  date: string
  save: boolean
  billNumber?: string
  billToState: string
  billToTaxIdLabel: 'GSTIN' | 'PAN'
  billToTaxIdValue?: string
  shipToPhone?: string
  transport: { parcelDetails: string; numberOfBags?: number; lrNumber?: string; transportName?: string }
  set: (p: Partial<InvoiceState>) => void
  addItem: () => void
  removeItem: (index: number) => void
}

export const useInvoice = create<InvoiceState>((set) => ({
  billTo: { name: '', address1: '' },
  shipTo: { name: '', address1: '' },
  cgstRate: 2.5,
  sgstRate: 2.5,
  igstRate: 0,
  items: [{ description: '', hsn: '', quantity: 1, rate: 0, per: 'Piece' }],
  billType: 'Estimate/Proforma Invoice',
  date: new Date().toISOString().slice(0,10),
  save: false,
  billToState: '33-TAMIL NADU',
  billToTaxIdLabel: 'GSTIN',
  billToTaxIdValue: '',
  shipToPhone: '',
  transport: { parcelDetails: 'Small White Bundle Bag', numberOfBags: 0, lrNumber: '', transportName: '' },
  set: (p) => set(p),
  addItem: () => set((s) => ({ items: [...s.items, { description: '', hsn: '', quantity: 1, rate: 0, per: 'Piece' }] })),
  removeItem: (index) => set((s) => ({ items: s.items.filter((_, i) => i !== index) })),
}))


