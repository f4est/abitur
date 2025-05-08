/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        'snow-white': '#EEF0EB',
        'skyway': '#ABBED1',
        'ashleigh': '#6987A9',
        'yolk-yellow': '#E0AE50',
      },
    },
  },
  plugins: [],
} 