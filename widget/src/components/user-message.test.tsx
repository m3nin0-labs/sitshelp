/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"

import { UserMessage } from "./user-message"
import { AssistantMessage } from "./assistant-message"
import { renderMessages } from "../test/utils"

describe("UserMessage", () => {
  it("renders the message text", async () => {
    renderMessages([{ role: "user", content: "hello there" }], {
      UserMessage,
      AssistantMessage,
    })

    expect(await screen.findByText("hello there")).toBeInTheDocument()
  })
})
