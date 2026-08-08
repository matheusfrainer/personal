"use client"

import * as React from "react"

import { triggerLabels } from "@/lib/crm"
import { nextId } from "@/lib/id"
import type { AutomationRule, AutomationTrigger } from "@/lib/types"
import { Button } from "@/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const TRIGGERS: AutomationTrigger[] = [
  "aniversario",
  "nps",
  "suitability",
  "sem-resposta",
  "sem-contato",
  "palavra-chave",
  "mudanca-etapa",
  "nova-mensagem",
]

/** Which triggers need a day count, and what the number means for each. */
const DAY_LABEL: Partial<Record<AutomationTrigger, string>> = {
  nps: "Dias desde a última pesquisa",
  suitability: "Avisar quantos dias antes de vencer",
  "sem-resposta": "Dias sem resposta",
  "sem-contato": "Dias sem contato",
}

function emptyRule(chatId?: string): AutomationRule {
  return {
    id: nextId(),
    name: "",
    description: "",
    trigger: "sem-resposta",
    config: { days: 3 },
    message: "Oi {primeiro_nome}, ",
    sendAt: "09:00",
    scope: chatId ? "local" : "global",
    chatId,
    enabled: true,
  }
}

/**
 * Rule editor. When an existing *global* rule is edited from inside a
 * contact's panel, saving asks whether the change is for everyone or just this
 * person — the second option forks a local copy instead of silently changing
 * the rule for every contact that shares it.
 */
export function AutomationDialog({
  rule,
  open,
  onOpenChange,
  chatId,
  onSave,
  onFork,
}: {
  rule: AutomationRule | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** set when editing from a contact's panel */
  chatId?: string
  onSave: (rule: AutomationRule) => void
  onFork?: (rule: AutomationRule) => void
}) {
  const [draft, setDraft] = React.useState<AutomationRule>(emptyRule(chatId))
  const [seen, setSeen] = React.useState<AutomationRule | null>(null)
  const [asking, setAsking] = React.useState(false)

  if (open && seen !== rule) {
    setSeen(rule)
    setDraft(rule ?? emptyRule(chatId))
    setAsking(false)
  }

  // Only an existing global rule edited from a contact needs the scope prompt.
  const needsScopeChoice =
    Boolean(chatId) && rule?.scope === "global" && Boolean(onFork)

  const dayLabel = DAY_LABEL[draft.trigger]
  const valid = draft.name.trim().length > 0 && draft.message.trim().length > 0

  function submit() {
    if (needsScopeChoice) return setAsking(true)
    onSave(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {rule ? "Editar automação" : "Nova automação"}
          </DialogTitle>
          <DialogDescription>
            Quando o gatilho bate, a ação entra na Agenda para você aprovar.
          </DialogDescription>
        </DialogHeader>

        {asking ? (
          <div className="space-y-2">
            <p className="text-xs/relaxed">
              Esta regra é da biblioteca geral e vale para outras pessoas. Como
              você quer salvar?
            </p>
            <Button
              className="w-full justify-start"
              variant="outline"
              size="sm"
              onClick={() => {
                onSave(draft)
                onOpenChange(false)
              }}
            >
              Salvar para todos
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              size="sm"
              onClick={() => {
                onFork?.({
                  ...draft,
                  id: nextId(),
                  scope: "local",
                  chatId,
                })
                onOpenChange(false)
              }}
            >
              Salvar só para esta pessoa
            </Button>
            <p className="text-[0.625rem] text-muted-foreground">
              A segunda opção cria uma cópia e desliga a regra geral aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="rule-name">Nome</Label>
              <Input
                id="rule-name"
                value={draft.name}
                placeholder="Follow-up de proposta"
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {/* Eight options is a list, not a chip row — and picking one is
                what Select is for. */}
            <div className="space-y-1">
              <Label htmlFor="rule-trigger">Gatilho</Label>
              <Select
                value={draft.trigger}
                onValueChange={(value) =>
                  setDraft({ ...draft, trigger: value as AutomationTrigger })
                }
              >
                <SelectTrigger id="rule-trigger" size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map((trigger) => (
                    <SelectItem key={trigger} value={trigger}>
                      {triggerLabels[trigger]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {dayLabel ? (
              <div className="space-y-1">
                <Label htmlFor="rule-days">{dayLabel}</Label>
                <Input
                  id="rule-days"
                  type="number"
                  min={1}
                  value={draft.config.days ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      config: { ...draft.config, days: Number(e.target.value) },
                    })
                  }
                  className="h-8 text-xs tabular-nums"
                />
              </div>
            ) : null}

            {draft.trigger === "palavra-chave" ? (
              <div className="space-y-1">
                <Label htmlFor="rule-keyword">Palavra-chave</Label>
                <Input
                  id="rule-keyword"
                  value={draft.config.keyword ?? ""}
                  placeholder="resgate"
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      config: { ...draft.config, keyword: e.target.value },
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            ) : null}

            <div className="space-y-1">
              <Label htmlFor="rule-message">Mensagem</Label>
              <Textarea
                id="rule-message"
                value={draft.message}
                onChange={(e) =>
                  setDraft({ ...draft, message: e.target.value })
                }
                className="min-h-20 resize-none text-xs"
              />
              <p className="text-[0.625rem] text-muted-foreground">
                Variáveis: {"{primeiro_nome}"}, {"{nome}"}, {"{patrimonio}"},{" "}
                {"{etapa}"}
              </p>
            </div>

            <div className="space-y-1">
              <Label htmlFor="rule-time">Horário de envio</Label>
              <Input
                id="rule-time"
                type="time"
                value={draft.sendAt}
                onChange={(e) => setDraft({ ...draft, sendAt: e.target.value })}
                className="h-8 w-28 text-xs tabular-nums"
              />
            </div>
          </div>
        )}

        {asking ? null : (
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button size="sm" disabled={!valid} onClick={submit}>
              Salvar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
