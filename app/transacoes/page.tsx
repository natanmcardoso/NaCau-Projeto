'use client'

import { useState, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import TransactionForm from '@/components/TransactionForm'
import TransactionList from '@/components/TransactionList'
import type { Transacao } from '@/lib/supabase'

export default function TransacoesPage() {
  const [modalAberto, setModalAberto] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNovaTransacao = useCallback((transacao: Transacao) => {
    console.log('Nova transação criada:', transacao.id)
    setRefreshKey((k) => k + 1)
  }, [])

  const handleSaldoUpdate = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-light text-white">
                Transações
              </h1>
              <p className="text-muted text-sm mt-1">
                Lançamentos e histórico financeiro.
              </p>
            </div>

            <button
              onClick={() => setModalAberto(true)}
              className="flex items-center gap-2 bg-lime text-background text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-lime/90 transition-colors"
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nova transação
            </button>
          </div>

          <TransactionList
            key={refreshKey}
            onSaldoUpdate={handleSaldoUpdate}
          />
        </div>
      </main>

      {modalAberto && (
        <TransactionForm
          onSuccess={handleNovaTransacao}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  )
}
