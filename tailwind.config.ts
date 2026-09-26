import type { Config } from 'tailwindcss'

// Colours are drawn from actual playing surfaces (DESIGN.md). Family colour
// carries "which kind of sport"; cause is carried by mark shape, never hue.
//
// Each family now has a `-bright` sibling. The base hues were mixed for a fill
// on a mid-dark ground; on the deeper `ink` page they lost their edge as a
// stroke or as text, and pitch and gold in particular closed on each other.
// Base is still the fill; bright is the line-work, the label, and the glow.
const config: Config = {
  content: ['./app/**/*.{ts,tsx,mdx}', './components/**/*.{ts,tsx}', './content/**/*.mdx'],
  theme: {
    extend: {
      colors: {
        ink: '#041317',
        surface: '#0B2B30',
        raised: '#113840',
        // Text colours go through variables so a reading panel can re-map
        // them to ink on paper in one place (`.paper` in globals.css), rather
        // than every component carrying a light and a dark variant.
        chalk: 'rgb(var(--chalk-rgb) / <alpha-value>)',
        dim: 'rgb(var(--dim-rgb) / <alpha-value>)',
        pool: { DEFAULT: '#1D6FA8', bright: '#57ACE8', paper: '#E7EEF3' },
        pitch: { DEFAULT: '#2F7D4F', bright: '#5CC684', paper: '#E6EFE8' },
        clay: { DEFAULT: '#B7502A', bright: '#EA7E4E', paper: '#F3E8E1' },
        gold: { DEFAULT: '#C8A02C', bright: '#F2C94F', paper: '#F3EEDD' },
        unmarked: {
          DEFAULT: 'rgb(var(--unmarked-rgb) / <alpha-value>)',
          bright: '#9FB2B0',
          paper: '#ECEFEE',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Archivo Narrow', 'Oswald', 'sans-serif'],
        body: ['var(--font-body)', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Newsreader', 'Georgia', 'serif'],
      },
      // A fluid scale, so the display type actually behaves like signage on a
      // wide screen instead of topping out at a fixed 60px.
      fontSize: {
        body: ['17px', { lineHeight: '1.6' }],
        'fluid-sm': ['clamp(0.94rem, 0.9rem + 0.2vw, 1.06rem)', { lineHeight: '1.55' }],
        'fluid-base': ['clamp(1.02rem, 0.97rem + 0.28vw, 1.19rem)', { lineHeight: '1.62' }],
        'fluid-lead': ['clamp(1.14rem, 1.03rem + 0.55vw, 1.44rem)', { lineHeight: '1.5' }],
        'fluid-h3': ['clamp(1.35rem, 1.2rem + 0.8vw, 1.9rem)', { lineHeight: '1.12' }],
        'fluid-h2': ['clamp(1.85rem, 1.5rem + 1.7vw, 3rem)', { lineHeight: '1.04' }],
        'fluid-h1': ['clamp(2.6rem, 1.8rem + 4vw, 5.6rem)', { lineHeight: '0.94' }],
        'fluid-mega': ['clamp(3.5rem, 1.8rem + 7.5vw, 9rem)', { lineHeight: '0.86' }],
        // Narrative prose on a paper panel, in the serif.
        'fluid-read': ['clamp(1.125rem, 1.02rem + 0.35vw, 1.28rem)', { lineHeight: '1.66' }],
      },
      maxWidth: {
        measure: '70ch',
      },
      transitionTimingFunction: {
        paint: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        swing: 'cubic-bezier(0.34, 1.32, 0.42, 1)',
      },
    },
  },
  plugins: [],
}

export default config
