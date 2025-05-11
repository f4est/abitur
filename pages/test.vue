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
              class="h-full bg-ashleigh rounded-full transition-all duration-300"
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
              :class="selectedOption === index ? 'border-ashleigh bg-ashleigh/10' : 'border-gray-200 hover:border-ashleigh/50'"
              @click="selectOption(index)"
            >
              <label class="flex items-center cursor-pointer w-full">
                <input 
                  type="radio" 
                  :name="'question-' + currentQuestionIndex"
                  :value="index"
                  v-model="selectedOption"
                  class="mr-3"
                />
                <span v-if="option && option.text" class="text-gray-800">{{ option.text }}</span>
                <span v-else class="text-gray-800">Вариант ответа {{ index + 1 }}</span>
              </label>
            </div>
          </div>

          <!-- Дебаг-информация для отладки - скрыта в продакшене -->
          <div v-if="false" class="mt-4 p-4 bg-gray-100 rounded text-xs">
            <pre>{{ JSON.stringify(currentQuestionOptions, null, 2) }}</pre>
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
definePageMeta({
  layout: 'default',
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

// Ручная обработка вариантов ответов
const ensureOptionsFormat = (question) => {
  if (!question) return [];
  
  try {
    let opts = question.options;
    
    // Если options - строка, попытаемся распарсить
    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts);
      } catch (e) {
        console.error('Ошибка парсинга строки options:', e);
        return [];
      }
    }
    
    // Проверяем, является ли результат массивом
    if (!Array.isArray(opts)) {
      console.error('options не является массивом:', opts);
      return [];
    }
    
    // Проверяем формат каждого варианта ответа
    return opts.map((option, idx) => {
      // Базовый объект ответа
      const cleanOption = { value: idx + 1 };
      
      // Если option не является объектом, преобразуем его
      if (typeof option !== 'object' || option === null) {
        cleanOption.text = typeof option === 'string' ? option : `Вариант ${idx + 1}`;
        return cleanOption;
      }
      
      // Обрабатываем текст
      if (typeof option.text === 'string') {
        cleanOption.text = option.text;
      } else {
        // Проверяем на наличие числовых ключей (неправильный формат)
        if (Object.keys(option).some(k => !isNaN(parseInt(k)))) {
          cleanOption.text = `Вариант ${idx + 1}`;
        } else {
          cleanOption.text = `Вариант ${idx + 1}`;
        }
      }
      
      // Обрабатываем значение
      if (typeof option.value === 'number') {
        cleanOption.value = option.value;
      }
      
      return cleanOption;
    });
  } catch (e) {
    console.error('Ошибка обработки вариантов ответов:', e);
    return [];
  }
}

