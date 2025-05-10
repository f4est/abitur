<!-- 
  Компонент ImageLoader предназначен для унифицированной загрузки изображений
  с возможностью плейсхолдеров и обработки ошибок.
  
  Props:
  - src: URL изображения
  - alt: Альтернативный текст
  - placeholderType: Тип заглушки (avatar, school-logo, school-photo)
  - showInitials: Отображать ли инициалы если не указан источник изображения
  - name: Имя для генерации инициалов (если showInitials=true)
  - className: Дополнительные классы для изображения
-->

<template>
  <div class="image-loader-wrapper relative w-full h-full">
    <!-- Когда изображение еще загружается -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse"
    >
      <div class="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
    </div>
    
    <!-- Если картинка загружена успешно -->
    <img 
      v-show="!isLoading && !hasError && src"
      :src="src" 
      :alt="alt"
      class="w-full h-full object-cover"
      :class="className"
      @load="handleImageLoaded"
      @error="handleImageError"
    />

    <!-- Если произошла ошибка или изображение не указано -->
    <div 
      v-if="hasError || !src" 
      class="w-full h-full flex items-center justify-center"
      :class="backgroundColorClass"
    >
      <!-- Отображаем заглушку в зависимости от типа -->
      <template v-if="!showInitials">
        <img 
          v-if="placeholderType === 'avatar'"
          src="/images/placeholders-png/avatar.png" 
          :alt="alt || 'Заглушка аватара'"
          class="w-full h-full object-cover"
          :class="className"
        />
        <img 
          v-else-if="placeholderType === 'school-logo'"
          src="/images/placeholders-png/school-logo.png" 
          :alt="alt || 'Логотип учебного заведения'"
          class="max-h-full max-w-full object-contain"
          :class="className"
        />
        <img 
          v-else-if="placeholderType === 'school-photo'"
          src="/images/placeholders-png/school-photo.png" 
          :alt="alt || 'Фото учебного заведения'"
          class="w-full h-full object-cover"
          :class="className"
        />
        <div 
          v-else 
          class="flex items-center justify-center w-14 h-14 bg-gray-200 rounded-full text-gray-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </template>
      
      <!-- Если нужно показать инициалы вместо фото -->
      <span v-else class="text-2xl font-bold text-white">
        {{ getInitials(name) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  alt: {
    type: String,
    default: 'Изображение'
  },
  placeholderType: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'avatar', 'school-logo', 'school-photo'].includes(value)
  },
  showInitials: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  }
})

const isLoading = ref(true)
const hasError = ref(false)

// Класс фона для плейсхолдера
const backgroundColorClass = computed(() => {
  if (props.placeholderType === 'avatar') return 'bg-skyway'
  if (props.placeholderType === 'school-logo') return 'bg-skyway'
  if (props.placeholderType === 'school-photo') return 'bg-gray-200'
  return 'bg-gray-100'
})

// Обработка успешной загрузки изображения
const handleImageLoaded = () => {
  isLoading.value = false
  hasError.value = false
}

// Обработка ошибки загрузки изображения
const handleImageError = () => {
  isLoading.value = false
  hasError.value = true
}

// Получение инициалов из имени
const getInitials = (name) => {
  if (!name) return '?'
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Проверяем загрузку при монтировании компонента
onMounted(() => {
  // Если изображение не предоставлено, сразу показываем плейсхолдер
  if (!props.src) {
    isLoading.value = false
  }
})
</script>

<style scoped>
.image-loader-wrapper {
  position: relative;
  overflow: hidden;
}
</style> 