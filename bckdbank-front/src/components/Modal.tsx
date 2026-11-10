import { useEffect, useId, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
}

export default function Modal({ title, description, onClose, children }: ModalProps) {
  const titleId = useId()

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            <p>{description}</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={19} /></button>
        </header>
        {children}
      </section>
    </div>
  )
}
