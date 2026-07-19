/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import type { Source } from "../types"

/**
 * Known source types.
 *
 * @type {Set<string>}
 */
const KNOWN_TYPES: Set<string> = new Set([
  "documentation",
  "reference",
  "reference_full",
  "article",
  "satellite",
  "collection",
])

/**
 * Badge labels by source type.
 *
 * @type {Record<string, string>}
 */
const sourceTypeLabels: Record<string, string> = {
  documentation: "Docs",
  reference: "Ref",
  reference_full: "Ref",
  article: "Article",
  satellite: "Satellite",
  collection: "Collection",
}

/**
 * Full source type names, used as a title fallback.
 *
 * @type {Record<string, string>}
 */
const sourceTypeNames: Record<string, string> = {
  documentation: "Documentation",
  reference: "Function reference",
  reference_full: "Function reference",
  article: "Article",
  satellite: "Satellite",
  collection: "Data collection",
}

/**
 * @interface
 *
 * SourceCardProps Interface
 */
interface SourceCardProps {
  /** The source object. */
  source: Source

  /** The marker for the source. */
  marker: string
}

/**
 * SourceCard Component
 *
 * @description A single source citation: colored type badge, title, and optional link.
 *
 * @param {SourceCardProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered source card.
 */
export function SourceCard({ source, marker }: SourceCardProps) {
  // get source type
  const type = source.source_type.toLowerCase()

  // get background color
  const bgColor = `var(--sitshelp-badge-${KNOWN_TYPES.has(type) ? type : "fallback"})`

  // render content
  const content = (
    <>
      <span className="sitshelp-badge" style={{ backgroundColor: bgColor }}>
        {formatSourceType(source.source_type)}
      </span>

      <span className="text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        {displayTitle(source)}
      </span>

      <span className="text-[11px] text-muted-foreground">{marker}</span>
    </>
  )

  if (source.url) {
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="sitshelp-source-card"
      >
        {content}
      </a>
    )
  }

  return <div className="sitshelp-source-card">{content}</div>
}

/**
 * Format the source type.
 *
 * @param {string} type - The source type.
 *
 * @returns {string} The formatted source type.
 */
function formatSourceType(type: string): string {
  return sourceTypeLabels[type.toLowerCase()] ?? type
}

/**
 * Display the source title.
 *
 * @param {Source} source - The source object.
 *
 * @returns {string} The displayed source title.
 */
function displayTitle(source: Source): string {
  // get title
  const title = source.title.trim()

  // if title is long enough, return it
  if (title.length >= 4) {
    return title
  }

  if (source.url) {
    try {
      const url = new URL(source.url)

      // get segment
      const segment = decodeURIComponent(
        url.pathname.split("/").filter(Boolean).pop() ?? ""
      ).replace(/\.[a-z]+$/i, "")

      // if segment is not empty, return it
      if (segment) {
        return `${url.hostname} › ${segment}`
      }

      // otherwise, return the hostname
      return url.hostname
    } catch {
      // fall through to type name
    }
  }

  return sourceTypeNames[source.source_type.toLowerCase()] ?? title
}
