export default function TermosDeServico() {
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
          <h1 className="font-display text-3xl font-light mb-3">Termos de Serviço</h1>
          <p className="text-muted text-sm">Última atualização: 13 de maio de 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-[#e8e8f0] leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Natureza do sistema</h2>
            <p>
              O NaCau é um sistema de uso estritamente privado, desenvolvido para uso exclusivo
              do casal cadastrado. Não se trata de um produto comercial, plataforma SaaS ou
              serviço disponível ao público em geral.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Regulamentação financeira</h2>
            <p>
              O NaCau não é um serviço financeiro regulado. Não possui licença de instituição
              financeira, não executa transações monetárias e não está sujeito à supervisão do
              Banco Central do Brasil ou de qualquer outro órgão regulador.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Responsabilidade pelos dados</h2>
            <p>
              Os dados inseridos no sistema — incluindo valores, categorias, descrições e
              qualquer outra informação — são de responsabilidade exclusiva dos usuários.
              A veracidade e integridade dessas informações dependem do que for registrado
              por eles.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Decisões financeiras</h2>
            <p>
              O sistema não se responsabiliza por quaisquer decisões financeiras tomadas com
              base nas informações exibidas no dashboard. As visualizações e relatórios são
              meramente informativos e não constituem assessoria financeira.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-light text-lime mb-3">Acesso não autorizado</h2>
            <p>
              O acesso ao sistema por terceiros não autorizados não é permitido. Qualquer
              tentativa de acesso indevido, engenharia reversa ou exploração de
              vulnerabilidades está sujeita às penalidades previstas na Lei Geral de
              Proteção de Dados (LGPD) e demais legislações aplicáveis.
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
