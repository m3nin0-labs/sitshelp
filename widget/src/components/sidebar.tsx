/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useState, useCallback } from "react"
import { useAui } from "@assistant-ui/react"

import { SidebarHeader } from "./sidebar-header"
import { Thread } from "./thread"
import { ChatList } from "./chat-list"
import { loadSidebarWidth, saveSidebarWidth } from "../lib/local-store"

/** Minimum width of the sidebar. */
const MIN_WIDTH = 360

/** Default width of the sidebar. */
const DEFAULT_WIDTH = 480

/**
 * @interface
 *
 * SidebarProps Interface
 */
interface SidebarProps {
  /** Whether the sidebar is open. */
  isOpen: boolean

  /** Callback function to close the sidebar. */
  onClose: () => void

  /** Initial message to display in the thread. */
  initialMessage?: string

  /** Callback function to handle the initial message. */
  onInitialMessageHandled?: () => void
}

/**
 * Get the maximum width of the sidebar.
 *
 * @returns {number} The maximum width of the sidebar.
 */
function getMaxWidth() {
  return Math.floor(window.innerWidth * 0.75)
}

/**
 * Load the width from local storage
 *
 * @returns {number} The width from local storage
 */
function loadWidth(): number {
  // load current width
  const stored = loadSidebarWidth()

  // if width is valid, return it
  if (stored !== null && stored >= MIN_WIDTH && stored <= getMaxWidth()) {
    return stored
  }

  // otherwise, return the default width
  return DEFAULT_WIDTH
}

/**
 * @component
 * SidebarInner Component
 *
 * @description Inner sidebar content that uses the runtime API.
 *
 * @param {SidebarProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered sidebar inner.
 */
export function Sidebar({
  isOpen,
  onClose,
  initialMessage,
  onInitialMessageHandled,
}: SidebarProps) {
  const aui = useAui()
  // state - show chat list
  const [showChatList, setShowChatList] = useState(false)

  // state - sidebar width
  const [sidebarWidth, setSidebarWidth] = useState(loadWidth)

  // state - whether the sidebar is resizing
  const [isResizing, setIsResizing] = useState(false)

  // callback - handle mouse down to resize the sidebar
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)

    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    // callback - handle mouse move
    function onMouseMove(ev: MouseEvent) {
      setSidebarWidth(Math.max(MIN_WIDTH, Math.min(getMaxWidth(), window.innerWidth - ev.clientX)))
    }

    // callback - handle mouse up
    function onMouseUp() {
      setIsResizing(false)

      document.body.style.cursor = ""
      document.body.style.userSelect = ""

      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)

      setSidebarWidth((w) => {
        saveSidebarWidth(w)
        return w
      })
    }

    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
  }, [])

  // callback - handle toggle chat list
  const handleToggleChatList = useCallback(() => {
    setShowChatList((current) => !current)
  }, [])

  // callback - handle new chat
  const handleNewChat = useCallback(() => {
    aui.threads().switchToNewThread()
    setShowChatList(false)
  }, [aui])

  // render
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998] sm:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 h-dvh bg-background border-l border-border z-[9999] flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.08)] transition-transform duration-[250ms] ease-in-out max-sm:!w-full ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="SITS Assistant"
        style={{
          width: sidebarWidth,
          ...(isResizing ? { transition: "none" } : {}),
        }}
      >
        <div
          className="absolute left-0 top-0 w-1 h-full cursor-col-resize z-10 bg-transparent transition-colors hover:bg-accent-blue active:bg-accent-blue"
          onMouseDown={handleMouseDown}
        />

        <SidebarHeader
          onToggleChatList={handleToggleChatList}
          onNewChat={handleNewChat}
          onClose={onClose}
          isChatListOpen={showChatList}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {showChatList ? (
            <ChatList
              onBack={() => setShowChatList(false)}
              onSelectThread={() => setShowChatList(false)}
            />
          ) : (
            <Thread
              initialMessage={initialMessage}
              onInitialMessageHandled={onInitialMessageHandled}
            />
          )}
        </div>
      </div>
    </>
  )
}
