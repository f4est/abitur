<template>
  <div class="bg-snow-white min-h-screen p-2 sm:p-4 md:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Управление учебными заведениями</h1>
      <NuxtLink to="/admin" class="bg-ashleigh text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base">
        Назад к панели
      </NuxtLink>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-3 sm:p-6">
      <div class="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Поиск заведений..." 
            class="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-64"
            @input="searchSchools"
          />
          <select 
            v-model="categoryFilter"
            class="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-auto"
            @change="searchSchools"
          >
            <option value="">Все категории</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>
        <button 
          @click="openAddModal = true" 
          class="bg-ashleigh text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base w-full sm:w-auto"
        >
          + Добавить заведение
        </button>
      </div>
      
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
        <p class="mt-2 text-gray-700">Загрузка учебных заведений...</p>
      </div>
      
      <div v-else-if="filteredSchools.length === 0" class="text-center py-12">
        <p class="text-gray-700">Учебные заведения не найдены</p>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="school in filteredSchools" :key="school.id" class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition flex flex-col h-full">
          <div class="flex items-start mb-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-skyway rounded flex items-center justify-center text-white mr-3 flex-shrink-0">
              <span class="text-base sm:text-lg font-bold">{{ getInitials(school.name) }}</span>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-medium text-gray-800 line-clamp-2">{{ school.name }}</h3>
              <span v-if="school.category" class="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 mt-1 inline-block">
                {{ categories.find(c => c.id === school.category)?.name || school.category }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2 mb-4 flex-grow">
            <p v-if="school.address" class="text-xs sm:text-sm text-gray-600 line-clamp-2 flex items-start">
              <span class="mr-1.5 text-ashleigh">📍</span>
              {{ school.address }}
            </p>
            <p v-if="school.phone" class="text-xs sm:text-sm text-gray-600 line-clamp-1 flex items-start">
              <span class="mr-1.5 text-ashleigh">📞</span>
              {{ school.phone }}
            </p>
            <p v-if="school.email" class="text-xs sm:text-sm text-gray-600 line-clamp-1 flex items-start">
              <span class="mr-1.5 text-ashleigh">📧</span>
              {{ school.email }}
            </p>
            <p v-if="school.website" class="text-xs sm:text-sm text-gray-600 line-clamp-1 flex items-start">
              <span class="mr-1.5 text-ashleigh">🌐</span>
              <a :href="school.website" target="_blank" class="text-ashleigh hover:underline truncate">{{ school.website }}</a>
            </p>
          </div>
          
          <div class="flex items-center justify-between border-t pt-3">
            <span class="text-xs text-gray-500">Программ: {{ school.programs?.length || 0 }}</span>
            <div>
              <button 
                @click="editSchool(school)" 
                class="text-ashleigh hover:text-ashleigh/80 mr-2 text-sm" 
                title="Редактировать"
              >
                ✏️
              </button>
              <button 
                @click="confirmDelete(school)" 
                class="text-red-600 hover:text-red-800 text-sm" 
                title="Удалить"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <nav class="flex space-x-1">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-ashleigh hover:bg-gray-100'
            ]"
          >
            &laquo;
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page" 
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === page ? 'bg-ashleigh text-white' : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-ashleigh hover:bg-gray-100'
            ]"
          >
            &raquo;
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Уведомления об успехе или ошибке -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 rounded shadow-md max-w-md">
        <div class="flex items-center">
          <div class="mr-2">✅</div>
          <p>{{ successMessage }}</p>
        </div>
      </div>
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded shadow-md max-w-md">
        <div class="flex items-center">
          <div class="mr-2">❌</div>
          <p>{{ errorMessage }}</p>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно добавления/редактирования школы -->
    <div v-if="openAddModal || openEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">
          {{ openAddModal ? 'Добавить учебное заведение' : 'Редактировать учебное заведение' }}
        </h2>
        
        <form @submit.prevent="openAddModal ? addSchool() : updateSchool()" class="space-y-6">
          <!-- Основная информация -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input
                v-model="schoolForm.name"
                type="text"
                required
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
              <select
                v-model="schoolForm.category"
                required
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              >
                <option value="">Выберите категорию</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Адрес *</label>
              <div class="flex">
                <input
                  v-model="schoolForm.address"
                  type="text"
                  required
                  class="px-3 py-2 w-full border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                />
                <button
                  type="button"
                  @click="editLocation"
                  class="px-3 py-2 bg-ashleigh text-white rounded-r-lg hover:bg-opacity-90"
                  title="Выбрать на карте"
                >
                  📍
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Веб-сайт</label>
              <input
                v-model="schoolForm.website"
                type="url"
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="schoolForm.email"
                type="email"
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                v-model="schoolForm.phone"
                type="tel"
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              v-model="schoolForm.description"
              rows="3"
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            ></textarea>
          </div>
          
          <!-- Образовательные программы -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-medium">Образовательные программы</h3>
              <button
                type="button"
                @click="addProgram"
                class="px-2 py-1 bg-skyway text-white rounded hover:bg-opacity-90 text-sm"
              >
                + Добавить программу
              </button>
            </div>
            
            <div v-if="schoolForm.programs.length === 0" class="text-center py-4 text-gray-500">
              Нет добавленных программ
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="(program, index) in schoolForm.programs" :key="program.id" class="border p-3 rounded-lg">
                <div class="flex justify-between mb-2">
                  <h4 class="font-medium">Программа #{{ index + 1 }}</h4>
                  <button
                    type="button"
                    @click="removeProgram(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Удалить
                  </button>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Название программы *</label>
                    <input
                      v-model="program.name"
                      type="text"
                      required
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                    <select
                      v-model="program.category"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    >
                      <option value="">Выберите категорию</option>
                      <option value="bachelor">Бакалавриат</option>
                      <option value="master">Магистратура</option>
                      <option value="specialty">Специалитет</option>
                      <option value="course">Курс</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Длительность</label>
                    <input
                      v-model="program.duration"
                      type="text"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Стоимость</label>
                    <input
                      v-model="program.price"
                      type="text"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                  
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Описание программы</label>
                    <textarea
                      v-model="program.description"
                      rows="2"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="openAddModal ? openAddModal = false : openEditModal = false; resetForm();"
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
              :disabled="isSubmitting"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-3 py-2 bg-ashleigh hover:bg-opacity-90 text-white rounded-lg text-sm flex items-center"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {{ openAddModal ? 'Добавить' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="openDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Удаление учебного заведения</h2>
        
        <p class="mb-6 text-gray-700">
          Вы действительно хотите удалить учебное заведение <span class="font-medium">{{ schoolToDelete?.name }}</span>?
          Это действие невозможно отменить.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="openDeleteModal = false; schoolToDelete = null;"
            class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
            :disabled="isSubmitting"
          >
            Отмена
          </button>
          <button
            type="button"
            @click="deleteSchool"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Удалить
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно выбора местоположения на карте -->
    <div v-if="openLocationModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">Выбор местоположения на карте</h2>
        
        <div v-if="isMapLoading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
          <p class="mt-2 text-gray-700">Загрузка карты...</p>
        </div>
        
        <div v-else class="h-96 border rounded-lg mb-4">
          <LocationEditor 
            :initial-location="schoolForm.location" 
            :address="schoolForm.address"
            @location-selected="saveLocation"
          />
        </div>
        
        <div class="flex justify-end">
          <button
            type="button"
            @click="openLocationModal = false"
            class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
          >
            Закрыть
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

