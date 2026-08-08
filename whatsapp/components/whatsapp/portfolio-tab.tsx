"use client"

import * as React from "react"

import { crmOf, formatCurrency } from "@/lib/crm"
import { nextId } from "@/lib/id"
import { totalsOf } from "@/lib/portfolio"
import { useStore } from "@/lib/store"
import type { Chat, Position } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { CurrencyInput } from "./currency-input"
import { Icon } from "./icon"
import {
  ChevronDownIcon,
  DeleteIcon,
  EditIcon,
  PlusIcon,
  ValueIcon,
  WalletIcon,
} from "./icons"
import { PanelSection, PanelStat } from "./panel-section"

const EMPTY: Position = {
  id: "",
  institution: "",
  amount: 0,
  underManagement: false,
}

/** Add/edit form for one holding. */
function PositionDialog({
  position,
  open,
  onOpenChange,
  onSave,
}: {
  position: Position | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (position: Position) => void
}) {
  const [draft, setDraft] = React.useState<Position>(EMPTY)
  const [seen, setSeen] = React.useState<Position | null>(null)
  if (open && seen !== position) {
    setSeen(position)
    setDraft(position ?? { ...EMPTY, id: nextId() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {position ? "Editar posição" : "Nova posição"}
          </DialogTitle>
          <DialogDescription>
            Onde o dinheiro está e se já passou para a sua custódia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="pos-instituicao">Instituição</Label>
            <Input
              id="pos-instituicao"
              value={draft.institution}
              placeholder="XP, Itaú, nossa casa…"
              onChange={(e) =>
                setDraft({ ...draft, institution: e.target.value })
              }
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label>Valor</Label>
            <CurrencyInput
              aria-label="Valor da posição"
              value={draft.amount || undefined}
              onCommit={(amount) => setDraft({ ...draft, amount: amount ?? 0 })}
              className="h-8"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="pos-produto">Produto</Label>
            <Input
              id="pos-produto"
              value={draft.product ?? ""}
              placeholder="CDB, fundo, previdência…"
              onChange={(e) => setDraft({ ...draft, product: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="pos-nota">Observação</Label>
            <Textarea
              id="pos-nota"
              value={draft.note ?? ""}
              placeholder="Vencimento, taxa, contexto…"
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              className="min-h-16 resize-none text-xs"
            />
          </div>

          <div className="flex items-center gap-3 rounded-md bg-muted/60 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs">Sob sua gestão</p>
              <p className="text-[0.625rem] text-muted-foreground">
                Desligado, entra no pipe.
              </p>
            </div>
            <Switch
              checked={draft.underManagement}
              aria-label="Sob sua gestão"
              onCheckedChange={(underManagement) =>
                setDraft({ ...draft, underManagement })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            disabled={!draft.institution.trim() || draft.amount <= 0}
            onClick={() => {
              onSave(draft)
              onOpenChange(false)
            }}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PortfolioTab({ chat }: { chat: Chat }) {
  const { dispatch } = useStore()
  const crm = crmOf(chat)
  const totals = totalsOf(chat)
  const [editing, setEditing] = React.useState<Position | null>(null)
  const [open, setOpen] = React.useState(false)

  function savePositions(positions: Position[], label: string) {
    dispatch({
      type: "SET_CRM",
      chatId: chat.id,
      patch: { positions },
      event: { type: "position", label },
    })
  }

  const outside = crm.positions.filter((p) => !p.underManagement)

  return (
    <div>
      <PanelSection icon={WalletIcon} title="Patrimônio">
        <div className="grid grid-cols-3 gap-2">
          <PanelStat
            label="Total"
            value={formatCurrency(totals.netWorth)}
            emphasis
          />
          <PanelStat label="Sob gestão" value={formatCurrency(totals.auc)} />
          <PanelStat
            label="Pipe"
            value={formatCurrency(totals.pipe)}
            hint={
              totals.netWorth
                ? `${Math.round((totals.pipe / totals.netWorth) * 100)}% fora`
                : undefined
            }
          />
        </div>

        {/* How much of the total is already yours. */}
        {totals.netWorth > 0 ? (
          <Progress
            value={Math.min(100, (totals.auc / totals.netWorth) * 100)}
            aria-label="Percentual sob sua gestão"
            className="mt-3 h-1.5 [&_[data-slot=progress-indicator]]:bg-foreground"
          />
        ) : null}

        <div className="mt-3">
          <p className="mb-1 text-[0.625rem] text-muted-foreground">
            Patrimônio declarado
          </p>
          <CurrencyInput
            aria-label="Patrimônio declarado"
            value={crm.declaredNetWorth}
            placeholder="Somar das posições"
            onCommit={(declaredNetWorth) =>
              dispatch({
                type: "SET_CRM",
                chatId: chat.id,
                patch: { declaredNetWorth },
              })
            }
          />
          <p className="mt-1 text-[0.625rem] text-muted-foreground">
            Use quando o investidor declara um total sem abrir todas as
            posições.
          </p>
        </div>
      </PanelSection>

      <Separator />

      <PanelSection
        icon={ValueIcon}
        title="Posições"
        action={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Adicionar posição"
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
          >
            <Icon icon={PlusIcon} />
          </Button>
        }
      >
        {crm.positions.length ? (
          <ol className="space-y-1.5">
            {crm.positions.map((position) => (
              <li key={position.id}>
                <Collapsible>
                  <div className="rounded-md border border-border">
                    <div className="flex items-center gap-2 px-2.5 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-1.5 text-xs">
                          <span className="truncate font-medium">
                            {position.institution}
                          </span>
                          {position.underManagement ? (
                            <Badge variant="secondary">sua</Badge>
                          ) : null}
                        </p>
                        <p className="truncate text-[0.6875rem] text-muted-foreground tabular-nums">
                          {formatCurrency(position.amount)}
                          {position.product ? ` · ${position.product}` : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Editar ${position.institution}`}
                        onClick={() => {
                          setEditing(position)
                          setOpen(true)
                        }}
                      >
                        <Icon icon={EditIcon} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remover ${position.institution}`}
                        onClick={() =>
                          savePositions(
                            crm.positions.filter((p) => p.id !== position.id),
                            `Posição removida · ${position.institution}`
                          )
                        }
                      >
                        <Icon icon={DeleteIcon} />
                      </Button>
                      {position.note ? (
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            aria-label="Ver observação"
                            className="group"
                          >
                            <Icon
                              icon={ChevronDownIcon}
                              className="transition-transform group-data-[state=open]:rotate-180"
                            />
                          </Button>
                        </CollapsibleTrigger>
                      ) : null}
                    </div>
                    {position.note ? (
                      <CollapsibleContent>
                        <p className="border-t border-border px-2.5 py-2 text-[0.6875rem] text-muted-foreground">
                          {position.note}
                        </p>
                      </CollapsibleContent>
                    ) : null}
                  </div>
                </Collapsible>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nenhuma posição cadastrada. Registre onde o dinheiro está —
            inclusive o que não está com você, que é o que vira pipe.
          </p>
        )}
      </PanelSection>

      {outside.length ? (
        <>
          <Separator />
          <PanelSection icon={WalletIcon} title="Fora da casa">
            <ul className="space-y-1">
              {outside.map((p) => (
                <li
                  key={p.id}
                  className={cn(
                    "flex items-baseline justify-between gap-2 text-xs"
                  )}
                >
                  <span className="truncate">{p.institution}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {formatCurrency(p.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </PanelSection>
        </>
      ) : null}

      <PositionDialog
        position={editing}
        open={open}
        onOpenChange={setOpen}
        onSave={(position) => {
          const exists = crm.positions.some((p) => p.id === position.id)
          savePositions(
            exists
              ? crm.positions.map((p) => (p.id === position.id ? position : p))
              : [...crm.positions, position],
            exists
              ? `Posição atualizada · ${position.institution}`
              : `Posição adicionada · ${position.institution}`
          )
        }}
      />
    </div>
  )
}
