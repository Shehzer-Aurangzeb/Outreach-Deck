"use client";

import { SparklesIcon, UserIcon } from "@/components/icons";
import type { ParsedLinkedInProfile } from "@/features/drafting/actions/draft-actions";

import { ComposerProfileField } from "./composer-profile-field";

/**
 * Extended profile type that includes the optional linkedinUrl field.
 * The model parses name/headline/about/experience; the user adds the URL manually.
 */
export interface ProfileWithUrl extends ParsedLinkedInProfile {
  linkedinUrl?: string;
}

interface ReviewStepProps {
  profile: ProfileWithUrl;
  onProfileChange: (profile: ProfileWithUrl) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export function ReviewStep({ profile, onProfileChange, onGenerate, isGenerating }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-success-subtle)" }}
        >
          <UserIcon className="w-5 h-5" style={{ color: "var(--color-success)" }} />
        </div>
        <div>
          <h3 className="font-medium" style={{ color: "var(--color-bright)" }}>
            Review extracted info
          </h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            Edit any fields if needed, then generate your connection note.
          </p>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="space-y-3">
        <ComposerProfileField
          label="Name"
          value={profile.name}
          onChange={(v) => onProfileChange({ ...profile, name: v })}
          required
        />
        <ComposerProfileField
          label="Headline"
          value={profile.headline}
          onChange={(v) => onProfileChange({ ...profile, headline: v })}
        />
        <ComposerProfileField
          label="About"
          value={profile.about}
          onChange={(v) => onProfileChange({ ...profile, about: v })}
          multiline
        />
        <ComposerProfileField
          label="Experience"
          value={profile.experience}
          onChange={(v) => onProfileChange({ ...profile, experience: v })}
        />
        <ComposerProfileField
          label="LinkedIn URL"
          value={profile.linkedinUrl || ""}
          onChange={(v) => onProfileChange({ ...profile, linkedinUrl: v })}
          placeholder="https://linkedin.com/in/..."
        />
      </div>

      <button
        onClick={onGenerate}
        disabled={isGenerating || !profile.name.trim()}
        className="w-full h-12 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "white",
        }}
      >
        <SparklesIcon className="w-5 h-5" />
        {isGenerating ? "Generating..." : "Generate Connection Note"}
      </button>
    </div>
  );
}
