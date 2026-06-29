import type { Stage } from "@prisma/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { MOCK_CONTACTS, USE_MOCK_DATA } from "@/lib/mock-data";

import {
  getContacts,
  updateContactStage,
  addMessage,
  deleteContact,
  deleteMessage,
} from "../actions/contact-actions";
import {
  applyStageMove,
  applyMessageAppend,
  applyMessageDelete,
  type ContactWithMessages,
} from "../lib/optimistic-updates";

export const contactKeys = {
  all: ["contacts"] as const,
  list: () => [...contactKeys.all, "list"] as const,
  detail: (id: string) => [...contactKeys.all, "detail", id] as const,
};

export function useContacts() {
  return useQuery({
    queryKey: contactKeys.list(),
    queryFn: () => (USE_MOCK_DATA ? Promise.resolve(MOCK_CONTACTS) : getContacts()),
    staleTime: 1000 * 60,
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, stage }: { contactId: string; stage: Stage }) => {
      // Mock mode: optimistic update only, no server call
      if (USE_MOCK_DATA) return { success: true };
      return updateContactStage(contactId, stage);
    },
    onMutate: async ({ contactId, stage }) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.list() });

      const previous = queryClient.getQueryData<ContactWithMessages[]>(contactKeys.list());

      if (previous) {
        queryClient.setQueryData(contactKeys.list(), applyStageMove(previous, contactId, stage));
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(contactKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      // Skip invalidation in mock mode (no server data to refetch)
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all });
      }
    },
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { contactId: string; role: "YOU" | "THEM"; text: string }) => {
      // Mock mode: optimistic update only, no server call
      if (USE_MOCK_DATA) return { success: true };
      return addMessage(input);
    },
    onMutate: async ({ contactId, role, text }) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.list() });

      const previous = queryClient.getQueryData<ContactWithMessages[]>(contactKeys.list());

      if (previous) {
        queryClient.setQueryData(
          contactKeys.list(),
          applyMessageAppend(previous, contactId, { contactId, role, text })
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(contactKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all });
      }
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      if (USE_MOCK_DATA) return { success: true };
      return deleteContact(contactId);
    },
    onSuccess: () => {
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all });
      }
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, messageId }: { contactId: string; messageId: string }) => {
      if (USE_MOCK_DATA) return { success: true };
      return deleteMessage(messageId);
    },
    onMutate: async ({ contactId, messageId }) => {
      await queryClient.cancelQueries({ queryKey: contactKeys.list() });

      const previous = queryClient.getQueryData<ContactWithMessages[]>(contactKeys.list());

      if (previous) {
        queryClient.setQueryData(
          contactKeys.list(),
          applyMessageDelete(previous, contactId, messageId)
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(contactKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      if (!USE_MOCK_DATA) {
        void queryClient.invalidateQueries({ queryKey: contactKeys.all });
      }
    },
  });
}

