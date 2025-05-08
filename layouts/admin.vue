<template>
  <div class="min-h-screen flex">
    <!-- Боковая панель навигации -->
    <aside class="w-64 bg-ashleigh text-white px-4 py-6">
      <div class="mb-8">
        <h1 class="text-2xl font-bold">Edugate</h1>
        <p class="text-sm mt-1 text-gray-200">Админ-панель</p>
      </div>
      
      <nav class="space-y-2">
        <NuxtLink to="/admin" class="block py-2 px-4 rounded hover:bg-skyway">
          Панель управления
        </NuxtLink>
        <NuxtLink to="/admin/users" class="block py-2 px-4 rounded hover:bg-skyway">
          Пользователи
        </NuxtLink>
        <NuxtLink to="/admin/schools" class="block py-2 px-4 rounded hover:bg-skyway">
          Учебные заведения
        </NuxtLink>
        <NuxtLink to="/admin/test" class="block py-2 px-4 rounded hover:bg-skyway">
          Вопросы теста
        </NuxtLink>
        <NuxtLink to="/" class="block py-2 px-4 rounded hover:bg-skyway">
          Вернуться на сайт
        </NuxtLink>
        <button @click="logout" class="block w-full text-left py-2 px-4 rounded hover:bg-skyway">
          Выйти
        </button>
      </nav>
    </aside>

    <!-- Основное содержимое -->
    <div class="flex-1 flex flex-col">
      <header class="bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-800">
          Административная панель
        </h2>
        <div class="flex items-center">
          <span class="mr-4">{{ user?.name || 'Администратор' }}</span>
        </div>
      </header>

      <main class="flex-1 p-6 bg-snow-white overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const user = ref(null)
const isLoading = ref(true)
const router = useRouter()

// Проверка аутентификации при монтировании компонента
onMounted(async () => {
  await checkAuth()
})

// Проверка статуса аутентификации и прав доступа
const checkAuth = async () => {
  try {
    isLoading.value = true
    
    // Проверяем, что мы на клиенте
    if (!process.client) {
      return
    }
    
    // Получаем токен из localStorage
  const token = localStorage.getItem('token')
    
    if (!token) {
      // Если токена нет, перенаправляем на страницу входа
      router.push('/login')
      return
    }
    
    // Запрос данных текущего пользователя с сервера
    const { data } = await useFetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (data.value && data.value.body) {
      user.value = data.value.body
      
      // Проверяем, имеет ли пользователь права администратора
      if (user.value.role !== 'ADMIN') {
        // Если нет прав администратора, перенаправляем на главную
        localStorage.removeItem('token')
        router.push('/')
      }
    } else {
      // Если запрос не вернул данные пользователя, перенаправляем на страницу входа
      localStorage.removeItem('token')
      router.push('/login')
    }
  } catch (error) {
    console.error('Ошибка проверки аутентификации:', error)
    // В случае ошибки перенаправляем на страницу входа
    if (process.client) {
      localStorage.removeItem('token')
    }
    router.push('/login')
  } finally {
    isLoading.value = false
  }
}

// Функция для выхода
const logout = async () => {
  // Удаляем токен из localStorage
  if (process.client) {
  localStorage.removeItem('token')
  }
  user.value = null
  
  // Перенаправляем на главную страницу
  router.push('/')
}
</script> 