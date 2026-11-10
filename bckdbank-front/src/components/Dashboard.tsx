import { useState } from 'react'
import { Check, LogOut, RefreshCw, Send, X } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { Account, AuthResponse, OperationValues, Transaction, TransferValues } from '../lib/api'
import AccountDetail from './AccountDetail'
import AccountsPanel from './AccountsPanel'
import ActivityPanel from './ActivityPanel'
import BrandMark from './BrandMark'
import CurrencyConverter, { type ExchangeState } from './CurrencyConverter'
import DashboardHeader from './DashboardHeader'
import DashboardSidebar from './DashboardSidebar'
import DashboardSummary from './DashboardSummary'
import MarketPanel, { type MarketState } from './MarketPanel'
import OperationDialog from './OperationDialog'
import TransferDialog from './TransferDialog'

export type DialogKind = 'transfer' | 'deposit' | 'withdraw'

interface DashboardProps {
  session: AuthResponse
  accounts: Account[]
  transactions: Transaction[]
  loading: boolean
  dashboardError: string
  refreshKey: number
  market: MarketState
  exchange: ExchangeState
  toast: string
  onRefresh: () => void
  onLogout: () => void
  onAuthError: (error: unknown) => void
  onSearchSymbol: (symbol: string) => void
  onRetryMarket: () => void
  onRetryRates: () => void
  onTransfer: (values: TransferValues) => Promise<void>
  onDeposit: (values: OperationValues) => Promise<void>
  onWithdraw: (values: OperationValues) => Promise<void>
  onDismissToast: () => void
}

export default function Dashboard({
  session,
  accounts,
  transactions,
  loading,
  dashboardError,
  refreshKey,
  market,
  exchange,
  toast,
  onRefresh,
  onLogout,
  onAuthError,
  onSearchSymbol,
  onRetryMarket,
  onRetryRates,
  onTransfer,
  onDeposit,
  onWithdraw,
  onDismissToast,
}: DashboardProps) {
  const [dialog, setDialog] = useState<{ kind: DialogKind; accountNumber?: string } | null>(null)
  const ownAccounts = accounts.map((account) => account.accountNumber)
  const totalBalance = accounts.reduce((total, account) => total + account.balance, 0)
  const localPart = session.email.split('@')[0]?.split(/[._-]/)[0] ?? ''
  const firstName = localPart.charAt(0).toUpperCase() + localPart.slice(1)

  function openDialog(kind: DialogKind, accountNumber?: string) {
    setDialog({ kind, accountNumber })
  }

  async function submitAndClose<T>(action: (values: T) => Promise<void>, values: T) {
    await action(values)
    setDialog(null)
  }

  const refreshButton = (
    <button className="btn btn-ghost" onClick={onRefresh} disabled={loading}>
      <RefreshCw size={16} className={loading ? 'spin' : undefined} />Actualizar saldos
    </button>
  )
  const transferButton = (
    <button className="btn btn-primary" onClick={() => openDialog('transfer')} disabled={!accounts.length}>
      <Send size={16} />Transferir dinero
    </button>
  )

  return (
    <div className="app-shell">
      <DashboardSidebar email={session.email} role={session.role} onLogout={onLogout} />

      <header className="mobile-bar">
        <BrandMark />
        <button className="icon-btn" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={19} /></button>
      </header>

      <main className="content">
        {dashboardError && (
          <div className="alert alert-error" role="alert">
            <span>{dashboardError}</span>
            <button className="btn btn-ghost btn-small" onClick={onRefresh}><RefreshCw size={15} />Reintentar</button>
          </div>
        )}

        <Routes>
          <Route
            index
            element={(
              <>
                <DashboardHeader title={firstName ? `Qué bueno verte, ${firstName}.` : 'Qué bueno verte.'} subtitle="Aquí tienes el estado de tus cuentas hoy.">
                  {refreshButton}
                  {transferButton}
                </DashboardHeader>
                <DashboardSummary accounts={accounts} transactionCount={transactions.length} role={session.role} loading={loading} copRate={exchange.rates?.rates.COP} />
                <div className="overview-grid">
                  <div className="stack">
                    <AccountsPanel accounts={accounts} loading={loading} compact onOpenTransfer={() => openDialog('transfer')} />
                    <ActivityPanel
                      title="Actividad reciente"
                      transactions={transactions}
                      ownAccounts={ownAccounts}
                      loading={loading}
                      limit={5}
                      moreLink="/movimientos"
                    />
                  </div>
                  <div className="stack">
                    <CurrencyConverter
                      token={session.token}
                      exchange={exchange}
                      totalBalance={totalBalance}
                      onRetry={onRetryRates}
                      onAuthError={onAuthError}
                      compact
                    />
                    <MarketPanel market={market} onSearch={onSearchSymbol} onRetry={onRetryMarket} compact />
                  </div>
                </div>
              </>
            )}
          />
          <Route
            path="cuentas"
            element={(
              <>
                <DashboardHeader title="Mis cuentas" subtitle="Elige una cuenta para ver su saldo, sus movimientos y operar con ella.">
                  {refreshButton}
                </DashboardHeader>
                <AccountsPanel accounts={accounts} loading={loading} />
              </>
            )}
          />
          <Route
            path="cuentas/:accountNumber"
            element={(
              <AccountDetail
                token={session.token}
                refreshKey={refreshKey}
                ownAccounts={ownAccounts}
                onAuthError={onAuthError}
                onOpenDialog={openDialog}
              />
            )}
          />
          <Route
            path="movimientos"
            element={(
              <>
                <DashboardHeader title="Movimientos" subtitle="Todo lo que ha entrado y salido de tus cuentas.">
                  {transferButton}
                </DashboardHeader>
                <ActivityPanel
                  title="Historial"
                  transactions={transactions}
                  ownAccounts={ownAccounts}
                  accounts={accounts}
                  loading={loading}
                  filters
                  table
                />
              </>
            )}
          />
          <Route
            path="mercado"
            element={(
              <>
                <DashboardHeader title="Mercado" subtitle="Convierte dólares a pesos y consulta el precio de una acción." />
                <div className="stack">
                  <CurrencyConverter
                    token={session.token}
                    exchange={exchange}
                    totalBalance={totalBalance}
                    onRetry={onRetryRates}
                    onAuthError={onAuthError}
                  />
                  <MarketPanel market={market} onSearch={onSearchSymbol} onRetry={onRetryMarket} />
                </div>
              </>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {dialog?.kind === 'transfer' && (
        <TransferDialog
          accounts={accounts}
          initialAccount={dialog.accountNumber}
          onClose={() => setDialog(null)}
          onSubmit={(values) => submitAndClose(onTransfer, values)}
        />
      )}
      {(dialog?.kind === 'deposit' || dialog?.kind === 'withdraw') && (
        <OperationDialog
          kind={dialog.kind}
          accounts={accounts}
          initialAccount={dialog.accountNumber}
          onClose={() => setDialog(null)}
          onSubmit={(values) => submitAndClose(dialog.kind === 'deposit' ? onDeposit : onWithdraw, values)}
        />
      )}

      <div className="toast-region" aria-live="polite">
        {toast && (
          <div className="toast" role="status">
            <span className="toast-check"><Check size={15} /></span>
            <span>{toast}</span>
            <button className="icon-btn" onClick={onDismissToast} aria-label="Cerrar aviso"><X size={16} /></button>
          </div>
        )}
      </div>
    </div>
  )
}
