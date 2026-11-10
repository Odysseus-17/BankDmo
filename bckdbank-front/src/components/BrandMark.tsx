interface BrandMarkProps {
  tone?: 'light' | 'dark'
  tagline?: boolean
}

export default function BrandMark({ tone = 'dark', tagline = false }: BrandMarkProps) {
  return (
    <span className={`brand brand-${tone}`} aria-label="Bckd Bank">
      <span className="brand-word" aria-hidden="true"><b>bckd</b> bank</span>
      {tagline && <span className="brand-tagline">Tu espacio financiero</span>}
    </span>
  )
}
