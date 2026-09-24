import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { FileSearch, Loader2, RotateCw, Save, SearchX } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  isExtracting,
  useExtraction,
  useRequest,
  useUpdateTable,
} from '@/features/requests/api/queries'
import { ApiError } from '@/features/requests/api/requestsApi'
import { UnsavedChangesGuard } from '@/features/requests/components/UnsavedChangesGuard'
import { SoaTableNav, SoaTableSelect } from '@/features/requests/components/soa/SoaTableNav'
import { SoaTableView } from '@/features/requests/components/soa/SoaTableView'
import type { SoaFootnote, SoaTable } from '@/features/requests/schema'
import { footnotesEqual } from '@/features/requests/utils/footnotes'
import { scheduleEqual } from '@/features/requests/utils/schedule'

/** The editable parts of a table: which cells are scheduled, and footnote text. */
interface TableDraft {
  footnotes: SoaFootnote[]
  scheduleItems: string[]
}

type Drafts = Record<string, TableDraft>

function draftOf(table: SoaTable, drafts: Drafts): TableDraft {
  return drafts[table.id] ?? { footnotes: table.footnotes, scheduleItems: table.scheduleItems }
}

function isDirty(table: SoaTable, draft: TableDraft | undefined): boolean {
  return (
    draft !== undefined &&
    (!footnotesEqual(draft.footnotes, table.footnotes) ||
      !scheduleEqual(draft.scheduleItems, table.scheduleItems))
  )
}

function withoutKey(drafts: Drafts, key: string): Drafts {
  const next = { ...drafts }
  delete next[key]
  return next
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.getAttribute('role') === 'combobox'
  )
}

