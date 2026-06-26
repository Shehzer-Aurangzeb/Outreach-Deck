"use client";

import { useRef } from "react";

import {
  BriefcaseIcon,
  CodeIcon,
  DocumentIcon,
  DownloadIcon,
  EditIcon,
  FileTextIcon,
  GraduationIcon,
  MapPinIcon,
  SpinnerIcon,
  UploadIcon,
} from "@/components/icons";

import {
  useDownloadCv,
  useParsePdf,
  useProfile,
  useUploadCv,
} from "../hooks/use-profile";
import type { ProfileFormInput } from "../schema";
import { ProfileField } from "./profile-field";

export interface CvUploadData {
  url: string;
  fileName: string;
  parsed: ProfileFormInput;
}

interface ProfileViewProps {
  profile: NonNullable<ReturnType<typeof useProfile>["data"]>;
  onEdit: () => void;
  onEditWithCv: (data: CvUploadData) => void;
}

export function ProfileView({ profile, onEdit, onEditWithCv }: ProfileViewProps) {
  const downloadCv = useDownloadCv();
  const uploadCv = useUploadCv();
  const parsePdf = useParsePdf();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isUploading = uploadCv.isPending || parsePdf.isPending;

  const handleDownload = async () => {
    try {
      const url = await downloadCv.mutateAsync();
      window.open(url, "_blank");
    } catch {
      // Error handled by mutation
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload to storage and parse in parallel
      const [uploaded, parsed] = await Promise.all([
        uploadCv.mutateAsync(file),
        parsePdf.mutateAsync(file),
      ]);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Go to edit mode with parsed data
      onEditWithCv({
        url: uploaded.url,
        fileName: uploaded.fileName,
        parsed,
      });
    } catch {
      // Error handled by mutation
      // Reset input on error too
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold mb-1"
            style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
          >
            Your Profile
          </h1>
          <p className="text-sm sm:text-base" style={{ color: "var(--color-muted)" }}>
            This information is used to personalize your outreach messages
          </p>
        </div>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors w-full sm:w-auto"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "white",
          }}
        >
          <EditIcon className="w-4 h-4" />
          Update Profile
        </button>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{
          backgroundColor: "var(--color-base)",
          border: "1px solid var(--color-edge)",
        }}
      >
        {/* Profile Header */}
        <div
          className="px-4 sm:px-6 py-4 sm:py-5 flex items-center gap-3 sm:gap-4"
          style={{
            backgroundColor: "var(--color-raised)",
            borderBottom: "1px solid var(--color-edge)",
          }}
        >
          <div
            className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0"
            style={{
              backgroundColor: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
            }}
          >
            {profile.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2
              className="text-lg sm:text-xl font-semibold truncate"
              style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
            >
              {profile.name}
            </h2>
            <p className="text-sm sm:text-base truncate" style={{ color: "var(--color-muted)" }}>{profile.role}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <ProfileField icon={<MapPinIcon />} label="Location" value={profile.location} />
          <ProfileField icon={<CodeIcon />} label="Tech Stack" value={profile.stack} />
          <ProfileField icon={<BriefcaseIcon />} label="Experience" value={profile.experience} />
          <ProfileField icon={<GraduationIcon />} label="Education" value={profile.education} />
          {profile.summary && (
            <ProfileField icon={<FileTextIcon />} label="Summary" value={profile.summary} />
          )}
        </div>
      </div>

      {/* CV Section */}
      <div
        className="rounded-2xl p-4 sm:p-6"
        style={{
          backgroundColor: "var(--color-base)",
          border: "1px solid var(--color-edge)",
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: profile.cvFileName
                  ? "var(--color-success-subtle)"
                  : "var(--color-muted-subtle, rgba(161, 161, 170, 0.1))",
              }}
            >
              <DocumentIcon
                className="w-5 h-5 sm:w-6 sm:h-6"
                style={{
                  color: profile.cvFileName ? "var(--color-success)" : "var(--color-muted)",
                }}
              />
            </div>
            <div className="min-w-0">
              <h3
                className="font-semibold mb-1 text-sm sm:text-base"
                style={{ color: "var(--color-bright)" }}
              >
                {profile.cvFileName ? "CV on File" : "No CV Uploaded"}
              </h3>
              {profile.cvFileName ? (
                <>
                  <p className="text-sm truncate" style={{ color: "var(--color-text)" }}>
                    {profile.cvFileName}
                  </p>
                  {profile.cvUploadedAt && (
                    <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
                      Uploaded {formatDate(profile.cvUploadedAt)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  Upload a CV to keep a copy on file for reference
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-13 sm:ml-0">
            {/* Upload / Replace button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-1 sm:flex-none"
              style={{
                backgroundColor: profile.cvFileName ? "var(--color-surface)" : "var(--color-accent)",
                color: profile.cvFileName ? "var(--color-text)" : "white",
                border: profile.cvFileName ? "1px solid var(--color-edge)" : "none",
              }}
            >
              {isUploading ? (
                <>
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <UploadIcon className="w-4 h-4" />
                  {profile.cvFileName ? "Replace" : "Upload CV"}
                </>
              )}
            </button>

            {/* Download button - only show if CV exists */}
            {profile.cvFileName && (
              <button
                onClick={handleDownload}
                disabled={downloadCv.isPending}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-colors flex-1 sm:flex-none"
                style={{
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-edge)",
                }}
              >
                {downloadCv.isPending ? (
                  <SpinnerIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <DownloadIcon className="w-4 h-4" />
                )}
                Download
              </button>
            )}
          </div>
        </div>

        {(downloadCv.error || uploadCv.error || parsePdf.error) && (
          <p className="mt-3 text-sm" style={{ color: "var(--color-danger)" }}>
            {downloadCv.error?.message || uploadCv.error?.message || parsePdf.error?.message}
          </p>
        )}
      </div>

      {/* Timestamps */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs" style={{ color: "var(--color-ghost)" }}>
        <span>Profile created {formatDate(profile.createdAt)}</span>
        <span>Last updated {formatDate(profile.updatedAt)}</span>
      </div>
    </div>
  );
}
