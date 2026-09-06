import type { Metadata } from 'next'
import { Reveal } from '@/components/Motion'
import ProgrammeBoard from '@/components/ProgrammeBoard'
import { getProgrammes, getSources } from '@/lib/content'

export const metadata: Metadata = {
  title: 'The programmes',
  description:
    'Every sport on the Olympic, Asian Games and World Games programmes, with its status per edition. Status data only.',
}

export default function ProgramPage() {
  const programmes = getProgrammes()

  return (
    <div className="mx-auto max-w-[100rem] px-5 py-12 sm:py-16">
      <Reveal>
        <p className="eyebrow">The skeleton layer</p>
        <h1 className="display-xl mt-4 max-w-[18ch] text-fluid-h1 text-chalk">The programmes</h1>
        <div className="prose-measure mt-5 space-y-4 text-fluid-base text-chalk/85">
          <p>
            Every sport contested at these multi-sport games, with its status per edition. This is
            structured data, not research: cheap to build, and interesting on its own.
          </p>
          <p>
            There are three of them here because the Olympic programme is not the only answer to
            the question &ldquo;is this sport contested?&rdquo; A sport can be a permanent fixture
            on one of these tables, a lapsed entry on another, and the headline act on a third.
          </p>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <ProgrammeBoard programmes={programmes} sources={getSources()} />
      </Reveal>
    </div>
  )
}
