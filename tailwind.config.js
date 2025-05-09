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
        // Основная палитра
        'snow-white': '#EEF0EB',
        'skyway': '#ABBED1',
        'ashleigh': '#6987A9',
        'yolk-yellow': '#E0AE50',
        
        // Расширенная палитра
        'deep-blue': '#2A4365',
        'light-blue': '#C3DAFE',
        'accent-teal': '#38B2AC',
        'accent-orange': '#ED8936',
        'success-green': '#48BB78',
        'error-red': '#F56565',
        'warning-yellow': '#ECC94B',
        
        // Дополнительные оттенки основных цветов
        'ashleigh-light': '#8EAAC6',
        'ashleigh-dark': '#4A6890',
        'skyway-light': '#C5D5E3',
        'skyway-dark': '#8AA7C1',
      },
      
      // Градиенты
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, var(--tw-color-skyway) 0%, var(--tw-color-ashleigh) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, var(--tw-color-snow-white) 0%, var(--tw-color-skyway-light) 100%)',
        'gradient-accent': 'linear-gradient(135deg, var(--tw-color-ashleigh) 0%, var(--tw-color-deep-blue) 100%)',
        'gradient-success': 'linear-gradient(135deg, var(--tw-color-accent-teal) 0%, var(--tw-color-success-green) 100%)',
        'gradient-warning': 'linear-gradient(135deg, var(--tw-color-yolk-yellow) 0%, var(--tw-color-warning-yellow) 100%)',
        'gradient-error': 'linear-gradient(135deg, var(--tw-color-error-red) 0%, #C53030 100%)',
      },
      
      // Тени
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'medium': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'hard': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
        'inner-medium': 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.08)',
      },
      
      // Анимации
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'bounce-slight': 'bounceSlight 1s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSlight: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      
      // Скругленные углы
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Переходы
      transitionDuration: {
        '2000': '2000ms',
        '1500': '1500ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 