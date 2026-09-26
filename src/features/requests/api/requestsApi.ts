import type {
  DocumentInfoDto,
  ErrorResponseDto,
  SoaExtractionRequestDto,
  SoaExtractionResponseDto,
  SoaTableDto,
  SoaTableExtractionResultDto,
  SoaVisitDto,
  UploadDocumentResponseDto,
} from '@/features/requests/api/dto'
import type {
  CreateRequestInput,
  Request,
  SoaExtraction,
  SoaTable,
  SoaVisit,
} from '@/features/requests/schema'
import { cellKey, normalizeSchedule, parseCellKey } from '@/features/requests/utils/schedule'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const RESOURCE = `${BASE_URL}/api/protocol-docs`

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
    const body = (await res.json().catch(() => null)) as
      (Partial<ErrorResponseDto> & { message?: string }) | null
    throw new ApiError(
      body?.error ?? body?.message ?? `Request failed with status ${res.status}`,
      res.status,
    )
  }
  return res.json() as Promise<T>
}

function latest(dates: (string | null | undefined)[], fallback: string): string {
  const valid = dates.filter((d): d is string => Boolean(d))
  return valid.length === 0 ? fallback : valid.reduce((a, b) => (a > b ? a : b))
}

function toRequest(dto: SoaExtractionRequestDto): Request {
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description ?? undefined,
    // The API status vocabulary is being aligned with the UI's; passed through as-is.
    status: dto.status as Request['status'],
    error: dto.error ?? undefined,
    attachments: (dto.documents ?? []).map((d: DocumentInfoDto) => ({
      name: d.name,
      size: Number(d.size),
    })),
    createdAt: dto.submittedDate,
    // The API has no updatedAt.
    updatedAt: latest(
      (dto.documents ?? []).map((d) => d.uploadedDate),
      dto.submittedDate,
    ),
  }
}

function hasId<T extends { id: string }>(item: T): boolean {
  return item.id.length > 0
}

function toVisit(v: SoaVisitDto): SoaVisit {
  return {
    id: v.visitId ?? '',
    phase: v.phase ?? undefined,
    period: v.period ?? undefined,
    week: v.week ?? undefined,
    studyDay: v.studyDay ?? undefined,
    hour: v.hour ?? undefined,
    visitWindow: v.visitWindow ?? undefined,
  }
}

/** Maps one stored record to a grid. `index` is its 1-based position in the extraction. */
function toSoaTable(record: SoaTableExtractionResultDto, index: number): SoaTable {
  const table = record.soaTable ?? {}
  const visits = (table.visits ?? []).map(toVisit).filter(hasId)
  const procedures = (table.procedures ?? [])
    .map((p) => ({ id: p.procedureId ?? '', name: p.name ?? '' }))
    .filter(hasId)
  const visitIds = new Set(visits.map((v) => v.id))
  const procedureIds = new Set(procedures.map((p) => p.id))

  return {
    id: record.id,
    index,
    title: table.caption?.trim() || `Table ${index}`,
    rowCount: procedures.length,
    columnCount: visits.length,
    visits,
    procedures,
    // Cells pointing at a visit or procedure that isn't in the table can't be shown; drop them.
    scheduleItems: normalizeSchedule(
      (table.scheduleItems ?? [])
        .filter((s) => visitIds.has(s.visitId ?? '') && procedureIds.has(s.procedureId ?? ''))
        .map((s) => cellKey(s.visitId!, s.procedureId!)),
    ),
    footnotes: (table.footnotes ?? []).map((f, j) => ({
      id: f.footnoteId ?? String(j + 1),
      marker: f.footnoteId ?? String(j + 1),
      text: f.text ?? '',
      procedureIds: f.procedureIds ?? [],
    })),
  }
}

