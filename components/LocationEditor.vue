<template>
  <div class="relative w-full h-full">
    <!-- Панель управления над картой -->
    <div class="absolute top-0 left-0 right-0 z-[2000] bg-white/90 backdrop-blur-sm p-4 rounded-b-lg shadow-lg">
      <!-- Поле поиска -->
      <div class="mb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск места..."
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="handleSearch"
          />
          <!-- Результаты поиска -->
          <div
            v-if="searchResults.length > 0"
            class="absolute z-[2001] w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            <div
              v-for="result in searchResults"
              :key="result.id"
              class="px-4 py-2 cursor-pointer hover:bg-gray-100"
              @click="selectLocation(result)"
            >
              {{ result.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- Информация о координатах -->
      <div class="flex justify-between items-center mb-4">
        <div class="text-sm">
          <span class="font-medium">Координаты:</span>
          <span>{{ coordinates.lat.toFixed(6) }}, {{ coordinates.lng.toFixed(6) }}</span>
        </div>
        
        <!-- Кнопки управления -->
        <div class="flex space-x-2">
          <button
            @click="saveLocation"
            class="px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Сохранить
          </button>
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Контейнер для карты -->
    <div class="w-full h-full">
      <div ref="mapContainer" class="w-full h-full"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useYandexMap } from '~/composables/useYandexMap'

const props = defineProps({
  initialLocation: {
    type: Object,
    default: () => ({ lat: 55.7558, lng: 37.6173 })
  }
})

const emit = defineEmits(['save', 'cancel'])

const mapContainer = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const coordinates = ref(props.initialLocation)

let map = null
let marker = null

onMounted(async () => {
  const { initMap, searchLocation } = await useYandexMap()
  
  map = await initMap(mapContainer.value, coordinates.value)
  
  // Добавляем маркер
  marker = new window.ymaps.Placemark(
    [coordinates.value.lat, coordinates.value.lng], 
    {}, 
    { draggable: true }
  )
  
  map.geoObjects.add(marker)
  
  // Обработчик перетаскивания маркера
  marker.events.add('dragend', () => {
    const position = marker.geometry.getCoordinates()
    coordinates.value = {
      lat: position[0],
      lng: position[1]
    }
  })
  
  // Обработчик клика по карте
  map.events.add('click', (e) => {
    const position = e.get('coords')
    coordinates.value = {
      lat: position[0],
      lng: position[1]
    }
    marker.geometry.setCoordinates(position)
  })
})

const handleSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = []
    return
  }
  
  const { searchLocation } = await useYandexMap()
  const results = await searchLocation(searchQuery.value)
  searchResults.value = results
}

const selectLocation = (result) => {
  coordinates.value = {
    lat: result.lat,
    lng: result.lng
  }
  
  if (marker) {
    marker.geometry.setCoordinates([result.lat, result.lng])
  }
  
  if (map) {
    map.setCenter([result.lat, result.lng])
  }
  
  searchResults.value = []
  searchQuery.value = result.name
}

const saveLocation = () => {
  emit('save', coordinates.value)
}

// Следим за изменением начального местоположения
watch(() => props.initialLocation, (newLocation) => {
  if (newLocation && map && marker) {
    coordinates.value = newLocation
    marker.geometry.setCoordinates([newLocation.lat, newLocation.lng])
    map.setCenter([newLocation.lat, newLocation.lng])
  }
})
</script> 