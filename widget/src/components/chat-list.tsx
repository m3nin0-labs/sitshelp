/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useEffect, useState } from "react"
import { ThreadListPrimitive, ThreadListItemPrimitive, useAuiState } from "@assistant-ui/react"
import { ArrowLeftIcon, Trash2Icon } from "lucide-react"

import { listThreads } from "../lib/local-store"
import type { ThreadEntry } from "../lib/local-store"

/**
 * @interface
 *
 * ChatListProps Interface
 */
interface ChatListProps {
  /** Callback function to go back to the chat. */
  onBack: () => void

  /** Callback function invoked after a thread is selected. */
  onSelectThread: () => void
}

/**
 * @interface
 *
 * ChatMeta Interface
 */
interface ChatMeta {
  /** First assistant reply snippet. */
  preview?: string

  /** Human relative time ("2 h ago"). */
  relativeTime: string

  /** Section label, set on the first thread of each group. */
  sectionLabel?: string
}

/**
 * @component
 * ChatList Component
 *
 * @description List of past conversations.
 *
 * @param {ChatListProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered chat list.
 */
export function ChatList({ onBack, onSelectThread }: ChatListProps) {
  // state - per-thread display metadata
  const [meta, setMeta] = useState<Map<string, ChatMeta>>(() => new Map())

  // effect - side-load thread metadata (previews + dates) from localStorage
  useEffect(() => {
    setMeta(buildChatMeta(listThreads()))
  }, [])

  return (
    <div className="flex-1 overflow-y-auto">
      <ChatListHeader onBack={onBack} />
      <ThreadListPrimitive.Root className="flex flex-col pb-4">
        <ThreadListPrimitive.Items
          components={{
            ThreadListItem: () => <ChatListItem meta={meta} onSelect={onSelectThread} />,
          }}
        />
      </ThreadListPrimitive.Root>
    </div>
  )
}

/**
 * @component
 * ChatListHeader Component
 *
 * @description Header for the chat list.
 *
 * @param {Function} onBack - Callback function to go back to the chat
 *
 * @returns {JSX.Element} The rendered chat list header.
 */
function ChatListHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border">
      <button
        className="text-accent-blue text-[13px] font-medium bg-transparent border-none cursor-pointer flex items-center gap-1 p-0"
        onClick={onBack}
        type="button"
      >
        <ArrowLeftIcon size={14} />
        Back
      </button>

      <span className="text-[13px] font-semibold text-foreground">Past chats</span>
    </div>
  )
}

/**
 * @component
 * ChatListItem Component
 *
 * @description Item for the chat list.
 *
 * @param {Map<string, ChatMeta>} meta - Side-loaded display metadata by thread id
 * @param {Function} onSelect - Callback invoked after a thread is selected
 *
 * @returns {JSX.Element} The rendered chat list item.
 */
function ChatListItem({ meta, onSelect }: { meta: Map<string, ChatMeta>; onSelect: () => void }) {
  // state - remote thread id + active flag
  const remoteId = useAuiState((s) => s.threadListItem.remoteId)
  const isMain = useAuiState((s) => s.threadListItem.id === s.threads.mainThreadId)

  // side-loaded metadata (threads created this session are not in the map)
  const info = remoteId ? meta.get(remoteId) : undefined

  return (
    <>
      {info?.sectionLabel && <div className="sitshelp-chat-section-label">{info.sectionLabel}</div>}

      <ThreadListItemPrimitive.Root
        className={`group relative border-l-[3px] transition-colors ${
          isMain ? "border-accent-blue bg-accent-light" : "border-transparent hover:bg-secondary"
        }`}
      >
        <ThreadListItemPrimitive.Trigger
          className="block w-full min-w-0 bg-transparent border-none px-4 py-3 pr-9 cursor-pointer text-left"
          onClick={onSelect}
        >
          <div className="flex items-baseline gap-2">
            <span className="flex-1 min-w-0 text-[13px] font-semibold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
              <ThreadListItemPrimitive.Title fallback="New conversation" />
            </span>

            <span className="shrink-0 text-[11px] text-muted-foreground">
              {info?.relativeTime ?? "Just now"}
            </span>
          </div>

          {info?.preview && (
            <p className="mt-1 mb-0 text-xs leading-normal text-muted-foreground line-clamp-2">
              {info.preview}
            </p>
          )}
        </ThreadListItemPrimitive.Trigger>

        <ThreadListItemPrimitive.Delete
          className="absolute right-3 top-3 opacity-0 bg-transparent border-none text-muted-foreground cursor-pointer p-0.5 rounded transition-opacity group-hover:opacity-100 hover:text-destructive"
          asChild
        >
          <button type="button" aria-label="Delete conversation">
            <Trash2Icon size={13} />
          </button>
        </ThreadListItemPrimitive.Delete>
      </ThreadListItemPrimitive.Root>
    </>
  )
}

/**
 * Build display metadata for all threads
 *
 * @description Threads arrive ordered by recency from localStorage. The first thread of
 * each date group is flagged with its section label.
 *
 * @param {ThreadEntry[]} threads - Locally stored conversation threads
 *
 * @returns {Map<string, ChatMeta>} Metadata keyed by thread id
 */
function buildChatMeta(threads: ThreadEntry[]): Map<string, ChatMeta> {
  let lastSection
  const map = new Map<string, ChatMeta>()

  // for each thread, build metadata
  for (const thread of threads) {
    const iso = new Date(thread.createdAt).toISOString()

    // get the section label for the thread
    const section = getSectionLabel(iso)

    // set the metadata for the thread
    map.set(thread.remoteId, {
      preview: thread.preview?.trim() ? thread.preview : undefined,
      relativeTime: formatRelativeTime(iso),
      sectionLabel: section !== lastSection ? section : undefined,
    })

    // update the last section label
    lastSection = section
  }

  return map
}

/**
 * Get section label for a date
 *
 * @param {string} iso - ISO date string
 *
 * @returns {string} Label for the section date.
 */
function getSectionLabel(iso: string): string {
  const date = new Date(iso)
  const now = new Date()

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    return "Today"
  }

  // define last 7 days in milliseconds
  const lastSevenDays = 7 * 24 * 60 * 60 * 1000

  // check if the date is within the last 7 days
  if (now.getTime() - date.getTime() < lastSevenDays) {
    return "Previous 7 days"
  }

  return "Older"
}

/**
 * Format a date as a short relative time
 *
 * @param {string} iso - ISO date string
 *
 * @returns {string} Short relative time string
 */
function formatRelativeTime(iso: string): string {
  // calculate the difference in seconds between the
  // current time and the given date
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)

  // case: less than a minute
  if (seconds < 60) {
    return "Just now"
  }

  // case: first hour
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes} min ago`
  }

  // case: first day
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours} h ago`
  }

  // case: first week
  const days = Math.floor(hours / 24)
  if (days < 7) {
    return `${days} d ago`
  }

  // case: first month
  const weeks = Math.floor(days / 7)
  if (weeks < 5) {
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`
  }

  // case: older than a month
  const months = Math.floor(days / 30)
  return months === 1 ? "1 month ago" : `${months} months ago`
}
