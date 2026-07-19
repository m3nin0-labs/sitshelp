/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { MessagePrimitive } from "@assistant-ui/react"

import { UserAvatar } from "./avatar"

/**
 * @component
 * UserMessage Component
 *
 * @description Avatar and message bubble.
 *
 * @returns {JSX.Element} The rendered user message.
 */
export function UserMessage() {
  // render
  return (
    <MessagePrimitive.Root className="flex gap-2.5 mb-4 items-start">
      <UserAvatar />
      <div className="flex-1 min-w-0">
        <div className="inline-block bg-secondary text-foreground px-3.5 py-2.5 rounded-[2px_12px_12px_12px] max-w-full text-sm leading-6 break-words">
          <MessagePrimitive.Content />
        </div>
      </div>
    </MessagePrimitive.Root>
  )
}
