-- NaCau — RLS e permissões de acesso para a role anon
-- Execute este arquivo no SQL Editor do Supabase após o 001_init.sql

-- ========================
-- Habilitar RLS em todas as tabelas
-- ========================
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_fixos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas ENABLE ROW LEVEL SECURITY;

-- ========================
-- Conceder acesso à role anon (chave publishable)
-- O sistema NaCau usa autenticação própria (senha única),
-- não o Supabase Auth, então a role anon precisa de acesso total.
-- ========================
GRANT ALL ON config TO anon;
GRANT ALL ON usuarios TO anon;
GRANT ALL ON gastos_fixos TO anon;
GRANT ALL ON transacoes TO anon;
GRANT ALL ON parcelamentos TO anon;
GRANT ALL ON metas TO anon;

-- ========================
-- Políticas RLS: acesso irrestrito via anon
-- (a autenticação é controlada pela senha na tabela config)
-- ========================

-- config
CREATE POLICY "anon_all_config" ON config FOR ALL TO anon USING (true) WITH CHECK (true);

-- usuarios
CREATE POLICY "anon_all_usuarios" ON usuarios FOR ALL TO anon USING (true) WITH CHECK (true);

-- gastos_fixos
CREATE POLICY "anon_all_gastos_fixos" ON gastos_fixos FOR ALL TO anon USING (true) WITH CHECK (true);

-- transacoes
CREATE POLICY "anon_all_transacoes" ON transacoes FOR ALL TO anon USING (true) WITH CHECK (true);

-- parcelamentos
CREATE POLICY "anon_all_parcelamentos" ON parcelamentos FOR ALL TO anon USING (true) WITH CHECK (true);

-- metas
CREATE POLICY "anon_all_metas" ON metas FOR ALL TO anon USING (true) WITH CHECK (true);
