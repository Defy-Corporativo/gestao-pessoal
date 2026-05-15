-- =============================================
-- Gestão Pessoal - Database Schema
-- Prefixo pepl_ em TODOS os componentes
-- =============================================
-- SCRIPT PARA RECRIAR O BANCO DE DADOS
-- Este script contém tanto DROP quanto CREATE statements
-- Pode ser executado para recriar todo o schema do zero
--
-- ATENÇÃO: Executar este script irá APAGAR todos os dados!
-- =============================================

-- ============================================================
-- PARTE 0: DROP de todos os objetos (ordem inversa)
-- ============================================================

DROP INDEX IF EXISTS idx_pepl_responsible_functions_responsible;
DROP INDEX IF EXISTS idx_pepl_responsible_functions_function;
DROP INDEX IF EXISTS idx_pepl_responsible_kpis_responsible;
DROP INDEX IF EXISTS idx_pepl_responsible_skills_responsible;
DROP INDEX IF EXISTS idx_pepl_responsible_roles_responsible;
DROP INDEX IF EXISTS idx_pepl_responsible_roles_role;
DROP INDEX IF EXISTS idx_pepl_roles_name;
DROP INDEX IF EXISTS idx_pepl_responsibles_name;
DROP INDEX IF EXISTS idx_pepl_responsibles_is_active;

DROP TABLE IF EXISTS pepl_responsible_functions CASCADE;
DROP TABLE IF EXISTS pepl_responsible_kpis CASCADE;
DROP TABLE IF EXISTS pepl_responsible_skills CASCADE;
DROP TABLE IF EXISTS pepl_responsible_roles CASCADE;
DROP TABLE IF EXISTS pepl_roles CASCADE;
DROP TABLE IF EXISTS pepl_functions CASCADE;
DROP TABLE IF EXISTS pepl_responsibles CASCADE;

-- ============================================================
-- PARTE 1: CRIAÇÃO
-- ============================================================

-- Habilitar extensão UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tabela: Responsáveis (cadastro centralizado)
-- =============================================
CREATE TABLE pepl_responsibles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  email text,
  job_description text,
  mission text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pepl_responsibles_name ON pepl_responsibles(name);
CREATE INDEX idx_pepl_responsibles_is_active ON pepl_responsibles(is_active);

-- =============================================
-- Tabela: Papéis (cargos/funções)
-- =============================================
CREATE TABLE pepl_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pepl_roles_name ON pepl_roles(name);

-- =============================================
-- Tabela: Vínculo Responsável <-> Papéis (N:N)
-- =============================================
CREATE TABLE pepl_responsible_roles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsible_id uuid REFERENCES pepl_responsibles(id) ON DELETE CASCADE NOT NULL,
  role_id uuid REFERENCES pepl_roles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(responsible_id, role_id)
);

CREATE INDEX idx_pepl_responsible_roles_responsible ON pepl_responsible_roles(responsible_id);
CREATE INDEX idx_pepl_responsible_roles_role ON pepl_responsible_roles(role_id);

-- =============================================
-- Tabela: Habilidades do Responsável
-- =============================================
CREATE TABLE pepl_responsible_skills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsible_id uuid REFERENCES pepl_responsibles(id) ON DELETE CASCADE NOT NULL,
  skill text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pepl_responsible_skills_responsible ON pepl_responsible_skills(responsible_id);

-- =============================================
-- Tabela: Funções Organizacionais
-- =============================================
CREATE TABLE pepl_functions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  pilar text NOT NULL,
  responsabilidades text,
  resultado_esperado text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pepl_functions_pilar ON pepl_functions(pilar);
CREATE INDEX idx_pepl_functions_name  ON pepl_functions(name);

-- =============================================
-- Tabela: KPIs (indicadores de desempenho)
-- =============================================
CREATE TABLE pepl_responsible_kpis (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsible_id uuid REFERENCES pepl_responsibles(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  measurement text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pepl_responsible_kpis_responsible ON pepl_responsible_kpis(responsible_id);

-- =============================================
-- Tabela: Vínculo Responsável <-> Funções (Pilares de Atuação)
-- =============================================
CREATE TABLE pepl_responsible_functions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsible_id uuid REFERENCES pepl_responsibles(id) ON DELETE CASCADE NOT NULL,
  function_id uuid REFERENCES pepl_functions(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(responsible_id, function_id)
);

CREATE INDEX idx_pepl_responsible_functions_responsible ON pepl_responsible_functions(responsible_id);
CREATE INDEX idx_pepl_responsible_functions_function ON pepl_responsible_functions(function_id);
