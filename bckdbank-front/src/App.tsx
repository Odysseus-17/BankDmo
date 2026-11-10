import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import {
  ApiError, bankApi, exchangeApi, isAuthError, marketApi,
  type Account, type AuthResponse, type CompanyProfile, type ExchangeRates, type OperationValues, type Quote, type Transaction, type TransferValues,
} from './lib/api'
import { sortByNewest } from './lib/movements'
import type { AuthMode } from './types/auth'
import AuthScreen from './components/AuthScreen'
import Dashboard from './components/Dashboard'
import './App.css'

const SESSION_KEY = 'bckdbank.session'

function readSession(): AuthResponse | null {
  try {
    const saved = localStorage.getItem(SESSION_KEY)
    if (!saved) return null
    const session = JSON.parse(saved) as AuthResponse
    return session.token && session.email ? session : null
  } catch {
    return null
  }
}

function App() {
  const [session, setSession] = useState<AuthResponse | null>(readSession)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadedDashboardKey, setLoadedDashboardKey] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [dashboardError, setDashboardError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [toast, setToast] = useState('')
  const [symbol, setSymbol] = useState('AAPL')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [marketError, setMarketError] = useState('')
  const [marketRetry, setMarketRetry] = useState(0)
  const [loadedMarketKey, setLoadedMarketKey] = useState('')
  const [rates, setRates] = useState<ExchangeRates | null>(null)
  const [ratesError, setRatesError] = useState('')
  const [ratesRetry, setRatesRetry] = useState(0)
  const [loadedRatesKey, setLoadedRatesKey] = useState('')

  const dashboardRequestKey = session ? `${session.token}:${refreshKey}` : ''
  const marketRequestKey = session ? `${session.token}:${symbol}:${marketRetry}` : ''
  const loading = Boolean(session && loadedDashboardKey !== dashboardRequestKey)
  const marketLoading = Boolean(session && loadedMarketKey !== marketRequestKey)
  const ratesRequestKey = session ? `${session.token}:${ratesRetry}` : ''
  const ratesLoading = Boolean(session && loadedRatesKey !== ratesRequestKey)

  const endSession = useCallback((message = '') => {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setAccounts([])
    setTransactions([])
    setQuote(null)
    setProfile(null)
    setRates(null)
    setAuthMessage(message)
  }, [])

  // Si el token venció, el backend responde 401/403: se cierra la sesión
  const handleAuthError = useCallback((error: unknown) => {
    if (isAuthError(error)) endSession('Tu sesión venció. Inicia sesión nuevamente.')
  }, [endSession])

  useEffect(() => {
    if (!session) return
    const token = session.token
    let active = true

    async function loadDashboard() {
      try {
        const nextAccounts = await bankApi.getAccounts(token)
        const histories = await Promise.all(
          nextAccounts.map((account) => bankApi.getTransactions(account.accountNumber, token)),
        )
        if (!active) return
        setAccounts(nextAccounts)
        // Una transferencia entre cuentas propias aparece en ambos historiales
        const unique = histories.flat()
          .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
        setTransactions(sortByNewest(unique))
        setDashboardError('')
      } catch (error) {
        if (!active) return
        if (isAuthError(error)) handleAuthError(error)
        else setDashboardError(error instanceof Error ? error.message : 'No pudimos cargar tus cuentas.')
      } finally {
        if (active) setLoadedDashboardKey(dashboardRequestKey)
      }
    }

    void loadDashboard()
    return () => { active = false }
  }, [session, refreshKey, dashboardRequestKey, handleAuthError])

  useEffect(() => {
    if (!session) return
    let active = true

    Promise.all([marketApi.getQuote(symbol), marketApi.getProfile(symbol)])
      .then(([nextQuote, nextProfile]) => {
        if (!active) return
        setQuote(nextQuote)
        setProfile(nextProfile)
        setMarketError('')
      })
      .catch((error: unknown) => {
        if (!active) return
        setQuote(null)
        setProfile(null)
        setMarketError(error instanceof ApiError && error.status < 500
          ? error.message
          : 'No pudimos consultar el mercado. Revisa que el servicio financiero esté encendido.')
      })
      .finally(() => {
        if (active) setLoadedMarketKey(marketRequestKey)
      })

    return () => { active = false }
  }, [session, symbol, marketRetry, marketRequestKey])

  // Tasas de cambio con base USD (las cuentas están en dólares); el backend las guarda en caché
  useEffect(() => {
    if (!session) return
    let active = true

    exchangeApi.getRates('USD', session.token)
      .then((nextRates) => {
        if (!active) return
        setRates(nextRates)
        setRatesError('')
      })
      .catch((error: unknown) => {
        if (!active) return
        if (isAuthError(error)) handleAuthError(error)
        else setRatesError(error instanceof Error ? error.message : 'No pudimos consultar las tasas de cambio.')
      })
      .finally(() => {
        if (active) setLoadedRatesKey(ratesRequestKey)
      })

    return () => { active = false }
  }, [session, ratesRetry, ratesRequestKey, handleAuthError])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 4000)
    return () => window.clearTimeout(timer)
  }, [toast])

  async function authenticate(mode: AuthMode, values: Record<string, string>) {
    setAuthMessage('')
    try {
      const next = mode === 'login'
        ? await bankApi.login(values.email, values.password)
        : await bankApi.register(values.firstName, values.lastName, values.email, values.password)
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
      setSession(next)
      setToast(mode === 'register' ? 'Cuenta creada. Ya tienes una cuenta de ahorros lista.' : 'Sesión iniciada.')
    } catch (error) {
      if (mode === 'login' && isAuthError(error)) setAuthMessage('El correo o la contraseña no coinciden.')
      else setAuthMessage(error instanceof Error ? error.message : 'No pudimos iniciar sesión.')
    }
  }

  function refreshDashboard() {
    setDashboardError('')
    setRefreshKey((value) => value + 1)
  }

  // Ejecuta una operación, muestra el aviso y recarga saldos e historial.
  // Si falla, el error sube al diálogo para que lo muestre junto al formulario.
  async function runOperation(operation: (token: string) => Promise<unknown>, successMessage: string) {
    if (!session) return
    try {
      await operation(session.token)
    } catch (error) {
      handleAuthError(error)
      throw error
    }
    setToast(successMessage)
    refreshDashboard()
  }

  const transfer = (values: TransferValues) =>
    runOperation((token) => bankApi.transfer(values, token), 'Transferencia realizada.')
  const deposit = (values: OperationValues) =>
    runOperation((token) => bankApi.deposit(values, token), 'Depósito realizado.')
  const withdraw = (values: OperationValues) =>
    runOperation((token) => bankApi.withdraw(values, token), 'Retiro realizado.')

  if (!session) {
    return (
      <Routes>
        <Route
          path="/login"
          element={<AuthScreen onAuthenticate={authenticate} message={authMessage} onDismissMessage={() => setAuthMessage('')} />}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route
        path="*"
        element={(
          <Dashboard
            session={session}
            accounts={accounts}
            transactions={transactions}
            loading={loading}
            dashboardError={dashboardError}
            refreshKey={refreshKey}
            market={{ symbol, quote, profile, loading: marketLoading, error: marketError }}
            exchange={{ rates, loading: ratesLoading, error: ratesError }}
            toast={toast}
            onRefresh={refreshDashboard}
            onLogout={() => endSession()}
            onAuthError={handleAuthError}
            onSearchSymbol={setSymbol}
            onRetryMarket={() => setMarketRetry((value) => value + 1)}
            onRetryRates={() => setRatesRetry((value) => value + 1)}
            onTransfer={transfer}
            onDeposit={deposit}
            onWithdraw={withdraw}
            onDismissToast={() => setToast('')}
          />
        )}
      />
    </Routes>
  )
}

export default App
