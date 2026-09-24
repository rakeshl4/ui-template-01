import type {
  DocumentInfoDto,
  ErrorResponseDto,
  SoaExtractionRequestDto,
  SoaExtractionResponseDto,
  SoaTableExtractionResultDto,
  UploadDocumentResponseDto,
} from '@/features/requests/api/dto'
import type {
  CreateRequestInput,
  Request,
  SoaExtraction,
  SoaFootnote,
  SoaTable,
} from '@/features/requests/schema'

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
      | (Partial<ErrorResponseDto> & { message?: string })
      | null
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
    tables: withTables.map((r, i) => {
      const table = r.soaTable!
      return {
        id: r.id,
        index: i + 1,
        title: table.caption?.trim() || `Table ${i + 1}`,
        rowCount: table.procedures?.length ?? 0,
        columnCount: table.visits?.length ?? 0,
        footnotes: (table.footnotes ?? []).map((f, j) => ({
          id: f.footnoteId ?? String(j),
          marker: f.footnoteId ?? String(j + 1),
          text: f.text ?? '',
        })),
      }
    }),
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
  const res = await fetch(`${RESOURCE}/${encodeURIComponent(requestId)}/results`)
  return toExtraction(requestId, await handleResponse<SoaTableExtractionResultDto[]>(res))
}

// TODO: the API has no endpoint for saving edited footnotes yet; the path below is a placeholder.
// When it exists, the body should also carry each footnote's procedureIds, which the UI model drops.
export async function updateTable(
  requestId: string,
  tableId: string,
  input: { footnotes: SoaFootnote[] },
): Promise<SoaTable> {
  const res = await fetch(
    `${RESOURCE}/${encodeURIComponent(requestId)}/results/${encodeURIComponent(tableId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
  )
  return handleResponse<SoaTable>(res)
}
