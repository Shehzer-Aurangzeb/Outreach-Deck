"use client";

import { useState } from "react";

import { CharCounter } from "@/components/char-counter";
import { CheckIcon, CopyIcon, RefreshIcon, SendIcon, UserPlusIcon } from "@/components/icons";

interface DraftStepProps {
  profileName: string;
  draft: string;
  onDraftChange: (draft: string) => void;
  onRegenerate: () => void;
  onSave: (sentWithNote: boolean) => void;
  onBackToReview: () => void;
  isGenerating: boolean;
  isSaving: boolean;
}

export function DraftStep({
  profileName,
  draft,
  onDraftChange,
  onRegenerate,
  onSave,
  onBackToReview,
  isGenerating,
  isSaving,
}: DraftStepProps) {
  const [copied, setCopied] = useState(false);
  const [sentWithNote, setSentWithNote] = useState(true);

  const charCount = draft.length;
  const isOverLimit = sentWithNote && charCount > 200;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-accent-subtle)" }}
        >
          <SendIcon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: "var(--color-bright)" }}>
            Connection note for {profileName}
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            Edit as needed, copy to send on LinkedIn, then add to your pipeline.
          </p>
        </div>
      </div>

      {/* Draft Textarea */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Your Message
          </label>
          {sentWithNote && <CharCounter current={charCount} max={200} />}
        </div>
        <textarea
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={5}
          className="w-full px-4 py-3 rounded-xl text-sm resize-y transition-colors"
          style={{
            backgroundColor: "var(--color-void)",
            color: "var(--color-text)",
            border: `1px solid ${isOverLimit ? "var(--color-danger)" : "var(--color-edge)"}`,
          }}
        />
        {isOverLimit && (
          <p className="text-xs mt-1" style={{ color: "var(--color-danger)" }}>
            LinkedIn connection notes must be under 200 characters
          </p>
        )}
      </div>

      {/* Send Type Toggle */}
      <div
        className="p-4 rounded-xl"
        style={{ backgroundColor: "var(--color-raised)", border: "1px solid var(--color-edge)" }}
      >
        <label className="text-sm font-medium mb-3 block" style={{ color: "var(--color-text)" }}>
          How did you send the request?
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSentWithNote(true)}
            className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: sentWithNote ? "var(--color-accent)" : "var(--color-base)",
              color: sentWithNote ? "white" : "var(--color-muted)",
              border: sentWithNote ? "none" : "1px solid var(--color-edge)",
            }}
          >
            <SendIcon className="w-4 h-4" />
            With note
          </button>
          <button
            type="button"
            onClick={() => setSentWithNote(false)}
            className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: !sentWithNote ? "var(--color-warning)" : "var(--color-base)",
              color: !sentWithNote ? "white" : "var(--color-muted)",
              border: !sentWithNote ? "none" : "1px solid var(--color-edge)",
            }}
          >
            <UserPlusIcon className="w-4 h-4" />
            No note (bare request)
          </button>
        </div>
        {!sentWithNote && (
          <p className="text-xs mt-2" style={{ color: "var(--color-muted)" }}>
            Contact will be added to &ldquo;Requested&rdquo; stage. Once they accept, you can draft your first DM.
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="h-12 px-4 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--color-raised)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
          title="Regenerate message"
        >
          <RefreshIcon className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
        </button>
        {sentWithNote && (
          <button
            onClick={handleCopy}
            className="flex-1 h-12 rounded-xl font-medium transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            style={{
              backgroundColor: copied ? "var(--color-success)" : "var(--color-raised)",
              color: copied ? "white" : "var(--color-text)",
              border: copied ? "none" : "1px solid var(--color-edge)",
            }}
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        )}
        <button
          onClick={() => onSave(sentWithNote)}
          disabled={isSaving || isOverLimit}
          className="flex-1 h-12 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          style={{
            backgroundColor: "var(--color-success)",
            color: "white",
          }}
        >
          <SendIcon className="w-4 h-4" />
          {isSaving ? "Saving..." : sentWithNote ? "Mark Sent → Pipeline" : "Add to Requested"}
        </button>
      </div>

      {/* Back Option */}
      <button
        onClick={onBackToReview}
        className="w-full text-sm py-2 text-center transition-colors hover:underline"
        style={{ color: "var(--color-muted)" }}
      >
        ← Back to edit profile info
      </button>
    </div>
  );
}
