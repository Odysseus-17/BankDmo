import { useState, type FormEvent } from 'react'
import { CircleAlert, LoaderCircle, ShieldCheck } from 'lucide-react'
import type { Account, TransferValues } from '../lib/api'
import { accountTypeLabels, formatMoney, maskAccount } from '../lib/formatters'
import Modal from './Modal'

interface TransferDialogProps {
  accounts: Account[]
  initialAccount?: string
  onClose: () => void
  onSubmit: (values: TransferValues) => Promise<void>
}

export default function TransferDialog({ accounts, initialAccount, onClose, onSubmit }: TransferDialogProps) {
  const [source, setSource] = useState(initialAccount ?? accounts[0]?.accountNumber ?? '')
  const [destination, setDestination] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const sourceAccount = accounts.find((account) => account.accountNumber === source)
  const amountValue = Number(amount)
  const otherAccounts = accounts.filter((account) => account.accountNumber !== source)

  const problem = destination.trim() && destination.trim() === source
    ? 'La cuenta de destino debe ser diferente a la cuenta de origen.'
    : sourceAccount && amountValue > sourceAccount.balance
      ? 'No tienes saldo suficiente en la cuenta de origen.'
      : ''

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (problem) return
    if (!(amountValue > 0)) {
      setError('Ingresa un monto mayor a cero.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        sourceAccountNumber: source,
        destinationAccountNumber: destination.trim(),
        amount: amountValue,
        description: description.trim(),
      })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible realizar la transferencia.')
      setSubmitting(false)
    }
  }

  const message = problem || error

  return (
    <Modal title="Nueva transferencia" description="Envía dinero a otra cuenta Bckd." onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Cuenta de origen</span>
          <select value={source} onChange={(event) => setSource(event.target.value)} required>
            {accounts.map((account) => (
              <option key={account.id} value={account.accountNumber}>
                {accountTypeLabels[account.accountType]} {maskAccount(account.accountNumber)} · {formatMoney(account.balance)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Cuenta de destino</span>
          <input
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            list="own-accounts"
            inputMode="numeric"
            required
            autoFocus
            placeholder="Número de cuenta"
          />
          <datalist id="own-accounts">
            {otherAccounts.map((account) => (
              <option key={account.id} value={account.accountNumber}>{accountTypeLabels[account.accountType]} propia</option>
            ))}
          </datalist>
        </label>
        <label className="field">
          <span>Monto en USD</span>
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            className="amount"
          />
        </label>
        <label className="field">
          <span>Descripción <small>opcional</small></span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={120} placeholder="¿Cuál es el motivo?" />
        </label>

        {message && <p className="form-error" role="alert"><CircleAlert size={16} />{message}</p>}
        <p className="form-note"><ShieldCheck size={16} />Validamos el saldo y la cuenta de destino antes de mover el dinero.</p>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={submitting || Boolean(problem)}>
            {submitting && <LoaderCircle className="spin" size={16} />}Transferir
          </button>
        </div>
      </form>
    </Modal>
  )
}
