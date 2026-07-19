/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"

import { createCitationPreprocessor, isCitationText } from "./citations"
import type { SourcesState } from "../types"

const sources: SourcesState = {
  S1: {
    title: "Data cubes",
    url: "https://e.sensing/cube",
    source_type: "documentation",
  },
  S2: {
    title: "No URL",
    source_type: "reference",
  },
}

describe("createCitationPreprocessor", () => {
  const pre = createCitationPreprocessor(sources)

  it("rewrites a resolvable marker into a markdown link", () => {
    expect(pre("See [S1] for details.")).toBe(
      'See [S1](<https://e.sensing/cube> "Data cubes") for details.'
    )
  })

  it("leaves markers with no resolvable URL untouched", () => {
    expect(pre("See [S2].")).toBe("See [S2].")

    expect(pre("See [S9].")).toBe("See [S9].")
  })

  it("does not rewrite markers inside fenced code blocks", () => {
    const input = "```\ncite [S1]\n```"

    expect(pre(input)).toBe(input)
  })

  it("does not rewrite markers inside inline code spans", () => {
    expect(pre("use `[S1]` literally")).toBe("use `[S1]` literally")
  })

  it("rewrites outside code but not inside on the same line", () => {
    const out = pre("real [S1] but not `[S1]`")

    expect(out).toContain("[S1](<https://e.sensing/cube>")
    expect(out).toContain("`[S1]`")
  })
})

describe("isCitationText", () => {
  it("recognizes bare markers", () => {
    expect(isCitationText("S1")).toBe(true)
    expect(isCitationText("S123")).toBe(true)
  })

  it("rejects non-markers", () => {
    expect(isCitationText("hello")).toBe(false)
    expect(isCitationText("[S1]")).toBe(false)
    expect(isCitationText("S")).toBe(false)
  })
})
