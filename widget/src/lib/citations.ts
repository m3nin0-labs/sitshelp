/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import type { SourcesState } from "../types"

/**
 * Citation marker pattern (e.g. `[S1]`, `[S12]`)
 */
const MARKER = /\[(S\d+)\]/g

/**
 * Fence delimiter pattern (``` or ~~~)
 */
const FENCE = /^\s*(```|~~~)/

/**
 * Inline code span pattern (odd split indices are code spans)
 */
const INLINE_CODE = /(`+[^`]*`+)/g

/**
 * Create a markdown preprocessor that links `[S#]` citation markers.
 *
 * @description Rewrites markers into markdown links (`[S1](<url> "title")`)
 * directly in the message text (skipping code blocks and non applicable others).
 *
 * @param {SourcesState} sources - Sources dict keyed by marker ("S1"...)
 *
 * @returns {Function} Preprocessor for StreamdownTextPrimitive's `preprocess`
 */
export function createCitationPreprocessor(sources: SourcesState) {
  return (text: string): string => {
    let inFence = false

    const lines = text.split("\n").map((line) => {
      // if the line is a fence delimiter
      if (FENCE.test(line)) {
        // toggle in fance flag (so we know when we're in a code block)
        inFence = !inFence

        return line
      }

      // if in a code block, return the line unchanged
      if (inFence) {
        return line
      }

      // replace markers only outside inline code spans
      return line
        .split(INLINE_CODE)
        .map((segment, index) => (index % 2 === 1 ? segment : linkMarkers(segment, sources)))
        .join("")
    })

    return lines.join("\n")
  }
}

/**
 * Link markers in a text segment.
 *
 * @description Replace `[S#]` markers in a plain-text segment with markdown links
 *
 * @param {string} segment - Text segment (no code spans)
 * @param {SourcesState} sources - Sources dict keyed by marker
 *
 * @returns {string} Segment with linkable markers rewritten
 */
function linkMarkers(segment: string, sources: SourcesState): string {
  return segment.replace(MARKER, (full, marker: string) => {
    // only link markers with a resolvable source URL
    const source = sources[marker]

    if (!source?.url) {
      return full
    }

    // get title and remove special characters
    const title = (source.title ?? "").replace(/["\n]/g, "").trim()

    // return the linked marker
    return `[${marker}](<${source.url}> "${title}")`
  })
}

/**
 * Check if a rendered link is a citation chip.
 *
 * @description Recognized by its visible text (a bare marker like "S1")
 *
 * @param {string} text - Text to check
 * @returns {boolean} True if the text is a citation chip
 */
export function isCitationText(text: string): boolean {
  return /^S\d+$/.test(text)
}
