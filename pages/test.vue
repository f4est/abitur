<template>
  <div>
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h1 class="text-3xl font-bold mb-4">Тест на профориентацию</h1>
      <p class="text-gray-700 mb-6">
        Пройдите тест, чтобы определить свои предпочтения и получить рекомендации по выбору профессии и учебного заведения.
        Тест займет около 10-15 минут.
      </p>

      <!-- Отображаем сообщение, если пользователь не авторизован -->
      <div v-if="!isAuthenticated" class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <h2 class="text-xl font-semibold text-yellow-800 mb-4">Требуется авторизация</h2>
        <p class="mb-4">Для прохождения теста необходимо войти в систему или зарегистрироваться.</p>
        <div class="flex justify-center space-x-4">
          <NuxtLink to="/login" class="btn btn-primary">
            Войти
          </NuxtLink>
          <NuxtLink to="/register" class="btn btn-secondary">
            Зарегистрироваться
          </NuxtLink>
        </div>
      </div>
      
      <div v-else-if="isComplete" class="bg-green-50 border border-green-200 rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-green-800 mb-4">Тест пройден!</h2>
        <p class="mb-4">Ваши результаты сохранены. Вы можете просмотреть их в личном кабинете.</p>
        <div class="flex space-x-4">
          <NuxtLink to="/profile" class="btn btn-primary">
            Перейти в личный кабинет
          </NuxtLink>
          <button @click="resetTest" class="btn btn-secondary">
            Пройти тест заново
          </button>
        </div>
      </div>
      
      <div v-else-if="isLoading" class="text-center py-12">
        <p class="text-gray-500">Загрузка вопросов...</p>
      </div>
      
      <div v-else-if="!isStarted" class="text-center">
        <button @click="startTest" class="btn btn-primary text-lg px-8 py-3">
          Начать тест
        </button>
      </div>
      
      <div v-else>
        <!-- Прогресс -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-600">Вопрос {{ currentQuestionIndex + 1 }} из {{ questions.length }}</span>
            <span class="text-sm text-gray-600">{{ Math.round(progress) }}%</span>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full">
            <div 
              class="h-full bg-ashleigh-blue rounded-full transition-all duration-300"
              :style="{ width: `${progress}%` }"
            ></div>
          </div>
        </div>
        
        <!-- Текущий вопрос -->
        <div v-if="currentQuestion" class="mb-8">
          <h2 class="text-xl font-semibold mb-4">{{ currentQuestion.question }}</h2>
          
          <div class="space-y-3">
            <div 
              v-for="(option, index) in currentQuestionOptions" 
              :key="index"
              class="border rounded-lg p-4 cursor-pointer transition-colors"
              :class="selectedOption === index ? 'border-ashleigh-blue bg-ashleigh-blue/10' : 'border-gray-200 hover:border-ashleigh-blue/50'"
              @click="selectOption(index)"
            >
              <label class="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  :name="'question-' + currentQuestionIndex"
                  :value="index"
                  v-model="selectedOption"
                  class="mr-3"
                />
                <span>{{ option.text }}</span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- Кнопки навигации -->
        <div class="flex justify-between">
          <button 
            v-if="currentQuestionIndex > 0"
            @click="prevQuestion" 
            class="btn btn-secondary"
          >
            Назад
          </button>
          <div v-else></div>
          
          <button 
            @click="nextQuestion" 
            class="btn btn-primary"
            :disabled="selectedOption === null"
          >
            {{ currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Далее' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Добавляем middleware для защиты страницы
definePageMeta({
  middleware: 'auth'
})

const questions = ref([])
const isLoading = ref(true)
const isStarted = ref(false)
const isComplete = ref(false)
const currentQuestionIndex = ref(0)
const selectedOption = ref(null)
const answers = ref([])
const isAuthenticated = ref(false)

// Проверка аутентификации при загрузке
onMounted(() => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (token && user) {
    isAuthenticated.value = true
    loadQuestions()
  } else {
    isLoading.value = false
  }
})

// Вычисляем прогресс прохождения теста
const progress = computed(() => {
  if (questions.value.length === 0) return 0
  return (currentQuestionIndex.value / questions.value.length) * 100
})

// Получаем текущий вопрос
const currentQuestion = computed(() => {
  if (!questions.value.length || currentQuestionIndex.value >= questions.value.length) return null
  return questions.value[currentQuestionIndex.value]
})

// Парсим варианты ответов текущего вопроса
const currentQuestionOptions = computed(() => {
  if (!currentQuestion.value) return []
  
  try {
    // Пытаемся распарсить JSON строку с вариантами ответов
    return typeof currentQuestion.value.options === 'string' 
      ? JSON.parse(currentQuestion.value.options) 
      : currentQuestion.value.options
  } catch (error) {
    console.error('Ошибка парсинга вариантов ответов:', error)
    return []
  }
})

// Загрузка вопросов
const loadQuestions = async () => {
  isLoading.value = true
  
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      isAuthenticated.value = false
      isLoading.value = false
      return
    }
    
    const response = await fetch('/api/test-api/questions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      questions.value = data.body || []
      
      // Инициализация массива ответов
      answers.value = new Array(questions.value.length).fill(null)
    } else if (response.status === 401) {
      isAuthenticated.value = false
    } else {
      console.error('Ошибка загрузки вопросов')
    }
  } catch (error) {
    console.error('Ошибка загрузки вопросов:', error)
  } finally {
    isLoading.value = false
  }
}

// Начать тест
const startTest = () => {
  if (!isAuthenticated.value) return
  
  isStarted.value = true
  currentQuestionIndex.value = 0
  selectedOption.value = null
}

// Сброс теста
const resetTest = () => {
  if (!isAuthenticated.value) return
  
  isComplete.value = false
  isStarted.value = false
  currentQuestionIndex.value = 0
  selectedOption.value = null
  answers.value = new Array(questions.value.length).fill(null)
}

// Выбор варианта ответа
const selectOption = (index) => {
  selectedOption.value = index
}

// Переход к предыдущему вопросу
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedOption.value = answers.value[currentQuestionIndex.value]
  }
}

// Переход к следующему вопросу или завершение теста
const nextQuestion = async () => {
  if (selectedOption.value !== null) {
    // Сохраняем ответ
    answers.value[currentQuestionIndex.value] = selectedOption.value
    
    if (currentQuestionIndex.value < questions.value.length - 1) {
      // Переход к следующему вопросу
      currentQuestionIndex.value++
      selectedOption.value = answers.value[currentQuestionIndex.value]
    } else {
      // Завершение теста
      await completeTest()
    }
  }
}

// Завершение теста и сохранение результатов
const completeTest = async () => {
  const token = localStorage.getItem('token')
  
  if (!token || !isAuthenticated.value) {
    console.error('Пользователь не авторизован')
    return
  }
  
  // Формируем результаты теста
  const categories = {}
  
  questions.value.forEach((question, index) => {
    const category = question.category
    const option = currentQuestionOptions.value[answers.value[index]]
    
    if (!categories[category]) {
      categories[category] = 0
    }
    
    categories[category] += option.value || 1
  })
  
  try {
    const response = await fetch('/api/test-api/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        results: JSON.stringify({
          answers: answers.value,
          categories
        })
      })
    })
    
    if (!response.ok) {
      console.error('Ошибка сохранения результатов теста')
    }
  } catch (error) {
    console.error('Ошибка сохранения результатов теста:', error)
  }
  
  isComplete.value = true
}

useHead({
  title: 'Тест на профориентацию - Платформа для абитуриентов'
})
</script> 