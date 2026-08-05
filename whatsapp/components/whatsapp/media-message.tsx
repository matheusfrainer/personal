"use client"

import * as React from "react"

import { formatDuration } from "@/lib/media"
import type {
  ContactMessage,
  DocumentMessage,
  ImageMessage,
  LocationMessage,
  VideoMessage,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Icon } from "./icon"
import {
  ContactIcon,
  DocumentIcon,
  DownloadIcon,
  LocationIcon,
  PhoneIcon,
  PlayIcon,
} from "./icons"
import { RichText } from "./rich-text"

/** Image with a full-screen viewer, mirroring WhatsApp's media lightbox. */
export function ImageBubbleMessage({ message }: { message: ImageMessage }) {
  return (
    <div className="flex flex-col gap-1">
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="block overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {/* Inline SVG data URI — plain <img> avoids next/image config. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.url}
              alt={message.caption ?? "Foto"}
              className="max-h-72 w-full max-w-72 cursor-pointer object-cover transition-opacity hover:opacity-95"
            />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="sr-only">
            {message.caption ?? "Foto"}
          </DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.url}
            alt={message.caption ?? "Foto"}
            className="max-h-[75vh] w-full rounded-md object-contain"
          />
          {message.caption ? (
            <p className="text-center text-xs text-muted-foreground">
              {message.caption}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>

      {message.caption ? (
        <p className="px-0.5 leading-relaxed">
          <RichText>{message.caption}</RichText>
        </p>
      ) : null}
    </div>
  )
}

export function VideoBubbleMessage({ message }: { message: VideoMessage }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="relative overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={message.url}
          alt={message.caption ?? "Vídeo"}
          className="max-h-72 w-full max-w-72 object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-full bg-background/85 shadow-sm">
            <Icon icon={PlayIcon} className="size-5" />
          </span>
        </div>
        <span className="absolute right-1.5 bottom-1.5 rounded bg-background/85 px-1.5 py-0.5 font-mono text-[0.625rem]">
          {formatDuration(message.duration)}
        </span>
      </div>
      {message.caption ? (
        <p className="px-0.5 leading-relaxed">
          <RichText>{message.caption}</RichText>
        </p>
      ) : null}
    </div>
  )
}

/** Document row built from the official Attachment primitives. */
export function DocumentBubbleMessage({
  message,
}: {
  message: DocumentMessage
}) {
  return (
    <Attachment size="sm" className="min-w-56 bg-transparent">
      <AttachmentMedia>
        <Icon icon={DocumentIcon} />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{message.filename}</AttachmentTitle>
        <AttachmentDescription>
          {[message.pages ? `${message.pages} páginas` : null, message.ext, message.size]
            .filter(Boolean)
            .join(" · ")}
        </AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Baixar">
          <Icon icon={DownloadIcon} />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}

export function LocationBubbleMessage({
  message,
}: {
  message: LocationMessage
}) {
  return (
    <div className="flex w-56 flex-col gap-1.5">
      {/* Stylised neutral "map" — grid lines plus a marker. */}
      <div
        className={cn(
          "relative h-24 overflow-hidden rounded-md bg-muted",
          "bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]",
          "bg-[size:16px_16px]"
        )}
      >
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Icon icon={LocationIcon} className="size-6" strokeWidth={2} />
        </span>
      </div>
      <div className="leading-tight">
        <p className="font-medium">{message.label}</p>
        <p className="text-[0.6875rem] opacity-70">{message.address}</p>
      </div>
    </div>
  )
}

export function ContactBubbleMessage({ message }: { message: ContactMessage }) {
  return (
    <div className="flex w-56 flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-muted">
          <Icon icon={ContactIcon} className="size-4" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-medium">{message.contactName}</p>
          <p className="truncate text-[0.6875rem] opacity-70">{message.phone}</p>
        </div>
      </div>
      <Button size="xs" variant="secondary" className="w-full">
        <Icon icon={PhoneIcon} />
        Conversar
      </Button>
    </div>
  )
}
