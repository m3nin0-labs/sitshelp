/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// jest-dom matchers (toBeInTheDocument, etc.)
import "@testing-library/jest-dom/vitest"

// jsdom lacks these browser APIs that assistant-ui primitives rely on
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.ResizeObserver ??= ResizeObserverStub
Element.prototype.scrollIntoView ??= vi.fn()

// unmount rendered trees between tests
afterEach(cleanup)
