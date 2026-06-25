import type { Angle } from "@prisma/client";

import { ExternalLinkIcon, LinkedInIcon, UserIcon, XIcon } from "@/components/icons";

import { ANGLE_CONFIG } from "../constants";

interface ContactHeaderProps {
  name: string;
  company: string;
  angle: Angle;
  linkedinUrl?: string | null;
  onClose: () => void;
}

export function ContactHeader({
  name,
  company,
  angle,
  linkedinUrl,
  onClose,
}: ContactHeaderProps) {
  const angleConfig = ANGLE_CONFIG[angle];
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="p-5 flex items-start justify-between"
      style={{
        backgroundColor: "var(--color-raised)",
        borderBottom: "1px solid var(--color-edge)",
      }}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
          style={{
            backgroundColor: angleConfig.bg,
            color: angleConfig.color,
          }}
        >
          {initials || <UserIcon className="w-7 h-7" />}
        </div>

        <div>
          <h2
            className="text-xl font-bold"
            style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
          >
            {name}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
            {company}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-2 py-1 rounded-md"
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
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors hover:opacity-80"
                style={{
                  backgroundColor: "#0A66C2",
                  color: "white",
                }}
              >
                <LinkedInIcon className="w-3 h-3" />
                <span>Profile</span>
                <ExternalLinkIcon className="w-3 h-3 opacity-70" />
              </a>
            )}
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
  );
}
