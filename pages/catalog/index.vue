<template>
  <div>
    <h1 class="text-h2 mb-8">Каталог учебных заведений</h1>
    
    <!-- Фильтры и поиск -->
    <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Поиск</label>
          <input
            id="search"
            v-model="filters.search"
            type="text"
            class="input"
            placeholder="Название, адрес..."
          />
        </div>
        
        <div>
          <label for="city" class="block text-sm font-medium text-gray-700 mb-1">Город</label>
          <select
            id="city"
            v-model="filters.city"
            class="input"
          >
            <option value="">Все города</option>
            <option v-for="city in cities" :key="city" :value="city">{{ city }}</option>
          </select>
        </div>
        
        <div>
          <label for="program" class="block text-sm font-medium text-gray-700 mb-1">Направление</label>
          <select
            id="program"
            v-model="filters.program"
            class="input"
          >
            <option value="">Все направления</option>
            <option v-for="program in programs" :key="program" :value="program">{{ program }}</option>
          </select>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
        <button @click="resetFilters" class="btn btn-secondary order-2 sm:order-1">
          Сбросить фильтры
        </button>
        <button @click="applyFilters" class="btn btn-primary order-1 sm:order-2">
          Применить
        </button>
      </div>
    </div>
    
    <!-- Результаты -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
      <p class="mt-2 text-gray-500">Загрузка...</p>
    </div>
    
    <div v-else-if="filteredSchools.length === 0" class="text-center py-12">
      <p class="text-gray-500">Учебные заведения не найдены. Попробуйте изменить параметры фильтрации.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <div v-for="school in filteredSchools" :key="school.id" class="card hover:shadow-lg transition-shadow">
        <div class="h-40 sm:h-48 bg-gray-200 rounded-t-lg overflow-hidden relative">
          <ImageLoader
            :src="school.logoUrl"
            :alt="school.name"
            placeholder-type="school-logo"
            :name="school.name"
            class="absolute inset-0"
          />
        </div>
        
        <div class="p-3 sm:p-4">
          <h2 class="text-lg sm:text-xl font-semibold mb-2 line-clamp-2">{{ school.name }}</h2>
          
          <!-- Блок с оценкой -->
          <div v-if="school.averageRating" class="flex items-center mb-2">
            <div class="flex items-center bg-ashleigh bg-opacity-10 text-ashleigh px-2 py-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span class="font-medium">{{ school.averageRating }}</span>
              <span class="text-sm text-gray-600 ml-1">({{ school.reviewCount }})</span>
            </div>
          </div>
          
          <p class="text-gray-600 mb-3 sm:mb-4 line-clamp-2 text-sm sm:text-base">{{ school.description }}</p>
          
          <div class="flex items-start text-gray-500 mb-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span class="line-clamp-2">{{ school.address }}</span>
          </div>
          
          <div class="flex items-center text-gray-500 mb-4 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>{{ school._count?.programs || 0 }} направлений обучения</span>
          </div>
          
          <div class="flex justify-between items-center">
            <NuxtLink :to="`/catalog/${school.id}`" class="btn btn-primary flex-grow mr-2 text-center text-sm sm:text-base">
              Подробнее
            </NuxtLink>
            
            <button 
              @click.prevent="toggleSaveSchool(school)" 
              class="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
              :class="{ 'text-red-500': isSaved(school.id) }"
              :title="isSaved(school.id) ? 'Удалить из сохраненных' : 'Сохранить'"
              aria-label="Сохранить учебное заведение"
            >
              <svg class="w-6 h-6" :fill="isSaved(school.id) ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ImageLoader from '~/components/ImageLoader.vue'

definePageMeta({
  layout: 'default'
})

const schools = ref([])
const isLoading = ref(true)
const cities = ref([])
const programs = ref([])
const token = ref(null)

const filters = reactive({
  search: '',
  city: '',
  program: ''
})

// Используем composable для управления сохраненными школами
const { 
  savedSchoolsIds, 
  loadSavedSchools, 
  isSchoolSaved, 
  toggleSaveSchool: toggleSaveSchoolAction 
} = useSavedSchools()