function CenteredState({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode
  title: string
  body: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="bg-muted text-muted-foreground flex size-16 items-center justify-center rounded-full">
        {icon}
      </div>
      <div className="space-y-1">
        <h1 className="text-foreground font-serif text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground max-w-sm text-sm">{body}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export function SoaResultsPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestQuery = useRequest(id)
  const extractionQuery = useExtraction(id)
  const updateTableMutation = useUpdateTable(id ?? '')

  const extraction = extractionQuery.data
  const tables = useMemo(() => extraction?.tables ?? [], [extraction])

  // Unsaved grid and footnote edits per table. Reset whenever a new extraction replaces the tables.
  const [drafts, setDrafts] = useState<Drafts>({})
  const [showErrorsFor, setShowErrorsFor] = useState<Set<string>>(new Set())
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    setDrafts({})
    setShowErrorsFor(new Set())
  }, [extraction?.jobId])

  const dirtyIds = useMemo(() => {
    const ids = new Set<string>()
    for (const table of tables) {
      if (isDirty(table, drafts[table.id])) ids.add(table.id)
    }
    return ids
  }, [drafts, tables])

  // Selected table lives in the URL (?table=) so each grid is deep-linkable.
  const requestedId = searchParams.get('table')
  const activeIndex = Math.max(
    0,
    tables.findIndex((t) => t.id === requestedId),
  )
  const activeTable = tables[activeIndex]

  const selectTable = useCallback(
    (tableId: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('table', tableId)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const goTo = useCallback(
    (index: number) => {
      const target = tables[index]
      if (target) selectTable(target.id)
    },
    [tables, selectTable],
  )

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey) return
      const prev = e.key === '[' || (e.altKey && e.key === 'ArrowLeft')
      const next = e.key === ']' || (e.altKey && e.key === 'ArrowRight')
      if (!prev && !next) return
      e.preventDefault()
      goTo(activeIndex + (next ? 1 : -1))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeIndex, goTo])

  async function saveTable(tableId: string): Promise<boolean> {
    const draft = drafts[tableId]
    const table = tables.find((t) => t.id === tableId)
    if (!draft || !table) return true
    if (draft.footnotes.some((f) => f.text.trim().length === 0)) {
      setShowErrorsFor((prev) => new Set(prev).add(tableId))
      return false
    }
    setSavingIds((prev) => new Set(prev).add(tableId))
    try {
      await updateTableMutation.mutateAsync({ ...table, ...draft })
      setDrafts((prev) => withoutKey(prev, tableId))
      setShowErrorsFor((prev) => {
        const next = new Set(prev)
        next.delete(tableId)
        return next
      })
      return true
    } catch (err) {
      toast.error('Could not save changes', {
        description: err instanceof Error ? err.message : undefined,
      })
      return false
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(tableId)
        return next
      })
    }
  }

  async function saveAll() {
    const ids = [...dirtyIds]
    const results = await Promise.all(ids.map((tableId) => saveTable(tableId)))
    const failed = ids.filter((_, i) => !results[i])
    if (failed.length === 0) {
      toast.success(`Changes saved for ${ids.length} table${ids.length === 1 ? '' : 's'}`)
    } else {
      toast.error(`${failed.length} table${failed.length === 1 ? '' : 's'} could not be saved`, {
        description: 'Check for empty footnotes.',
      })
      selectTable(failed[0])
    }
  }

  if (requestQuery.isPending || extractionQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          <Skeleton className="hidden h-80 md:block" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (requestQuery.isError) {
    const notFound = requestQuery.error instanceof ApiError && requestQuery.error.status === 404
    return (
      <CenteredState
        icon={<SearchX className="size-8" />}
        title={notFound ? 'Protocol document not found' : 'Something went wrong'}
        body={
          notFound
            ? `We couldn't find a protocol document with ID "${id}".`
            : 'We ran into a problem loading this protocol document. Please try again.'
        }
      >
        <Button asChild variant="outline">
          <Link to="/requests">Back to protocol documents</Link>
        </Button>
      </CenteredState>
    )
  }

  const request = requestQuery.data
  const detailPath = `/requests/${request.id}`

  if (extractionQuery.isError || !extraction) {
    const noResults =
      extractionQuery.error instanceof ApiError && extractionQuery.error.status === 404
    return (
      <CenteredState
        icon={<FileSearch className="size-8" />}
        title={noResults ? 'No extraction yet' : 'Something went wrong'}
        body={
          noResults
            ? 'The Schedule of Assessments has not been extracted from this protocol document yet.'
            : 'We ran into a problem loading the extracted tables. Please try again.'
        }
      >
        <Button asChild variant="outline">
          <Link to={detailPath}>Back to protocol document</Link>
        </Button>
        {!noResults && (
          <Button onClick={() => extractionQuery.refetch()}>
            <RotateCw className="size-4" />
            Retry
          </Button>
        )}
      </CenteredState>
    )
  }

  const running = isExtracting(request)
  const navProps = {
    tables,
    activeId: activeTable?.id ?? '',
    dirtyIds,
    onSelect: selectTable,
  }

  return (
    <div>
      <UnsavedChangesGuard isDirty={dirtyIds.size > 0} />

      <PageHeader
        title="Schedule of Assessments"
        breadcrumbs={[
          { label: 'Protocol Documents', to: '/requests' },
          { label: request.id, to: detailPath },
          { label: 'Schedule of Assessments' },
        ]}
        actions={
          <>
            <Button
              size="sm"
              disabled={dirtyIds.size === 0 || savingIds.size > 0}
              onClick={saveAll}
            >
              <Save className="size-4" />
              Save all{dirtyIds.size > 0 ? ` (${dirtyIds.size})` : ''}
            </Button>
          </>
        }
      />

      {running && (
        <div
          className="bg-muted/40 mb-6 flex items-center gap-3 rounded-md border px-4 py-3 text-sm"
          aria-live="polite"
        >
          <Loader2 className="text-primary size-4 animate-spin" />
          <span>Extracting… The tables below will be replaced when it finishes.</span>
        </div>
      )}

      {tables.length === 0 || !activeTable ? (
        <CenteredState
          icon={<FileSearch className="size-8" />}
          title="No tables found"
          body="The extraction finished but no Schedule of Assessments tables were detected."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
          <aside>
            <SoaTableNav {...navProps} />
            <SoaTableSelect {...navProps} />
          </aside>

          <SoaTableView
            table={activeTable}
            position={activeIndex + 1}
            total={tables.length}
            footnotes={draftOf(activeTable, drafts).footnotes}
            scheduleItems={draftOf(activeTable, drafts).scheduleItems}
            dirty={dirtyIds.has(activeTable.id)}
            saving={savingIds.has(activeTable.id)}
            locked={running}
            showErrors={showErrorsFor.has(activeTable.id)}
            onFootnotesChange={(footnotes) =>
              setDrafts((prev) => ({
                ...prev,
                [activeTable.id]: { ...draftOf(activeTable, prev), footnotes },
              }))
            }
            onScheduleChange={(update) =>
              setDrafts((prev) => {
                const current = draftOf(activeTable, prev)
                return {
                  ...prev,
                  [activeTable.id]: { ...current, scheduleItems: update(current.scheduleItems) },
                }
              })
            }
            onPrev={() => goTo(activeIndex - 1)}
            onNext={() => goTo(activeIndex + 1)}
          />
        </div>
      )}
    </div>
  )
}
