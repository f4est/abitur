// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/tailwind.css'],
  modules: ['@nuxtjs/tailwindcss'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  // Установка даты совместимости для Nitro
  compatibilityDate: '2025-05-07',
  // Middleware для проверки аутентификации
  routeRules: {
    // Middleware для защиты страниц
    '/profile': { middleware: ['auth'] },
    '/admin/**': { middleware: ['admin'] },
    '/test': { middleware: ['auth'] },
    
    // Редирект с устаревшего API тестов на новый
    '/api/test/questions': { redirect: '/api/test-api/questions' },
    '/api/test/questions/**': { redirect: { to: '/api/test-api/questions', statusCode: 302 } },
    '/api/test/results': { redirect: '/api/test-api/results' },
    '/api/test/results/**': { redirect: { to: '/api/test-api/results', statusCode: 302 } },
  },
  runtimeConfig: {
    // Секретный ключ для JWT
    JWT_SECRET: 'your_super_secret_jwt_key_for_abiturienty_project',
    public: {
      apiBase: '/api'
    }
  }
}) 