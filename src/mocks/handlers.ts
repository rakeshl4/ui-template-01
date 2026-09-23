import { http, HttpResponse, delay } from 'msw'
import { requests } from '@/mocks/data'
import type { CreateRequestInput, Request } from '@/features/requests/schema'

const API_BASE = '/api'

function randomDelay() {
  return delay(400 + Math.round(Math.random() * 400))
}

function nextId(): string {
  const numbers = requests.map((r) => Number(r.id.replace('REQ-', '')))
  const max = numbers.length > 0 ? Math.max(...numbers) : 1000
  return `REQ-${max + 1}`
}

export const handlers = [
  http.get(`${API_BASE}/requests`, async ({ request }) => {
    await randomDelay()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase().trim()
    const status = url.searchParams.get('status')
    const sort = url.searchParams.get('sort') ?? 'createdAt-desc'

    let results = [...requests]

    if (search) {
      results = results.filter(
        (r) =>
          r.title.toLowerCase().includes(search) ||
          r.id.toLowerCase().includes(search) ||
          r.requestedBy.toLowerCase().includes(search),
      )
    }
    if (status) {
      results = results.filter((r) => r.status === status)
    }

    results.sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sort === 'createdAt-asc' ? diff : -diff
    })

    return HttpResponse.json(results)
  }),

  http.get(`${API_BASE}/requests/:id`, async ({ params }) => {
    await randomDelay()
    const found = requests.find((r) => r.id === params.id)
    if (!found) {
      return HttpResponse.json({ message: 'Request not found' }, { status: 404 })
    }
    return HttpResponse.json(found)
  }),

  http.post(`${API_BASE}/requests`, async ({ request }) => {
    await randomDelay()
    const input = (await request.json()) as CreateRequestInput
    const now = new Date().toISOString()
    const created: Request = {
      id: nextId(),
      title: input.title,
      description: input.description,
      status: input.status,
      requestedBy: input.requestedBy,
      dueDate: input.dueDate,
      attachments: input.attachments,
      createdAt: now,
      updatedAt: now,
    }
    requests.unshift(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.patch(`${API_BASE}/requests/:id`, async ({ params, request }) => {
    await randomDelay()
    const index = requests.findIndex((r) => r.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ message: 'Request not found' }, { status: 404 })
    }
    const patch = (await request.json()) as Partial<CreateRequestInput>
    const updated: Request = {
      ...requests[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    }
    requests[index] = updated
    return HttpResponse.json(updated)
  }),
]
