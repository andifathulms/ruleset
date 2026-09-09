/**
 * The first sentence of a rule change, trimmed to a length that sets cleanly.
 *
 * A fixed character slice cut headings mid-word — "four centimetr…", "break
 * the…" — so this prefers a clause boundary, falls back to a word boundary, and
 * drops any trailing function word rather than ending on a dangling "and",
 * "which" or "to".
 *
 * Lives here because two places need it: the break headings on /breaks at
 * display size, and the "this clause reads this way because of" links in the
 * current-law sections, which were cutting mid-word at a shorter limit.
 */
const DANGLING = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'by', 'with',
  'that', 'which', 'is', 'are', 'was', 'were', 'may', 'must', 'not', 'no',
  'as', 'at', 'for', 'from', 'its', 'it', 'they', 'them', 'so', 'than',
  'then', 'into', 'relative', 'has', 'have', 'had', 'doing', 'being',
])

export function headline(text: string, limit = 118): string {
  // A compressed excerpt carries no markup, so the markers come out here.
  const first = stripEmphasis(text).replace(/\s+/g, ' ').trim().split(/(?<=\.)\s/)[0]
  if (first.length <= limit) return first

  const cut = first.slice(0, limit)
  const semicolon = cut.lastIndexOf(';')
  if (semicolon > limit * 0.5) return `${cut.slice(0, semicolon)}…`

  const space = cut.lastIndexOf(' ')
  const words = (space > limit * 0.5 ? cut.slice(0, space) : cut).split(' ')
  while (words.length > 5 && DANGLING.has(words[words.length - 1].replace(/\W/g, '').toLowerCase())) {
    words.pop()
  }
  return `${words.join(' ').replace(/[,;:]$/, '')}…`
}

/**
 * `**like this**` inside a YAML prose field.
 *
 * play.yaml, learning.yaml, rules.yaml and the series files are prose, and
 * they were written with markdown emphasis for run-in labels — "**Carom:**",
 * "**The line of the ball**". Nothing rendered it: those fields go to the page
 * as plain text, so 299 pairs of asterisks were printing literally across
 * eighty-five files. The emphasis is deliberate and useful, so it is rendered
 * rather than stripped.
 */
export function emphasisSegments(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/\*\*([^*]+)\*\*/g)
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((s) => s.text.length > 0)
}

/** The same text with the markers removed, for anywhere that cannot carry markup. */
export const stripEmphasis = (text: string): string =>
  text.replace(/\*\*([^*]+)\*\*/g, '$1')
