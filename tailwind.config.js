// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', ...fontFamily.sans],
        sans: ['Poppins', ...fontFamily.sans],
      },
      colors: {
        primary: {
          main: '#2563eb', // Tailwind blue-600
        }
      }
    },
  },
  plugins: [],
};
