"use client";

import { useState, useEffect } from "react";

import { ArrowLeftIcon, XIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { createContact } from "@/features/contacts/actions/contact-actions";
import {
  draftConnectionNote,
  parseLinkedInProfile,
} from "@/features/drafting/actions/draft-actions";

import { MOCK_CONNECTION_DRAFT, USE_MOCK_DATA } from "@/lib/mock-data";

import type { DailySearch } from "../lib/daily-search-generator";
import { ComposerStepIndicator, type ComposerStep } from "./composer-step-indicator";
import { DraftStep } from "./draft-step";
import { PasteStep } from "./paste-step";
import { ReviewStep, type ProfileWithUrl } from "./review-step";

// Mock profile for screenshot mode
const MOCK_COMPOSER_PROFILE: ProfileWithUrl = {
  name: "Sarah Chen",
  headline: "Senior Software Engineer at Google",
  about: "Building cloud infrastructure tools. Previously at Stripe.",
  experience: "5+ years in distributed systems and TypeScript",
  linkedinUrl: "https://linkedin.com/in/sarahchen",
};

interface ProfileComposerProps {
  search: DailySearch;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfileComposer({ search, onClose, onSuccess }: ProfileComposerProps) {
  // In mock mode, start at draft step with pre-filled data for screenshots
  const [step, setStep] = useState<ComposerStep>(USE_MOCK_DATA ? "draft" : "paste");
  const [rawText, setRawText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [profile, setProfile] = useState<ProfileWithUrl | null>(USE_MOCK_DATA ? MOCK_COMPOSER_PROFILE : null);
  const [draft, setDraft] = useState(USE_MOCK_DATA ? MOCK_CONNECTION_DRAFT : "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Step 1: Parse profile text
  const handleExtract = async () => {
    if (rawText.trim().length < 20) {
      setError("Please paste more profile text");
      return;
    }

    setIsParsing(true);
    setError(null);

    const result = await parseLinkedInProfile(rawText);

    setIsParsing(false);

    if ("error" in result) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      setProfile(result.profile);
      setStep("review");
      addToast("Profile extracted!", "success");
    }
  };

  // Step 2: Generate draft
  const handleGenerateDraft = async () => {
    if (!profile) return;

    setIsGenerating(true);
    setError(null);

    // Include name at start so the AI knows who to address
    const profileText = [
      `Name: ${profile.name}`,
      profile.headline,
      profile.about,
      profile.experience,
    ]
      .filter(Boolean)
      .join("\n\n");

    const result = await draftConnectionNote({
      profileText,
      company: search.company.name,
      angle: search.angle,
    });

    setIsGenerating(false);

    if ("error" in result) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      setDraft(result.draft);
      setStep("draft");
      addToast("Draft generated!", "success");
    }
  };

  // Step 3: Save to pipeline
  const handleSaveAndAddToPipeline = async (sentWithNote: boolean) => {
    if (!profile) return;

    // If sent with note, require a draft
    if (sentWithNote && !draft) return;

    setIsSaving(true);
    setError(null);

    const profileText = [profile.headline, profile.about, profile.experience]
      .filter(Boolean)
      .join("\n\n");

    const result = await createContact({
      name: profile.name,
      company: search.company.name,
      angle: search.angle,
      linkedinUrl: profile.linkedinUrl || undefined,
      profileText,
      firstMessage: sentWithNote ? draft : undefined,
      sentWithNote,
    });

    setIsSaving(false);

    if ("error" in result) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      const stageMsg = sentWithNote ? "pipeline" : "Requested";
      addToast(`${profile.name} added to ${stageMsg}!`, "success");
      onSuccess();
    }
  };

  // Go back to previous step
  const handleBack = () => {
    setError(null);
    if (step === "review") {
      setStep("paste");
    } else if (step === "draft") {
      setStep("review");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          backgroundColor: "var(--color-base)",
          border: "1px solid var(--color-edge)",
        }}
      >
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between"
          style={{
            backgroundColor: "var(--color-raised)",
            borderBottom: "1px solid var(--color-edge)",
          }}
        >
          <div className="flex items-center gap-3">
            {step !== "paste" && (
              <button
                onClick={handleBack}
                className="p-2 rounded-lg transition-colors hover:bg-[var(--color-base)]"
                style={{ color: "var(--color-muted)" }}
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
              >
                Found someone at {search.company.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="text-xs px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: "var(--color-accent-subtle)",
                    color: "var(--color-accent)",
                  }}
                >
                  {search.angle}
                </span>
                <ComposerStepIndicator current={step} />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--color-base)]"
            style={{ color: "var(--color-muted)" }}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "paste" && (
            <PasteStep
              rawText={rawText}
              onRawTextChange={setRawText}
              onExtract={handleExtract}
              isParsing={isParsing}
            />
          )}

          {step === "review" && profile && (
            <ReviewStep
              profile={profile}
              onProfileChange={setProfile}
              onGenerate={handleGenerateDraft}
              isGenerating={isGenerating}
            />
          )}

          {step === "draft" && profile && (
            <DraftStep
              profileName={profile.name}
              draft={draft}
              onDraftChange={setDraft}
              onRegenerate={handleGenerateDraft}
              onSave={handleSaveAndAddToPipeline}
              isGenerating={isGenerating}
              isSaving={isSaving}
            />
          )}

          {/* Error */}
          {error && (
            <div
              className="mt-4 p-3 rounded-xl text-sm"
              style={{
                backgroundColor: "var(--color-danger-subtle)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
