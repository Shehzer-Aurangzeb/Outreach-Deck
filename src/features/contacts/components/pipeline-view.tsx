"use client";

import { useState, useMemo } from "react";
import type { Stage } from "@prisma/client";

import { ErrorState } from "@/components/error-state";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  MessageIcon,
  MessagesIcon,
  SendIcon,
  SparklesIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons";

import { useContacts } from "../hooks/use-contacts";
import { type ContactWithMessages } from "./contact-card";
import { ContactListPane } from "./contact-list-pane";
import { ConversationPane } from "./conversation-pane";
import { PipelineColumn } from "./pipeline-column";

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string; icon: React.FC<{ className?: string; style?: React.CSSProperties }> }> = {
  REQUESTED: {
    label: "Requested",
    color: "var(--color-warning)",
    bg: "var(--color-warning-subtle)",
    icon: ClockIcon
  },
  CONTACTED: { 
    label: "Contacted", 
    color: "var(--color-muted)", 
    bg: "rgba(161, 161, 170, 0.1)",
    icon: SendIcon 
  },
  REPLIED: { 
    label: "Replied", 
    color: "var(--color-info)", 
    bg: "var(--color-info-subtle)",
    icon: MessageIcon 
  },
  TALKING: { 
    label: "In Conversation", 
    color: "var(--color-accent)", 
    bg: "var(--color-accent-subtle)",
    icon: MessagesIcon 
  },
  CLOSED: { 
    label: "Closed", 
    color: "var(--color-success)", 
    bg: "var(--color-success-subtle)",
    icon: CheckCircleIcon 
  },
};

const STAGE_ORDER: Stage[] = ["REQUESTED", "CONTACTED", "REPLIED", "TALKING", "CLOSED"];

export function PipelineView() {
  const { data: contacts = [], isLoading, error, refetch } = useContacts();
  const [selectedContact, setSelectedContact] = useState<ContactWithMessages | null>(null);

  const contactsByStage = useMemo(() => 
    STAGE_ORDER.reduce(
      (acc, stage) => {
        acc[stage] = contacts.filter((c) => c.stage === stage);
        return acc;
      },
      {} as Record<Stage, ContactWithMessages[]>
    ), [contacts]);

  const stats = useMemo(() => {
    const total = contacts.length;
    const replied = contacts.filter(c => c.stage !== "CONTACTED").length;
    const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0;
    const closed = contacts.filter(c => c.stage === "CLOSED").length;
    const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0;
    return { total, replied, replyRate, closed, conversionRate };
  }, [contacts]);

  const handleContactClick = (contact: ContactWithMessages) => {
    setSelectedContact(contact);
  };

  const handleCloseConversation = () => {
    setSelectedContact(null);
  };

  const handleContactDeleted = () => {
    setSelectedContact(null);
  };

  const currentSelectedContact = selectedContact
    ? contacts.find((c) => c.id === selectedContact.id) ?? null
    : null;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4 sm:space-y-6">
          <div className="h-24 rounded-xl" style={{ backgroundColor: "var(--color-base)" }} />
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 sm:h-96 rounded-xl" style={{ backgroundColor: "var(--color-base)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load pipeline" message={error.message} onRetry={refetch} />;
  }

  if (currentSelectedContact) {
    return (
      <div
        className="fixed inset-0 z-50 flex"
        style={{ backgroundColor: "var(--color-void)" }}
      >
        {/* Contact list - hidden on mobile, shown on md+ */}
        <div
          className="hidden md:flex w-80 flex-col shrink-0"
          style={{
            backgroundColor: "var(--color-base)",
            borderRight: "1px solid var(--color-edge)",
          }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--color-edge)" }}
          >
            <h2
              className="font-semibold text-sm"
              style={{ color: "var(--color-bright)" }}
            >
              Contacts ({contacts.length})
            </h2>
            <button
              onClick={handleCloseConversation}
              className="p-1.5 rounded-lg transition-colors hover:bg-[var(--color-raised)]"
              style={{ color: "var(--color-muted)" }}
              title="Close conversation"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
          <ContactListPane
            contacts={contacts}
            selectedId={currentSelectedContact.id}
            onSelect={handleContactClick}
          />
        </div>

        {/* Conversation pane - full width on mobile */}
        <div className="flex-1 flex flex-col relative">
          <ConversationPane
            contact={currentSelectedContact}
            onDeleted={handleContactDeleted}
            onBack={handleCloseConversation}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div
        className="rounded-xl p-4 sm:p-6"
        style={{
          backgroundColor: "var(--color-base)",
          border: "1px solid var(--color-edge)",
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent-subtle)" }}
            >
              <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--color-accent)" }} />
            </div>
            <div>
              <h1
                className="text-xl sm:text-2xl font-bold"
                style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
              >
                Pipeline
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: "var(--color-muted)" }}>
                Track your outreach conversations
              </p>
            </div>
          </div>

          {contacts.length > 0 && (
            <div className="flex gap-4 sm:gap-6">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-bright)" }}>
                  {stats.total}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-info)" }}>
                  {stats.replyRate}%
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Reply Rate
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold" style={{ color: "var(--color-success)" }}>
                  {stats.closed}
                </div>
                <div className="text-xs" style={{ color: "var(--color-muted)" }}>
                  Closed
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {contacts.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{
            backgroundColor: "var(--color-base)",
            border: "1px solid var(--color-edge)",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--color-accent-subtle)" }}
          >
            <SparklesIcon className="w-8 h-8" style={{ color: "var(--color-accent)" }} />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: "var(--color-bright)", fontFamily: "var(--font-display)" }}
          >
            No contacts yet
          </h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--color-muted)" }}>
            Start by finding someone on the Today tab. When you click &quot;Found Someone&quot;, they&apos;ll appear here.
          </p>
          <a
            href="/"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <span>Go to Today</span>
            <ArrowRightIcon className="w-4 h-4" />
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4 pb-4">
          <div className="flex gap-3 sm:gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {STAGE_ORDER.map((stage) => (
              <PipelineColumn
                key={stage}
                stage={stage}
                config={STAGE_CONFIG[stage]}
                contacts={contactsByStage[stage]}
                onContactClick={handleContactClick}
              />
            ))}
          </div>
        </div>
      )}

      {contacts.length > 0 && (
        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: "var(--color-raised)",
            border: "1px solid var(--color-edge)",
          }}
        >
          <div className="flex items-start gap-3">
            <TrendingUpIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Pipeline Tip
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                Click on any contact card to view the full conversation, draft AI-powered replies, and update their stage.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
