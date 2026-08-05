import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { cn } from "@/lib/utils"

interface IconProps extends React.ComponentProps<typeof HugeiconsIcon> {
  icon: IconSvgElement
}

/**
 * Thin wrapper around Hugeicons that applies the slightly thinner stroke the
 * Mira style favours and lets sizing come from a `size-*` utility class.
 */
export function Icon({ icon, className, strokeWidth = 1.8, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}
