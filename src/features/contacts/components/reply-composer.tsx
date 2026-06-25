"use client";

import { useState } from "react";

import {
  CheckIcon,
  CopyIcon,
  MessageSquareIcon,
  SendIcon,
  SparklesIcon,
} from "@/components/icons";

interface ReplyComposerProps {
  theirReply: string;
  onTheirReplyChange: (value: string) => void;
  onLogTheirReply: () => void;
  myDraft: string;
  onMyDraftChange: (value: string) => void;
  onDraftReply: () => void;
  onMarkSent: () => void;
  onCopySuccess: () => void;
  isGeneratingReply: boolean;
  isLogging: boolean;
  hasMessages: boolean;
  error: string | null;
}

export function ReplyComposer({
  theirReply,
  onTheirReplyChange,
  onLogTheirReply,
  myDraft,
  onMyDraftChange,
  onDraftReply,
  onMarkSent,
  onCopySuccess,
  isGeneratingReply,
  isLogging,
  hasMessages,
  error,
}: ReplyComposerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyDraft = async () => {
    await navigator.clipboard.writeText(myDraft);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 space-y-5" style={{ borderTop: "1px solid var(--color-edge)" }}>
      {/* Log Their Reply */}
      <div>
        <label
          className="flex items-center gap-2 text-sm font-medium mb-2"
          style={{ color: "var(--color-text)" }}
        >
          <MessageSquareIcon className="w-4 h-4" style={{ color: "var(--color-info)" }} />
          Log their reply
        </label>
        <div className="flex gap-2">
          <textarea
            value={theirReply}
            onChange={(e) => onTheirReplyChange(e.target.value)}
            rows={2}
            placeholder="Paste their message here..."
            className="flex-1 px-4 py-3 rounded-xl text-sm resize-none transition-colors"
            style={{
              backgroundColor: "var(--color-void)",
              color: "var(--color-text)",
              border: "1px solid var(--color-edge)",
            }}
          />
          <button
            onClick={onLogTheirReply}
            disabled={!theirReply.trim() || isLogging}
            className="h-[72px] px-5 rounded-xl text-sm font-medium self-end disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            style={{
              backgroundColor: "var(--color-info)",
              color: "white",
            }}
          >
            <SendIcon className="w-4 h-4" />
            <span>Log</span>
          </button>
        </div>
      </div>

      {/* Draft My Reply */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--color-text)" }}
          >
            <SparklesIcon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            Your reply
          </label>
          <button
            onClick={onDraftReply}
            disabled={isGeneratingReply || !hasMessages}
            className="px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            {isGeneratingReply ? "Drafting..." : "AI Draft"}
          </button>
        </div>
        {error && (
          <div
            className="text-xs mb-2 p-2 rounded-lg"
            style={{
              backgroundColor: "var(--color-danger-subtle)",
              color: "var(--color-danger)",
            }}
          >
            {error}
          </div>
        )}
        <textarea
          value={myDraft}
          onChange={(e) => onMyDraftChange(e.target.value)}
          rows={3}
          placeholder="Click 'AI Draft' to generate, or type your own..."
          className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors"
          style={{
            backgroundColor: "var(--color-void)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
        />
        {myDraft && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopyDraft}
              className="flex-1 h-11 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: copied ? "var(--color-success)" : "var(--color-raised)",
                color: copied ? "white" : "var(--color-text)",
                border: copied ? "none" : "1px solid var(--color-edge)",
              }}
            >
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <button
              onClick={onMarkSent}
              disabled={isLogging}
              className="flex-1 h-11 rounded-xl text-sm font-medium disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--color-success)",
                color: "white",
              }}
            >
              <SendIcon className="w-4 h-4" />
              <span>Mark Sent</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
