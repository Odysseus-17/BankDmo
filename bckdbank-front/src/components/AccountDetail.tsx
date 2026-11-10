import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowLeft, ArrowUpFromLine, Check, Copy, Send } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { accountIcons } from '../lib/accountIcons'
import { bankApi, isAuthError, type Account, type Transaction } from '../lib/api'
import { accountTypeLabels, formatMoney, maskAccount } from '../lib/formatters'
import { sortByNewest } from '../lib/movements'
import ActivityPanel from './ActivityPanel'
import type { DialogKind } from './Dashboard'

interface AccountDetailProps {
  token: string
  refreshKey: number
  ownAccounts: string[]
  onAuthError: (error: unknown) => void
  onOpenDialog: (kind: DialogKind, accountNumber: string) => void
}

export default function AccountDetail({ token, refreshKey, ownAccounts, onAuthError, onOpenDialog }: AccountDetailProps) {
  const { accountNumber = '' } = useParams()
  const [account, setAccount] = useState<Account | null>(null)
  const [history, setHistory] = useState<Transaction[]>([])
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [loadedKey, setLoadedKey] = useState('')
  const requestKey = `${accountNumber}:${refreshKey}`
  const loading = loadedKey !== requestKey

  useEffect(() => {
    let active = true

    Promise.all([bankApi.getAccount(accountNumber, token), bankApi.getTransactions(accountNumber, token)])
      .then(([nextAccount, nextHistory]) => {
        if (!active) return
        setAccount(nextAccount)
        setHistory(sortByNewest(nextHistory))
        setError('')
      })
      .catch((reason: unknown) => {
        if (!active) return
        if (isAuthError(reason)) onAuthError(reason)
        setAccount(null)
        setError(reason instanceof Error ? reason.message : 'No pudimos cargar esta cuenta.')
      })
      .finally(() => {
        if (active) setLoadedKey(requestKey)
      })

    return () => { active = false }
  }, [accountNumber, token, refreshKey, requestKey, onAuthError])

  function copyNumber() {
    if (!account) return
    void navigator.clipboard.writeText(account.accountNumber).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  const back = <Link to="/cuentas" className="back-link"><ArrowLeft size={17} />Mis cuentas</Link>

  if (error && !loading) {
    return (
      <>
        {back}
        <div className="empty panel">
          <p>{error}</p>
          <Link to="/cuentas" className="btn btn-ghost">Volver a mis cuentas</Link>
        </div>
      </>
    )
  }

  const shown = account?.accountNumber === accountNumber ? account : null
  const Icon = shown ? accountIcons[shown.accountType] : null

  return (
    <>
      {back}
      <section className="account-hero">
        <div className="bank-card" aria-hidden="true">
          <span className="bank-card-chip" />
          <span className="bank-card-word">bckd</span>
          <span className="bank-card-number">{maskAccount(accountNumber)}</span>
          <span className="bank-card-type">{shown ? accountTypeLabels[shown.accountType] : ''}</span>
        </div>

        <div className="account-hero-info">
          <h1>
            {Icon && <Icon size={22} />}
            {shown ? `Cuenta de ${accountTypeLabels[shown.accountType].toLowerCase()}` : 'Cargando cuenta…'}
          </h1>
          <span className="summary-label">Saldo disponible</span>
          {shown
            ? <strong className="amount-hero">{formatMoney(shown.balance)}</strong>
            : <span className="skeleton skeleton-amount" />}

          <div className="account-number-full">
            <span>
              <span className="summary-label">Número de cuenta</span>
              <span className="amount">{accountNumber}</span>
            </span>
            <button className="btn btn-ghost btn-small" onClick={copyNumber} disabled={!shown}>
              {copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <div className="account-actions">
            <button className="btn btn-primary" disabled={!shown} onClick={() => onOpenDialog('deposit', accountNumber)}>
              <ArrowDownToLine size={16} />Depositar
            </button>
            <button className="btn btn-ghost" disabled={!shown} onClick={() => onOpenDialog('withdraw', accountNumber)}>
              <ArrowUpFromLine size={16} />Retirar
            </button>
            <button className="btn btn-ghost" disabled={!shown} onClick={() => onOpenDialog('transfer', accountNumber)}>
              <Send size={16} />Transferir
            </button>
          </div>
        </div>
      </section>

      <ActivityPanel
        title="Movimientos de la cuenta"
        transactions={shown ? history : []}
        ownAccounts={ownAccounts}
        focusAccount={accountNumber}
        loading={loading}
        filters
        table
      />
    </>
  )
}
