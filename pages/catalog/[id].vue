<template>
  <div>
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Загрузка...</p>
    </div>
    
    <div v-else-if="!school" class="text-center py-12">
      <p class="text-gray-500">Учебное заведение не найдено.</p>
      <NuxtLink to="/catalog" class="btn btn-primary mt-4">
        Вернуться к каталогу
      </NuxtLink>
    </div>
    
    <div v-else>
      <!-- Заголовок и основная информация -->
      <div class="flex flex-col md:flex-row gap-4 sm:gap-6 mb-4 sm:mb-8">
        <div class="md:w-1/4">
          <div class="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-48 md:h-64">
            <img
              v-if="school.logoUrl"
              :src="school.logoUrl"
              :alt="school.name"
              class="max-w-full max-h-full object-contain"
            />
            <div v-else class="flex items-center justify-center h-full w-full bg-skyway text-white">
              <img src="/images/placeholders-png/school-logo.png" alt="Логотип" class="max-w-full max-h-full" />
            </div>
          </div>
        </div>
        
        <div class="md:w-3/4">
          <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h1 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">{{ school.name }}</h1>
            
            <div class="flex items-start text-gray-600 mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-sm sm:text-base">{{ school.address }}</span>
            </div>
            
            <div class="flex flex-wrap gap-2 sm:gap-4 mb-4">
              <a
                v-if="school.websiteUrl"
                :href="school.websiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="btn btn-primary text-sm sm:text-base"
              >
                Официальный сайт
              </a>
              
              <button
                @click="toggleSaveSchool"
                class="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-100 transition-colors"
                :class="{ 'text-red-500': isSaved }"
                :title="isSaved ? 'Удалить из сохраненных' : 'Сохранить'"
                aria-label="Сохранить учебное заведение"
              >
                <svg class="w-7 h-7" :fill="isSaved ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            <div class="border-t pt-3 sm:pt-4">
              <h2 class="text-lg sm:text-xl font-semibold mb-2">Контакты</h2>
              <p class="text-sm sm:text-base">{{ school.contacts }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Фотогалерея -->
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
        <h2 class="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4">Фотографии</h2>
        
        <div v-if="!school.photos || school.photos.length === 0" class="bg-gray-100 rounded-lg p-4 sm:p-8 text-center">
          <p class="text-gray-500">Фотографии отсутствуют</p>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            v-for="photo in school.photos"
            :key="photo.id"
            class="h-40 sm:h-48 bg-gray-200 rounded-lg overflow-hidden group relative cursor-pointer"
            @click="openGallery(photo.url || '/images/placeholders-png/school-photo.png', photo.description)"
          >
            <img
              :src="photo.url || '/images/placeholders-png/school-photo.png'"
              :alt="photo.description || school.name"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
              <div v-if="photo.description" class="bg-black/70 text-white w-full py-2 px-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-sm">
                {{ photo.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно для просмотра фотографий -->
      <div v-if="galleryOpen" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
        <div class="relative w-full h-full flex flex-col">
          <!-- Верхняя панель -->
          <div class="flex justify-between items-center p-4 text-white">
            <div class="text-lg">
              {{ currentImageIndex + 1 }} из {{ school.photos.length }}
            </div>
            <button @click="closeGallery" class="text-white hover:text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Основное изображение -->
          <div class="flex-grow flex items-center justify-center p-4">
            <img 
              :src="currentImage" 
              :alt="currentDescription" 
              class="max-h-full max-w-full object-contain"
            />
          </div>
          
          <!-- Нижняя панель с описанием и навигацией -->
          <div class="p-4 text-white">
            <div v-if="currentDescription" class="text-center mb-4 text-lg">
              {{ currentDescription }}
            </div>
            
            <div class="flex justify-center gap-4">
              <button 
                @click="prevImage" 
                class="bg-white/20 hover:bg-white/40 p-2 rounded-full"
                :disabled="currentImageIndex === 0"
                :class="{ 'opacity-50 cursor-not-allowed': currentImageIndex === 0 }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button 
                @click="nextImage" 
                class="bg-white/20 hover:bg-white/40 p-2 rounded-full"
                :disabled="currentImageIndex === school.photos.length - 1"
                :class="{ 'opacity-50 cursor-not-allowed': currentImageIndex === school.photos.length - 1 }"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Описание -->
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
        <h2 class="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4">Описание</h2>
        <p class="whitespace-pre-wrap text-sm sm:text-base">{{ school.description }}</p>
      </div>
      
      <!-- Карта -->
      <SchoolMap :address="school.address" :schoolName="school.name" />
      
      <!-- Отзывы из 2GIS -->
      <ExternalReviews :schoolId="school.id" :schoolName="school.name" :schoolAddress="school.address" />
      
      <!-- Направления обучения -->
      <div class="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
        <h2 class="text-lg sm:text-2xl font-semibold mb-2 sm:mb-4">Направления обучения</h2>
        
        <div v-if="!school.programs || school.programs.length === 0" class="bg-gray-100 rounded-lg p-4 sm:p-8 text-center">
          <p class="text-gray-500">Информация о направлениях обучения отсутствует</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
            <thead>
              <tr>
                <th class="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Название
                </th>
                <th class="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Код
                </th>
                <th class="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Срок обучения
                </th>
                <th class="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Стоимость
                </th>
                <th class="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Экзамены
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="program in school.programs" :key="program.id">
                <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-normal">
                  <div class="font-medium text-gray-900">{{ program.name }}</div>
                  <div class="text-xs sm:text-sm text-gray-500 line-clamp-2">{{ program.description }}</div>
                </td>
                <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {{ program.code || '—' }}
                </td>
                <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ program.duration }}
                </td>
                <td class="px-2 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ program.price ? `${program.price.toLocaleString()} ₸` : 'По запросу' }}
                </td>
                <td class="px-2 sm:px-6 py-2 sm:py-4 text-sm text-gray-500 hidden md:table-cell">
                  <ul v-if="program.examRequirements && program.examRequirements.length > 0" class="list-disc pl-5">
                    <li v-for="exam in program.examRequirements" :key="exam.id">
                      {{ exam.examName }} {{ exam.minScore ? `(от ${exam.minScore} баллов)` : '' }}
                    </li>
                  </ul>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Карта -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-2xl font-semibold mb-4">Расположение</h2>
        
        <div id="map" class="h-80 rounded-lg">
          <!-- Здесь будет карта Яндекс -->
        </div>
        
        <!-- Редактор координат для администраторов -->
        <LocationEditor 
          v-if="user?.role === 'ADMIN'"
          :schoolId="schoolId"
          :coordinates="school.coordinates"
          :adminId="user.id"
          :mapInstance="mapInstance"
          @coordinates-updated="updateCoordinates"
        />
      </div>
      
      <!-- Отзывы -->
      <Reviews 
        :schoolId="schoolId" 
        :isAuthenticated="!!token" 
        :currentUser="user" 
        :isAdmin="user?.role === 'ADMIN'"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, navigateTo, useHead } from '#imports'
