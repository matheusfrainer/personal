"use client"

import * as React from "react"

import { formatDuration } from "@/lib/media"
import type { AudioMessage as AudioMessageType } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { Icon } from "./icon"
import { MicIcon, PauseIcon, PlayIcon } from "./icons"

/**
 * Voice note player. Playback is simulated on a timer — there is no audio file
 * — but the waveform, scrubbing and speed control behave like the real thing.
 */
export function AudioMessage({
  message,
  outgoing,
}: {
  message: AudioMessageType
  outgoing: boolean
}) {
  const [playing, setPlaying] = React.useState(false)
  const [elapsed, setElapsed] = React.useState(0)
  const [speed, setSpeed] = React.useState<1 | 1.5 | 2>(1)

  // Keep the updater pure: React may evaluate it more than once, and calling
  // setPlaying from inside it would replay the stop behaviour.
  const elapsedRef = React.useRef(0)
  React.useEffect(() => {
    elapsedRef.current = elapsed
  }, [elapsed])

  React.useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      const next = elapsedRef.current + 0.1 * speed
      if (next >= message.duration) {
        setPlaying(false)
        setElapsed(0)
        return
      }
      elapsedRef.current = next
      setElapsed(next)
    }, 100)
    return () => window.clearInterval(id)
  }, [playing, speed, message.duration])

  const progress = elapsed / message.duration

  function seekTo(index: number) {
    setElapsed((index / message.waveform.length) * message.duration)
  }

  return (
    <div className="flex min-w-56 items-center gap-2">
      <Button
        size="icon-sm"
        variant={outgoing ? "secondary" : "default"}
        className="rounded-full"
        aria-label={playing ? "Pausar" : "Reproduzir"}
        onClick={() => setPlaying((p) => !p)}
      >
        <Icon icon={playing ? PauseIcon : PlayIcon} />
      </Button>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex h-6 items-end gap-px" role="presentation">
          {message.waveform.map((h, i) => {
            const played = i / message.waveform.length <= progress
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-hidden
                onClick={() => seekTo(i)}
                style={{ height: `${Math.round(h * 100)}%` }}
                className={cn(
                  "w-full min-w-px rounded-full transition-opacity",
                  played ? "opacity-100" : "opacity-35",
                  outgoing ? "bg-foreground/70" : "bg-foreground/60"
                )}
              />
            )
          })}
        </div>
        <div className="flex items-center justify-between text-[0.625rem] opacity-70">
          <span className="font-mono">
            {formatDuration(playing || elapsed > 0 ? elapsed : message.duration)}
          </span>
          <button
            type="button"
            className="rounded px-1 font-medium hover:bg-foreground/10"
            onClick={() => setSpeed(speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1)}
          >
            {speed}×
          </button>
        </div>
      </div>

      {message.voice ? (
        <Icon icon={MicIcon} className="size-3.5 shrink-0 opacity-60" />
      ) : null}
    </div>
  )
}
