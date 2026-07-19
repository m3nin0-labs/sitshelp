/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

/**
 * Host-page config injected as `window.__SITSHELP_CONFIG__` by the Quarto filter.
 *
 * @interface SitsHelpConfig
 * @property {string} apiUrl - The Agent Protocol base URL, e.g. "http://localhost:8000".
 */
export interface SitsHelpConfig {
  apiUrl: string
}

/**
 * Global window object with the SITSHelp config.
 *
 * @interface Window
 * @property {SitsHelpConfig} __SITSHELP_CONFIG__ - The SITSHelp config.
 */
declare global {
  interface Window {
    __SITSHELP_CONFIG__?: SitsHelpConfig
  }
}

/**
 * @interface
 *
 * Source
 */
export interface Source {
  /** The title of the source. */
  title: string

  /** The URL of the source. */
  url?: string

  /** The type of the source. */
  source_type: string
}

/**
 * The full sources dictionary from AgentState.
 *
 * @type {SourcesState}
 * @property {Record<string, Source>} sources - The sources dictionary.
 */
export type SourcesState = Record<string, Source>

/**
 * @interface
 *
 * Shared props for components that can auto-submit an initial message
 */
export interface InitialMessageProps {
  /** The initial message. */
  initialMessage?: string

  /** The handler for the initial message handled. */
  onInitialMessageHandled?: () => void
}
