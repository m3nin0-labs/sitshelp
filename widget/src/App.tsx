/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { useCallback, useEffect, useMemo, useState } from "react"

import { FloatingBar } from "./components/floating-bar"
import { Sidebar } from "./components/sidebar"
import { RuntimeProvider } from "./providers/runtime-provider"
import { listThreads } from "./lib/local-store"
import type { SitsHelpConfig } from "./types"

/**
 * Get the configuration from the host page.
 *
 * @returns {SitsHelpConfig} The configuration.
 */
function getConfig(): SitsHelpConfig {
  const config = window.__SITSHELP_CONFIG__

  if (config?.apiUrl) {
    return config
  }

  console.warn(
    "[sitshelp] No configuration found. Set window.__SITSHELP_CONFIG__ = { apiUrl: '...' }"
  )

  return { apiUrl: "" }
}

/**
 * App
 *
 * @description Root SITSHelp app component.
 *
 * @returns {ReactNode} The App.
 */
export function App() {
  // get the configuration
  const config = useMemo(() => getConfig(), [])

  // state variables
  const [isOpen, setIsOpen] = useState(false)
  const [hasConversation, setHasConversation] = useState(false)
  const [initialMessage, setInitialMessage] = useState<string | undefined>()

  // effect - check existing threads
  useEffect(() => {
    // if there are existing threads
    if (listThreads().length > 0) {
      // update has conversation
      setHasConversation(true)
    }
  }, [])

  // handler - handle floating bar submit
  const handleFloatingBarSubmit = useCallback((text: string) => {
    setInitialMessage(text)
    setIsOpen(true)
    setHasConversation(true)
  }, [])

  // handler - handle continue
  const handleContinue = useCallback(() => {
    setIsOpen(true)
  }, [])

  // handler - handle close
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setInitialMessage(undefined)
  }, [])

  // handler - handle initial message handled
  const handleInitialMessageHandled = useCallback(() => {
    setInitialMessage(undefined)
  }, [])

  // return the app
  return (
    // provide the runtime
    <RuntimeProvider agentUrl={config.apiUrl}>
      <FloatingBar
        onSubmit={handleFloatingBarSubmit}
        visible={!isOpen}
        showContinue={hasConversation && !isOpen}
        onContinue={handleContinue}
      />

      <Sidebar
        isOpen={isOpen}
        onClose={handleClose}
        initialMessage={initialMessage}
        onInitialMessageHandled={handleInitialMessageHandled}
      />
    </RuntimeProvider>
  )
}
