/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { HttpAgent } from "@ag-ui/client"
import { Observable, from, of, switchMap, map } from "rxjs"

import type { RunAgentInput, BaseEvent } from "@ag-ui/core"

/**
 * @class
 * TolerantHttpAgent
 *
 * HttpAgent with two adjustments over the default AG-UI agent:
 *
 * 1. Runs under the backend (Agent Protocol) thread id so LangGraph
 *    checkpoints land where the history loader looks.
 *
 * 2. On an invalid AG-UI event, ends the stream gracefully, keeping whatever
 *    already streamed, instead of surfacing a hard error to the UI.
 *
 */
export class TolerantHttpAgent extends HttpAgent {
  /**
   * Resolve the backend (Agent Protocol) thread id for the current thread.
   * Consulted per run: without it, runs carry a random agent-local threadId
   * that the backend checkpoints under, making thread history unreachable.
   */
  resolveThreadId?: () => Promise<string | undefined>

  /**
   * Run the agent.
   *
   * @param {RunAgentInput} input - The input to the agent.
   *
   * @returns {Observable<BaseEvent>} The observable of the agent.
   */
  run(input: RunAgentInput): Observable<BaseEvent> {
    // resolve the thread id
    const input$ = this.resolveThreadId
      ? from(this.resolveThreadId().catch(() => undefined)).pipe(
          map((threadId) => (threadId ? { ...input, threadId } : input))
        )
      : of(input)

    // run the agent
    return input$.pipe(switchMap((patched) => this.runGraceful(patched)))
  }

  /**
   * Run the agent.
   *
   * @param {RunAgentInput} input - The input to the agent.
   *
   * @returns {Observable<BaseEvent>} The observable of the agent.
   */
  private runGraceful(input: RunAgentInput): Observable<BaseEvent> {
    // run the agent
    const raw$ = super.run(input)

    // return the observable
    return new Observable<BaseEvent>((subscriber) => {
      // subscribe to the raw observable
      const subscription = raw$.subscribe({
        next: (event) => subscriber.next(event),
        error: (err) => {
          // schema-validation failure: keep what streamed so far, warn loudly.
          if (err?.name === "ZodError") {
            console.warn(
              "[sitshelp] Invalid AG-UI event - ending stream early, partial response kept:",
              err.message?.slice(0, 200)
            )
            subscriber.complete()
            return
          }

          subscriber.error(err)
        },
        complete: () => subscriber.complete(),
      })

      return () => subscription.unsubscribe()
    })
  }
}
