/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useEffect } from "react"
import { useComposerRuntime } from "@assistant-ui/react"

import type { InitialMessageProps } from "../types"

/**
 * @component
 * AutoSubmitInitialMessage Component
 *
 * @description Invisible component that auto-submits an initial message into the composer
 * when provided. Used to redirect message from floating bar to sidebar.
 *
 * @param {InitialMessageProps} props - Component props.
 *
 * @returns {null} The rendered component.
 */
export function AutoSubmitInitialMessage({
  initialMessage,
  onInitialMessageHandled,
}: InitialMessageProps) {
  // state - composer runtime
  const composerRuntime = useComposerRuntime()

  // effect - submit initial message
  useEffect(() => {
    // if no initial message, return
    if (!initialMessage) {
      return
    }

    // set text and send message
    composerRuntime.setText(initialMessage)
    composerRuntime.send()

    // go!
    onInitialMessageHandled?.()
  }, [composerRuntime, initialMessage, onInitialMessageHandled])

  return null
}
