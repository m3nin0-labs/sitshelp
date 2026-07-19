/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useEffect, useState } from "react"
import { ChevronDownIcon } from "lucide-react"

import type { ThreadMessage, ToolCallMessagePart } from "@assistant-ui/react"

/**
 * Highlevel labels for backend tool names.
 */
const TOOL_LABELS: Record<string, string> = {
  search_documentation: "Searching documentation",
  search_reference: "Searching function reference",
  get_function_detail: "Getting function details",
  search_articles: "Searching articles",
  lookup_spectral_index: "Looking up spectral index",
  lookup_satellite: "Looking up satellite info",
  lookup_collection: "Looking up data collection",
}

/**
 * @interface
 *
 * Interface for the steps of a run.
 */
export interface RunSteps {
  /** The steps of the run. */
  steps: ToolCallMessagePart[]

  /** Whether the run is the first in the run. */
  isFirstInRun: boolean

  /** Whether the run has text. */
  runHasText: boolean
}

/**
 * Collect the tool calls of one run.
 *
 * @description The backend emits one tool call per assistant message, so a
 * run calls span consecutive assistant messages.
 *
 * @param messages - The messages to collect the tool calls from.
 * @param messageId - The id of the message to collect the tool calls from.
 *
 * @returns The steps of the run.
 */
export function getRunSteps(messages: readonly ThreadMessage[], messageId: string): RunSteps {
  // find the index of the message in the messages array
  const index = messages.findIndex((m) => m.id === messageId)

  // if no result, return empty run
  if (index === -1) {
    return {
      steps: [],
      isFirstInRun: false,
      runHasText: false,
    }
  }

  // walk back to the first assistant message of the run
  let runStart = index

  while (runStart > 0 && messages[runStart - 1]?.role === "assistant") {
    runStart -= 1
  }

  // walk forward collecting tool calls until the run ends
  const steps = []
  let runHasText = false

  for (let i = runStart; i < messages.length; i += 1) {
    const message = messages[i]

    if (!message || message.role !== "assistant") {
      break
    }

    for (const part of message.content) {
      if (part.type === "tool-call") {
        steps.push(part)
      }

      if (part.type === "text" && part.text.trim()) {
        runHasText = true
      }
    }
  }

  return {
    steps,
    isFirstInRun: index === runStart,
    runHasText,
  }
}

/**
 * @interface
 *
 * Interface for the props of the AgentStepsCard component.
 */
interface AgentStepsCardProps {
  /** The steps of the run. */
  steps: ToolCallMessagePart[]

  /** Whether the run is currently running. */
  running: boolean
}

/**
 * Agent steps card component.
 *
 * @description Display the steps of an agent run.
 *
 * @param steps - The steps of the run.
 * @param running - Whether the run is currently running.
 *
 * @returns
 */
export function AgentStepsCard({ steps, running }: AgentStepsCardProps) {
  // auto-open while running, collapse on completion
  const [isOpen, setIsOpen] = useState(running)

  // effect - auto-open while running
  useEffect(() => {
    setIsOpen(running)
  }, [running])

  // render!
  return (
    <div className="sitshelp-steps-card">
      <button
        className="sitshelp-steps-header"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        aria-expanded={isOpen}
      >
        {running && <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse shrink-0" />}

        <span className="flex-1">
          {running ? "Thinking" : "Agent steps"}{" "}
          <span className="sitshelp-steps-count">({steps.length})</span>
        </span>

        <ChevronDownIcon
          size={14}
          className={`text-muted-foreground transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="sitshelp-steps-body">
          {steps.map((step, index) => (
            <div key={step.toolCallId} className="sitshelp-steps-row">
              <span className="sitshelp-steps-num">{String(index + 1).padStart(2, "0")}</span>

              <span>{getStepLabel(step.toolName, step.args as Record<string, unknown>)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Generate a label for a tool call.
 *
 * @description Display the tool name and the primary argument text.
 *
 * @param toolName - The name of the tool.
 * @param args - The arguments of the tool.
 * @returns The label for the tool call.
 */
function getStepLabel(toolName: string, args: Record<string, unknown>) {
  const label = TOOL_LABELS[toolName] ?? humanizeToolName(toolName)
  const subject = getPrimaryArgText(args)

  if (!subject) {
    return label
  }

  return `${label}: "${subject}"`
}

/**
 * Best-guess "subject" of a tool call, from the first matching arg key.
 *
 * @description The subject is the primary argument text of the tool call.
 *
 * @param args - The arguments of the tool.
 *
 * @returns The subject of the tool call.
 */
function getPrimaryArgText(args: Record<string, unknown>) {
  const preferredKeys = [
    "query",
    "term",
    "name",
    "title",
    "reference",
    "article",
    "collection",
    "satellite",
    "index",
    "id",
  ]

  for (const key of preferredKeys) {
    const value = args[key]

    if (typeof value === "string" && value.trim()) {
      return value.trim()
    }
  }

  return undefined
}

/**
 * Fallback label for an unknown tool.
 *
 * @description Try to convert the tool name to a human-readable label.
 *
 * @param toolName - The name of the tool.
 *
 * @returns The human-readable label.
 */
function humanizeToolName(toolName: string) {
  // ToDo: Best effort here. Should we change it ?
  return toolName
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
}
