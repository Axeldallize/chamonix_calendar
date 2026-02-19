import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wood: {
          50: '#FFF8F0',
          100: '#FAEBD7',
          200: '#E8D5B7',
          300: '#D4B896',
          400: '#B8956F',
          500: '#8B6914',
          600: '#7A5C12',
          700: '#614A0F',
          800: '#48370B',
          900: '#2F2508',
        },
        forest: {
          50: '#E8F5E0',
          100: '#C5E6B4',
          200: '#9ED685',
          300: '#76C456',
          400: '#4DAB2E',
          500: '#2D5016',
          600: '#264512',
          700: '#1F380F',
          800: '#182B0B',
          900: '#111E08',
        },
        terracotta: {
          50: '#FEF2ED',
          100: '#FDE0D5',
          200: '#FBBFAB',
          300: '#F89A7D',
          400: '#E56F42',
          500: '#C45B28',
          600: '#A84D22',
          700: '#8C401C',
          800: '#703316',
          900: '#542610',
        },
        cream: '#FFF8F0',
        charcoal: '#2D2D2D',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 14px 0 rgba(139, 105, 20, 0.15)',
        'warm-lg': '0 10px 25px -3px rgba(139, 105, 20, 0.2)',
      },
      backgroundImage: {
        'wood-grain': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q25 18 50 20 T100 20' stroke='%238B691420' fill='none'/%3E%3Cpath d='M0 40 Q25 38 50 40 T100 40' stroke='%238B691415' fill='none'/%3E%3Cpath d='M0 60 Q25 58 50 60 T100 60' stroke='%238B691420' fill='none'/%3E%3Cpath d='M0 80 Q25 78 50 80 T100 80' stroke='%238B691415' fill='none'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
} satisfies Config
