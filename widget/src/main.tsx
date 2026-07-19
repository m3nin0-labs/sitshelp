/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { App } from "./App"
import "./styles.css"

/**
 * Mount the widget into a `#sitshelp-root` div, creating it if absent.
 *
 * @returns {void}
 */
function mountWidget() {
  let container = document.getElementById("sitshelp-root")

  if (!container) {
    container = document.createElement("div")
    container.id = "sitshelp-root"

    document.body.appendChild(container)
  }

  const root = createRoot(container)

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountWidget)
} else {
  mountWidget()
}
