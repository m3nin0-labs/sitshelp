/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

import { FloatingBar } from "./floating-bar"

describe("FloatingBar", () => {
  it("renders the input when visible", () => {
    render(<FloatingBar onSubmit={vi.fn()} visible showContinue={false} onContinue={vi.fn()} />)

    expect(screen.getByLabelText("Send message")).toBeInTheDocument()
  })
})
