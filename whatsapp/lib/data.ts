export type MessageStatus = "pending" | "sent" | "delivered" | "read"

export interface Message {
  id: string
  /** true when the message was sent by the current user */
  fromMe: boolean
  /** display name of the sender (used for incoming group messages) */
  author?: string
  text: string
  /** display time, e.g. "09:42" */
  time: string
  /** delivery status, only meaningful for outgoing messages */
  status?: MessageStatus
}

export interface DayGroup {
  /** date label shown as a centered pill: "Hoje", "Ontem" or a date */
  label: string
  messages: Message[]
}

export interface Chat {
  id: string
  name: string
  /** neutral avatar tint key, see `avatarTints` */
  tint: AvatarTint
  isGroup?: boolean
  /** header subtitle for 1:1 chats ("online", "visto por último…") */
  presence?: string
  /** group members preview, shown as the header subtitle for groups */
  members?: string[]
  online?: boolean
  /** last-activity label shown in the chat list ("09:42", "Ontem"…) */
  time: string
  unread?: number
  pinned?: boolean
  muted?: boolean
  favourite?: boolean
  typing?: boolean
  /** an unsent draft, previewed in the chat list */
  draft?: string
  conversation: DayGroup[]
}

export type AvatarTint = "neutral" | "zinc" | "slate" | "stone" | "gray"

/**
 * Neutral avatar tints — kept intentionally low-chroma so the UI stays within
 * the Neutral shadcn theme while still letting contacts be told apart.
 */
