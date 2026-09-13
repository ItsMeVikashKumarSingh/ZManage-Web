/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        paper: 'var(--color-paper)',
        ash: 'var(--color-ash)',
        smoke: '#d4d4d4',
        pebble: '#c8c8c8',
        midnight: '#0a0a0a',
        charcoal: 'var(--color-charcoal)',
        graphite: '#262626',
        slate: '#404040',
        steel: 'var(--color-steel)',
        fog: 'var(--color-fog)',
        silver: '#a3a3a3',
        electric: 'var(--color-electric)',
        sapphire: '#1e40af',
        mint: '#dcfce7',
        vividGreen: '#16a34a',
        tangerine: '#ea580c',
        lavender: '#7c3aed',
        tally: '#f59e0b',
        amberGlow: '#ffbe3c',
        ink: '#141416',
        parchment: '#fbfbf9',
        hairline: '#eae8e4',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'ui-serif', 'serif'],
        satoshi: ['Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'Menlo', 'monospace']
      },
      borderRadius: {
        pill: '9999px',
        card: '12px',
        input: '6px',
        btn: '8px',
        largeCard: '16px'
      },
      boxShadow: {
        subtle: 'rgba(0, 0, 0, 0.05) 0px 1px 2px 0px',
        sm: 'rgba(0, 0, 0, 0.05) 0px 1px 3px 0px, rgba(0, 0, 0, 0.05) 0px 1px 2px -1px',
        ring: 'rgba(0, 0, 0, 0.08) 0px 0px 0px 4px',
        floating: 'rgba(0, 0, 0, 0.08) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px'
      }
    },
  },
  plugins: [],
}
