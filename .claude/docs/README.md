# Claude Code Multi-Agent System

Sistema híbrido de agentes especializados para desenvolvimento de software com Claude Code V2.0.

## Visão Geral

Este sistema implementa uma arquitetura de agentes com **6 core agents** (orquestradores) e **10 specialists** (expertise focada), permitindo desenvolvimento end-to-end com especialização profunda e sem perda de contexto.

## Estrutura

```
.claude/
├── agents/
│   ├── core/              # 6 meta-agentes orquestradores
│   └── specialists/        # 10 especialistas (carregados dinamicamente)
├── workflows/             # 3 fluxos adaptativos
├── commands/              # 4 slash commands
├── templates/             # 3 templates de documentos
└── config/                # Guardrails e validações
```

## Core Agents (6)

### 1. **Orchestrator** (Scrum Master)
- Analisa requests e escolhe workflow
- Delega para agentes especializados
- Monitora progresso via TodoWrite
- Coordena entregas

### 2. **Product Manager**
- Cria PRDs estruturados
- Define user stories e acceptance criteria
- Prioriza backlog
- Output: `docs/prd/{feature}.md`

### 3. **Architect** (Meta-agent)
- Detecta contexto (frontend/backend/data/security)
- Carrega specialists apropriados
- Design de arquitetura
- ADRs para decisões importantes
- Output: `docs/architecture/{feature}.md`

### 4. **Developer** (Meta-agent)
- Detecta stack (frontend/backend/database)
- Carrega specialists apropriados
- Implementação com TDD
- Auto-correção quando testes falham

### 5. **QA Engineer** (Meta-agent)
- Detecta tipo de teste (frontend/backend/e2e)
- Carrega specialists apropriados
- Valida acceptance criteria
- Gera relatórios de teste

### 6. **DevOps**
- CI/CD pipelines
- Docker/containerização
- Deploy automation
- Monitoring básico

## Specialists (10)

### Architecture (4)
- **frontend-arch.md** - React/Next.js architecture
- **backend-arch.md** - Node/Express API design
- **data-arch.md** - Database design, migrations
- **security-arch.md** - Auth, OWASP, compliance

### Development (3)
- **frontend-dev.md** - React implementation, hooks, a11y
- **backend-dev.md** - Express APIs, validation, security
- **database-dev.md** - SQL, migrations, optimization

### Testing (3)
- **frontend-testing.md** - Jest, RTL, component tests
- **backend-testing.md** - Supertest, integration tests
- **e2e-testing.md** - Playwright, user flows

## Workflows (3)

### Quick Flow (~15-30min)
**Para:** Bug fixes, hotfixes, mudanças < 100 linhas

**Fluxo:** Developer → QA → Git

```bash
Orquestrador detecta: mudança simples
→ Developer (carrega specialist) → implementa fix
→ QA → valida
→ Git commit/push
```

### Standard Flow (~1-3h)
**Para:** Features médias, novas funcionalidades

**Fluxo:** PM → Architect → Developer → QA → Git

```bash
PM → cria PRD
→ Architect (carrega specialists) → design
→ Developer (carrega specialists) → implementa
→ QA (carrega specialists) → valida
→ Git commit/push/PR
```

### Enterprise Flow (~4-8h)
**Para:** Features complexas, sistemas críticos

**Fluxo:** PM → Architect → DevOps (setup) → Developer → QA → DevOps (deploy) → Git

```bash
PM → PRD completo + análise de risco
→ Architect → design completo + security review
→ DevOps → setup CI/CD
→ Developer → implementação incremental
→ QA → testes comprehensivos (unit/integration/e2e)
→ DevOps → deploy staging + validação
→ Git PR + deployment plan
```

## Slash Commands (4)

### `/review [file]`
Code review automático com detecção de stack

```bash
/review src/components/Header.tsx
# → Detecta frontend → carrega frontend-dev.md → review completo
```

### `/create-feature [description]`
Cria feature end-to-end com Standard Flow

```bash
/create-feature User authentication with JWT
# → PM → Architect → Developer → QA → Git
```

### `/fix-bug [description]`
Bug fix com Quick Flow

```bash
/fix-bug Login form not validating email
# → Analyze → Fix → Test → Git
```

### `/refactor [file]`
Refactoring mantendo testes verdes

```bash
/refactor src/services/user.service.ts
# → Baseline tests → Refactor incremental → Validate
```

## Como Usar

### 1. Desenvolvimento de Feature Completa
```
Você (usuário):
"Implementar autenticação JWT no backend"

Orchestrator:
- Analisa: complexidade média
- Escolhe: Standard Flow
- Executa:
  1. PM cria PRD
  2. Architect desenha (carrega backend-arch + security-arch)
  3. Developer implementa (carrega backend-dev)
  4. QA testa (carrega backend-testing)
  5. Git: commit + push + PR
```

