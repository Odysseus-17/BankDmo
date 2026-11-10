import { useState, type FormEvent } from 'react'
import { CircleAlert, LoaderCircle, TriangleAlert } from 'lucide-react'
import type { Account, OperationValues } from '../lib/api'
import { accountTypeLabels, formatMoney, maskAccount } from '../lib/formatters'
import Modal from './Modal'

interface OperationDialogProps {
  kind: 'deposit' | 'withdraw'
  accounts: Account[]
  initialAccount?: string
  onClose: () => void
  onSubmit: (values: OperationValues) => Promise<void>
}

const copy = {
  deposit: {
    title: 'Depositar dinero',
    description: 'Ingresa dinero a una de tus cuentas.',
    placeholder: '¿De dónde viene el dinero?',
    submit: 'Depositar',
    failure: 'No fue posible realizar el depósito.',
  },
  withdraw: {
    title: 'Retirar dinero',
    description: 'Saca dinero de una de tus cuentas.',
    placeholder: '¿Para qué es el retiro?',
    submit: 'Retirar',
    failure: 'No fue posible realizar el retiro.',
  },
}

export default function OperationDialog({ kind, accounts, initialAccount, onClose, onSubmit }: OperationDialogProps) {
  const [accountNumber, setAccountNumber] = useState(initialAccount ?? accounts[0]?.accountNumber ?? '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const text = copy[kind]

  const account = accounts.find((item) => item.accountNumber === accountNumber)
  const amountValue = Number(amount)
  const insufficient = kind === 'withdraw' && Boolean(account) && amountValue > (account?.balance ?? 0)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (insufficient) return
    if (!(amountValue > 0)) {
      setError('Ingresa un monto mayor a cero.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({ accountNumber, amount: amountValue, description: description.trim() })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : text.failure)
      setSubmitting(false)
    }
  }

  return (
    <Modal title={text.title} description={text.description} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <label className="field">
          <span>Cuenta</span>
          <select value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} required>
            {accounts.map((item) => (
              <option key={item.id} value={item.accountNumber}>
                {accountTypeLabels[item.accountType]} {maskAccount(item.accountNumber)} · {formatMoney(item.balance)}
              </option>
            ))}
          </select>
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
            autoFocus
            placeholder="0.00"
            className="amount"
          />
        </label>
        <label className="field">
          <span>Descripción <small>opcional</small></span>
          <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={120} placeholder={text.placeholder} />
        </label>

        {insufficient && (
          <p className="form-warning" role="alert">
            <TriangleAlert size={16} />No tienes saldo suficiente para este retiro. Disponible: {formatMoney(account?.balance ?? 0)}.
          </p>
        )}
        {error && <p className="form-error" role="alert"><CircleAlert size={16} />{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="btn btn-primary" disabled={submitting || insufficient}>
            {submitting && <LoaderCircle className="spin" size={16} />}{text.submit}
          </button>
        </div>
      </form>
    </Modal>
  )
}
