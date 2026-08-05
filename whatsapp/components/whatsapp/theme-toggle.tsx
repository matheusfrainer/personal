"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { useHydrated } from "@/hooks/use-hydrated"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Icon } from "./icon"
import { MoonIcon, SunIcon } from "./icons"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useHydrated()

  // Pre-mount the theme is unknown, so keep server and client markup identical.
  const isDark = mounted && resolvedTheme === "dark"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {/* Render a stable icon before mount to avoid hydration mismatch. */}
          <Icon icon={isDark ? SunIcon : MoonIcon} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isDark ? "Modo claro" : "Modo escuro"}</TooltipContent>
    </Tooltip>
  )
}
