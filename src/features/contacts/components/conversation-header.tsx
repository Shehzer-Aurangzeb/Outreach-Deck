"use client";

import { useState } from "react";
import type { Stage, Angle } from "@prisma/client";

import { ChevronLeftIcon, ExternalLinkIcon, LinkedInIcon, TrashIcon, UserIcon } from "@/components/icons";

import { ANGLE_CONFIG, STAGE_CONFIG, STAGE_ORDER } from "../constants";

interface ConversationHeaderProps {
  name: string;
  company: string;
  angle: Angle;
  stage: Stage;
  linkedinUrl?: string | null;
  onStageChange: (stage: Stage) => void;
  onDelete: () => void;
  onBack?: () => void;
  isStagePending: boolean;
}

export function ConversationHeader({
  name,
  company,
  angle,
  stage,
  linkedinUrl,
  onStageChange,
  onDelete,
  onBack,
  isStagePending,
}: ConversationHeaderProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const angleConfig = ANGLE_CONFIG[angle];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleDeleteClick = () => {
    if (showConfirm) {
      onDelete();
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <div
      className="px-3 md:px-4 py-2.5"
      style={{
        backgroundColor: "var(--color-raised)",
        borderBottom: "1px solid var(--color-edge)",
      }}
    >
      {/* Mobile layout */}
      <div className="flex md:hidden items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 rounded-lg transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{
            backgroundColor: angleConfig.bg,
            color: angleConfig.color,
            boxShadow: `0 0 0 2px ${angleConfig.color}`,
          }}
        >
          {initials || <UserIcon className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <h2
            className="font-semibold text-sm truncate"
            style={{ color: "var(--color-bright)" }}
          >
            {name}
          </h2>
          <span
            className="text-xs truncate block"
            style={{ color: "var(--color-text)" }}
          >
            {company}
          </span>
        </div>
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg shrink-0"
            style={{ color: "#0A66C2" }}
          >
            <LinkedInIcon className="w-5 h-5" />
          </a>
        )}
        <button
          onClick={handleDeleteClick}
          className="p-1.5 rounded-lg transition-all shrink-0"
          style={{
            backgroundColor: showConfirm ? "var(--color-danger-subtle)" : "transparent",
            color: "var(--color-danger)",
          }}
          title={showConfirm ? "Click again to confirm" : "Delete contact"}
        >
          {showConfirm ? (
            <span className="text-[10px] font-medium px-1">?</span>
          ) : (
            <TrashIcon className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{
            backgroundColor: angleConfig.bg,
            color: angleConfig.color,
            boxShadow: `0 0 0 2px ${angleConfig.color}`,
          }}
        >
          {initials || <UserIcon className="w-4 h-4" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h2
              className="font-semibold text-sm truncate"
              style={{ color: "var(--color-bright)" }}
            >
              {name}
            </h2>
            <span style={{ color: "var(--color-ghost)" }}>·</span>
            <span
              className="text-sm truncate"
              style={{ color: "var(--color-text)" }}
            >
              {company}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{
              backgroundColor: angleConfig.bg,
              color: angleConfig.color,
            }}
          >
            {angleConfig.label}
          </span>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full transition-opacity hover:opacity-80"
              style={{
                backgroundColor: "#0A66C2",
                color: "white",
              }}
            >
              <LinkedInIcon className="w-3 h-3" />
              <span>Profile</span>
              <ExternalLinkIcon className="w-2.5 h-2.5 opacity-70" />
            </a>
          )}
        </div>

        <div
          className="flex items-center gap-0.5 p-0.5 rounded-md shrink-0"
          style={{ backgroundColor: "var(--color-void)" }}
        >
          {STAGE_ORDER.map((s) => {
            const config = STAGE_CONFIG[s];
            const isActive = stage === s;
            return (
              <button
                key={s}
                onClick={() => onStageChange(s)}
                disabled={isStagePending}
                className="px-2 py-1 rounded text-[10px] font-medium transition-all"
                style={{
                  backgroundColor: isActive ? config.bg : "transparent",
                  color: isActive ? config.color : "var(--color-muted)",
                }}
                title={config.hint}
              >
                {config.label}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleDeleteClick}
          className="p-1.5 rounded-lg transition-all shrink-0"
          style={{
            backgroundColor: showConfirm ? "var(--color-danger-subtle)" : "transparent",
            color: "var(--color-danger)",
          }}
          title={showConfirm ? "Click again to confirm" : "Delete contact"}
        >
          {showConfirm ? (
            <span className="text-[10px] font-medium px-1">Confirm?</span>
          ) : (
            <TrashIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
