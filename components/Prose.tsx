import { MDXRemote } from 'next-mdx-remote/rsc'

/**
 * Narrative sections are MDX. The reading column is capped at 70 characters and
 * set in body type; nothing in here is allowed to draw a line.
 */
const components = {
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-3 mt-10 font-display text-2xl text-chalk" {...p} />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2 mt-8 font-display text-xl text-chalk" {...p} />
  ),
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-[1.15em] text-[17px] leading-[1.6] text-chalk/85" {...p} />
  ),
  strong: (p: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-chalk" {...p} />
  ),
  em: (p: React.HTMLAttributes<HTMLElement>) => <em className="italic" {...p} />,
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-[1.15em] list-disc space-y-1 pl-5 text-chalk/85" {...p} />
  ),
  a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-chalk underline underline-offset-4" {...p} />
  ),
}

export default function Prose({ source }: { source: string }) {
  return (
    <div className="prose-measure">
      <MDXRemote source={source} components={components} />
    </div>
  )
}
