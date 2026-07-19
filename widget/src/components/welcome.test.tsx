/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { WelcomeHeader } from "./welcome"

describe("WelcomeHeader", () => {
  it("renders the heading", () => {
    render(<WelcomeHeader />)

    expect(screen.getByText("What can I help with?")).toBeInTheDocument()
  })
})
