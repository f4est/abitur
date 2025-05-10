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
        <!-- ... Содержимое таба пользователей ... -->
      </div>
      
      <!-- Содержимое таба учебных заведений -->
      <div v-if="activeTab === 'schools'" class="p-3 sm:p-6">
        <!-- ... Содержимое таба учебных заведений ... -->
      </div>
      
      <!-- Содержимое таба вопросов теста -->
      <div v-if="activeTab === 'test'" class="p-3 sm:p-6">
        <!-- ... Содержимое таба вопросов теста ... -->
      </div>
    </div>
    
    <!-- Dashboard (показывается, когда не выбран ни один таб) -->
    <div v-if="activeTab === 'dashboard'">
      <!-- ... Содержимое дашборда ... -->
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
  if (!users.value || !Array.isArray(users.value)) return []
  
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
  if (!schools.value || !Array.isArray(schools.value)) return []
  
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
  if (!questions.value || !Array.isArray(questions.value)) return []
  
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
    // Заменяем useFetch на прямой вызов fetch и обработку через await response.json()
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    const [usersResponse, schoolsResponse, questionsResponse] = await Promise.all([
      fetch('/api/users', { headers }).then(res => res.json()),
      fetch('/api/schools', { headers }).then(res => res.json()),
      fetch('/api/test-api/questions', { headers }).then(res => res.json())
    ]);
    
    stats.value = {
      usersCount: Array.isArray(usersResponse.body) ? usersResponse.body.length : 0,
      schoolsCount: Array.isArray(schoolsResponse.body) ? schoolsResponse.body.length : 0,
      questionsCount: Array.isArray(questionsResponse.body) ? questionsResponse.body.length : 0
    }
    
    console.log("Статистика загружена:", stats.value);
  } catch (error) {
    console.error('Ошибка загрузки статистики:', error)
    // Устанавливаем значения по умолчанию в случае ошибки
    stats.value = { usersCount: '—', schoolsCount: '—', questionsCount: '—' }
  } finally {
    isLoadingStats.value = false
  }
}

// Остальные методы загрузки данных...

// Загрузка начальных данных
onMounted(() => {
  loadStats()
  loadPopularSchools()
  loadActions()
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