export const avatarTints: Record<AvatarTint, string> = {
  neutral: "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100",
  zinc: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100",
  slate: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100",
  stone: "bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-100",
  gray: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-100",
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Flattened, latest-first helper used for chat-list previews. */
export function lastMessage(chat: Chat): Message | undefined {
  for (let d = chat.conversation.length - 1; d >= 0; d--) {
    const day = chat.conversation[d]
    if (day.messages.length) return day.messages[day.messages.length - 1]
  }
  return undefined
}

export const chats: Chat[] = [
  {
    id: "ana",
    name: "Ana Beatriz",
    tint: "slate",
    online: true,
    presence: "online",
    time: "09:47",
    unread: 2,
    pinned: true,
    favourite: true,
    conversation: [
      {
        label: "Ontem",
        messages: [
          {
            id: "ana-1",
            fromMe: false,
            text: "Oi! Você já viu o novo protótipo no Figma?",
            time: "18:02",
          },
          {
            id: "ana-2",
            fromMe: true,
            text: "Vi sim, ficou incrível 👏",
            time: "18:05",
            status: "read",
          },
          {
            id: "ana-3",
            fromMe: true,
            text: "Só acho que a home ainda pode respirar mais.",
            time: "18:05",
            status: "read",
          },
        ],
      },
      {
        label: "Hoje",
        messages: [
          {
            id: "ana-4",
            fromMe: false,
            text: "Bom dia ☀️ Consegui ajustar os espaçamentos ontem à noite.",
            time: "09:41",
          },
          {
            id: "ana-5",
            fromMe: false,
            text: "Dá uma olhada quando puder e me fala o que achou?",
            time: "09:47",
          },
        ],
      },
    ],
  },
  {
    id: "design",
    name: "Time de Design",
    tint: "zinc",
    isGroup: true,
    members: ["Você", "Ana Beatriz", "Rafael", "Marina", "Lucas"],
    time: "09:31",
    unread: 5,
    pinned: true,
    typing: true,
    conversation: [
      {
        label: "Hoje",
        messages: [
          {
            id: "d-1",
            fromMe: false,
            author: "Rafael",
            text: "Pessoal, subi a nova versão do design system no repositório.",
            time: "09:12",
          },
          {
            id: "d-2",
            fromMe: false,
            author: "Marina",
            text: "Massa! Os tokens de cor já estão no formato do shadcn?",
            time: "09:14",
          },
          {
            id: "d-3",
            fromMe: true,
            text: "Estão sim, migrei tudo pra CSS variables ontem.",
            time: "09:20",
            status: "read",
          },
          {
            id: "d-4",
            fromMe: false,
            author: "Lucas",
            text: "Ficou muito consistente 🙌",
            time: "09:31",
          },
        ],
      },
    ],
  },
  {
    id: "carlos",
    name: "Carlos Eduardo",
    tint: "neutral",
    presence: "visto por último hoje às 08:15",
    time: "08:10",
    conversation: [
      {
        label: "Hoje",
        messages: [
          {
            id: "c-1",
            fromMe: true,
            text: "Bom dia, Carlos! Confirmamos a reunião das 14h?",
            time: "08:04",
            status: "read",
          },
          {
            id: "c-2",
            fromMe: false,
            text: "Bom dia! Confirmado sim 👍",
            time: "08:09",
          },
          {
            id: "c-3",
            fromMe: false,
            text: "Vou levar os números do último trimestre.",
            time: "08:10",
          },
        ],
      },
    ],
  },
  {
    id: "familia",
    name: "Família ❤️",
    tint: "stone",
    isGroup: true,
    members: ["Você", "Mãe", "Pai", "Júlia", "Vovó"],
    time: "Ontem",
    unread: 12,
    muted: true,
    conversation: [
      {
        label: "Ontem",
        messages: [
          {
            id: "f-1",
            fromMe: false,
            author: "Mãe",
            text: "Almoço domingo lá em casa, quem vem? 🍝",
            time: "12:30",
          },
          {
            id: "f-2",
            fromMe: false,
            author: "Júlia",
            text: "Euuu! Levo a sobremesa 🍮",
            time: "12:41",
          },
          {
            id: "f-3",
            fromMe: true,
            text: "Tô dentro! Que horas?",
            time: "13:02",
            status: "delivered",
          },
        ],
      },
    ],
  },
  {
    id: "mariana",
    name: "Mariana Costa",
    tint: "gray",
    favourite: true,
    presence: "visto por último ontem às 22:48",
    time: "Ontem",
    draft: "Depois te mando os arquivos",
    conversation: [
      {
        label: "Ontem",
        messages: [
          {
            id: "m-1",
            fromMe: false,
            text: "Obrigada pela ajuda de hoje, salvou meu dia!",
            time: "21:15",
          },
          {
            id: "m-2",
            fromMe: true,
            text: "Imagina 😄 qualquer coisa é só chamar.",
            time: "21:20",
            status: "read",
          },
        ],
      },
    ],
  },
  {
    id: "joao",
    name: "João Pedro",
    tint: "zinc",
    presence: "visto por último hoje às 07:32",
    time: "Ontem",
    conversation: [
      {
        label: "Ontem",
        messages: [
          {
            id: "j-1",
            fromMe: true,
            text: "Fechou o pagamento da conta?",
            time: "19:40",
            status: "read",
          },
          {
            id: "j-2",
            fromMe: false,
            text: "Fechei! Já te encaminhei o comprovante 📎",
            time: "19:52",
          },
        ],
      },
    ],
  },
  {
    id: "faculdade",
    name: "Faculdade 2026",
    tint: "slate",
    isGroup: true,
    members: ["Você", "Bruno", "Camila", "Diego", "+18"],
    time: "Ter",
    muted: true,
    conversation: [
      {
        label: "Terça-feira",
        messages: [
          {
            id: "fac-1",
            fromMe: false,
            author: "Camila",
            text: "Gente, a entrega do trabalho foi adiada pra sexta 🎉",
            time: "15:22",
          },
          {
            id: "fac-2",
            fromMe: false,
            author: "Bruno",
            text: "Ufa, salvou!",
            time: "15:25",
          },
        ],
      },
    ],
  },
  {
    id: "suporte",
    name: "Suporte Técnico",
    tint: "neutral",
    presence: "geralmente responde na hora",
    time: "Seg",
    conversation: [
      {
        label: "Segunda-feira",
        messages: [
          {
            id: "s-1",
            fromMe: true,
            text: "Olá, meu pedido #4821 ainda não chegou.",
            time: "10:03",
            status: "read",
          },
          {
            id: "s-2",
            fromMe: false,
            text: "Olá! Verifiquei aqui e a entrega está prevista para amanhã até as 18h 📦",
            time: "10:07",
          },
        ],
      },
    ],
  },
]
