import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveRequest,
  createRequest,
  deleteRequest,
  getExtraction,
  getRequest,
  listRequests,
  startExtraction,
  updateRequest,
  updateTable,
} from '@/features/requests/api/requestsApi'
import type {
  CreateRequestInput,
  Request,
  SoaExtraction,
  SoaTable,
} from '@/features/requests/schema'

export const EXTRACTION_POLL_INTERVAL_MS = 1500

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestKeys.details(), id] as const,
  extraction: (id: string) => [...requestKeys.detail(id), 'extraction'] as const,
}

/** An extraction is running exactly while the request status is 'In Progress'. */
export function isExtracting(request: Request | undefined): boolean {
  return request?.status === 'In Progress'
}

export function useRequests() {
  return useQuery({
    queryKey: requestKeys.lists(),
    queryFn: listRequests,
  })
}

/**
 * Fetches a request. Polls while an extraction is running (status 'In Progress') and refreshes
 * the extraction results and lists once the status moves on.
 */
export function useRequest(
  id: string | undefined,
  { onExtractionComplete }: { onExtractionComplete?: (request: Request) => void } = {},
) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: requestKeys.detail(id ?? ''),
    queryFn: () => getRequest(id!),
    enabled: Boolean(id),
    retry: false,
    refetchInterval: (q) => (isExtracting(q.state.data) ? EXTRACTION_POLL_INTERVAL_MS : false),
  })

  const request = query.data
  const previousStatus = useRef(request?.status)
  const onCompleteRef = useRef(onExtractionComplete)
  onCompleteRef.current = onExtractionComplete

  useEffect(() => {
    const prev = previousStatus.current
    previousStatus.current = request?.status
    if (!id || !request || prev !== 'In Progress' || request.status === 'In Progress') return

    queryClient.invalidateQueries({ queryKey: requestKeys.extraction(id) })
    queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    if (request.status === 'Ready' || request.status === 'Failed') onCompleteRef.current?.(request)
  }, [id, request, queryClient])

  return query
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

export function useDeleteRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}

export function useStartExtraction(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => startExtraction(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}

export function useApproveRequest(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => approveRequest(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(requestKeys.detail(id), updated)
      queryClient.invalidateQueries({ queryKey: requestKeys.lists() })
    },
  })
}

export function useExtraction(id: string | undefined, { enabled = true } = {}) {
  return useQuery({
    queryKey: requestKeys.extraction(id ?? ''),
    queryFn: () => getExtraction(id!),
    enabled: Boolean(id) && enabled,
    retry: false,
  })
}

export function useUpdateTable(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (table: SoaTable) => updateTable(id, table),
    onSuccess: (updatedTable) => {
      queryClient.setQueryData<SoaExtraction>(requestKeys.extraction(id), (prev) =>
        prev
          ? {
              ...prev,
              tables: prev.tables.map((t) => (t.id === updatedTable.id ? updatedTable : t)),
            }
          : prev,
      )
    },
  })
}
