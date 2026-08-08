"use client"

import * as React from "react"
import { toast } from "sonner"

import { automationsFor } from "@/lib/automation-engine"
import { triggerLabels } from "@/lib/crm"
import { nextId } from "@/lib/id"
import { useStore } from "@/lib/store"
import type { AutomationRule, Chat } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { AutomationDialog } from "./automation-dialog"
import { Icon } from "./icon"
import {
  AutomationIcon,
  DeleteIcon,
  DuplicateIcon,
  EditIcon,
  MoreIcon,
  PlusIcon,
  PublishIcon,
} from "./icons"
import { PanelSection } from "./panel-section"

export function AutomationsTab({ chat }: { chat: Chat }) {
  const { state, dispatch } = useStore()
  const [editing, setEditing] = React.useState<AutomationRule | null>(null)
  const [open, setOpen] = React.useState(false)

  const rules = automationsFor(chat, state.automations)
  const active = rules.filter((r) => r.on).length

  function edit(rule: AutomationRule | null) {
    setEditing(rule)
    setOpen(true)
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-3">
        <p className="flex-1 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
          Regras aplicadas
        </p>
        <Badge variant="outline">
          {active}/{rules.length} ativas
        </Badge>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Nova automação"
          onClick={() => edit(null)}
        >
          <Icon icon={PlusIcon} />
        </Button>
      </div>

      <Separator />

      {rules.length ? (
        rules.map(({ rule, on }, index) => (
          <React.Fragment key={rule.id}>
            {index > 0 ? <Separator /> : null}
            <div className="flex items-start gap-3 px-4 py-3">
              <Icon
                icon={AutomationIcon}
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm">
                  <span className="truncate">{rule.name}</span>
                  {rule.scope === "local" ? (
                    <Badge variant="outline">só aqui</Badge>
                  ) : null}
                </p>
                <p className="text-xs text-muted-foreground">
                  {rule.description || rule.message}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">
                    {triggerLabels[rule.trigger]}
                  </Badge>
                  <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                    envia {rule.sendAt}
                  </span>
                  {rule.lastRun ? (
                    <span className="text-[0.625rem] text-muted-foreground">
                      · última: {rule.lastRun}
                    </span>
                  ) : null}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Opções de ${rule.name}`}
                  >
                    <Icon icon={MoreIcon} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onSelect={() => edit(rule)}>
                    <Icon icon={EditIcon} />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      dispatch({
                        type: "SAVE_AUTOMATION",
                        rule: {
                          ...rule,
                          id: nextId(),
                          name: `${rule.name} (cópia)`,
                          scope: "local",
                          chatId: chat.id,
                        },
                      })
                    }
                  >
                    <Icon icon={DuplicateIcon} />
                    Duplicar aqui
                  </DropdownMenuItem>
                  {rule.scope === "local" ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        dispatch({
                          type: "PUBLISH_AUTOMATION",
                          chatId: chat.id,
                          ruleId: rule.id,
                          applyAll: false,
                        })
                        toast("Automação publicada", {
                          description:
                            "Disponível na aba de todas as pessoas, desligada por padrão.",
                        })
                      }}
                    >
                      <Icon icon={PublishIcon} />
                      Tornar geral
                    </DropdownMenuItem>
                  ) : null}
                  {rule.scope === "local" ? (
                    <DropdownMenuItem
                      onSelect={() => {
                        dispatch({
                          type: "PUBLISH_AUTOMATION",
                          chatId: chat.id,
                          ruleId: rule.id,
                          applyAll: true,
                        })
                        toast("Automação publicada e aplicada", {
                          description:
                            "Ligada por padrão para todas as pessoas.",
                        })
                      }}
                    >
                      <Icon icon={PublishIcon} />
                      Tornar geral e aplicar a todos
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() =>
                      dispatch({
                        type: "DELETE_AUTOMATION",
                        ruleId: rule.id,
                        chatId: rule.scope === "local" ? chat.id : undefined,
                      })
                    }
                  >
                    <Icon icon={DeleteIcon} />
                    {rule.scope === "local" ? "Excluir" : "Excluir de todos"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Switch
                checked={on}
                aria-label={`Ativar ${rule.name}`}
                onCheckedChange={(value) =>
                  dispatch({
                    type: "TOGGLE_AUTOMATION",
                    chatId: chat.id,
                    automationId: rule.id,
                    value,
                  })
                }
              />
            </div>
          </React.Fragment>
        ))
      ) : (
        <PanelSection icon={AutomationIcon} title="Sem regras">
          <p className="text-xs text-muted-foreground">
            Nenhuma automação aplicada. Crie uma aqui ou monte a biblioteca
            geral em Automações, no menu lateral.
          </p>
        </PanelSection>
      )}

      <Separator />

      <p className="px-4 py-3 text-[0.625rem]/relaxed text-muted-foreground">
        Nada é enviado sozinho: quando um gatilho bate, a ação entra na Agenda
        para você aprovar. Depois de aprovada, sai no horário configurado
        enquanto esta aba estiver aberta.
      </p>

      <AutomationDialog
        rule={editing}
        open={open}
        onOpenChange={setOpen}
        chatId={chat.id}
        onSave={(rule) => dispatch({ type: "SAVE_AUTOMATION", rule })}
        onFork={(rule) => {
          dispatch({ type: "SAVE_AUTOMATION", rule })
          if (editing) {
            dispatch({
              type: "TOGGLE_AUTOMATION",
              chatId: chat.id,
              automationId: editing.id,
              value: false,
            })
          }
        }}
      />
    </div>
  )
}
