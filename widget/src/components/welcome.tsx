/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { ThreadPrimitive } from "@assistant-ui/react"
import { Earth } from "lucide-react"

import type { SuggestionConfig } from "@assistant-ui/react"

/**
 * @constant
 * SITSSuggestions
 *
 * Starter prompts shown as pills on the empty thread.
 *
 * @type {SuggestionConfig[]}
 */
export const SITSSuggestions: SuggestionConfig[] = [
  {
    title: "What is the SITS R package?",
    label: "SITS overview",
    prompt: "What is the SITS R package and what are its main capabilities?",
  },
  {
    title: "Create a data cube",
    label: "Data cube",
    prompt: "How do I create a data cube using sits_cube()?",
  },
  {
    title: "Land use classification",
    label: "Classification",
    prompt: "Show me a step-by-step example of land use and land cover classification with SITS.",
  },
  {
    title: "Satellite data sources",
    label: "Data sources",
    prompt: "What satellite data sources and collections are available in SITS?",
  },
]

/**
 * @component
 * WelcomeHeader Component
 *
 * @returns {JSX.Element} The welcome header content.
 */
export function WelcomeHeader() {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 pb-4">
      <div className="w-[52px] h-[52px] rounded-[14px] bg-accent-blue flex items-center justify-center mb-1.5">
        <Earth size={28} color="white" />
      </div>

      <h2 className="text-xl font-bold text-foreground mb-0.5">What can I help with?</h2>

      <p className="text-[13px] text-muted-foreground mb-0">
        Ask about the SITS R Package for satellite image time series analysis
      </p>

      <div className="w-10 h-px bg-border mt-2" />
    </div>
  )
}

/**
 * WelcomeSuggestions Component
 *
 * Suggestion pills rendered below the composer when thread is empty.
 *
 * @component
 * @returns {JSX.Element} The suggestion pills.
 */
export function WelcomeSuggestions() {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-[420px]">
      {SITSSuggestions.map((s) =>
        typeof s === "string" ? null : (
          <ThreadPrimitive.Suggestion
            key={s.prompt}
            prompt={s.prompt}
            className="px-4 py-2 border border-border rounded-[20px] bg-background text-foreground text-[13px] cursor-pointer text-center transition-colors max-w-[360px] hover:bg-accent-light hover:border-accent-blue hover:text-accent-blue"
          >
            {s.title}
          </ThreadPrimitive.Suggestion>
        )
      )}
    </div>
  )
}
