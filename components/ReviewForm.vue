<template>
  <div class="bg-white rounded-lg p-4 border border-gray-200">
    <h3 class="text-lg font-semibold mb-4">{{ isEditing ? 'Редактирование отзыва' : 'Добавление отзыва' }}</h3>
    
    <form @submit.prevent="submitReview" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Имя автора *</label>
        <input 
          v-model="reviewForm.authorName" 
          type="text" 
          required
          class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Рейтинг *</label>
        <div class="flex items-center">
          <div class="flex">
            <button 
              v-for="star in 5" 
              :key="star"
              type="button"
              @click="reviewForm.rating = star"
              class="text-2xl focus:outline-none"
              :class="star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'"
            >
              ★
            </button>
          </div>
          <span class="ml-2 text-gray-700">{{ reviewForm.rating }} из 5</span>
        </div>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Источник</label>
        <select 
          v-model="reviewForm.source"
          class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
        >
          <option value="2GIS">2ГИС</option>
          <option value="Яндекс.Карты">Яндекс.Карты</option>
          <option value="Google Maps">Google Maps</option>
          <option value="Другое">Другое</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Текст отзыва *</label>
        <textarea 
          v-model="reviewForm.text" 
          rows="4" 
          required
          class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
        ></textarea>
      </div>
      
      <div class="flex justify-end gap-3">
        <button 
          type="button" 
          @click="$emit('cancel')"
          class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
        >
          Отмена
        </button>
        <button 
          type="submit" 
          class="px-3 py-2 bg-ashleigh hover:bg-opacity-90 text-white rounded-lg text-sm flex items-center"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
          {{ isEditing ? 'Сохранить' : 'Добавить' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const props = defineProps({
  schoolId: {
    type: Number,
    required: true
  },
  reviewData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])

// Определяем, редактируем ли мы существующий отзыв
const isEditing = !!props.reviewData

// Форма отзыва
const reviewForm = reactive({
  authorName: props.reviewData?.authorName || '',
  rating: props.reviewData?.rating || 5,
  text: props.reviewData?.text || '',
  source: props.reviewData?.source || '2GIS'
})

// Состояние отправки
const isSubmitting = ref(false)
const error = ref(null)

// Отправка формы
const submitReview = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  error.value = null
  
  try {
    if (!process.client) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Необходима авторизация')
    }
    
    const reviewData = {
      schoolId: props.schoolId,
      authorName: reviewForm.authorName,
      rating: reviewForm.rating,
      text: reviewForm.text,
      source: reviewForm.source || '2GIS'
    }
    
    // Если редактируем существующий отзыв
    if (isEditing) {
      const { data, error: apiError } = await useFetch(`/api/reviews/${props.reviewData.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: reviewData
      })
      
      if (apiError.value) {
        throw new Error(apiError.value.message || 'Ошибка при обновлении отзыва')
      }
      
      emit('success', data.value?.body || data.value)
    } 
    // Если добавляем новый отзыв
    else {
      const { data, error: apiError } = await useFetch('/api/reviews/external', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: reviewData
      })
      
      if (apiError.value) {
        throw new Error(apiError.value.message || 'Ошибка при добавлении отзыва')
      }
      
      emit('success', data.value?.body || data.value)
    }
    
  } catch (err) {
    console.error('Ошибка при отправке отзыва:', err)
    error.value = err.message || 'Произошла ошибка при отправке'
  } finally {
    isSubmitting.value = false
  }
}
</script> 