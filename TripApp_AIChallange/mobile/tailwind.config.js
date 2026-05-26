/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          green: '#1F3D2B',
          orange: '#C45C2E',
          cream: '#F4EBDC',
          teal: '#2F6F6D',
          rose: '#B76E5D',
          gold: '#D8A441',
        },
      },
    },
  },
  plugins: [],
}