// Состояние загрузки
const isLoading = ref(true)
const isSubmitting = ref(false)
const isMapLoading = ref(false)

// Параметры запроса
const searchQuery = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const limit = 12

// Школы
const schools = ref([])
const totalSchools = ref(0)
const totalPages = computed(() => Math.ceil(totalSchools.value / limit))

// Фильтрация школ
const filteredSchools = computed(() => {
  let result = [...schools.value]
  
  // Фильтр по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(school => 
      school.name.toLowerCase().includes(query) || 
      (school.address && school.address.toLowerCase().includes(query)) ||
      (school.description && school.description.toLowerCase().includes(query))
    )
  }
  
  // Фильтр по категории
  if (categoryFilter.value) {
    result = result.filter(school => 
      school.category === categoryFilter.value || 
      school.programs?.some(p => p.category === categoryFilter.value)
    )
  }
  
  return result
})

// Модальные окна
const openAddModal = ref(false)
const openEditModal = ref(false)
const openDeleteModal = ref(false)
const openLocationModal = ref(false)

// Форма школы
const schoolForm = ref({
  id: null,
  name: '',
  address: '',
  description: '',
  websiteUrl: '',
  contacts: '',
  programsList: []
})

// Список категорий
const categories = ref([
  { id: 'university', name: 'Университет' },
  { id: 'college', name: 'Колледж' },
  { id: 'school', name: 'Школа' },
  { id: 'course', name: 'Курсы' }
])

