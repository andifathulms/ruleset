import Link from 'next/link'
import type { Metadata } from 'next'
import LawCompare from '@/components/LawCompare'
import { Reveal } from '@/components/Motion'
import LearningBoard from '@/components/LearningBoard'
import { getAllLearning, getAllPlay, getProgrammes, getSports } from '@/lib/content'
import { LAW_SECTIONS, LAW_SECTION_LABEL } from '@/lib/types'

export const metadata: Metadata = {
  title: 'How the games are played',
  description:
    'The laws in force for each covered sport, and the same clause read across all of them.',
}

export default function PlayPage() {
  const entries = getAllPlay()
  const learning = getAllLearning()
  const sports = getSports()
  const skeleton = new Set(
    getProgrammes().flatMap((p) => p.sports.filter((s) => s.coverage === 'skeleton').map((s) => s.id)),
  ).size

  // Only the sections some sport actually fills, in canonical order.
  const present = new Set(entries.flatMap(({ play }) => play.sections.map((s) => s.id)))
  const sections = LAW_SECTIONS.filter((id) => present.has(id)).map((id) => ({
    id,
    label: LAW_SECTION_LABEL[id],
  }))

  return (
    <div className="mx-auto max-w-[86rem] px-5 py-12 sm:py-16">
      <Reveal>
        <h1 className="font-display text-fluid-h1 text-chalk">How the games are played</h1>
        <div className="prose-measure mt-5 space-y-4 text-fluid-base text-chalk/85">
          <p>
            The rest of this site records how the rules changed. This is what
            they say now.
          </p>
          <p>
            Every sport here answers the same nine questions — what you are
            trying to do, where, with what, how it is scored, how it restarts,
            what is forbidden, and how a winner is decided. Asking them in the
            same order of all {entries.length} — a racket sport beside a
            measured one, a board game beside a combat sport — is the point: it
            turns differences that read as trivia into differences that are
            structural.
          </p>
          <p className="text-unmarked">
            Each clause below links to the recorded rule changes that produced
            it, because the current law is not a set of facts that were always
            true. It is what the timeline output.
          </p>
        </div>
      </Reveal>

      <section className="mt-14">
        <LawCompare entries={entries} sports={sports} sections={sections} />
      </section>

      <section className="mt-24 border-t chalk-rule pt-12">
        <h2 className="font-display text-fluid-h2 text-chalk">
          Easy to start, hard to be good at
        </h2>
        <div className="prose-measure mt-4 space-y-4 text-fluid-base text-chalk/85">
          <p>
            Almost every sport is easier to begin than to master. What is worth
            recording is the size of the gap and the reason for it, which is
            different in every case here — badminton&rsquo;s is caused by one
            object, football&rsquo;s by the size of the field it has to get out
            of, and gymnastics has barely any gap at all because it is hard from
            the first session.
          </p>
        </div>
        <LearningBoard entries={learning} sports={sports} />
      </section>

      {/* Each sport's laws in full live on its own page; a third list of
          every sport here would only repeat the index. */}
      <p className="mt-16 flex flex-wrap items-baseline gap-x-3 border-t chalk-rule pt-8 text-fluid-base text-chalk/85">
        Each sport&rsquo;s laws are written out in full on its own page.
        <Link href="/sports/" className="link-paint text-chalk">
          Browse the {entries.length} sports →
        </Link>
      </p>

      <p className="mt-14 max-w-measure text-[15px] text-unmarked">
        The {skeleton} sports listed on a programme but not researched have no
        laws recorded here.{' '}
        <Link href="/program/" className="link-paint text-chalk/80">
          They appear as status data only
        </Link>
        , and nothing on this page should be read as covering them.
      </p>
    </div>
  )
}
