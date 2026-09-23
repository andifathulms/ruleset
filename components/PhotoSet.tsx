import SourcedPhoto from './SourcedPhoto'
import type { SourcedImage } from '@/lib/types'

/**
 * One photograph, or several read together. A pair is set side by side on a
 * wide screen because the pairs on this site are comparisons — a 1940s
 * wooden glider beside a composite one — and a comparison stacked a screen
 * apart is not one. On a phone they stack, captions and all.
 */
export default function PhotoSet({
  images,
  colour,
}: {
  images: SourcedImage[]
  colour?: string
}) {
  if (images.length === 0) return null
  if (images.length === 1) return <SourcedPhoto image={images[0]} colour={colour} />
  return (
    <div className="my-10 grid max-w-[52rem] gap-x-6 gap-y-10 sm:grid-cols-2">
      {images.map((image) => (
        <SourcedPhoto key={image.id} image={image} colour={colour} compact />
      ))}
    </div>
  )
}
