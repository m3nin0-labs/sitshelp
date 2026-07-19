/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import type { ThreadMessage } from "@assistant-ui/react"

import { getRunSteps } from "./agent-steps"

/**
 * Build a thread message with the given role and parts
 *
 * @param id - The message id
 * @param role - The message role
 * @param parts - The message parts
 *
 * @returns The thread message
 */
function message(
  id: string,
  role: "user" | "assistant",
  parts: Array<
    { type: "tool-call"; toolCallId: string; toolName: string } | { type: "text"; text: string }
  >
): ThreadMessage {
  return { id, role, content: parts } as unknown as ThreadMessage
}

/**
 * Build a tool call with the given id and name
 *
 * @param id - The tool call id
 * @param name - The tool call name
 *
 * @returns The tool call
 */
function toolCall(id: string, name = "search_documentation") {
  return { type: "tool-call" as const, toolCallId: id, toolName: name }
}

describe("getRunSteps", () => {
  it("returns empty when the message id is not found", () => {
    const messages = [message("u1", "user", [{ type: "text", text: "hi" }])]

    expect(getRunSteps(messages, "missing")).toEqual({
      steps: [],
      isFirstInRun: false,
      runHasText: false,
    })
  })

  it("collects tool calls across consecutive assistant messages of a run", () => {
    const messages = [
      message("u1", "user", [{ type: "text", text: "q" }]),
      message("a1", "assistant", [toolCall("t1")]),
      message("a2", "assistant", [toolCall("t2")]),
      message("a3", "assistant", [{ type: "text", text: "answer" }]),
    ]

    const first = getRunSteps(messages, "a1")

    expect(first.steps.map((s) => s.toolCallId)).toEqual(["t1", "t2"])
    expect(first.isFirstInRun).toBe(true)
    expect(first.runHasText).toBe(true)
  })

  it("reports isFirstInRun=false for a non-leading message in the run", () => {
    const messages = [
      message("a1", "assistant", [toolCall("t1")]),
      message("a2", "assistant", [toolCall("t2")]),
    ]

    // get run step
    const mid = getRunSteps(messages, "a2")

    expect(mid.isFirstInRun).toBe(false)
    expect(mid.steps.map((s) => s.toolCallId)).toEqual(["t1", "t2"])
  })

  it("stops the run at a user-message boundary", () => {
    const messages = [
      message("a1", "assistant", [toolCall("t1")]),
      message("u1", "user", [{ type: "text", text: "next" }]),
      message("a2", "assistant", [toolCall("t2")]),
    ]

    // get run steps
    const run = getRunSteps(messages, "a2")

    expect(run.steps.map((s) => s.toolCallId)).toEqual(["t2"])
    expect(run.isFirstInRun).toBe(true)
  })

  it("reports runHasText=false for a tool-only run", () => {
    const messages = [message("a1", "assistant", [toolCall("t1")])]

    expect(getRunSteps(messages, "a1").runHasText).toBe(false)
  })
})
