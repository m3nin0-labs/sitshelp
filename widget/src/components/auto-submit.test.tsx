/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"

import { AutoSubmitInitialMessage } from "./auto-submit"
import { renderWithRuntime } from "../test/utils"

describe("AutoSubmitInitialMessage", () => {
  it("mounts without a message and renders nothing", () => {
    const { container } = renderWithRuntime(<AutoSubmitInitialMessage />)

    expect(container).toBeEmptyDOMElement()
  })
})
