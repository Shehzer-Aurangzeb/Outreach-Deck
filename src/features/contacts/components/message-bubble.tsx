"use client";

import { useState } from "react";
import type { Message } from "@prisma/client";

import { TrashIcon, XIcon } from "@/components/icons";

interface MessageBubbleProps {
  message: Message;
  onDelete?: (messageId: string) => void;
  isDeleting?: boolean;
}

export function MessageBubble({ message, onDelete, isDeleting }: MessageBubbleProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const isYou = message.role === "YOU";

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(message.id);
    setShowConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <div className={`group flex ${isYou ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[80%] rounded-2xl px-4 py-3 transition-opacity ${isDeleting ? "opacity-50" : ""}`}
        style={{
          backgroundColor: isYou ? "var(--color-accent)" : "var(--color-base)",
          color: isYou ? "white" : "var(--color-text)",
          borderBottomRightRadius: isYou ? "4px" : "16px",
          borderBottomLeftRadius: isYou ? "16px" : "4px",
        }}
      >
        {onDelete && !showConfirm && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: isYou ? "rgba(255,255,255,0.2)" : "var(--color-raised)",
              color: isYou ? "rgba(255,255,255,0.8)" : "var(--color-muted)",
            }}
            title="Delete message"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        )}

        {showConfirm && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
            style={{
              backgroundColor: isYou ? "rgba(0,0,0,0.3)" : "var(--color-raised)",
              border: isYou ? "none" : "1px solid var(--color-edge)",
            }}
          >
            <span style={{ color: isYou ? "rgba(255,255,255,0.8)" : "var(--color-muted)" }}>Delete?</span>
            <button
              onClick={handleConfirmDelete}
              className="px-1.5 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: "var(--color-danger)",
                color: "white",
              }}
            >
              Yes
            </button>
            <button
              onClick={handleCancelDelete}
              className="p-0.5 rounded"
              style={{ color: isYou ? "rgba(255,255,255,0.8)" : "var(--color-muted)" }}
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        )}

        <p className="text-sm whitespace-pre-wrap leading-relaxed pr-6">{message.text}</p>
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
