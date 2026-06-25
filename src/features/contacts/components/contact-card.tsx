"use client";

import type { Contact, Message, Stage, Angle } from "@prisma/client";

const ANGLE_CONFIG: Record<Angle, { color: string; bg: string; label: string }> = {
  ALUM: { color: "var(--color-accent)", bg: "var(--color-accent-subtle)", label: "Alumni" },
  STACK: { color: "var(--color-info)", bg: "var(--color-info-subtle)", label: "Tech Stack" },
  RECRUITER: { color: "var(--color-success)", bg: "var(--color-success-subtle)", label: "Recruiter" },
};

function MessageIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PinIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
    </svg>
  );
}

function ChevronRightIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function UserIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export type ContactWithMessages = Contact & { messages: Message[] };

interface ContactCardProps {
  contact: ContactWithMessages;
  onClick: () => void;
}

export function ContactCard({ contact, onClick }: ContactCardProps) {
  const angleConfig = ANGLE_CONFIG[contact.angle];
  const lastMessage = contact.messages[contact.messages.length - 1];
  const lastMessagePreview = lastMessage
    ? lastMessage.text.slice(0, 50) + (lastMessage.text.length > 50 ? "..." : "")
    : null;

  // Get initials for avatar
  const initials = contact.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] group"
      style={{
        backgroundColor: "var(--color-raised)",
        border: "1px solid var(--color-edge)",
      }}
    >
      {/* Header with Avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{
            backgroundColor: angleConfig.bg,
            color: angleConfig.color,
          }}
        >
          {initials || <UserIcon className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className="font-semibold text-sm truncate"
              style={{ color: "var(--color-bright)" }}
            >
              {contact.name}
            </h4>
            <ChevronRightIcon 
              className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
              style={{ color: "var(--color-muted)" }}
            />
          </div>
          <p
            className="text-xs truncate"
            style={{ color: "var(--color-muted)" }}
          >
            {contact.company}
          </p>
        </div>
      </div>

      {/* Angle Badge */}
      <div className="mb-3">
        <span
          className="inline-flex items-center text-xs px-2 py-1 rounded-md"
          style={{
            backgroundColor: angleConfig.bg,
            color: angleConfig.color,
          }}
        >
          {angleConfig.label}
        </span>
      </div>

      {/* Last message preview */}
      {lastMessagePreview && (
        <div
          className="rounded-lg p-2.5 mb-3"
          style={{
            backgroundColor: "var(--color-void)",
            border: "1px solid var(--color-edge)",
          }}
        >
          <p
            className="text-xs line-clamp-2"
            style={{ color: "var(--color-text)" }}
          >
            <span style={{ color: lastMessage?.role === "YOU" ? "var(--color-accent)" : "var(--color-info)" }}>
              {lastMessage?.role === "YOU" ? "You: " : "Them: "}
            </span>
            {lastMessagePreview}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--color-edge)" }}>
        <div className="flex items-center gap-1.5">
          <MessageIcon className="w-3.5 h-3.5" style={{ color: "var(--color-ghost)" }} />
          <span className="text-xs" style={{ color: "var(--color-muted)" }}>
            {contact.messages.length}
          </span>
        </div>
        {contact.nextStep && (
          <div 
            className="flex items-center gap-1 max-w-[120px]"
            title={contact.nextStep}
          >
            <PinIcon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--color-warning)" }} />
            <span
              className="text-xs truncate"
              style={{ color: "var(--color-warning)" }}
            >
              {contact.nextStep}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
