<template>
  <div class="bg-gray-50 min-h-screen p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">Управление вопросами теста</h1>
      <NuxtLink to="/admin" class="bg-ashleigh text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
        Назад к панели
      </NuxtLink>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between mb-4">
        <div class="flex gap-2">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Поиск вопросов..." 
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-64"
            @input="searchQuestions"
          />
          <select 
            v-model="categoryFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            @change="searchQuestions"
          >
            <option value="">Все категории</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        <button 
          @click="openAddModal = true; resetForm()" 
          class="bg-ashleigh text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
        >
          + Добавить вопрос
        </button>
      </div>
      
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
        <p class="mt-2 text-gray-700">Загрузка вопросов...</p>
      </div>
      
      <div v-else-if="filteredQuestions.length === 0" class="text-center py-12">
        <p class="text-gray-700">Вопросы не найдены</p>
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="question in filteredQuestions" 
          :key="question.id" 
          class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
        >
          <div class="flex justify-between mb-2">
            <span class="text-xs text-gray-700 px-2 py-1 bg-gray-100 rounded-full">{{ question.category }}</span>
            <div>
              <button 
                @click="editQuestion(question)" 
                class="text-ashleigh hover:text-ashleigh/80 mr-2 text-sm"
              >
                Изменить
              </button>
              <button 
                @click="confirmDelete(question)" 
                class="text-red-600 hover:text-red-800 text-sm"
              >
                Удалить
              </button>
            </div>
          </div>
          <p class="text-gray-800 font-medium">{{ question.question }}</p>
          <div class="mt-2 pl-4 space-y-1">
            <div v-for="(option, index) in parseOptions(question.options)" :key="index" class="text-sm text-gray-700">
              {{ option }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно добавления вопроса -->
    <div v-if="openAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg overflow-y-auto max-h-[80vh]">
        <h2 class="text-xl font-semibold mb-4">Добавить вопрос</h2>
        
        <form @submit.prevent="addQuestion" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Вопрос</label>
            <input
              v-model="questionForm.question"
              type="text"
              required
              class="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <div class="flex gap-2">
              <select
                v-model="questionForm.category"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              >
                <option value="">Выберите категорию</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
              <input
                v-if="questionForm.category === 'Другое'"
                v-model="questionForm.customCategory"
                type="text"
                placeholder="Новая категория"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Варианты ответов</label>
            <div class="border border-gray-300 rounded-lg p-3">
              <div v-for="(option, index) in questionForm.options" :key="index" class="flex items-center gap-2 mb-2">
                <input
                  v-model="questionForm.options[index]"
                  type="text"
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                  placeholder="Вариант ответа"
                />
                <button 
                  type="button"
                  @click="removeOption(index)"
                  class="text-red-600 hover:text-red-800"
                  :disabled="questionForm.options.length <= 2"
                  :class="{ 'opacity-50 cursor-not-allowed': questionForm.options.length <= 2 }"
                >
                  &times;
                </button>
              </div>
              <button 
                type="button"
                @click="addOption"
                class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mt-2"
              >
                + Добавить вариант ответа
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Минимум 2 варианта ответа</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Веса результатов для ответов</label>
            <div class="border border-gray-300 rounded-lg p-3">
              <div v-for="(option, index) in questionForm.options" :key="index" class="mb-3">
                <p class="text-sm font-medium mb-1">{{ option || `Вариант ${index + 1}` }}</p>
                <div class="flex flex-wrap gap-2">
                  <div v-for="result in questionForm.results" :key="result.id" class="flex items-center">
                    <label class="text-xs w-24 text-gray-700">{{ result.name }}:</label>
                    <input
                      v-model.number="questionForm.weights[index][result.id]"
                      type="number"
                      min="0"
                      max="10"
                      class="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Укажите вес (от 0 до 10) для каждого варианта ответа по разным результатам</p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="openAddModal = false"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-ashleigh hover:bg-opacity-90 text-white rounded-lg"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модальное окно редактирования вопроса -->
    <div v-if="openEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-lg overflow-y-auto max-h-[80vh]">
        <h2 class="text-xl font-semibold mb-4">Редактировать вопрос</h2>
        
        <form @submit.prevent="updateQuestion" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Вопрос</label>
            <input
              v-model="questionForm.question"
              type="text"
              required
              class="px-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
            <div class="flex gap-2">
              <select
                v-model="questionForm.category"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              >
                <option value="">Выберите категорию</option>
                <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
              </select>
              <input
                v-if="questionForm.category === 'Другое'"
                v-model="questionForm.customCategory"
                type="text"
                placeholder="Новая категория"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Варианты ответов</label>
            <div class="border border-gray-300 rounded-lg p-3">
              <div v-for="(option, index) in questionForm.options" :key="index" class="flex items-center gap-2 mb-2">
                <input
                  v-model="questionForm.options[index]"
                  type="text"
                  required
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                  placeholder="Вариант ответа"
                />
                <button 
                  type="button"
                  @click="removeOption(index)"
                  class="text-red-600 hover:text-red-800"
                  :disabled="questionForm.options.length <= 2"
                  :class="{ 'opacity-50 cursor-not-allowed': questionForm.options.length <= 2 }"
                >
                  &times;
                </button>
              </div>
              <button 
                type="button"
                @click="addOption"
                class="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg mt-2"
              >
                + Добавить вариант ответа
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">Минимум 2 варианта ответа</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Веса результатов для ответов</label>
            <div class="border border-gray-300 rounded-lg p-3">
              <div v-for="(option, index) in questionForm.options" :key="index" class="mb-3">
                <p class="text-sm font-medium mb-1">{{ option || `Вариант ${index + 1}` }}</p>
                <div class="flex flex-wrap gap-2">
                  <div v-for="result in questionForm.results" :key="result.id" class="flex items-center">
                    <label class="text-xs w-24 text-gray-700">{{ result.name }}:</label>
                    <input
                      v-model.number="questionForm.weights[index][result.id]"
                      type="number"
                      min="0"
                      max="10"
                      class="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">Укажите вес (от 0 до 10) для каждого варианта ответа по разным результатам</p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="openEditModal = false"
              class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-ashleigh hover:bg-opacity-90 text-white rounded-lg"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="openDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Подтверждение удаления</h2>
        <p class="mb-6">Вы уверены, что хотите удалить вопрос «<span class="font-semibold">{{ questionToDelete?.question }}</span>»?</p>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="openDeleteModal = false"
            class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
          >
            Отмена
          </button>
          <button
            @click="deleteQuestion"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Удалить
          </button>
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

// Состояние
const isLoading = ref(true)
const questions = ref([])
const filteredQuestions = ref([])
const searchQuery = ref('')
const categoryFilter = ref('')

// Модальные окна
const openAddModal = ref(false)
const openEditModal = ref(false)
const openDeleteModal = ref(false)
const questionToDelete = ref(null)

// Предопределенные категории
const categories = ref(['Карьера', 'Личность', 'Навыки', 'Интересы', 'Другое'])

// Предопределенные результаты тестов
const defaultResults = [
  { id: 1, name: 'Технические науки' },
  { id: 2, name: 'Гуманитарные науки' },
  { id: 3, name: 'Естественные науки' },
  { id: 4, name: 'Творческие профессии' },
  { id: 5, name: 'Экономика и бизнес' }
]

// Форма вопроса
const questionForm = reactive({
  id: null,
  question: '',
  category: '',
  customCategory: '',
  options: ['', ''],
  results: [...defaultResults],
  weights: []
})

// Инициализация весовых коэффициентов
const initWeights = () => {
  questionForm.weights = questionForm.options.map(() => {
    const optionWeights = {}
    questionForm.results.forEach(result => {
      optionWeights[result.id] = 0
    })
    return optionWeights
  })
}

// Поиск вопросов
const searchQuestions = () => {
  if (!searchQuery.value && !categoryFilter.value) {
    filteredQuestions.value = questions.value
    return
  }
  
  filteredQuestions.value = questions.value.filter(question => {
    const matchesSearch = !searchQuery.value || 
      question.question.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesCategory = !categoryFilter.value || question.category === categoryFilter.value
    
    return matchesSearch && matchesCategory
  })
}

// Функция для разбора строкового представления опций
const parseOptions = (options) => {
  if (!options) return []
  if (Array.isArray(options)) return options
  try {
    return JSON.parse(options)
  } catch (e) {
    console.error('Ошибка при разборе опций', e)
    return []
  }
}

// Сброс формы
const resetForm = () => {
  questionForm.id = null
  questionForm.question = ''
  questionForm.category = ''
  questionForm.customCategory = ''
  questionForm.options = ['', '']
  initWeights()
}

// Загрузка вопросов
const loadQuestions = async () => {
  isLoading.value = true
  
  try {
    if (!process.client) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    // Используем новое API
    const { data } = await $fetch('/api/test-api/questions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (data && data.body) {
      questions.value = data.body.map(q => ({
        ...q,
        options: parseOptions(q.options)
      }))
      
      filteredQuestions.value = [...questions.value]
      
      // Собираем все уникальные категории
      const categorySet = new Set()
      questions.value.forEach(q => {
        if (q.category) {
          categorySet.add(q.category)
        }
      })
      
      // Обновляем список категорий
      const defaultCategories = ['Карьера', 'Личность', 'Навыки', 'Интересы']
      const uniqueCategories = Array.from(categorySet)
      categories.value = [...new Set([...defaultCategories, ...uniqueCategories])].sort()
      
      // Добавляем опцию "Другое" в конец списка
      if (!categories.value.includes('Другое')) {
        categories.value.push('Другое')
      }
    } else {
      console.error('Ошибка загрузки вопросов: данные не получены')
    }
  } catch (error) {
    console.error('Ошибка загрузки вопросов:', error)
  } finally {
    isLoading.value = false
  }
}

// Редактирование вопроса
const editQuestion = (question) => {
  questionForm.id = question.id
  questionForm.question = question.question
  questionForm.category = question.category
  questionForm.customCategory = ''
  
  // Обрабатываем опции
  const options = parseOptions(question.options)
  questionForm.options = Array.isArray(options) && options.length ? options : ['', '']
  
  // Инициализируем веса ответов 
  try {
    // Попытка получить существующие веса из вопроса, если они есть
    const questionWeights = question.weights ? JSON.parse(question.weights) : null
    
    if (questionWeights && Array.isArray(questionWeights) && questionWeights.length === questionForm.options.length) {
      // Используем существующие веса
      questionForm.weights = questionWeights
    } else {
      // Если весов нет или данные не соответствуют, инициализируем нулевыми значениями
      questionForm.weights = questionForm.options.map(() => {
        const optionWeights = {}
        questionForm.results.forEach(result => {
          optionWeights[result.id] = 0
        })
        return optionWeights
      })
    }
  } catch (error) {
    console.error('Ошибка при обработке весов вопроса:', error)
    // В случае ошибки инициализируем нулевыми значениями
    questionForm.weights = questionForm.options.map(() => {
      const optionWeights = {}
      questionForm.results.forEach(result => {
        optionWeights[result.id] = 0
      })
      return optionWeights
    })
  }
  
  openEditModal.value = true
}

// Добавление варианта ответа
const addOption = () => {
  questionForm.options.push('')
  
  // Добавляем веса для нового варианта
  const newOptionWeights = {}
  questionForm.results.forEach(result => {
    newOptionWeights[result.id] = 0
  })
  questionForm.weights.push(newOptionWeights)
}

// Удаление варианта ответа
const removeOption = (index) => {
  if (questionForm.options.length <= 2) return
  
  questionForm.options.splice(index, 1)
  questionForm.weights.splice(index, 1)
}

// Сохранение изменений вопроса
const updateQuestion = async () => {
  try {
    // Проверка минимального количества вариантов
    if (questionForm.options.length < 2) {
      alert('Добавьте минимум 2 варианта ответа')
      return
    }
    
    // Проверка заполненности вариантов
    if (questionForm.options.some(option => !option.trim())) {
      alert('Заполните все варианты ответов')
      return
    }
    
    // Проверка категории
    let finalCategory = questionForm.category
    if (finalCategory === 'Другое' && questionForm.customCategory.trim()) {
      finalCategory = questionForm.customCategory.trim()
    } else if (!finalCategory) {
      alert('Выберите категорию вопроса')
      return
    }
    
    if (!process.client) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    // Подготовка данных для обновления
    const updateData = {
      question: questionForm.question,
      category: finalCategory,
      options: questionForm.options,
      weights: JSON.stringify(questionForm.weights)
    }
    
    // Используем новое API
    const response = await $fetch(`/api/test-api/questions/${questionForm.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })
    
    if (response && response.statusCode === 200) {
      await loadQuestions()
      openEditModal.value = false
    } else {
      alert('Ошибка обновления вопроса')
    }
  } catch (error) {
    console.error('Ошибка обновления вопроса:', error)
    alert('Ошибка обновления вопроса')
  }
}

// Подтверждение удаления
const confirmDelete = (question) => {
  questionToDelete.value = question
  openDeleteModal.value = true
}

// Удаление вопроса
const deleteQuestion = async () => {
  try {
    if (!process.client) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    // Используем новое API
    const response = await $fetch(`/api/test-api/questions/${questionToDelete.value.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response && response.statusCode === 200) {
      questions.value = questions.value.filter(q => q.id !== questionToDelete.value.id)
      searchQuestions() // Обновляем отфильтрованный список
      openDeleteModal.value = false
    } else {
      alert('Ошибка удаления вопроса')
    }
  } catch (error) {
    console.error('Ошибка удаления вопроса:', error)
    alert('Ошибка удаления вопроса')
  }
}

// Добавление вопроса
const addQuestion = async () => {
  try {
    // Проверка минимального количества вариантов
    if (questionForm.options.length < 2) {
      alert('Добавьте минимум 2 варианта ответа')
      return
    }
    
    // Проверка заполненности вариантов
    if (questionForm.options.some(option => !option.trim())) {
      alert('Заполните все варианты ответов')
      return
    }
    
    // Проверка категории
    let finalCategory = questionForm.category
    if (finalCategory === 'Другое' && questionForm.customCategory.trim()) {
      finalCategory = questionForm.customCategory.trim()
    } else if (!finalCategory) {
      alert('Выберите категорию вопроса')
      return
    }
    
    if (!process.client) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    // Подготовка данных для создания
    const newQuestionData = {
      question: questionForm.question,
      category: finalCategory,
      options: questionForm.options,
      weights: JSON.stringify(questionForm.weights)
    }
    
    // Используем новое API
    const response = await $fetch('/api/test-api/questions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newQuestionData)
    })
    
    if (response && response.statusCode === 201) {
      await loadQuestions()
      resetForm()
      openAddModal.value = false
    } else {
      alert('Ошибка добавления вопроса')
    }
  } catch (error) {
    console.error('Ошибка добавления вопроса:', error)
    alert('Ошибка добавления вопроса')
  }
}

// Инициализация данных при монтировании
onMounted(() => {
  loadQuestions()
  initWeights()
})

// Заголовок страницы
useHead({
  title: 'Управление вопросами теста - Админ-панель'
})
</script> 