"use client"

import * as React from "react"

import {
  crmOf,
  eventsOf,
  experienceLabels,
  formatCurrency,
  formatDate,
  horizonLabels,
  relationshipMeta,
  riskProfileLabels,
  stageMeta,
  stageOrder,
  suitabilityStatus,
} from "@/lib/crm"
import { nextId } from "@/lib/id"
import { totalsOf } from "@/lib/portfolio"
import { useStore } from "@/lib/store"
import type {
  Chat,
  CrmData,
  Experience,
  Horizon,
  InvestorProfile,
  PipelineStage,
  RiskProfile,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

import { CurrencyInput } from "./currency-input"
import {
  BirthdayIcon,
  CompanyIcon,
  ContributionIcon,
  MailIcon,
  MeetingIcon,
  NoteIcon,
  OwnerIcon,
  PhoneIcon,
  PipelineIcon,
  ProfessionIcon,
  SuitabilityIcon,
  TagIcon,
  TimelineIcon,
  ValueIcon,
} from "./icons"
import { PanelRow, PanelSection } from "./panel-section"
import { TagCombobox } from "./tag-combobox"

/** Text field that commits on blur, so the store isn't rewritten per keystroke. */
function Field({
  label,
  value,
  placeholder = "—",
  type = "text",
  onCommit,
}: {
  label: string
  value: string
  placeholder?: string
  type?: "text" | "email" | "date"
  onCommit: (value: string) => void
}) {
  const [draft, setDraft] = React.useState(value)
  const [seen, setSeen] = React.useState(value)
  if (seen !== value) {
    setSeen(value)
    setDraft(value)
  }
  return (
    <Input
      type={type}
      aria-label={label}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== value && onCommit(draft)}
      className="h-7 border-transparent bg-transparent px-1.5 text-xs hover:border-border focus-visible:border-ring"
    />
  )
}

/**
 * Chip row for choices worth seeing all at once — relationship and funnel
 * stage, where the whole ladder is the point. Form fields use Select instead.
 */
function ChipChoice<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { value: T; label: string }[]
  value?: T
  onSelect: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(option.value)}
            className="outline-none"
          >
            <Badge
              variant={active ? "default" : "outline"}
              className={cn("cursor-pointer", !active && "hover:bg-muted")}
            >
              {option.label}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}

/** Labelled single-choice field. */
function SelectField<T extends string>({
  id,
  label,
  options,
  value,
  placeholder,
  onSelect,
}: {
  id: string
  label: string
  options: { value: T; label: string }[]
  value?: T
  placeholder: string
  onSelect: (value: T) => void
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-[0.625rem] text-muted-foreground">
        {label}
      </Label>
      <Select value={value ?? ""} onValueChange={(v) => onSelect(v as T)}>
        <SelectTrigger id={id} size="sm" className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

/** Free-form list of short strings (objectives, restrictions). */
function ChipList({
  items,
  placeholder,
  onChange,
}: {
  items: string[]
  placeholder: string
  onChange: (items: string[]) => void
}) {
  const [draft, setDraft] = React.useState("")
  function add() {
    const value = draft.trim()
    if (!value || items.includes(value)) return setDraft("")
    onChange([...items, value])
    setDraft("")
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="pr-1">
            {item}
            <button
              type="button"
              aria-label={`Remover ${item}`}
              onClick={() => onChange(items.filter((i) => i !== item))}
              className="rounded-full px-1 opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <Input
        value={draft}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            add()
          }
        }}
        onBlur={add}
        className="mt-2 h-7 text-xs"
      />
    </div>
  )
}

