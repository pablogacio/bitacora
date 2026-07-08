/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F4EFE4',
          dim: '#EDE6D6',
          deep: '#E4DAC4',
        },
        ink: {
          DEFAULT: '#2B2620',
          soft: '#4A4238',
          faint: '#8A7E6C',
        },
        rust: {
          DEFAULT: '#B5502F',
          dark: '#8F3D22',
          light: '#D97A52',
        },
        olive: {
          DEFAULT: '#6B7256',
          dark: '#4F5540',
        },
        brass: {
          DEFAULT: '#B08D4F',
          light: '#D8BE87',
        },
        cream: '#FBF8F1',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.28em',
      },
      boxShadow: {
        card: '0 1px 2px rgba(43,38,32,0.06), 0 8px 24px -8px rgba(43,38,32,0.18)',
        soft: '0 1px 1px rgba(43,38,32,0.05), 0 2px 8px rgba(43,38,32,0.08)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
