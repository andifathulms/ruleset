/**
 * Structured data for crawlers.
 *
 * Search engines read schema.org, not the prose, and a page that does not
 * declare what it is gets guessed at. The objects are built in lib/seo.ts so
 * they draw on the same content the page renders.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built from this repository's own content, not from
      // anything a reader can supply.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
