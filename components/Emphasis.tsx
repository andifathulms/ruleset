import { Fragment } from 'react'
import { emphasisSegments } from '@/lib/text'

/**
 * Renders the markdown emphasis written into the YAML prose fields. A weight
 * step and an opacity step — enough to mark a run-in label without the
 * all-caps or eyebrow treatments DESIGN.md rules out.
 */
export default function Emphasis({ children }: { children: string }) {
  return (
    <>
      {emphasisSegments(children).map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-medium text-chalk">
            {seg.text}
          </strong>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        ),
      )}
    </>
  )
}
