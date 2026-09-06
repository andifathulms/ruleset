import Link from 'next/link'
import { Reveal } from './Motion'
import {
  DIFFICULTY, DIFFICULTY_LABEL,
  type Difficulty, type Evidence, type Learning, type RuleChange,
} from '@/lib/types'

/**
 * How hard a sport is to start, and how hard it is to be good at. Everything
 * here is the site's own reading rather than a sourced claim, which is a
 * different kind of statement from everything else on the site — so it is
 * labelled editorial at the top, on each verdict, and on every unsourced item,
 * and it is drawn in `unmarked` rather than in chalk.
 *
 * The verdicts are five-point ordinals and nothing is ever done arithmetically
 * with them. There is no total, no average and no league table of difficulty.
 */
export default function LearningCurve({
  learning, rules, colour,
}: {
  learning: Learning
  rules: RuleChange[]
  colour: { base: string; bright: string }
}) {
  const ruleMap = Object.fromEntries(rules.map((r) => [r.id, r]))

  return (
    <div>
      <p className="prose-measure text-[17px] text-chalk/85">{clean(learning.summary)}</p>

      <p className="mt-6 inline-flex items-center gap-2 border border-unmarked px-3 py-1 text-[13px] uppercase tracking-[0.14em] text-unmarked">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-unmarked" />
        Editorial — the site&rsquo;s reading, not a sourced claim
      </p>

      <div className="mt-8 grid gap-px bg-chalk/15 lg:grid-cols-2">
        <Axis
          heading="Barrier to entry"
          question="How hard is it to get to a real game?"
          axis={learning.entry}
          colour={colour}
          ruleMap={ruleMap}
        />
        <Axis
          heading="Barrier to the top"
          question="How hard is it to be good at?"
          axis={learning.mastery}
          colour={colour}
          ruleMap={ruleMap}
        />
      </div>

      <Reveal>
        <div className="mt-10 border-l-2 pl-5" style={{ borderColor: colour.bright }}>
          <h3 className="font-display text-2xl text-chalk">Why the two differ</h3>
          <div className="prose-measure mt-3 space-y-4 text-[16px] text-chalk/85">
            {paragraphs(learning.gap).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}

function Axis({
  heading, question, axis, colour, ruleMap,
}: {
  heading: string
  question: string
  axis: Learning['entry']
  colour: { base: string; bright: string }
  ruleMap: Record<string, RuleChange>
}) {
  return (
    <section className="bg-ink p-6 sm:p-7">
      <p className="text-[13px] uppercase tracking-[0.14em] text-unmarked">{heading}</p>
      <h3 className="mt-1 font-display text-fluid-h3 text-chalk">{question}</h3>

      <Scale verdict={axis.verdict} colour={colour} />

      <p className="mt-4 text-[17px] text-chalk">{clean(axis.claim)}</p>

      <div className="mt-4 space-y-3 text-[16px] text-chalk/80">
        {paragraphs(axis.why).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <h4 className="mt-6 text-[13px] uppercase tracking-[0.14em] text-unmarked">Evidence</h4>
      <ul className="mt-2 divide-y divide-chalk/10 border-t chalk-rule">
        {axis.evidence.map((e, i) => (
          <EvidenceRow key={`${e.label}-${i}`} evidence={e} rule={e.rule ? ruleMap[e.rule] : undefined} />
        ))}
      </ul>
    </section>
  )
}

/**
 * Five painted steps, the way a court is marked out. The filled steps are the
 * verdict, drawn in the family colour and deliberately not in chalk: the site
 * reserves chalk for what it can cite, and this is a judgement. The step count
 * and the word "editorial" sit under every scale for the same reason.
 */
function Scale({ verdict, colour }: { verdict: Difficulty; colour: { bright: string } }) {
  const at = DIFFICULTY.indexOf(verdict)
  return (
    <div className="mt-5">
      <div
        className="flex gap-1.5"
        role="img"
        aria-label={`${DIFFICULTY_LABEL[verdict]} — step ${at + 1} of ${DIFFICULTY.length}`}
      >
        {DIFFICULTY.map((step, i) => (
          <span
            key={step}
            aria-hidden
            className="h-2 flex-1"
            style={{
              background: i <= at ? colour.bright : 'rgb(242 245 241 / 0.12)',
              opacity: i <= at ? 1 - (at - i) * 0.13 : 1,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <span className="font-display text-2xl text-chalk">{DIFFICULTY_LABEL[verdict]}</span>
        <span className="text-[12px] text-unmarked">
          {at + 1} of {DIFFICULTY.length} · editorial
        </span>
      </div>
    </div>
  )
}

const BASIS: Record<Evidence['basis'], { tag: string; tone: string }> = {
  rule: { tag: 'rule', tone: 'text-chalk' },
  observation: { tag: 'observed', tone: 'text-chalk/70' },
  judgement: { tag: 'estimate', tone: 'text-unmarked' },
}

function EvidenceRow({ evidence, rule }: { evidence: Evidence; rule?: RuleChange }) {
  const basis = BASIS[evidence.basis]
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
      <span className="text-[14px] text-unmarked">{evidence.label}</span>
      <span className={`numeral ml-auto text-[17px] ${basis.tone}`}>{evidence.value}</span>
      <span
        className={`border px-1.5 py-0.5 text-[11px] uppercase tracking-wider ${
          evidence.basis === 'judgement'
            ? 'border-unmarked text-unmarked'
            : 'border-chalk/25 text-chalk/60'
        }`}
      >
        {basis.tag}
      </span>
      {evidence.note && (
        <span className="w-full text-[14px] leading-snug text-unmarked">{clean(evidence.note)}</span>
      )}
      {rule && (
        <span className="w-full text-[14px]">
          <Link href={`#${rule.id}`} className="link-paint text-chalk/80">
            <span className="numeral">{rule.date_effective.slice(0, 4)}</span> — the rule this rests on
          </Link>
        </span>
      )}
    </li>
  )
}

const clean = (s: string) => s.replace(/[ \t]+/g, ' ').trim()
const paragraphs = (body: string) =>
  clean(body).split('\n').map((p) => p.trim()).filter(Boolean)
