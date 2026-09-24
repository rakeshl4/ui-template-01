import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { SoaFootnote } from '@/features/requests/schema'
import { reletterFootnotes } from '@/features/requests/utils/footnotes'

interface SoaFootnotesEditorProps {
  tableId: string
  footnotes: SoaFootnote[]
  onChange: (footnotes: SoaFootnote[]) => void
  showErrors?: boolean
  disabled?: boolean
}

/** Controlled editor: drafts live in the parent so they survive switching between tables. */
export function SoaFootnotesEditor({
  tableId,
  footnotes,
  onChange,
  showErrors = false,
  disabled = false,
}: SoaFootnotesEditorProps) {
  function updateText(id: string, text: string) {
    onChange(footnotes.map((f) => (f.id === id ? { ...f, text } : f)))
  }

  function remove(id: string) {
    onChange(reletterFootnotes(footnotes.filter((f) => f.id !== id)))
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
            const invalid = showErrors && f.text.trim().length === 0
            return (
              <li key={f.id} className="flex items-start gap-2">
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
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive mt-0.5"
                  aria-label={`Remove footnote ${f.marker}`}
                  disabled={disabled}
                  onClick={() => remove(f.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
