import type {
  AutomationRule,
  AutomationTrigger,
  Chat,
  CrmData,
  CrmEvent,
  Experience,
  Horizon,
  InvestorProfile,
  PipelineStage,
  Relationship,
  RiskProfile,
} from "./types"

/**
 * Prospecting funnel, in order. `step` drives the progress bar; the palette is
 * deliberately neutral — this theme is low-chroma end to end, so weight and
 * muted/foreground carry the emphasis instead of hue.
 */
export const stageMeta: Record<
  PipelineStage,
  { label: string; step: number; tone: string }
> = {
  novo: { label: "Novo", step: 1, tone: "text-muted-foreground" },
  contato: { label: "Contato", step: 2, tone: "text-muted-foreground" },
  reuniao: { label: "Reunião", step: 3, tone: "text-foreground" },
  proposta: { label: "Proposta", step: 4, tone: "text-foreground" },
  abertura: { label: "Abertura", step: 5, tone: "text-foreground font-medium" },
}

export const stageOrder: PipelineStage[] = [
  "novo",
  "contato",
  "reuniao",
  "proposta",
  "abertura",
]

export const relationshipMeta: Record<
  Relationship,
  { label: string; tone: string }
> = {
  lead: { label: "Lead", tone: "text-muted-foreground" },
  cliente: { label: "Cliente", tone: "text-foreground font-medium" },
  inativo: { label: "Inativo", tone: "text-muted-foreground" },
  perdido: { label: "Perdido", tone: "text-destructive" },
}

export const relationshipOrder: Relationship[] = [
  "lead",
  "cliente",
  "inativo",
  "perdido",
]

export const riskProfileLabels: Record<RiskProfile, string> = {
  conservador: "Conservador",
  moderado: "Moderado",
  arrojado: "Arrojado",
}

export const horizonLabels: Record<Horizon, string> = {
  curto: "Curto prazo",
  medio: "Médio prazo",
  longo: "Longo prazo",
}

export const experienceLabels: Record<Experience, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  experiente: "Experiente",
}

export const triggerLabels: Record<AutomationTrigger, string> = {
  "sem-resposta": "Sem resposta",
  "palavra-chave": "Palavra-chave",
  "nova-mensagem": "Nova mensagem",
  "mudanca-etapa": "Mudança de etapa",
  aniversario: "Aniversário",
  nps: "NPS",
  suitability: "Suitability",
  "sem-contato": "Sem contato",
}

const emptyProfile: InvestorProfile = { objectives: [], restrictions: [] }

const emptyCrm: CrmData = {
  stage: "novo",
  relationship: "lead",
  tags: [],
  positions: [],
  profile: emptyProfile,
  meetings: [],
}

/**
 * CRM data with a guaranteed shape. Every collection field is optional on the
 * wire but never undefined here, so components can map without guards.
 */
export function crmOf(chat: Chat): CrmData {
  const crm = chat.crm
  if (!crm) return emptyCrm
  return {
    ...crm,
    tags: crm.tags ?? [],
    positions: crm.positions ?? [],
    meetings: crm.meetings ?? [],
    profile: {
      ...emptyProfile,
      ...crm.profile,
      objectives: crm.profile?.objectives ?? [],
      restrictions: crm.profile?.restrictions ?? [],
    },
  }
}

export function eventsOf(chat: Chat): CrmEvent[] {
  return chat.crmEvents ?? []
}

/** Every tag in use, for the autocomplete. */
export function allTags(chats: Chat[]): string[] {
  const seen = new Set<string>()
  for (const chat of chats) {
    for (const tag of crmOf(chat).tags) seen.add(tag)
  }
  return [...seen].sort((a, b) => a.localeCompare(b, "pt-BR"))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/** Compact form for cards and table cells, where the cents are noise. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(iso?: string): string {
  if (!iso) return "—"
  const [y, m, d] = iso.split("-")
  return d && m && y ? `${d}/${m}/${y}` : iso
}

/** Days from today to an ISO date; negative once it's in the past. */
export function daysUntil(iso: string, now: Date): number {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return Number.NaN
  const target = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

/** Suitability is valid for 24 months; returns days left, negative if expired. */
export function suitabilityStatus(
  profile: InvestorProfile,
  now: Date
): { expiresAt: string; daysLeft: number } | null {
  if (!profile.suitabilityDate) return null
  const [y, m, d] = profile.suitabilityDate.split("-").map(Number)
  if (!y || !m || !d) return null
  const expiry = new Date(y + 2, m - 1, d)
  const iso = `${expiry.getFullYear()}-${String(expiry.getMonth() + 1).padStart(2, "0")}-${String(expiry.getDate()).padStart(2, "0")}`
  return { expiresAt: iso, daysLeft: daysUntil(iso, now) }
}

/** Days since the birthday, or until the next one. */
export function daysUntilBirthday(iso: string, now: Date): number {
  const [, m, d] = iso.split("-").map(Number)
  if (!m || !d) return Number.NaN
  let next = new Date(now.getFullYear(), m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (next.getTime() < today.getTime()) {
    next = new Date(now.getFullYear() + 1, m - 1, d)
  }
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

const defaultAutomations: AutomationRule[] = []

/** Local (contact-specific) rules only; globals live in the store. */
export function localAutomations(chat: Chat): AutomationRule[] {
  return chat.automations ?? defaultAutomations
}

/**
 * Whether a global rule applies to this contact. The override wins when set;
 * otherwise the rule's own `enabled` is the default for new contacts.
 */
export function isAutomationOn(chat: Chat, rule: AutomationRule): boolean {
  return chat.automationOverrides?.[rule.id] ?? rule.enabled
}

/** Fills {primeiro_nome}, {patrimonio} and {etapa} in a rule's template. */
export function renderTemplate(
  template: string,
  chat: Chat,
  netWorth: number
): string {
  const crm = crmOf(chat)
  return template
    .replaceAll("{primeiro_nome}", chat.name.split(" ")[0])
    .replaceAll("{nome}", chat.name)
    .replaceAll("{patrimonio}", formatCurrency(netWorth))
    .replaceAll("{etapa}", stageMeta[crm.stage].label)
}
