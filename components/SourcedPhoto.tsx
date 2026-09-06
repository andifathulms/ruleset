import { Reveal } from './Motion'
import type { SourcedImage } from '@/lib/types'
import { asset } from '@/lib/asset'

const COLOUR: Record<string, { base: string; bright: string }> = {
  pool: { base: '#1D6FA8', bright: '#57ACE8' },
  pitch: { base: '#2F7D4F', bright: '#5CC684' },
  clay: { base: '#B7502A', bright: '#EA7E4E' },
  gold: { base: '#C8A02C', bright: '#F2C94F' },
  unmarked: { base: '#7A8C8A', bright: '#9FB2B0' },
}

/**
 * A photograph, treated the way this site treats every other borrowed thing:
 * as a citation. The author, the licence and the page it came from are
 * rendered rather than buried, because that is what the licences require and
 * because a site that cites its rulebooks and not its pictures is being
 * selective about its own standard.
 *
 * The caption says what the photograph is evidence of, which is usually
 * narrower than the section it sits in. A portrait of a thrower is evidence
 * of the thrower; placing it beside a rule change does not make it evidence
 * of the rule.
 */
export default function SourcedPhoto({
  image,
  colour = 'unmarked',
}: {
  image: SourcedImage
  colour?: string
}) {
  const c = COLOUR[colour] ?? COLOUR.unmarked
  // A portrait at the width of the reading column becomes a metre of page.
  // Both orientations are held to roughly the measure's own footprint.
  const portrait = image.height > image.width
  const width = portrait ? '25rem' : '40rem'

  return (
    <Reveal as="figure" className="my-10">
      <div
        className="duotone border chalk-rule"
        style={{
          ['--tint' as string]: c.base,
          ['--tint-bright' as string]: c.bright,
          maxWidth: width,
        }}
      >
        {/* Width and height are set so the page never reflows around the
            image as it decodes. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset(image.file)}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading="lazy"
          decoding="async"
        />
      </div>

      <figcaption className="mt-3 max-w-measure">
        <p className="text-[15px] leading-snug text-chalk/85">{image.alt}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-unmarked">{image.shows}</p>
        <p className="mt-2.5 text-[13px] leading-relaxed text-unmarked">
          {image.author}
          {' · '}
          {image.licence_url ? (
            <a
              href={image.licence_url}
              className="link-paint"
              target="_blank"
              rel="noopener noreferrer license"
            >
              {image.licence}
            </a>
          ) : (
            image.licence
          )}
          {' · '}
          <a
            href={image.source_url}
            className="link-paint"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wikimedia Commons
          </a>
        </p>
      </figcaption>
    </Reveal>
  )
}
