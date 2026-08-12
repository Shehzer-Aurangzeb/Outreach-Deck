"use client";

import { useState, useEffect, useRef } from "react";

import {
  ArrowLeftIcon,
  XIcon,
  ClipboardIcon,
  SparklesIcon,
  UserIcon,
  CheckIcon,
  RefreshIcon,
  SendIcon,
  UserPlusIcon,
} from "@/components/icons";
import { useToast } from "@/components/toast";
import { CATEGORY_CONFIG } from "@/features/contacts/constants";
import { draftConnectionNote, draftFirstDMDirect } from "@/features/drafting/actions/draft-actions";
import { useProfile } from "@/features/profile/hooks/use-profile";

import { classifyProfile } from "../actions/classify-profile";
import { CATEGORIES, CONNECTION_STATES, MESSAGE_MODES } from "../schema";
import type { ClassifiedProfile } from "../types";
import { QuickAddStepIndicator, type QuickAddStep } from "./quick-add-step-indicator";

interface QuickAddModalProps {
  onClose: () => void;
  onSuccess?: (contactId: string) => void;
}

export function QuickAddModal({ onClose, onSuccess }: QuickAddModalProps) {
  const { data: profile } = useProfile();
  const { addToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [step, setStep] = useState<QuickAddStep>("paste");
  const [rawText, setRawText] = useState("");
  const [classified, setClassified] = useState<ClassifiedProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState("");
  const [draftWarnings, setDraftWarnings] = useState<string[]>([]);
  const [sentWithNote, setSentWithNote] = useState(true);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (step === "paste") {
      textareaRef.current?.focus();
    }
  }, [step]);

  const handleClassify = async () => {
    if (rawText.trim().length < 20) {
      setError("Please paste more profile text");
      return;
    }

    setError(null);
    setStep("classifying");
    setIsClassifying(true);

    const result = await classifyProfile({
      rawText,
      schoolName: profile?.education?.split(",")[0]?.trim(),
      techStack: profile?.stack,
    });

    setIsClassifying(false);

    if ("error" in result) {
      setError(result.error);
      setStep("paste");
      addToast(result.error, "error");
    } else {
      setClassified(result);
      setStep("review");
      addToast("Profile classified!", "success");
    }
  };

  const handleGenerateDraft = async () => {
    if (!classified) return;

    setIsDrafting(true);
    setError(null);
    setDraftWarnings([]);

    const isConnected = classified.connectionState === "CONNECTED";

    const result = isConnected
      ? await draftFirstDMDirect({
          contactName: classified.name,
          profileText: classified.cleanedProfileText,
          company: classified.company,
          category: classified.category,
        })
      : await draftConnectionNote({
          profileText: classified.cleanedProfileText,
          company: classified.company,
          category: classified.category,
        });

    setIsDrafting(false);

    if ("error" in result) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      setDraft(result.draft);
      if (result.warnings && result.warnings.length > 0) {
        setDraftWarnings(result.warnings);
      }
      setStep("draft");
    }
  };

  const handleSave = async () => {
    if (!classified) return;

    setIsSaving(true);
    setError(null);

    const { createContact } = await import("@/features/contacts/actions/contact-actions");

    const isConnected = classified.connectionState === "CONNECTED";
    const finalDraft = sentWithNote ? draft.trim() : undefined;

    const result = await createContact({
      name: classified.name,
      company: classified.company,
      category: classified.category,
      secondaryCategories: classified.secondaryCategories,
      connectionState: classified.connectionState,
      messageMode: isConnected ? "FIRST_DM" : "CONNECTION_NOTE",
      linkedinUrl: classified.linkedinUrl ?? "",
      profileText: classified.cleanedProfileText,
      rawProfileText: rawText,
      vendorEmail: classified.vendorEmail ?? "",
      firstMessage: finalDraft,
      sentWithNote,
    });

    setIsSaving(false);

    if ("error" in result) {
      setError(result.error);
      addToast(result.error, "error");
    } else {
      addToast(`${classified.name} added to pipeline!`, "success");
      onSuccess?.(result.id);
      onClose();
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === "review") {
      setStep("paste");
    } else if (step === "draft") {
      setStep("review");
    }
  };

  const isConnected = classified?.connectionState === "CONNECTED";
  const charCount = draft.length;
  const isOverLimit = sentWithNote && !isConnected && charCount > 200;

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
            {(step === "review" || step === "draft") && (
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
                Quick Add Contact
              </h2>
              <QuickAddStepIndicator current={step} />
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
          {/* Paste Step */}
          {step === "paste" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--color-info-subtle)" }}
                >
                  <ClipboardIcon className="w-5 h-5" style={{ color: "var(--color-info)" }} />
                </div>
                <div>
                  <h3 className="font-medium" style={{ color: "var(--color-bright)" }}>
                    Paste their LinkedIn profile
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
                    Copy everything from their profile page. AI will classify them and extract key info.
                  </p>
                </div>
              </div>

              <textarea
                ref={textareaRef}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={12}
                placeholder={`Paste the full LinkedIn profile here...

Example:
Sarah Chen
Senior Software Engineer at Stripe
San Francisco Bay Area • 500+ connections

About
Passionate about building scalable systems...

Experience
Senior Software Engineer
Stripe • 2 yrs
...`}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors"
                style={{
                  backgroundColor: "var(--color-void)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-edge)",
                  fontFamily: "var(--font-mono, monospace)",
                }}
              />

              <button
                onClick={handleClassify}
                disabled={rawText.trim().length < 20}
                className="w-full h-12 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                <SparklesIcon className="w-5 h-5" />
                Classify Profile
              </button>
            </div>
          )}

          {/* Classifying Step */}
          {step === "classifying" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div
                className="w-12 h-12 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "var(--color-accent)", borderTopColor: "transparent" }}
              />
              <p style={{ color: "var(--color-muted)" }}>Classifying profile...</p>
            </div>
          )}

          {/* Review Step */}
          {step === "review" && classified && (
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
                    Review classification
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
                    Edit any fields if needed, then generate your message.
                  </p>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="space-y-3">
                {/* Name & Company Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>
                      Name <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={classified.name}
                      onChange={(e) => setClassified({ ...classified, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: "var(--color-void)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-edge)",
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>
                      Company <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={classified.company}
                      onChange={(e) => setClassified({ ...classified, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: "var(--color-void)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-edge)",
                      }}
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setClassified({ ...classified, category: cat })}
                        className="px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5"
                        style={{
                          backgroundColor:
                            classified.category === cat
                              ? CATEGORY_CONFIG[cat].bg
                              : "var(--color-void)",
                          border: `1px solid ${
                            classified.category === cat
                              ? CATEGORY_CONFIG[cat].color
                              : "var(--color-edge)"
                          }`,
                          color:
                            classified.category === cat
                              ? CATEGORY_CONFIG[cat].color
                              : "var(--color-muted)",
                        }}
                      >
                        {classified.category === cat && <CheckIcon className="w-3 h-3" />}
                        {CATEGORY_CONFIG[cat].short}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connection State */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>
                    Connection State
                  </label>
                  <div className="flex gap-2">
                    {CONNECTION_STATES.map((state) => (
                      <button
                        key={state}
                        type="button"
                        onClick={() => setClassified({ ...classified, connectionState: state })}
                        className="px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5"
                        style={{
                          backgroundColor:
                            classified.connectionState === state
                              ? "var(--color-accent-subtle)"
                              : "var(--color-void)",
                          border: `1px solid ${
                            classified.connectionState === state
                              ? "var(--color-accent)"
                              : "var(--color-edge)"
                          }`,
                          color:
                            classified.connectionState === state
                              ? "var(--color-accent)"
                              : "var(--color-muted)",
                        }}
                      >
                        {classified.connectionState === state && <CheckIcon className="w-3 h-3" />}
                        {state === "CONNECTED" ? "Connected" : state === "NOT_CONNECTED" ? "Not Connected" : "Unknown"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>
                    LinkedIn URL
                  </label>
                  <input
                    type="text"
                    value={classified.linkedinUrl ?? ""}
                    onChange={(e) => setClassified({ ...classified, linkedinUrl: e.target.value || null })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: "var(--color-void)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-edge)",
                    }}
                  />
                </div>

                {/* Vendor Email (only for vendor recruiters) */}
                {classified.category === "RECRUITER_VENDOR" && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-muted)" }}>
                      Vendor Email
                    </label>
                    <input
                      type="email"
                      value={classified.vendorEmail ?? ""}
                      onChange={(e) => setClassified({ ...classified, vendorEmail: e.target.value || null })}
                      placeholder="recruiter@agency.com"
                      className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
                      style={{
                        backgroundColor: "var(--color-void)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-edge)",
                      }}
                    />
                  </div>
                )}

                {/* Classification Info */}
                <div
                  className="p-3 rounded-xl text-sm"
                  style={{ backgroundColor: "var(--color-raised)" }}
                >
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--color-muted)" }}>
                      {classified.reasoning}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-md shrink-0 ml-2"
                      style={{
                        backgroundColor: "var(--color-accent-subtle)",
                        color: "var(--color-accent)",
                      }}
                    >
                      {Math.round(classified.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateDraft}
                disabled={isDrafting || !classified.name.trim() || !classified.company.trim()}
                className="w-full h-12 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                {isDrafting ? (
                  <>
                    <RefreshIcon className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate Message
                  </>
                )}
              </button>
            </div>
          )}

          {/* Draft Step */}
          {step === "draft" && classified && (
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
                    {isConnected ? `First DM to ${classified.name}` : `Connection note for ${classified.name}`}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
                    Edit as needed, copy to send on LinkedIn, then add to your pipeline.
                  </p>
                </div>
              </div>

              {/* Message Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                    Your Message
                  </label>
                  <button
                    onClick={handleGenerateDraft}
                    disabled={isDrafting}
                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors hover:bg-white/5"
                    style={{ color: "var(--color-muted)" }}
                    title="Regenerate message"
                  >
                    <RefreshIcon className={`w-3.5 h-3.5 ${isDrafting ? "animate-spin" : ""}`} />
                    Regenerate
                  </button>
                </div>

                <div className="relative">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-colors"
                    style={{
                      backgroundColor: "var(--color-void)",
                      color: "var(--color-text)",
                      border: `1px solid ${isOverLimit ? "var(--color-danger)" : "var(--color-edge)"}`,
                    }}
                  />
                  {!isConnected && sentWithNote && (
                    <div
                      className="absolute bottom-3 right-3 text-xs px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: isOverLimit ? "var(--color-danger-subtle)" : "var(--color-raised)",
                        color: isOverLimit ? "var(--color-danger)" : "var(--color-muted)",
                      }}
                    >
                      {charCount}/200
                    </div>
                  )}
                </div>
                {isOverLimit && (
                  <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                    LinkedIn connection notes must be under 200 characters
                  </p>
                )}
                {draftWarnings.length > 0 && (
                  <div
                    className="p-3 rounded-lg text-xs space-y-1"
                    style={{
                      backgroundColor: "var(--color-warning-subtle)",
                      border: "1px solid var(--color-warning)",
                    }}
                  >
                    <p className="font-medium" style={{ color: "var(--color-warning)" }}>
                      Draft has issues (edit before sending):
                    </p>
                    <ul className="list-disc list-inside" style={{ color: "var(--color-warning)" }}>
                      {draftWarnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Sent with note toggle (only for NOT_CONNECTED) */}
              {!isConnected && (
                <div
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: "var(--color-raised)", border: "1px solid var(--color-edge)" }}
                >
                  <label className="text-sm font-medium mb-3 block" style={{ color: "var(--color-text)" }}>
                    How will you send the request?
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSentWithNote(true)}
                      className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: sentWithNote ? "var(--color-accent-subtle)" : "var(--color-void)",
                        border: `1px solid ${sentWithNote ? "var(--color-accent)" : "var(--color-edge)"}`,
                        color: sentWithNote ? "var(--color-accent)" : "var(--color-muted)",
                      }}
                    >
                      <SendIcon className="w-4 h-4" />
                      With Note
                    </button>
                    <button
                      type="button"
                      onClick={() => setSentWithNote(false)}
                      className="flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: !sentWithNote ? "var(--color-accent-subtle)" : "var(--color-void)",
                        border: `1px solid ${!sentWithNote ? "var(--color-accent)" : "var(--color-edge)"}`,
                        color: !sentWithNote ? "var(--color-accent)" : "var(--color-muted)",
                      }}
                    >
                      <UserPlusIcon className="w-4 h-4" />
                      Without Note
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: "var(--color-ghost)" }}>
                    {sentWithNote
                      ? "Copy the message above and paste it when sending the connection request."
                      : "Send a bare request now; you'll DM them after they accept."}
                  </p>
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || isOverLimit || (sentWithNote && !draft.trim())}
                className="w-full h-12 rounded-xl font-medium disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                {isSaving ? (
                  "Adding..."
                ) : sentWithNote ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Mark Sent → Pipeline
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-5 h-5" />
                    Add to Requested
                  </>
                )}
              </button>
            </div>
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
