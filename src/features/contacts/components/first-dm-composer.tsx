"use client";

import { useState } from "react";

import {
  CheckIcon,
  CopyIcon,
  SendIcon,
  SparklesIcon,
  UserPlusIcon,
} from "@/components/icons";

interface FirstDMComposerProps {
  contactName: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onDraftFirstDM: () => void;
  onSendFirstDM: () => void;
  onCopySuccess: () => void;
  isGenerating: boolean;
  isSending: boolean;
  error: string | null;
}

export function FirstDMComposer({
  contactName,
  draft,
  onDraftChange,
  onDraftFirstDM,
  onSendFirstDM,
  onCopySuccess,
  isGenerating,
  isSending,
  error,
}: FirstDMComposerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyDraft = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 space-y-5" style={{ borderTop: "1px solid var(--color-edge)" }}>
      {/* Waiting for Accept Banner */}
      <div
        className="p-4 rounded-xl flex items-start gap-3"
        style={{
          backgroundColor: "var(--color-warning-subtle)",
          border: "1px solid rgba(234, 179, 8, 0.3)",
        }}
      >
        <UserPlusIcon className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-warning)" }} />
        <div>
          <p className="font-medium" style={{ color: "var(--color-warning)" }}>
            Waiting for {contactName} to accept
          </p>
          <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
            Once they accept your connection request, draft your first DM below.
          </p>
        </div>
      </div>

      {/* First DM Draft */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: "var(--color-text)" }}
          >
            <SparklesIcon className="w-4 h-4" style={{ color: "var(--color-accent)" }} />
            Your first message (after they accept)
          </label>
          <button
            onClick={onDraftFirstDM}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg text-xs font-medium disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "white",
            }}
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            {isGenerating ? "Drafting..." : "They Accepted — Draft DM"}
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
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={4}
          placeholder="Click 'They Accepted — Draft DM' once they accept your request..."
          className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors"
          style={{
            backgroundColor: "var(--color-void)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
        />
        {draft && (
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
              onClick={onSendFirstDM}
              disabled={isSending}
              className="flex-1 h-11 rounded-xl text-sm font-medium disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                backgroundColor: "var(--color-success)",
                color: "white",
              }}
            >
              <SendIcon className="w-4 h-4" />
              <span>{isSending ? "Sending..." : "Mark Sent → Contacted"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
