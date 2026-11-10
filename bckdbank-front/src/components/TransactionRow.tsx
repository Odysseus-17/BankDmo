import { ArrowDownLeft, ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine, ArrowUpRight } from 'lucide-react'
import type { Transaction } from '../lib/api'
import { formatMoney, formatTimestamp } from '../lib/formatters'
import { typeLabels, type Movement } from '../lib/movements'

interface TransactionRowProps {
  transaction: Transaction
  movement: Movement
  table?: boolean
}

function MovementIcon({ transaction, movement }: { transaction: Transaction; movement: Movement }) {
  if (transaction.transactionType === 'DEPOSIT') return <ArrowDownToLine size={17} />
  if (transaction.transactionType === 'WITHDRAWAL') return <ArrowUpFromLine size={17} />
  if (movement.direction === 'internal') return <ArrowLeftRight size={17} />
  return movement.direction === 'in' ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />
}

export default function TransactionRow({ transaction, movement, table = false }: TransactionRowProps) {
  const sign = movement.direction === 'in' ? '+ ' : movement.direction === 'out' ? '− ' : ''
  const when = formatTimestamp(transaction.timestamp)

  return (
    <li className={`tx-row ${table ? 'tx-row-table' : ''}`}>
      <span className={`tx-icon tx-${movement.direction}`}><MovementIcon transaction={transaction} movement={movement} /></span>
      <span className="tx-main">
        <strong>{movement.title}</strong>
        <small>{table ? transaction.description : movement.counterpart ?? transaction.description}</small>
      </span>
      {table && <span className="tx-type">{typeLabels[transaction.transactionType]}</span>}
      {table && <span className="tx-counterpart">{movement.counterpart ?? '—'}</span>}
      <time className="tx-date" dateTime={transaction.timestamp}>{when}</time>
      <span className={`tx-amount amount tx-amount-${movement.direction}`}>{sign}{formatMoney(transaction.amount)}</span>
    </li>
  )
}
