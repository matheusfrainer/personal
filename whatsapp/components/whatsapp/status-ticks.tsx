import type { MessageStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

import { Icon } from "./icon"
import { CheckDoubleIcon, CheckIcon, ClockIcon } from "./icons"

/**
 * WhatsApp-style delivery receipts.
 * pending → clock · sent → one tick · delivered → double tick ·
 * read → blue double tick.
 */
export function StatusTicks({
  status,
  className,
}: {
  status?: MessageStatus
  className?: string
}) {
  if (!status) return null

  if (status === "pending") {
    return <Icon icon={ClockIcon} className={cn("size-3.5", className)} />
  }

  return (
    <Icon
      icon={status === "sent" ? CheckIcon : CheckDoubleIcon}
      className={cn(
        "size-4",
        className,
        // Last so tailwind-merge lets the read colour beat a caller's text colour.
        status === "read" && "text-sky-500 dark:text-sky-400"
      )}
    />
  )
}
