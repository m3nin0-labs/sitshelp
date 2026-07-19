/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { ComposerPrimitive, ThreadPrimitive } from "@assistant-ui/react"
import { ArrowUpIcon, SquareIcon } from "lucide-react"

/**
 * @interface
 *
 * ComposerProps Interface
 */
interface ComposerProps {
  /** Placeholder text for the input. */
  placeholder?: string

  /** Whether the input should auto-focus. */
  autoFocus?: boolean

  /** Whether to show the keyboard hint below the frame. */
  hint?: boolean
}

/**
 * @component
 * Composer Component
 *
 * @description Chat composer input.
 *
 * @param {ComposerProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered composer.
 */
export function Composer({ placeholder = "Ask about SITS...", autoFocus, hint }: ComposerProps) {
  return (
    <ComposerPrimitive.Root className="w-full">
      <div className="sitshelp-composer">
        {/* input */}
        <ComposerPrimitive.Input
          className="flex-1 border-none outline-none bg-transparent text-sm leading-5 text-foreground resize-none max-h-[120px] min-h-5 py-1 overflow-y-auto font-[inherit] placeholder:text-muted-foreground/60"
          placeholder={placeholder}
          autoFocus={autoFocus}
        />

        {/* send button */}
        <ThreadPrimitive.If running={false}>
          <ComposerPrimitive.Send className="sitshelp-send-btn" aria-label="Send message">
            <ArrowUpIcon size={16} />
          </ComposerPrimitive.Send>
        </ThreadPrimitive.If>

        {/* stop button */}
        <ThreadPrimitive.If running>
          <ComposerPrimitive.Cancel className="sitshelp-send-btn" aria-label="Stop generating">
            <SquareIcon size={12} fill="currentColor" />
          </ComposerPrimitive.Cancel>
        </ThreadPrimitive.If>
      </div>

      {/* keyboard hint */}
      {hint && <ComposerHint />}
    </ComposerPrimitive.Root>
  )
}

/**
 * @component
 * ComposerHint Component
 *
 * @description Keyboard hint shown below the composer frame.
 *
 * @returns {JSX.Element} The rendered hint.
 */
export function ComposerHint() {
  return (
    <div className="sitshelp-kbd-hint mt-1.5 px-1">
      <kbd>Enter</kbd>
      <span>to send</span>

      <span aria-hidden="true">&middot;</span>

      <kbd>Shift+Enter</kbd>
      <span>new line</span>
    </div>
  )
}
