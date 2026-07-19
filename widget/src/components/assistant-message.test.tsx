/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"
import { waitFor } from "@testing-library/react"

import { AssistantMessage } from "./assistant-message"
import { UserMessage } from "./user-message"
import { renderMessages } from "../test/utils"

describe("AssistantMessage", () => {
  it("renders an assistant message with its copy action", async () => {
    const { container } = renderMessages([{ role: "assistant", content: "an answer" }], {
      UserMessage,
      AssistantMessage,
    })

    await waitFor(() => expect(container.querySelector(".sitshelp-copy-btn")).toBeInTheDocument())
  })
})
