import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createRequest,
  getRequest,
  listRequests,
  updateRequest,
} from '@/features/requests/api/requestsApi'
import type { CreateRequestInput, RequestFilters } from '@/features/requests/schema'

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (filters: RequestFilters) => [...requestKeys.lists(), filters] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
}

export function useRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => listRequests(filters),
  })
}

export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: requestKeys.detail(id ?? ''),
    queryFn: () => getRequest(id!),
    enabled: Boolean(id),
    retry: false,
  })
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRequestInput) => createRequest(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}

export function useUpdateRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Partial<CreateRequestInput>) => updateRequest(id, input),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
      queryClient.setQueryData(requestKeys.detail(id), updated)
    },
  })
}
