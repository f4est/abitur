<template>
  <div class="w-full">
    <label 
      :for="uploadId" 
      class="block w-full py-4 px-4 border-2 border-dashed border-gray-300 hover:border-ashleigh rounded-lg cursor-pointer text-center transition-colors bg-gray-50"
    >
      <div v-if="isUploading" class="flex flex-col items-center justify-center gap-2">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
        <p class="text-sm text-gray-600">Загрузка изображений... {{ Math.round(uploadProgress) }}%</p>
      </div>
      <div v-else class="flex flex-col items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span class="text-sm text-gray-600">Перетащите изображения сюда или нажмите, чтобы выбрать</span>
        <span class="text-xs text-gray-500">Можно выбрать до {{ maxFiles }} файлов</span>
      </div>
    </label>
    <input 
      :id="uploadId" 
      type="file" 
      multiple
      :accept="fileTypesString"
      class="hidden"
      @change="handleFileSelect"
    />
    <!-- Ошибки загрузки -->
    <div v-if="uploadError" class="mt-2 text-sm text-red-600">
      {{ uploadError }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  maxFiles: {
    type: Number,
    default: 10
  },
  maxFileSize: {
    type: Number,
    default: 5 * 1024 * 1024 // 5MB
  },
  fileTypes: {
    type: Array,
    default: () => ['image/jpeg', 'image/png', 'image/webp']
  },
  type: {
    type: String,
    default: 'school' // Тип загружаемого изображения
  },
  useFallback: {
    type: Boolean,
    default: false // Отключаем режим fallback по умолчанию
  }
})

const emit = defineEmits(['uploaded', 'error'])

const uploadId = ref(`upload-${Math.random().toString(36).substring(2, 9)}`)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')

const fileTypesString = computed(() => props.fileTypes.join(','))

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files || [])
  
  // Сбрасываем ошибки
  uploadError.value = ''
  
  // Проверка количества файлов
  if (files.length > props.maxFiles) {
    uploadError.value = `Можно загрузить не более ${props.maxFiles} файлов за раз.`
    emit('error', new Error(uploadError.value))
    event.target.value = ''
    return
  }
  
  // Проверка типов файлов
  for (const file of files) {
    if (!props.fileTypes.includes(file.type)) {
      uploadError.value = `Допустимые форматы файлов: ${props.fileTypes.map(t => t.replace('image/', '.')).join(', ')}`
      emit('error', new Error(uploadError.value))
      event.target.value = ''
      return
    }
    
    if (file.size > props.maxFileSize) {
      uploadError.value = `Размер файла ${file.name} превышает максимально допустимый размер (${props.maxFileSize / 1024 / 1024}MB).`
      emit('error', new Error(uploadError.value))
      event.target.value = ''
      return
    }
  }
  
  // Начинаем загрузку
  isUploading.value = true
  uploadProgress.value = 0
  
  try {
    const uploadedFiles = []
    
    // Обработка загрузки файлов
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Создаем форму для отправки
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', props.type)
        
        // Универсальный эндпоинт загрузки
        const uploadUrl = '/api/upload'
        
        console.log(`Загрузка файла ${i+1}/${files.length}: ${file.name}`)
        
        try {
          // Получаем токен авторизации из localStorage
          const token = localStorage.getItem('token')
          
          // Отправляем файл на сервер
          const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
            headers: {
              // Добавляем токен авторизации
              'Authorization': token ? `Bearer ${token}` : ''
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
          
          uploadedFiles.push({
            url: data.url,
            name: file.name,
            isLocal: false
          })
          
          console.log(`Файл ${file.name} успешно загружен: ${data.url}`)
        } catch (fetchError) {
          console.error(`Ошибка загрузки файла ${file.name}:`, fetchError)
          
          // Только если включен fallback - создаем локальный URL
          if (props.useFallback) {
            const localUrl = URL.createObjectURL(file)
            uploadedFiles.push({
              url: localUrl,
              name: file.name,
              isLocal: true,
              error: fetchError.message
            })
            
            console.log(`Файл ${file.name} сохранен локально: ${localUrl}`)
          } else {
            // В случае ошибки без fallback, добавляем сообщение об ошибке
            throw new Error(`Не удалось загрузить файл ${file.name}: ${fetchError.message}`)
          }
        }
        
        // Обновляем прогресс
        uploadProgress.value = ((i + 1) / files.length) * 100
      }
      
      // Проверка на количество загруженных файлов
      if (uploadedFiles.length === 0) {
        throw new Error('Не удалось загрузить ни один файл')
      }
      
      // Сообщаем об успешной загрузке
      emit('uploaded', uploadedFiles)
      
      // Если есть локальные файлы и fallback активен, показываем предупреждение
      const localFilesCount = uploadedFiles.filter(f => f.isLocal).length
      if (localFilesCount > 0 && props.useFallback) {
        uploadError.value = `${localFilesCount} из ${files.length} файлов были сохранены только локально из-за ошибок API.`
      }
    } catch (apiError) {
      console.error('Критическая ошибка при работе с API:', apiError)
      
      if (props.useFallback) {
        // Если возникла общая ошибка и включен fallback, переходим на полный локальный режим
        console.log('Переход в полный локальный режим из-за ошибки API')
        
        // Очищаем текущие загрузки и загружаем все локально
        uploadedFiles.length = 0
        uploadProgress.value = 0
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const localUrl = URL.createObjectURL(file)
          
          uploadedFiles.push({
            url: localUrl,
            name: file.name,
            isLocal: true
          })
          
          // Обновляем прогресс
          uploadProgress.value = ((i + 1) / files.length) * 100
        }
        
        // Сообщаем об успешной загрузке, но с предупреждением
        emit('uploaded', uploadedFiles)
        uploadError.value = `Все файлы были сохранены только локально. ${apiError.message}`
      } else {
        // Если fallback отключен, просто показываем ошибку
        uploadError.value = `Ошибка загрузки файлов: ${apiError.message}`
        emit('error', apiError)
      }
    }
  } catch (error) {
    console.error('Общая ошибка загрузки файлов:', error)
    
    // Более детальная обработка ошибок
    let errorMessage = 'Произошла ошибка при загрузке файлов'
    
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
    uploadProgress.value = 0
    event.target.value = '' // Сбрасываем поле ввода
  }
}
</script> 