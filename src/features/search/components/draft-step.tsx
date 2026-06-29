"use client";

import { useState } from "react";

import { CheckIcon, RefreshIcon, SendIcon, UserPlusIcon } from "@/components/icons";
import { Composer } from "@/shared/ui/composer";

interface DraftStepProps {
  profileName: string;
  draft: string;
  onDraftChange: (draft: string) => void;
  onRegenerate: () => void;
  onSave: (sentWithNote: boolean) => void;
  isGenerating: boolean;
  isSaving: boolean;
}

export function DraftStep({
  profileName,
  draft,
  onDraftChange,
  onRegenerate,
  onSave,
  isGenerating,
  isSaving,
}: DraftStepProps) {
  const [sentWithNote, setSentWithNote] = useState(true);

  const charCount = draft.length;
  const isOverLimit = sentWithNote && charCount > 200;

  const handleSave = () => {
    onSave(sentWithNote);
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
            Your Message
          </label>
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors hover:bg-white/5"
            style={{ color: "var(--color-muted)" }}
            title="Regenerate message"
          >
            <RefreshIcon className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
        
        <Composer
          value={draft}
          onChange={onDraftChange}
          onPrimaryAction={handleSave}
          primaryIcon={sentWithNote ? <CheckIcon className="w-4 h-4" /> : <UserPlusIcon className="w-4 h-4" />}
          primaryLabel={sentWithNote ? "Mark Sent → Pipeline" : "Add to Requested"}
          placeholder="Your connection note..."
          maxLength={sentWithNote ? 200 : undefined}
          showCharCount={sentWithNote}
          isLoading={isSaving}
          hasError={isOverLimit}
          errorMessage={isOverLimit ? "LinkedIn connection notes must be under 200 characters" : undefined}
          minRows={4}
          maxRows={6}
        />
      </div>

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
    </div>
  );
}
