export default function PoliticaDePrivacidade() {
  return (
    <main className="min-h-screen bg-background text-white font-sans antialiased">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Logo */}
        <div className="mb-12 text-center">
          <span className="font-display text-3xl font-light text-white">
            Na<span className="text-lime">Cau</span>
          </span>
        </div>

        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-3xl font-light mb-3">Política de Privacidade</h1>
          <p className="text-muted text-sm">Última atualização: 13 de maio de 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-[#e8e8f0] leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Dados coletados</h2>
            <p>
              O NaCau coleta as mensagens enviadas ao WhatsApp e os dados inseridos diretamente
              no dashboard para fins de registro de transações financeiras pessoais. Nenhuma outra
              informação é capturada automaticamente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Armazenamento</h2>
            <p>
              Todos os dados são armazenados em banco de dados privado hospedado no Supabase,
              com acesso restrito por credenciais seguras. O ambiente de produção é isolado e
              não está exposto publicamente.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Compartilhamento</h2>
            <p>
              Os dados não são compartilhados com terceiros, parceiros comerciais, plataformas
              de publicidade ou qualquer outra entidade externa. O NaCau não vende, aluga ou
              distribui informações pessoais.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Acesso</h2>
            <p>
              As informações são utilizadas exclusivamente pelos dois usuários cadastrados do
              casal. Não há acesso administrativo por parte de desenvolvedores em condições
              normais de uso.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Exclusão de dados</h2>
            <p>
              O usuário pode solicitar a exclusão total dos seus dados a qualquer momento,
              entrando em contato pelo próprio WhatsApp vinculado ao sistema. A solicitação
              será atendida no prazo de até 7 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">O que não coletamos</h2>
            <p>
              Dados de localização, perfis publicitários, histórico de navegação, rastreamento
              por cookies de terceiros e qualquer outra forma de monitoramento comportamental
              não são coletados pelo NaCau.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border">
          <p className="text-muted text-sm text-center">
            NaCau — Gestão financeira do casal
          </p>
        </div>
      </div>
    </main>
  )
}
