/** @type {import('next').NextConfig} */

// GitHub Pages serves project sites from /<repo>. Set BASE_PATH in the
// Actions workflow; local dev and user-page deploys leave it empty.
const basePath = process.env.BASE_PATH ?? ''

const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}

export default nextConfig
