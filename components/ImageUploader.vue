<template>
  <div class="w-full">
    <div class="flex items-start space-x-4">
      <!-- Превью текущего изображения -->
      <div v-if="modelValue" class="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <img
          :src="modelValue"
          :alt="label"
          class="h-full w-full object-cover"
        />
        <button
          type="button"
          @click="clearImage"
          class="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
          title="Удалить изображение"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Форма загрузки -->
      <div class="flex-grow">
        <label
          :for="uploadId"
          class="block cursor-pointer rounded-lg border border-gray-300 p-3 text-center hover:border-ashleigh"
        >
          <div v-if="isUploading" class="flex flex-col items-center justify-center gap-1">
            <div class="inline-block h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-ashleigh"></div>
            <span class="text-sm text-gray-600">Загрузка...</span>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span class="text-sm text-gray-600">{{ label || 'Загрузить изображение' }}</span>
            <span class="text-xs text-gray-500">{{ fileTypesFormatted }}</span>
          </div>
        </label>
        <input
          :id="uploadId"
          type="file"
          :accept="fileTypesString"
          class="hidden"
          @change="handleFileSelect"
        />
        <!-- Ошибки загрузки -->
        <div v-if="uploadError" class="mt-2 text-sm text-red-600">
          {{ uploadError }}
        </div>
      </div>
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
    default: 'Загрузить изображение'
  },
  type: {
    type: String,
    default: 'image' // Может быть 'logo', 'school', 'avatar', и т.д.
  },
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  fileTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/webp']
  },
  useFallback: {
    type: Boolean,
    default: false // Отключаем режим fallback по умолчанию
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'error'])

const uploadId = ref(`upload-${Math.random().toString(36).substring(2, 9)}`)
const isUploading = ref(false)
const uploadError = ref('')

const fileTypesString = computed(() => props.fileTypes.join(','))
const fileTypesFormatted = computed(() => 
  props.fileTypes.map(type => type.replace('image/', '.')).join(', ')
)

const handleFileSelect = async (event) => {
  const file = event.target.files ? event.target.files[0] : null
  if (!file) return
  
  // Сбрасываем ошибки
  uploadError.value = ''
  
  // Проверка типа файла
  if (!props.fileTypes.includes(file.type)) {
    uploadError.value = `Допустимые форматы файлов: ${fileTypesFormatted.value}`
    emit('error', new Error(uploadError.value))
    event.target.value = ''
    return
  }
  
  // Проверка размера файла
  if (file.size > props.maxFileSize) {
    uploadError.value = `Размер файла превышает максимально допустимый размер (${props.maxFileSize / 1024 / 1024}MB).`
    emit('error', new Error(uploadError.value))
    event.target.value = ''
    return
  }
  
  // Начинаем загрузку
  isUploading.value = true
  
  try {
    // Создаем форму для отправки
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', props.type)
    
    // Используем единый API-эндпоинт для загрузки
    const uploadUrl = '/api/upload'
    
    console.log(`Отправка запроса на: ${uploadUrl}, тип: ${props.type}`)
    
    // Безопасная отправка запроса с обработкой ошибок
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        headers: {
          // Добавляем токен авторизации из localStorage
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      })
      
      if (!response.ok) {
        let errorMessage = `Ошибка сервера: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Если ответ не в формате JSON, используем исходное сообщение
        }
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      
      if (!data || !data.url) {
        throw new Error('Сервер вернул некорректный ответ без URL файла')
      }
      
      console.log('Ответ от сервера:', data)
      
      // Обновляем значение модели
      emit('update:modelValue', data.url)
      emit('change', { ...data, isLocal: false })
      
      console.log(`Изображение успешно загружено: ${data.url}`)
    } catch (fetchError) {
      console.error('Ошибка при выполнении fetch:', fetchError)
      
      // Только если включен fallback режим
      if (props.useFallback) {
        console.log('Переход в режим fallback из-за ошибки API')
        const localUrl = URL.createObjectURL(file)
        emit('update:modelValue', localUrl)
        emit('change', { url: localUrl, name: file.name, isLocal: true })
        
        // Отображаем предупреждение
        uploadError.value = `Изображение сохранено локально. ${fetchError.message}`
      } else {
        // Показываем ошибку пользователю
        uploadError.value = `Ошибка загрузки: ${fetchError.message}`
        emit('error', fetchError)
      }
    }
  } catch (error) {
    console.error('Критическая ошибка загрузки файла:', error)
    
    // Более подробное сообщение об ошибке
    let errorMessage = 'Произошла ошибка при загрузке файла'
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage = 'Ошибка соединения с сервером. Убедитесь, что сервер запущен и доступен.'
    } else if (error.response) {
      errorMessage = `Ошибка сервера: ${error.response.statusText}`
    } else {
      errorMessage = error.message || errorMessage
    }
    
    uploadError.value = errorMessage
    emit('error', error)
  } finally {
    isUploading.value = false
    event.target.value = '' // Сбрасываем поле ввода
  }
}

const clearImage = () => {
  emit('update:modelValue', '')
}
</script> 