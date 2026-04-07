const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  maximumFractionDigits: 0,
  style: 'currency',
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0))
}
