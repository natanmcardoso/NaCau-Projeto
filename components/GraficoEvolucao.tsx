'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatMoeda } from '@/lib/formatters'

interface DadoEvolucao {
  mes: string
  totalEntradas: number
  totalSaidas: number
  saldo: number
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-xl px-3 py-2 text-xs space-y-1">
      <p className="text-muted mb-1">{label}</p>
      {payload.map((item) => (
        <p key={item.name} style={{ color: item.color }}>
          {item.name}: {formatMoeda(item.value)}
        </p>
      ))}
    </div>
  )
}

export default function GraficoEvolucao({ dados }: { dados: DadoEvolucao[] }) {
  if (!dados.length) {
    return (
      <div className="flex items-center justify-center h-52 text-muted text-sm">
        Sem dados de evolução
      </div>
    )
  }

  const maxVal = Math.max(
    ...dados.flatMap((d) => [d.totalEntradas, d.totalSaidas, Math.abs(d.saldo)])
  )

  function tickY(v: number) {
    if (maxVal >= 10000) return `${(v / 1000).toFixed(0)}k`
    return `${v}`
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={dados} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a33" />
        <XAxis
          dataKey="mes"
          tick={{ fill: '#6b6b7a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={tickY}
          tick={{ fill: '#6b6b7a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: '#6b6b7a', fontSize: 11 }}>{value}</span>
          )}
        />
        <Line
          type="monotone"
          dataKey="totalEntradas"
          name="Entradas"
          stroke="#c8f564"
          strokeWidth={2}
          dot={{ r: 3, fill: '#c8f564' }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="totalSaidas"
          name="Saídas"
          stroke="#f56464"
          strokeWidth={2}
          dot={{ r: 3, fill: '#f56464' }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="saldo"
          name="Saldo"
          stroke="#6478f5"
          strokeWidth={2}
          dot={{ r: 3, fill: '#6478f5' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
