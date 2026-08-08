/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { describe, expect, it } from "vitest"

import { scopeCss, scopeSelector } from "./scope-css"

describe("scopeSelector", () => {
  it("scopes a utility class to the widget subtree", () => {
    expect(scopeSelector(".flex")).toBe("#sitshelp-root .flex")
  })

  it("leaves already-scoped selectors untouched", () => {
    expect(scopeSelector("#sitshelp-root .sitshelp-prose a")).toBe(
      "#sitshelp-root .sitshelp-prose a"
    )
  })

  it("moves the theme variables onto the widget root", () => {
    expect(scopeSelector(":root")).toBe("#sitshelp-root")
    expect(scopeSelector(":host")).toBe("#sitshelp-root")
  })

  it("covers the root itself for the universal fallbacks", () => {
    expect(scopeSelector("*")).toBe("#sitshelp-root, #sitshelp-root *")
    expect(scopeSelector(":before")).toBe("#sitshelp-root:before, #sitshelp-root :before")
    expect(scopeSelector("::backdrop")).toBe("#sitshelp-root::backdrop, #sitshelp-root ::backdrop")
  })

  it("scopes selectors that start with a functional pseudo-class", () => {
    expect(scopeSelector(":where(.space-y-4 > :not(:last-child))")).toBe(
      "#sitshelp-root :where(.space-y-4 > :not(:last-child))"
    )
  })
})

describe("scopeCss", () => {
  it("stops Tailwind utilities from hitting Bootstrap class names", () => {
    // `.collapse` is what Quarto puts on its sidebar navigation. Unscoped,
    // Tailwind `visibility: collapse` hid the whole table of contents.
    const out = scopeCss(".collapse{visibility:collapse!important}")

    expect(out).toBe("#sitshelp-root .collapse{visibility:collapse!important}")
  })

  it("scopes every selector in a list", () => {
    const out = scopeCss(".mt-1,.mt-2{margin-top:1px}")

    expect(out).toBe("#sitshelp-root .mt-1,#sitshelp-root .mt-2{margin-top:1px}")
  })

  it("collapses :root and :host onto a single widget-root selector", () => {
    const out = scopeCss(":root,:host{--spacing:.25rem}")

    expect(out).toBe("#sitshelp-root{--spacing:.25rem}")
  })

  it("scopes rules nested in media and supports queries", () => {
    const out = scopeCss("@media (min-width:40rem){.sm\\:block{display:block}}")

    expect(out).toBe("@media (min-width:40rem){#sitshelp-root .sm\\:block{display:block}}")
  })

  it("leaves keyframe steps alone", () => {
    const out = scopeCss("@keyframes spin{from{opacity:0}to{opacity:1}}")

    expect(out).toBe("@keyframes spin{from{opacity:0}to{opacity:1}}")
  })

  it("leaves @property registrations alone", () => {
    const css = '@property --tw-rotate-x{syntax:"*";inherits:false}'

    expect(scopeCss(css)).toBe(css)
  })

  it("leaves no unscoped rule behind", () => {
    const out = scopeCss(
      ":root,:host{--spacing:.25rem}.flex{display:flex}@media (hover:hover){.hover\\:underline:hover{text-decoration:underline}}"
    )

    for (const selector of out.match(/(^|[{}])([^{}]+)\{/g) ?? []) {
      const cleaned = selector.replace(/^[{}]/, "").replace(/\{$/, "").trim()

      if (cleaned.startsWith("@")) {
        continue
      }

      for (const part of cleaned.split(",")) {
        expect(part.trim()).toMatch(/^#sitshelp-root\b/)
      }
    }
  })
})
