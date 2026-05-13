'use client'

import { useState, useEffect } from 'react'
import type { Usuario } from '@/lib/supabase'
import { hojeISO } from '@/lib/formatters'

interface ParcelamentoFormProps {
  onSuccess: () => void
  onClose: () => void
}

export default function ParcelamentoForm({ onSuccess, onClose }: ParcelamentoFormProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [usuarioId, setUsuarioId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [totalParcelas, setTotalParcelas] = useState('12')
  const [dataInicio, setDataInicio] = useState(hojeISO())
  const [diaVencimento, setDiaVencimento] = useState('10')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then(setUsuarios)
      .catch(() => {})
  }, [])

  // Preview calculado
  const valorNum = parseFloat(valorTotal.replace(',', '.'))
  const parcelasNum = parseInt(totalParcelas)
  const valorParcela =
    !isNaN(valorNum) && !isNaN(parcelasNum) && parcelasNum > 0
      ? (valorNum / parcelasNum).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    const vNum = parseFloat(valorTotal.replace(',', '.'))
    const pNum = parseInt(totalParcelas)

    if (!descricao.trim()) return setErro('Informe a descrição.')
    if (isNaN(vNum) || vNum <= 0) return setErro('Valor total inválido.')
    if (isNaN(pNum) || pNum < 1) return setErro('Número de parcelas inválido.')
    if (!dataInicio) return setErro('Informe a data de início.')

    setCarregando(true)

    const res = await fetch('/api/parcelamentos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuarioId || null,
        descricao: descricao.trim(),
        valor_total: vNum,
        total_parcelas: pNum,
        data_inicio: dataInicio,
        dia_vencimento: parseInt(diaVencimento) || 10,
      }),
    })

    setCarregando(false)

    if (!res.ok) {
      const json = await res.json()
      return setErro(json.erro ?? 'Erro ao salvar.')
    }

    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-light text-white">Novo parcelamento</h2>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuário */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Usuário</label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
            >
              <option value="">Sem usuário</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>{u.nome}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: iPhone 15, Notebook..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Valor total */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Valor total (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              value={valorTotal}
              onChange={(e) => setValorTotal(e.target.value)}
              placeholder="0,00"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Parcelas + preview */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Nº de parcelas</label>
              <input
                type="number"
                min="1"
                max="120"
                value={totalParcelas}
                onChange={(e) => setTotalParcelas(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Dia vencimento</label>
              <input
                type="number"
                min="1"
                max="28"
                value={diaVencimento}
                onChange={(e) => setDiaVencimento(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
              />
            </div>
          </div>

          {/* Preview valor parcela */}
          {valorParcela && (
            <p className="text-xs text-muted">
              Valor por parcela: <span className="text-blue font-medium">{valorParcela}</span>
            </p>
          )}

          {/* Data início */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Data da 1ª parcela</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
            />
          </div>

          {erro && <p className="text-danger text-sm">{erro}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-muted border border-border hover:text-white hover:border-white/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-lime text-background hover:bg-lime/90 transition-colors disabled:opacity-50"
            >
              {carregando ? 'Salvando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
