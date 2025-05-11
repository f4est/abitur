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
            <ImageLoader
              :src="school.logoUrl"
              :alt="school.name"
              placeholder-type="school-logo"
              :name="school.name"
              class="max-w-full max-h-full"
            />
          </div>
        </div>
        
        <div class="md:w-3/4">
          <div class="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div class="flex justify-between items-start">
              <h1 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">{{ school.name }}</h1>
              
              <!-- Блок с рейтингом -->
              <div v-if="school.averageRating" class="flex items-center bg-ashleigh bg-opacity-10 text-ashleigh px-3 py-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="font-medium text-lg">{{ school.averageRating }}</span>
                <span class="text-sm text-gray-600 ml-1">({{ school.reviewCount }})</span>
              </div>
            </div>
            
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
              
              <!-- Структурированные контакты -->
              <div class="space-y-3">
                <!-- Основной телефон и email -->
                <div class="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <div v-if="school.phone" class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span class="text-sm sm:text-base">{{ school.phone }}</span>
                  </div>
                  <div v-if="school.email" class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span class="text-sm sm:text-base">{{ school.email }}</span>
                  </div>
                </div>
                
                <!-- Дополнительные телефоны -->
                <div v-if="contactData.phones && contactData.phones.length > 0" class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium mb-1">Дополнительные номера:</span>
                    <div class="space-y-1">
                      <div v-for="(phone, index) in contactData.phones" :key="`phone-${index}`" class="text-sm">
                        {{ phone }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Факс -->
                <div v-if="contactData.fax" class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">Факс:</span>
                    <span class="text-sm">{{ contactData.fax }}</span>
                  </div>
                </div>
                
                <!-- Мессенджеры -->
                <div v-if="contactData.messengers && contactData.messengers.length > 0" class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium mb-1">Мессенджеры:</span>
                    <div class="space-y-1">
                      <div v-for="(messenger, index) in contactData.messengers" :key="`messenger-${index}`" class="text-sm flex items-center">
                        <span class="mr-1">{{ getMessengerIcon(messenger.type) }}</span>
                        <span>{{ messenger.value }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Часы работы -->
                <div v-if="contactData.workingHours" class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium">Часы работы:</span>
                    <span class="text-sm">{{ contactData.workingHours }}</span>
                  </div>
                </div>
                
                <!-- Социальные сети -->
                <div v-if="contactData.socialNetworks && contactData.socialNetworks.length > 0" class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium mb-1">Социальные сети:</span>
                    <div class="flex flex-wrap gap-2">
                      <a 
                        v-for="(social, index) in contactData.socialNetworks" 
                        :key="`social-${index}`"
                        :href="social.url"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-sm px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center"
                      >
                        <span class="mr-1">{{ getSocialIcon(social.type) }}</span>
                        <span>{{ getSocialName(social.type) }}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
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
            @click="openGallery(photo.url, photo.description)"
          >
            <ImageLoader
              :src="photo.url"
              :alt="photo.description || school.name"
              placeholder-type="school-photo"
              class="w-full h-full transition-transform duration-300 group-hover:scale-105"
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
            <ImageLoader 
              :src="currentImage" 
              :alt="currentDescription"
              placeholder-type="school-photo"
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
      <SchoolMap :address="school.address" :schoolName="school.name" :coordinates="school.coordinates" />
      
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
                  <div v-if="hasExamRequirements(program)" class="mt-4 border-t pt-3">
                    <h4 class="text-sm font-semibold mb-2">Требования к экзаменам:</h4>
                    <div class="overflow-x-auto">
                      <table class="min-w-full text-sm">
                        <thead>
                          <tr class="border-b bg-gray-50">
                            <th class="py-2 px-3 text-left">Экзамен</th>
                            <th class="py-2 px-3 text-right">Минимальный балл</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(exam, examIndex) in parseExamRequirements(program)" :key="`exam-${program.id}-${examIndex}`" class="border-b">
                            <td class="py-2 px-3">{{ exam.name }}</td>
                            <td class="py-2 px-3 text-right">{{ exam.minScore }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { useSavedSchools } from '~/composables/useSavedSchools'
import ImageLoader from '~/components/ImageLoader.vue'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const schoolId = parseInt(route.params.id)

const school = ref(null)
const isLoading = ref(true)
const token = ref(null)
const user = ref(null)
const mapInstance = ref(null)

// Используем composable для управления сохраненными школами
const { isSchoolSaved, loadSavedSchools, toggleSaveSchool: toggleSaveSchoolAction } = useSavedSchools()

// Проверка, сохранено ли учебное заведение
const isSaved = computed(() => {
  return isSchoolSaved(schoolId)
})

// Переадресация вызова в composable
const toggleSaveSchool = () => {
  toggleSaveSchoolAction(schoolId)
}

// Данные для галереи
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
  currentImage.value = imageUrl || ''
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
    currentImage.value = photo.url || ''
    currentDescription.value = photo.description || ''
  }
}

// Перейти к следующему изображению
const nextImage = () => {
  if (currentImageIndex.value < school.value.photos.length - 1) {
    currentImageIndex.value++
    const photo = school.value.photos[currentImageIndex.value]
    currentImage.value = photo.url || ''
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
    // Загружаем сохраненные школы
    await loadSavedSchools()
    
    // Загружаем данные пользователя
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token.value}`
      }
    })
    
    if (response.ok) {
      const userData = await response.json()
      if (userData && userData.id) {
        user.value = userData
        console.log('Данные пользователя загружены:', user.value.name)
      }
    } else {
      console.error('Ошибка при загрузке данных пользователя:', response.status)
    }
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error)
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
  // Проверяем, загружен ли уже API (без использования ID скрипта)
  if (window.ymaps) {
    return initMap();
  }
  
  // Получаем API ключ из конфигурации
  const config = useRuntimeConfig();
  const apiKey = config.public.yandexMapsApiKey;
  
  // Добавляем скрипт на страницу
  const script = document.createElement('script');
  script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
  script.async = true;
  script.onload = initMap;
  document.head.appendChild(script);
}

// Парсинг структурированных контактов
const contactData = computed(() => {
  if (!school.value || !school.value.contacts) return {}
  
  try {
    const contactsData = typeof school.value.contacts === 'string' 
      ? JSON.parse(school.value.contacts)
      : school.value.contacts
    
    return {
      phones: contactsData.phones || [],
      fax: contactsData.fax || '',
      messengers: contactsData.messengers || [],
      workingHours: contactsData.workingHours || '',
      socialNetworks: contactsData.socialNetworks || []
    }
  } catch (error) {
    console.error('Ошибка при разборе контактных данных:', error)
    return {}
  }
})

// Получение иконки для мессенджера
const getMessengerIcon = (type) => {
  switch (type) {
    case 'whatsapp': return '📱 WhatsApp:'
    case 'telegram': return '📨 Telegram:'
    case 'viber': return '📞 Viber:'
    default: return '📱'
  }
}

// Получение иконки для социальной сети
const getSocialIcon = (type) => {
  switch (type) {
    case 'vk': return '💬'
    case 'instagram': return '📷'
    case 'facebook': return '👍'
    case 'youtube': return '📺'
    default: return '🔗'
  }
}

// Получение названия социальной сети
const getSocialName = (type) => {
  switch (type) {
    case 'vk': return 'ВКонтакте'
    case 'instagram': return 'Instagram'
    case 'facebook': return 'Facebook'
    case 'youtube': return 'YouTube'
    default: return type
  }
}

// Проверяет, есть ли требования к экзаменам
const hasExamRequirements = (program) => {
  return program.examRequirements && 
        (typeof program.examRequirements === 'string' ? 
          program.examRequirements.length > 0 : 
          program.examRequirements.length > 0);
}

// Парсит JSON-строку требований к экзаменам
const parseExamRequirements = (program) => {
  if (!program.examRequirements) return [];
  
  if (typeof program.examRequirements === 'string') {
    try {
      return JSON.parse(program.examRequirements);
    } catch (e) {
      console.error('Ошибка при парсинге требований к экзаменам:', e);
      return [];
    }
  }
  
  return program.examRequirements;
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
      
      // Вывод информации о координатах для отладки
      console.log('Catalog/[id]: Загружены данные о школе. Coordinates:', school.value.coordinates, 
                  'Latitude:', school.value.latitude, 'Longitude:', school.value.longitude)
      
      // Загрузка данных пользователя, если есть токен
      if (token.value) {
        await loadUserData()
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