// Переадресация вызова в composable
const toggleSaveSchool = (school) => {
  toggleSaveSchoolAction(school.id)
}

// Извлекаем инициалы из названия для плейсхолдера изображения
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Получаем список городов из адресов школ
const extractCities = (schools) => {
  const citiesSet = new Set()
  
  schools.forEach(school => {
    if (school.address) {
    // Предполагаем, что город указан в начале адреса до запятой
    const cityMatch = school.address.match(/^([^,]+)/)
    if (cityMatch && cityMatch[1]) {
      citiesSet.add(cityMatch[1].trim())
      }
    }
  })
  
  return Array.from(citiesSet).sort()
}

// Получаем список направлений из программ всех школ
const extractPrograms = async () => {
  const programsSet = new Set()
  
  // Так как у нас нет массива программ, давайте получим данные из другой функции запроса
  try {
    // Если направления не получены, показываем пустой массив
    const response = await fetch('/api/programs')
    const data = await response.json()
    
    if (data && data.body) {
      data.body.forEach(program => {
        if (program && program.name) {
      programsSet.add(program.name)
        }
  })
      // Обновить ref массив
      programs.value = Array.from(programsSet).sort()
    }
  } catch (error) {
    console.error('Ошибка при загрузке направлений обучения:', error)
  }
  
  return programs.value
}

// Получаем отфильтрованный список школ
const filteredSchools = computed(() => {
  let result = [...schools.value]
  
  // Поиск по тексту
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    result = result.filter(school => 
      (school.name && school.name.toLowerCase().includes(searchTerm)) ||
      (school.description && school.description.toLowerCase().includes(searchTerm)) ||
      (school.address && school.address.toLowerCase().includes(searchTerm))
    )
  }
  
  // Фильтр по городу
  if (filters.city) {
    result = result.filter(school => 
      school.address && school.address.startsWith(filters.city)
    )
  }
  
  // Фильтр по направлению (временно отключаем, пока не загрузим программы)
  if (filters.program) {
    // Здесь будет реализована фильтрация по программе, когда у нас будут загружены полные данные
    console.log('Фильтрация по программе:', filters.program)
    // В этом месте мы можем либо сделать отдельный запрос для фильтрации по программам,
    // либо использовать предварительно загруженный список школ с определенным направлением
  }
  
  return result
})

// Обновляем отображение, проверяя, сохранена ли школа
const isSaved = (schoolId) => {
  return isSchoolSaved(schoolId)
}

// Сброс фильтров
const resetFilters = () => {
  filters.search = ''
  filters.city = ''
  filters.program = ''
}

// Применение фильтров (можно использовать для дополнительной логики)
const applyFilters = () => {
  // Дополнительная логика при необходимости
}

// Загрузка данных при монтировании компонента
onMounted(async () => {
  try {
    // Получаем токен пользователя
    if (process.client) {
      token.value = localStorage.getItem('token')
    }

    // Загружаем школы
    isLoading.value = true
    
    const response = await fetch('/api/schools')
    const data = await response.json()
    
    if (data && data.body) {
      schools.value = data.body || []
      
      // Проверяем, что школы есть и они не пустые
      if (schools.value && schools.value.length > 0) {
        cities.value = extractCities(schools.value)
        // programs.value загружается в функции extractPrograms через отдельный запрос
        
        // Загружаем сохраненные школы если пользователь авторизован
        if (token.value) {
          await loadSavedSchools()
        }
      } else {
        console.warn('Получен пустой список школ')
        schools.value = []
        cities.value = []
        programs.value = []
      }
    } else {
      console.error('Неверный формат данных:', data)
      schools.value = []
      cities.value = []
      programs.value = []
    }
    
    // Запускаем извлечение программ (это сделает запрос и заполнит programs.value)
    try {
      await extractPrograms()
    } catch (err) {
      console.error('Ошибка при загрузке программ:', err)
    }
    
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    schools.value = []
    cities.value = []
    programs.value = []
  } finally {
    isLoading.value = false
  }
})

useHead({
  title: 'Каталог учебных заведений - Платформа для абитуриентов'
})
</script> 