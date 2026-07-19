/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { createContext, useContext, useMemo } from "react"
import type { AnchorHTMLAttributes, ReactNode } from "react"
import { CopyIcon, CheckIcon } from "lucide-react"

import { ActionBarPrimitive, AuiIf, MessagePrimitive, useAuiState } from "@assistant-ui/react"
import { StreamdownTextPrimitive } from "@assistant-ui/react-streamdown"

import { createCodePlugin } from "@streamdown/code"
import { math } from "@streamdown/math"
import { mermaid } from "@streamdown/mermaid"

import { createCitationPreprocessor, isCitationText } from "../lib/citations"

import { AssistantAvatar } from "./avatar"
import { AgentStepsCard, getRunSteps } from "./agent-steps"
import { Sources, useSourcesState } from "./sources"
import type { SourcesState } from "../types"

/**
 * Sources context
 *
 * @description The thread state is not resolvable from inside message-part
 * scope, so the message component provides the sources to `MarkdownText` via
 * context.
 *
 * @returns The sources context.
 */
const SourcesContext = createContext<SourcesState | null>(null)

/**
 * Streamdown plugins.
 *
 * @description The `code` (Shiki) plugin must be passed explicitly.
 * We set both slots to github-light to avoid dark colors on the
 * widget background.
 */
const plugins = {
  code: createCodePlugin({ themes: ["github-light", "github-light"] }),
  math,
  mermaid,
}

/**
 * HTML tags/attributes Streamdown is allowed to render.
 *
 * @description The tags and attributes are the ones that are allowed to be
 * rendered by Streamdown.
 *
 * @returns The allowed tags and attributes.
 */
const allowedTags = {
  div: ["class", "id", "style"],
  span: ["class", "style"],
  table: ["class"],
  thead: [] as string[],
  tbody: [] as string[],
  tr: [] as string[],
  th: ["scope"],
  td: ["colspan", "rowspan"],
  img: ["src", "alt", "title", "width", "height"],
  details: ["open"],
  summary: [] as string[],
  sub: [] as string[],
  sup: [] as string[],
}

/**
 * Message part components.
 *
 * @description The text is rendered by `MarkdownText`, and tool calls are
 * hidden (they render grouped in the AgentStepsCard instead).
 *
 * @returns The message part components.
 */
const partComponents = {
  Text: MarkdownText,
  tools: { Fallback: () => null },
}

/**
 * @component
 * Assistant message
 *
 * @description Asingle component that renders a grouped "Agent steps" card.
 *
 * @returns {JSX.Element} The rendered markdown text.
 */
export function AssistantMessage() {
  // state - message id
  const messageId = useAuiState((s) => s.message.id)

  // state - last message flag
  const isLast = useAuiState((s) => s.message.isLast)

  // state - message status
  const isComplete = useAuiState((s) => s.message.status?.type === "complete")

  // state - has text
  const hasText = useAuiState((s) =>
    s.message.content.some((p) => p.type === "text" && p.text.trim().length > 0)
  )

  // state - all thread messages (steps of a run span multiple messages)
  const messages = useAuiState((s) => s.thread.messages)

  // state - thread running
  const isRunning = useAuiState((s) => s.thread.isRunning)

  // state - sources
  const sources = useSourcesState()

  // steps of the run this message belongs to
  const { steps, isFirstInRun, runHasText } = getRunSteps(messages, messageId)

  // state - show steps card / sources
  const showSteps = isFirstInRun && steps.length > 0
  const showSources = isLast && isComplete && !!sources

  // tool-only messages are folded into the steps card of the first message
  if (!hasText && !showSteps) {
    return null
  }

  return (
    <MessagePrimitive.Root className="group flex flex-col gap-1 mb-4">
      {showSteps && (
        <div className="flex gap-2.5 items-start">
          <AssistantAvatar />
          <div className="flex-1 min-w-0">
            <AgentStepsCard steps={steps} running={isRunning && !runHasText} />
          </div>
        </div>
      )}

      {hasText && (
        <div className="flex gap-2.5 items-start">
          {!showSteps && <AssistantAvatar />}
          {showSteps && <div className="w-[26px] shrink-0" aria-hidden="true" />}

          <div className="flex-1 min-w-0">
            {/* sources reflect the latest run only. Older messages keep
                plain-text markers rather than risk mislinked citations */}
            <SourcesContext.Provider value={isLast ? sources : null}>
              <MessagePrimitive.Content components={partComponents} />
            </SourcesContext.Provider>

            {showSources && <Sources sources={sources} />}

            <ActionBarPrimitive.Root
              hideWhenRunning
              autohide="not-last"
              className="flex gap-0.5 mt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
            >
              <ActionBarPrimitive.Copy className="sitshelp-copy-btn">
                <AuiIf condition={(s) => s.message.isCopied}>
                  <CheckIcon className="w-3.5 h-3.5 text-accent-blue" />
                </AuiIf>
                <AuiIf condition={(s) => !s.message.isCopied}>
                  <CopyIcon className="w-3.5 h-3.5" />
                </AuiIf>
              </ActionBarPrimitive.Copy>
            </ActionBarPrimitive.Root>
          </div>
        </div>
      )}
    </MessagePrimitive.Root>
  )
}

/**
 * @component
 * MarkdownText component
 *
 * @description Render markdown text using Streamdown.
 *
 * @note When AG-UI sources are available, `[S#]` citation markers are
 * rewritten into markdown links before parsing (preprocess), which
 * `ProseLink` then renders as citation chips.
 *
 * @returns {JSX.Element} The rendered markdown text.
 */
function MarkdownText() {
  // state - sources (for citation links, provided by AssistantMessage)
  const sources = useContext(SourcesContext)

  // preprocess - rewrite [S#] markers into markdown links
  const preprocess = useMemo(
    () => (sources ? createCitationPreprocessor(sources) : undefined),
    [sources]
  )

  return (
    <StreamdownTextPrimitive
      className="sitshelp-prose"
      plugins={plugins}
      allowedTags={allowedTags}
      preprocess={preprocess}
      components={proseComponents}
      lineNumbers={false}
      controls={{ code: true, table: false }}
      linkSafety={{ enabled: false }}
    />
  )
}

/**
 * @component
 * ProseLink Component
 *
 * @description Link renderer for message markdown: citation links (bare "S#" text,
 * created by the citation preprocessor) render as chips. Everything else
 * as a regular external link. All links open in a new tab.
 *
 * @param {AnchorHTMLAttributes<HTMLAnchorElement>} props - Anchor props.
 *
 * @returns {JSX.Element} The rendered link.
 */
function ProseLink({
  children,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode; node?: unknown }) {
  const { node: _node, ...anchorProps } = props
  const text = typeof children === "string" ? children : ""
  const cite = isCitationText(text)

  return (
    <a
      {...anchorProps}
      className={cite ? "sitshelp-cite" : className}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  )
}

/**
 * Prose component overrides
 */
const proseComponents = { a: ProseLink }
