import { type KeyboardEvent, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { SoaFootnote, SoaProcedure, SoaTable, SoaVisit } from '@/features/requests/schema'
import { footnoteDomId, procedureDisplayName } from '@/features/requests/utils/footnotes'
import { cellKey } from '@/features/requests/utils/schedule'
import { buildVisitHeaderRows, visitLabel } from '@/features/requests/utils/visitHeaders'

interface SoaGridProps {
  table: SoaTable
  /** Draft schedule (cell keys). `table.scheduleItems` is the saved one, used to flag edits. */
  scheduleItems: string[]
  /** Draft footnotes, so marker tooltips show the text as it is being edited. */
  footnotes: SoaFootnote[]
  disabled?: boolean
  onToggle: (key: string) => void
}

interface Position {
  row: number
  col: number
}

// Cells are rendered as '0' (off), '1' (on) per visit so rows can be memoised on plain strings.
function rowSignature(visits: SoaVisit[], procedureId: string, keys: Set<string>): string {
  return visits.map((v) => (keys.has(cellKey(v.id, procedureId)) ? '1' : '0')).join('')
}

function focusFootnote(tableId: string, footnoteId: string) {
  const row = document.getElementById(footnoteDomId(tableId, footnoteId))
  if (!row) return
  row.scrollIntoView({ behavior: 'smooth', block: 'center' })
  row.querySelector('textarea')?.focus({ preventScroll: true })
}

/**
 * Schedule of Assessments grid: visits across the top, activities down the side. The only edit is
 * toggling a cell between scheduled (X) and not. Keyboard: the grid is one Tab stop; arrow keys,
 * Home/End move between cells and Space/Enter toggles.
 */
export function SoaGrid({
  table,
  scheduleItems,
  footnotes,
  disabled = false,
  onToggle,
}: SoaGridProps) {
  const { visits, procedures } = table
  const headerRows = useMemo(() => buildVisitHeaderRows(visits), [visits])
  const visitLabels = useMemo(() => visits.map(visitLabel), [visits])

  const footnotesByProcedure = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const f of table.footnotes) {
      for (const id of f.procedureIds) map.set(id, [...(map.get(id) ?? []), f.id])
    }
    return map
  }, [table.footnotes])

  const footnoteTexts = useMemo(() => new Map(footnotes.map((f) => [f.id, f.text])), [footnotes])

  const current = useMemo(() => new Set(scheduleItems), [scheduleItems])
  const saved = useMemo(() => new Set(table.scheduleItems), [table.scheduleItems])

  const [active, setActive] = useState<Position>({ row: 0, col: 0 })
  const gridRef = useRef<HTMLTableElement>(null)

  // Keep the roving tab stop inside the grid when the table changes shape.
  useEffect(() => {
    setActive((p) => ({
      row: Math.min(p.row, Math.max(0, procedures.length - 1)),
      col: Math.min(p.col, Math.max(0, visits.length - 1)),
    }))
  }, [procedures.length, visits.length])

  // Rows are memoised, so hand them a callback whose identity never changes.
  const onToggleRef = useRef(onToggle)
  onToggleRef.current = onToggle
  const toggle = useCallback((key: string) => onToggleRef.current(key), [])
  const activate = useCallback((row: number, col: number) => setActive({ row, col }), [])

  function onKeyDown(e: KeyboardEvent<HTMLTableElement>) {
    const target = e.target as HTMLElement
    if (target.dataset.row === undefined) return
    const row = Number(target.dataset.row)
    const col = Number(target.dataset.col)
    const lastRow = procedures.length - 1
    const lastCol = visits.length - 1
    let next: Position | null = null
    switch (e.key) {
      case 'ArrowUp':
        next = { row: Math.max(0, row - 1), col }
        break
      case 'ArrowDown':
        next = { row: Math.min(lastRow, row + 1), col }
        break
      case 'ArrowLeft':
        next = { row, col: Math.max(0, col - 1) }
        break
      case 'ArrowRight':
        next = { row, col: Math.min(lastCol, col + 1) }
        break
      case 'Home':
        next = e.ctrlKey ? { row: 0, col: 0 } : { row, col: 0 }
        break
      case 'End':
        next = e.ctrlKey ? { row: lastRow, col: lastCol } : { row, col: lastCol }
        break
    }
    if (!next || e.altKey || e.metaKey) return
    e.preventDefault()
    setActive(next)
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-row="${next.row}"][data-col="${next.col}"]`)
      ?.focus()
  }

  if (visits.length === 0 || procedures.length === 0) {
    return (
      <div
        className="bg-muted/30 text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm"
        data-testid="soa-grid"
      >
        No {visits.length === 0 ? 'visits' : 'activities'} were extracted for this table.
      </div>
    )
  }

  return (
    <div className="space-y-2" data-testid="soa-grid">
      <p className="text-muted-foreground text-xs">
        Click a cell to mark the activity as scheduled at that visit (X).
      </p>

      <TooltipProvider delayDuration={150}>
        <div className="max-h-[70vh] overflow-auto rounded-md border">
          <table
            ref={gridRef}
            role="grid"
            aria-label={table.title}
            aria-rowcount={procedures.length + headerRows.length}
            aria-colcount={visits.length + 1}
            className="w-max min-w-full border-separate border-spacing-0 text-sm"
            onKeyDown={onKeyDown}
          >
            <thead className="bg-muted sticky top-0 z-20">
              {headerRows.map((headerRow) => (
                <tr key={headerRow.key}>
                  <th
                    scope="row"
                    className="bg-muted text-muted-foreground sticky left-0 z-30 border-r border-b px-3 py-1.5 text-right text-xs font-medium"
                  >
                    {headerRow.label}
                  </th>
                  {headerRow.cells.map((cell) => (
                    <th
                      key={cell.key}
                      scope={cell.span > 1 ? 'colgroup' : 'col'}
                      colSpan={cell.span}
                      className="text-foreground border-r border-b px-2 py-1.5 text-center text-xs font-semibold whitespace-nowrap tabular-nums last:border-r-0"
                    >
                      {cell.label}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {procedures.map((procedure, row) => (
                <SoaGridRow
                  key={procedure.id}
                  tableId={table.id}
                  procedure={procedure}
                  row={row}
                  visits={visits}
                  visitLabels={visitLabels}
                  footnoteIds={footnotesByProcedure.get(procedure.id)}
                  footnoteTexts={footnoteTexts}
                  current={rowSignature(visits, procedure.id, current)}
                  saved={rowSignature(visits, procedure.id, saved)}
                  activeCol={active.row === row ? active.col : null}
                  disabled={disabled}
                  onToggle={toggle}
                  onActivate={activate}
                />
              ))}
            </tbody>
          </table>
        </div>
      </TooltipProvider>
    </div>
  )
}

interface SoaGridRowProps {
  tableId: string
  procedure: SoaProcedure
  row: number
  visits: SoaVisit[]
  visitLabels: string[]
  footnoteIds: string[] | undefined
  footnoteTexts: Map<string, string>
  current: string
  saved: string
  /** Column holding the grid's tab stop, when it is in this row. */
  activeCol: number | null
  disabled: boolean
  onToggle: (key: string) => void
  onActivate: (row: number, col: number) => void
}

const SoaGridRow = memo(function SoaGridRow({
  tableId,
  procedure,
  row,
  visits,
  visitLabels,
  footnoteIds = [],
  footnoteTexts,
  current,
  saved,
  activeCol,
  disabled,
  onToggle,
  onActivate,
}: SoaGridRowProps) {
  const name = procedureDisplayName(procedure.name, footnoteIds)

  return (
    <tr className="group">
      <th
        scope="row"
        className="bg-card group-hover:bg-muted sticky left-0 z-10 max-w-72 min-w-48 border-r border-b px-3 py-1.5 text-left font-normal"
      >
        <span className="text-foreground">{name}</span>
        {footnoteIds.length > 0 && (
          <sup className="ml-0.5 space-x-0.5">
            {footnoteIds.map((id) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="text-primary hover:underline"
                    aria-label={`Footnote ${id}`}
                    onClick={() => focusFootnote(tableId, id)}
                  >
                    {id}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-sm text-left whitespace-pre-line">
                  <span className="font-semibold">Footnote {id}: </span>
                  {footnoteTexts.get(id)?.trim() || 'No text'}
                </TooltipContent>
              </Tooltip>
            ))}
          </sup>
        )}
      </th>
      {visits.map((visit, col) => {
        const on = current[col] === '1'
        const edited = current[col] !== saved[col]
        const key = cellKey(visit.id, procedure.id)
        return (
          <td
            key={visit.id}
            className={cn(
              'group-hover:bg-muted/60 border-r border-b p-0 text-center last:border-r-0',
              edited && 'bg-accent group-hover:bg-accent',
            )}
          >
            <button
              type="button"
              data-row={row}
              data-col={col}
              tabIndex={activeCol === col ? 0 : -1}
              aria-pressed={on}
              aria-label={`${name} at ${visitLabels[col]}`}
              title={edited ? 'Edited — not saved yet' : undefined}
              disabled={disabled}
              onClick={() => onToggle(key)}
              onFocus={() => onActivate(row, col)}
              className={cn(
                'hover:bg-primary/10 focus-visible:ring-ring flex h-8 w-full min-w-14 items-center justify-center font-semibold outline-none focus-visible:ring-2 focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-60',
                on ? 'text-foreground' : 'text-transparent',
              )}
            >
              {on ? 'X' : ''}
            </button>
          </td>
        )
      })}
    </tr>
  )
})
