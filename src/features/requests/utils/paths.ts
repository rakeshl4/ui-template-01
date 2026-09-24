export function soaResultsPath(requestId: string, tableId?: string) {
  const base = `/requests/${requestId}/soa`
  return tableId ? `${base}?table=${encodeURIComponent(tableId)}` : base
}
