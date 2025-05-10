<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="sticky top-0 z-50 bg-ashleigh shadow-soft text-white">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center space-x-2">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ashleigh font-bold text-xl overflow-hidden">
            <img src="/images/placeholders-png/favicon.ico" alt="Edugate" class="w-full h-full object-cover"/>
          </div>
          <span class="text-2xl font-bold text-white">Edugate</span>
        </NuxtLink>
        
        <!-- Мобильное меню-бургер -->
        <button 
          @click="mobileMenuOpen = !mobileMenuOpen" 
          class="md:hidden flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none"
          aria-label="Открыть меню"
        >
          <svg 
            :class="mobileMenuOpen ? 'hidden' : 'block'" 
            class="h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg 
            :class="mobileMenuOpen ? 'block' : 'hidden'" 
            class="h-6 w-6" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Десктопное меню -->
        <nav class="hidden md:flex items-center space-x-1">
          <NuxtLink to="/" 
            class="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            active-class="bg-white/20 text-white"
          >
            Главная
          </NuxtLink>
          <NuxtLink to="/catalog" 
            class="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            active-class="bg-white/20 text-white"
          >
            Каталог
          </NuxtLink>
          <NuxtLink to="/test" 
            class="px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            active-class="bg-white/20 text-white"
          >
            Тест
          </NuxtLink>
          <template v-if="auth.isAuthenticated">
            <div class="relative ml-4 group">
              <button 
                class="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                @click="profileMenuOpen = !profileMenuOpen"
              >
                <div class="w-8 h-8 rounded-full overflow-hidden">
                  <ImageLoader 
                    :src="auth.user?.avatarUrl" 
                    :alt="auth.user?.name || 'Пользователь'"
                    placeholder-type="avatar"
                    :show-initials="true"
                    :name="auth.user?.name"
                  />
                </div>
                <span>{{ auth.user?.name || 'Пользователь' }}</span>
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              <!-- Выпадающее меню профиля -->
              <div 
                v-show="profileMenuOpen"
                class="absolute right-0 mt-2 w-48 py-2 bg-ashleigh rounded-lg shadow-medium border border-white/10 z-20"
              >
                <NuxtLink to="/profile" class="block px-4 py-2 text-white hover:bg-white/10">
                  Профиль
                </NuxtLink>
                <NuxtLink 
                  v-if="auth.user && auth.user.role === 'ADMIN'" 
                  to="/admin" 
                  class="block px-4 py-2 text-white hover:bg-white/10"
                  @click="() => console.log('Клик по ссылке на админ-панель')"
                >
                  Админ-панель ({{auth.user ? auth.user.role : 'нет роли'}})
                </NuxtLink>
                <div class="border-t border-white/10 my-1"></div>
                <button @click="logout" class="block w-full text-left px-4 py-2 text-white hover:bg-white/10">
                  Выйти
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/login" class="btn btn-primary ml-4">
              Войти
            </NuxtLink>
          </template>
        </nav>
      </div>
      
      <!-- Мобильное меню -->
      <div 
        v-show="mobileMenuOpen" 
        class="md:hidden absolute w-full shadow-medium bg-ashleigh border-t border-white/10 opacity-0 animate-[slideIn_0.3s_ease-out_forwards]"
      >
        <div class="px-2 pt-2 pb-3 space-y-1">
          <NuxtLink to="/" 
            class="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/10"
            active-class="bg-white/20 text-white"
          >
            Главная
          </NuxtLink>
          <NuxtLink to="/catalog" 
            class="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/10"
            active-class="bg-white/20 text-white"
          >
            Каталог
          </NuxtLink>
          <NuxtLink to="/test" 
            class="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/10"
            active-class="bg-white/20 text-white"
          >
            Тест
          </NuxtLink>
          <template v-if="auth.isAuthenticated">
            <div class="border-t border-white/10 my-2 pt-2">
              <NuxtLink to="/profile" 
                class="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/10"
              >
                Профиль
              </NuxtLink>
              <NuxtLink 
                v-if="auth.user && auth.user.role === 'ADMIN'" 
                to="/admin" 
                class="block px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/10"
                @click="() => console.log('Клик по ссылке на админ-панель (мобильное меню)')"
              >
                Админ-панель ({{auth.user ? auth.user.role : 'нет роли'}})
              </NuxtLink>
              <button 
                @click="logout" 
                class="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-white hover:bg-white/10"
              >
                Выйти
              </button>
            </div>
          </template>
          <template v-else>
            <div class="mt-4 px-2">
              <NuxtLink to="/login" class="block w-full btn btn-primary text-center">
                Войти
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </header>

    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <footer class="bg-ashleigh text-white py-12 mt-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="opacity-0 animate-[fadeIn_0.5s_ease-out_0.1s_forwards]">
            <div class="flex items-center space-x-2 mb-6">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-ashleigh font-bold text-xl overflow-hidden shadow-lg">
                <img src="/images/placeholders-png/favicon.ico" alt="Edugate" class="w-full h-full object-cover"/>
              </div>
              <span class="text-2xl font-bold text-white drop-shadow">Edugate</span>
            </div>
            <p class="text-white max-w-md drop-shadow">
              Платформа для абитуриентов, помогающая в выборе учебного заведения и профессии. Мы стремимся сделать образование более доступным и понятным.
            </p>
          </div>
          
          <div class="opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
            <h3 class="text-xl font-bold mb-4 flex items-center text-white drop-shadow">
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
              </svg>
              Навигация
            </h3>
            <ul class="space-y-2">
              <li>
                <NuxtLink to="/" class="text-white flex items-center hover:translate-x-1 transition-transform drop-shadow">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Главная
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/catalog" class="text-white flex items-center hover:translate-x-1 transition-transform drop-shadow">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path>
                  </svg>
                  Каталог
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/test" class="text-white flex items-center hover:translate-x-1 transition-transform drop-shadow">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Тест
                </NuxtLink>
              </li>
            </ul>
          </div>
          
          <div class="opacity-0 animate-[fadeIn_0.5s_ease-out_0.3s_forwards]">
            <h3 class="text-xl font-bold mb-4 flex items-center text-white drop-shadow">
              <svg class="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              Контакты
            </h3>
            <ul class="space-y-2">
              <li class="flex items-center text-white drop-shadow">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                support@edugate.kz
              </li>
              <li class="flex items-center text-white drop-shadow">
                <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                +7 (999) 999-99-99
              </li>
              <li class="flex items-start text-white drop-shadow">
                <svg class="h-4 w-4 mr-2 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                г. Алматы,<br /> ул. Примерная, д. 123
              </li>
            </ul>
            
            <div class="mt-4 flex space-x-3">
              <a href="#" class="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shadow-lg">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" class="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shadow-lg">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.017 10.017 0 01-3.127 1.195A4.92 4.92 0 0012.11 7.365a13.978 13.978 0 01-10.15-5.145 4.922 4.922 0 001.523 6.57 4.887 4.887 0 01-2.23-.616v.061a4.928 4.928 0 003.95 4.829 4.933 4.933 0 01-2.224.085 4.932 4.932 0 004.6 3.42 9.875 9.875 0 01-6.115 2.107c-.398 0-.79-.023-1.175-.069a13.964 13.964 0 007.55 2.213c9.058 0 14.012-7.5 14.012-13.999 0-.212-.005-.425-.012-.637a10.014 10.014 0 002.458-2.548z"/>
                </svg>
              </a>
              <a href="#" class="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors shadow-lg">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0z"/>
                  <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8z"/>
                  <circle cx="18.406" cy="5.594" r="1.44"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div class="mt-10 pt-6 border-t border-white/20 text-center text-white drop-shadow">
          <p>&copy; {{ new Date().getFullYear() }} Edugate. Все права защищены.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSavedSchools } from '~/composables/useSavedSchools'
