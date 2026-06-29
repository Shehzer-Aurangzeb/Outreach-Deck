import type { Contact, Message, Stage } from "@prisma/client";

export type ContactWithMessages = Contact & { messages: Message[] };

export function applyStageMove(
  contacts: ContactWithMessages[],
  contactId: string,
  newStage: Stage
): ContactWithMessages[] {
  return contacts.map((contact) =>
    contact.id === contactId
      ? { ...contact, stage: newStage, updatedAt: new Date() }
      : contact
  );
}

export function rollbackStageMove(
  previousContacts: ContactWithMessages[]
): ContactWithMessages[] {
  return previousContacts;
}

export function applyMessageAppend(
  contacts: ContactWithMessages[],
  contactId: string,
  message: Omit<Message, "id" | "createdAt">
): ContactWithMessages[] {
  return contacts.map((contact) =>
    contact.id === contactId
      ? {
          ...contact,
          messages: [
            ...contact.messages,
            {
              ...message,
              id: `optimistic-${Date.now()}`,
              createdAt: new Date(),
            },
          ],
          updatedAt: new Date(),
        }
      : contact
  );
}

export function rollbackMessageAppend(
  previousContacts: ContactWithMessages[]
): ContactWithMessages[] {
  return previousContacts;
}

export function replaceOptimisticMessage(
  contacts: ContactWithMessages[],
  contactId: string,
  optimisticId: string,
  confirmedMessage: Message
): ContactWithMessages[] {
  return contacts.map((contact) =>
    contact.id === contactId
      ? {
          ...contact,
          messages: contact.messages.map((msg) =>
            msg.id === optimisticId ? confirmedMessage : msg
          ),
        }
      : contact
  );
}

export function applyMessageDelete(
  contacts: ContactWithMessages[],
  contactId: string,
  messageId: string
): ContactWithMessages[] {
  return contacts.map((contact) =>
    contact.id === contactId
      ? {
          ...contact,
          messages: contact.messages.filter((msg) => msg.id !== messageId),
          updatedAt: new Date(),
        }
      : contact
  );
}
