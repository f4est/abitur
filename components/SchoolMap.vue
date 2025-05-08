<template>
  <div class="bg-white p-6 rounded-lg shadow-sm mb-8">
    <h2 class="text-2xl font-semibold mb-4 text-gray-800">Расположение на карте</h2>
    
    <div v-if="isLoading" class="py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
      <p class="mt-2 text-gray-700">Загрузка карты...</p>
    </div>
    
    <div v-else-if="!hasMapData" class="bg-gray-100 rounded-lg p-8 text-center">
      <p class="text-gray-700">Не удалось загрузить карту для данного адреса.</p>
    </div>
    
    <div v-else>
      <!-- В реальном приложении здесь будет интеграция с API карт (Яндекс.Карты, Google Maps и т.д.) -->
      <div class="rounded-lg overflow-hidden border border-gray-200 h-64 relative bg-gray-100">
        <!-- Эмуляция карты -->
        <div class="absolute inset-0 bg-skyway/20">
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div class="w-8 h-8 bg-ashleigh rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          
          <!-- Эмуляция элементов карты -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-full h-full">
              <div class="absolute top-0 left-0 w-full h-full">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0,32 L100,96 L200,64 L300,128 L400,96 L500,160 L600,32" stroke="#AAC9CE" stroke-width="2" fill="none" class="opacity-70" />
                  <path d="M0,128 L100,160 L200,128 L300,192 L400,160 L500,224 L600,128" stroke="#AAC9CE" stroke-width="2" fill="none" class="opacity-70" />
                  <path d="M0,192 L100,224 L200,192 L300,256 L400,224 L500,288 L600,192" stroke="#AAC9CE" stroke-width="2" fill="none" class="opacity-70" />
                </svg>
              </div>
            </div>
          </div>
          
          <!-- Текст на карте с адресом -->
          <div class="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-gray-800 font-medium">{{ address }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <a 
          :href="mapUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-ashleigh hover:underline flex items-center"
        >
          <span>Открыть в 2GIS</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  address: {
    type: String,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  }
});

const isLoading = ref(true);
const hasMapData = ref(true);
const coordinates = ref(null);

// Создаем URL для открытия карты во внешнем сервисе
const mapUrl = computed(() => {
  const searchQuery = `${props.schoolName}, ${props.address}`;
  return `https://2gis.ru/search/${encodeURIComponent(searchQuery)}`;
});

// Эмуляция загрузки данных для карты
const loadMapData = async () => {
  isLoading.value = true;
  
  try {
    // В реальном приложении здесь будет запрос к геокодеру для получения координат по адресу
    // Имитация запроса к API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Фиктивные данные для примера
    if (props.address) {
      coordinates.value = { lat: 55.755826, lng: 37.6173 }; // Фиктивные координаты для примера
      hasMapData.value = true;
    } else {
      hasMapData.value = false;
    }
  } catch (error) {
    console.error('Ошибка при загрузке данных для карты:', error);
    hasMapData.value = false;
  } finally {
    isLoading.value = false;
  }
};

// Жизненный цикл
onMounted(() => {
  loadMapData();
});

// Следим за изменением адреса и перезагружаем карту
watch(() => props.address, () => {
  loadMapData();
});
</script> 