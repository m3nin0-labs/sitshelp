/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"

import { AssistantAvatar, UserAvatar } from "./avatar"

describe("avatar", () => {
  it("renders the assistant avatar", () => {
    const { container } = render(<AssistantAvatar />)

    expect(container.firstChild).toBeInTheDocument()
  })

  it("renders the user avatar", () => {
    const { container } = render(<UserAvatar />)

    expect(container.firstChild).toBeInTheDocument()
  })
})
