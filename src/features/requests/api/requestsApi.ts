import type { CreateRequestInput, Request, RequestFilters } from '@/features/requests/schema'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(body?.message ?? `Request failed with status ${res.status}`, res.status)
  }
  return res.json() as Promise<T>
}

export async function listRequests(filters: RequestFilters = {}): Promise<Request[]> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.status) params.set('status', filters.status)
  if (filters.sort) params.set('sort', filters.sort)

  const res = await fetch(`${BASE_URL}/requests?${params.toString()}`)
  return handleResponse<Request[]>(res)
}

export async function getRequest(id: string): Promise<Request> {
  const res = await fetch(`${BASE_URL}/requests/${id}`)
  return handleResponse<Request>(res)
}

export async function createRequest(input: CreateRequestInput): Promise<Request> {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<Request>(res)
}

export async function updateRequest(
  id: string,
  input: Partial<CreateRequestInput>,
): Promise<Request> {
  const res = await fetch(`${BASE_URL}/requests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return handleResponse<Request>(res)
}
