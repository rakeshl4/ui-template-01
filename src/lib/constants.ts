export const APP_NAME = 'Requests'

export const STATUSES = ['Draft', 'Submitted', 'In Review', 'Approved', 'Rejected'] as const

export const STATUS_LABELS: Record<(typeof STATUSES)[number], string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  'In Review': 'In Review',
  Approved: 'Approved',
  Rejected: 'Rejected',
}
