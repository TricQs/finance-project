export function formatCurrency(amount: number, currency = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCompactCurrency(amount: number) {
  if (amount >= 1_000_000_000) return `Rp${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)}rb`
  return formatCurrency(amount)
}