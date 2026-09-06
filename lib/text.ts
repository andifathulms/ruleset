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
  const first = text.replace(/\s+/g, ' ').trim().split(/(?<=\.)\s/)[0]
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
