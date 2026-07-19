/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { MessageSquareIcon, SquarePenIcon, XIcon } from "lucide-react"

/**
 * @interface
 *
 * SidebarHeaderProps Interface
 */
interface SidebarHeaderProps {
  /** Callback function to toggle the chat list. */
  onToggleChatList: () => void

  /** Callback function to create a new chat. */
  onNewChat: () => void

  /** Callback function to close the sidebar. */
  onClose: () => void

  /** Whether the chat list is open. */
  isChatListOpen: boolean
}

/**
 * @component
 * SidebarHeader Component
 *
 * @description Fixed header bar for the sidebar.
 *
 * @param {SidebarHeaderProps} props - Component props.
 *
 * @returns {JSX.Element} The rendered header bar.
 */
export function SidebarHeader({
  onToggleChatList,
  onNewChat,
  onClose,
  isChatListOpen,
}: SidebarHeaderProps) {
  return (
    <div className="flex items-center px-4 py-3 border-b border-border bg-background shrink-0 gap-2">
      <span className="flex-1 font-semibold text-[15px] text-foreground">SITS Assistant</span>

      {/* Chat list button */}
      <button
        className="sitshelp-header-btn"
        onClick={onToggleChatList}
        type="button"
        aria-label={isChatListOpen ? "Back to chat" : "View chat list"}
        title={isChatListOpen ? "Back to chat" : "Past chats"}
      >
        <MessageSquareIcon size={18} />
      </button>

      {/* New chat button */}
      <button
        className="sitshelp-header-btn"
        onClick={onNewChat}
        type="button"
        aria-label="New chat"
        title="New chat"
      >
        <SquarePenIcon size={18} />
      </button>

      {/* Close button */}
      <button
        className="sitshelp-header-btn"
        onClick={onClose}
        type="button"
        aria-label="Close"
        title="Close"
      >
        <XIcon size={18} />
      </button>
    </div>
  )
}
