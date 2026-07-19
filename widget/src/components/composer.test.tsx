/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"

import { Composer } from "./composer"
import { renderWithRuntime } from "../test/utils"

describe("Composer", () => {
  it("renders the input and send button", () => {
    renderWithRuntime(<Composer />)

    expect(screen.getByLabelText("Send message")).toBeInTheDocument()
  })
})
