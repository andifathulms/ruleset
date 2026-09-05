import type { Config } from 'tailwindcss'

// Colours are drawn from actual playing surfaces (DESIGN.md). Family colour
// carries "which kind of sport"; cause is carried by mark shape, never hue.
const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        surface: '#0B2B30',
        chalk: '#F2F5F1',
        pool: '#1D6FA8',
        pitch: '#2F7D4F',
        clay: '#B7502A',
        gold: '#C8A02C',
        unmarked: '#7A8C8A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Archivo Narrow', 'Oswald', 'sans-serif'],
        body: ['var(--font-body)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        body: ['17px', { lineHeight: '1.6' }],
      },
      maxWidth: {
        measure: '70ch',
      },
    },
  },
  plugins: [],
}

export default config
