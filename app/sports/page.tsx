import Link from 'next/link'
import type { Metadata } from 'next'
import { getProgram, getSports } from '@/lib/content'

export const metadata: Metadata = { title: 'Sports' }

const COLOUR: Record<string, string> = {
  pool: '#1D6FA8', pitch: '#2F7D4F', clay: '#B7502A', gold: '#C8A02C', unmarked: '#7A8C8A',
}

export default function SportsIndex() {
  const deep = getSports()
  const program = getProgram()
  const skeletonOnly = program.sports.filter((s) => s.coverage === 'skeleton')

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
      <h1 className="font-display text-5xl text-chalk">Sports</h1>
      <p className="prose-measure mt-4 text-[17px] text-chalk/85">
        Two layers, marked as such. {deep.length} sports have researched rule
        changes with causes and citations. The rest of the Olympic programme is
        present as status data only and carries none of that authority.
      </p>

      <h2 className="mt-12 font-display text-3xl text-chalk">Researched</h2>
      <ul className="mt-5 grid gap-6 sm:grid-cols-2">
        {deep.map((s) => (
          <li key={s.id}>
            <Link href={`/sports/${s.id}/`} className="group block">
              <span
                aria-hidden
                className="mb-3 block h-1.5 w-full"
                style={{ background: COLOUR[s.family_colour] }}
              />
              <h3 className="font-display text-3xl text-chalk group-hover:underline">{s.label}</h3>
              <p className="mt-1 text-[15px] text-chalk/75">{s.tagline}</p>
              <p className="mt-2 text-[14px] text-unmarked">{s.governing_body}</p>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-16 font-display text-3xl text-chalk">Not yet covered</h2>
      <p className="prose-measure mt-3 text-[16px] text-unmarked">
        Status and classification only. No rule research has been done on these,
        and nothing here should be read as though it had.
      </p>
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[15px]">
        {skeletonOnly.map((s) => (
          <li key={s.id} className="text-unmarked">
            <Link href="/program/" className="underline-offset-4 hover:text-chalk hover:underline">
              {s.label}
            </Link>{' '}
            <span className="numeral text-[13px] opacity-70">{s.held.length}×</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
