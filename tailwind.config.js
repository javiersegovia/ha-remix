const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

const screens = {
  ...defaultTheme.screens,
  '3xl': '1900px',
  '4xl': '2200px',
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,jsx,js}'],
  theme: {
    screens,
    extend: {
      fontFamily: {
        sans: ['Poppins', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: colors.black,
        white: colors.white,
        gray: colors.slate,
        blue: colors.blue,
        teal: colors.teal,
        cyan: colors.cyan,
        purple: {
          100: '#FDEFFF',
          200: '#E6D8E8',
          300: '#D5BED8',
          400: '#C09EC5',
          500: '#AC7DB2',
          600: '#823C8B',
          700: '#411E45',
          800: '#2B142E',
          900: '#1A0C1C',
        },
        steelBlue: {
          100: '#e2eef8',
          200: '#62BAEA',
          300: '#4884b8',
          400: '#0068A3',
          500: '#0b5aa0',
          600: '#004a87',
          700: '#1E4B82',
          800: '#00365F',
          900: '#00294c',
        },
        orange: {
          50: '#ffe9d5',
          100: '#ffc793',
          200: '#ffbd80',
          300: '#ffaa5b',
          400: '#ff9736',
          500: '#ff8a1d',
          600: '#ff7b00',
          700: '#de6b00',
          800: '#c65f00',
        },
        electricYellow: {
          100: '#FDFBEB',
          200: '#FDF9D9',
          300: '#FBF4C8',
          400: '#FBF1B7',
          500: '#F4DE5E',
          600: '#F2D74C',
          700: '#F5D107',
          800: '#E9C707',
          900: '#C9B13B',
        },
      },
    },
  },
  plugins: [],
}
