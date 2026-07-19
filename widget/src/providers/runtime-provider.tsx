/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react"
import { AssistantRuntimeProvider, useRemoteThreadListRuntime } from "@assistant-ui/react"
import type { AssistantRuntime } from "@assistant-ui/react"
import { useAgUiRuntime } from "@assistant-ui/react-ag-ui"
import { useAui } from "@assistant-ui/store"

import { TolerantHttpAgent } from "../lib/tolerant-agent"
import { createThreadListAdapter } from "../lib/thread-list-adapter"
import { createThreadHistoryAdapter } from "../lib/thread-history-adapter"
import { saveSources } from "../lib/local-store"

/**
 * @interface
 *
 * RuntimeProviderProps
 */
interface RuntimeProviderProps {
  /** The URL of the agent. */
  agentUrl: string

  /** The children of the RuntimeProvider. */
  children: ReactNode
}

/**
 * RuntimeProvider
 *
 * @description Wires the AG-UI runtime to a localStorage-backed thread list and history,
 * so conversations persist client-side.
 *
 * @param {RuntimeProviderProps} props - The props of the RuntimeProvider.
 *
 * @returns {ReactNode} The RuntimeProvider.
 */
export function RuntimeProvider({ agentUrl, children }: RuntimeProviderProps) {
  // derive the AG-UI endpoint from the configured base URL
  const baseUrl = agentUrl.replace(/\/+$/, "")
  const aguiUrl = `${baseUrl}/agui/agent`

  // create the thread list adapter
  const adapter = useMemo(() => createThreadListAdapter(), [])

  // use the AG-UI chat runtime
  function useAgUiChatRuntime() {
    // use the AUI store
    const aui = useAui()

    // runtime reference: the history adapter is created before the runtime exists,
    // but load() resolves async (mount effect), so the ref is always populated
    // by the time onState fires.
    const runtimeRef = useRef<AssistantRuntime | null>(null)

    // Lazy remoteId getter: the runtime calls load() once per thread mount,
    // possibly before the list item carries its remoteId, a fixed id captured
    // here would race.
    const getRemoteId = useCallback(() => {
      try {
        return aui.threadListItem().getState().remoteId
      } catch {
        return undefined
      }
    }, [aui])

    // history adapter: reads/writes messages and citation sources in
    // localStorage. `onState` re-seeds sources so citations survive a reload.
    const history = useMemo(
      () =>
        createThreadHistoryAdapter(getRemoteId, (state) => {
          runtimeRef.current?.thread.unstable_loadExternalState(state)
        }),
      [getRemoteId]
    )

    // create the HTTP agent
    const agent = useMemo(() => new TolerantHttpAgent({ url: aguiUrl }), [])

    // run under the client-generated thread id
    // (`initialize()` is idempotent and mints the localStorage thread on first use)
    agent.resolveThreadId = async () => {
      const { remoteId } = await aui.threadListItem().initialize()

      return remoteId
    }

    // create the AG-UI runtime
    const runtime = useAgUiRuntime({
      agent: agent as any,
      adapters: { history },
    })

    // set the runtime reference
    runtimeRef.current = runtime

    // persist AG-UI citation sources (STATE_SNAPSHOT) to localStorage so they
    // reload with the thread.
    useEffect(() => {
      const unsubscribe = runtime.thread.subscribe(() => {
        const remoteId = getRemoteId()

        if (!remoteId) {
          return
        }

        const state = runtime.thread.getState().state as Record<string, unknown> | undefined
        const sources = state?.["sources"]

        if (sources && typeof sources === "object" && !Array.isArray(sources)) {
          saveSources(remoteId, sources as Record<string, unknown>)
        }
      })
      return unsubscribe
    }, [runtime, getRemoteId])

    return runtime
  }

  // create the remote thread list runtime
  const runtime = useRemoteThreadListRuntime({
    runtimeHook: useAgUiChatRuntime,
    adapter,
  })

  // return the assistant runtime provider
  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}
