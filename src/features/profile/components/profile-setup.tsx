"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CheckIcon, ClipboardIcon, DocumentIcon } from "@/components/icons";

import {
  useParseCv,
  useParsePdf,
  useProfile,
  useSaveProfile,
  useUploadCv,
} from "../hooks/use-profile";
import { profileFormSchema, type ProfileFormInput } from "../schema";
import type { CvUploadData } from "./profile-view";
import { CvPdfUpload } from "./cv-pdf-upload";
import { CvTextInput } from "./cv-text-input";
import { FormField } from "./form-field";
import { StepIndicator } from "./step-indicator";

type SetupStep = "upload" | "review" | "complete";
type InputMode = "pdf" | "text";

interface ProfileSetupProps {
  existingProfile?: NonNullable<ReturnType<typeof useProfile>["data"]>;
  uploadedCvData?: CvUploadData;
  onCancel?: () => void;
}

export function ProfileSetup({ existingProfile, uploadedCvData, onCancel }: ProfileSetupProps) {
  const router = useRouter();

  
  const [step, setStep] = useState<SetupStep>(
    uploadedCvData ? "review" : existingProfile ? "review" : "upload"
  );
  const [inputMode, setInputMode] = useState<InputMode>("pdf");
  const [cvText, setCvText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedCv, setUploadedCv] = useState<{ url: string; fileName: string } | null>(
    uploadedCvData ? { url: uploadedCvData.url, fileName: uploadedCvData.fileName } : null
  );

  
  const parseCv = useParseCv();
  const parsePdf = useParsePdf();
  const uploadCv = useUploadCv();
  const saveProfile = useSaveProfile();

  const isParsing = parseCv.isPending || parsePdf.isPending;
  const parseError = parseCv.error || parsePdf.error;

  const getDefaultValues = (): ProfileFormInput => {
    if (uploadedCvData) {
      return uploadedCvData.parsed;
    }
    if (existingProfile) {
      return {
        name: existingProfile.name,
        role: existingProfile.role,
        location: existingProfile.location,
        stack: existingProfile.stack,
        experience: existingProfile.experience,
        education: existingProfile.education,
        summary: existingProfile.summary ?? "",
      };
    }
    return {
      name: "",
      role: "",
      location: "",
      stack: "",
      experience: "",
      education: "",
      summary: "",
    };
  };

  const form = useForm<ProfileFormInput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getDefaultValues(),
  });

  
  const handleParsePdf = async () => {
    if (!selectedFile) return;

    try {
      const parsed = await parsePdf.mutateAsync(selectedFile);
      form.reset(parsed);

      const uploaded = await uploadCv.mutateAsync(selectedFile);
      setUploadedCv(uploaded);

      setStep("review");
    } catch {
      // Error handled by mutation
    }
  };

  const handleParseText = async () => {
    if (cvText.length < 50) return;

    try {
      const parsed = await parseCv.mutateAsync(cvText);
      form.reset(parsed);
      setStep("review");
    } catch {
      // Error handled by mutation
    }
  };

  const handleSave = async (data: ProfileFormInput) => {
    try {
      await saveProfile.mutateAsync({
        data,
        cvFile: uploadedCv ? { url: uploadedCv.url, name: uploadedCv.fileName } : undefined,
      });
      setStep("complete");
      setTimeout(() => {
        if (onCancel) {
          onCancel();
        } else {
          router.push("/");
          router.refresh();
        }
      }, 1500);
    } catch {
      // Error handled by mutation
    }
  };

  const handleSkipToManual = () => {
    setStep("review");
  };

  const handleBack = () => {
    if (existingProfile && step === "review") {
      onCancel?.();
    } else {
      setStep("upload");
    }
  };

  
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
        >
          {existingProfile ? "Update Your Profile" : "Complete Your Profile"}
        </h1>
        <p style={{ color: "var(--color-muted)" }}>
          {existingProfile
            ? "Update your information or upload a new CV"
            : "Set up your profile so the AI can personalize your connection notes and messages"}
        </p>
      </div>

      {/* Step indicator (only for new users) */}
      {!existingProfile && <StepIndicator currentStep={step} />}

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-6">
          {/* Input mode toggle */}
          <div
            className="flex gap-2 p-1 rounded-lg w-fit"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <button
              type="button"
              onClick={() => setInputMode("pdf")}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: inputMode === "pdf" ? "var(--color-accent)" : "transparent",
                color: inputMode === "pdf" ? "white" : "var(--color-muted)",
              }}
            >
              <span className="flex items-center gap-2">
                <DocumentIcon className="w-4 h-4" />
                Upload PDF
              </span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode("text")}
              className="px-4 py-2 text-sm font-medium rounded-md transition-colors"
              style={{
                backgroundColor: inputMode === "text" ? "var(--color-accent)" : "transparent",
                color: inputMode === "text" ? "white" : "var(--color-muted)",
              }}
            >
              <span className="flex items-center gap-2">
                <ClipboardIcon className="w-4 h-4" />
                Paste Text
              </span>
            </button>
          </div>

          {/* PDF Upload */}
          {inputMode === "pdf" && (
            <CvPdfUpload
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
              onExtract={handleParsePdf}
              onSkip={handleSkipToManual}
              isExtracting={isParsing || uploadCv.isPending}
            />
          )}

          {/* Text Paste */}
          {inputMode === "text" && (
            <CvTextInput
              value={cvText}
              onChange={setCvText}
              onParse={handleParseText}
              onSkip={handleSkipToManual}
              isParsing={isParsing}
            />
          )}

          {parseError && (
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: "var(--color-danger-subtle)",
                border: "1px solid var(--color-danger)",
              }}
            >
              <p className="text-sm" style={{ color: "var(--color-danger)" }}>
                {parseError.message}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                You can still fill in your profile manually.
              </p>
            </div>
          )}

          <p className="text-sm" style={{ color: "var(--color-ghost)" }}>
            The AI will extract your information automatically. Your CV is stored securely for your
            reference — only the extracted profile fields are used for outreach.
          </p>
        </div>
      )}

      {/* Step: Review */}
      {step === "review" && (
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <FormField
            label="Name"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />
          <FormField
            label="Role / Target Title"
            error={form.formState.errors.role?.message}
            {...form.register("role")}
          />
          <FormField
            label="Location"
            error={form.formState.errors.location?.message}
            {...form.register("location")}
          />
          <FormField
            label="Tech Stack / Skills"
            error={form.formState.errors.stack?.message}
            placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
            {...form.register("stack")}
          />
          <FormField
            label="Experience"
            error={form.formState.errors.experience?.message}
            placeholder="e.g. ~4 years"
            {...form.register("experience")}
          />
          <FormField
            label="Education"
            error={form.formState.errors.education?.message}
            placeholder="e.g. M.S. Computer Science, Concordia University"
            {...form.register("education")}
          />
          <FormField
            label="Summary (optional)"
            error={form.formState.errors.summary?.message}
            placeholder="1-2 sentence positioning line"
            {...form.register("summary")}
            multiline
          />

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-text)",
              }}
            >
              {existingProfile ? "Cancel" : "Back"}
            </button>
            <button
              type="submit"
              disabled={saveProfile.isPending}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--color-success)",
                color: "white",
              }}
            >
              {saveProfile.isPending ? "Saving..." : "Save Profile"}
            </button>
          </div>

          {saveProfile.error && (
            <p className="text-sm" style={{ color: "var(--color-danger)" }}>
              {saveProfile.error.message}
            </p>
          )}
        </form>
      )}

      {/* Step: Complete */}
      {step === "complete" && (
        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--color-success)" }}
          >
            <CheckIcon className="w-8 h-8 text-white" />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
          >
            Profile saved!
          </h2>
          <p style={{ color: "var(--color-muted)" }}>
            {existingProfile ? "Returning to profile..." : "Redirecting to dashboard..."}
          </p>
        </div>
      )}
    </div>
  );
}
