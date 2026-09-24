import type { Request, RequestFilters } from '@/features/requests/schema'

export function filterRequests(requests: Request[], filters: RequestFilters): Request[] {
  const search = filters.search?.toLowerCase().trim()

  const results = requests.filter((r) => {
    if (filters.status && r.status !== filters.status) return false
    if (!search) return true
    // TODO: also match requestedBy once login is implemented
    return r.title.toLowerCase().includes(search) || r.id.toLowerCase().includes(search)
  })

  const direction = filters.sort === 'createdAt-asc' ? 1 : -1
  return results.sort(
    (a, b) => direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  )
}
