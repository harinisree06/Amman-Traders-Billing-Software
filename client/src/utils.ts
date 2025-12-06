export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

// Convert number to words in Indian format (limited, covers typical invoice ranges)
export function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero'
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function twoDigits(n: number): string {
    if (n < 20) return a[n]
    const tens = Math.floor(n / 10)
    const ones = n % 10
    return b[tens] + (ones ? ' ' + a[ones] : '')
  }

  function threeDigits(n: number): string {
    const hundred = Math.floor(n / 100)
    const rest = n % 100
    const prefix = hundred ? a[hundred] + ' Hundred' + (rest ? ' ' : '') : ''
    return prefix + (rest ? twoDigits(rest) : '')
  }

  const crore = Math.floor(num / 10000000)
  num = num % 10000000
  const lakh = Math.floor(num / 100000)
  num = num % 100000
  const thousand = Math.floor(num / 1000)
  num = num % 1000
  const hundred = num

  let words = ''
  if (crore) words += threeDigits(crore) + ' Crore '
  if (lakh) words += threeDigits(lakh) + ' Lakh '
  if (thousand) words += twoDigits(thousand) + ' Thousand '
  if (hundred) words += threeDigits(hundred)

  return words.trim()
}


