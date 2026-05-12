'use client'

import { useState, useEffect } from 'react'
import { CATEGORIAS } from '@/lib/supabase'
import type { Transacao, Usuario } from '@/lib/supabase'
import { hojeISO } from '@/lib/formatters'

interface TransactionFormProps {
  transacao?: Transacao
  onSuccess: (transacao: Transacao) => void
  onClose: () => void
}

const TIPOS = [
  { value: 'gasto', label: 'Gasto' },
  { value: 'ganho', label: 'Ganho' },
  { value: 'gasto_va', label: 'Gasto VA' },
]

export default function TransactionForm({
  transacao,
  onSuccess,
  onClose,
}: TransactionFormProps) {
  const isEdit = !!transacao

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [tipo, setTipo] = useState(transacao?.tipo ?? 'gasto')
  const [usuarioId, setUsuarioId] = useState(transacao?.usuario_id ?? '')
  const [descricao, setDescricao] = useState(transacao?.descricao ?? '')
  const [valor, setValor] = useState(
    transacao?.valor ? String(transacao.valor) : ''
  )
  const [categoria, setCategoria] = useState(transacao?.categoria ?? '')
  const [data, setData] = useState(transacao?.data ?? hojeISO())
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then(setUsuarios)
      .catch(() => {})
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    const valorNum = parseFloat(valor.replace(',', '.'))
    if (!descricao.trim()) return setErro('Informe a descrição.')
    if (isNaN(valorNum) || valorNum <= 0) return setErro('Valor inválido.')

    setCarregando(true)

    const body = {
      usuario_id: usuarioId || null,
      tipo,
      descricao: descricao.trim(),
      valor: valorNum,
      categoria: categoria || null,
      data,
    }

    const url = isEdit ? `/api/transacoes/${transacao!.id}` : '/api/transacoes'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setCarregando(false)

    if (!res.ok) {
      const json = await res.json()
      return setErro(json.error ?? 'Erro ao salvar.')
    }

    const salva = await res.json()
    onSuccess(salva)
    onClose()
  }

  const mostrarCategoria = tipo === 'gasto' || tipo === 'gasto_va'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-light text-white">
            {isEdit ? 'Editar transação' : 'Nova transação'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-white transition-colors"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">
              Tipo
            </label>
            <div className="flex gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTipo(t.value as typeof tipo)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                    tipo === t.value
                      ? t.value === 'ganho'
                        ? 'bg-lime/15 text-lime border border-lime/30'
                        : t.value === 'gasto_va'
                        ? 'bg-blue/15 text-blue border border-blue/30'
                        : 'bg-danger/15 text-danger border border-danger/30'
                      : 'bg-background text-muted border border-border hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Usuário */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">
              Usuário
            </label>
            <select
              value={usuarioId}
              onChange={(e) => setUsuarioId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
            >
              <option value="">Sem usuário</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">
              Descrição
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Supermercado, Uber..."
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Valor */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">
              Valor (R$)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
            />
          </div>

          {/* Categoria */}
          {mostrarCategoria && (
            <div>
              <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
              >
                <option value="">Sem categoria</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Data */}
          <div>
            <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
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
              {carregando ? 'Salvando...' : isEdit ? 'Salvar' : 'Lançar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
