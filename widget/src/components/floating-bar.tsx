/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useRef, useEffect, useCallback, type KeyboardEvent } from "react"
import { ArrowUpIcon } from "lucide-react"

/**
 * @interface
 *
 * FloatingBarProps Interface
 */
interface FloatingBarProps {
  /** Callback function to submit the message. */
  onSubmit: (text: string) => void

  /** Whether the floating bar is visible. */
  visible: boolean

  /** Whether to show the continue conversation button. */
  showContinue: boolean

  /** Callback function to continue the conversation. */
  onContinue: () => void
}

/**
 * @component
 * FloatingBar Component
 *
 * @description Fixed bottom-center input. Hidden while the sidebar is open.
 *
 * @param {FloatingBarProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered floating bar.
 */
export function FloatingBar({ onSubmit, visible, showContinue, onContinue }: FloatingBarProps) {
  // state - textarea ref
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // callback - auto resize textarea
  const autoResize = useCallback(() => {
    const ta = textareaRef.current

    if (!ta) {
      return
    }

    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`
  }, [])

  // callback - submit message
  const submit = useCallback(() => {
    const ta = textareaRef.current

    if (!ta) {
      return
    }

    const text = ta.value.trim()
    if (!text) {
      return
    }

    ta.value = ""
    ta.style.height = "auto"

    onSubmit(text)
  }, [onSubmit])

  // callback - handle key down
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        submit()
      }
    },
    [submit]
  )

  // effect - handle "/" shortcut to focus the floating bar
  useEffect(() => {
    function handler(e: globalThis.KeyboardEvent) {
      if (e.key !== "/") return

      const el = e.target as HTMLElement
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable) {
        return
      }

      e.preventDefault()
      textareaRef.current?.focus()
    }

    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  // if not visible, do not render
  if (!visible) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998] w-[min(480px,calc(100vw-48px))] flex flex-col items-center gap-1.5">
      <div className="sitshelp-composer sitshelp-composer-floating w-full">
        <textarea
          ref={textareaRef}
          className="flex-1 border-none outline-none bg-transparent text-sm leading-5 text-foreground resize-none max-h-24 min-h-5 py-1 overflow-y-auto font-[inherit] placeholder:text-muted-foreground/60"
          placeholder='Ask about SITS…  Press "/" to focus'
          rows={1}
          onInput={autoResize}
          onKeyDown={handleKeyDown}
        />

        <button
          className="sitshelp-send-btn"
          onClick={submit}
          type="button"
          aria-label="Send message"
        >
          <ArrowUpIcon size={16} />
        </button>
      </div>

      <div className="sitshelp-hint-bar">
        <div className="sitshelp-kbd-hint">
          <kbd>Enter</kbd>
          <span>to send</span>
        </div>

        {showContinue && (
          <button
            className="text-xs text-muted-foreground bg-transparent border-none cursor-pointer px-2 py-0.5 rounded-lg transition-colors hover:text-accent-blue"
            onClick={onContinue}
            type="button"
          >
            Continue conversation &rarr;
          </button>
        )}
      </div>
    </div>
  )
}
