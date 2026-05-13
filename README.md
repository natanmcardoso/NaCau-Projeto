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
| Gráficos | Recharts |
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
  /configuracoes      → Usuários, renda e senha
  /transacoes         → Lançamentos financeiros
  /gastos-fixos       → Gastos recorrentes mensais
  /parcelamentos      → Compras parceladas
  /relatorio          → Dashboard visual e relatórios por período
  /metas              → Metas financeiras com alertas de progresso
  page.tsx            → Visão geral / KPIs + gráficos

/components
  Sidebar.tsx          → Navegação lateral com logout
  SetupForm.tsx        → Formulário completo de configurações
  KPICard.tsx          → Cards de indicadores
  TransactionForm.tsx  → Formulário de transações
  TransactionList.tsx  → Listagem de transações com filtros
  ParcelamentoForm.tsx → Formulário de parcelamentos
  ParcelamentoList.tsx → Listagem com progresso por parcela
  MetaForm.tsx         → Formulário de criação/edição de metas
  MetaList.tsx         → Listagem de metas com barras de progresso e alertas
  GraficoCategoria.tsx → Gráfico donut: gastos por categoria
  GraficoEvolucao.tsx  → Gráfico de linha: evolução mensal

/lib
  supabase.ts         → Cliente Supabase + tipos TypeScript
  auth.ts             → Login, logout, alteração de senha
  formatters.ts       → Moeda pt-BR, datas, 2º dia útil

/utils/supabase
  client.ts           → Browser client (@supabase/ssr)
  server.ts           → Server Component client

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
| 2 | ✅ Concluída | Transações e saldo em tempo real |
| 3 | ✅ Concluída | Gastos fixos automáticos e parcelamentos |
| 4 | ✅ Concluída | Dashboard visual e relatórios |
| 5 | ✅ Concluída | Metas e alertas |
| 6 | ⏳ Planejado | Bot WhatsApp |

---

## Histórico de progresso

### Fase 1 — Concluída
- Setup do projeto Next.js 14 com App Router, TypeScript e Tailwind CSS
- Identidade visual: tema dark, Fraunces + DM Sans, paleta de cores definida
- Integração com Supabase via `@supabase/ssr` (publishable key)
- Migrations SQL: 6 tabelas criadas, RLS habilitado, permissões configuradas
- Autenticação por senha única com sessão persistente via cookie
- Middleware de proteção de rotas, página `/login`, página `/configuracoes`

### Fase 2 — Concluída
- KPIs na home: renda total, saldo disponível, saldo VA, total de gastos fixos
- Formulário de lançamento de transações (gasto / ganho / gasto VA)
- Listagem com filtros por usuário, tipo, categoria e período
- Edição e exclusão de transações; saldo atualizado em tempo real

### Fase 3 — Concluída
- Gastos fixos: listagem, cadastro, edição, remoção e lançamento automático idempotente
- Parcelamentos: cadastro com preview de valor por parcela, barra de progresso, marcar parcela paga

### Fase 4 — Concluída
- Gráfico donut (Recharts): gastos por categoria no mês atual
- Indicador de comprometimento do salário: fixos + parcelamentos vs renda (barra colorida)
- Comparativo automático com mês anterior (variação % de saídas)
- Página `/relatorio`: filtro por mês/ano, KPIs com delta %, gráfico pizza + linha, tabela de categorias
- API `GET /api/relatorio?mes=YYYY-MM` com evolução dos últimos 6 meses

### Fase 5 — Concluída
- Página `/metas`: listagem com barra de progresso geral e filtro ativas/todas
- `MetaForm.tsx`: modal de criação/edição (nome, valor total, valor guardado, prazo) com preview de valor mensal necessário
- `MetaList.tsx`: card por meta com barra de progresso colorida, alertas visuais (abaixo do ritmo, próximo do vencimento, vencida, concluída) e botão "Adicionar valor"
- Modal "Adicionar valor": incrementa `valor_atual` sem ultrapassar `valor_total`
- APIs: `GET /api/metas` (ativas ou todas), `POST /api/metas`, `PUT /api/metas/[id]` (edição ou `action: adicionar_valor`), `DELETE /api/metas/[id]` (soft delete)
- `/api/saldo` atualizado: desconta soma de `valor_atual` das metas ativas do saldo disponível
- Home atualizada: exibe linha "Guardado em metas" no resumo e link "Ver metas"
- Sidebar atualizada com link para Metas

---

## Deploy na Vercel

1. Conecte o repositório na Vercel
2. Adicione as variáveis de ambiente no painel
3. Deploy automático a cada push na `main`
