import { useMemo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import type { SoaFootnote, SoaProcedure } from '@/features/requests/schema'
import {
  footnoteDomId,
  invalidFootnoteIds,
  procedureDisplayName,
} from '@/features/requests/utils/footnotes'

interface SoaFootnotesEditorProps {
  tableId: string
  /** Used to name the activities each footnote applies to. */
  procedures: SoaProcedure[]
  footnotes: SoaFootnote[]
  /** Last saved footnotes; ones that were already empty aren't flagged as errors. */
  savedFootnotes: SoaFootnote[]
  onChange: (footnotes: SoaFootnote[]) => void
  showErrors?: boolean
  disabled?: boolean
}

/** Controlled editor: drafts live in the parent so they survive switching between tables. */
export function SoaFootnotesEditor({
  tableId,
  procedures,
  footnotes,
  savedFootnotes,
  onChange,
  showErrors = false,
  disabled = false,
}: SoaFootnotesEditorProps) {
  const procedureNames = useMemo(() => {
    const markersByProcedure = new Map<string, string[]>()
    for (const f of footnotes) {
      for (const id of f.procedureIds) {
        markersByProcedure.set(id, [...(markersByProcedure.get(id) ?? []), f.id])
      }
    }
    return new Map(
      procedures.map((p) => [
        p.id,
        procedureDisplayName(p.name, markersByProcedure.get(p.id) ?? []),
      ]),
    )
  }, [procedures, footnotes])

  const invalidIds = useMemo(
    () => invalidFootnoteIds(footnotes, savedFootnotes),
    [footnotes, savedFootnotes],
  )

  function updateText(id: string, text: string) {
    onChange(footnotes.map((f) => (f.id === id ? { ...f, text } : f)))
  }

  return (
    <section aria-labelledby={`${tableId}-footnotes`} className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 id={`${tableId}-footnotes`} className="text-foreground text-sm font-semibold">
          Footnotes
        </h3>
      </div>

      {footnotes.length === 0 ? (
        <p className="text-muted-foreground text-sm">No footnotes for this table.</p>
      ) : (
        <ol className="space-y-2">
          {footnotes.map((f) => {
            const invalid = showErrors && invalidIds.has(f.id)
            const appliesTo = f.procedureIds
              .map((id) => procedureNames.get(id))
              .filter((name): name is string => Boolean(name))
            return (
              <li
                key={f.id}
                id={footnoteDomId(tableId, f.id)}
                className="flex scroll-mt-24 items-start gap-2"
              >
                <span
                  className="bg-secondary text-secondary-foreground mt-1.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-semibold"
                  aria-hidden="true"
                >
                  {f.marker}
                </span>
                <div className="flex-1 space-y-1">
                  <Textarea
                    aria-label={`Footnote ${f.marker}`}
                    aria-invalid={invalid || undefined}
                    rows={1}
                    className="min-h-9"
                    value={f.text}
                    disabled={disabled}
                    onChange={(e) => updateText(f.id, e.target.value)}
                  />
                  {invalid && <p className="text-destructive text-xs">Footnote text is required</p>}
                  {appliesTo.length > 0 && (
                    <p className="text-muted-foreground text-xs">
                      Applies to: {appliesTo.join(', ')}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
