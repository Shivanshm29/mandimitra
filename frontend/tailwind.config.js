/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eef8f2',
          100: '#d7efe1',
          200: '#b2dfc6',
          500: '#1e8e5c',
          600: '#176B45', // Primary Forest Green
          700: '#135738',
          800: '#11462e',
          900: '#0e3a26',
        },
        warm: {
          50: '#ffffff',
          100: '#FAFBF8',
          200: '#F7F8F2', // Warm off-white background
          300: '#EDEEE6',
          400: '#DDE0D3',
        },
        mustard: {
          400: '#f0c766',
          500: '#E8B84A', // Muted mustard accent
          600: '#cfa038',
        },
        charcoal: {
          700: '#333D37',
          800: '#242B27',
          900: '#181E1A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

