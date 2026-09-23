export { cn } from 'cn'

export function formatDate(iso: string | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(date)
}

export function formatDateTime(iso: string | undefined): string {
  return formatDate(iso, { hour: 'numeric', minute: '2-digit' })
}
