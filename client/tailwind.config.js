/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5865F2',
        secondary: '#4752C4',
        success: '#57F287',
        warning: '#FEE75C',
        danger: '#ED4245',
        dark: '#2C2F33',
        darker: '#23272A',
        light: '#99AAB5',
      },
    },
  },
  plugins: [],
}