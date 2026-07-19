/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { ExportedMessageRepositoryItem } from "@assistant-ui/react"

import {
  appendMessage,
  createThread,
  ensureSchemaVersion,
  getThread,
  listThreads,
  loadMessages,
  loadSidebarWidth,
  loadSources,
  MAX_THREADS,
  patchThread,
  removeThread,
  saveSidebarWidth,
  saveSources,
} from "./local-store"

/**
 * Build a minimal stored message repository item
 *
 * @param id - The message id
 * @param createdAt - The message created at
 *
 * @returns The message repository item
 */
function msg(
  id: string,
  createdAt = new Date("2026-01-01T00:00:00Z")
): ExportedMessageRepositoryItem {
  return {
    parentId: null,
    message: {
      id,
      role: "assistant",
      status: { type: "complete", reason: "stop" },
      content: [{ type: "text", text: `hello ${id}` }],
      createdAt,
      metadata: { unstable_annotations: [], unstable_data: [], steps: [], custom: {} },
    },
  } as unknown as ExportedMessageRepositoryItem
}

/**
 * Clear the local storage before each test
 */
beforeEach(() => {
  localStorage.clear()
})

describe("threads", () => {
  it("creates a thread with a generated remoteId", () => {
    const t = createThread("local-1")

    expect(t.remoteId).toBeTruthy()
    expect(t.localId).toBe("local-1")
    expect(t.archived).toBe(false)
    expect(listThreads()).toHaveLength(1)
  })

  it("is idempotent per localId", () => {
    const a = createThread("local-1")
    const b = createThread("local-1")

    expect(a.remoteId).toBe(b.remoteId)
    expect(listThreads()).toHaveLength(1)
  })

  it("lists threads newest-first", () => {
    const older = createThread("local-old")
    patchThread(older.remoteId, { createdAt: 1000 })

    const newer = createThread("local-new")
    patchThread(newer.remoteId, { createdAt: 2000 })

    const ids = listThreads().map((t) => t.remoteId)
    expect(ids).toEqual([newer.remoteId, older.remoteId])
  })

  it("patches and reads a thread", () => {
    // create a thread
    const t = createThread("local-1")
    // patch the thread
    patchThread(t.remoteId, { title: "My chat", preview: "hi there" })

    // test
    expect(getThread(t.remoteId)).toMatchObject({ title: "My chat", preview: "hi there" })
  })

  it("removes a thread and its messages + sources", () => {
    const t = createThread("local-1")

    appendMessage(t.remoteId, msg("m1"))
    saveSources(t.remoteId, { S1: { title: "Doc", source_type: "documentation" } })

    removeThread(t.remoteId)

    expect(getThread(t.remoteId)).toBeUndefined()
    expect(loadMessages(t.remoteId).items).toHaveLength(0)
    expect(loadSources(t.remoteId)).toBeNull()
  })
})

describe("messages", () => {
  it("appends and reloads messages, tracking headId", () => {
    const t = createThread("local-1")
    appendMessage(t.remoteId, msg("m1"))
    appendMessage(t.remoteId, msg("m2"))

    const stored = loadMessages(t.remoteId)
    expect(stored.items.map((i) => i.message.id)).toEqual(["m1", "m2"])
    expect(stored.headId).toBe("m2")
  })

  it("replaces an existing message id instead of duplicating", () => {
    const t = createThread("local-1")
    appendMessage(t.remoteId, msg("m1"))
    appendMessage(t.remoteId, msg("m1"))

    const stored = loadMessages(t.remoteId)
    expect(stored.items).toHaveLength(1)
    expect(stored.headId).toBe("m1")
  })

  it("revives Date fields flattened by JSON", () => {
    const t = createThread("local-1")
    appendMessage(t.remoteId, msg("m1", new Date("2026-05-05T12:00:00Z")))

    const revived = loadMessages(t.remoteId).items[0]?.message as { createdAt: unknown }
    expect(revived.createdAt).toBeInstanceOf(Date)
  })
})

describe("sources", () => {
  it("saves and loads sources", () => {
    const t = createThread("local-1")

    saveSources(t.remoteId, { S1: { title: "Doc", url: "http://x", source_type: "documentation" } })
    expect(loadSources(t.remoteId)).toMatchObject({ S1: { title: "Doc" } })
  })

  it("does not persist an empty sources dict", () => {
    const t = createThread("local-1")

    saveSources(t.remoteId, {})
    expect(loadSources(t.remoteId)).toBeNull()
  })
})

describe("sidebar width", () => {
  it("round-trips a numeric width", () => {
    expect(loadSidebarWidth()).toBeNull()
    saveSidebarWidth(500)
    expect(loadSidebarWidth()).toBe(500)
  })
})

describe("schema version", () => {
  it("wipes stored data when the version is missing or stale", () => {
    localStorage.setItem("sitshelp:version", "0")
    localStorage.setItem("sitshelp:threads", JSON.stringify([{ remoteId: "x", createdAt: 1 }]))

    ensureSchemaVersion()

    expect(listThreads()).toHaveLength(0)
    expect(localStorage.getItem("sitshelp:version")).toBe("1")
  })

  it("leaves data intact when the version matches", () => {
    ensureSchemaVersion() // stamp the current version, as module load does
    const t = createThread("keep")

    ensureSchemaVersion() // version matches now, must not wipe data
    expect(getThread(t.remoteId)).toBeDefined()
  })
})

describe("retention cap", () => {
  it("keeps only the newest MAX_THREADS, dropping the oldest", () => {
    // create one over the cap, with strictly increasing timestamps
    for (let i = 0; i <= MAX_THREADS; i += 1) {
      const t = createThread(`t-${i}`)

      patchThread(t.remoteId, { createdAt: i + 1 })
      appendMessage(t.remoteId, msg(`m-${i}`))
    }

    // the extra create triggers eviction of the oldest
    createThread("trigger")

    const threads = listThreads()
    expect(threads).toHaveLength(MAX_THREADS)

    // "t-0" was the oldest (createdAt 1) and removed with its messages
    expect(threads.some((t) => t.localId === "t-0")).toBe(false)
  })
})

describe("quota eviction", () => {
  afterEach(() => vi.restoreAllMocks())

  it("evicts the oldest other thread and retries when a write is rejected", () => {
    const older = createThread("older")
    patchThread(older.remoteId, { createdAt: 1 })

    const current = createThread("current")
    patchThread(current.remoteId, { createdAt: 2 })

    // mock the setItem method
    const realSetItem = Storage.prototype.setItem

    // flag to track if the item has been rejected once
    let rejectedOnce = false

    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (
      this: Storage,
      key: string,
      value: string
    ) {
      if (!rejectedOnce && key === `sitshelp:msgs:${current.remoteId}`) {
        rejectedOnce = true

        throw new DOMException("exceeded", "QuotaExceededError")
      }

      return realSetItem.call(this, key, value)
    })

    appendMessage(current.remoteId, msg("big"))

    // oldest removed to free space, the retry then persisted the message
    expect(getThread(older.remoteId)).toBeUndefined()
    expect(loadMessages(current.remoteId).items.map((i) => i.message.id)).toEqual(["big"])
  })
})
