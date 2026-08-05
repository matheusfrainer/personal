# WhatsApp — clone em shadcn/ui

Um clone funcional da interface do **WhatsApp Web**, com toda a UI construída
sobre o **shadcn/ui** e seguindo a documentação oficial. É um app **Next.js**
(App Router) com **Tailwind CSS v4**.

## Especificações de design

Conforme solicitado, o projeto foi gerado com `npx shadcn create` usando:

| Item                | Valor                                             |
| ------------------- | ------------------------------------------------- |
| Estilo (style)      | **Mira** (`radix-mira`) — compacto, para interfaces densas |
| Base de cor / tema  | **Neutro** (`neutral`)                            |
| Fonte (heading/body)| **Geist** (Geist Sans) + Geist Mono               |
| Radius              | **Small** (`--radius: 0.375rem`)                  |
| Biblioteca base     | Radix UI                                          |
| Ícones              | Hugeicons                                          |

O tema usa CSS variables em `oklch` (`app/globals.css`), exatamente no formato
que o shadcn gera. A cor da fonte e o radius foram ajustados sobre a saída do
CLI para atender à especificação (Geist no lugar de Inter, radius Small no lugar
do padrão do preset).

## Funcionalidades

- **Lista de conversas**: busca, filtros (Tudo / Não lidas / Favoritas /
  Grupos), conversas fixadas, silenciadas, rascunhos, contadores de não lidas e
  recibos de leitura na prévia.
- **Conversa**: cabeçalho com presença ("online" / "visto por último…"),
  separadores de data, balões com "rabinho", agrupamento de mensagens do mesmo
  autor, recibos de entrega (enviado ▸ entregue ▸ lido em azul) e aviso de
  criptografia.
- **Envio real de mensagens**: digite e envie; o status evolui e o outro lado
  "digita" e responde (simulado) para dar vida à interface.
- **Modo claro/escuro** via `next-themes` (botão na barra ou tecla `d`).
- **Responsivo**: em telas pequenas alterna entre lista e conversa, como o app.

## Componentes shadcn utilizados

`button`, `input`, `avatar`, `scroll-area`, `tooltip`, `dropdown-menu`,
`separator`, `badge`, `tabs` — todos adicionados via `npx shadcn@latest add`.
A UI específica do WhatsApp fica em `components/whatsapp/`.

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3000
# ou
npm run build && npm run start
```

Scripts úteis: `npm run typecheck`, `npm run lint`.
