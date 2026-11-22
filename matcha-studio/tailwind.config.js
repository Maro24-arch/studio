/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F3EA', paper: '#EFE9DA', bone: '#E4DCC8', ink: '#23271F', soft: '#5B6155',
        sage: { 100: '#E6EADD', 200: '#CFD7C0', 300: '#B0BD9C', 400: '#8E9F78', 500: '#6F8260', 600: '#556A49', 700: '#40533A', 800: '#2F3E2C', 900: '#222D20' },
        clay: '#B9A688', stamp: '#A8432C',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { wider2: '0.18em' },
    },
  },
  plugins: [],
}
