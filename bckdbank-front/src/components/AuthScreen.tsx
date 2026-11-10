import { useState, type FormEvent } from 'react'
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck, Smartphone, X, Zap } from 'lucide-react'
import type { AuthMode } from '../types/auth'
import BrandMark from './BrandMark'

interface AuthScreenProps {
  message: string
  onAuthenticate: (mode: AuthMode, values: Record<string, string>) => Promise<void>
  onDismissMessage: () => void
}

const copy: Record<AuthMode, { title: string; subtitle: string; submit: string }> = {
  login: { title: 'Qué bueno verte.', subtitle: 'Ingresa a tu espacio financiero.', submit: 'Entrar a mi cuenta' },
  register: { title: 'Empecemos.', subtitle: 'Crea tu acceso y abre tu primera cuenta.', submit: 'Crear mi cuenta' },
}

const features = [
  { icon: ShieldCheck, title: 'Seguro', text: 'Tu sesión viaja con un token cifrado.' },
  { icon: Zap, title: 'Simple', text: 'Cuentas, movimientos y transferencias en un solo lugar.' },
  { icon: Smartphone, title: 'Siempre contigo', text: 'Funciona igual en tu computador y en tu celular.' },
]

export default function AuthScreen({ message, onAuthenticate, onDismissMessage }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const text = copy[mode]

  function switchMode(next: AuthMode) {
    setMode(next)
    onDismissMessage()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>
    setSubmitting(true)
    await onAuthenticate(mode, values)
    setSubmitting(false)
  }

  return (
    <div className="auth-page">
      <section className="auth-brand" aria-label="Bckd Bank">
        <BrandMark tone="light" tagline />
        <div className="auth-pitch">
          <h1>Tu banca, protegida.</h1>
          <p>Tus datos viajan protegidos y cifrados.</p>
        </div>
        <ul className="auth-features">
          {features.map(({ icon: Icon, title, text: detail }) => (
            <li key={title}>
              <span className="auth-feature-icon"><Icon size={20} /></span>
              <span><strong>{title}</strong>{detail}</span>
            </li>
          ))}
        </ul>
        <div className="auth-art" aria-hidden="true">
          <div className="bank-card bank-card-art">
            <span className="bank-card-chip" />
            <span className="bank-card-word">bckd</span>
          </div>
          <div className="auth-shield"><Lock size={34} strokeWidth={2.2} /></div>
        </div>
        <footer className="auth-brand-footer">
          <strong>Finanzas más humanas</strong>
          <span>Un espacio claro para cuidar, mover y entender tu dinero.</span>
        </footer>
      </section>

      <main className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-tabs" role="tablist" aria-label="Acceso a la cuenta">
            <button role="tab" aria-selected={mode === 'login'} onClick={() => switchMode('login')}>Iniciar sesión</button>
            <button role="tab" aria-selected={mode === 'register'} onClick={() => switchMode('register')}>Crear cuenta</button>
          </div>

          <header className="auth-heading">
            <h2>{text.title}</h2>
            <p>{text.subtitle}</p>
          </header>

          <form className="form" onSubmit={submit} key={mode}>
            {mode === 'register' && (
              <div className="field-row">
                <label className="field">
                  <span>Nombre</span>
                  <input name="firstName" required autoComplete="given-name" placeholder="Tu nombre" />
                </label>
                <label className="field">
                  <span>Apellido</span>
                  <input name="lastName" required autoComplete="family-name" placeholder="Tu apellido" />
                </label>
              </div>
            )}
            <label className="field">
              <span>Correo electrónico</span>
              <span className="input-icon">
                <Mail size={18} />
                <input name="email" type="email" required autoComplete="email" placeholder="nombre@correo.com" />
              </span>
            </label>
            <label className="field">
              <span>Contraseña</span>
              <span className="input-icon">
                <Lock size={18} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={mode === 'register' ? 6 : undefined}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            {mode === 'register' && (
              <p className="form-note">Al crear tu acceso te abrimos una cuenta de ahorros con USD 1.000 de saldo de prueba.</p>
            )}

            <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
              {submitting ? <LoaderCircle className="spin" size={18} /> : null}
              {text.submit}
              {!submitting && <ArrowRight size={18} />}
            </button>

            {message && (
              <div className="alert alert-error" role="alert">
                <CircleAlert size={18} />
                <span>{message}</span>
                <button type="button" className="icon-btn" onClick={onDismissMessage} aria-label="Cerrar aviso"><X size={16} /></button>
              </div>
            )}
          </form>
        </div>

        <footer className="auth-footer">
          <span>© 2026 Bckd Bank</span>
          <span><Lock size={14} /> Conexión segura</span>
        </footer>
      </main>
    </div>
  )
}
