import type { Message } from "@prisma/client";

import { MessageSquareIcon } from "@/components/icons";

import { MessageBubble } from "./message-bubble";

interface MessageThreadProps {
  messages: Message[];
}

export function MessageThread({ messages }: MessageThreadProps) {
  return (
    <div
      className="flex-1 overflow-y-auto p-5 space-y-3"
      style={{ minHeight: "200px", maxHeight: "300px", backgroundColor: "var(--color-void)" }}
    >
      {messages.length === 0 ? (
        <div className="text-center py-12">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: "var(--color-base)" }}
          >
            <MessageSquareIcon className="w-6 h-6" style={{ color: "var(--color-ghost)" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            No messages yet
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-ghost)" }}>
            Log their replies and draft your responses
          </p>
        </div>
      ) : (
        messages.map((message) => <MessageBubble key={message.id} message={message} />)
      )}
    </div>
  );
}
