/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { AuiIf, ThreadPrimitive, useAuiState } from "@assistant-ui/react"
import { ChevronDownIcon } from "lucide-react"

import { AssistantMessage } from "./assistant-message"
import { UserMessage } from "./user-message"
import { WelcomeHeader, WelcomeSuggestions } from "./welcome"
import { AutoSubmitInitialMessage } from "./auto-submit"
import { AssistantAvatar } from "./avatar"
import { Composer } from "./composer"

import type { InitialMessageProps } from "../types"

/**
 * @component
 * Thread Component
 *
 * @description Unified chat thread.
 *
 * @param {InitialMessageProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered thread.
 */
export function Thread({ initialMessage, onInitialMessageHandled }: InitialMessageProps) {
  // render
  return (
    <ThreadPrimitive.Root className="flex flex-col flex-1 min-h-0 relative">
      <AutoSubmitInitialMessage
        initialMessage={initialMessage}
        onInitialMessageHandled={onInitialMessageHandled}
      />

      {/* Empty state: centered welcome + composer + suggestions */}
      <AuiIf condition={(s) => s.thread.isEmpty}>
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8">
          <WelcomeHeader />

          <div className="w-full max-w-[400px] mt-2">
            <Composer autoFocus hint />
          </div>

          <WelcomeSuggestions />
        </div>
      </AuiIf>

      {/* Conversation: scrollable messages + bottom composer */}
      <AuiIf condition={(s) => !s.thread.isEmpty}>
        <ThreadPrimitive.Viewport className="sitshelp-thread-viewport flex-1 overflow-y-auto p-4 scroll-smooth">
          <ThreadPrimitive.Messages
            components={{
              UserMessage: UserMessage,
              AssistantMessage: AssistantMessage,
            }}
          />

          <TypingIndicator />
        </ThreadPrimitive.Viewport>

        <ThreadPrimitive.ScrollToBottom className="absolute bottom-20 right-4 w-8 h-8 rounded-full bg-background border border-border shadow-md flex items-center justify-center cursor-pointer text-muted-foreground transition-opacity z-10">
          <ChevronDownIcon size={16} />
        </ThreadPrimitive.ScrollToBottom>

        <div className="px-4 py-3 border-t border-border bg-background shrink-0">
          <Composer />
        </div>
      </AuiIf>
    </ThreadPrimitive.Root>
  )
}

/**
 * @component
 * TypingIndicator Component
 *
 * @description Animated dots shown only before the assistant produces anything.
 *
 * @returns {JSX.Element} The rendered typing indicator.
 */
function TypingIndicator() {
  // state - whether the assistant is waiting
  const isWaiting = useAuiState(
    (s) => s.thread.isRunning && s.thread.messages[s.thread.messages.length - 1]?.role === "user"
  )

  // if not waiting, return null
  if (!isWaiting) {
    return null
  }

  // render
  return (
    <div className="flex gap-2.5 mb-4 items-start">
      <AssistantAvatar />

      <div className="flex-1 min-w-0 py-1.5">
        <div className="sitshelp-typing-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
