import { useState } from 'react'

export function LogoSAT({ size = 56 }: { size?: number }){
  const [imgFailed, setImgFailed] = useState(false)
  if (!imgFailed) {
    return <img src="/logo.png" alt="Company Logo" width={size} height={size} crossOrigin="anonymous" style={{ objectFit:'contain' }} onError={()=>setImgFailed(true)} />
  }
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="SAT Logo">
      <circle cx="20" cy="24" r="10" fill="#f59e0b"/>
      <circle cx="36" cy="24" r="10" fill="#3b82f6"/>
      <circle cx="28" cy="38" r="10" fill="#ef4444"/>
      <text x="44" y="20" fontSize="10" fontFamily="Arial, sans-serif" fill="#111827" fontWeight="700">SAT</text>
    </svg>
  )
}


