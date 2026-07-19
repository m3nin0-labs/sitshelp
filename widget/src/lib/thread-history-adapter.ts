/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import type { ThreadHistoryAdapter } from "@assistant-ui/core"

import { appendMessage, loadMessages, loadSources } from "./local-store"

/**
 * Create a thread history adapter backed by localStorage.
 *
 * @param {() => string | undefined} getRemoteId - A function that returns the remote ID of the thread.
 * @param {(state: Record<string, unknown>) => void} onState - A function that is called when the state changes.
 *
 * @returns {ThreadHistoryAdapter} The thread history adapter.
 */
export function createThreadHistoryAdapter(
  getRemoteId: () => string | undefined,
  onState?: (state: Record<string, unknown>) => void
): ThreadHistoryAdapter {
  return {
    async load() {
      // new threads have no remote id and no history
      const remoteId = getRemoteId()
      if (!remoteId) {
        return {
          headId: null,
          messages: [],
        }
      }

      // restore the sources snapshot so citations survive a reload
      const sources = loadSources(remoteId)

      // if the sources are valid, call the onState function
      if (onState && sources && typeof sources === "object" && !Array.isArray(sources)) {
        onState({ sources })
      }

      // load the messages
      const { headId, items } = loadMessages(remoteId)

      // return the messages
      return { headId, messages: items }
    },

    async append(item) {
      // get the remote id
      const remoteId = getRemoteId()

      // if the remote id is not valid, return
      if (!remoteId) {
        return
      }

      // append the message
      appendMessage(remoteId, item)
    },
  }
}
