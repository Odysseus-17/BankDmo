export type AccountType = 'SAVINGS' | 'CHECKING' | 'CREDIT'
export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'

export interface AuthResponse { token: string; email: string; role: string }
export interface Account { id: number; accountNumber: string; balance: number; accountType: AccountType }
export interface Transaction { id: number; sourceAccountNumber: string | null; destinationAccount: string | null; amount: number; transactionType: TransactionType; description: string; timestamp: string }
export interface Quote { c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; t: number }
export interface CompanyProfile { country?: string; currency?: string; exchange?: string; finnhubIndustry?: string; logo?: string; marketCapitalization?: number; name?: string; ticker?: string; weburl?: string }
export interface TransferValues { sourceAccountNumber: string; destinationAccountNumber: string; amount: number; description: string }
export interface OperationValues { accountNumber: string; amount: number; description: string }
export interface ExchangeRates { base: string; lastUpdate: string; source: string; rates: Record<string, number> }
export interface Conversion { from: string; to: string; amount: number; rate: number; result: number; lastUpdate: string }

export class ApiError extends Error {
    readonly status: number
    constructor(message: string, status: number) { super(message); this.name = 'ApiError'; this.status = status }
}

export function isAuthError(error: unknown) {
    return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

async function request<T>(url: string, options: RequestInit = {}, token?: string): Promise<T> {
    const headers = new Headers(options.headers)
    if (options.body) headers.set('Content-Type', 'application/json')
    if (token) headers.set('Authorization', `Bearer ${token}`)
    let response: Response
    try { response = await fetch(url, { ...options, headers }) } catch { throw new Error('No se pudo conectar con el servicio. Verifica que esté iniciado.') }
    const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) {
        // GlobalExceptionHandler responde { message } o, si falla @Valid, { details: { campo: mensaje } }
        const body = payload as { message?: string | string[]; error?: string; details?: Record<string, string> } | null
        const details = body?.details ? Object.values(body.details).join('. ') : ''
        const message = Array.isArray(body?.message) ? body.message.join('. ') : details || body?.message || body?.error || `La solicitud falló (${response.status}).`
        throw new ApiError(message, response.status)
    }
    return payload as T
}

export const bankApi = {
    login: (email: string, password: string) => request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (firstName: string, lastName: string, email: string, password: string) => request<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify({ firstName, lastName, email, password }) }),
    getAccounts: (token: string) => request<Account[]>('/api/v1/accounts', {}, token),
    getAccount: (accountNumber: string, token: string) => request<Account>(`/api/v1/accounts/${encodeURIComponent(accountNumber)}`, {}, token),
    getTransactions: (accountNumber: string, token: string) => request<Transaction[]>(`/api/v1/transactions/account/${encodeURIComponent(accountNumber)}`, {}, token),
    transfer: (values: TransferValues, token: string) => request<Transaction>('/api/v1/transactions/transfer', { method: 'POST', body: JSON.stringify(values) }, token),
    deposit: (values: OperationValues, token: string) => request<Transaction>('/api/v1/transactions/deposit', { method: 'POST', body: JSON.stringify(values) }, token),
    withdraw: (values: OperationValues, token: string) => request<Transaction>('/api/v1/transactions/withdraw', { method: 'POST', body: JSON.stringify(values) }, token),
}

// Tasas de cambio: el backend consulta ExchangeRate-API y nos devuelve el resultado
export const exchangeApi = {
    getRates: (base: string, token: string) => request<ExchangeRates>(`/api/v1/exchange-rates?base=${encodeURIComponent(base)}`, {}, token),
    convert: (from: string, to: string, amount: number, token: string) => request<Conversion>(`/api/v1/exchange-rates/convert?${new URLSearchParams({ from, to, amount: String(amount) })}`, {}, token),
}

export const marketApi = {
    getQuote: (symbol: string) => request<Quote>(`/finnhub/quote?symbol=${encodeURIComponent(symbol)}`),
    getProfile: (symbol: string) => request<CompanyProfile>(`/finnhub/profile?symbol=${encodeURIComponent(symbol)}`),
}
