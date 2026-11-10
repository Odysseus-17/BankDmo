import { ArrowLeftRight, ShieldCheck, Wallet } from 'lucide-react'
import type { Account } from '../lib/api'
import { accountTypeLabels, formatCurrencyCode, formatMoney, formatRole } from '../lib/formatters'

interface DashboardSummaryProps {
  accounts: Account[]
  transactionCount: number
  role: string
  loading: boolean
  // Pesos colombianos por dólar, si ya cargaron las tasas de cambio
  copRate?: number
}

export default function DashboardSummary({ accounts, transactionCount, role, loading, copRate }: DashboardSummaryProps) {
  const totalBalance = accounts.reduce((total, account) => total + account.balance, 0)
  const types = [...new Set(accounts.map((account) => accountTypeLabels[account.accountType]))].join(', ')

  return (
    <section className="summary" aria-label="Resumen financiero">
      <div className="summary-balance">
        <span className="summary-label">Saldo total disponible en USD</span>
        {loading && !accounts.length
          ? <span className="skeleton skeleton-amount" />
          : <strong className="amount-hero">{formatMoney(totalBalance)}</strong>}
        {copRate !== undefined && accounts.length > 0 && (
          <span className="summary-cop amount">≈ {formatCurrencyCode(totalBalance * copRate, 'COP')}</span>
        )}
      </div>
      <dl className="summary-stats">
        <div>
          <dt><Wallet size={16} />Cuentas</dt>
          <dd>{accounts.length}</dd>
          <small>{types || 'Sin cuentas aún'}</small>
        </div>
        <div>
          <dt><ArrowLeftRight size={16} />Movimientos registrados</dt>
          <dd>{transactionCount}</dd>
          <small>En todas tus cuentas</small>
        </div>
        <div>
          <dt><ShieldCheck size={16} />Sesión</dt>
          <dd className="summary-active">Activa</dd>
          <small>Rol: {formatRole(role)}</small>
        </div>
      </dl>
    </section>
  )
}