import ImageLoader from '~/components/ImageLoader.vue'

const router = useRouter()
const route = useRoute()

const auth = reactive({
  isAuthenticated: false,
  user: null,
  token: null
})

// Состояние меню
const mobileMenuOpen = ref(false)
const profileMenuOpen = ref(false)

// Импортируем composable для управления сохраненными школами
const { loadSavedSchools } = useSavedSchools()

// При монтировании компонента проверяем, есть ли токен в localStorage
onMounted(() => {
  try {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    
    updateAuthState(token, userStr)
    
    // Загружаем сохраненные учебные заведения, если пользователь авторизован
    if (token) {
      loadSavedSchools()
    }
    
    // Добавляем обработчик события хранилища для синхронизации между вкладками
    window.addEventListener('storage', () => {
      const updatedToken = localStorage.getItem('token')
      const updatedUser = localStorage.getItem('user')
      updateAuthState(updatedToken, updatedUser)
      
      // Обновляем сохраненные учебные заведения при изменении в localStorage
      if (updatedToken) {
        loadSavedSchools()
      }
    })
    
  } catch (error) {
    console.error('Ошибка при инициализации авторизации:', error)
  }
})

// Функция для обновления состояния авторизации
function updateAuthState(token, userStr) {
  try {
    if (token) {
      auth.isAuthenticated = true
      auth.token = token
      
      // Безопасный парсинг JSON с проверкой
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        try {
          auth.user = JSON.parse(userStr)
          console.log('Пользователь загружен:', auth.user)
          console.log('Роль пользователя:', auth.user.role)
          
          // Проверяем роль пользователя, но не проверяем конкретный email
          console.log('Является ли админом:', auth.user.role === 'ADMIN')
          
          // Принудительно устанавливаем роль для отладки
          if (auth.user.role === 'ADMIN') {
            console.log('Это администратор! Должна показываться ссылка на админ-панель.')
          }
        } catch (parseError) {
          console.error('Ошибка парсинга данных пользователя:', parseError)
          resetAuth()
        }
      } else {
        // Если user некорректный, сбрасываем данные авторизации
        resetAuth()
      }
    } else {
      resetAuth()
    }
  } catch (error) {
    console.error('Общая ошибка при обновлении состояния авторизации:', error)
    resetAuth()
  }
}

// Функция сброса авторизации
function resetAuth() {
  auth.isAuthenticated = false
  auth.user = null
  auth.token = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Функция для выхода
const logout = () => {
  auth.isAuthenticated = false
  auth.user = null
  auth.token = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  profileMenuOpen.value = false
  
  // Используем router.push вместо navigateTo
  router.push('/')
}

// Закрытие меню при клике вне его
onMounted(() => {
  document.addEventListener('click', (e) => {
    // Если клик был не по меню профиля и оно открыто, закрываем его
    if (profileMenuOpen.value && !e.target.closest('.relative.group')) {
      profileMenuOpen.value = false
    }
  })
})

// Закрытие мобильного меню при изменении маршрута
watch(() => route.path, () => {
  mobileMenuOpen.value = false
  profileMenuOpen.value = false
})

// Добавляем favicon в head
useHead({
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/images/placeholders-png/favicon.ico' }
  ]
})
</script> 