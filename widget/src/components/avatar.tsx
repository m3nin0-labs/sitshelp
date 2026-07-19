/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { Earth, UserIcon } from "lucide-react"

/**
 * AssistantAvatar Component
 *
 * Round accent avatar used for assistant messages and the typing indicator.
 *
 * @component
 * @returns {JSX.Element} The rendered assistant avatar.
 */
export function AssistantAvatar() {
  return (
    <div className="w-[26px] h-[26px] rounded-full bg-accent-blue flex items-center justify-center shrink-0 text-white mt-0.5">
      {/* ToDo: Review icon with something from SITS */}
      <Earth size={14} />
    </div>
  )
}

/**
 * UserAvatar Component
 *
 * Round muted avatar used for user messages.
 *
 * @component
 * @returns {JSX.Element} The rendered user avatar.
 */
export function UserAvatar() {
  return (
    <div className="w-[26px] h-[26px] rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 text-muted-foreground mt-0.5">
      <UserIcon size={14} />
    </div>
  )
}
