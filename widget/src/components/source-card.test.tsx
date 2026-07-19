/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { SourceCard } from "./source-card"

describe("SourceCard", () => {
  it("renders the source title", () => {
    render(
      <SourceCard
        source={{ title: "Getting started", source_type: "documentation" }}
        marker="[S1]"
      />
    )
    expect(screen.getByText("Getting started")).toBeInTheDocument()
  })
})
