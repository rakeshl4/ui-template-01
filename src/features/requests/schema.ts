import { z } from 'zod'
import { STATUSES } from '@/lib/constants'

export const requestAttachmentSchema = z.object({
  name: z.string(),
  size: z.number(),
})

export type RequestAttachment = z.infer<typeof requestAttachmentSchema>

export const requestSchema = z.object({
  id: z.string(),
  title: z.string().min(5).max(120),
  description: z.string().min(20),
  status: z.enum(STATUSES),
  requestedBy: z.string().min(1),
  dueDate: z.string().optional(),
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
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requestedBy: z.string().min(1, 'Requested by is required'),
  dueDate: z.string().optional(),
  attachments: z.array(requestAttachmentSchema).optional(),
})

export type RequestFormValues = z.infer<typeof requestFormSchema>

export interface CreateRequestInput extends RequestFormValues {
  status: (typeof STATUSES)[number]
}

export interface RequestFilters {
  search?: string
  status?: (typeof STATUSES)[number]
  sort?: 'createdAt-asc' | 'createdAt-desc'
}
