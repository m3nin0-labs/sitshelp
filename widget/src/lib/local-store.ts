/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import type { ExportedMessageRepositoryItem } from "@assistant-ui/react"

/**
 * @module
 * LocalStore
 *
 * Client-side conversation store (localStorage).
 *
 * @description The backend is stateless and anonymous. Conversations live entirely in the
 * visitor browser. Nothing is sent to a server thread store.
 *
 * This module is the single owner of every persisted key: everything lives
 * under the `sitshelp:` namespace, stamped with a schema version so an
 * incompatible layout is wiped rather than misread, and capped so a busy
 * visitor cannot grow storage without bound.
 */

/**
 * The prefix for all keys.
 */
const PREFIX = "sitshelp:"

/**
 * The key for the schema version.
 */
const VERSION_KEY = `${PREFIX}version`

/**
 * The key for the threads.
 */
const THREADS_KEY = `${PREFIX}threads`

/**
 * The prefix for the messages.
 */
const MSGS_PREFIX = `${PREFIX}msgs:`

/**
 * The prefix for the sources.
 */
const SOURCES_PREFIX = `${PREFIX}sources:`

/**
 * The key for the sidebar width.
 */
const SIDEBAR_WIDTH_KEY = `${PREFIX}sidebar-width`

/**
 * The schema version.
 *
 * Bump when the stored shape changes incompatibly. Old data is then wiped.
 */
const SCHEMA_VERSION = 1

/**
 * The maximum number of threads to keep.
 *
 * @description The oldest threads are evicted past this limit.
 */
export const MAX_THREADS = 50

/**
 * @interface
 * ThreadEntry
 *
 * A stored conversation thread (sidebar entry).
 */
export interface ThreadEntry {
  /** The remote ID of the thread. */
  remoteId: string

  /** The local ID of the thread. */
  localId?: string

  /** The title of the thread. */
  title: string

  /** The preview of the thread. */
  preview?: string

  /** Whether the thread is archived. */
  archived: boolean

  /** The creation timestamp of the thread. */
  createdAt: number
}

/**
 * A stored message repository for one thread.
 *
 * @interface
 * StoredMessages
 */
interface StoredMessages {
  /** The head ID of the message repository. */
  headId: string | null

  /** The items of the message repository. */
  items: ExportedMessageRepositoryItem[]
}

/**
 * Read a JSON value from localStorage.
 *
 * @param {string} key - The key to read.
 * @param {T} fallback - The fallback value.
 *
 * @returns {T} The read value.
 */
function readJSON<T>(key: string, fallback: T): T {
  try {
    // get the raw value from localStorage
    const raw = globalThis.localStorage?.getItem(key)

    // if there is a raw value, parse it as T
    if (raw) {
      return JSON.parse(raw) as T
    }

    // return the fallback value
    return fallback
  } catch {
    // otherwise, return the fallback value as well
    return fallback
  }
}

/**
 * Write a JSON value to localStorage.
 *
 * @param {string} key - The key to write.
 * @param {unknown} value - The value to write.
 *
 * @returns {boolean} True if the write is successful, false otherwise.
 */
function writeJSON(key: string, value: unknown): boolean {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value))

    return true
  } catch {
    return false
  }
}

/**
 * Remove a key from localStorage.
 *
 * @param {string} key - The key to remove.
 */
function removeKey(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key)
  } catch {
    // ignore
  }
}

/**
 * Remove every key under our namespace.
 *
 * @description Used on a schema-version mismatch.
 */
function clearNamespace(): void {
  try {
    // get the localStorage instance
    const store = globalThis.localStorage

    // if there is no localStorage instance, return
    if (!store) {
      return
    }

    // define keys to remove
    const toBeRemoved = []

    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i)

      if (key?.startsWith(PREFIX)) {
        toBeRemoved.push(key)
      }
    }

    // remove the keys
    toBeRemoved.forEach((key) => {
      store.removeItem(key)
    })
  } catch {
    // ignore
  }
}

