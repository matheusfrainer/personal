"use client"

import * as React from "react"

import { crmOf, formatCurrency, stageMeta, stageOrder } from "@/lib/crm"
import {
  byInstitution,
  byProduct,
  concentration,
  totalsAcross,
  totalsOf,
} from "@/lib/portfolio"
import { useStore } from "@/lib/store"
import type { Chat } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CurrencyInput } from "../currency-input"
import { Icon } from "../icon"
import { AllocationIcon, GoalIcon } from "../icons"
import { BarRow, StatCard, WorkspaceShell } from "./workspace-shell"

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="px-4 py-4">
      <h2 className="text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {hint ? (
        <p className="mt-0.5 text-[0.625rem] text-muted-foreground">{hint}</p>
      ) : null}
      <div className="mt-2.5">{children}</div>
    </section>
  )
}

function Overview({ chats }: { chats: Chat[] }) {
  const totals = totalsAcross(chats)
  const outside = byInstitution(chats, true)
  const products = byProduct(chats)
  const top = concentration(chats)

  return (
    <div>
      <div className="grid gap-3 px-4 py-4 sm:grid-cols-3">
        <StatCard
          label="Sob sua gestão"
          value={formatCurrency(totals.auc)}
          emphasis
        />
        <StatCard
          label="Fora da casa"
          value={formatCurrency(totals.pipe)}
          hint={
            totals.netWorth
              ? `${Math.round((totals.pipe / totals.netWorth) * 100)}% do total mapeado`
              : undefined
          }
        />
        <StatCard
          label="Total mapeado"
          value={formatCurrency(totals.netWorth)}
        />
      </div>

      <Section
        title="Onde está o que não é seu"
        hint="Cada barra é uma instituição que ainda custodia dinheiro dos seus contatos."
      >
        {outside.length ? (
          outside.map((slice, i) => (
            <BarRow
              key={slice.label}
              label={slice.label}
              value={formatCurrency(slice.amount)}
              ratio={slice.ratio}
              index={i}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            Nenhuma posição fora da sua custódia cadastrada.
          </p>
        )}
      </Section>

      <Section title="Distribuição por produto">
        {products.length ? (
          products.map((slice, i) => (
            <BarRow
              key={slice.label}
              label={slice.label}
              value={formatCurrency(slice.amount)}
              ratio={slice.ratio}
              index={i}
            />
          ))
        ) : (
          <p className="text-xs text-muted-foreground">
            Cadastre o produto nas posições para ver a distribuição.
          </p>
        )}
      </Section>

      <Section
        title="Concentração"
        hint="Quanto da sua carteira depende de uma pessoa só."
      >
        {top.length ? (
          <ul className="space-y-1.5">
            {top.slice(0, 6).map(({ chat, auc, share }) => (
              <li
                key={chat.id}
                className="flex items-baseline justify-between gap-3 text-xs"
              >
                <span className="truncate">{chat.name}</span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {formatCurrency(auc)} · {Math.round(share * 100)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nenhum patrimônio sob gestão ainda.
          </p>
        )}
      </Section>
    </div>
  )
}

function Goals({ chats }: { chats: Chat[] }) {
  const { state, dispatch } = useStore()
  const now = React.useMemo(() => new Date(), [])

  // Funding this month = what became "cliente" in the current month, valued
  // at the assets that came under management with them.
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
  const captured = chats
    .filter((c) => {
      const crm = crmOf(c)
      return (
        crm.relationship === "cliente" &&
        crm.clientSince != null &&
        crm.clientSince >= monthStart
      )
    })
    .reduce((n, c) => n + totalsOf(c).auc, 0)

  // Null before hydration — the goal is persisted, so the server has no way to
  // know it. Rendering a guess here is what made the page rewrite itself.
  const goal = state.monthlyGoal
  const progress = goal && goal > 0 ? captured / goal : 0

  // Conversion per stage: how many leads sit at or past each step.
  const leads = chats.filter((c) => crmOf(c).relationship !== "perdido")
  const clients = chats.filter(
    (c) => crmOf(c).relationship === "cliente"
  ).length

  return (
    <div>
      <Section title="Captação do mês">
        <div className="max-w-md">
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(captured)}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            de {goal != null ? formatCurrency(goal) : "—"} ·{" "}
            {Math.round(progress * 100)}%
          </p>
          <Progress
            value={Math.min(100, progress * 100)}
            aria-label="Progresso da meta mensal"
            className="mt-2 h-2 [&_[data-slot=progress-indicator]]:bg-foreground"
          />
          <div className="mt-3 flex items-center gap-2">
            <Label htmlFor="meta-mensal">Meta mensal</Label>
            <CurrencyInput
              aria-label="Meta mensal"
              value={goal ?? undefined}
              onCommit={(value) =>
                dispatch({ type: "SET_GOAL", value: value ?? 0 })
              }
              className="w-40"
            />
          </div>
        </div>
      </Section>

      <Section
        title="Distribuição do funil"
        hint="Quantos contatos estão em cada etapa agora."
      >
        {stageOrder.map((stage, i) => {
          const count = leads.filter(
            (c) => crmOf(c).relationship === "lead" && crmOf(c).stage === stage
          ).length
          const max = Math.max(
            1,
            ...stageOrder.map(
              (s) =>
                leads.filter(
                  (c) =>
                    crmOf(c).relationship === "lead" && crmOf(c).stage === s
                ).length
            )
          )
          return (
            <BarRow
              key={stage}
              label={stageMeta[stage].label}
              value={String(count)}
              ratio={count / max}
              index={i}
            />
          )
        })}
        <p className="mt-2 text-xs text-muted-foreground">
          {clients} cliente{clients === 1 ? "" : "s"} ativo
          {clients === 1 ? "" : "s"} fora do funil.
        </p>
      </Section>
    </div>
  )
}

export function CarteirasView() {
  const { state } = useStore()
  const chats = state.chats.filter((c) => !c.isGroup && !c.archived)
  const totals = totalsAcross(chats)

  return (
    <WorkspaceShell
      title="Carteiras"
      description={cn(
        `${formatCurrency(totals.auc)} sob gestão · ${formatCurrency(totals.pipe)} a captar`
      )}
    >
      <Tabs defaultValue="visao" className="h-full gap-0">
        <div className="border-b border-border px-4 py-2">
          <TabsList>
            <TabsTrigger value="visao">
              <Icon icon={AllocationIcon} />
              Visão geral
            </TabsTrigger>
            <TabsTrigger value="metas">
              <Icon icon={GoalIcon} />
              Metas
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="visao">
          <Overview chats={chats} />
        </TabsContent>
        <TabsContent value="metas">
          <Goals chats={chats} />
        </TabsContent>
      </Tabs>
    </WorkspaceShell>
  )
}
