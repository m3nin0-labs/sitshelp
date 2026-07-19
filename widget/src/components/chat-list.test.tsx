/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"

import { ChatList } from "./chat-list"
import { renderWithRuntime } from "../test/utils"

describe("ChatList", () => {
  it("renders the header", () => {
    renderWithRuntime(<ChatList onBack={vi.fn()} onSelectThread={vi.fn()} />)

    expect(screen.getByText("Past chats")).toBeInTheDocument()
  })
})
