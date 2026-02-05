/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
        kufi: ['Reem Kufi', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        secondary: {
          50: '#fdfbf7',
          100: '#f7f3e8',
          200: '#efe6d0',
          800: '#5a554a',
        },
        dark: {
           700: '#334155',
           800: '#1e293b',
           900: '#0f172a',
           950: '#020617',
           card: '#111827',
        },
        gray: {
          850: '#1f2937',
        }
      }
    },
  },
  plugins: [],
}