'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import type { GastoFixo } from '@/lib/supabase'
import { CATEGORIAS } from '@/lib/supabase'
import { formatMoeda } from '@/lib/formatters'

const FORM_VAZIO = {
  descricao: '',
  valor: '',
  categoria: '',
  dia_vencimento: '10',
}

export default function GastosFixosPage() {
  const [fixos, setFixos] = useState<GastoFixo[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostraForm, setMostraForm] = useState(false)
  const [editando, setEditando] = useState<GastoFixo | null>(null)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [lancandoMes, setLancandoMes] = useState(false)

  const carregarFixos = useCallback(async () => {
    setCarregando(true)
    const res = await fetch('/api/gastos-fixos')
    const data = await res.json()
    setFixos(Array.isArray(data) ? data : [])
    setCarregando(false)
  }, [])

  useEffect(() => {
    carregarFixos()
  }, [carregarFixos])

  function abrirNovo() {
    setEditando(null)
    setForm(FORM_VAZIO)
    setErro('')
    setMostraForm(true)
  }

  function abrirEditar(fixo: GastoFixo) {
    setEditando(fixo)
    setForm({
      descricao: fixo.descricao,
      valor: String(fixo.valor),
      categoria: fixo.categoria,
      dia_vencimento: String(fixo.dia_vencimento),
    })
    setErro('')
    setMostraForm(true)
  }

  function fecharForm() {
    setMostraForm(false)
    setEditando(null)
    setForm(FORM_VAZIO)
    setErro('')
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    const valorNum = parseFloat(form.valor.replace(',', '.'))
    if (!form.descricao.trim()) return setErro('Informe a descrição.')
    if (isNaN(valorNum) || valorNum <= 0) return setErro('Valor inválido.')
    if (!form.categoria) return setErro('Selecione a categoria.')

    setSalvando(true)

    const body = {
      descricao: form.descricao.trim(),
      valor: valorNum,
      categoria: form.categoria,
      dia_vencimento: parseInt(form.dia_vencimento) || 10,
    }

    const url = editando ? `/api/gastos-fixos/${editando.id}` : '/api/gastos-fixos'
    const method = editando ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setSalvando(false)

    if (!res.ok) {
      const json = await res.json()
      return setErro(json.erro ?? 'Erro ao salvar.')
    }

    fecharForm()
    carregarFixos()
  }

  async function handleDesativar(id: string) {
    if (!confirm('Desativar este gasto fixo?')) return
    await fetch(`/api/gastos-fixos/${id}`, { method: 'DELETE' })
    carregarFixos()
  }

  async function handleLancarMes() {
    setLancandoMes(true)
    setMensagem('')
    const res = await fetch('/api/gastos-fixos/lancar-mes', { method: 'POST' })
    const json = await res.json()
    setLancandoMes(false)
    setMensagem(json.mensagem ?? 'Concluído.')
    setTimeout(() => setMensagem(''), 4000)
  }

  const totalMensal = fixos.reduce((acc, f) => acc + f.valor, 0)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-light text-white mb-1">Gastos Fixos</h1>
            <p className="text-muted text-sm">
              Total mensal comprometido:{' '}
              <span className="text-danger font-medium">{formatMoeda(totalMensal)}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLancarMes}
              disabled={lancandoMes || fixos.length === 0}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-blue/15 text-blue border border-blue/30 hover:bg-blue/25 transition-colors disabled:opacity-50"
            >
              {lancandoMes ? 'Lançando...' : 'Lançar fixos do mês'}
            </button>
            <button
              onClick={abrirNovo}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-lime text-background hover:bg-lime/90 transition-colors"
            >
              + Novo fixo
            </button>
          </div>
        </div>

        {/* Feedback de lançamento */}
        {mensagem && (
          <div className="mb-6 px-4 py-3 bg-lime/10 border border-lime/30 rounded-xl text-lime text-sm">
            {mensagem}
          </div>
        )}

        {/* Lista */}
        {carregando ? (
          <p className="text-muted text-sm">Carregando...</p>
        ) : fixos.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            Nenhum gasto fixo cadastrado.
          </div>
        ) : (
          <div className="space-y-2">
            {fixos.map((fixo) => (
              <div
                key={fixo.id}
                className="bg-surface border border-border rounded-2xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{fixo.descricao}</p>
                  <p className="text-muted text-xs mt-0.5">
                    {fixo.categoria} · vence dia {fixo.dia_vencimento}
                  </p>
                </div>
                <span className="font-display text-lg font-light text-danger shrink-0">
                  {formatMoeda(fixo.valor)}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => abrirEditar(fixo)}
                    className="text-xs px-3 py-1.5 rounded-lg text-muted border border-border hover:text-white hover:border-white/20 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDesativar(fixo.id)}
                    className="text-xs px-3 py-1.5 rounded-lg text-muted border border-border hover:text-danger hover:border-danger/30 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal formulário */}
      {mostraForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-light text-white">
                {editando ? 'Editar gasto fixo' : 'Novo gasto fixo'}
              </h2>
              <button onClick={fecharForm} className="text-muted hover:text-white transition-colors">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Descrição</label>
                <input
                  type="text"
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  placeholder="Ex: Aluguel, Internet..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Valor (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.valor}
                    onChange={(e) => setForm({ ...form, valor: e.target.value })}
                    placeholder="0,00"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-muted focus:outline-none focus:border-lime/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Dia vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={form.dia_vencimento}
                    onChange={(e) => setForm({ ...form, dia_vencimento: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted mb-1.5 uppercase tracking-wide">Categoria</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime/50"
                >
                  <option value="">Selecione</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {erro && <p className="text-danger text-sm">{erro}</p>}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={fecharForm}
                  className="flex-1 py-2.5 rounded-xl text-sm text-muted border border-border hover:text-white hover:border-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-lime text-background hover:bg-lime/90 transition-colors disabled:opacity-50"
                >
                  {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
