# NaCau — Gestão Financeira do Casal

Sistema de controle financeiro pessoal para uso em casal, com dashboard web e bot no WhatsApp (em desenvolvimento).

## Visão geral

O NaCau permite que dois usuários acompanhem juntos receitas, gastos, metas e parcelamentos de forma simples e centralizada. A entrada de dados é feita pelo dashboard web (e futuramente pelo WhatsApp).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Estilização | Tailwind CSS |
| Backend | Next.js API Routes |
| Banco de dados | Supabase (PostgreSQL) |
| Hospedagem | Vercel |
| Bot WhatsApp | Fase 6 (a implementar) |

## Identidade visual

- Tema dark — fundo `#0e0e0f`, cards `#16161a`
- Fonte display: **Fraunces** (títulos e valores monetários)
- Fonte corpo: **DM Sans**
- Verde lima `#c8f564` · Azul `#6478f5` · Vermelho `#f56464`

---

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Configure o banco de dados

1. Crie um projeto no Supabase
2. Acesse **SQL Editor → New query** e execute os arquivos na ordem:
   - `supabase/migrations/001_init.sql` — cria as tabelas e dados iniciais
   - `supabase/migrations/002_rls_grants.sql` — habilita RLS e permissões de acesso

### 2. Configure as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local` com as credenciais do seu projeto (em **Project Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

### 3. Instale e rode

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

**Senha inicial:** `SENHA_INICIAL` — altere em Configurações após o primeiro acesso.

---

## Estrutura do projeto

```
/app
  /login              → Tela de autenticação
  /configuracoes      → Usuários, renda, gastos fixos e senha
  /transacoes         → Lançamentos (Fase 2)
  page.tsx            → Visão geral / KPIs (Fase 2)
  layout.tsx          → Layout global

/components
  Sidebar.tsx         → Navegação lateral com logout
  SetupForm.tsx       → Formulário completo de configurações
  KPICard.tsx         → Cards de indicadores (Fase 2)
  TransactionForm.tsx → Formulário de transações (Fase 2)
  TransactionList.tsx → Listagem de transações (Fase 2)

/lib
  supabase.ts         → Cliente Supabase + tipos TypeScript
  auth.ts             → Login, logout, alteração de senha
  formatters.ts       → Moeda pt-BR, datas, 2º dia útil

/utils/supabase
  client.ts           → Browser client (@supabase/ssr)
  server.ts           → Server Component client
  middleware.ts       → Refresh de sessão

/supabase/migrations
  001_init.sql        → Schema completo (6 tabelas + índices + seed)
  002_rls_grants.sql  → RLS e permissões para role anon

middleware.ts         → Proteção de rotas via cookie
```

## Banco de dados

| Tabela | Descrição |
|---|---|
| `config` | Configurações gerais (senha, salários, VA, dia vencimento) |
| `usuarios` | Dois usuários do casal (nome + WhatsApp) |
| `gastos_fixos` | Despesas mensais recorrentes |
| `transacoes` | Todos os lançamentos financeiros |
| `parcelamentos` | Compras parceladas com controle de parcelas |
| `metas` | Objetivos financeiros com progresso |

## Regras de negócio principais

- **VA:** R$ 2.100/pessoa por mês, carteira separada, zera todo dia 1
- **Salário:** creditado automaticamente no 2º dia útil do mês
- **Gastos fixos:** debitados automaticamente no dia 10
- **Saldo disponível:** salário − gastos fixos − gastos variáveis − metas reservadas
- **Tipos de transação:** `gasto`, `ganho`, `gasto_va`, `salario`, `gasto_fixo`

---

## Fases do projeto

| Fase | Status | Descrição |
|---|---|---|
| 1 | ✅ Concluída | Autenticação, configurações, banco de dados |
| 2 | 🔄 Em andamento | Transações e saldo em tempo real |
| 3 | ⏳ Planejado | Gastos fixos automáticos e parcelamentos |
| 4 | ⏳ Planejado | Dashboard visual e relatórios |
| 5 | ⏳ Planejado | Metas e alertas |
| 6 | ⏳ Planejado | Bot WhatsApp |

## Deploy na Vercel

1. Conecte o repositório na Vercel
2. Adicione as variáveis de ambiente no painel
3. Deploy automático a cada push na `main`
