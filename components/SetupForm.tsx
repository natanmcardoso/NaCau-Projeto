'use client'

import { useState, useEffect, useCallback } from 'react'
import { CATEGORIAS } from '@/lib/supabase'
import type { GastoFixo, Usuario } from '@/lib/supabase'
import { formatMoeda } from '@/lib/formatters'

type ConfigData = {
  salario1: string
  salario2: string
  va1: string
  va2: string
  dia_vencimento_padrao: string
}

type NovoGastoFixo = {
  descricao: string
  valor: string
  categoria: string
  dia_vencimento: string
}

const GASTO_FIXO_VAZIO: NovoGastoFixo = {
  descricao: '',
  valor: '',
  categoria: 'Moradia',
  dia_vencimento: '10',
}

export default function SetupForm() {
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  // Usuários
  const [u1Nome, setU1Nome] = useState('')
  const [u1Tel, setU1Tel] = useState('')
  const [u2Nome, setU2Nome] = useState('')
  const [u2Tel, setU2Tel] = useState('')

  // Config financeira
  const [config, setConfig] = useState<ConfigData>({
    salario1: '',
    salario2: '',
    va1: '2100',
    va2: '2100',
    dia_vencimento_padrao: '10',
  })

  // Gastos fixos
  const [gastosFixos, setGastosFixos] = useState<GastoFixo[]>([])
  const [novoGasto, setNovoGasto] = useState<NovoGastoFixo>(GASTO_FIXO_VAZIO)
  const [adicionandoGasto, setAdicionandoGasto] = useState(false)

  // Senha
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmaSenha, setConfirmaSenha] = useState('')
  const [erroSenha, setErroSenha] = useState('')

  const mostrarMensagem = (tipo: 'ok' | 'erro', texto: string) => {
    setMensagem({ tipo, texto })
    setTimeout(() => setMensagem(null), 4000)
  }

  const carregarDados = useCallback(async () => {
    setCarregando(true)
    try {
      const [resUsuarios, resConfig, resGastos] = await Promise.all([
        fetch('/api/usuarios'),
        fetch('/api/config'),
        fetch('/api/gastos-fixos'),
      ])

      const usuarios: Usuario[] = await resUsuarios.json()
      const configData: Record<string, string> = await resConfig.json()
      const gastos: GastoFixo[] = await resGastos.json()

      const u1 = usuarios.find((u) => u.tipo === 'usuario1')
      const u2 = usuarios.find((u) => u.tipo === 'usuario2')
      setU1Nome(u1?.nome ?? '')
      setU1Tel(u1?.telefone ?? '')
      setU2Nome(u2?.nome ?? '')
      setU2Tel(u2?.telefone ?? '')

      setConfig({
        salario1: configData.salario1 ?? '0',
        salario2: configData.salario2 ?? '0',
        va1: configData.va1 ?? '2100',
        va2: configData.va2 ?? '2100',
        dia_vencimento_padrao: configData.dia_vencimento_padrao ?? '10',
      })

      setGastosFixos(gastos)
    } catch {
      mostrarMensagem('erro', 'Erro ao carregar dados.')
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  async function salvarUsuarios() {
    setSalvando(true)
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario1: { nome: u1Nome, telefone: u1Tel },
          usuario2: { nome: u2Nome, telefone: u2Tel },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro)
      mostrarMensagem('ok', 'Usuários salvos com sucesso.')
    } catch (e: unknown) {
      mostrarMensagem('erro', e instanceof Error ? e.message : 'Erro ao salvar usuários.')
    } finally {
      setSalvando(false)
    }
  }

  async function salvarConfig() {
    setSalvando(true)
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro)
      mostrarMensagem('ok', 'Configurações financeiras salvas.')
    } catch (e: unknown) {
      mostrarMensagem('erro', e instanceof Error ? e.message : 'Erro ao salvar configurações.')
    } finally {
      setSalvando(false)
    }
  }

  async function adicionarGastoFixo() {
    if (!novoGasto.descricao || !novoGasto.valor) return
    setAdicionandoGasto(true)
    try {
      const res = await fetch('/api/gastos-fixos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descricao: novoGasto.descricao,
          valor: parseFloat(novoGasto.valor.replace(',', '.')),
          categoria: novoGasto.categoria,
          dia_vencimento: parseInt(novoGasto.dia_vencimento),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.erro)
      setGastosFixos((prev) => [...prev, data])
      setNovoGasto(GASTO_FIXO_VAZIO)
      mostrarMensagem('ok', 'Gasto fixo adicionado.')
    } catch (e: unknown) {
      mostrarMensagem('erro', e instanceof Error ? e.message : 'Erro ao adicionar gasto fixo.')
    } finally {
      setAdicionandoGasto(false)
    }
  }

  async function removerGastoFixo(id: string) {
    try {
      const res = await fetch(`/api/gastos-fixos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setGastosFixos((prev) => prev.filter((g) => g.id !== id))
      mostrarMensagem('ok', 'Gasto fixo removido.')
    } catch {
      mostrarMensagem('erro', 'Erro ao remover gasto fixo.')
    }
  }

  async function alterarSenha() {
    setErroSenha('')
    if (!senhaAtual || !novaSenha || !confirmaSenha) {
      setErroSenha('Preencha todos os campos.')
      return
    }
    if (novaSenha !== confirmaSenha) {
      setErroSenha('A nova senha e a confirmação não coincidem.')
      return
    }
    if (novaSenha.length < 4) {
      setErroSenha('A senha deve ter ao menos 4 caracteres.')
      return
    }

    setSalvando(true)
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: novaSenha }),
      })
      // Verificar senha atual antes
      const verif = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: senhaAtual }),
      })
      if (!verif.ok) {
        setErroSenha('Senha atual incorreta.')
        setSalvando(false)
        return
      }
      if (!res.ok) throw new Error()
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmaSenha('')
      mostrarMensagem('ok', 'Senha alterada com sucesso.')
    } catch {
      mostrarMensagem('erro', 'Erro ao alterar senha.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-lime border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalGastosFixos = gastosFixos.reduce((s, g) => s + Number(g.valor), 0)

  return (
    <div className="space-y-8">
      {/* Toast de mensagem */}
      {mensagem && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            mensagem.tipo === 'ok'
              ? 'bg-lime text-background'
              : 'bg-danger text-white'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {/* ===== Usuários ===== */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-base font-medium text-white mb-5">Usuários do casal</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'Usuário 1', nome: u1Nome, setNome: setU1Nome, tel: u1Tel, setTel: setU1Tel },
            { label: 'Usuário 2', nome: u2Nome, setNome: setU2Nome, tel: u2Tel, setTel: setU2Tel },
          ].map((u) => (
            <div key={u.label} className="space-y-3">
              <p className="text-sm text-lime font-medium">{u.label}</p>
              <div>
                <label className="block text-xs text-muted mb-1">Nome</label>
                <input
                  type="text"
                  value={u.nome}
                  onChange={(e) => u.setNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1">WhatsApp</label>
                <input
                  type="tel"
                  value={u.tel}
                  onChange={(e) => u.setTel(e.target.value)}
                  placeholder="55 11 99999-9999"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={salvarUsuarios}
          disabled={salvando}
          className="mt-5 bg-lime text-background text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
        >
          Salvar usuários
        </button>
      </section>

      {/* ===== Configuração financeira ===== */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-base font-medium text-white mb-5">Renda e configurações</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Salário 1', key: 'salario1' },
            { label: 'Salário 2', key: 'salario2' },
            { label: 'VA 1 (mensal)', key: 'va1' },
            { label: 'VA 2 (mensal)', key: 'va2' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs text-muted mb-1">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={config[key as keyof ConfigData]}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-lime transition-colors"
                />
              </div>
            </div>
          ))}
          <div>
            <label className="block text-xs text-muted mb-1">Dia de vencimento padrão</label>
            <input
              type="number"
              min="1"
              max="28"
              value={config.dia_vencimento_padrao}
              onChange={(e) => setConfig((prev) => ({ ...prev, dia_vencimento_padrao: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime transition-colors"
            />
          </div>
        </div>
        <button
          onClick={salvarConfig}
          disabled={salvando}
          className="mt-5 bg-lime text-background text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
        >
          Salvar configurações
        </button>
      </section>

      {/* ===== Gastos fixos ===== */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-medium text-white">Gastos fixos mensais</h2>
            {gastosFixos.length > 0 && (
              <p className="text-xs text-muted mt-0.5">
                Total: <span className="text-danger font-medium">{formatMoeda(totalGastosFixos)}</span>/mês
              </p>
            )}
          </div>
        </div>

        {/* Lista */}
        {gastosFixos.length === 0 ? (
          <p className="text-muted text-sm mb-4">Nenhum gasto fixo cadastrado.</p>
        ) : (
          <ul className="space-y-2 mb-5">
            {gastosFixos.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between bg-background border border-border rounded-xl px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{g.descricao}</p>
                  <p className="text-xs text-muted">
                    {g.categoria} · dia {g.dia_vencimento}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <span className="font-display text-danger text-sm">{formatMoeda(Number(g.valor))}</span>
                  <button
                    onClick={() => removerGastoFixo(g.id)}
                    className="text-muted hover:text-danger transition-colors"
                    title="Remover"
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Formulário de novo gasto */}
        <div className="border border-dashed border-border rounded-xl p-4 space-y-3">
          <p className="text-xs text-muted font-medium uppercase tracking-wider">Adicionar gasto fixo</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Descrição (ex: Aluguel)"
                value={novoGasto.descricao}
                onChange={(e) => setNovoGasto((p) => ({ ...p, descricao: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime transition-colors"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">R$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={novoGasto.valor}
                onChange={(e) => setNovoGasto((p) => ({ ...p, valor: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime transition-colors"
              />
            </div>
            <select
              value={novoGasto.categoria}
              onChange={(e) => setNovoGasto((p) => ({ ...p, categoria: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-lime transition-colors"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted">Dia:</label>
              <input
                type="number"
                min="1"
                max="28"
                value={novoGasto.dia_vencimento}
                onChange={(e) => setNovoGasto((p) => ({ ...p, dia_vencimento: e.target.value }))}
                className="w-16 bg-background border border-border rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-lime transition-colors"
              />
            </div>
            <button
              onClick={adicionarGastoFixo}
              disabled={adicionandoGasto || !novoGasto.descricao || !novoGasto.valor}
              className="bg-lime text-background text-sm font-medium px-4 py-2 rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
            >
              {adicionandoGasto ? 'Adicionando…' : '+ Adicionar'}
            </button>
          </div>
        </div>
      </section>

      {/* ===== Alterar senha ===== */}
      <section className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-base font-medium text-white mb-5">Alterar senha</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
          {[
            { label: 'Senha atual', value: senhaAtual, setter: setSenhaAtual },
            { label: 'Nova senha', value: novaSenha, setter: setNovaSenha },
            { label: 'Confirmar nova senha', value: confirmaSenha, setter: setConfirmaSenha },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-xs text-muted mb-1">{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-muted focus:outline-none focus:border-lime transition-colors"
              />
            </div>
          ))}
        </div>
        {erroSenha && <p className="text-danger text-sm mt-3">{erroSenha}</p>}
        <button
          onClick={alterarSenha}
          disabled={salvando}
          className="mt-4 bg-lime text-background text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-lime/90 disabled:opacity-40 transition-all"
        >
          Alterar senha
        </button>
      </section>
    </div>
  )
}
