<template>
  <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <h2 class="text-2xl font-semibold text-gray-800">Отзывы из 2GIS</h2>
        <div v-if="rating" class="ml-4 flex items-center">
          <span class="mr-2 text-lg font-medium">{{ rating.toFixed(1) }}</span>
          <div class="flex">
            <template v-for="i in 5" :key="i">
              <svg 
                :class="[
                  'w-5 h-5',
                  i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'
                ]"
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </template>
          </div>
          <span class="ml-2 text-gray-700">({{ reviews.length }} отзывов)</span>
        </div>
      </div>
      
      <a 
        v-if="externalUrl" 
        :href="externalUrl" 
        target="_blank" 
        rel="noopener noreferrer"
        class="text-ashleigh hover:underline flex items-center"
      >
        <span>Все отзывы на 2GIS</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>

    <div v-if="isLoading" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
      <p class="mt-2 text-gray-700">Загрузка отзывов из 2GIS...</p>
    </div>

    <div v-else-if="reviews.length === 0" class="py-8 text-center text-gray-700">
      Отзывы из 2GIS отсутствуют для данного учебного заведения.
    </div>
    
    <div v-else class="space-y-6">
      <div v-for="review in reviews" :key="review.id" class="border-b border-gray-200 pb-5 last:border-b-0">
        <div class="flex justify-between items-start mb-2">
          <div class="flex items-center">
            <img 
              :src="review.user?.avatarUrl || '/images/placeholders-png/avatar.png'" 
              alt="Аватар пользователя"
              class="w-10 h-10 rounded-full object-cover mr-3" 
            />
            <div>
              <h4 class="font-medium text-gray-900">{{ review.userName }}</h4>
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
                <span class="ml-2 text-sm text-gray-700">{{ formatDate(review.date) }}</span>
              </div>
            </div>
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
              ? 'bg-ashleigh text-white' 
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
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  schoolId: {
    type: Number,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  schoolAddress: {
    type: String,
    default: ''
  }
});

const reviews = ref([]);
const isLoading = ref(true);
const currentPage = ref(1);
const pageSize = 5;
const totalReviews = ref(0);
const rating = ref(0);
const externalUrl = ref('');

// Вычисляемые свойства
const totalPages = computed(() => Math.ceil(totalReviews.value / pageSize));

// Методы
const loadExternalReviews = async () => {
  isLoading.value = true;
  
  try {
    // Здесь должен быть API запрос к сервису отзывов
    // Временное решение - показываем только интерфейс без отзывов
    reviews.value = [];
    totalReviews.value = 0;
    rating.value = 0;
    externalUrl.value = `https://2gis.ru/search/${encodeURIComponent(props.schoolName)}`;
  } catch (error) {
    console.error('Ошибка при загрузке отзывов:', error);
  } finally {
    isLoading.value = false;
  }
};

const loadPage = (page) => {
  currentPage.value = page;
  // В реальном приложении здесь нужно загружать соответствующую страницу
  // отзывов с сервиса 2GIS
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

// Жизненный цикл
onMounted(() => {
  loadExternalReviews();
});

// Следим за изменением schoolId и перезагружаем отзывы
watch(() => props.schoolId, () => {
  loadExternalReviews();
});
</script> 