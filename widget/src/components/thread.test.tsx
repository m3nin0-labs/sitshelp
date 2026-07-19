/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"

import { Thread } from "./thread"
import { renderWithRuntime } from "../test/utils"

describe("Thread", () => {
  it("renders the empty-state welcome", async () => {
    renderWithRuntime(<Thread />)

    expect(await screen.findByText("What can I help with?")).toBeInTheDocument()
  })
})
