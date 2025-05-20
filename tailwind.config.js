/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Be Vietnam Pro'],
      },
      colors: {
        primary: {
          DEFAULT: '#4169FF',
          hover: '#3255E3',
        },
        secondary: {
          DEFAULT: '#6E44FF',
        },
        tertiary: {
          DEFAULT: '#44C973',
        }
      }
    },
  },
  plugins: [],
}