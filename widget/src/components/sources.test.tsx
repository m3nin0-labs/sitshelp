/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { Sources } from "./sources"

describe("Sources", () => {
  it("renders the collapsed sources summary", () => {
    render(<Sources sources={{ S1: { title: "Doc", source_type: "documentation" } }} />)

    expect(screen.getByText("Sources (1)")).toBeInTheDocument()
  })
})
