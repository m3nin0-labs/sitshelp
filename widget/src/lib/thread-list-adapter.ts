/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import type { RemoteThreadListAdapter, ThreadMessage } from "@assistant-ui/react"

import { createThread, getThread, listThreads, patchThread, removeThread } from "./local-store"

/**
 * First text of a message with the given role.
 *
 * @param {readonly ThreadMessage[]} messages - The messages to search.
 * @param {string} role - The role of the message to search for.
 * @param {number} maxLength - The maximum length of the text to return.
 *
 * @returns {string | undefined} The first text of the message.
 */
function firstTextOf(
  messages: readonly ThreadMessage[],
  role: "user" | "assistant",
  maxLength: number
): string | undefined {
  // iterate over the messages
  for (const message of messages) {
    // if the message role is not the role we are
    // looking for, continue
    if (message.role !== role) {
      continue
    }

    // iterate over the parts of the message
    for (const part of message.content) {
      // if the part is a text part and the text is not empty, return the text
      if (part.type === "text" && part.text.trim()) {
        return part.text.trim().slice(0, maxLength)
      }
    }
  }

  return undefined
}

/**
 * Strip markdown syntax for plain-text previews.
 *
 * @param {string} text - The text to strip.
 *
 * @returns {string} The stripped text.
 */
function stripMarkdown(text: string): string {
  return (
    text
      // case: fenced code blocks
      .replace(/```[\s\S]*?(```|$)/g, " ")
      // case: inline markers
      .replace(/[`*_~#>]/g, "")
      // case: links -> label
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      // case: extra spaces
      .replace(/\s+/g, " ")
      // trim the text
      .trim()
  )
}

/**
 * Create a thread list adapter backed by localStorage.
 *
 * @returns {RemoteThreadListAdapter} The thread list adapter.
 */
export function createThreadListAdapter(): RemoteThreadListAdapter {
  return {
    async list() {
      return {
        threads: listThreads().map((t) => ({
          remoteId: t.remoteId,
          externalId: undefined,
          status: (t.archived ? "archived" : "regular") as "regular" | "archived",
          title: t.title || undefined,
        })),
      }
    },

    /**
     * Initialize a thread.
     *
     * @param {string} localId - The local ID of the thread.
     *
     * @returns {Promise<{remoteId: string, externalId: undefined}>} The remote ID and external ID of the thread.
     */
    async initialize(localId: string) {
      const thread = createThread(localId)
      return { remoteId: thread.remoteId, externalId: undefined }
    },

    /**
     * Rename a thread.
     *
     * @param {string} remoteId - The remote ID of the thread.
     * @param {string} newTitle - The new title of the thread.
     *
     * @returns {void}
     */
    async rename(remoteId: string, newTitle: string) {
      patchThread(remoteId, { title: newTitle })
    },

    /**
     * Archive a thread.
     *
     * @param {string} remoteId - The remote ID of the thread.
     *
     * @returns {void}
     */
    async archive(remoteId: string) {
      patchThread(remoteId, { archived: true })
    },

    /**
     * Unarchive a thread.
     *
     * @param {string} remoteId - The remote ID of the thread.
     *
     * @returns {void}
     */
    async unarchive(remoteId: string) {
      patchThread(remoteId, { archived: false })
    },

    /**
     * Delete a thread.
     *
     * @param {string} remoteId - The remote ID of the thread.
     *
     * @returns {void}
     */
    async delete(remoteId: string) {
      removeThread(remoteId)
    },

    /**
     * Get a thread
     */
    async fetch(threadId: string) {
      // get the thread
      const t = getThread(threadId)

      // return the thread
      return {
        remoteId: threadId,
        externalId: undefined,
        status: (t?.archived ? "archived" : "regular") as "regular" | "archived",
        title: t?.title || undefined,
      }
    },

    /**
     * Generate a title for a thread.
     *
     * @param {string} remoteId - The remote ID of the thread.
     * @param {readonly ThreadMessage[]} messages - The messages to generate the title from.
     *
     * @returns {Promise<{title: string, preview: string | undefined}>} The title and preview of the thread.
     */
    async generateTitle(remoteId: string, messages) {
      // generate the title from the first user message
      const title = firstTextOf(messages, "user", 60) ?? "New conversation"

      // generate the preview from the first assistant message
      const preview =
        stripMarkdown(firstTextOf(messages, "assistant", 500) ?? "").slice(0, 140) || undefined

      // patch the thread with the title and preview
      patchThread(remoteId, preview ? { title, preview } : { title })

      // create the assistant stream
      const { createAssistantStream } = await import("assistant-stream")

      return createAssistantStream((controller) => {
        controller.appendText(title)
        controller.close()
      })
    },
  }
}
