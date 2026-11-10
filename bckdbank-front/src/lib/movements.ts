import type { Transaction, TransactionType } from './api'
import { maskAccount } from './formatters'

export type Direction = 'in' | 'out' | 'internal'

export interface Movement {
  direction: Direction
  title: string
  counterpart: string | null
}

export const typeLabels: Record<TransactionType, string> = {
  DEPOSIT: 'Depósito',
  WITHDRAWAL: 'Retiro',
  TRANSFER: 'Transferencia',
}

// Interpreta una transacción desde el punto de vista del usuario.
// focusAccount: la cuenta que se está mirando (detalle de cuenta o filtro);
// sin ella, se compara contra todas las cuentas propias.
export function describeMovement(transaction: Transaction, ownAccounts: string[], focusAccount?: string): Movement {
  const source = transaction.sourceAccountNumber
  const destination = transaction.destinationAccount

  if (transaction.transactionType === 'DEPOSIT') return { direction: 'in', title: 'Depósito', counterpart: null }
  if (transaction.transactionType === 'WITHDRAWAL') return { direction: 'out', title: 'Retiro', counterpart: null }

  const sent = focusAccount
    ? source === focusAccount
    : Boolean(source && ownAccounts.includes(source))
  const received = focusAccount
    ? destination === focusAccount
    : Boolean(destination && ownAccounts.includes(destination))

  if (sent && received && source && destination) {
    return { direction: 'internal', title: 'Entre tus cuentas', counterpart: `${maskAccount(source)} a ${maskAccount(destination)}` }
  }
  if (sent) {
    return { direction: 'out', title: 'Transferencia enviada', counterpart: destination ? `Para ${maskAccount(destination)}` : null }
  }
  return { direction: 'in', title: 'Transferencia recibida', counterpart: source ? `De ${maskAccount(source)}` : null }
}

export function involvesAccount(transaction: Transaction, accountNumber: string) {
  return transaction.sourceAccountNumber === accountNumber || transaction.destinationAccount === accountNumber
}

export function sortByNewest(transactions: Transaction[]) {
  return [...transactions].sort((left, right) => right.timestamp.localeCompare(left.timestamp))
}
