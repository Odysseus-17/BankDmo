import { useState, type FormEvent } from 'react'
import { ArrowLeftRight, CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { exchangeApi, isAuthError, type Conversion, type ExchangeRates } from '../lib/api'
import { formatCurrencyCode, formatRate, shortDate } from '../lib/formatters'

export interface ExchangeState {
  rates: ExchangeRates | null
  loading: boolean
  error: string
}

interface CurrencyConverterProps {
  token: string
  exchange: ExchangeState
  totalBalance: number
  compact?: boolean
  onRetry: () => void
  onAuthError: (error: unknown) => void
}

const currencies: { code: string; name: string }[] = [
  { code: 'USD', name: 'Dólar estadounidense' },
  { code: 'COP', name: 'Peso colombiano' },
  { code: 'EUR', name: 'Euro' },
  { code: 'MXN', name: 'Peso mexicano' },
  { code: 'BRL', name: 'Real brasileño' },
  { code: 'ARS', name: 'Peso argentino' },
  { code: 'CLP', name: 'Peso chileno' },
  { code: 'PEN', name: 'Sol peruano' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'CAD', name: 'Dólar canadiense' },
  { code: 'JPY', name: 'Yen japonés' },
  { code: 'CNY', name: 'Yuan chino' },
]

function formatUpdate(lastUpdate: string) {
  const date = new Date(lastUpdate)
  return Number.isNaN(date.getTime()) ? lastUpdate : shortDate.format(date)
}

export default function CurrencyConverter({ token, exchange, totalBalance, compact = false, onRetry, onAuthError }: CurrencyConverterProps) {
  const { rates, loading, error } = exchange
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('COP')
  const [conversion, setConversion] = useState<Conversion | null>(null)
  const [convertError, setConvertError] = useState('')
  const [converting, setConverting] = useState(false)

  const copRate = rates?.rates.COP
  const available = rates ? currencies.filter((item) => item.code in rates.rates) : currencies

  async function convert(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(amount)
    if (!(value > 0)) {
      setConvertError('Ingresa un monto mayor a cero.')
      return
    }
    setConvertError('')
    setConverting(true)
    try {
      setConversion(await exchangeApi.convert(from, to, value, token))
    } catch (reason) {
      onAuthError(reason)
      if (!isAuthError(reason)) setConvertError(reason instanceof Error ? reason.message : 'No fue posible convertir.')
    } finally {
      setConverting(false)
    }
  }

  function swap() {
    setFrom(to)
    setTo(from)
    setConversion(null)
  }

  function fillWithBalance() {
    setAmount(totalBalance.toFixed(2))
    setFrom('USD')
    setConversion(null)
  }

  const status = loading ? (
    <div className="market-state"><LoaderCircle className="spin" size={20} />Consultando tasas de cambio…</div>
  ) : error ? (
    <div className="market-state market-error" role="alert">
      <p>{error}</p>
      <button className="btn btn-ghost btn-small" onClick={onRetry}><RefreshCw size={15} />Reintentar</button>
    </div>
  ) : null

  if (compact) {
    return (
      <section className="panel fx">
        <header className="panel-header">
          <h2>Dólar hoy</h2>
          <Link to="/mercado" className="link">Convertir</Link>
        </header>
        {status ?? (copRate ? (
          <>
            <p className="fx-rate">
              <span>1 USD =</span>
              <strong className="amount">{formatRate(copRate)} COP</strong>
            </p>
            <p className="fx-balance">
              Tu saldo equivale a <strong className="amount">{formatCurrencyCode(totalBalance * copRate, 'COP')}</strong>
            </p>
            {rates && <p className="quote-source">Tasa de {rates.source}, actualizada el {formatUpdate(rates.lastUpdate)}.</p>}
          </>
        ) : null)}
      </section>
    )
  }

  return (
    <section className="panel fx fx-full">
      <header className="panel-header">
        <h2>Conversor de monedas</h2>
      </header>

      {status ?? (
        <>
          <form className="fx-form" onSubmit={convert}>
            <label className="field fx-amount">
              <span>Monto</span>
              <input
                className="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(event) => { setAmount(event.target.value); setConversion(null) }}
              />
            </label>
            <label className="field">
              <span>De</span>
              <select value={from} onChange={(event) => { setFrom(event.target.value); setConversion(null) }}>
                {available.map((item) => <option key={item.code} value={item.code}>{item.code}, {item.name}</option>)}
              </select>
            </label>
            <button type="button" className="icon-btn fx-swap" onClick={swap} aria-label="Intercambiar monedas" title="Intercambiar monedas">
              <ArrowLeftRight size={18} />
            </button>
            <label className="field">
              <span>A</span>
              <select value={to} onChange={(event) => { setTo(event.target.value); setConversion(null) }}>
                {available.map((item) => <option key={item.code} value={item.code}>{item.code}, {item.name}</option>)}
              </select>
            </label>
            <button type="submit" className="btn btn-primary fx-submit" disabled={converting}>
              {converting && <LoaderCircle className="spin" size={16} />}Convertir
            </button>
          </form>

          {totalBalance > 0 && (
            <button type="button" className="link fx-use-balance" onClick={fillWithBalance}>
              Usar mi saldo total ({formatCurrencyCode(totalBalance, 'USD')})
            </button>
          )}

          {convertError && <p className="form-error" role="alert"><CircleAlert size={16} />{convertError}</p>}

          {conversion && (
            <div className="fx-result" aria-live="polite">
              <span className="summary-label">{formatCurrencyCode(conversion.amount, conversion.from)} equivalen a</span>
              <strong className="amount-hero">{formatCurrencyCode(conversion.result, conversion.to)}</strong>
              <span className="fx-result-rate">1 {conversion.from} = {formatRate(conversion.rate)} {conversion.to}</span>
            </div>
          )}

          {rates && (
            <p className="quote-source">
              Tasas de {rates.source}, actualizadas una vez al día. Última actualización: {formatUpdate(rates.lastUpdate)}.
            </p>
          )}
        </>
      )}
    </section>
  )
}
