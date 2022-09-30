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
        steelBlue: {
          100: '#c2d6e7',
          200: '#62BAEA',
          300: '#4884b8',
          400: '#0068A3',
          500: '#0b5aa0',
          600: '#004a87',
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
          50: '#F7F6ED',
          100: '#F7F2D3',
          200: '#F6EDB9',
          300: '#F6E99E',
          400: '#FFE554',
          500: '#F5E06A',
          600: '#F4DC50',
          700: '#F4D835',
          800: '#F3D31B',
          900: '#F3CF01',
        },
      },
    },
  },
  plugins: [],
}
