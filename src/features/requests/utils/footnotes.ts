import type { SoaFootnote } from '@/features/requests/schema'

/** 0 → "a", 25 → "z", 26 → "aa", 27 → "ab" … */
export function footnoteMarker(index: number): string {
  let marker = ''
  let n = index
  do {
    marker = String.fromCharCode(97 + (n % 26)) + marker
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return marker
}

/** Re-letters footnotes sequentially so markers stay contiguous after add/remove. */
export function reletterFootnotes(footnotes: SoaFootnote[]): SoaFootnote[] {
  return footnotes.map((f, i) => ({ ...f, marker: footnoteMarker(i) }))
}

export function footnotesEqual(a: SoaFootnote[], b: SoaFootnote[]): boolean {
  return (
    a.length === b.length &&
    a.every((f, i) => f.id === b[i].id && f.marker === b[i].marker && f.text === b[i].text)
  )
}
