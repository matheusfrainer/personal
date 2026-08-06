import { placeholderPhoto, waveform } from "./media"
import { stripFormatting } from "./format"
import type {
  AvatarTint,
  CallEntry,
  Chat,
  Community,
  Message,
} from "./types"

/**
 * Neutral avatar tints — intentionally low-chroma so the UI stays inside the
 * Neutral theme while still letting contacts be told apart.
 */
export const avatarTints: Record<AvatarTint, string> = {
  neutral:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-100",
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

/** Latest message in a chat, used for list previews. */
export function lastMessage(chat: Chat): Message | undefined {
  for (let d = chat.conversation.length - 1; d >= 0; d--) {
    const day = chat.conversation[d]
    if (day.messages.length) return day.messages[day.messages.length - 1]
  }
  return undefined
}

/** Flatten a conversation, e.g. to resolve a reply or run a search. */
export function allMessages(chat: Chat): Message[] {
  return chat.conversation.flatMap((d) => d.messages)
}

export function findMessage(chat: Chat, id: string): Message | undefined {
  return allMessages(chat).find((m) => m.id === id)
}

/** One-line summary of any message type, for previews and reply blocks. */
export function messagePreview(message: Message): string {
  if (message.deleted) return "Esta mensagem foi apagada"
  switch (message.type) {
    case "text":
      return stripFormatting(message.text)
    case "image":
      return message.caption ? `📷 ${message.caption}` : "📷 Foto"
    case "video":
      return message.caption ? `🎥 ${message.caption}` : "🎥 Vídeo"
    case "audio":
      return message.voice ? "🎤 Mensagem de voz" : "🎵 Áudio"
    case "document":
      return `📄 ${message.filename}`
    case "sticker":
      return "Figurinha"
    case "location":
      return `📍 ${message.label}`
    case "contact":
      return `👤 ${message.contactName}`
    case "system":
      return message.text
  }
}

export const chats: Chat[] = [
  {
    id: "ana",
    name: "Ana Beatriz",
    tint: "slate",
    online: true,
    presence: "online",
    phone: "+55 11 98123-4567",
    about: "Designer de produto ✦ café e tipografia",
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
            type: "text",
            fromMe: false,
            text: "Oi! Você já viu o novo protótipo no Figma?",
            time: "18:02",
          },
          {
            id: "ana-2",
            type: "text",
            fromMe: true,
            text: "Vi sim, ficou *incrível* 👏",
            time: "18:05",
            status: "read",
            reactions: [{ emoji: "❤️", by: ["Ana Beatriz"] }],
          },
          {
            id: "ana-3",
            type: "text",
            fromMe: true,
            text: "Só acho que a home ainda pode respirar mais.",
            time: "18:05",
            status: "read",
          },
          {
            id: "ana-4",
            type: "image",
            fromMe: false,
            url: placeholderPhoto(7),
            caption: "Olha como ficou o topo agora",
            time: "18:20",
          },
        ],
      },
      {
        label: "Hoje",
        messages: [
          {
            id: "ana-5",
            type: "text",
            fromMe: false,
            text: "Bom dia ☀️ Consegui ajustar os espaçamentos ontem à noite.",
            time: "09:41",
          },
          {
            id: "ana-6",
            type: "audio",
            fromMe: false,
            duration: 27,
            waveform: waveform(3),
            voice: true,
            time: "09:44",
          },
          {
            id: "ana-7",
            type: "text",
            fromMe: false,
            text: "Dá uma olhada quando puder e me fala o que achou?",
            time: "09:47",
            replyToId: "ana-3",
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
    about: "Squad de design do produto",
    time: "09:31",
    unread: 5,
    pinned: true,
    typing: true,
    conversation: [
      {
        label: "Hoje",
        messages: [
          {
            id: "d-0",
            type: "system",
            fromMe: false,
            text: "Rafael adicionou Lucas",
            time: "09:05",
          },
          {
            id: "d-1",
            type: "text",
            fromMe: false,
            author: "Rafael",
            text: "Pessoal, subi a nova versão do design system no repositório.",
            time: "09:12",
            reactions: [
              { emoji: "🔥", by: ["Marina", "Lucas"] },
              { emoji: "👏", by: ["Você"] },
            ],
          },
          {
            id: "d-2",
            type: "document",
            fromMe: false,
            author: "Rafael",
            filename: "design-system-v4.pdf",
            size: "3,4 MB",
            pages: 42,
            ext: "PDF",
            time: "09:13",
          },
          {
            id: "d-3",
            type: "text",
            fromMe: false,
            author: "Marina",
            text: "Massa! Os tokens de cor já estão no formato do shadcn?",
            time: "09:14",
          },
          {
            id: "d-4",
            type: "text",
            fromMe: true,
            text: "Estão sim, migrei tudo pra CSS variables ontem.",
            time: "09:20",
            status: "read",
            replyToId: "d-3",
          },
          {
            id: "d-5",
            type: "text",
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
    phone: "+55 11 97654-3210",
    about: "Disponível",
    time: "08:10",
    conversation: [
      {
        label: "Hoje",
        messages: [
          {
            id: "c-1",
            type: "text",
            fromMe: true,
            text: "Bom dia, Carlos! Confirmamos a reunião das 14h?",
            time: "08:04",
            status: "read",
          },
          {
            id: "c-2",
            type: "text",
            fromMe: false,
            text: "Bom dia! Confirmado sim 👍",
            time: "08:09",
          },
          {
            id: "c-3",
            type: "location",
            fromMe: false,
            label: "Av. Paulista, 1000",
            address: "Bela Vista, São Paulo - SP",
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
    about: "A melhor família do mundo",
    time: "Ontem",
    unread: 12,
    muted: true,
    conversation: [
      {
        label: "Ontem",
        messages: [
          {
            id: "f-1",
            type: "text",
            fromMe: false,
            author: "Mãe",
            text: "Almoço domingo lá em casa, quem vem? 🍝",
            time: "12:30",
            pinned: true,
            reactions: [{ emoji: "🎉", by: ["Júlia", "Você", "Pai"] }],
          },
          {
            id: "f-2",
            type: "text",
            fromMe: false,
            author: "Júlia",
            text: "Euuu! Levo a sobremesa 🍮",
            time: "12:41",
          },
          {
            id: "f-3",
            type: "image",
            fromMe: false,
            author: "Júlia",
            url: placeholderPhoto(21),
            caption: "Testei essa receita ontem",
            time: "12:43",
          },
          {
            id: "f-4",
            type: "text",
            fromMe: false,
            author: "Pai",
            text: "",
            time: "12:50",
            deleted: true,
          },
          {
            id: "f-5",
            type: "text",
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
    phone: "+55 21 99876-5432",
    about: "Ocupada",
    time: "Ontem",
    draft: "Depois te mando os arquivos",
    conversation: [
      {
        label: "Ontem",
        messages: [
          {
            id: "m-1",
            type: "text",
            fromMe: false,
            text: "Obrigada pela ajuda de hoje, salvou meu dia!",
            time: "21:15",
          },
          {
            id: "m-2",
            type: "text",
            fromMe: true,
            text: "Imagina 😄 qualquer coisa é só chamar.",
            time: "21:20",
            status: "read",
          },
          {
            id: "m-3",
            type: "sticker",
            fromMe: false,
            emoji: "🥰",
            time: "21:22",
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
    phone: "+55 11 96543-2109",
    time: "Ontem",
    conversation: [
      {
        label: "Ontem",
        messages: [
          {
            id: "j-1",
            type: "text",
            fromMe: true,
            text: "Fechou o pagamento da conta?",
            time: "19:40",
            status: "read",
          },
          {
            id: "j-2",
            type: "text",
            fromMe: false,
            text: "Fechei! Já te encaminhei o comprovante 📎",
            time: "19:52",
          },
          {
            id: "j-3",
            type: "document",
            fromMe: false,
            filename: "comprovante-2026-08.pdf",
            size: "184 KB",
            ext: "PDF",
            time: "19:52",
            forwarded: true,
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
    about: "Turma de 2026",
    time: "Ter",
    muted: true,
    conversation: [
      {
        label: "Terça-feira",
        messages: [
          {
            id: "fac-1",
            type: "text",
            fromMe: false,
            author: "Camila",
            text: "Gente, a entrega do trabalho foi adiada pra sexta 🎉",
            time: "15:22",
            reactions: [{ emoji: "🎉", by: ["Bruno", "Diego", "Você"] }],
          },
          {
            id: "fac-2",
            type: "text",
            fromMe: false,
            author: "Bruno",
            text: "Ufa, salvou!",
            time: "15:25",
          },
          {
            id: "fac-3",
            type: "text",
            fromMe: false,
            author: "Diego",
            text: "O material tá aqui: https://universidade.exemplo.br/materiais",
            time: "15:31",
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
            type: "text",
            fromMe: true,
            text: "Olá, meu pedido #4821 ainda não chegou.",
            time: "10:03",
            status: "read",
          },
          {
            id: "s-2",
            type: "text",
            fromMe: false,
            text: "Olá! Verifiquei aqui e a entrega está prevista para amanhã até as 18h 📦",
            time: "10:07",
          },
        ],
      },
    ],
  },
  {
    id: "antigo",
    name: "Grupo do Trabalho Antigo",
    tint: "gray",
    isGroup: true,
    members: ["Você", "Paula", "Ricardo", "+7"],
    time: "12/07",
    archived: true,
    conversation: [
      {
        label: "12 de julho",
        messages: [
          {
            id: "an-1",
            type: "text",
            fromMe: false,
            author: "Paula",
            text: "Pessoal, foi ótimo trabalhar com vocês! 💙",
            time: "17:40",
          },
        ],
      },
    ],
  },
  {
    id: "promocoes",
    name: "Promoções Loja X",
    tint: "stone",
    presence: "conta comercial",
    time: "08/07",
    archived: true,
    muted: true,
    conversation: [
      {
        label: "8 de julho",
        messages: [
          {
            id: "pr-1",
            type: "text",
            fromMe: false,
            text: "Aproveite 30% de desconto nesta semana!",
            time: "09:00",
          },
        ],
      },
    ],
  },
]

export const calls: CallEntry[] = [
  {
    id: "call-1",
    chatId: "ana",
    name: "Ana Beatriz",
    tint: "slate",
    kind: "video",
    direction: "incoming",
    time: "Hoje, 09:12",
    duration: "24 min",
  },
  {
    id: "call-2",
    chatId: "carlos",
    name: "Carlos Eduardo",
    tint: "neutral",
    kind: "voice",
    direction: "outgoing",
    time: "Hoje, 08:02",
    duration: "6 min",
  },
  {
    id: "call-3",
    chatId: "mariana",
    name: "Mariana Costa",
    tint: "gray",
    kind: "voice",
    direction: "missed",
    time: "Ontem, 21:04",
  },
  {
    id: "call-4",
    chatId: "design",
    name: "Time de Design",
    tint: "zinc",
    kind: "video",
    direction: "outgoing",
    time: "Ontem, 15:30",
    duration: "51 min",
  },
  {
    id: "call-5",
    chatId: "joao",
    name: "João Pedro",
    tint: "zinc",
    kind: "voice",
    direction: "incoming",
    time: "Segunda, 11:20",
    duration: "2 min",
  },
  {
    id: "call-6",
    chatId: "familia",
    name: "Família ❤️",
    tint: "stone",
    kind: "video",
    direction: "missed",
    time: "Domingo, 19:45",
  },
]

export const communities: Community[] = [
  {
    id: "com-1",
    name: "Condomínio Jardins",
    tint: "neutral",
    description:
      "Comunidade dos moradores do condomínio. Avisos oficiais no mural.",
    members: 214,
    groupIds: ["design", "familia"],
    announcements: [
      {
        id: "an-1",
        author: "Síndico",
        text: "A manutenção do elevador social acontece nesta quinta, das 8h às 12h.",
        time: "09:10",
      },
      {
        id: "an-2",
        author: "Administração",
        text: "A assembleia de agosto foi remarcada para o dia 20.",
        time: "Ontem",
      },
    ],
  },
  {
    id: "com-2",
    name: "Escola Monteiro Lobato",
    tint: "slate",
    description: "Comunicados da escola e grupos por turma.",
    members: 486,
    groupIds: ["faculdade"],
    announcements: [
      {
        id: "an-3",
        author: "Coordenação",
        text: "As matrículas para o próximo semestre abrem na segunda-feira.",
        time: "Ter",
      },
    ],
  },
]