// Парсим варианты ответов текущего вопроса
const currentQuestionOptions = computed(() => {
  if (!currentQuestion.value) return [];
  return ensureOptionsFormat(currentQuestion.value);
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
      const receivedQuestions = data.body || []
      
      // Обрабатываем каждый вопрос, чтобы убедиться в правильности формата
      questions.value = receivedQuestions.map(q => ({
        ...q,
        options: ensureOptionsFormat(q)
      }))
      
      // Вывод в консоль для отладки структуры вопросов и ответов
      console.log("Загруженные вопросы:", questions.value)
      if (questions.value.length > 0) {
        console.log("Первый вопрос:", questions.value[0].question)
        console.log("Варианты ответов:", currentQuestionOptions.value)
      }
      
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
  
  // Для каждого вопроса
  questions.value.forEach((question, qIndex) => {
    const category = question.category || 'general'
    const selectedOptionIndex = answers.value[qIndex]
    
    // Пропускаем, если на вопрос не был дан ответ
    if (selectedOptionIndex === null || selectedOptionIndex === undefined) {
      return
    }
    
    // Получаем опции текущего вопроса
    const options = ensureOptionsFormat(question)
    const selectedOption = options[selectedOptionIndex]
    
    // Инициализируем категорию, если она еще не определена
    if (!categories[category]) {
      categories[category] = 0
    }
    
    // Увеличиваем значение категории на основе выбранного варианта
    if (selectedOption && typeof selectedOption.value === 'number') {
      categories[category] += selectedOption.value
    } else {
      categories[category] += 1 // Если value не определено, используем 1
    }
  })
  
  // Анализируем результаты и формируем рекомендации
  let maxCategory = '';
  let maxValue = 0;
  
  for (const [category, value] of Object.entries(categories)) {
    if (value > maxValue) {
      maxValue = value;
      maxCategory = category;
    }
  }
  
  // Формируем рекомендации на основе наибольшей категории
  let recommendations = '';
  
  switch (maxCategory) {
    case 'Навыки':
      recommendations = 'На основе ваших ответов, рекомендуем рассмотреть профессии, связанные с практическими навыками. Вам могут подойти технические специальности, инженерные направления или прикладные профессии.\n\nРекомендуемые профессии: инженер, программист, техник, специалист по автоматизации, механик, электрик, архитектор.\n\nРекомендуемые направления: Информационные технологии, Инженерия, Автоматизация, Техническое обслуживание, Строительство.';
      break;
    case 'Интересы':
      recommendations = 'Судя по вашим ответам, вы проявляете интерес к саморазвитию и исследованиям. Обратите внимание на научные направления, аналитические профессии или специальности, связанные с творческой реализацией.\n\nРекомендуемые профессии: научный сотрудник, исследователь, журналист, аналитик данных, писатель, дизайнер.\n\nРекомендуемые направления: Научные исследования, Аналитика, Творческие индустрии, Медиа, Издательское дело.';
      break;
    case 'Карьера':
      recommendations = 'Ваши ответы указывают на интерес к карьерному росту и достижениям. Рекомендуем рассмотреть управленческие специальности, бизнес-направления или профессии с четкой карьерной траекторией.\n\nРекомендуемые профессии: менеджер проектов, бизнес-аналитик, маркетолог, финансовый аналитик, предприниматель, руководитель отдела.\n\nРекомендуемые направления: Бизнес и управление, Финансы, Маркетинг, Экономика, Предпринимательство.';
      break;
    case 'Личность':
      recommendations = 'Основываясь на ваших ответах, вам могут подойти профессии, связанные с межличностным взаимодействием. Обратите внимание на специальности в сфере психологии, социальной работы или образования.\n\nРекомендуемые профессии: психолог, педагог, социальный работник, HR-специалист, консультант, тренер, специалист по коммуникациям.\n\nРекомендуемые направления: Психология, Образование, Социальная работа, Управление персоналом, Сфера услуг.';
      break;
    case 'technical':
      recommendations = 'Ваши ответы показывают сильные технические наклонности. Вам подойдут профессии, требующие аналитического и инженерного мышления.\n\nРекомендуемые профессии: инженер-программист, разработчик ПО, системный администратор, инженер-конструктор, робототехник.\n\nРекомендуемые направления: Программирование, Информатика и ИТ, Робототехника, Электроника, Инженерия.';
      break;
    case 'analytical':
      recommendations = 'У вас ярко выражены аналитические способности. Рекомендуем профессии, связанные с анализом данных и решением сложных задач.\n\nРекомендуемые профессии: аналитик данных, финансовый аналитик, исследователь, математик, статистик, актуарий.\n\nРекомендуемые направления: Анализ данных, Финансовый анализ, Математика, Статистика, Экономика.';
      break;
    case 'humanities':
      recommendations = 'Ваши результаты указывают на сильную склонность к гуманитарным наукам. Рассмотрите профессии, связанные с языками, культурой и обществом.\n\nРекомендуемые профессии: преподаватель, историк, журналист, писатель, филолог, культуролог, редактор.\n\nРекомендуемые направления: Филология, История, Журналистика, Культурология, Искусствоведение.';
      break;
    case 'linguistics':
      recommendations = 'У вас отличные лингвистические способности. Обратите внимание на профессии, связанные с языками и коммуникацией.\n\nРекомендуемые профессии: переводчик, лингвист, копирайтер, преподаватель языков, редактор, специалист по межкультурной коммуникации.\n\nРекомендуемые направления: Лингвистика, Перевод и переводоведение, Межкультурная коммуникация, Филология, Копирайтинг.';
      break;
    case 'arts':
      recommendations = 'Ваши результаты показывают творческие наклонности. Рассмотрите карьеру в сфере искусства и дизайна.\n\nРекомендуемые профессии: дизайнер, художник, архитектор, фотограф, режиссер, музыкант, графический дизайнер.\n\nРекомендуемые направления: Дизайн, Искусство, Архитектура, Мультимедиа, Фотография, Кинематограф.';
      break;
    case 'science':
      recommendations = 'У вас ярко выражен интерес к естественным наукам. Рекомендуем карьеру в научно-исследовательской сфере.\n\nРекомендуемые профессии: ученый-исследователь, биолог, химик, физик, эколог, лаборант, инженер-исследователь.\n\nРекомендуемые направления: Физика, Химия, Биология, Экология, Науки о Земле, Биотехнологии.';
      break;
    case 'business':
      recommendations = 'Ваши результаты указывают на бизнес-ориентированность. Рассмотрите карьеру в деловой сфере.\n\nРекомендуемые профессии: бизнес-аналитик, менеджер, маркетолог, финансист, предприниматель, консультант по бизнесу.\n\nРекомендуемые направления: Менеджмент, Экономика, Маркетинг, Финансы, Предпринимательство, Бизнес-информатика.';
      break;
    case 'medicine':
      recommendations = 'Ваши результаты показывают склонность к медицине и здравоохранению. Рассмотрите карьеру в этой сфере.\n\nРекомендуемые профессии: врач, медсестра, фармацевт, биотехнолог, психолог, эпидемиолог, специалист по реабилитации.\n\nРекомендуемые направления: Медицина, Фармацевтика, Биомедицина, Сестринское дело, Реабилитология, Психология здоровья.';
      break;
    default:
      recommendations = 'На основе ваших ответов, рекомендуем обратить внимание на разнообразные специальности и направления. Для более точных рекомендаций, рассмотрите посещение профессионального консультанта по карьере.\n\nРекомендуемые направления: Информационные технологии, Гуманитарные науки, Инженерия, Искусство, Бизнес, Медицина, Юриспруденция.';
  }
  
  console.log('Финальные результаты теста:', {categories, maxCategory, recommendations});
  
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
          categories,
          recommendations,
          timestamp: new Date().toISOString()
        })
      })
    })
    
    if (!response.ok) {
      console.error('Ошибка сохранения результатов теста')
    } else {
      console.log('Результаты теста успешно сохранены')
      
      // Обновляем localStorage чтобы результаты сразу отобразились
      try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        if (userData && userData.id) {
          // Если нет массива результатов, создаем его
          if (!userData.testResults) {
            userData.testResults = []
          }
          
          // Добавляем новый результат
          userData.testResults.unshift({
            id: Date.now(), // Временный ID до обновления страницы
            results: JSON.stringify({
              answers: answers.value,
              categories,
              recommendations
            }),
            createdAt: new Date().toISOString()
          })
          
          // Обновляем в localStorage
          localStorage.setItem('user', JSON.stringify(userData))
        }
      } catch (e) {
        console.error('Ошибка обновления localStorage:', e)
      }
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

<style scoped>
.btn-primary {
  @apply bg-ashleigh text-white hover:bg-ashleigh/80;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
}
</style> 