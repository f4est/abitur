<template>
  <div class="bg-white p-6 rounded-lg shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Отзывы</h2>
      <div class="flex items-center">
        <span class="mr-2 text-lg font-medium">{{ averageRating.toFixed(1) }}</span>
        <div class="flex">
          <template v-for="i in 5" :key="i">
            <svg 
              :class="[
                'w-5 h-5',
                i <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
              ]"
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
          </template>
        </div>
        <span class="ml-2 text-gray-600">({{ reviews.length }} отзывов)</span>
      </div>
    </div>

    <div v-if="isAuthenticated" class="mb-8">
      <button 
        v-if="!showReviewForm" 
        @click="showReviewForm = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
      >
        Оставить отзыв
      </button>
      
      <div v-else class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-lg font-medium mb-3">Ваш отзыв</h3>
        <div class="mb-3">
          <label class="block text-sm font-medium text-gray-700 mb-1">Рейтинг</label>
          <div class="flex">
            <template v-for="i in 5" :key="i">
              <svg 
                @click="newReview.rating = i"
                :class="[
                  'w-8 h-8 cursor-pointer',
                  i <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                ]"
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </template>
          </div>
        </div>
        
        <div class="mb-4">
          <label for="reviewText" class="block text-sm font-medium text-gray-700 mb-1">Текст отзыва</label>
          <textarea 
            id="reviewText" 
            v-model="newReview.text" 
            rows="4" 
            class="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Расскажите о вашем опыте..."
          ></textarea>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showReviewForm = false"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition"
          >
            Отмена
          </button>
          <button 
            @click="submitReview"
            :disabled="!isFormValid || isSubmitting"
            :class="[
              'px-4 py-2 rounded-md transition',
              isFormValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-400 text-gray-100 cursor-not-allowed'
            ]"
          >
            {{ isSubmitting ? 'Отправка...' : 'Отправить' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
      <p class="mt-2 text-gray-700">Загрузка отзывов...</p>
    </div>

    <div v-else-if="reviews.length === 0" class="py-8 text-center text-gray-700">
      Пока нет отзывов. Станьте первым, кто оставит отзыв!
    </div>
    
    <div v-else class="space-y-6">
      <div v-for="review in reviews" :key="review.id" class="border-b border-gray-200 pb-5 last:border-b-0">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-full overflow-hidden mr-3">
              <ImageLoader 
                :src="review.user?.avatarUrl"
                :alt="review.authorName || 'Пользователь'"
                placeholder-type="avatar"
                :show-initials="true"
                :name="review.authorName"
              />
            </div>
            <div>
              <h4 class="font-medium text-gray-900">{{ review.authorName }}</h4>
              <div class="flex items-center">
                <div class="flex">
                  <template v-for="i in 5" :key="i">
                    <svg 
                      :class="[
                        'w-4 h-4',
                        i <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      ]"
                      fill="currentColor" 
                      viewBox="0 0 20 20" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  </template>
                </div>
                <span class="ml-2 text-sm text-gray-700">{{ formatDate(review.createdAt) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="isAdmin || currentUser?.id === review.userId" class="flex space-x-2">
            <button 
              v-if="isAdmin && !review.isApproved"
              @click="approveReview(review.id)"
              class="text-sm text-green-600 hover:text-green-800"
            >
              Одобрить
            </button>
            <button 
              v-if="currentUser?.id === review.userId"
              @click="editReview(review)"
              class="text-sm text-blue-600 hover:text-blue-800"
            >
              Редактировать
            </button>
            <button 
              @click="deleteReview(review.id)"
              class="text-sm text-red-600 hover:text-red-800"
            >
              Удалить
            </button>
          </div>
        </div>
        
        <p class="text-gray-700">{{ review.text }}</p>
      </div>
    </div>
    
    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <div class="flex space-x-1">
        <button 
          v-for="page in totalPages" 
          :key="page"
          @click="loadPage(page)"
          :class="[
            'px-3 py-1 rounded-md',
            currentPage === page 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import ImageLoader from '~/components/ImageLoader.vue'

const props = defineProps({
  schoolId: {
    type: Number,
    required: true
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: () => null
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const reviews = ref([])
const isLoading = ref(true)
const showReviewForm = ref(false)
const isSubmitting = ref(false)
const currentPage = ref(1)
const pageSize = 5
const totalReviews = ref(0)

const newReview = ref({
  rating: 0,
  text: ''
})

const editingReview = ref(null)

// Вычисляемые свойства
const totalPages = computed(() => Math.ceil(totalReviews.value / pageSize))

const averageRating = computed(() => {
  if (!reviews.value.length) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.value.length
})

const isFormValid = computed(() => {
  return newReview.value.rating > 0 && newReview.value.text.trim().length > 0
})

// Методы
const loadReviews = async () => {
  isLoading.value = true
  
  try {
    const response = await fetch(`/api/reviews?schoolId=${props.schoolId}`)
    const data = await response.json()
    
    if (response.ok) {
      reviews.value = data.body
      totalReviews.value = data.body.length
    } else {
      console.error('Ошибка при загрузке отзывов:', data.message)
    }
  } catch (error) {
    console.error('Ошибка при загрузке отзывов:', error)
  } finally {
    isLoading.value = false
  }
}

const loadPage = (page) => {
  currentPage.value = page
  // В реальном приложении здесь нужно загружать соответствующую страницу
  // с учетом пагинации на бэкенде
}

const submitReview = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    // Проверяем, что у нас есть текущий пользователь и его id
    if (!props.currentUser || !props.currentUser.id) {
      alert('Для отправки отзыва необходимо авторизоваться')
      isSubmitting.value = false
      return
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Для отправки отзыва необходимо авторизоваться')
      isSubmitting.value = false
      return
    }
    
    // Если редактируем существующий отзыв
    if (editingReview.value) {
      const response = await fetch(`/api/reviews/${editingReview.value.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: props.currentUser.id,
          rating: newReview.value.rating,
          text: newReview.value.text
        })
      })
      
      if (response.ok) {
        // Обновляем отзыв в списке
        const updatedReview = await response.json()
        const index = reviews.value.findIndex(r => r.id === editingReview.value.id)
        if (index !== -1) {
          reviews.value[index] = updatedReview.body
        }
        
        editingReview.value = null
      } else {
        console.error('Ошибка при обновлении отзыва')
      }
    } 
    // Если создаем новый отзыв
    else {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          schoolId: props.schoolId,
          userId: props.currentUser.id,
          rating: newReview.value.rating,
          text: newReview.value.text
        })
      })
      
      if (response.ok) {
        const newReviewData = await response.json()
        // Добавляем новый отзыв в начало списка
        reviews.value.unshift(newReviewData.body)
        totalReviews.value++
      } else {
        console.error('Ошибка при добавлении отзыва')
      }
    }
    
    // Сбрасываем форму
    newReview.value = { rating: 0, text: '' }
    showReviewForm.value = false
  } catch (error) {
    console.error('Ошибка при отправке отзыва:', error)
  } finally {
    isSubmitting.value = false
  }
}

const editReview = (review) => {
  editingReview.value = review
  newReview.value = {
    rating: review.rating,
    text: review.text
  }
  showReviewForm.value = true
}

const deleteReview = async (reviewId) => {
  if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return
  
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Для удаления отзыва необходимо авторизоваться')
    return
  }
  
  try {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      // Удаляем отзыв из списка
      reviews.value = reviews.value.filter(r => r.id !== reviewId)
      totalReviews.value--
    } else {
      console.error('Ошибка при удалении отзыва')
    }
  } catch (error) {
    console.error('Ошибка при удалении отзыва:', error)
  }
}

const approveReview = async (reviewId) => {
  const token = localStorage.getItem('token')
  if (!token) {
    alert('Для одобрения отзыва необходимо авторизоваться как администратор')
    return
  }
  
  try {
    const response = await fetch(`/api/reviews/approve/${reviewId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        adminId: props.currentUser.id,
        isApproved: true
      })
    })
    
    if (response.ok) {
      // Обновляем статус отзыва в списке
      const updatedReview = await response.json()
      const index = reviews.value.findIndex(r => r.id === reviewId)
      if (index !== -1) {
        reviews.value[index] = updatedReview.body
      }
    } else {
      console.error('Ошибка при одобрении отзыва')
    }
  } catch (error) {
    console.error('Ошибка при одобрении отзыва:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

// Жизненный цикл
onMounted(() => {
  loadReviews()
})

// Следим за изменением schoolId и перезагружаем отзывы
watch(() => props.schoolId, () => {
  loadReviews()
})
</script> 