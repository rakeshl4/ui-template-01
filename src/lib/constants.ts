export const APP_NAME = 'SOA Application'

export const STATUSES = ['Submitted', 'In Progress', 'Ready', 'Approved'] as const

export const STATUS_LABELS: Record<(typeof STATUSES)[number], string> = {
  Submitted: 'Submitted',
  'In Progress': 'In Progress',
  Ready: 'Ready',
  Approved: 'Approved',
}
