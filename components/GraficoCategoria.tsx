'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatMoeda } from '@/lib/formatters'

const CORES = [
  '#c8f564',
  '#6478f5',
  '#f56464',
  '#f5a623',
  '#50e3c2',
  '#ff69b4',
  '#87ceeb',
  '#dda0dd',
  '#ffd700',
  '#98fb98',
]

interface DadoCategoria {
  categoria: string
  total: number
  percentual: number
}

interface TooltipPayload {
  name: string
  value: number
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayload[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 text-xs">
      <p className="text-white font-medium mb-0.5">{item.name}</p>
      <p className="text-lime font-display">{formatMoeda(item.value)}</p>
    </div>
  )
}

export default function GraficoCategoria({ dados }: { dados: DadoCategoria[] }) {
  if (!dados.length) {
    return (
      <div className="flex items-center justify-center h-52 text-muted text-sm">
        Sem gastos no período
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={dados}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="total"
          nameKey="categoria"
        >
          {dados.map((_, i) => (
            <Cell key={i} fill={CORES[i % CORES.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: '#6b6b7a', fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