/**
 * Ensure the schema version is up to date.
 *
 * @description Wipe stored data when the persisted schema version is missing or stale, then
 * stamp the current version. Runs once at module load, before any read.
 *
 * @returns {void}
 */
export function ensureSchemaVersion(): void {
  try {
    const stored = globalThis.localStorage?.getItem(VERSION_KEY)

    if (stored === String(SCHEMA_VERSION)) {
      return
    }

    // otherwise, clean namespace
    clearNamespace()

    // stamp the current version
    globalThis.localStorage?.setItem(VERSION_KEY, String(SCHEMA_VERSION))
  } catch {
    // ignore
  }
}

//
// Threads API
//
/**
 * List all threads.
 *
 * @returns {ThreadEntry[]} The list of threads.
 */
export function listThreads(): ThreadEntry[] {
  return readJSON<ThreadEntry[]>(THREADS_KEY, []).sort((a, b) => b.createdAt - a.createdAt)
}

/**
 * Write the threads to localStorage.
 *
 * @param {ThreadEntry[]} threads - The threads to write.
 *
 * @returns {void}
 */
function writeThreads(threads: ThreadEntry[]): void {
  writeJSON(THREADS_KEY, threads)
}

/**
 * Get a thread by remote ID.
 *
 * @param {string} remoteId - The remote ID of the thread.
 *
 * @returns {ThreadEntry | undefined} The thread, or undefined if not found.
 */
export function getThread(remoteId: string): ThreadEntry | undefined {
  return listThreads().find((t) => t.remoteId === remoteId)
}

/**
 * Create a thread for a local id, or return the existing one (idempotent).
 *
 * @param {string} localId - The local ID of the thread.
 *
 * @returns {ThreadEntry} The created thread.
 */
export function createThread(localId: string): ThreadEntry {
  const threads = readJSON<ThreadEntry[]>(THREADS_KEY, [])

  const existing = threads.find((t) => t.localId === localId)

  if (existing) {
    return existing
  }

  const entry: ThreadEntry = {
    remoteId: crypto.randomUUID(),
    localId,
    title: "",
    archived: false,
    createdAt: Date.now(),
  }

  // add the new thread to the list
  threads.push(entry)

  // sort the threads by creation date
  threads.sort((a, b) => b.createdAt - a.createdAt)

  // defien threads to remove
  const threadsToRemove = threads.splice(MAX_THREADS)

  threadsToRemove.forEach((t) => {
    removeKey(MSGS_PREFIX + t.remoteId)
    removeKey(SOURCES_PREFIX + t.remoteId)
  })

  // write remaining threads
  writeThreads(threads)

  // return the created thread
  return entry
}

/**
 * Patch a thread.
 *
 * @param {string} remoteId - The remote ID of the thread.
 * @param {Partial<ThreadEntry>} patch - The patch to apply.
 *
 * @returns {void}
 */
export function patchThread(remoteId: string, patch: Partial<ThreadEntry>): void {
  // get the threads
  const threads = readJSON<ThreadEntry[]>(THREADS_KEY, [])

  // find the current thread
  const current = threads.find((t) => t.remoteId === remoteId)

  if (!current) {
    return
  }

  // apply the patch
  Object.assign(current, patch)

  // write the threads
  writeThreads(threads)
}

/**
 * Remove a thread.
 *
 * @param {string} remoteId - The remote ID of the thread.
 *
 * @returns {void}
 */
export function removeThread(remoteId: string): void {
  // get the threads
  const threads = readJSON<ThreadEntry[]>(THREADS_KEY, []).filter((t) => t.remoteId !== remoteId)

  // write the threads
  writeThreads(threads)

  // remove the messages and sources
  removeKey(MSGS_PREFIX + remoteId)
  removeKey(SOURCES_PREFIX + remoteId)
}

