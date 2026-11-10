import { ArrowLeftRight, ChartLine, LayoutGrid, LogOut, Wallet } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { formatRole } from '../lib/formatters'
import BrandMark from './BrandMark'

interface DashboardSidebarProps {
  email: string
  role: string
  onLogout: () => void
}

const links = [
  { to: '/', label: 'Resumen', icon: LayoutGrid, end: true },
  { to: '/cuentas', label: 'Mis cuentas', icon: Wallet, end: false },
  { to: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight, end: false },
  { to: '/mercado', label: 'Mercado', icon: ChartLine, end: false },
]

function NavItems({ className }: { className: string }) {
  return links.map(({ to, label, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={className}>
      <Icon size={19} />
      <span>{label}</span>
    </NavLink>
  ))
}

export default function DashboardSidebar({ email, role, onLogout }: DashboardSidebarProps) {
  return (
    <>
      <aside className="sidebar">
        <BrandMark tone="light" />
        <nav className="sidebar-nav" aria-label="Navegación principal">
          <NavItems className="sidebar-link" />
        </nav>
        <div className="sidebar-user">
          <span className="avatar" aria-hidden="true">{email.slice(0, 2).toUpperCase()}</span>
          <span className="sidebar-user-text">
            <strong title={email}>{email}</strong>
            <small>{formatRole(role)}</small>
          </span>
        </div>
        <button className="sidebar-logout" onClick={onLogout}><LogOut size={18} />Cerrar sesión</button>
      </aside>

      <nav className="bottom-nav" aria-label="Navegación principal">
        <NavItems className="bottom-link" />
      </nav>
    </>
  )
}
