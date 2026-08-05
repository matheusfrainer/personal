# WhatsApp — clone em shadcn/ui

Um clone funcional da interface do **WhatsApp Web**, com toda a UI construída
sobre o **shadcn/ui** e seguindo a documentação oficial. É um app **Next.js**
(App Router) com **Tailwind CSS v4**.

## Especificações de design

Projeto gerado com `npx shadcn create` usando:

| Item                 | Valor                                                      |
| -------------------- | ---------------------------------------------------------- |
| Estilo (style)       | **Mira** (`radix-mira`) — compacto, para interfaces densas  |
| Base de cor / tema   | **Neutro** (`neutral`) — sem verde, 100% neutro             |
| Fonte (body/heading) | **Geist** (`@shadcn/font-geist` + `@shadcn/font-heading-geist`) |
| Radius               | **Small** (`--radius: 0.375rem`)                           |
| Biblioteca base      | Radix UI                                                   |
| Ícones               | Hugeicons                                                  |

O tema usa CSS variables em `oklch` (`app/globals.css`), no formato que o
shadcn gera. As fontes foram instaladas pelos itens oficiais de fonte do
registry, e o radius Small ajustado sobre a saída do preset.

## Funcionalidades

**Lista de conversas** — busca, filtros (Tudo / Não lidas / Favoritas /
Grupos), conversas fixadas, silenciadas e arquivadas, rascunhos, contadores de
não lidas, recibos na prévia e menu de contexto (botão direito) com arquivar,
fixar, silenciar, marcar como não lida e apagar.

**Conversa** — presença (`online` / `visto por último` / membros / `digitando…`),
separadores de data, aviso de criptografia, balões com "rabinho", agrupamento
por autor, mensagem fixada no topo, divisor de mensagens não lidas, e recibos
de entrega (enviado ▸ entregue ▸ lido em azul).

**Mensagens** — responder/citar (com salto até a original), reações com emoji,
encaminhar, favoritar, fixar, copiar, apagar ("Esta mensagem foi apagada") e
seleção múltipla com barra de ações. Formatação inline `*negrito*`, `_itálico_`,
`~tachado~` e `` `mono` ``, além de autolink.

**Mídia** — imagem com legenda e visualizador em tela cheia, vídeo, áudio com
waveform/scrub/velocidade, documento, localização e contato.

**Compositor** — seletor de emoji, anexos (documento, foto, câmera, localização,
contato), gravação de voz simulada, rascunho persistido e prévia da resposta.

**Áreas** — Conversas, Chamadas (histórico), Comunidades (mural de avisos +
grupos), Configurações e a tela de conexão por QR code em `/connect`.
Status e Canais ficaram intencionalmente fora deste clone.

**Comportamento** — persistência em `localStorage` (as conversas sobrevivem ao
reload), contador de não lidas no título da aba, tema claro/escuro
(`next-themes`, atalho `d`), atalhos de teclado e layout responsivo.

## Arquitetura

- `app/` — layout (Geist), `globals.css` (tokens Neutro, radius Small,
  utilitários de wallpaper/rabinho/scrollbar), página e `/connect`.
- `components/ui/` — primitivos shadcn. Além dos usuais, os primitivos de chat:
  **`bubble`** (com `BubbleReactions`), **`message`**, **`marker`**,
  **`attachment`** e **`message-scroller`** (autoscroll + botão "rolar pro fim").
- `components/whatsapp/` — a UI do app composta sobre esses primitivos.
- `lib/` — `types.ts` (união discriminada de mensagens), `data.ts` (seed),
  `store.tsx` (reducer + context), `storage.ts`, `format.ts`, `media.ts`.

Os dados são simulados: não há backend, chamadas reais nem pareamento por QR.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
# ou
npm run build && npm run start
```

Scripts úteis: `npm run typecheck`, `npm run lint`.
