"use client"

import * as React from "react"

import { allTags } from "@/lib/crm"
import { useStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Icon } from "./icon"
import { CloseIcon, PlusIcon } from "./icons"

/**
 * Tag editor backed by every tag already in use. Suggesting existing tags is
 * what keeps them consistent across contacts — a free-text field produces
 * "Alta renda", "alta-renda" and "AltaRenda" and none of them filter together.
 */
export function TagCombobox({
  tags,
  onChange,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const { state } = useStore()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")

  const available = allTags(state.chats).filter((t) => !tags.includes(t))
  const trimmed = query.trim()
  const canCreate =
    trimmed.length > 0 &&
    !tags.some((t) => t.toLowerCase() === trimmed.toLowerCase()) &&
    !available.some((t) => t.toLowerCase() === trimmed.toLowerCase())

  function add(tag: string) {
    onChange([...tags, tag])
    setQuery("")
    setOpen(false)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="pr-1">
            {tag}
            <button
              type="button"
              aria-label={`Remover tag ${tag}`}
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="rounded-full p-0.5 opacity-60 hover:bg-foreground/10 hover:opacity-100"
            >
              <Icon icon={CloseIcon} className="size-2.5" />
            </button>
          </Badge>
        ))}
        {tags.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhuma tag ainda.</p>
        ) : null}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-7 w-full justify-start text-xs font-normal text-muted-foreground"
          >
            <Icon icon={PlusIcon} className="size-3.5" />
            Adicionar tag
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-0">
          <Command>
            <CommandInput
              placeholder="Buscar ou criar…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
              {available.length ? (
                <CommandGroup heading="Já em uso">
                  {available.map((tag) => (
                    <CommandItem
                      key={tag}
                      value={tag}
                      onSelect={() => add(tag)}
                    >
                      {tag}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {canCreate ? (
                <CommandGroup heading="Criar">
                  <CommandItem
                    value={`criar-${trimmed}`}
                    onSelect={() => add(trimmed)}
                  >
                    <Icon icon={PlusIcon} className="size-3.5" />
                    {trimmed}
                  </CommandItem>
                </CommandGroup>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