// ID школы для удаления
const schoolToDelete = ref(null)

// Сообщения для пользователя
const successMessage = ref('')
const errorMessage = ref('')

// Очистка сообщений через 3 секунды
function clearMessages() {
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 3000)
}

// Токен для API-запросов
const token = process.client ? localStorage.getItem('token') : null

// Загрузка школ
async function loadSchools() {
  isLoading.value = true
  try {
    const { data, error } = await useFetch('/api/schools', {
      headers: { 'Authorization': `Bearer ${token}` },
      query: {
        page: currentPage.value,
        limit,
        search: searchQuery.value,
        category: categoryFilter.value
      },
      key: `admin-schools-${currentPage.value}-${searchQuery.value}-${categoryFilter.value}-${Date.now()}`
    })
    
    if (error.value) {
      throw new Error('Ошибка загрузки учебных заведений')
    }
    
    schools.value = data.value.body || []
    totalSchools.value = data.value.total || schools.value.length
  } catch (error) {
    console.error('Ошибка загрузки учебных заведений:', error)
    errorMessage.value = 'Не удалось загрузить список учебных заведений. Пожалуйста, попробуйте позже.'
    clearMessages()
    schools.value = []
  } finally {
    isLoading.value = false
  }
}

// Добавление школы
async function addSchool() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    // Подготовка данных для отправки
    const schoolData = {
      name: schoolForm.value.name,
      address: schoolForm.value.address,
      description: schoolForm.value.description || '',
      websiteUrl: schoolForm.value.websiteUrl || '',
      contacts: schoolForm.value.contacts || '',
      coordinates: schoolForm.value.location || null,
      category: schoolForm.value.category,
      programs: schoolForm.value.programsList
        .filter(p => p.name && p.name.trim()) // Только программы с названием
        .map(program => ({
          name: program.name.trim(),
          code: program.code || null,
          description: program.description || '',
          duration: program.duration || '',
          price: program.price ? parseFloat(program.price) : null,
          category: program.category || null
        }))
    }

    const { data, error } = await useFetch('/api/schools', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: schoolData
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Ошибка при добавлении учебного заведения')
    }
    
    // Добавление новой школы в список
    schools.value.unshift(data.value.body)
    totalSchools.value++
    
    // Закрыть модальное окно и очистить форму
    openAddModal.value = false
    resetForm()
    
    // Показать сообщение об успехе
    successMessage.value = 'Учебное заведение успешно добавлено'
    clearMessages()
  } catch (error) {
    console.error('Ошибка при добавлении учебного заведения:', error)
    errorMessage.value = error.message || 'Не удалось добавить учебное заведение. Пожалуйста, проверьте данные и попробуйте снова.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Редактирование школы
function editSchool(school) {
  schoolForm.value = {
    id: school.id,
    name: school.name,
    address: school.address || '',
    description: school.description || '',
    websiteUrl: school.websiteUrl || '',
    contacts: school.contacts || '',
    programsList: school.programs || []
  }
  openEditModal.value = true
}

// Обновление школы
async function updateSchool() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    // Подготовка данных для отправки
    const schoolData = {
      name: schoolForm.value.name,
      address: schoolForm.value.address,
      description: schoolForm.value.description,
      websiteUrl: schoolForm.value.websiteUrl,
      contacts: schoolForm.value.contacts,
      coordinates: schoolForm.value.location,
      programs: schoolForm.value.programsList.map(program => ({
        id: program.id,
        name: program.name,
        code: program.code || null,
        description: program.description || '',
        duration: program.duration || '',
        price: program.price ? parseFloat(program.price) : null,
        category: program.category || null
      }))
    }

    // Выполняем запрос к API
    const { data, error } = await useFetch(`/api/schools/${schoolForm.value.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: schoolData
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Ошибка при обновлении учебного заведения')
    }
    
    // Обновление школы в списке
    const index = schools.value.findIndex(s => s.id === schoolForm.value.id)
    if (index !== -1) {
      schools.value[index] = { ...schools.value[index], ...data.value.body }
    }
    
    // Закрыть модальное окно и очистить форму
    openEditModal.value = false
    resetForm()
    
    // Показать сообщение об успехе
    successMessage.value = 'Данные учебного заведения успешно обновлены'
    clearMessages()
  } catch (error) {
    console.error('Ошибка при обновлении учебного заведения:', error)
    errorMessage.value = error.message || 'Не удалось обновить учебное заведение. Пожалуйста, проверьте данные и попробуйте снова.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Подтверждение удаления
function confirmDelete(school) {
  schoolToDelete.value = school
  openDeleteModal.value = true
}

// Удаление школы
async function deleteSchool() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    const { error } = await useFetch(`/api/schools/${schoolToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Ошибка при удалении учебного заведения')
    }
    
    // Удаляем школу из списка
    schools.value = schools.value.filter(s => s.id !== schoolToDelete.value.id)
    totalSchools.value--
    
    // Закрыть модальное окно
    openDeleteModal.value = false
    schoolToDelete.value = null
    
    // Показать сообщение об успехе
    successMessage.value = 'Учебное заведение успешно удалено'
    clearMessages()
  } catch (error) {
    console.error('Ошибка при удалении учебного заведения:', error)
    errorMessage.value = error.message || 'Не удалось удалить учебное заведение. Пожалуйста, попробуйте позже.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Открытие редактора местоположения
function editLocation() {
  openLocationModal.value = true
}

// Сохранение местоположения
function saveLocation(location) {
  schoolForm.value.location = location
  openLocationModal.value = false
}

// Поиск школ
const debounceSearch = useDebounce(() => {
  currentPage.value = 1
  loadSchools()
}, 300)

function searchSchools() {
  debounceSearch()
}

// Сброс формы
function resetForm() {
  schoolForm.value = {
    id: null,
    name: '',
    address: '',
    description: '',
    websiteUrl: '',
    contacts: '',
    programsList: []
  }
}

// Добавление программы
function addProgram() {
  schoolForm.value.programsList.push({ name: '' })
}

// Удаление программы
function removeProgram(index) {
  schoolForm.value.programsList.splice(index, 1)
}

// Пагинация
function goToPage(page) {
  currentPage.value = page
  loadSchools()
}

// Функция для получения инициалов
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

// Функция для создания хука debounce
function useDebounce(fn, delay) {
  let timeout
  return function() {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(context, args), delay)
  }
}

// Проверка URL на наличие параметров
onMounted(() => {
  const route = useRoute()
  
  // Если есть параметр edit, открываем модальное окно редактирования
  if (route.query.edit) {
    const schoolId = parseInt(route.query.edit)
    const fetchSchoolAndEdit = async () => {
      try {
        const { data, error } = await useFetch(`/api/schools/${schoolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (error.value) throw new Error('Не удалось загрузить данные учебного заведения')
        
        editSchool(data.value.body)
      } catch (error) {
        console.error('Ошибка при загрузке учебного заведения для редактирования:', error)
        errorMessage.value = 'Не удалось загрузить учебное заведение для редактирования'
        clearMessages()
      }
    }
    
    fetchSchoolAndEdit()
  }
  
  // Если есть параметр delete, открываем модальное окно удаления
  if (route.query.delete) {
    const schoolId = parseInt(route.query.delete)
    const fetchSchoolAndDelete = async () => {
      try {
        const { data, error } = await useFetch(`/api/schools/${schoolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (error.value) throw new Error('Не удалось загрузить данные учебного заведения')
        
        confirmDelete(data.value.body)
      } catch (error) {
        console.error('Ошибка при загрузке учебного заведения для удаления:', error)
        errorMessage.value = 'Не удалось загрузить учебное заведение для удаления'
        clearMessages()
      }
    }
    
    fetchSchoolAndDelete()
  }
  
  // Загрузка списка школ
  loadSchools()
})

// Настройка заголовка страницы
useHead({
  title: 'Управление учебными заведениями | Админ-панель'
})
</script> 