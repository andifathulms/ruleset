import Link from 'next/link'
import type { Metadata } from 'next'
import LawCompare from '@/components/LawCompare'
import { Reveal } from '@/components/Motion'
import LearningBoard from '@/components/LearningBoard'
import { getAllLearning, getAllPlay, getSports } from '@/lib/content'
import { LAW_SECTIONS, LAW_SECTION_LABEL } from '@/lib/types'

export const metadata: Metadata = {
  title: 'How the games are played',
  description:
    'The laws in force for each covered sport, and the same clause read across all of them.',
}

const COLOUR: Record<string, string> = {
  pool: '#57ACE8', pitch: '#5CC684', clay: '#EA7E4E', gold: '#F2C94F', unmarked: '#9FB2B0',
}

export default function PlayPage() {
  const entries = getAllPlay()
  const learning = getAllLearning()
  const sports = getSports()
  const sportMap = Object.fromEntries(sports.map((s) => [s.id, s]))

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
            same order of a racket sport, a measured sport, an invasion sport
            and a judged one is the point: it turns differences that read as
            trivia into differences that are structural.
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

      <section className="mt-24 border-t chalk-rule pt-12">
        <h2 className="font-display text-fluid-h2 text-chalk">In full</h2>
        <ul className="mt-8 grid gap-px bg-chalk/15 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ sport, play }) => {
            const s = sportMap[sport]
            return (
              <li key={sport} className="bg-ink p-6">
                <span
                  aria-hidden
                  className="mb-4 block h-1 w-12"
                  style={{ background: COLOUR[s?.family_colour ?? 'unmarked'] }}
                />
                <h3 className="font-display text-2xl text-chalk">
                  <Link href={`/sports/${sport}/#play`} className="link-paint">
                    {s?.label ?? sport}
                  </Link>
                </h3>
                <p className="mt-2 text-[15px] text-chalk/75">
                  {play.summary.replace(/\s+/g, ' ').trim().split(/(?<=\.)\s/)[0]}
                </p>
                <p className="mt-3 text-[13px] text-unmarked">{play.edition}</p>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="mt-14 max-w-measure text-[15px] text-unmarked">
        Sports outside the four researched families, plus swimming as the
        reference case, have no laws recorded here.{' '}
        <Link href="/program/" className="link-paint text-chalk/80">
          They appear as status data only
        </Link>
        , and nothing on this page should be read as covering them.
      </p>
    </div>
  )
}