export function ProfileTab({ chat }: { chat: Chat }) {
  const { state, dispatch } = useStore()
  const crm = crmOf(chat)
  const totals = totalsOf(chat)
  const now = React.useMemo(() => new Date(), [])

  const set = React.useCallback(
    (
      patch: Partial<CrmData>,
      event?: { type: "stage" | "profile"; label: string }
    ) => dispatch({ type: "SET_CRM", chatId: chat.id, patch, event }),
    [chat.id, dispatch]
  )

  const setProfile = React.useCallback(
    (patch: Partial<InvestorProfile>) =>
      set({ profile: { ...crm.profile, ...patch } }),
    [crm.profile, set]
  )

  // Notes are debounced like the composer draft — typing here would otherwise
  // rewrite the whole chat on every character.
  const [notes, setNotes] = React.useState(crm.notes ?? "")
  const [seenChat, setSeenChat] = React.useState(chat.id)
  if (seenChat !== chat.id) {
    setSeenChat(chat.id)
    setNotes(crm.notes ?? "")
  }
  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      if ((crm.notes ?? "") !== notes) set({ notes: notes || undefined })
    }, 400)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, chat.id])

  const suitability = suitabilityStatus(crm.profile, now)
  const isClient = crm.relationship === "cliente"
  const calls = state.calls.filter((c) => c.chatId === chat.id).length

  return (
    <div>
      {/* Relationship first: it decides whether the funnel is even relevant. */}
      <PanelSection icon={PipelineIcon} title="Relacionamento">
        <ChipChoice
          options={(["lead", "cliente", "inativo", "perdido"] as const).map(
            (r) => ({ value: r, label: relationshipMeta[r].label })
          )}
          value={crm.relationship}
          onSelect={(relationship) =>
            set(
              {
                relationship,
                clientSince:
                  relationship === "cliente" && !crm.clientSince
                    ? new Date().toISOString().slice(0, 10)
                    : crm.clientSince,
              },
              {
                type: "stage",
                label: `Relacionamento: ${relationshipMeta[relationship].label}`,
              }
            )
          }
        />

        {isClient ? (
          <div className="mt-3 space-y-1 rounded-md bg-muted/60 px-3 py-2.5">
            <p className="text-xs">
              Cliente desde{" "}
              <span className="font-medium">{formatDate(crm.clientSince)}</span>
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatCurrency(totals.auc)} sob sua gestão
              {totals.pipe > 0
                ? ` · ${formatCurrency(totals.pipe)} ainda fora`
                : ""}
            </p>
            {totals.pipe > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-1 h-7 w-full text-xs"
                onClick={() =>
                  set(
                    { relationship: "lead", stage: "contato" },
                    { type: "stage", label: "Nova captação aberta" }
                  )
                }
              >
                Iniciar nova captação
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1">
              {stageOrder.map((stage: PipelineStage) => {
                const active = crm.stage === stage
                return (
                  <button
                    key={stage}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      set(
                        { stage },
                        {
                          type: "stage",
                          label: `Etapa: ${stageMeta[stage].label}`,
                        }
                      )
                    }
                    className="outline-none"
                  >
                    <Badge
                      variant={active ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer",
                        !active && "hover:bg-muted"
                      )}
                    >
                      {stageMeta[stage].label}
                    </Badge>
                  </button>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Progress
                value={(stageMeta[crm.stage].step / 5) * 100}
                aria-label="Progresso no funil"
                className="flex-1 [&_[data-slot=progress-indicator]]:bg-foreground"
              />
              <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                {stageMeta[crm.stage].step}/5
              </span>
            </div>
          </>
        )}
      </PanelSection>

      <Separator />

      <PanelSection
        icon={TagIcon}
        title="Tags"
        action={
          crm.tags.length ? (
            <span className="text-[0.625rem] text-muted-foreground">
              {crm.tags.length}
            </span>
          ) : null
        }
      >
        <TagCombobox tags={crm.tags} onChange={(tags) => set({ tags })} />
      </PanelSection>

      <Separator />

      <PanelSection icon={CompanyIcon} title="Dados">
        <PanelRow icon={CompanyIcon} label="Empresa">
          <Field
            label="Empresa"
            value={crm.company ?? ""}
            onCommit={(v) => set({ company: v || undefined })}
          />
        </PanelRow>
        <PanelRow icon={MailIcon} label="E-mail">
          <Field
            label="E-mail"
            type="email"
            value={crm.email ?? ""}
            onCommit={(v) => set({ email: v || undefined })}
          />
        </PanelRow>
        <PanelRow icon={OwnerIcon} label="Responsável">
          <Field
            label="Responsável"
            value={crm.owner ?? ""}
            onCommit={(v) => set({ owner: v || undefined })}
          />
        </PanelRow>
        {chat.phone ? (
          <PanelRow icon={PhoneIcon} label="Telefone">
            <span className="px-1.5">{chat.phone}</span>
          </PanelRow>
        ) : null}
      </PanelSection>

      <Separator />

      {/* The standardised interview. Same fields for everyone, so two
          contacts are actually comparable. */}
      <PanelSection icon={SuitabilityIcon} title="Perfil do investidor">
        <PanelRow icon={BirthdayIcon} label="Nascimento">
          <Field
            label="Data de nascimento"
            type="date"
            value={crm.profile.birthDate ?? ""}
            onCommit={(v) => setProfile({ birthDate: v || undefined })}
          />
        </PanelRow>
        <PanelRow icon={ProfessionIcon} label="Profissão">
          <Field
            label="Profissão"
            value={crm.profile.profession ?? ""}
            onCommit={(v) => setProfile({ profession: v || undefined })}
          />
        </PanelRow>
        <PanelRow icon={ContributionIcon} label="Aporte/mês">
          <CurrencyInput
            aria-label="Aporte mensal"
            value={crm.profile.monthlyContribution}
            onCommit={(monthlyContribution) =>
              setProfile({ monthlyContribution })
            }
          />
        </PanelRow>
        <PanelRow icon={SuitabilityIcon} label="Suitability">
          <Field
            label="Data da suitability"
            type="date"
            value={crm.profile.suitabilityDate ?? ""}
            onCommit={(v) => setProfile({ suitabilityDate: v || undefined })}
          />
        </PanelRow>
        {suitability ? (
          <p
            className={cn(
              "mt-1 text-[0.625rem]",
              suitability.daysLeft <= 30
                ? "text-destructive"
                : "text-muted-foreground"
            )}
          >
            {suitability.daysLeft < 0
              ? `Vencida desde ${formatDate(suitability.expiresAt)}`
              : `Vence em ${suitability.daysLeft} dias (${formatDate(suitability.expiresAt)})`}
          </p>
        ) : null}

        <div className="mt-3 space-y-2.5">
          <SelectField
            id="perfil-risco"
            label="Perfil de risco"
            placeholder="Não definido"
            options={(["conservador", "moderado", "arrojado"] as const).map(
              (r) => ({ value: r as RiskProfile, label: riskProfileLabels[r] })
            )}
            value={crm.profile.riskProfile}
            onSelect={(riskProfile) => setProfile({ riskProfile })}
          />
          <SelectField
            id="perfil-horizonte"
            label="Horizonte"
            placeholder="Não definido"
            options={(["curto", "medio", "longo"] as const).map((h) => ({
              value: h as Horizon,
              label: horizonLabels[h],
            }))}
            value={crm.profile.horizon}
            onSelect={(horizon) => setProfile({ horizon })}
          />
          <SelectField
            id="perfil-experiencia"
            label="Experiência"
            placeholder="Não informada"
            options={(
              ["iniciante", "intermediario", "experiente"] as const
            ).map((e) => ({
              value: e as Experience,
              label: experienceLabels[e],
            }))}
            value={crm.profile.experience}
            onSelect={(experience) => setProfile({ experience })}
          />
          <div>
            <p className="mb-1 text-[0.625rem] text-muted-foreground">
              Objetivos
            </p>
            <ChipList
              items={crm.profile.objectives}
              placeholder="Adicionar objetivo"
              onChange={(objectives) => setProfile({ objectives })}
            />
          </div>
          <div>
            <p className="mb-1 text-[0.625rem] text-muted-foreground">
              Restrições
            </p>
            <ChipList
              items={crm.profile.restrictions}
              placeholder="Adicionar restrição"
              onChange={(restrictions) => setProfile({ restrictions })}
            />
          </div>
          <PanelRow label="Liquidez">
            <Field
              label="Necessidade de liquidez"
              value={crm.profile.liquidityNeed ?? ""}
              onCommit={(v) => setProfile({ liquidityNeed: v || undefined })}
            />
          </PanelRow>
          <PanelRow icon={ValueIcon} label="NPS">
            <span className="px-1.5 text-xs">
              {crm.profile.npsScore != null
                ? `${crm.profile.npsScore}/10 · ${formatDate(crm.profile.npsDate)}`
                : "nunca pesquisado"}
            </span>
          </PanelRow>
        </div>
      </PanelSection>

      <Separator />

      <PanelSection
        icon={MeetingIcon}
        title="Reuniões"
        action={
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              set(
                {
                  meetings: [
                    {
                      id: nextId(),
                      date: new Date().toISOString().slice(0, 10),
                      title: "Nova reunião",
                      summary: "",
                      actionItems: [],
                    },
                    ...crm.meetings,
                  ],
                },
                { type: "profile", label: "Reunião registrada" }
              )
            }
          >
            Registrar
          </Button>
        }
      >
        {crm.meetings.length ? (
          <ol className="space-y-3">
            {crm.meetings.map((meeting) => (
              <li
                key={meeting.id}
                className="rounded-md border border-border p-2.5"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <Field
                    label="Título da reunião"
                    value={meeting.title}
                    onCommit={(title) =>
                      set({
                        meetings: crm.meetings.map((m) =>
                          m.id === meeting.id ? { ...m, title } : m
                        ),
                      })
                    }
                  />
                  <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                    {formatDate(meeting.date)}
                  </span>
                </div>
                <Textarea
                  value={meeting.summary}
                  placeholder="O que foi tratado…"
                  aria-label="Resumo da reunião"
                  onChange={(e) =>
                    set({
                      meetings: crm.meetings.map((m) =>
                        m.id === meeting.id
                          ? { ...m, summary: e.target.value }
                          : m
                      ),
                    })
                  }
                  className="mt-1.5 min-h-14 resize-none text-xs"
                />
                {meeting.actionItems.length ? (
                  <ul className="mt-1.5 space-y-0.5">
                    {meeting.actionItems.map((item) => (
                      <li
                        key={item}
                        className="flex gap-1.5 text-[0.6875rem] text-muted-foreground"
                      >
                        <span aria-hidden="true">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nenhuma reunião registrada.
          </p>
        )}
      </PanelSection>

      <Separator />

      <PanelSection icon={NoteIcon} title="Observações">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="O que não cabe em campo…"
          aria-label="Observações"
          className="min-h-20 resize-none text-xs"
        />
      </PanelSection>

      <Separator />

      {/* Deliberately not a copy of the transcript: only things that happened
          outside the conversation land here. */}
      <PanelSection icon={TimelineIcon} title="Histórico">
        {eventsOf(chat).length ? (
          <ol className="space-y-2.5">
            {eventsOf(chat)
              .slice(0, 8)
              .map((event) => (
                <li key={event.id} className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="truncate">{event.label}</span>
                      <span className="shrink-0 text-[0.625rem] text-muted-foreground">
                        {new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        }).format(event.at)}
                      </span>
                    </p>
                    {event.detail ? (
                      <p className="truncate text-[0.6875rem] text-muted-foreground">
                        {event.detail}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground">
            Nada registrado ainda. Mudanças de etapa, aportes e automações
            executadas aparecem aqui — a conversa em si fica ao lado.
          </p>
        )}
        {calls > 0 ? (
          <p className="mt-2 text-[0.625rem] text-muted-foreground">
            {calls} chamada{calls > 1 ? "s" : ""} no histórico de ligações.
          </p>
        ) : null}
      </PanelSection>
    </div>
  )
}
