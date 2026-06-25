import type { Message } from "@prisma/client";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isYou = message.role === "YOU";

  return (
    <div className={`flex ${isYou ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[80%] rounded-2xl px-4 py-3"
        style={{
          backgroundColor: isYou ? "var(--color-accent)" : "var(--color-base)",
          color: isYou ? "white" : "var(--color-text)",
          borderBottomRightRadius: isYou ? "4px" : "16px",
          borderBottomLeftRadius: isYou ? "16px" : "4px",
        }}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
        <p
          className="text-xs mt-2"
          style={{
            color: isYou ? "rgba(255,255,255,0.7)" : "var(--color-muted)",
          }}
        >
          {isYou ? "You" : "Them"} • {new Date(message.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
