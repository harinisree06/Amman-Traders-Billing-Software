import { COMPANY } from './constants'
import { LogoSAT } from './LogoSAT'

export function CompanyHeader(){
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="row" style={{ alignItems: 'center' }}>
        <div className="col">
          <div style={{ fontWeight: 800, fontSize: 18 }}>{COMPANY.name}</div>
          <div style={{ fontSize: 13 }}>{COMPANY.addressLines.join(' ')}</div>
          <div style={{ fontSize: 13 }}>GSTIN {COMPANY.gstin}, PAN: {COMPANY.pan}</div>
          <div style={{ fontSize: 13 }}>State: {COMPANY.stateDisplay}</div>
          <div style={{ fontSize: 13 }}>Mobile: {COMPANY.phoneDisplay} | Email: {COMPANY.email}</div>
        </div>
        <div className="col" style={{ textAlign: 'right' }}>
          <LogoSAT size={110} />
        </div>
      </div>
    </div>
  )
}


