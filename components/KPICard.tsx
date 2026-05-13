import { ReactNode } from 'react'

type Variant = 'default' | 'positive' | 'negative' | 'info'

interface KPICardProps {
  label: string
  value: string
  sublabel?: ReactNode
  variant?: Variant
}

const variantColor: Record<Variant, string> = {
  default: 'text-white',
  positive: 'text-lime',
  negative: 'text-danger',
  info: 'text-blue',
}

export default function KPICard({
  label,
  value,
  sublabel,
  variant = 'default',
}: KPICardProps) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <p className="text-xs text-muted mb-3 uppercase tracking-wide">{label}</p>
      <p className={`font-display text-2xl font-light ${variantColor[variant]}`}>
        {value}
      </p>
      {sublabel && <p className="text-xs text-muted mt-2">{sublabel}</p>}
    </div>
  )
}
