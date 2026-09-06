/**
 * Prefixes a path in /public with the deployment's base path.
 *
 * Next rewrites its own asset URLs and those of next/link and next/image, but
 * a plain <img src> or a CSS url() is left exactly as written. On GitHub Pages
 * the site is served from /<repo>, so a root-relative path that works locally
 * is a 404 in production — which is a difference that only shows up after a
 * deploy, and did.
 */
export function asset(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return `${base}${path}`
}
