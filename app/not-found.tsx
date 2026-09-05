import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <h1 className="font-display text-5xl text-chalk">Nothing painted here</h1>
      <p className="prose-measure mt-4 text-[17px] text-chalk/85">
        This site is deliberately incomplete — coverage grows where the
        author&rsquo;s curiosity goes. If you were looking for a sport, it may be
        present as{' '}
        <Link href="/program/" className="text-chalk underline underline-offset-4">
          status data only
        </Link>
        .
      </p>
      <p className="mt-6">
        <Link href="/" className="text-chalk underline underline-offset-4">
          Back to the timeline
        </Link>
      </p>
    </div>
  )
}
