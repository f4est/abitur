<template>
  <div class="bg-snow-white min-h-screen p-2 sm:p-4 md:p-6">
    <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800">Панель управления администратора</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div class="flex items-center justify-between mb-2 sm:mb-4">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800">Пользователи</h2>
          <span class="text-xl sm:text-2xl font-bold text-ashleigh">{{ stats.usersCount }}</span>
        </div>
        <p class="text-gray-600 mb-4">Всего зарегистрированных пользователей в системе</p>
        <button @click="openUsersTab" class="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base">
          Управление пользователями
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div class="flex items-center justify-between mb-2 sm:mb-4">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800">Учебные заведения</h2>
          <span class="text-xl sm:text-2xl font-bold text-ashleigh">{{ stats.schoolsCount }}</span>
        </div>
        <p class="text-gray-600 mb-4">Всего учебных заведений в каталоге</p>
        <button @click="openSchoolsTab" class="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base">
          Управление заведениями
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div class="flex items-center justify-between mb-2 sm:mb-4">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800">Вопросы теста</h2>
          <span class="text-xl sm:text-2xl font-bold text-ashleigh">{{ stats.questionsCount }}</span>
        </div>
        <p class="text-gray-600 mb-4">Всего вопросов в тесте профориентации</p>
        <button @click="openTestTab" class="w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base">
          Управление вопросами
        </button>
      </div>
    </div>
    
    <!-- Табы управления -->
    <div v-if="activeTab !== 'dashboard'" class="mb-6 bg-white rounded-lg shadow-md overflow-hidden">
      <div class="flex flex-wrap border-b">
        <button 
          @click="activeTab = 'users'" 
          :class="[
            'px-3 sm:px-6 py-2 sm:py-3 text-gray-700 font-medium text-sm',
            activeTab === 'users' ? 'bg-gray-100 border-b-2 border-ashleigh' : 'hover:bg-gray-50'
          ]"
        >
          Пользователи
        </button>
        <button 
          @click="activeTab = 'schools'" 
          :class="[
            'px-3 sm:px-6 py-2 sm:py-3 text-gray-700 font-medium text-sm',
            activeTab === 'schools' ? 'bg-gray-100 border-b-2 border-ashleigh' : 'hover:bg-gray-50'
          ]"
        >
          Учебные заведения
        </button>
        <button 
          @click="activeTab = 'test'" 
          :class="[
            'px-3 sm:px-6 py-2 sm:py-3 text-gray-700 font-medium text-sm',
            activeTab === 'test' ? 'bg-gray-100 border-b-2 border-ashleigh' : 'hover:bg-gray-50'
          ]"
        >
          Вопросы теста
        </button>
        <button 
          @click="activeTab = 'dashboard'" 
          class="ml-auto px-3 sm:px-6 py-2 sm:py-3 text-gray-700 hover:bg-gray-50 text-sm"
        >
          Вернуться к панели
        </button>
      </div>
      
      <!-- Содержимое таба пользователей -->
      <div v-if="activeTab === 'users'" class="p-3 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Управление пользователями</h2>
        
        <div class="flex flex-col sm:flex-row justify-between mb-4 gap-2">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Поиск пользователей..." 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-64"
          />
          <NuxtLink to="/admin/users" class="px-3 py-2 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 transition text-sm text-center">
            Перейти к полному управлению
          </NuxtLink>
        </div>
        
        <div v-if="isLoadingUsers" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
          <p class="mt-2 text-gray-700">Загрузка пользователей...</p>
        </div>
        
        <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
          <p class="text-gray-700">Пользователи не найдены</p>
        </div>
        
        <div v-else class="overflow-x-auto bg-white rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">ID</th>
                <th class="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                <th class="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                <th class="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                <th class="px-3 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers.slice(0, 5)" :key="user.id">
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{{ user.id }}</td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-skyway flex items-center justify-center text-white flex-shrink-0">
                      {{ getInitials(user.name) }}
                    </div>
                    <div class="ml-2 sm:ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                      <div class="text-xs text-gray-500 md:hidden">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{{ user.email }}</td>
                <td class="px-3 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                    :class="user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-3 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <NuxtLink :to="`/admin/users?edit=${user.id}`" class="text-ashleigh hover:text-ashleigh/80">
                      <span class="hidden sm:inline">Изменить</span>
                      <span class="sm:hidden">✏️</span>
                    </NuxtLink>
                    <NuxtLink :to="`/admin/users?delete=${user.id}`" class="text-red-600 hover:text-red-800">
                      <span class="hidden sm:inline">Удалить</span>
                      <span class="sm:hidden">🗑️</span>
                    </NuxtLink>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Содержимое таба учебных заведений -->
      <div v-if="activeTab === 'schools'" class="p-3 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Управление учебными заведениями</h2>
        
        <div class="flex flex-col sm:flex-row justify-between mb-4 gap-2">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Поиск заведений..." 
            class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-64"
          />
          <NuxtLink to="/admin/schools" class="px-3 py-2 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 transition text-sm text-center">
            Перейти к полному управлению
          </NuxtLink>
        </div>
        
        <div v-if="isLoadingSchools" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
          <p class="mt-2 text-gray-700">Загрузка учебных заведений...</p>
        </div>
        
        <div v-else-if="filteredSchools.length === 0" class="text-center py-12">
          <p class="text-gray-700">Учебные заведения не найдены</p>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="school in filteredSchools.slice(0, 6)" :key="school.id" class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-skyway rounded flex items-center justify-center text-white mr-3 flex-shrink-0">
                <span class="text-base sm:text-lg font-bold">{{ getInitials(school.name) }}</span>
              </div>
              <h3 class="text-base sm:text-lg font-medium text-gray-800 line-clamp-2">{{ school.name }}</h3>
            </div>
            <p class="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">{{ school.address || 'Адрес не указан' }}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-500">Программ: {{ school.programs?.length || 0 }}</span>
              <div>
                <NuxtLink :to="`/admin/schools?edit=${school.id}`" class="text-ashleigh hover:text-ashleigh/80 mr-2 text-sm">✏️</NuxtLink>
                <NuxtLink :to="`/admin/schools?delete=${school.id}`" class="text-red-600 hover:text-red-800 text-sm">🗑️</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Содержимое таба вопросов теста -->
      <div v-if="activeTab === 'test'" class="p-3 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Управление вопросами теста</h2>
        
        <div class="flex flex-col sm:flex-row justify-between mb-4 gap-2">
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Поиск вопросов..." 
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-64"
            />
            <select 
              v-model="questionCategory"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-auto"
            >
              <option value="">Все категории</option>
              <option value="career">Карьера</option>
              <option value="personality">Личность</option>
              <option value="skills">Навыки</option>
            </select>
          </div>
          <NuxtLink to="/admin/test" class="px-3 py-2 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 transition text-sm text-center">
            Перейти к полному управлению
          </NuxtLink>
        </div>
        
        <div v-if="isLoadingQuestions" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
          <p class="mt-2 text-gray-700">Загрузка вопросов...</p>
        </div>
        
        <div v-else-if="filteredQuestions.length === 0" class="text-center py-12">
          <p class="text-gray-700">Вопросы не найдены</p>
        </div>
        
        <div v-else class="space-y-4">
          <div v-for="question in filteredQuestions.slice(0, 5)" :key="question.id" class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
            <div class="flex justify-between items-start mb-2">
              <h3 class="text-base font-medium text-gray-800 pr-4">{{ question.text }}</h3>
              <span class="bg-skyway text-white text-xs px-2 py-1 rounded flex-shrink-0">{{ question.category }}</span>
            </div>
            <div v-if="question.answers && question.answers.length" class="space-y-2 mb-3">
              <div v-for="(answer, index) in question.answers" :key="index" class="flex items-start text-sm">
                <div class="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  {{ index + 1 }}
                </div>
                <div>{{ answer.text }}</div>
              </div>
            </div>
            <div class="flex justify-end">
              <NuxtLink :to="`/admin/test?edit=${question.id}`" class="text-ashleigh hover:text-ashleigh/80 mr-3 text-sm">
                <span class="hidden sm:inline">Изменить</span>
                <span class="sm:hidden">✏️</span>
              </NuxtLink>
              <NuxtLink :to="`/admin/test?delete=${question.id}`" class="text-red-600 hover:text-red-800 text-sm">
                <span class="hidden sm:inline">Удалить</span>
                <span class="sm:hidden">🗑️</span>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Dashboard (показывается, когда не выбран ни один таб) -->
    <div v-if="activeTab === 'dashboard'">
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Последние действия</h2>
        
        <div v-if="isLoading" class="text-center py-8">
          <p class="text-gray-500">Загрузка данных...</p>
        </div>
        
        <div v-else-if="!actions.length" class="text-center py-8">
          <p class="text-gray-500">Нет данных о последних действиях</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-3 py-3 sm:px-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата и время
                </th>
                <th class="px-3 py-3 sm:px-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Пользователь
                </th>
                <th class="px-3 py-3 sm:px-6 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действие
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(action, index) in actions" :key="index">
                <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                  {{ new Date(action.date).toLocaleString() }}
                </td>
                <td class="px-3 py-4 sm:px-6 whitespace-nowrap">
                  <div class="text-xs sm:text-sm font-medium text-gray-900">{{ action.user }}</div>
                </td>
                <td class="px-3 py-4 sm:px-6 text-xs sm:text-sm text-gray-500">
                  {{ action.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Статистика регистраций</h2>
          
          <div class="bg-gray-100 rounded-lg p-4 sm:p-8 h-48 sm:h-60 flex items-center justify-center">
            <p class="text-gray-500 text-sm sm:text-base">График регистраций пользователей по дням</p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 class="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">Популярные учебные заведения</h2>
          
          <div v-if="!popularSchools.length" class="text-center py-8">
            <p class="text-gray-500">Нет данных о популярных учебных заведениях</p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="school in popularSchools" 
              :key="school.id"
              class="flex items-center justify-between border-b pb-3"
            >
              <div class="overflow-hidden">
                <div class="font-medium text-sm sm:text-base text-gray-800 truncate">{{ school.name }}</div>
                <div class="text-xs sm:text-sm text-gray-500 truncate">{{ school.address }}</div>
              </div>
              <div class="text-ashleigh font-semibold text-sm ml-2 whitespace-nowrap">
                {{ school.savedCount }} сохр.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const isLoading = ref(false)
const activeTab = ref('dashboard')

// Статистика для админ-панели
const stats = ref({
  usersCount: 0,
  schoolsCount: 0,
  questionsCount: 0
})

// Последние действия
const actions = ref([])

// Популярные учебные заведения
const popularSchools = ref([])

// Системные переменные
const searchQuery = ref('')

// Токен для API-запросов
const token = process.client ? localStorage.getItem('token') : null

// Загрузка данных
const isLoadingStats = ref(true)
const isLoadingUsers = ref(false)
const isLoadingSchools = ref(false)
const isLoadingQuestions = ref(false)
const isLoadingPopular = ref(false)
const isLoadingActions = ref(false)

// Пользователи
const users = ref([])
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) || 
    user.email.toLowerCase().includes(query)
  )
})

