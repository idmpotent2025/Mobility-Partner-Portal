/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: '#FFCD11',
          black: '#111111',
          charcoal: '#1C1C1C',
          gray: '#F5F5F5',
          steel: '#4B4B4B',
          light: '#FFF9D6',
        },
        portal: {
          blue: '#0071CE',
          dark: '#004F9A',
          yellow: '#FFC220',
          light: '#E6F2FF',
          gray: '#F5F7FA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