### 2. Bug Fix Rápido
```
Você:
"/fix-bug Memory leak no Dashboard"

Orchestrator:
- Escolhe: Quick Flow
- Developer (carrega frontend-dev) → analisa + fixa
- QA valida
- Git commit/push
```

### 3. Code Review
```
Você:
"/review src/controllers/user.controller.ts"

System:
- Detecta: backend (controllers/)
- Carrega: backend-dev.md
- Analisa: segurança, performance, best practices
- Relata: issues + recomendações
```

## Vantagens do Sistema Híbrido

### ✅ Especialização Profunda
- Specialists focados (frontend !== backend)
- Expertise específica por stack
- Sem agregação que causa perda de contexto

### ✅ Simplicidade de Uso
- 6 agentes core visíveis
- Specialists carregados automaticamente
- Zero configuração manual

### ✅ Adaptive Complexity
- Quick Flow: bug fix em 15min
- Standard Flow: feature em 1-3h
- Enterprise Flow: sistema crítico em 4-8h

### ✅ Validação Automática
- Guardrails previnem erros
- Testes executados automaticamente
- Git workflow integrado

## Guardrails

Validações automáticas em `.claude/config/guardrails.yml`:

**Segurança:**
- ❌ Hardcoded secrets detectados
- ✅ SQL injection prevenido
- ✅ Passwords hasheados (bcrypt)

**Qualidade:**
- Max 500 linhas por arquivo
- Max 50 linhas por função
- Coverage mínimo 80%

**Performance:**
- Response time < 200ms (backend)
- Bundle size < 200kb (frontend)
- Lighthouse score > 90

## Templates

### PRD Template
`docs/prd/{feature}.md` com:
- Overview, problema, solução
- Requisitos funcionais/não-funcionais
- User stories com acceptance criteria
- Métricas de sucesso

### Architecture Template
`docs/architecture/{feature}.md` com:
- System overview (diagramas Mermaid)
- Tech stack decisions
- Components design
- API design
- Security/performance considerations
- ADRs

### Test Plan Template
`docs/test-plan/{feature}.md` com:
- Test strategy
- Test cases
- Coverage goals
- Acceptance criteria validation

## Exemplo Real: Feature de Autenticação

```
1. Request:
   "Implementar autenticação JWT com refresh tokens"

2. Orchestrator escolhe: Standard Flow

3. PM Agent:
   - Cria docs/prd/authentication.md
   - Define user stories (login, logout, refresh)
   - Acceptance criteria claros

4. Architect Agent:
   - Detecta: backend + security
   - Carrega: backend-arch.md + security-arch.md
   - Design: JWT RS256, bcrypt, rate limiting
   - Cria docs/architecture/authentication.md
   - ADR: "Why JWT over sessions"

5. Developer Agent:
   - Detecta: backend
   - Carrega: backend-dev.md
   - Implementa:
     * routes/auth.routes.ts
     * controllers/auth.controller.ts
     * services/auth.service.ts
     * middleware/authenticate.ts
   - Escreve testes com supertest

6. QA Agent:
   - Detecta: backend
   - Carrega: backend-testing.md
   - Valida todos acceptance criteria
   - Coverage: 92%

7. Git Workflow:
   - Commit: "feat: add JWT authentication with refresh tokens"
   - Push
   - Create PR com descrição automática

Tempo total: ~2h
```

## Comparação: BMAD vs Este Sistema

| Aspecto | BMAD-Method | Claude Code System |
|---------|-------------|-------------------|
| Agentes | 12 prompts sequenciais | 6 core + 10 specialists |
| Execução | Só gera texto | Executa código real |
| Validação | Manual | Automática (testes, linter) |
| Git | Manual | Automático |
| Especialização | Agregado (perda contexto) | Focada (specialists) |
| Setup | NPM install | Zero setup |
| Autonomia | Baixa | Alta |

## Próximos Passos

1. **Testar com feature real** - Use `/create-feature` ou Standard Flow
2. **Ajustar specialists** - Customize para seu tech stack
3. **Adicionar specialists** - Mobile, data engineering, etc (se precisar)
4. **Configurar guardrails** - Ajuste limites conforme projeto

## Suporte

- **Documentação:** `.claude/docs/`
- **Issues:** GitHub Issues do projeto
- **Customização:** Edit agents em `.claude/agents/`

---

**Versão:** 1.0.0
**Última atualização:** 2025-01-10
**Licença:** MIT