import LocationEditor from '~/components/LocationEditor.vue'
import SchoolMap from '~/components/SchoolMap.vue'
import ExternalReviews from '~/components/ExternalReviews.vue'

const route = useRoute()
const schoolId = parseInt(route.params.id)

const school = ref(null)
const isLoading = ref(true)
const isSaved = ref(false)
const token = ref(null)
const user = ref(null)
const mapInstance = ref(null)

// Состояние фотогалереи
const galleryOpen = ref(false)
const currentImageIndex = ref(0)
const currentImage = ref('')
const currentDescription = ref('')

// Извлекаем инициалы из названия для плейсхолдера изображения
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Форматирование даты
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

// Открытие галереи фотографий
const openGallery = (imageUrl, description) => {
  if (!school.value || !school.value.photos || school.value.photos.length === 0) return
  
  const index = school.value.photos.findIndex(p => p.url === imageUrl)
  currentImageIndex.value = index >= 0 ? index : 0
  currentImage.value = imageUrl
  currentDescription.value = description || ''
  galleryOpen.value = true
  
  // Блокируем скролл страницы
  document.body.style.overflow = 'hidden'
}

// Закрытие галереи
const closeGallery = () => {
  galleryOpen.value = false
  
  // Возвращаем скролл страницы
  document.body.style.overflow = ''
}

// Перейти к предыдущему изображению
const prevImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
    const photo = school.value.photos[currentImageIndex.value]
    currentImage.value = photo.url || '/images/placeholders-png/school-photo.png'
    currentDescription.value = photo.description || ''
  }
}

// Перейти к следующему изображению
const nextImage = () => {
  if (currentImageIndex.value < school.value.photos.length - 1) {
    currentImageIndex.value++
    const photo = school.value.photos[currentImageIndex.value]
    currentImage.value = photo.url || '/images/placeholders-png/school-photo.png'
    currentDescription.value = photo.description || ''
  }
}

// Обработка нажатия клавиш для управления галереей
const handleKeydown = (e) => {
  if (!galleryOpen.value) return
  
  switch (e.key) {
    case 'Escape':
      closeGallery()
      break
    case 'ArrowLeft':
      prevImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// Загрузка данных о текущем пользователе
const loadUserData = async () => {
  token.value = localStorage.getItem('token')
  if (!token.value) return
  
  try {
    const response = await fetch('/api/users/me')
    const data = await response.json()
    
    if (response.ok) {
      user.value = data.body
    }
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error)
  }
}

// Проверка, сохранено ли учебное заведение
const checkIfSaved = async () => {
  if (!user.value) return
  
  try {
    isSaved.value = user.value.savedSchools.some(saved => saved.schoolId === schoolId)
  } catch (error) {
    console.error('Ошибка проверки сохраненных учебных заведений:', error)
  }
}

// Сохранение/удаление учебного заведения
const toggleSaveSchool = async () => {
  if (!token.value) {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    navigateTo('/login')
    return
  }
  
  try {
    const url = `/api/schools/${schoolId}/save`
    const method = isSaved.value ? 'DELETE' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.ok) {
      isSaved.value = !isSaved.value
    } else {
      console.error('Ошибка при сохранении/удалении учебного заведения')
    }
  } catch (error) {
    console.error('Ошибка при сохранении/удалении учебного заведения:', error)
  }
}

