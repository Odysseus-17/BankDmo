import { ChevronRight, Plus, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { accountIcons } from '../lib/accountIcons'
import type { Account } from '../lib/api'
import { accountTypeLabels, formatMoney, maskAccount } from '../lib/formatters'

interface AccountsPanelProps {
  accounts: Account[]
  loading: boolean
  compact?: boolean
  onOpenTransfer?: () => void
}

export default function AccountsPanel({ accounts, loading, compact = false, onOpenTransfer }: AccountsPanelProps) {
  return (
    <section className="panel">
      {compact && (
        <header className="panel-header">
          <h2>Tus cuentas</h2>
          <div className="panel-header-actions">
            <Link to="/cuentas" className="link">Ver todas</Link>
            {onOpenTransfer && accounts.length > 0 && (
              <button className="btn btn-primary btn-small" onClick={onOpenTransfer}><Plus size={15} />Nueva transferencia</button>
            )}
          </div>
        </header>
      )}

      {loading && !accounts.length ? (
        <div className={`account-grid ${compact ? 'account-grid-compact' : ''}`} aria-busy="true">
          {[0, 1, 2].map((item) => <span key={item} className="skeleton skeleton-card" />)}
          <span className="sr-only">Cargando tus cuentas…</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="empty">
          <Wallet size={28} />
          <p>Aún no tienes cuentas. Tu cuenta de ahorros se crea al registrarte.</p>
        </div>
      ) : (
        <ul className={`account-grid ${compact ? 'account-grid-compact' : ''}`}>
          {accounts.map((account) => {
            const Icon = accountIcons[account.accountType]
            return (
              <li key={account.id}>
                <Link to={`/cuentas/${account.accountNumber}`} className={`account-tile account-${account.accountType.toLowerCase()}`}>
                  <span className="account-tile-top">
                    <span className="account-icon"><Icon size={18} /></span>
                    <span className="account-type">{accountTypeLabels[account.accountType]}</span>
                  </span>
                  <span className="account-number">{maskAccount(account.accountNumber)}</span>
                  <span className="account-tile-bottom">
                    <strong className="amount">{formatMoney(account.balance)}</strong>
                    <ChevronRight size={18} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
