import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCardRequest, type UpdateCardRequest } from "@shared/routes";

// ============================================
// CARDS HOOKS
// ============================================

export function useCards(params?: { search?: string; type?: 'student' | 'staff'; department?: string }) {
  const queryKey = [api.cards.list.path, params];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Filter out undefined params
      const cleanParams: Record<string, string> = {};
      if (params?.search) cleanParams.search = params.search;
      if (params?.type) cleanParams.type = params.type;
      if (params?.department) cleanParams.department = params.department;

      const url = params ? `${api.cards.list.path}?${new URLSearchParams(cleanParams)}` : api.cards.list.path;
      
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch cards');
      return api.cards.list.responses[200].parse(await res.json());
    },
  });
}

export function useCard(id: number) {
  return useQuery({
    queryKey: [api.cards.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cards.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error('Failed to fetch card');
      return api.cards.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCardRequest) => {
      const validated = api.cards.create.input.parse(data);
      const res = await fetch(api.cards.create.path, {
        method: api.cards.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.cards.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to create card');
      }
      return api.cards.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cards.list.path] }),
  });
}

export function useUpdateCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateCardRequest) => {
      const validated = api.cards.update.input.parse(updates);
      const url = buildUrl(api.cards.update.path, { id });
      const res = await fetch(url, {
        method: api.cards.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.cards.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error('Card not found');
        throw new Error('Failed to update card');
      }
      return api.cards.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cards.list.path] }),
  });
}

export function useDeleteCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cards.delete.path, { id });
      const res = await fetch(url, { method: api.cards.delete.method, credentials: "include" });
      if (res.status === 404) throw new Error('Card not found');
      if (!res.ok) throw new Error('Failed to delete card');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cards.list.path] }),
  });
}

export function useBulkCreateCards() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCardRequest[]) => {
      const validated = api.cards.bulkCreate.input.parse(data);
      const res = await fetch(api.cards.bulkCreate.path, {
        method: api.cards.bulkCreate.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.cards.bulkCreate.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to bulk create cards');
      }
      return api.cards.bulkCreate.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.cards.list.path] }),
  });
}