// Школы
const schools = ref([])
const filteredSchools = computed(() => {
  if (!searchQuery.value) return schools.value
  const query = searchQuery.value.toLowerCase()
  return schools.value.filter(school => 
    school.name.toLowerCase().includes(query) || 
    (school.address && school.address.toLowerCase().includes(query))
  )
})

// Вопросы теста
const questions = ref([])
const questionCategory = ref('')
const filteredQuestions = computed(() => {
  let filtered = questions.value
  
  if (questionCategory.value) {
    filtered = filtered.filter(q => q.category === questionCategory.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(q => q.text && q.text.toLowerCase().includes(query))
  }
  
  return filtered
})

// Функция для получения инициалов пользователя
const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

// Загрузка статистики
const loadStats = async () => {
  isLoadingStats.value = true
  try {
    const [usersResponse, schoolsResponse, questionsResponse] = await Promise.all([
      useFetch('/api/users', {
        headers: { 'Authorization': `Bearer ${token}` },
        key: 'admin-users-count'
      }),
      useFetch('/api/schools', {
        headers: { 'Authorization': `Bearer ${token}` },
        key: 'admin-schools-count'
      }),
      useFetch('/api/test-api/questions', {
        headers: { 'Authorization': `Bearer ${token}` },
        key: 'admin-questions-count'
      })
    ])
    
    if (usersResponse.error.value || schoolsResponse.error.value || questionsResponse.error.value) {
      throw new Error('Ошибка загрузки статистики')
    }
    
    stats.value = {
      usersCount: usersResponse.data.value?.body?.length || 0,
      schoolsCount: schoolsResponse.data.value?.body?.length || 0,
      questionsCount: questionsResponse.data.value?.body?.length || 0
    }
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
    // Устанавливаем значения по умолчанию в случае ошибки
    stats.value = { usersCount: '—', schoolsCount: '—', questionsCount: '—' }
  } finally {
    isLoadingStats.value = false
  }
}

// Загрузка пользователей
const loadUsers = async () => {
  isLoadingUsers.value = true
  try {
    const { data, error } = await useFetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` },
      key: `admin-users-${searchQuery.value}`
    })
    
    if (error.value) {
      throw new Error('Ошибка загрузки пользователей')
    }
    
    users.value = data.value.body || []
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
    users.value = []
  } finally {
    isLoadingUsers.value = false
  }
}

// Загрузка учебных заведений
const loadSchools = async () => {
  isLoadingSchools.value = true
  try {
    const { data, error } = await useFetch('/api/schools', {
      headers: { 'Authorization': `Bearer ${token}` },
      key: `admin-schools-${searchQuery.value}`
    })
    
    if (error.value) {
      throw new Error('Ошибка загрузки учебных заведений')
    }
    
    schools.value = data.value.body || []
  } catch (error) {
    console.error('Ошибка загрузки учебных заведений:', error)
    schools.value = []
  } finally {
    isLoadingSchools.value = false
  }
}

// Загрузка вопросов
const loadQuestions = async () => {
  isLoadingQuestions.value = true
  try {
    const { data, error } = await useFetch('/api/test-api/questions', {
      headers: { 'Authorization': `Bearer ${token}` },
      key: `admin-questions-${questionCategory.value}-${searchQuery.value}`
    })
    
    if (error.value) {
      throw new Error('Ошибка загрузки вопросов')
    }
    
    questions.value = data.value.body || []
  } catch (error) {
    console.error('Ошибка загрузки вопросов:', error)
    questions.value = []
  } finally {
    isLoadingQuestions.value = false
  }
}

// Загрузка популярных учебных заведений
const loadPopularSchools = async () => {
  isLoadingPopular.value = true
  try {
    // Здесь будет запрос к API для получения популярных учебных заведений
    // Пока возвращаем пустой список
    popularSchools.value = []
  } catch (error) {
    console.error('Ошибка загрузки популярных учебных заведений:', error)
    popularSchools.value = []
  } finally {
    isLoadingPopular.value = false
  }
}

// Загрузка последних действий
const loadActions = async () => {
  isLoadingActions.value = true
  try {
    // Здесь будет запрос к API для получения последних действий
    // Пока возвращаем пустой список
    actions.value = []
  } catch (error) {
    console.error('Ошибка загрузки последних действий:', error)
    actions.value = []
  } finally {
    isLoadingActions.value = false
  }
}

// Загрузка данных при переключении вкладок
const handleTabChange = (tab) => {
  activeTab.value = tab
  
  if (tab === 'users' && users.value.length === 0) {
    loadUsers()
  } else if (tab === 'schools' && schools.value.length === 0) {
    loadSchools()
  } else if (tab === 'questions' && questions.value.length === 0) {
    loadQuestions()
  }
}

// Загрузка начальных данных
onMounted(() => {
  loadStats()
  loadPopularSchools()
  loadActions()
})

// Отслеживание изменений поисковой строки
watch(searchQuery, (newVal, oldVal) => {
  if (activeTab.value === 'users') {
    loadUsers()
  } else if (activeTab.value === 'schools') {
    loadSchools()
  } else if (activeTab.value === 'questions') {
    loadQuestions()
  }
})

// Отслеживание изменений категории вопросов
watch(questionCategory, () => {
  if (activeTab.value === 'questions') {
    loadQuestions()
  }
})

// Функции открытия табов
const openUsersTab = async () => { 
  activeTab.value = 'users'
  searchQuery.value = ''
  if (users.value.length === 0) {
    loadUsers()
  }
}

const openSchoolsTab = async () => { 
  activeTab.value = 'schools'
  searchQuery.value = ''
  if (schools.value.length === 0) {
    loadSchools()
  }
}

const openTestTab = async () => { 
  activeTab.value = 'test'
  searchQuery.value = ''
  questionCategory.value = ''
  if (questions.value.length === 0) {
    loadQuestions()
  }
}

useHead({
  title: 'Панель управления - Админ-панель'
})
</script> 