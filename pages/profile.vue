<template>
  <div>
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Загрузка данных...</p>
    </div>
    
    <div v-else-if="!user" class="text-center py-12">
      <p class="text-gray-500">Для просмотра профиля необходимо авторизоваться</p>
      <NuxtLink to="/login" class="btn btn-primary mt-4">
        Войти
      </NuxtLink>
    </div>
    
    <div v-else>
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Боковая панель профиля -->
        <div class="md:w-1/3">
          <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <div class="flex flex-col items-center">
              <div class="relative group">
                <div class="w-32 h-32 rounded-full bg-skyway text-white flex items-center justify-center mb-4 overflow-hidden border-2 border-ashleigh group-hover:border-yolk-yellow transition-colors">
                  <img 
                    v-if="user.avatarUrl" 
                    :src="user.avatarUrl" 
                    :alt="user.name"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-4xl font-bold">{{ getInitials(user.name) }}</span>
                </div>
                <div class="absolute bottom-3 right-0 bg-ashleigh hover:bg-yolk-yellow text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-md transition-colors" 
                     @click="isEditingProfile = true"
                     title="Изменить аватар">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>
              
              <h1 class="text-2xl font-bold mb-1">{{ user.name }}</h1>
              <p class="text-gray-600 mb-4">{{ user.email }}</p>
              
              <div class="flex w-full">
                <button @click="isEditingProfile = true" class="btn btn-primary w-full flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редактировать профиль
                </button>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Навигация
            </h2>
            
            <nav class="space-y-2">
              <button 
                @click="activeTab = 'saved'" 
                class="w-full text-left py-2 px-3 rounded transition-colors flex items-center"
                :class="activeTab === 'saved' ? 'bg-ashleigh/10 text-ashleigh' : 'hover:bg-gray-100'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Сохраненные учебные заведения
              </button>
              
              <button 
                @click="activeTab = 'tests'" 
                class="w-full text-left py-2 px-3 rounded transition-colors flex items-center"
                :class="activeTab === 'tests' ? 'bg-ashleigh/10 text-ashleigh' : 'hover:bg-gray-100'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Результаты тестов
              </button>
              
              <button 
                @click="activeTab = 'settings'" 
                class="w-full text-left py-2 px-3 rounded transition-colors flex items-center"
                :class="activeTab === 'settings' ? 'bg-ashleigh/10 text-ashleigh' : 'hover:bg-gray-100'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки
              </button>
            </nav>
          </div>
        </div>
        
        <!-- Основное содержимое профиля -->
        <div class="md:w-2/3">
          <!-- Сохраненные учебные заведения -->
          <div v-if="activeTab === 'saved'" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-ashleigh" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Сохраненные учебные заведения
            </h2>
            
            <div v-if="!user.savedSchools || user.savedSchools.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p class="text-gray-500 mb-4">У вас пока нет сохраненных учебных заведений</p>
              <NuxtLink to="/catalog" class="btn btn-primary inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Перейти в каталог
              </NuxtLink>
            </div>
            
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                v-for="saved in user.savedSchools" 
                :key="saved.schoolId" 
                class="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white group"
              >
                <div>
                  <h3 class="text-lg font-semibold mb-1 group-hover:text-ashleigh transition-colors">{{ saved.school.name }}</h3>
                  <p class="text-gray-600 text-sm mb-3 line-clamp-2">{{ saved.school.address }}</p>
                  
                  <div class="flex space-x-2 justify-end mt-2">
                    <NuxtLink :to="`/catalog/${saved.schoolId}`" class="btn btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Подробнее
                    </NuxtLink>
                    <button 
                      @click="removeSavedSchool(saved.schoolId)" 
                      class="btn text-sm px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white inline-flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Результаты тестов -->
          <div v-else-if="activeTab === 'tests'" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-ashleigh" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Результаты тестов
            </h2>
            
            <div v-if="!user.testResults || user.testResults.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p class="text-gray-500 mb-4">Вы еще не проходили тест на профориентацию</p>
              <NuxtLink to="/test" class="btn btn-primary inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Пройти тест
              </NuxtLink>
            </div>
            
            <div v-else class="space-y-6">
              <div 
                v-for="(result, index) in user.testResults" 
                :key="result.id" 
                class="border rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Результат теста {{ index + 1 }}
                  </h3>
                  <span class="text-sm text-gray-600">
                    {{ new Date(result.createdAt).toLocaleDateString() }} {{ new Date(result.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                  </span>
                </div>
                
                <div v-if="parseTestResults(result.results)" class="mt-5">
                  <div class="space-y-4">
                    <div v-for="(value, category) in parseTestResults(result.results).categories" :key="category" class="bg-gray-50 p-4 rounded-lg">
                      <div class="flex justify-between mb-2">
                        <span class="font-medium">{{ getCategoryName(category) }}</span>
                        <span class="font-bold text-ashleigh">{{ value }} баллов</span>
                      </div>
                      <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          class="h-full rounded-full"
                          :class="getBgColorClass(value, getMaxCategoryScore(result.results))"
                          :style="{ width: `${(value / getMaxCategoryScore(result.results)) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="parseTestResults(result.results).recommendations" class="mt-6 p-4 bg-ashleigh/10 rounded-lg">
                    <h4 class="font-medium mb-2 text-ashleigh flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Рекомендации:
                    </h4>
                    <p>{{ parseTestResults(result.results).recommendations }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Настройки профиля -->
          <div v-else-if="activeTab === 'settings'" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold mb-6">Настройки</h2>
            
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  class="input w-full"
                />
              </div>
              
              <div>
                <label for="avatarUrl" class="block text-sm font-medium text-gray-700 mb-1">URL аватара</label>
                <input
                  id="avatarUrl"
                  v-model="profileForm.avatarUrl"
                  type="text"
                  class="input w-full"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              
              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Новый пароль (не заполняйте, если не хотите менять)</label>
                <input
                  id="newPassword"
                  v-model="profileForm.newPassword"
                  type="password"
                  class="input w-full"
                />
              </div>
              
              <button type="submit" class="btn btn-primary">
                Сохранить изменения
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно редактирования профиля -->
      <div v-if="isEditingProfile" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 class="text-2xl font-semibold mb-4">Редактирование профиля</h2>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div>
              <label for="modalName" class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
              <input
                id="modalName"
                v-model="profileForm.name"
                type="text"
                class="input w-full"
              />
            </div>
            
            <div>
              <label for="modalAvatarUrl" class="block text-sm font-medium text-gray-700 mb-1">URL аватара</label>
              <input
                id="modalAvatarUrl"
                v-model="profileForm.avatarUrl"
                type="text"
                class="input w-full"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            
            <div class="flex justify-end space-x-3">
              <button 
                type="button" 
                @click="isEditingProfile = false" 
                class="btn bg-gray-200 hover:bg-gray-300"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})

const user = ref(null)
const isLoading = ref(true)
const isEditingProfile = ref(false)
const activeTab = ref('saved')

const profileForm = reactive({
  name: '',
  avatarUrl: '',
  newPassword: ''
})

// Извлекаем инициалы из имени для плейсхолдера аватара
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Парсим результаты теста
const parseTestResults = (resultsStr) => {
  try {
    return typeof resultsStr === 'string' ? JSON.parse(resultsStr) : resultsStr
  } catch (error) {
    console.error('Ошибка парсинга результатов теста:', error)
    return null
  }
}

// Получаем название категории
const getCategoryName = (category) => {
  const categories = {
    'technical': 'Технические науки',
    'humanities': 'Гуманитарные науки',
    'science': 'Естественные науки',
    'arts': 'Искусство и творчество',
    'business': 'Бизнес и экономика',
    'medicine': 'Медицина и здравоохранение'
  }
  
  return categories[category] || category
}

// Получаем максимальный балл по категориям
const getMaxCategoryScore = (resultsStr) => {
  try {
    const results = typeof resultsStr === 'string' ? JSON.parse(resultsStr) : resultsStr
    if (!results || !results.categories) return 10
    
    return Math.max(...Object.values(results.categories))
  } catch (error) {
    console.error('Ошибка получения максимального балла:', error)
    return 10
  }
}

// Загрузка данных пользователя
const loadUserData = async () => {
  isLoading.value = true
  
  const token = localStorage.getItem('token')
  if (!token) {
    isLoading.value = false
    return
  }
  
  try {
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    
    if (response.ok) {
      user.value = data.body
      
      // Устанавливаем значения в форму
      profileForm.name = user.value.name
      profileForm.avatarUrl = user.value.avatarUrl || ''
    } else {
      console.error('Ошибка загрузки данных пользователя:', data.message)
    }
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error)
  } finally {
    isLoading.value = false
  }
}

// Обновление профиля
const updateProfile = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  
  try {
    const payload = {
      name: profileForm.name,
      avatarUrl: profileForm.avatarUrl
    }
    
    if (profileForm.newPassword) {
      payload.password = profileForm.newPassword
    }
    
    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      user.value = data.body
      profileForm.newPassword = ''
      isEditingProfile.value = false
      
      // Обновляем данные пользователя в localStorage
      const storedUserData = localStorage.getItem('user')
      try {
        if (storedUserData && storedUserData !== 'undefined' && storedUserData !== 'null') {
          const storedUser = JSON.parse(storedUserData)
          storedUser.name = user.value.name
          storedUser.avatarUrl = user.value.avatarUrl
          localStorage.setItem('user', JSON.stringify(storedUser))
        }
      } catch (error) {
        console.error('Ошибка при обновлении данных пользователя:', error)
        // В случае ошибки, записываем новые данные пользователя
        localStorage.setItem('user', JSON.stringify({
          id: user.value.id,
          name: user.value.name,
          email: user.value.email,
          role: user.value.role,
          avatarUrl: user.value.avatarUrl
        }))
      }
    } else {
      console.error('Ошибка обновления профиля:', data.message)
    }
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
  }
}

// Удаление сохраненного учебного заведения
const removeSavedSchool = async (schoolId) => {
  const token = localStorage.getItem('token')
  if (!token) return
  
  try {
    const response = await fetch(`/api/schools/${schoolId}/save`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      // Обновляем список сохраненных учебных заведений
      user.value.savedSchools = user.value.savedSchools.filter(
        saved => saved.schoolId !== schoolId
      )
    } else {
      console.error('Ошибка удаления сохраненного учебного заведения')
    }
  } catch (error) {
    console.error('Ошибка удаления сохраненного учебного заведения:', error)
  }
}

// Новая функция для получения класса фона в зависимости от значения
function getBgColorClass(value, maxValue) {
  const percent = (value / maxValue) * 100
  
  if (percent >= 75) return 'bg-green-500'
  if (percent >= 50) return 'bg-ashleigh'
  if (percent >= 25) return 'bg-skyway'
  return 'bg-gray-400'
}

onMounted(() => {
  loadUserData()
})

useHead({
  title: 'Профиль - Платформа для абитуриентов'
})
</script> 