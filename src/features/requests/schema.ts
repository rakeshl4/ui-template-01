import { z } from 'zod'
import { STATUSES } from '@/lib/constants'

export const requestAttachmentSchema = z.object({
  name: z.string(),
  size: z.number(),
  /** Present only for a file picked in the browser and not yet uploaded. */
  file: z.custom<File>((value) => value instanceof File).optional(),
})

export type RequestAttachment = z.infer<typeof requestAttachmentSchema>

export const requestSchema = z.object({
  id: z.string(),
  title: z.string().min(5).max(120),
  description: z.string().optional(),
  status: z.enum(STATUSES),
  /** Why the extraction failed; set only while status is 'Failed'. */
  error: z.string().optional(),
  // requestedBy: z.string().min(1), // TODO: restore once login is implemented
  attachments: z.array(requestAttachmentSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Request = z.infer<typeof requestSchema>

export const requestFormSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title must be at most 120 characters'),
  description: z.string().optional(),
  // requestedBy: z.string().min(1, 'Requested by is required'), // TODO: restore once login is implemented
  attachments: z
    .array(requestAttachmentSchema)
    .max(1, 'Only one PDF file can be uploaded')
    .optional(),
})

export type RequestFormValues = z.infer<typeof requestFormSchema>

export type CreateRequestInput = RequestFormValues

export interface RequestFilters {
  search?: string
  status?: (typeof STATUSES)[number]
  sort?: 'createdAt-asc' | 'createdAt-desc'
}

export const soaFootnoteSchema = z.object({
  id: z.string(),
  marker: z.string(),
  text: z.string().trim().min(1, 'Footnote text is required'),
  /** Procedures (grid rows) the footnote is attached to. Read-only; kept so it round-trips on save. */
  procedureIds: z.array(z.string()),
})

export type SoaFootnote = z.infer<typeof soaFootnoteSchema>

/** A grid column. Every label field is optional; which ones are present varies per table. */
export const soaVisitSchema = z.object({
  id: z.string(),
  phase: z.string().optional(),
  period: z.string().optional(),
  week: z.string().optional(),
  studyDay: z.string().optional(),
  hour: z.string().optional(),
  visitWindow: z.string().optional(),
})

export type SoaVisit = z.infer<typeof soaVisitSchema>

/** A grid row (activity). */
export const soaProcedureSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export type SoaProcedure = z.infer<typeof soaProcedureSchema>

export const soaTableSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  pageRange: z.string().optional(),
  rowCount: z.number(),
  columnCount: z.number(),
  visits: z.array(soaVisitSchema),
  procedures: z.array(soaProcedureSchema),
  /** Scheduled cells as sorted `cellKey(visitId, procedureId)` strings. */
  scheduleItems: z.array(z.string()),
  footnotes: z.array(soaFootnoteSchema),
})

export type SoaTable = z.infer<typeof soaTableSchema>

export const soaExtractionSchema = z.object({
  requestId: z.string(),
  jobId: z.string(),
  extractedAt: z.string(),
  tables: z.array(soaTableSchema),
})

export type SoaExtraction = z.infer<typeof soaExtractionSchema>
