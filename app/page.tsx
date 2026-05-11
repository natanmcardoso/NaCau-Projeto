import Sidebar from '@/components/Sidebar'

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-light text-white">Visão Geral</h1>
            <p className="text-muted text-sm mt-1">Resumo financeiro do mês atual.</p>
          </div>

          {/* Placeholder — KPIs serão implementados na Fase 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Renda Total', 'Saldo Disponível', 'Saldo VA', 'Gastos Fixos'].map((label) => (
              <div key={label} className="bg-surface border border-border rounded-2xl p-5">
                <p className="text-xs text-muted mb-3">{label}</p>
                <p className="font-display text-2xl text-white font-light">—</p>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-surface border border-border rounded-2xl p-6 text-center">
            <p className="text-muted text-sm">
              Fase 2 em desenvolvimento · Configure os dados em{' '}
              <a href="/configuracoes" className="text-lime hover:underline">Configurações</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