/**
 * Remove the oldest thread other than `exceptId`.
 *
 * @param {string} exceptId - The remote ID of the thread to exclude.
 *
 * @returns {boolean} True when a thread was removed, false otherwise.
 */
function removeOldestExcept(exceptId: string): boolean {
  // get the threads
  const oldest = readJSON<ThreadEntry[]>(THREADS_KEY, [])
    .filter((t) => t.remoteId !== exceptId)
    .sort((a, b) => a.createdAt - b.createdAt)[0]

  // if there is no oldest thread, return false
  if (!oldest) return false

  // remove the oldest thread
  removeThread(oldest.remoteId)

  // return true
  return true
}

//
// Messages API
//

/**
 * Load the messages for a thread.
 *
 * @param {string} remoteId - The remote ID of the thread.
 *
 * @returns {StoredMessages} The messages.
 */
export function loadMessages(remoteId: string): StoredMessages {
  // get the stored messages
  const stored = readJSON<StoredMessages>(MSGS_PREFIX + remoteId, { headId: null, items: [] })

  // recreate date fields
  for (const item of stored.items) {
    // get the message
    const msg = item.message as { createdAt?: unknown }

    // if the createdAt field is a string, parse it as a date
    if (typeof msg.createdAt === "string") {
      msg.createdAt = new Date(msg.createdAt)
    }
  }

  // return!
  return stored
}

/**
 * Append a message to a thread.
 *
 * @param {string} remoteId - The remote ID of the thread.
 * @param {ExportedMessageRepositoryItem} item - The message to append.
 *
 * @returns {void}
 */
export function appendMessage(remoteId: string, item: ExportedMessageRepositoryItem): void {
  // get the stored messages
  const stored = readJSON<StoredMessages>(MSGS_PREFIX + remoteId, { headId: null, items: [] })

  // get the index of the item with the same id
  const idx = stored.items.findIndex((i) => i.message.id === item.message.id)

  // if the item is not found, append it
  if (idx === -1) {
    stored.items.push(item)
  }

  // if the item is found, replace it
  else {
    stored.items[idx] = item
  }

  // set the head id
  stored.headId = item.message.id

  // if the write is rejected (quota), remove the oldest other conversation and retry once
  if (!writeJSON(MSGS_PREFIX + remoteId, stored) && removeOldestExcept(remoteId)) {
    writeJSON(MSGS_PREFIX + remoteId, stored)
  }
}

//
// Sources API
//

/**
 * Load the sources for a thread.
 *
 * @param {string} remoteId - The remote ID of the thread.
 *
 * @returns {Record<string, unknown> | null} The sources.
 */
export function loadSources(remoteId: string): Record<string, unknown> | null {
  return readJSON<Record<string, unknown> | null>(SOURCES_PREFIX + remoteId, null)
}

/**
 * Save the sources for a thread.
 *
 * @param {string} remoteId - The remote ID of the thread.
 * @param {Record<string, unknown>} sources - The sources to save.
 *
 * @returns {void}
 */
export function saveSources(remoteId: string, sources: Record<string, unknown>): void {
  if (!sources || Object.keys(sources).length === 0) return

  if (!writeJSON(SOURCES_PREFIX + remoteId, sources) && removeOldestExcept(remoteId)) {
    writeJSON(SOURCES_PREFIX + remoteId, sources)
  }
}

//
// Sidebar width API
//

/**
 * Load the sidebar width.
 *
 * @returns {number | null} The sidebar width.
 */
export function loadSidebarWidth(): number | null {
  const raw = readJSON<number | null>(SIDEBAR_WIDTH_KEY, null)

  return typeof raw === "number" && Number.isFinite(raw) ? raw : null
}

/**
 * Save the sidebar width.
 *
 * @param {number} width - The sidebar width to save.
 *
 * @returns {void}
 */
export function saveSidebarWidth(width: number): void {
  writeJSON(SIDEBAR_WIDTH_KEY, width)
}

/**
 * Ensure the schema version is up to date
 */
ensureSchemaVersion()
