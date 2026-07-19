/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useMemo, useState } from "react"
import { useAuiState } from "@assistant-ui/react"
import { ChevronDownIcon } from "lucide-react"

import { SourceCard } from "./source-card"
import type { Source, SourcesState } from "../types"

/**
 * @interface
 *
 * SourcesProps Interface
 */
interface SourcesProps {
  /** The sources to display. */
  sources: SourcesState
}

/**
 * @component
 * Sources Component
 *
 * @description Citation section.
 *
 * @param {SourcesProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered sources.
 */
export function Sources({ sources }: SourcesProps) {
  // state - whether the sources are expanded
  const [expanded, setExpanded] = useState(false)

  // get entries
  const entries = Object.entries(sources)

  // if there are no entries, return null
  if (entries.length === 0) {
    return null
  }

  return (
    <div className="mt-2.5 border border-border rounded-lg overflow-hidden text-[13px]">
      <button
        className="flex items-center gap-1.5 px-3 py-2 bg-background border-none w-full cursor-pointer text-[13px] font-medium text-muted-foreground text-left hover:text-foreground"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <ChevronDownIcon
          size={12}
          className={`transition-transform duration-150 ${expanded ? "rotate-180" : ""}`}
        />
        Sources ({entries.length})
      </button>
      {expanded && (
        <div className="p-2 flex flex-col gap-1 border-t border-border">
          {entries.map(([marker, source]) => (
            <SourceCard key={marker} source={source} marker={`[${marker}]`} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * @hook
 * useSourcesState Hook
 *
 * @description Subscribes to thread state and extracts AG-UI sources.
 *
 * @returns {SourcesState | null} Sources dict or null if unavailable.
 */
export function useSourcesState(): SourcesState | null {
  // state - get agent state
  const agentState = useAuiState((s) => s.thread.state)

  // memoize the sources state
  return useMemo(() => {
    if (!agentState || typeof agentState !== "object" || Array.isArray(agentState)) {
      return null
    }

    // get sources
    const raw = (agentState as Record<string, unknown>)["sources"]
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return null
    }

    return validateSources(raw as Record<string, unknown>)
  }, [agentState])
}

/**
 * Validate the sources.
 *
 * @param {Record<string, unknown>} raw - The raw sources.
 *
 * @returns {SourcesState | null} The validated sources.
 */
function validateSources(raw: Record<string, unknown>): SourcesState | null {
  // initialize the result
  const result: Record<string, Source> = {}

  // iterate over the raw sources
  for (const [key, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      continue
    }

    // get entry
    const entry = value as Record<string, unknown>

    // get title and source type
    const title = entry["title"]
    const sourceType = entry["source_type"]

    // if not a string, continue
    if (typeof title !== "string" || typeof sourceType !== "string") {
      continue
    }

    // add the entry to the result
    result[key] = {
      title,
      source_type: sourceType,
      url: typeof entry["url"] === "string" ? entry["url"] : undefined,
    }
  }

  // if there are no result, return null
  return Object.keys(result).length > 0 ? result : null
}
