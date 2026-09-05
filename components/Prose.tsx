import { MDXRemote } from 'next-mdx-remote/rsc'

/**
 * Narrative sections are MDX. The reading column is capped at 70 characters and
 * set in body type; nothing in here is allowed to draw a line.
 */
const components = {
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mb-3.5 mt-12 font-display text-fluid-h3 text-chalk" {...p} />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mb-2.5 mt-9 font-display text-[22px] text-chalk" {...p} />
  ),
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-[1.15em] text-fluid-base text-chalk/85" {...p} />
  ),
  strong: (p: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-chalk" {...p} />
  ),
  em: (p: React.HTMLAttributes<HTMLElement>) => <em className="italic" {...p} />,
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mb-[1.15em] space-y-2 pl-0 text-chalk/85 [&>li]:relative [&>li]:pl-6" {...p} />
  ),
  li: (p: React.HTMLAttributes<HTMLLIElement>) => (
    // A painted tick rather than a bullet: the list markers on this site are
    // the same line-work as everything else.
    <li className="text-fluid-base before:absolute before:left-0 before:top-[0.72em] before:h-px before:w-3.5 before:bg-chalk/45 before:content-['']" {...p} />
  ),
  blockquote: (p: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="my-6 border-l-2 border-chalk/35 pl-5 text-chalk/75" {...p} />
  ),
  hr: () => <hr className="my-10 border-0 border-t chalk-rule" />,
  a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a className="link-paint text-chalk" {...p} />
  ),
}

export default function Prose({ source }: { source: string }) {
  return (
    <div className="prose-measure">
      <MDXRemote source={source} components={components} />
    </div>
  )
}
