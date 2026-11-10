import type { ReactNode } from 'react'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export default function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </header>
  )
}
