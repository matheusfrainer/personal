"use client"

import * as React from "react"

import { fingerprint, type InsightMap } from "@/lib/insights"
import { analyzeLocally } from "@/lib/insights-local"
import { useStore } from "@/lib/store"
import type { Chat } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

import { Icon } from "./icon"
import {
  AiIcon,
  PipelineIcon,
  SentimentIcon,
  SparklesIcon,
  SuggestIcon,
  SuitabilityIcon,
  WalletIcon,
} from "./icons"
import { PanelSection } from "./panel-section"

const SECTION_ICONS = {
  comunicacao: SparklesIcon,
  decisao: SentimentIcon,
  ips: SuitabilityIcon,
  oportunidade: WalletIcon,
  acoes: PipelineIcon,
} as const

export function AiTab({ chat }: { chat: Chat }) {
  const { state, dispatch } = useStore()
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const hash = React.useMemo(() => fingerprint(chat), [chat])
  const cached = state.insights[chat.id]
  const fresh = cached?.hash === hash

  // The local read is free and instant, so it renders immediately; the model
  // upgrade replaces it only once the user asks for it.
  const local = React.useMemo(() => analyzeLocally(chat), [chat])
  const data: InsightMap = fresh ? (cached.data as InsightMap) : local
  const fromModel = fresh && !cached.local

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const payload = (await res.json()) as
        { ok: true; data: InsightMap } | { ok: false; reason: string }
      if (!payload.ok) throw new Error(payload.reason)
      dispatch({
        type: "SET_INSIGHT",
        chatId: chat.id,
        insight: {
          hash,
          generatedAt: Date.now(),
          local: false,
          data: payload.data,
        },
      })
    } catch {
      // No key configured, offline, or the model declined — the heuristic
      // reading stays on screen, so the tab is never empty.
      setError(
        "Análise local. Configure ANTHROPIC_API_KEY para a leitura completa."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 pt-4">
        <Badge variant="outline">
          {fromModel ? "Claude Sonnet 5" : "Análise local"}
        </Badge>
        <span className="flex-1 text-[0.625rem] text-muted-foreground">
          {data.sampled} mensagens lidas
        </span>
        <Button
          variant="ghost"
          size="xs"
          disabled={loading}
          onClick={refresh}
          aria-label="Atualizar análise"
        >
          {loading ? <Spinner /> : <Icon icon={AiIcon} />}
          {fresh && fromModel ? "Atualizar" : "Analisar"}
        </Button>
      </div>
      {error ? (
        <p className="px-4 pt-1.5 text-[0.625rem] text-muted-foreground">
          {error}
        </p>
      ) : null}

      {data.sections.map((section, index) => (
        <React.Fragment key={section.id}>
          {index > 0 ? <Separator /> : null}
          <PanelSection
            icon={SECTION_ICONS[section.id] ?? AiIcon}
            title={section.title}
          >
            <dl className="space-y-1.5">
              {section.items.map((item) => (
                <div key={item.label} className="flex gap-2 text-xs">
                  <dt className="w-24 shrink-0 text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="min-w-0 flex-1">
                    {item.value}
                    {item.detail ? (
                      <span className="block text-[0.625rem] text-muted-foreground">
                        {item.detail}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
            {section.summary ? (
              <p className="mt-2.5 text-[0.6875rem]/relaxed text-muted-foreground">
                {section.summary}
              </p>
            ) : null}
            {/* Every block says what it's for — a reading with no use is trivia. */}
            <p className="mt-2.5 border-t border-border pt-2 text-[0.625rem] text-muted-foreground">
              {section.action}
            </p>
          </PanelSection>
        </React.Fragment>
      ))}

      <Separator />

      <PanelSection icon={SuggestIcon} title="Sugestões de resposta">
        <div className="flex flex-col gap-1.5">
          {data.suggestions.map((suggestion) => (
            <button
              key={suggestion.text}
              type="button"
              onClick={() =>
                dispatch({
                  type: "SUGGEST_TEXT",
                  chatId: chat.id,
                  text: suggestion.text,
                })
              }
              className="rounded-md border border-border px-2.5 py-2 text-left text-xs/relaxed transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              {suggestion.text}
              {suggestion.rationale ? (
                <span className="mt-1 block text-[0.625rem] text-muted-foreground">
                  {suggestion.rationale}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[0.625rem] text-muted-foreground">
          Clique para levar à caixa de mensagem.
        </p>
      </PanelSection>
    </div>
  )
}
