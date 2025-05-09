<template>
  <div class="w-full">
    <div class="mb-2 flex items-center justify-between">
      <label :for="inputId" class="block text-sm font-medium text-gray-700">
        {{ label }}
      </label>
      <span v-if="isLoading" class="text-xs py-1 px-2 bg-ashleigh/10 text-ashleigh rounded-full animate-pulse flex items-center">
        <svg class="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Загрузка...
      </span>
    </div>
    
    <!-- Предпросмотр изображения -->
    <div v-if="modelValue" class="mb-3 relative group">
      <img 
        :src="modelValue" 
        :alt="label" 
        class="w-full h-36 object-cover rounded-lg border-2 border-ashleigh/20" 
        onerror="this.src='/images/placeholders-png/avatar.png'; this.onerror=null;"
      />
      <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-lg flex items-center justify-center">
        <button 
          type="button"
          @click="clearImage"
          class="bg-red-500 text-white rounded-full p-2 shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 hover:bg-red-600"
          title="Удалить изображение"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
    
    <div class="relative">
      <!-- Кнопка для выбора файла -->
      <div
        @click="triggerFileInput"
        class="w-full px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer text-center transition-all"
        :class="[
          error 
            ? 'border-red-300 bg-red-50 hover:bg-red-100 text-red-700' 
            : modelValue
              ? 'border-green-300 bg-green-50 hover:bg-green-100 text-green-700'
              : 'border-ashleigh/30 bg-ashleigh/5 hover:bg-ashleigh/10 text-ashleigh hover:border-ashleigh/50'
        ]"
      >
        <div class="flex flex-col items-center justify-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-10 w-10 mb-2" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            :class="{ 
              'text-red-500': error, 
              'text-green-500': modelValue && !error,
              'text-ashleigh': !modelValue && !error 
            }"
          >
            <path 
              v-if="!modelValue"
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" 
            />
            <path 
              v-else
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
          <p class="text-sm font-medium">
            {{ modelValue ? 'Изменить изображение' : 'Кликните для выбора изображения' }}
          </p>
          <p class="text-xs mt-1 opacity-75">
            {{ accept === 'image/*' ? 'JPG, PNG, GIF или WebP' : accept }}
          </p>
          <p class="text-xs mt-1 opacity-75">
            Максимальный размер: {{ maxSizeMB }} МБ
          </p>
        </div>
      </div>
      
      <!-- Скрытый input для загрузки файла -->
      <input
        :id="inputId"
        ref="fileInput"
        type="file"
        :accept="accept"
        class="hidden"
        @change="onFileChange"
      />
    </div>
    
    <!-- Сообщение об ошибке -->
    <p v-if="error" class="mt-2 text-sm text-red-600 flex items-start">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {{ error }}
    </p>

    <!-- Отладочная информация -->
    <div v-if="debugMode" class="mt-4 p-3 bg-gray-100 rounded-lg text-sm text-gray-700">
      <h4 class="font-semibold mb-1">Отладочная информация:</h4>
      <ul class="list-disc list-inside space-y-1">
        <li>Значение модели: {{ modelValue || 'не задано' }}</li>
        <li>Статус загрузки: {{ isLoading ? 'в процессе' : 'завершено' }}</li>
        <li>Ошибка: {{ error || 'нет' }}</li>
        <li>Последняя попытка: {{ lastAttempt }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Загрузка изображения'
  },
  accept: {
    type: String,
    default: 'image/*'
  },
  maxSizeMB: {
    type: Number,
    default: 5
  },
  debugMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

const fileInput = ref(null)
const error = ref('')
const isLoading = ref(false)
const lastAttempt = ref('Не было попыток загрузки')

// Генерируем уникальный ID для input
const inputId = computed(() => `file-input-${Math.random().toString(36).substring(2, 9)}`)

// Вызывает клик на скрытом input элементе
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Обработка выбора файла
const onFileChange = async (event) => {
  error.value = ''
  
  if (!event.target.files || !event.target.files.length) {
    return
  }
  
  const file = event.target.files[0]
  lastAttempt.value = `Выбран файл: ${file.name}, размер: ${Math.round(file.size / 1024)} KB, тип: ${file.type}`
  
  // Проверяем размер файла
  if (file.size > props.maxSizeMB * 1024 * 1024) {
    error.value = `Размер файла превышает ${props.maxSizeMB} МБ (файл: ${Math.round(file.size / 1024 / 1024 * 100) / 100} МБ)`
    emit('error', error.value)
    return
  }
  
  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    error.value = `Выбранный файл не является изображением (тип: ${file.type})`
    emit('error', error.value)
    return
  }
  
  // Проверим тип файла более детально
  if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp') {
    // Всё в порядке, поддерживаемый тип
  } else {
    error.value = `Неподдерживаемый тип изображения: ${file.type}. Поддерживаются только JPEG, PNG, GIF и WebP.`
    emit('error', error.value)
    return
  }
  
  // Загружаем файл на сервер
  await uploadFile(file)
  
  // Сбрасываем значение input для возможности повторной загрузки того же файла
  event.target.value = ''
}

// Загрузка файла на сервер
const uploadFile = async (file) => {
  isLoading.value = true
  error.value = ''
  
  try {
    console.log('Загрузка файла начата:', file.name)
    
    const formData = new FormData()
    formData.append('file', file)
    
    const token = localStorage.getItem('token')
    if (!token) {
      error.value = 'Требуется авторизация'
      emit('error', error.value)
      return
    }
    
    lastAttempt.value = `Отправка на сервер: ${file.name}`
    console.log('Отправка файла на сервер:', file.name)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })
    
    console.log('Ответ сервера:', response.status, response.statusText)
    lastAttempt.value = `Ответ сервера: ${response.status} ${response.statusText}`
    
    // Попробуем прочитать ответ как JSON
    let result
    try {
      const text = await response.text()
      console.log('Текст ответа:', text)
      result = text ? JSON.parse(text) : {}
    } catch (parseError) {
      console.error('Ошибка парсинга ответа:', parseError)
      error.value = `Ошибка чтения ответа сервера: ${parseError.message}`
      emit('error', error.value)
      return
    }
    
    if (!response.ok) {
      error.value = result.message || result.body?.message || `Ошибка загрузки файла: ${response.status} ${response.statusText}`
      emit('error', error.value)
      return
    }
    
    // Обновляем значение модели с URL загруженного изображения
    const url = result.body?.url || ''
    if (!url) {
      error.value = 'Сервер не вернул URL загруженного файла'
      emit('error', error.value)
      return
    }
    
    console.log('Файл успешно загружен, URL:', url)
    lastAttempt.value = `Успешно загружен: ${url}`
    
    emit('update:modelValue', url)
    emit('change', result.body)
  } catch (e) {
    console.error('Ошибка загрузки файла:', e)
    lastAttempt.value = `Ошибка: ${e.message || 'Неизвестная ошибка'}`
    error.value = `Ошибка загрузки файла: ${e.message || 'Неизвестная ошибка'}`
    emit('error', error.value)
  } finally {
    isLoading.value = false
  }
}

// Очистка выбранного изображения
const clearImage = () => {
  emit('update:modelValue', '')
}
</script> 