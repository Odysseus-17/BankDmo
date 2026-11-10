import type { AccountType } from './api'

const money = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'USD',
  // Todas las cuentas están en USD: se muestra "$ 1.096,75" en vez de "US$ 1.096,75"
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 2,
})

export const shortDate = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const time = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' })

export const accountTypeLabels: Record<AccountType, string> = {
  SAVINGS: 'Ahorros',
  CHECKING: 'Corriente',
  CREDIT: 'Crédito',
}

export function formatMoney(value: number) {
  return money.format(value)
}

export function formatMarketMoney(value: number, currency?: string) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return formatMoney(value)
  }
}

// Monto con el código de la moneda al final, ej. "3.616.000 COP".
// Se usa el código y no el símbolo porque "$" sirve tanto para USD como para COP.
export function formatCurrencyCode(value: number, currency: string) {
  const decimals = currency === 'COP' || currency === 'CLP' || currency === 'JPY' ? 0 : 2
  const number = new Intl.NumberFormat('es-CO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value)
  return `${number} ${currency}`
}

export function formatRate(value: number) {
  return value < 1
    ? new Intl.NumberFormat('es-CO', { maximumFractionDigits: 6 }).format(value)
    : new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

export function maskAccount(accountNumber: string) {
  return `•••• ${accountNumber.slice(-4)}`
}

export function formatRole(role: string) {
  return role === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario'
}

// El backend envía LocalDateTime sin zona, así que se interpreta como hora local
export function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return `Hoy, ${time.format(date)}`
  if (date.toDateString() === yesterday.toDateString()) return `Ayer, ${time.format(date)}`
  return shortDate.format(date)
}
