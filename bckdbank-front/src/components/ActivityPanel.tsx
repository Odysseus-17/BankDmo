import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Account, Transaction, TransactionType } from '../lib/api'
import { accountTypeLabels, maskAccount } from '../lib/formatters'
import { describeMovement, involvesAccount } from '../lib/movements'
import TransactionRow from './TransactionRow'

interface ActivityPanelProps {
  title: string
  transactions: Transaction[]
  ownAccounts: string[]
  loading: boolean
  // Cuenta desde la que se interpretan las transferencias (detalle de cuenta)
  focusAccount?: string
  // Si se pasa, se muestra un selector para filtrar por cuenta
  accounts?: Account[]
  limit?: number
  moreLink?: string
  filters?: boolean
  table?: boolean
}

const typeFilters: { value: TransactionType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DEPOSIT', label: 'Depósitos' },
  { value: 'WITHDRAWAL', label: 'Retiros' },
  { value: 'TRANSFER', label: 'Transferencias' },
]

export default function ActivityPanel({
  title,
  transactions,
  ownAccounts,
  loading,
  focusAccount,
  accounts,
  limit,
  moreLink,
  filters = false,
  table = false,
}: ActivityPanelProps) {
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL')
  const [accountFilter, setAccountFilter] = useState('')
  const focus = focusAccount ?? (accountFilter || undefined)

  const visible = transactions
    .filter((item) => typeFilter === 'ALL' || item.transactionType === typeFilter)
    .filter((item) => !accountFilter || involvesAccount(item, accountFilter))
    .slice(0, limit)

  const filtered = typeFilter !== 'ALL' || accountFilter !== ''

  return (
    <section className="panel">
      <header className="panel-header">
        <h2>{title}</h2>
        {moreLink && transactions.length > 0 && <Link to={moreLink} className="link">Ver todos</Link>}
      </header>

      {filters && (
        <div className="filter-bar">
          <div className="segmented" role="group" aria-label="Filtrar por tipo de movimiento">
            {typeFilters.map((option) => (
              <button
                key={option.value}
                aria-pressed={typeFilter === option.value}
                onClick={() => setTypeFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {accounts && accounts.length > 1 && (
            <label className="select-inline">
              <span className="sr-only">Filtrar por cuenta</span>
              <select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}>
                <option value="">Todas las cuentas</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.accountNumber}>
                    {accountTypeLabels[account.accountType]} {maskAccount(account.accountNumber)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      {loading && !transactions.length ? (
        <ul className="tx-list" aria-busy="true">
          {[0, 1, 2, 3].map((item) => <li key={item} className="skeleton skeleton-row" />)}
          <li className="sr-only">Cargando movimientos…</li>
        </ul>
      ) : visible.length === 0 ? (
        <div className="empty">
          <Inbox size={28} />
          <p>{filtered
            ? 'No hay movimientos con este filtro.'
            : 'Tus movimientos aparecerán aquí. Empieza con un depósito o una transferencia.'}</p>
        </div>
      ) : (
        <>
          {table && (
            <div className="tx-table-head" aria-hidden="true">
              <span />
              <span>Descripción</span>
              <span>Tipo</span>
              <span>Cuenta relacionada</span>
              <span>Fecha</span>
              <span>Monto</span>
            </div>
          )}
          <ul className="tx-list">
            {visible.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                movement={describeMovement(transaction, ownAccounts, focus)}
                table={table}
              />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
