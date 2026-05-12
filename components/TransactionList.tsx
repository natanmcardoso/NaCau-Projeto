'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Transacao, Usuario } from '@/lib/supabase'
import { CATEGORIAS } from '@/lib/supabase'
import { formatMoeda, formatData, corTipo, TIPO_LABEL } from '@/lib/formatters'
import TransactionForm from './TransactionForm'

interface TransactionListProps {
  onSaldoUpdate?: () => void
}

function inicioMesISO() {
  const now = new Date()
  const mes = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${mes}-01`
}

function hojeISO() {
  return new Date().toISOString().split('T')[0]
}

export default function TransactionList({ onSaldoUpdate }: TransactionListProps) {
  const [transacoes, setTransacoes] = useState<Transacao[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [carregando, setCarregando] = useState(true)

  // Filtros
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [dataInicio, setDataInicio] = useState(inicioMesISO())
  const [dataFim, setDataFim] = useState(hojeISO())

  // Modal de edição
  const [editando, setEditando] = useState<Transacao | null>(null)

  // Confirmação de exclusão
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  const fetchTransacoes = useCallback(async () => {
    setCarregando(true)
    const params = new URLSearchParams()
    if (filtroUsuario) params.set('usuario_id', filtroUsuario)
    if (filtroTipo) params.set('tipo', filtroTipo)
    if (filtroCategoria) params.set('categoria', filtroCategoria)
    if (dataInicio) params.set('data_inicio', dataInicio)
    if (dataFim) params.set('data_fim', dataFim)

    const res = await fetch(`/api/transacoes?${params.toString()}`)
    if (res.ok) {
      const data = await res.json()
      setTransacoes(data)
    }
    setCarregando(false)
  }, [filtroUsuario, filtroTipo, filtroCategoria, dataInicio, dataFim])

  useEffect(() => {
    fetch('/api/usuarios')
      .then((r) => r.json())
      .then(setUsuarios)
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchTransacoes()
  }, [fetchTransacoes])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/transacoes/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setTransacoes((prev) => prev.filter((t) => t.id !== id))
      setConfirmandoId(null)
      onSaldoUpdate?.()
    }
  }

  function handleEditSuccess(atualizada: Transacao) {
    setTransacoes((prev) =>
      prev.map((t) => (t.id === atualizada.id ? atualizada : t))
    )
    onSaldoUpdate?.()
  }

  const TIPOS_FILTRO = [
    { value: '', label: 'Todos os tipos' },
    { value: 'gasto', label: 'Gasto' },
    { value: 'ganho', label: 'Ganho' },
    { value: 'gasto_va', label: 'Gasto VA' },
    { value: 'salario', label: 'Salário' },
    { value: 'gasto_fixo', label: 'Gasto Fixo' },
  ]

  return (
    <>
      {/* Filtros */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime/50"
          >
            <option value="">Todos os usuários</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime/50"
          >
            {TIPOS_FILTRO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime/50"
          >
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime/50"
          />

          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime/50"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        {carregando ? (
          <div className="p-8 text-center text-muted text-sm">Carregando...</div>
        ) : transacoes.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">
            Nenhuma transação encontrada.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transacoes.map((t) => {
              const isConfirmando = confirmandoId === t.id
              const usuario = (t.usuarios as Usuario | undefined)?.nome

              return (
                <div
                  key={t.id}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Data */}
                  <span className="text-xs text-muted w-20 shrink-0">
                    {formatData(t.data)}
                  </span>

                  {/* Descrição + meta */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{t.descricao}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {usuario && <span>{usuario} · </span>}
                      <span
                        className={`${corTipo(t.tipo)} font-medium`}
                      >
                        {TIPO_LABEL[t.tipo] ?? t.tipo}
                      </span>
                      {t.categoria && (
                        <span> · {t.categoria}</span>
                      )}
                    </p>
                  </div>

                  {/* Valor */}
                  <span
                    className={`font-display text-base font-light shrink-0 ${corTipo(t.tipo)}`}
                  >
                    {t.tipo === 'ganho' || t.tipo === 'salario' ? '+' : '−'}
                    {formatMoeda(t.valor)}
                  </span>

                  {/* Ações */}
                  {isConfirmando ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted">Excluir?</span>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-xs text-danger hover:underline"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmandoId(null)}
                        className="text-xs text-muted hover:text-white"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setEditando(t)}
                        className="text-muted hover:text-white transition-colors"
                        title="Editar"
                      >
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setConfirmandoId(t.id)}
                        className="text-muted hover:text-danger transition-colors"
                        title="Excluir"
                      >
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {!carregando && transacoes.length > 0 && (
          <div className="px-5 py-3 border-t border-border">
            <p className="text-xs text-muted">
              {transacoes.length} transaç{transacoes.length === 1 ? 'ão' : 'ões'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {editando && (
        <TransactionForm
          transacao={editando}
          onSuccess={handleEditSuccess}
          onClose={() => setEditando(null)}
        />
      )}
    </>
  )
}
