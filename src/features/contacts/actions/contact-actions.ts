"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const createContactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  angle: z.enum(["ALUM", "STACK", "RECRUITER"]),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  profileText: z.string().optional(),
  firstMessage: z.string().optional(), // The connection note (may be empty if sent without note)
  sentWithNote: z.boolean().default(true), // true = note sent, false = bare request
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

export async function createContact(
  input: CreateContactInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = createContactSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  // If sent with note, require a message
  if (data.sentWithNote && !data.firstMessage?.trim()) {
    return { error: "Connection note is required when sending with a note" };
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        name: data.name,
        company: data.company,
        angle: data.angle,
        linkedinUrl: data.linkedinUrl || null,
        profileText: data.profileText || null,
        // REQUESTED = bare request (waiting for accept), CONTACTED = note sent (message landed)
        stage: data.sentWithNote ? "CONTACTED" : "REQUESTED",
        // Only log message if note was actually sent
        ...(data.sentWithNote && data.firstMessage
          ? {
              messages: {
                create: {
                  role: "YOU",
                  text: data.firstMessage,
                },
              },
            }
          : {}),
      },
    });

    revalidatePath("/pipeline");
    return { id: contact.id };
  } catch (err) {
    console.error("Create contact error:", err);
    return { error: "Failed to create contact" };
  }
}

const addMessageSchema = z.object({
  contactId: z.string().min(1),
  role: z.enum(["YOU", "THEM"]),
  text: z.string().min(1, "Message is required"),
});

export async function addMessage(
  input: z.infer<typeof addMessageSchema>
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = addMessageSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { contactId, role, text } = parsed.data;

  try {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: user.id },
    });

    if (!contact) {
      return { error: "Contact not found" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          contactId,
          role,
          text,
        },
      });

      // Auto-advance stage based on message flow
      // REQUESTED + YOU message = they accepted, now we've messaged them → CONTACTED
      if (role === "YOU" && contact.stage === "REQUESTED") {
        await tx.contact.update({
          where: { id: contactId },
          data: { stage: "CONTACTED" },
        });
      } else if (role === "THEM" && contact.stage === "CONTACTED") {
        await tx.contact.update({
          where: { id: contactId },
          data: { stage: "REPLIED" },
        });
      } else if (role === "YOU" && contact.stage === "REPLIED") {
        await tx.contact.update({
          where: { id: contactId },
          data: { stage: "TALKING" },
        });
      }
    });

    revalidatePath("/pipeline");
    revalidatePath(`/contact/${contactId}`);
    return { success: true };
  } catch (err) {
    console.error("Add message error:", err);
    return { error: "Failed to add message" };
  }
}

export async function updateContactStage(
  contactId: string,
  stage: "REQUESTED" | "CONTACTED" | "REPLIED" | "TALKING" | "CLOSED"
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: user.id },
    });

    if (!contact) {
      return { error: "Contact not found" };
    }

    await prisma.contact.update({
      where: { id: contactId },
      data: { stage },
    });

    revalidatePath("/pipeline");
    return { success: true };
  } catch (err) {
    console.error("Update stage error:", err);
    return { error: "Failed to update stage" };
  }
}

export async function getContacts() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return prisma.contact.findMany({
    where: { userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getContact(contactId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return prisma.contact.findFirst({
    where: { id: contactId, userId: user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function deleteContact(
  contactId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    const contact = await prisma.contact.findFirst({
      where: { id: contactId, userId: user.id },
    });

    if (!contact) {
      return { error: "Contact not found" };
    }

    // Messages are deleted via cascade
    await prisma.contact.delete({
      where: { id: contactId },
    });

    revalidatePath("/pipeline");
    return { success: true };
  } catch (err) {
    console.error("Delete contact error:", err);
    return { error: "Failed to delete contact" };
  }
}

export async function deleteMessage(
  messageId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  try {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { contact: true },
    });

    if (!message) {
      return { error: "Message not found" };
    }

    if (message.contact.userId !== user.id) {
      return { error: "Not authorized" };
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    revalidatePath("/pipeline");
    return { success: true };
  } catch (err) {
    console.error("Delete message error:", err);
    return { error: "Failed to delete message" };
  }
}

