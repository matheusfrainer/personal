"use client"

import * as React from "react"

import {
  chats as initialChats,
  type Chat,
  type Message,
  type MessageStatus,
} from "@/lib/data"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"

import { ChatList } from "./chat-list"
import { Conversation } from "./conversation"
import { EmptyConversation } from "./empty-conversation"

const REPLIES = [
  "Perfeito! 👍",
  "Boa, combinado então.",
  "Kkkk verdade 😄",
  "Vou verificar e já te falo.",
  "Show, obrigado! 🙏",
  "Entendi, faz total sentido.",
  "Fechou 🤝",
]

let idCounter = 0
function nextId() {
  idCounter += 1
  return `local-${idCounter}`
}

function nowTime() {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
}

/** Append a message to a chat, extending today's group or creating it. */
function addMessage(chats: Chat[], chatId: string, message: Message): Chat[] {
  return chats.map((chat) => {
    if (chat.id !== chatId) return chat
    const conversation = [...chat.conversation]
    const last = conversation[conversation.length - 1]
    if (last && last.label === "Hoje") {
      conversation[conversation.length - 1] = {
        ...last,
        messages: [...last.messages, message],
      }
    } else {
      conversation.push({ label: "Hoje", messages: [message] })
    }
    return {
      ...chat,
      conversation,
      time: message.time,
      draft: undefined,
    }
  })
}

function updateStatus(
  chats: Chat[],
  chatId: string,
  messageId: string,
  status: MessageStatus
): Chat[] {
  return chats.map((chat) => {
    if (chat.id !== chatId) return chat
    return {
      ...chat,
      conversation: chat.conversation.map((day) => ({
        ...day,
        messages: day.messages.map((m) =>
          m.id === messageId ? { ...m, status } : m
        ),
      })),
    }
  })
}

function setTyping(chats: Chat[], chatId: string, typing: boolean): Chat[] {
  return chats.map((chat) =>
    chat.id === chatId ? { ...chat, typing } : chat
  )
}

export function WhatsappApp() {
  const [chats, setChats] = React.useState<Chat[]>(initialChats)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  const selectedChat = chats.find((c) => c.id === selectedId) ?? null

  function handleSelect(id: string) {
    setSelectedId(id)
    setChats((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  function handleSend(text: string) {
    if (!selectedId) return
    const chatId = selectedId
    const chat = chats.find((c) => c.id === chatId)
    const messageId = nextId()

    const outgoing: Message = {
      id: messageId,
      fromMe: true,
      text,
      time: nowTime(),
      status: "sent",
    }
    setChats((cs) => addMessage(cs, chatId, outgoing))

    // Simulate delivery receipts.
    window.setTimeout(
      () => setChats((cs) => updateStatus(cs, chatId, messageId, "delivered")),
      700
    )
    window.setTimeout(
      () => setChats((cs) => updateStatus(cs, chatId, messageId, "read")),
      1500
    )

    // Simulate the other side typing and replying.
    window.setTimeout(() => setChats((cs) => setTyping(cs, chatId, true)), 1200)
    window.setTimeout(() => {
      const author = chat?.isGroup
        ? chat.members?.find((m) => m !== "Você" && !m.startsWith("+"))
        : undefined
      const reply: Message = {
        id: nextId(),
        fromMe: false,
        author,
        text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        time: nowTime(),
      }
      setChats((cs) => setTyping(addMessage(cs, chatId, reply), chatId, false))
    }, 2600)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-svh w-full overflow-hidden bg-muted/30 text-foreground">
        <aside
          className={cn(
            "h-full w-full shrink-0 border-r border-border md:w-[32%] md:min-w-[340px] md:max-w-[440px]",
            selectedId ? "hidden md:block" : "block"
          )}
        >
          <ChatList
            chats={chats}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </aside>

        <main
          className={cn(
            "h-full min-w-0 flex-1",
            selectedId ? "block" : "hidden md:block"
          )}
        >
          {selectedChat ? (
            <Conversation
              chat={selectedChat}
              onBack={() => setSelectedId(null)}
              onSend={handleSend}
            />
          ) : (
            <EmptyConversation />
          )}
        </main>
      </div>
    </TooltipProvider>
  )
}
