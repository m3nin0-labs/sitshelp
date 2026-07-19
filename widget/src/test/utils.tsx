/*
 * This file is part of SITSHelp.
 * Copyright (C) 2026 SITS Developers.
 *
 * SITSHelp is free software; you can redistribute it and/or modify it
 * under the terms of the MIT License; see LICENSE file for more details.
 */

import type { ComponentType, ReactElement, ReactNode } from "react"
import { render } from "@testing-library/react"
import { AssistantRuntimeProvider, ThreadPrimitive, useLocalRuntime } from "@assistant-ui/react"
import type { ChatModelAdapter, ThreadMessageLike } from "@assistant-ui/react"

/**
 * No-op chat model: the runtime never actually runs in tests, it only needs
 * to exist so components can read thread/composer/thread-list state.
 */
const noopAdapter: ChatModelAdapter = {
  run: async () => ({ content: [{ type: "text", text: "" }] }),
}

/**
 * Wraps children in a real assistant-ui runtime backed by the no-op model.
 */
function Runtime({ children }: { children: ReactNode }) {
  const runtime = useLocalRuntime(noopAdapter)

  return <AssistantRuntimeProvider runtime={runtime}>{children}</AssistantRuntimeProvider>
}

/**
 * Render a component inside a live (but inert) assistant-ui runtime.
 *
 * @param ui - The element to render.
 *
 * @returns The testing-library render result.
 */
export function renderWithRuntime(ui: ReactElement) {
  return render(ui, { wrapper: Runtime })
}

/**
 * Render message components through a seeded thread.
 *
 * @description Message components (UserMessage / AssistantMessage) only work
 * inside the per-message context that `ThreadPrimitive.Messages` provides, so
 * we seed the runtime with messages and let the thread render each one with
 * the matching component.
 *
 * @param messages - The messages to seed the thread with.
 * @param components - The user/assistant message components under test.
 *
 * @returns The testing-library render result.
 */
export function renderMessages(
  messages: ThreadMessageLike[],
  components: { UserMessage: ComponentType; AssistantMessage: ComponentType }
) {
  const { UserMessage, AssistantMessage } = components

  function Seeded() {
    const runtime = useLocalRuntime(noopAdapter, { initialMessages: messages })

    return (
      <AssistantRuntimeProvider runtime={runtime}>
        <ThreadPrimitive.Root>
          <ThreadPrimitive.Messages>
            {({ message }) => (message.role === "user" ? <UserMessage /> : <AssistantMessage />)}
          </ThreadPrimitive.Messages>
        </ThreadPrimitive.Root>
      </AssistantRuntimeProvider>
    )
  }

  return render(<Seeded />)
}
