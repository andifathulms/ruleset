import Diagram, { DIAGRAM_BRIGHT } from '@/components/Diagram'
import { fieldAspect, fieldSvg, type FieldFill, type FieldLine, type FieldSpec } from '@/lib/fieldSvg'

const CHALK = '#F2F5F1'

/**
 * A sport's playing area, drawn from its field.yaml. The drawing itself comes
 * from lib/fieldSvg.ts as a string, so the page and the preview script cannot
 * disagree about what a file draws.
 */
export default function FieldDiagram({ spec, colour }: { spec: FieldSpec; colour: string }) {
  const bright = DIAGRAM_BRIGHT[colour] ?? DIAGRAM_BRIGHT.unmarked
  const aspect = fieldAspect(spec)
  /* A tall drawing at full width would run for screens; a wide one needs it. */
  const maxWidth = aspect > 1.2 ? '22rem' : aspect > 0.75 ? '32rem' : '46rem'

  return (
    <Diagram
      eyebrow={spec.eyebrow ?? 'The playing area'}
      title={spec.title}
      colour={colour}
      caption={`${spec.scale === 'schematic' ? 'Not to scale. ' : ''}${spec.caption.replace(/\s+/g, ' ').trim()}`}
    >
      <div style={{ maxWidth }} dangerouslySetInnerHTML={{ __html: fieldSvg(spec, bright) }} />
      {spec.legend && spec.legend.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2 text-[13.5px] text-chalk/80">
          {spec.legend.map((item) => (
            <li key={item.label} className="flex items-center gap-2">
              <Swatch kind={item.swatch} colour={bright} />
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </Diagram>
  )
}

function Swatch({ kind, colour }: { kind: FieldFill | FieldLine; colour: string }) {
  const fills: Record<string, React.CSSProperties> = {
    surface: { background: `${CHALK}10`, border: `1px solid ${CHALK}4d` },
    area: { background: `${colour}29`, border: `1px solid ${CHALK}4d` },
    zone: { background: `${colour}6b` },
    target: { background: `${colour}d9` },
  }
  if (kind in fills) return <span aria-hidden className="h-3 w-5" style={fills[kind]} />
  const lines: Record<string, React.CSSProperties> = {
    solid: { borderTop: `1.5px solid ${CHALK}` },
    heavy: { borderTop: `3px solid ${CHALK}` },
    dashed: { borderTop: `1.5px dashed ${CHALK}` },
    faint: { borderTop: `1px solid ${CHALK}66` },
  }
  return <span aria-hidden className="w-5" style={lines[kind] ?? lines.solid} />
}
