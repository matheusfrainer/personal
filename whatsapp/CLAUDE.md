# CLAUDE.md

Clone do WhatsApp Web em Next.js 16 (App Router) + React 19 + Tailwind v4, com
toda a UI sobre shadcn/ui. Sobre a base de chat há uma camada de CRM para
assessores de investimento: funil, carteiras, agenda, automações e análise de
conversa por LLM. Não há backend — os dados são semeados e vivem em
`localStorage`; a única rota de servidor é `/api/insights`.

## Comandos

```bash
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run format       # prettier --write "**/*.{ts,tsx}"
npm run test:e2e     # playwright (todos os projetos)
npx playwright test e2e/crm.spec.ts --project=desktop   # um spec, um device
```

`npm run test:e2e` roda `npm run build && next start -p 3210` — testa o build de
produção, não o dev server, e por isso a primeira execução é lenta. Fora do CI,
`reuseExistingServer` aproveita um server já de pé na 3210. Antes da primeira
vez: `npx playwright install`. Dois projetos: `desktop` e `mobile` (Pixel 5).

## Arquitetura

- `app/` — `page.tsx` monta `<WhatsappApp>`; `/connect` é a tela de QR;
  `api/insights/route.ts` é o único código de servidor.
- `components/ui/` — primitivos shadcn. **`bubble`, `message`, `marker`,
  `attachment` e `message-scroller` são primitivos de chat próprios deste
  projeto**, não vêm do registry — `npx shadcn add` os sobrescreveria.
- `components/whatsapp/` — a UI composta sobre esses primitivos.
  `views/` são as áreas que ocupam a largura toda (funil, carteiras, agenda,
  automações); as demais convivem com a lista + conversa.
- `lib/` — `types.ts` (união discriminada de `Message`, `View`), `data.ts`
  (seed), `store.tsx` (reducer + context), `storage.ts`, `crm.ts`,
  `portfolio.ts`, `automation-engine.ts`, `insights.ts`, `insights-local.ts`.
- `hooks/` — `use-automation-scheduler` (tick de 60 s), `use-media-query`,
  `use-hydrated`.

Estado inteiro num reducer só (`lib/store.tsx`), consumido por `useStore()` e
`useSelectedChat()`. Adicionar uma `View` sem tela é erro de tipo: o mapa
`SCREENS` em `whatsapp-app.tsx` é um `Record<View, ReactNode>`.

## Regras não óbvias

**O `initialState` é vazio de propósito.** A página é pré-renderizada no
servidor, que não lê `localStorage`; qualquer dado de domínio no estado inicial
pinta primeiro e se reescreve depois. O seed entra pelo `HYDRATE`, no cliente
(`seedState`). A regra é: um valor pré-hidratação só pode fazer renderizar
*menos* — `null`/`false` podem ser preenchidos, um número ou um `true` só podem
ser contraditos. `e2e/hydration.spec.ts` trava isso, inclusive que nome do seed
nenhum apareça no HTML de `/`.

**`localStorage`.** Chave `whatsapp-shadcn:state:v3` (`lib/storage.ts`). Mudança
incompatível no formato persistido exige subir a versão da chave: não há
migração, e um payload inválido cai para o seed. `sanitize()` remove estado
transitório na escrita *e* na leitura. Só persiste o que está em
`PersistedState`; `view` e `selectedId` ficam de fora deliberadamente.

**Automação global × local.** Regras globais vivem no store, regras de contato
vivem no chat. Ligar/desligar uma global num contato grava um override em
`chat.automationOverrides` — nunca mutar a regra compartilhada. Leia sempre
pelos helpers de `lib/crm.ts`: `crmOf()`, `localAutomations()`,
`isAutomationOn()`, `renderTemplate()`.

**Testes determinísticos.** O app simula a resposta do outro lado com timers e
texto aleatório. `?e2e=1` (`isSimulationDisabled()`, `lib/e2e.ts`) desliga a
simulação e o scheduler de automações. Comece todo spec por `openApp(page)`
(`e2e/helpers.ts`): navega com `?e2e=1` e limpa o `localStorage`. Os demais
helpers de lá (`openChat`, `messageAction`, `sendMessage`) existem porque os
seletores têm armadilhas — ações de mensagem ficam no DOM invisíveis em toda
linha, e o botão de conversas leva o contador de não lidas no nome acessível.

**`/api/insights`.** Chama a API da Anthropic com JSON Schema em
`output_config`; o prompt de sistema fica atrás de um breakpoint de cache e o
transcrito vai depois. Sem `ANTHROPIC_API_KEY` (em `.env.local`, git-ignorado)
responde 501 e a UI cai para `analyzeLocally()` (`lib/insights-local.ts`) — a
aba de IA nunca fica vazia. O resultado é cacheado em `state.insights` por
`fingerprint(chat)`. Não passe `temperature`/`top_p` aqui: é 400 no Sonnet 5.

**O scheduler só roda com a aba aberta.** Não há servidor: uma ação aprovada
para as 15:00 sai quando o app for aberto de novo. A Agenda diz isso na tela —
não introduza texto que sugira uma fila que não existe.

## Convenções

- Prettier: sem ponto e vírgula, aspas duplas, 80 colunas, `prettier-plugin-
  tailwindcss` ordenando as classes. Formate só o que você tocou
  (`npx prettier --write <arquivos>`). **No Windows com `core.autocrlf=true`,
  `prettier --check` reprova o repositório inteiro** — o `.prettierrc` fixa
  `endOfLine: "lf"` e a árvore de trabalho é CRLF. É falso positivo: o git
  normaliza para LF no commit, então um `--write` geral reescreve dezenas de
  arquivos sem gerar diff nenhum. Para checar de verdade, compare ignorando o
  CR: `npx prettier <arquivo> | diff --strip-trailing-cr - <arquivo>`.
- **Código e comentários em inglês; toda string de UI, `aria-label` e mensagem
  de commit em pt-BR.** Os testes casam por nome acessível em português.
- Comentário explica *por quê*, não *o quê* — é o padrão em todo o repositório,
  inclusive nos campos de interface. Mantenha ao editar.
- Ícones: em `components/whatsapp/**`, importe do barril
  `components/whatsapp/icons.ts` e renderize com `<Icon icon={...} />` (aplica o
  traço mais fino do estilo Mira). Import direto de `@hugeicons/*` só em
  `components/ui/**`, que é código do registry.
- Tema: tokens `oklch` em `app/globals.css` (shadcn Mira, base neutral, radius
  0.375rem, fonte Geist pelos itens oficiais do registry). A paleta é low-chroma
  de ponta a ponta — ênfase por peso e por `muted`/`foreground`, não por matiz.
  `text-destructive` é a única exceção.
- Alias de import: `@/*`.

## Escopo

Status e Canais ficaram **intencionalmente** fora deste clone; não são pendência.
As áreas existentes são Conversas, Chamadas, Comunidades, Configurações, a tela
de conexão em `/connect` e os quatro workspaces de CRM.

## `AGENTS.md`

É gerado e reescrito pelo `next dev` (bloco `nextjs-agent-rules`). Não edite à
mão nem tente removê-lo do diff — commit junto com o trabalho.
