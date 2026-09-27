/** @type {import('next').NextConfig} */

// GitHub Pages serves project sites from /<repo>. Set BASE_PATH in the
// Actions workflow; local dev and user-page deploys leave it empty.
const basePath = process.env.BASE_PATH ?? ''

// Social scrapers need absolute URLs, so the build has to know where it will
// be served from. Overridable for a fork or a custom domain.
const siteOrigin = process.env.SITE_ORIGIN ?? 'https://andifathulms.github.io'

const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_ORIGIN: siteOrigin,
  },
}

export default nextConfig
