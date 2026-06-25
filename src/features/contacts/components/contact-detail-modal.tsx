"use client";

import { useState } from "react";
import type { Stage } from "@prisma/client";

import { useToast } from "@/components/toast";
import { draftReply } from "@/features/drafting/actions/draft-actions";

import { useUpdateStage, useAddMessage, useDeleteContact } from "../hooks/use-contacts";
import type { ContactWithMessages } from "./contact-card";
import { ContactHeader } from "./contact-header";
import { DeleteFooter } from "./delete-footer";
import { MessageThread } from "./message-thread";
import { ReplyComposer } from "./reply-composer";
import { StageSelector } from "./stage-selector";

interface ContactDetailModalProps {
  contact: ContactWithMessages;
  onClose: () => void;
  onDeleted: () => void;
}

export function ContactDetailModal({ contact, onClose, onDeleted }: ContactDetailModalProps) {
  const { addToast } = useToast();

  const [theirReply, setTheirReply] = useState("");
  const [myDraft, setMyDraft] = useState("");
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStageMutation = useUpdateStage();
  const addMessageMutation = useAddMessage();
  const deleteContactMutation = useDeleteContact();

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
    setIsGeneratingReply(true);
    setError(null);

    const result = await draftReply(contact.id);

    setIsGeneratingReply(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setMyDraft(result.draft);
    }
  };

  const handleMarkSent = async () => {
    if (!myDraft.trim()) return;

    const result = await addMessageMutation.mutateAsync({
      contactId: contact.id,
      role: "YOU",
      text: myDraft.trim(),
    });

    if (!("error" in result)) {
      setMyDraft("");
      addToast("Message logged", "success");
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
        <ContactHeader
          name={contact.name}
          company={contact.company}
          angle={contact.angle}
          linkedinUrl={contact.linkedinUrl}
          onClose={onClose}
        />

        <StageSelector
          currentStage={contact.stage}
          onStageChange={handleStageChange}
          isPending={updateStageMutation.isPending}
        />

        <MessageThread messages={contact.messages} />

        <ReplyComposer
          theirReply={theirReply}
          onTheirReplyChange={setTheirReply}
          onLogTheirReply={handleLogTheirReply}
          myDraft={myDraft}
          onMyDraftChange={setMyDraft}
          onDraftReply={handleDraftReply}
          onMarkSent={handleMarkSent}
          onCopySuccess={() => addToast("Copied to clipboard", "success")}
          isGeneratingReply={isGeneratingReply}
          isLogging={addMessageMutation.isPending}
          hasMessages={contact.messages.length > 0}
          error={error}
        />

        <DeleteFooter
          contactName={contact.name}
          updatedAt={contact.updatedAt}
          onDelete={handleDelete}
          isDeleting={deleteContactMutation.isPending}
        />
      </div>
    </div>
  );
}
