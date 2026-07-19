/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"

import { SidebarHeader } from "./sidebar-header"

describe("SidebarHeader", () => {
  it("renders the title", () => {
    render(
      <SidebarHeader
        onToggleChatList={vi.fn()}
        onNewChat={vi.fn()}
        onClose={vi.fn()}
        isChatListOpen={false}
      />
    )

    expect(screen.getByText("SITS Assistant")).toBeInTheDocument()
  })
})
