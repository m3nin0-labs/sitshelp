/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { resolve } from "path"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ["@ag-ui/client", "@ag-ui/core"],
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.tsx"),
      name: "SitsHelp",
      formats: ["iife"],
      fileName: () => "sitshelp.js",
    },
    outDir: resolve(__dirname, "../_extensions/sitshelp/assets"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        assetFileNames: "sitshelp.[ext]",
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({}),
    "process": JSON.stringify({ env: { NODE_ENV: "production" } }),
  },
})
