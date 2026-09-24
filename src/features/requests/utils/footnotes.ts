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

/** DOM id of a footnote's editor row, so grid markers can link to it. */
export function footnoteDomId(tableId: string, footnoteId: string): string {
  return `${tableId}-footnote-${footnoteId}`
}

function sameCharClass(a: string, b: string): boolean {
  const isDigit = (c: string) => /\d/.test(c)
  const isLetter = (c: string) => /\p{L}/u.test(c)
  return (isDigit(a) && isDigit(b)) || (isLetter(a) && isLetter(b))
}

/**
 * Extraction keeps superscript footnote references glued to the name ("Vital signs15",
 * "COVID-19 test 10"). Strips trailing references that match the procedure's own footnotes so the
 * grid can render them as superscripts instead. The stored name is left untouched.
 */
export function procedureDisplayName(name: string, markers: string[]): string {
  // Longest first so "15" wins over "5".
  const candidates = [...markers].sort((a, b) => b.length - a.length)
  let result = name.trimEnd()
  let stripped = true
  while (stripped) {
    stripped = false
    for (const marker of candidates) {
      if (!marker || !result.endsWith(marker)) continue
      // Don't cut into a word or number: "Day 15" keeps its 5, "Vital signs" keeps its s.
      const before = result.charAt(result.length - marker.length - 1)
      if (sameCharClass(before, marker.charAt(0))) continue
      const rest = result.slice(0, -marker.length).replace(/[\s,]+$/, '')
      if (rest.length === 0) continue
      result = rest
      stripped = true
      break
    }
  }
  return result
}

export function footnotesEqual(a: SoaFootnote[], b: SoaFootnote[]): boolean {
  return (
    a.length === b.length &&
    a.every((f, i) => f.id === b[i].id && f.marker === b[i].marker && f.text === b[i].text)
  )
}
