import { http, HttpResponse, delay } from 'msw'
import {
  buildExtraction,
  extractionStarts,
  extractions,
  extractionTiming,
  requests,
} from '@/mocks/data'
import type {
  SoaExtractionRequestDto,
  SoaTableExtractionResultDto,
} from '@/features/requests/api/dto'
import type { Request, SoaExtraction, SoaFootnote } from '@/features/requests/schema'

// Mirrors the hosted SOA API (OpenAPI spec: /openapi/v1.json). Internal state stays in the UI's
// shape and is serialised to the API's DTOs on the way out, so the real adapters run in tests.
const RESOURCE = `${import.meta.env.VITE_API_BASE_URL}/api/protocol-docs`

function randomDelay() {
  return delay(400 + Math.round(Math.random() * 400))
}

function error(message: string, status: number, requestId?: string) {
  return HttpResponse.json({ error: message, requestId: requestId ?? null }, { status })
}

function nextId(): string {
  const numbers = requests.map((r) => Number(r.id.replace('REQ-', '')))
  const max = numbers.length > 0 ? Math.max(...numbers) : 1000
  return `REQ-${max + 1}`
}

function setRequestStatus(id: string, status: Request['status']) {
  const index = requests.findIndex((r) => r.id === id)
  if (index === -1) return
  requests[index] = { ...requests[index], status, updatedAt: new Date().toISOString() }
}

function documentId(requestId: string) {
  return `${requestId}-D1`
}

function toRequestDto(r: Request): SoaExtractionRequestDto {
  return {
    id: r.id,
    requestId: r.id,
    type: 'Request',
    title: r.title,
    description: r.description ?? null,
    submittedDate: r.createdAt,
    status: r.status,
    documentSections: [],
    documents: (r.attachments ?? []).map((a, i) => ({
      id: `${r.id}-D${i + 1}`,
      name: a.name,
      size: a.size,
      uploadedDate: r.createdAt,
      blobPath: `${r.id}/${a.name}`,
      contentType: 'application/pdf',
      kind: 'ProtocolPdf',
    })),
  }
}

function toResultDtos(extraction: SoaExtraction): SoaTableExtractionResultDto[] {
  return extraction.tables.map((t) => ({
    id: t.id,
    requestId: extraction.requestId,
    type: 'Data',
    documentId: documentId(extraction.requestId),
    extractedDate: extraction.extractedAt,
    soaTable: {
      caption: t.title,
      visits: Array.from({ length: t.columnCount }, (_, i) => ({ visitId: `VISIT_${i + 1}` })),
      procedures: Array.from({ length: t.rowCount }, (_, i) => ({
        procedureId: `PROC_${i + 1}`,
        name: `Procedure ${i + 1}`,
      })),
      scheduleItems: [],
      footnotes: t.footnotes.map((f) => ({ footnoteId: f.marker, procedureIds: [], text: f.text })),
    },
  }))
}

/** Completes a mock extraction once its duration has elapsed by moving the request to 'Ready'. */
function settleExtractions() {
  for (const [id, run] of extractionStarts) {
    if (Date.now() - run.startedAt < extractionTiming.durationMs) continue
    extractionStarts.delete(id)
    extractions.set(id, buildExtraction(id, run.runId, new Date().toISOString()))
    setRequestStatus(id, 'Ready')
  }
}

export const handlers = [
  http.get(RESOURCE, async () => {
    await randomDelay()
    settleExtractions()
    return HttpResponse.json(requests.map(toRequestDto))
  }),

  http.get(`${RESOURCE}/:id`, async ({ params }) => {
    await randomDelay()
    settleExtractions()
    const found = requests.find((r) => r.id === params.id)
    if (!found) return error('Protocol document not found', 404, params.id as string)
    return HttpResponse.json(toRequestDto(found))
  }),

  http.post(`${RESOURCE}/uploadDocument`, async ({ request }) => {
    await randomDelay()
    const form = await request.formData()
    const title = form.get('Title')
    const file = form.get('ProtocolPdf')
    if (typeof title !== 'string' || title.trim() === '') return error('Title is required', 400)

    const now = new Date().toISOString()
    const created: Request = {
      id: nextId(),
      title,
      description: (form.get('Description') as string | null) || undefined,
      status: 'Submitted',
      attachments: file instanceof File ? [{ name: file.name, size: file.size }] : [],
      createdAt: now,
      updatedAt: now,
    }
    requests.unshift(created)
    return HttpResponse.json({ requestId: created.id, status: created.status })
  }),

  http.delete(`${RESOURCE}/:id`, async ({ params }) => {
    await randomDelay()
    const id = params.id as string
    const index = requests.findIndex((r) => r.id === id)
    if (index !== -1) requests.splice(index, 1)
    extractionStarts.delete(id)
    extractions.delete(id)
    return new HttpResponse(null, { status: 204 })
  }),

  // The hosted API runs extraction inline; the mock keeps the request 'In Progress' for a while
  // so the UI's polling can be exercised.
  http.post(`${RESOURCE}/:id/extract`, async ({ params }) => {
    await randomDelay()
    const id = params.id as string
    if (!requests.some((r) => r.id === id)) return error('Protocol document not found', 404, id)

    extractionStarts.set(id, {
      runId: `RUN-${id.replace('REQ-', '')}-${Date.now()}`,
      startedAt: Date.now(),
    })
    setRequestStatus(id, 'In Progress')
    return HttpResponse.json({ requestId: id })
  }),

  // Placeholder: the hosted API has no approve endpoint yet.
  http.post(`${RESOURCE}/:id/approve`, async ({ params }) => {
    await randomDelay()
    const id = params.id as string
    const found = requests.find((r) => r.id === id)
    if (!found) return error('Protocol document not found', 404, id)
    if (found.status !== 'Ready') return error('Only a Ready request can be approved', 409, id)
    setRequestStatus(id, 'Approved')
    return HttpResponse.json({ requestId: id })
  }),

  http.get(`${RESOURCE}/:id/results`, async ({ params }) => {
    await randomDelay()
    settleExtractions()
    const id = params.id as string
    const found = extractions.get(id)
    if (!found) return error('Extraction not found.', 404, id)
    return HttpResponse.json(toResultDtos(found))
  }),

  // Placeholder: the hosted API has no endpoint for saving edited footnotes yet.
  http.put(`${RESOURCE}/:id/results/:tableId`, async ({ params, request }) => {
    await randomDelay()
    const extraction = extractions.get(params.id as string)
    const table = extraction?.tables.find((t) => t.id === params.tableId)
    if (!extraction || !table) return error('Table not found', 404)
    const { footnotes } = (await request.json()) as { footnotes: SoaFootnote[] }
    const updated = { ...table, footnotes }
    extractions.set(extraction.requestId, {
      ...extraction,
      tables: extraction.tables.map((t) => (t.id === table.id ? updated : t)),
    })
    return HttpResponse.json(updated)
  }),
]
