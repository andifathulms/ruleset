import Link from 'next/link'
import BreakDiagram from '@/components/BreakDiagram'

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden className="court-grid court-grid-fade absolute inset-0" />
      <div className="relative mx-auto max-w-[86rem] px-5 py-20 sm:py-28">
        <p className="eyebrow">404</p>
        <h1 className="display-xl mt-4 max-w-[14ch] text-fluid-h1 text-chalk">
          Nothing painted here
        </h1>
        <div className="prose-measure mt-6 space-y-4 text-fluid-base text-chalk/85">
          <p>
            This site is deliberately incomplete — coverage grows where the
            author&rsquo;s curiosity goes. If you were looking for a sport, it may
            be present as{' '}
            <Link href="/program/" className="link-paint text-chalk">
              status data only
            </Link>
            .
          </p>
        </div>

        <div className="mt-12 max-w-2xl">
          <BreakDiagram className="h-24" labelled={false} />
          <p className="mt-3 text-[14px] text-unmarked">
            A gap that was drawn on purpose. This one was not.
          </p>
        </div>

        <p className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
          <Link href="/" className="link-paint text-chalk">
            Back to the timeline
          </Link>
          <Link href="/sports/" className="link-paint text-chalk/75 hover:text-chalk">
            The researched sports
          </Link>
        </p>
      </div>
    </div>
  )
}
