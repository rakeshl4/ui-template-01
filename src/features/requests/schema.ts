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
  attachments: z.array(requestAttachmentSchema).max(1, 'Only one PDF file can be uploaded').optional(),
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
})

export type SoaFootnote = z.infer<typeof soaFootnoteSchema>

export const soaTableSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  pageRange: z.string().optional(),
  rowCount: z.number(),
  columnCount: z.number(),
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
