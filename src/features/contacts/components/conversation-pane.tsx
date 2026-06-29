"use client";

import { useState } from "react";
import type { Stage } from "@prisma/client";

import { MessageSquareIcon, SparklesIcon, UserPlusIcon } from "@/components/icons";
import { useToast } from "@/components/toast";
import { draftFirstDM, draftReply } from "@/features/drafting/actions/draft-actions";
import { Composer } from "@/shared/ui/composer";

import { useUpdateStage, useAddMessage, useDeleteContact, useDeleteMessage } from "../hooks/use-contacts";
import type { ContactWithMessages } from "./contact-card";
import { ConversationComposer } from "./conversation-composer";
import { ConversationHeader } from "./conversation-header";
import { MessageBubble } from "./message-bubble";

interface ConversationPaneProps {
  contact: ContactWithMessages;
  onDeleted: () => void;
  onBack?: () => void;
}

export function ConversationPane({ contact, onDeleted, onBack }: ConversationPaneProps) {
  const { addToast } = useToast();

  const [theirReply, setTheirReply] = useState("");
  const [draft, setDraft] = useState("");
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStageMutation = useUpdateStage();
  const addMessageMutation = useAddMessage();
  const deleteContactMutation = useDeleteContact();
  const deleteMessageMutation = useDeleteMessage();

  const isRequested = contact.stage === "REQUESTED";

  const handleDeleteMessage = async (messageId: string) => {
    const result = await deleteMessageMutation.mutateAsync({
      contactId: contact.id,
      messageId,
    });
    if ("error" in result) {
      addToast(result.error, "error");
    }
  };

  const handleStageChange = async (stage: Stage) => {
    if (stage === contact.stage) return;
    const result = await updateStageMutation.mutateAsync({
      contactId: contact.id,
      stage,
    });
    if (!("error" in result)) {
      addToast(`Stage → ${stage}`, "success");
    }
  };

  const handleLogTheirReply = async () => {
    if (!theirReply.trim()) return;

    const result = await addMessageMutation.mutateAsync({
      contactId: contact.id,
      role: "THEM",
      text: theirReply.trim(),
    });

    if (!("error" in result)) {
      setTheirReply("");
      addToast("Reply logged", "success");
    }
  };

  const handleDraftReply = async () => {
    if (contact.messages.length === 0) return;
    setIsGeneratingDraft(true);
    setError(null);

    const intent = draft.trim() || undefined;
    const result = await draftReply(contact.id, intent);

    setIsGeneratingDraft(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setDraft(result.draft);
    }
  };

  const handleDraftFirstDM = async () => {
    setIsGeneratingDraft(true);
    setError(null);

    const result = await draftFirstDM(contact.id);

    setIsGeneratingDraft(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setDraft(result.draft);
    }
  };

  const handleSendDraft = async () => {
    if (!draft.trim()) return;

    const result = await addMessageMutation.mutateAsync({
      contactId: contact.id,
      role: "YOU",
      text: draft.trim(),
    });

    if (!("error" in result)) {
      setDraft("");
      addToast(isRequested ? "First message sent! Moved to Contacted." : "Message logged", "success");
    }
  };

  const handleDelete = async () => {
    const result = await deleteContactMutation.mutateAsync(contact.id);
    if (!("error" in result)) {
      addToast(`${contact.name} deleted`, "info");
      onDeleted();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader
        name={contact.name}
        company={contact.company}
        angle={contact.angle}
        stage={contact.stage}
        linkedinUrl={contact.linkedinUrl}
        onStageChange={handleStageChange}
        onDelete={handleDelete}
        onBack={onBack}
        isStagePending={updateStageMutation.isPending}
      />

      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ backgroundColor: "var(--color-void)" }}
      >
        {contact.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: "var(--color-base)" }}
            >
              <MessageSquareIcon className="w-6 h-6" style={{ color: "var(--color-ghost)" }} />
            </div>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              No messages yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-ghost)" }}>
              Log their replies and draft your responses
            </p>
          </div>
        ) : (
          contact.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onDelete={handleDeleteMessage}
              isDeleting={deleteMessageMutation.isPending && deleteMessageMutation.variables?.messageId === message.id}
            />
          ))
        )}
      </div>

      {isRequested ? (
        <div
          className="p-4 space-y-3"
          style={{
            borderTop: "1px solid var(--color-edge)",
            backgroundColor: "var(--color-base)",
          }}
        >
          <div
            className="p-3 rounded-lg flex items-start gap-2"
            style={{
              backgroundColor: "var(--color-warning-subtle)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
            }}
          >
            <UserPlusIcon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-warning)" }} />
            <div>
              <p className="text-xs font-medium" style={{ color: "var(--color-warning)" }}>
                Waiting for {contact.name} to accept
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>
                Draft your first DM below for when they accept.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1.5" style={{ color: "var(--color-muted)" }}>
              <SparklesIcon className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
              First message
            </span>
            <button
              onClick={handleDraftFirstDM}
              disabled={isGeneratingDraft}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              {isGeneratingDraft ? "Drafting..." : "They Accepted — Draft DM"}
            </button>
          </div>

          {error && (
            <div
              className="text-xs p-2 rounded-lg"
              style={{
                backgroundColor: "var(--color-danger-subtle)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}

          <Composer
            value={draft}
            onChange={setDraft}
            onPrimaryAction={handleSendDraft}
            primaryIcon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            }
            primaryLabel="Mark Sent → Contacted"
            placeholder="Click 'They Accepted — Draft DM' once they accept..."
            isLoading={addMessageMutation.isPending}
            disabled={!draft.trim()}
            minRows={2}
            maxRows={4}
          />
        </div>
      ) : (
        <ConversationComposer
          theirReply={theirReply}
          onTheirReplyChange={setTheirReply}
          onLogTheirReply={handleLogTheirReply}
          myDraft={draft}
          onMyDraftChange={setDraft}
          onDraftReply={handleDraftReply}
          onMarkSent={handleSendDraft}
          isGeneratingReply={isGeneratingDraft}
          isLogging={addMessageMutation.isPending}
          hasMessages={contact.messages.length > 0}
          error={error}
        />
      )}
    </div>
  );
}
