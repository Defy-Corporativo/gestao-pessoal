-- =============================================
-- Gestão Pessoal - Upgrade: Perfis dos Responsáveis
-- Prefixo: pepl_
-- =============================================
-- Adiciona:
--   1) Campo "mission" em pepl_responsibles
--   2) Tabela pepl_responsible_kpis (indicadores de desempenho)
--   3) Tabela pepl_responsible_functions (pilares de atuação)
-- =============================================

-- ============================================================
-- PARTE 0: DROP (ordem inversa de dependência)
-- ============================================================

DROP INDEX IF EXISTS idx_pepl_responsible_functions_responsible;
DROP INDEX IF EXISTS idx_pepl_responsible_functions_function;
DROP INDEX IF EXISTS idx_pepl_responsible_kpis_responsible;

DROP TABLE IF EXISTS pepl_responsible_functions CASCADE;
DROP TABLE IF EXISTS pepl_responsible_kpis CASCADE;

-- ============================================================
-- PARTE 1: ALTERAR pepl_responsibles (novo campo mission)
-- ============================================================

-- Adicionar campo de missão (idempotente)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pepl_responsibles'
          AND column_name = 'mission'
    ) THEN
        ALTER TABLE pepl_responsibles ADD COLUMN mission text;
    END IF;
END $$;

-- ============================================================
-- PARTE 2: CRIAÇÃO DE TABELAS
-- ============================================================

-- Habilitar extensão UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tabela: KPIs (indicadores de desempenho)
-- Cada KPI tem descrição e critério de mensuração
-- =============================================
CREATE TABLE pepl_responsible_kpis (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    responsible_id  uuid REFERENCES pepl_responsibles(id) ON DELETE CASCADE NOT NULL,
    description     text NOT NULL,
    measurement     text NOT NULL,
    order_index     integer DEFAULT 0,
    created_at      timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pepl_responsible_kpis_responsible ON pepl_responsible_kpis(responsible_id);

-- Desabilitar RLS (padrão das tabelas pepl_ neste projeto)
ALTER TABLE pepl_responsible_kpis DISABLE ROW LEVEL SECURITY;

-- =============================================
-- Tabela: Vínculo Responsável <-> Funções (Pilares de Atuação)
-- Relaciona o responsável às funções organizacionais
-- =============================================
CREATE TABLE pepl_responsible_functions (
    id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    responsible_id  uuid REFERENCES pepl_responsibles(id) ON DELETE CASCADE NOT NULL,
    function_id     uuid REFERENCES pepl_functions(id) ON DELETE CASCADE NOT NULL,
    created_at      timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(responsible_id, function_id)
);

CREATE INDEX idx_pepl_responsible_functions_responsible ON pepl_responsible_functions(responsible_id);
CREATE INDEX idx_pepl_responsible_functions_function ON pepl_responsible_functions(function_id);

-- Desabilitar RLS (padrão das tabelas pepl_ neste projeto)
ALTER TABLE pepl_responsible_functions DISABLE ROW LEVEL SECURITY;