/** The body for saving a grid: the whole soaTable, with the user's cell and footnote edits. */
export function toSoaTableDto(table: SoaTable): SoaTableDto {
  return {
    caption: table.title,
    visits: table.visits.map((v) => ({
      visitId: v.id,
      phase: v.phase ?? null,
      period: v.period ?? null,
      week: v.week ?? null,
      studyDay: v.studyDay ?? null,
      hour: v.hour ?? null,
      visitWindow: v.visitWindow ?? null,
    })),
    procedures: table.procedures.map((p) => ({ procedureId: p.id, name: p.name })),
    scheduleItems: table.scheduleItems.map(parseCellKey),
    footnotes: table.footnotes.map((f) => ({
      footnoteId: f.id,
      procedureIds: f.procedureIds,
      text: f.text,
    })),
  }
}

function toExtraction(requestId: string, results: SoaTableExtractionResultDto[]): SoaExtraction {
  const withTables = results.filter((r) => r.soaTable)
  return {
    requestId,
    // The API has no job id.
    jobId: requestId,
    extractedAt: latest(
      withTables.map((r) => r.extractedDate),
      '',
    ),
    tables: withTables.map((r, i) => toSoaTable(r, i + 1)),
  }
}

export async function listRequests(): Promise<Request[]> {
  const res = await fetch(RESOURCE)
  return (await handleResponse<SoaExtractionRequestDto[]>(res)).map(toRequest)
}

export async function getRequest(id: string): Promise<Request> {
  const res = await fetch(`${RESOURCE}/${encodeURIComponent(id)}`)
  return toRequest(await handleResponse<SoaExtractionRequestDto>(res))
}

/** Uploads the PDF with the request details (multipart), then reads the created request back. */
export async function createRequest(input: CreateRequestInput): Promise<Request> {
  const body = new FormData()
  body.append('Title', input.title)
  if (input.description) body.append('Description', input.description)
  const file = input.attachments?.[0]?.file
  if (file) body.append('ProtocolPdf', file)

  const res = await fetch(`${RESOURCE}/uploadDocument`, { method: 'POST', body })
  const { requestId } = await handleResponse<UploadDocumentResponseDto>(res)
  return getRequest(requestId)
}

// TODO: the API has no update endpoint yet; this targets the expected PATCH /api/protocol-docs/{id}.
export async function updateRequest(
  id: string,
  input: Partial<CreateRequestInput>,
): Promise<Request> {
  const res = await fetch(`${RESOURCE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: input.title, description: input.description }),
  })
  return toRequest(await handleResponse<SoaExtractionRequestDto>(res))
}

export async function deleteRequest(id: string): Promise<void> {
  const res = await fetch(`${RESOURCE}/${encodeURIComponent(id)}`, { method: 'DELETE' })
  if (!res.ok) await handleResponse<never>(res)
}

export async function startExtraction(requestId: string): Promise<Request> {
  const res = await fetch(`${RESOURCE}/${encodeURIComponent(requestId)}/extract`, {
    method: 'POST',
  })
  await handleResponse<SoaExtractionResponseDto>(res)
  return getRequest(requestId)
}

// TODO: the API has no approve endpoint yet; this targets the expected POST /api/protocol-docs/{id}/approve.
export async function approveRequest(requestId: string): Promise<Request> {
  const res = await fetch(`${RESOURCE}/${encodeURIComponent(requestId)}/approve`, {
    method: 'POST',
  })
  if (!res.ok) await handleResponse<never>(res)
  return getRequest(requestId)
}

export async function getExtraction(requestId: string): Promise<SoaExtraction> {
  const res = await fetch(`${RESOURCE}/${encodeURIComponent(requestId)}/extraction`)
  return toExtraction(requestId, await handleResponse<SoaTableExtractionResultDto[]>(res))
}

export async function updateTable(requestId: string, table: SoaTable): Promise<SoaTable> {
  const res = await fetch(
    `${RESOURCE}/${encodeURIComponent(requestId)}/extraction/${encodeURIComponent(table.id)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSoaTableDto(table)),
    },
  )
  if (!res.ok) await handleResponse<never>(res)
  return table
}
