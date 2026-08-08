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

  it("backs the hint row so it stays readable over page content", () => {
    const { container } = render(
      <FloatingBar onSubmit={vi.fn()} visible showContinue onContinue={vi.fn()} />
    )

    const hintBar = container.querySelector(".sitshelp-hint-bar")

    expect(hintBar).not.toBeNull()
    expect(hintBar).toContainElement(container.querySelector(".sitshelp-kbd-hint"))
    expect(hintBar).toContainElement(screen.getByText(/Continue conversation/))
  })
})
