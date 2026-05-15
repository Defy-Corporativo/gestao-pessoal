-- =============================================
-- Gestão Pessoal - Módulo: Funções Organizacionais
-- Prefixo: pepl_
-- =============================================
-- SCRIPT PARA RECRIAR A TABELA pepl_functions
-- Contém DROP + CREATE + carga inicial de dados
-- =============================================

-- ============================================================
-- PARTE 0: DROP (ordem inversa de dependência)
-- ============================================================

DROP INDEX IF EXISTS idx_pepl_functions_pilar;
DROP INDEX IF EXISTS idx_pepl_functions_name;

DROP TABLE IF EXISTS pepl_functions CASCADE;

-- ============================================================
-- PARTE 1: CRIAÇÃO
-- ============================================================

-- Habilitar extensão UUID (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tabela: Funções Organizacionais
-- Cada função pertence a um pilar estratégico
-- =============================================
CREATE TABLE pepl_functions (
    id               uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name             text NOT NULL UNIQUE,
    pilar            text NOT NULL,
    responsabilidades text,
    resultado_esperado text,
    created_at       timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at       timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_pepl_functions_pilar ON pepl_functions(pilar);
CREATE INDEX idx_pepl_functions_name  ON pepl_functions(name);

-- Desabilitar RLS (padrão das tabelas pepl_ neste projeto)
ALTER TABLE pepl_functions DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- PARTE 2: CARGA INICIAL DE DADOS
-- ============================================================

INSERT INTO pepl_functions (name, pilar, responsabilidades, resultado_esperado) VALUES

-- ──────────────────────────────────────────────────────────
-- Pilar: Estratégia & Negócios
-- ──────────────────────────────────────────────────────────
(
    'Arquitetura Estratégica / Visão da Empresa',
    'Estratégia & Negócios',
    'Definir visão de longo prazo, posicionamento, mercados-alvo, diferenciais competitivos, modelo de negócio, estratégia de crescimento e direcionamento da empresa',
    'Clareza estratégica, alinhamento entre sócios e crescimento sustentável'
),
(
    'Arquitetura de Negócios',
    'Estratégia & Negócios',
    'Estruturar unidades de negócio, modelos operacionais, monetização, pricing, canais de distribuição e desenho organizacional',
    'Empresa escalável e operacionalmente eficiente'
),
(
    'Comercial & Vendas',
    'Estratégia & Negócios',
    'Prospecção, relacionamento comercial, negociação, fechamento de contratos, CRM e expansão comercial',
    'Crescimento de receita e aquisição de clientes'
),
(
    'Growth & Expansão',
    'Estratégia & Negócios',
    'Estratégias de crescimento, geração de demanda, aquisição de clientes, análise de métricas e experimentação de mercado',
    'Crescimento acelerado e previsível'
),
(
    'Parcerias Estratégicas',
    'Estratégia & Negócios',
    'Relacionamento com parceiros tecnológicos, bancos, distribuidores, canais comerciais e alianças estratégicas',
    'Ampliação da capacidade comercial e técnica'
),
(
    'Marketing & Branding',
    'Estratégia & Negócios',
    'Posicionamento da marca, comunicação, presença digital, eventos, autoridade técnica e geração de conteúdo',
    'Fortalecimento da marca e geração de oportunidades'
),

-- ──────────────────────────────────────────────────────────
-- Pilar: Produto & Tecnologia
-- ──────────────────────────────────────────────────────────
(
    'Arquitetura de Produtos Digitais',
    'Produto & Tecnologia',
    'Definição de produtos, roadmap, capacidades, experiência do usuário, integrações e evolução das soluções',
    'Produtos coerentes, reutilizáveis e escaláveis'
),
(
    'Arquitetura de Software',
    'Produto & Tecnologia',
    'Definir padrões técnicos, arquitetura cloud, microsserviços, APIs, escalabilidade, observabilidade e integração',
    'Plataforma robusta, segura e preparada para escala'
),
(
    'Engenharia de Software',
    'Produto & Tecnologia',
    'Desenvolvimento backend, frontend, integrações, testes e sustentação técnica',
    'Entregas técnicas contínuas e com qualidade'
),
(
    'DevOps & Infraestrutura',
    'Produto & Tecnologia',
    'Gestão cloud, CI/CD, automação, monitoramento, deploys, ambientes e gestão de custos cloud',
    'Ambiente estável, seguro e automatizado'
),
(
    'Segurança da Informação',
    'Produto & Tecnologia',
    'Gestão de acessos, LGPD, segurança de APIs, gestão de riscos, resposta a incidentes e políticas de segurança',
    'Redução de riscos e conformidade'
),
(
    'Dados & Inteligência Artificial',
    'Produto & Tecnologia',
    'Estratégia de IA, agentes, RAG, embeddings, pipelines de dados, analytics e governança de IA',
    'Soluções AI-native com vantagem competitiva'
),
(
    'Qualidade & QA',
    'Produto & Tecnologia',
    'Estratégia de testes, homologação, automação de testes e critérios de aceite',
    'Redução de falhas e melhoria de qualidade'
),

-- ──────────────────────────────────────────────────────────
-- Pilar: Operação & Clientes
-- ──────────────────────────────────────────────────────────
(
    'Operações',
    'Operação & Clientes',
    'Gestão operacional, sustentação, onboarding, processos internos, SLAs e eficiência operacional',
    'Operação organizada e escalável'
),
(
    'Customer Success',
    'Operação & Clientes',
    'Relacionamento com clientes, retenção, expansão de contas, suporte estratégico e acompanhamento de resultados',
    'Alta retenção e satisfação dos clientes'
),
(
    'PMO / Gestão de Projetos',
    'Operação & Clientes',
    'Gestão de cronogramas, alinhamentos, dependências, status report e acompanhamento executivo',
    'Entregas previsíveis e alinhadas'
),

-- ──────────────────────────────────────────────────────────
-- Pilar: Governança & Financeiro
-- ──────────────────────────────────────────────────────────
(
    'Administração Financeira',
    'Governança & Financeiro',
    'Fluxo de caixa, contas a pagar/receber, orçamento, projeções financeiras e controle financeiro',
    'Saúde financeira e previsibilidade'
),
(
    'Controladoria',
    'Governança & Financeiro',
    'Indicadores financeiros, DRE, auditoria, centros de custo e acompanhamento de resultados',
    'Governança financeira e controle'
),
(
    'Jurídico & Compliance',
    'Governança & Financeiro',
    'Contratos, societário, LGPD, compliance regulatório e mitigação de riscos jurídicos',
    'Segurança jurídica e regulatória'
),
(
    'Governança Corporativa',
    'Governança & Financeiro',
    'Estrutura societária, tomada de decisão, gestão de responsabilidades, ritos executivos e acompanhamento estratégico',
    'Organização societária e alinhamento executivo'
),
(
    'Pessoas & Cultura',
    'Governança & Financeiro',
    'Contratação, cultura organizacional, onboarding, desenvolvimento e retenção de talentos',
    'Time alinhado e sustentável'
),

-- ──────────────────────────────────────────────────────────
-- Pilar: Inovação & Escala
-- ──────────────────────────────────────────────────────────
(
    'Inovação & Novos Negócios',
    'Inovação & Escala',
    'Exploração de novas oportunidades, MVPs, validação de mercado e estruturação de novos produtos',
    'Geração contínua de novas receitas'
),
(
    'Relação com Investidores',
    'Inovação & Escala',
    'Fundraising, pitch, valuation, data room e relacionamento com investidores',
    'Capacidade de captação e expansão'
);
