/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"

import { Sidebar } from "./sidebar"
import { renderWithRuntime } from "../test/utils"

describe("Sidebar", () => {
  it("renders the dialog", () => {
    renderWithRuntime(<Sidebar isOpen onClose={vi.fn()} />)

    expect(screen.getByRole("dialog", { name: "SITS Assistant" })).toBeInTheDocument()
  })
})
