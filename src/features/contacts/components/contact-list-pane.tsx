"use client";

import type { Stage } from "@prisma/client";

import { UserIcon } from "@/components/icons";

import { ANGLE_CONFIG, STAGE_CONFIG } from "../constants";
import type { ContactWithMessages } from "./contact-card";

interface ContactListPaneProps {
  contacts: ContactWithMessages[];
  selectedId: string | null;
  onSelect: (contact: ContactWithMessages) => void;
}

export function ContactListPane({
  contacts,
  selectedId,
  onSelect,
}: ContactListPaneProps) {
  if (contacts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-sm text-center" style={{ color: "var(--color-muted)" }}>
          No contacts yet
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {contacts.map((contact) => {
        const isSelected = contact.id === selectedId;
        const angleConfig = ANGLE_CONFIG[contact.angle];
        const stageConfig = STAGE_CONFIG[contact.stage];
        const initials = contact.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        const lastMessage = contact.messages[contact.messages.length - 1];
        const preview = lastMessage
          ? lastMessage.text.slice(0, 40) + (lastMessage.text.length > 40 ? "..." : "")
          : "No messages yet";

        return (
          <button
            key={contact.id}
            onClick={() => onSelect(contact)}
            className="group w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 relative"
            style={{
              backgroundColor: isSelected ? "var(--color-raised)" : "transparent",
              boxShadow: isSelected ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
            }}
          >
            {/* Active indicator bar */}
            {isSelected && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                style={{ backgroundColor: "var(--color-accent)" }}
              />
            )}

            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all"
                style={{
                  backgroundColor: angleConfig.bg,
                  color: angleConfig.color,
                  boxShadow: isSelected ? `0 0 0 2px ${angleConfig.color}` : "none",
                }}
              >
                {initials || <UserIcon className="w-4 h-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className="font-semibold text-[13px] truncate"
                    style={{ color: "var(--color-bright)" }}
                  >
                    {contact.name}
                  </span>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 uppercase tracking-wide"
                    style={{
                      backgroundColor: stageConfig.bg,
                      color: stageConfig.color,
                      border: `1px solid ${stageConfig.color}20`,
                    }}
                  >
                    {stageConfig.label}
                  </span>
                </div>
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {contact.company}
                </p>
                <p
                  className="text-[11px] truncate mt-1"
                  style={{ color: "var(--color-muted)" }}
                >
                  {preview}
                </p>
              </div>
            </div>

            {/* Hover background */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10"
              style={{ backgroundColor: "var(--color-edge)" }}
            />
          </button>
        );
      })}
    </div>
  );
}
