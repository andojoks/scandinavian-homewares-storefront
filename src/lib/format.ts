const currencyWhole = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const compactNumber = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

const integerFormat = new Intl.NumberFormat('en-US')

export const money = (value: number): string => currencyWhole.format(value)
export const moneyCents = (value: number): string => currencyCents.format(value)
export const moneyShort = (value: number): string =>
  value >= 10_000 ? `$${compactNumber.format(value)}` : currencyWhole.format(value)
export const int = (value: number): string => integerFormat.format(Math.round(value))
export const pct = (value: number): string => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

export function timeAgo(timestamp: number, now: number = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - timestamp) / 1000))
  if (seconds < 10) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return hours < 24 ? `${hours}h ago` : `${Math.floor(hours / 24)}d ago`
}

export function formatDate(
  timestamp: number,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' },
): string {
  return new Date(timestamp).toLocaleDateString('en-US', options)
}

export function initials(name = ''): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}
