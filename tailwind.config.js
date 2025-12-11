/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#020408',
          900: '#050910',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        hextech: {
          300: '#67e8f9', // Parlak Cyan
          400: '#22d3ee',
          500: '#06b6d4', // Ana Hextech Rengi
          600: '#0891b2',
          700: '#0e7490',
          900: '#164e63',
        },
        gold: {
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Ana Altın Rengi
          600: '#ca8a04',
          700: '#a16207',
        }
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        sans: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'hex-pattern': "url('https://lolstatic-a.akamaihd.net/frontpage/apps/prod/harbinger/4_0_0/assets/img/hextech-magic-background.jpg')", // Opsiyonel desen
      },
      boxShadow: {
        'hextech': '0 0 15px -3px rgba(6, 182, 212, 0.3)',
        'gold': '0 0 15px -3px rgba(234, 179, 8, 0.3)',
      }
    },
  },
  plugins: [],
}