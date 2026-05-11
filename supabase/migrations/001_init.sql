-- NaCau — Migração inicial
-- Execute este arquivo no SQL Editor do Supabase

-- ========================
-- Tabela: config
-- Armazena configurações gerais do sistema (senha, salários, VA etc.)
-- ========================
CREATE TABLE IF NOT EXISTS config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- Tabela: usuarios
-- Apenas dois registros: usuario1 e usuario2
-- ========================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT UNIQUE NOT NULL,
  tipo TEXT CHECK (tipo IN ('usuario1', 'usuario2')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- Tabela: gastos_fixos
-- Despesas mensais recorrentes, debitadas todo dia 10
-- ========================
CREATE TABLE IF NOT EXISTS gastos_fixos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  dia_vencimento INTEGER DEFAULT 10,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- Tabela: transacoes
-- Lançamentos manuais e automáticos
-- ========================
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo TEXT CHECK (tipo IN ('gasto', 'ganho', 'gasto_va', 'salario', 'gasto_fixo')),
  descricao TEXT NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria TEXT,
  data DATE DEFAULT CURRENT_DATE,
  origem TEXT CHECK (origem IN ('whatsapp', 'dashboard')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- Tabela: parcelamentos
-- Compras parceladas com controle de parcelas
-- ========================
CREATE TABLE IF NOT EXISTS parcelamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  descricao TEXT NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  total_parcelas INTEGER NOT NULL,
  parcelas_pagas INTEGER DEFAULT 0,
  valor_parcela NUMERIC(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dia_vencimento INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- Tabela: metas
-- Objetivos financeiros com acompanhamento de progresso
-- ========================
CREATE TABLE IF NOT EXISTS metas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  valor_atual NUMERIC(10,2) DEFAULT 0,
  data_fim DATE NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================
-- Dados iniciais de configuração
-- ========================
INSERT INTO config (key, value) VALUES
  ('senha', 'SENHA_INICIAL'),
  ('salario1', '0'),
  ('salario2', '0'),
  ('va1', '2100'),
  ('va2', '2100'),
  ('dia_vencimento_padrao', '10')
ON CONFLICT (key) DO NOTHING;

-- ========================
-- Índices para performance
-- ========================
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
