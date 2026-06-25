import type { Stage } from "@prisma/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  getContacts,
  updateContactStage,
  addMessage,
  deleteContact,
} from "../actions/contact-actions";
import {
  applyStageMove,
  applyMessageAppend,
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
    queryFn: () => getContacts(),
    staleTime: 1000 * 60,
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, stage }: { contactId: string; stage: Stage }) =>
      updateContactStage(contactId, stage),
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
      void queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

export function useAddMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { contactId: string; role: "YOU" | "THEM"; text: string }) =>
      addMessage(input),
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
      void queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => deleteContact(contactId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
}

