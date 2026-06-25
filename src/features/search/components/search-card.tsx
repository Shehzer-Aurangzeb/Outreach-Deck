"use client";

import { useState } from "react";

import type { DailySearch } from "../lib/daily-search-generator";

const ANGLE_CONFIG = {
  ALUM: {
    color: "var(--color-accent)",
    bg: "var(--color-accent-subtle)",
    label: "Alumni",
    rationale: "Shared school connection — highest reply rate",
    icon: GraduationIcon,
  },
  STACK: {
    color: "var(--color-info)",
    bg: "var(--color-info-subtle)",
    label: "Tech Stack",
    rationale: "Mid-level dev on your stack — remembers the hiring process",
    icon: CodeIcon,
  },
  RECRUITER: {
    color: "var(--color-success)",
    bg: "var(--color-success-subtle)",
    label: "Recruiter",
    rationale: "Replies reliably — gives real pipeline info",
    icon: BriefcaseIcon,
  },
};

const TIER_CONFIG = {
  MID: { label: "Mid-size", color: "var(--color-info)" },
  CONSULTANCY: { label: "Consultancy", color: "var(--color-warning)" },
  LARGE: { label: "Enterprise", color: "var(--color-accent)" },
};

function GraduationIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function CodeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function BriefcaseIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function CopyIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LinkedInIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function UserPlusIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

function ExternalLinkIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

interface SearchCardProps {
  search: DailySearch;
  onSelect: (search: DailySearch) => void;
}

export function SearchCard({ search, onSelect }: SearchCardProps) {
  const [copied, setCopied] = useState(false);

  const angleConfig = ANGLE_CONFIG[search.angle];
  const tierConfig = TIER_CONFIG[search.company.tier];
  const AngleIcon = angleConfig.icon;

  const copyQuery = async () => {
    await navigator.clipboard.writeText(search.query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col h-full group transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: "var(--color-base)",
        border: "1px solid var(--color-edge)",
      }}
    >
      {/* Header with Angle Indicator */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ backgroundColor: angleConfig.bg }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <AngleIcon className="w-4 h-4" style={{ color: angleConfig.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: angleConfig.color }}>
              {angleConfig.label}
            </span>
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: tierConfig.color,
              }}
            >
              {tierConfig.label}
            </span>
          </div>
        </div>
      </div>

      {/* Company Name */}
      <div className="px-4 pt-4 pb-2">
        <h3
          className="font-semibold text-lg truncate"
          style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
          title={search.company.name}
        >
          {search.company.name}
        </h3>
        <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>
          {angleConfig.rationale}
        </p>
      </div>

      {/* Query Box */}
      <div className="px-4 py-3 flex-1">
        <div
          className="rounded-lg p-3 font-mono text-xs leading-relaxed cursor-pointer select-all transition-colors hover:bg-[var(--color-raised)] relative group/query"
          onClick={copyQuery}
          style={{
            backgroundColor: "var(--color-void)",
            color: "var(--color-text)",
            border: "1px solid var(--color-edge)",
          }}
          title="Click to copy"
        >
          <span className="line-clamp-3">{search.query}</span>
          <div 
            className="absolute top-2 right-2 opacity-0 group-hover/query:opacity-100 transition-opacity"
            style={{ color: "var(--color-muted)" }}
          >
            {copied ? <CheckIcon className="w-4 h-4" style={{ color: "var(--color-success)" }} /> : <CopyIcon className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 space-y-2">
        {/* Primary Actions Row */}
        <div className="flex gap-2">
          <button
            onClick={copyQuery}
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
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
          <a
            href={search.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-10 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: "#0A66C2",
              color: "white",
            }}
          >
            <LinkedInIcon className="w-4 h-4" />
            <span>Open</span>
            <ExternalLinkIcon className="w-3 h-3 opacity-70" />
          </a>
        </div>

        {/* Found Someone Button */}
        <button
          onClick={() => onSelect(search)}
          className="w-full h-11 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "white",
          }}
        >
          <UserPlusIcon className="w-4 h-4" />
          <span>Found Someone</span>
        </button>
      </div>
    </div>
  );
}