// Обновление координат школы
const updateCoordinates = (newCoordinates) => {
  if (school.value) {
    school.value.coordinates = newCoordinates
    // Перезагрузка карты с новыми координатами
    initMap()
  }
}

// Инициализация карты Яндекс
const initMap = () => {
  // Проверяем, загружен ли API Яндекс.Карт и есть ли данные о школе
  if (window.ymaps && school.value) {
    // Инициализация карты после загрузки API
    ymaps.ready(() => {
      // Создание экземпляра карты с центром в Алматы по умолчанию
      const map = new ymaps.Map('map', {
        center: [43.238949, 76.889709], // Алматы по умолчанию
        zoom: 15
      })
      
      // Сохраняем экземпляр карты
      mapInstance.value = map
      
      // Если у школы есть сохраненные координаты, используем их
      if (school.value.coordinates) {
        try {
          // Координаты хранятся в формате "lat,lng"
          const [lat, lng] = school.value.coordinates.split(',').map(coord => parseFloat(coord.trim()))
          
          if (!isNaN(lat) && !isNaN(lng)) {
            const coords = [lat, lng]
            map.setCenter(coords)
            
            // Размещение метки на карте
            const placemark = new ymaps.Placemark(coords, {
              hintContent: school.value.name,
              balloonContent: `
                <strong>${school.value.name}</strong><br>
                ${school.value.address}<br>
                ${school.value.contacts}
              `
            }, {
              preset: 'islands#blueEducationIcon'
            })
            
            map.geoObjects.add(placemark)
            return // Если координаты успешно использованы, завершаем функцию
          }
        } catch (error) {
          console.error('Ошибка при обработке координат:', error)
          // Продолжаем выполнение, чтобы использовать геокодирование как запасной вариант
        }
      }
      
      // Если координаты не указаны или не удалось их использовать, пробуем геокодирование по адресу
      if (school.value.address) {
        const addressForGeocode = school.value.address
        
        ymaps.geocode(addressForGeocode).then(res => {
          const firstGeoObject = res.geoObjects.get(0)
          if (firstGeoObject) {
            const coords = firstGeoObject.geometry.getCoordinates()
            map.setCenter(coords)
            
            // Размещение метки
            const placemark = new ymaps.Placemark(coords, {
              hintContent: school.value.name,
              balloonContent: `
                <strong>${school.value.name}</strong><br>
                ${school.value.address}<br>
                ${school.value.contacts}
              `
            }, {
              preset: 'islands#blueEducationIcon'
            })
            
            map.geoObjects.add(placemark)
          }
        }).catch(error => {
          console.error('Ошибка при геокодировании:', error)
        })
      }
    })
  }
}

// Загрузка Яндекс.Карт API
const loadYandexMapsApi = () => {
  // Проверяем, загружен ли уже API
  if (window.ymaps || document.getElementById('675fdace-ace0-42b7-8a12-29e2ceea5c70')) {
    return initMap()
  }
  
  // Добавляем скрипт на страницу
  const script = document.createElement('script')
  script.id = '675fdace-ace0-42b7-8a12-29e2ceea5c70'
  script.src = 'https://api-maps.yandex.ru/2.1/?apikey=ВАШ_API_КЛЮЧ&lang=ru_RU'
  script.async = true
  script.onload = initMap
  document.head.appendChild(script)
}

// Основной метод загрузки данных
onMounted(async () => {
  // Загрузка токена из localStorage
  if (process.client) {
    token.value = localStorage.getItem('token')
  }
  
  try {
    // Загрузка данных о школе
    const response = await fetch(`/api/schools/${schoolId}`)
    
    if (!response.ok) {
      console.error('Ошибка загрузки данных о школе:', response.status)
      return
    }
    
    const data = await response.json()
    if (data && data.body) {
      school.value = data.body
      
      // Загрузка данных пользователя, если есть токен
      if (token.value) {
        await loadUserData()
        await checkIfSaved()
      }
      
      // Настройка заголовка страницы
      useHead({
        title: `${school.value.name} - Платформа для абитуриентов`
      })
    } else {
      console.error('Неверный формат данных о школе:', data)
    }
  } catch (error) {
    console.error('Ошибка загрузки данных о школе:', error)
  } finally {
    isLoading.value = false
  }
  
  // Добавляем обработчик нажатия клавиш для галереи
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Удаляем обработчик нажатия клавиш при уничтожении компонента
  window.removeEventListener('keydown', handleKeydown)
})

// Используем computed для заголовка страницы
const pageTitle = computed(() => {
  return school.value 
    ? `${school.value.name} - Платформа для абитуриентов` 
    : 'Учебное заведение - Платформа для абитуриентов'
})

// Применяем заголовок страницы
useHead({
  title: pageTitle
})
</script> 