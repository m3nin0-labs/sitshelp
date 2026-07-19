/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import type { ToolCallMessagePart } from "@assistant-ui/react"

import { AgentStepsCard } from "./agent-steps"

/**
 * A single tool-call step.
 *
 * @type {ToolCallMessagePart[]}
 */
const steps = [
  {
    type: "tool-call",
    toolCallId: "t1",
    toolName: "search_documentation",
    args: {},
  },
] as unknown as ToolCallMessagePart[]

describe("AgentStepsCard", () => {
  it("renders the step count", () => {
    render(<AgentStepsCard steps={steps} running={false} />)
    expect(screen.getByText("(1)")).toBeInTheDocument()
  })
})
