import Sidebar from '@/components/Sidebar'
import SetupForm from '@/components/SetupForm'

export default function ConfiguracoesPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-60 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-light text-white">Configurações</h1>
            <p className="text-muted text-sm mt-1">Gerencie usuários, renda e gastos fixos do casal.</p>
          </div>
          <SetupForm />
        </div>
      </main>
    </div>
  )
}
