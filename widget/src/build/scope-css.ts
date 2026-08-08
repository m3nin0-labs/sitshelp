/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import postcss from "postcss"
import type { Plugin } from "vite"

/** Element the widget mounts into. */
export const SCOPE = "#sitshelp-root"

/**
 * Selectors Tailwind emits for "every element in the document".
 *
 * They carry the `--tw-*` custom property fallbacks for browsers without
 * `@property`, so they have to cover the widget root itself, not just its
 * descendants. Anything not listed here is scoped as a descendant only, which
 * is always safe.
 */
const UNIVERSAL = new Set(["*", ":before", ":after", "::before", "::after", "::backdrop"])

/**
 * Restrict a single selector to the widget subtree.
 *
 * @param selector - One selector from a rule selector list.
 * @returns {string} The equivalent selector, confined to `#sitshelp-root`.
 */
export function scopeSelector(selector: string): string {
  const trimmed = selector.trim()

  // Hand-written rules in `styles.css` are already scoped,
  // so we can skip it
  if (trimmed.includes(SCOPE)) {
    return trimmed
  }

  // Tailwind theme variables. The utilities that read them all live inside
  // the widget, so the widget root is the right place to declare them
  if (trimmed === ":root" || trimmed === ":host") {
    return SCOPE
  }

  if (UNIVERSAL.has(trimmed)) {
    const pseudo = trimmed === "*" ? "" : trimmed

    return `${SCOPE}${pseudo}, ${SCOPE} ${trimmed}`
  }

  return `${SCOPE} ${trimmed}`
}

/**
 * Confine every rule in a stylesheet to the widget subtree.
 *
 * Tailwind emits its utilities as unscoped, `!important` global rules. Quarto
 * pages are built on Bootstrap, which uses some of the same class names. Most
 * damagingly `.collapse`, which Bootstrap puts on the sidebar navigation and
 * Tailwind turns into `visibility: collapse`. Scoping the output keeps the
 * widget styles off the host page.
 *
 * `@keyframes` steps are left alone (their "selectors" are percentages), and so
 * are `@property` rules, which are global by definition.
 *
 * @param css - The compiled stylesheet.
 * @returns {string} The stylesheet with every selector scoped.
 */
export function scopeCss(css: string): string {
  const root = postcss.parse(css)

  root.walkRules((rule) => {
    let parent: postcss.Container | postcss.Document | undefined = rule.parent

    while (parent) {
      if (parent.type === "atrule" && /keyframes$/.test((parent as postcss.AtRule).name)) {
        return
      }

      parent = parent.parent
    }

    // `:root` and `:host` both collapse onto the widget root, so dedupe.
    rule.selectors = [...new Set(rule.selectors.map(scopeSelector))]
  })

  return root.toString()
}

/**
 * Vite plugin applying {@link scopeCss} to the stylesheet the build emits.
 *
 * It runs in `generateBundle` because `@tailwindcss/vite` compiles (and
 * minifies) the utilities in its own `transform` hook, so this is the first
 * point where the final CSS is available.
 *
 * @returns {Plugin} The Vite plugin.
 */
export function scopeCssPlugin(): Plugin {
  return {
    name: "sitshelp:scope-css",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== "asset" || !asset.fileName.endsWith(".css")) {
          continue
        }

        asset.source = scopeCss(asset.source.toString())
      }
    },
  }
}
