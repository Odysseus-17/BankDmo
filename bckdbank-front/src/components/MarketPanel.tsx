import { useState, type FormEvent } from 'react'
import { ArrowRight, Landmark, LoaderCircle, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { CompanyProfile, Quote } from '../lib/api'
import { formatMarketMoney } from '../lib/formatters'

export interface MarketState {
  symbol: string
  quote: Quote | null
  profile: CompanyProfile | null
  loading: boolean
  error: string
}

interface MarketPanelProps {
  market: MarketState
  compact?: boolean
  onSearch: (symbol: string) => void
  onRetry: () => void
}

const suggestions = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'TSLA']

export default function MarketPanel({ market, compact = false, onSearch, onRetry }: MarketPanelProps) {
  const { symbol, quote, profile, loading, error } = market
  const [symbolInput, setSymbolInput] = useState(symbol)
  const isPositive = (quote?.dp ?? 0) >= 0
  const currency = profile?.currency
  // Finnhub responde con ceros cuando el símbolo no existe
  const notFound = quote !== null && quote.c === 0 && quote.t === 0

  function submitSymbol(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = symbolInput.trim().toUpperCase()
    if (normalized) onSearch(normalized)
  }

  function pick(next: string) {
    setSymbolInput(next)
    onSearch(next)
  }

  return (
    <section className={`panel market ${compact ? '' : 'market-full'}`}>
      <header className="panel-header">
        <h2>Mercado</h2>
        {compact && <Link to="/mercado" className="link">Ver más</Link>}
      </header>

      <form className="symbol-search" onSubmit={submitSymbol} role="search">
        <Search size={17} />
        <input
          aria-label="Símbolo bursátil"
          value={symbolInput}
          onChange={(event) => setSymbolInput(event.target.value)}
          maxLength={20}
          placeholder="Símbolo, ej. AAPL"
        />
        <button type="submit" className="icon-btn" aria-label="Buscar símbolo" title="Buscar"><ArrowRight size={17} /></button>
      </form>

      {!compact && (
        <div className="chips">
          {suggestions.map((item) => (
            <button key={item} className="chip" aria-pressed={item === symbol} onClick={() => pick(item)}>{item}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="market-state"><LoaderCircle className="spin" size={20} />Consultando {symbol}…</div>
      ) : error ? (
        <div className="market-state market-error" role="alert">
          <p>{error}</p>
          <button className="btn btn-ghost btn-small" onClick={onRetry}><RefreshCw size={15} />Reintentar</button>
        </div>
      ) : notFound ? (
        <div className="market-state">No encontramos el símbolo {symbol}. Revisa que esté bien escrito.</div>
      ) : quote ? (
        <div className="quote">
          <div className="company">
            <span className="company-logo">
              {profile?.logo ? <img src={profile.logo} alt="" /> : <Landmark size={20} />}
            </span>
            <span>
              <strong>{profile?.ticker ?? symbol}</strong>
              <small>{profile?.name ?? 'Empresa'}</small>
            </span>
          </div>
          <div className="quote-price">
            <strong className="amount">{formatMarketMoney(quote.c, currency)}</strong>
            <span className={`quote-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
              {isPositive ? '+' : ''}{quote.d.toFixed(2)} ({isPositive ? '+' : ''}{quote.dp.toFixed(2)} %)
            </span>
          </div>
          <dl className="quote-stats">
            <div><dt>Máximo</dt><dd className="amount">{formatMarketMoney(quote.h, currency)}</dd></div>
            <div><dt>Mínimo</dt><dd className="amount">{formatMarketMoney(quote.l, currency)}</dd></div>
            <div><dt>Apertura</dt><dd className="amount">{formatMarketMoney(quote.o, currency)}</dd></div>
            <div><dt>Cierre anterior</dt><dd className="amount">{formatMarketMoney(quote.pc, currency)}</dd></div>
          </dl>
          {!compact && profile && (profile.exchange || profile.finnhubIndustry || profile.country) && (
            <dl className="company-facts">
              {profile.exchange && <div><dt>Bolsa</dt><dd>{profile.exchange}</dd></div>}
              {profile.finnhubIndustry && <div><dt>Industria</dt><dd>{profile.finnhubIndustry}</dd></div>}
              {profile.country && <div><dt>País</dt><dd>{profile.country}</dd></div>}
              {profile.weburl && <div><dt>Sitio web</dt><dd><a className="link" href={profile.weburl} target="_blank" rel="noreferrer">{profile.weburl.replace(/^https?:\/\//, '')}</a></dd></div>}
            </dl>
          )}
          <p className="quote-source">Datos de mercado por Finnhub</p>
        </div>
      ) : (
        <div className="market-state">Busca un símbolo para consultar su precio.</div>
      )}
    </section>
  )
}
