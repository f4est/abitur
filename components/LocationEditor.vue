<template>
  <div class="h-full relative">
    <div ref="mapContainer" class="h-full w-full rounded-lg overflow-hidden"></div>
    
    <div class="absolute top-4 left-4 z-10 w-full max-w-sm">
      <div class="flex">
        <input 
          v-model="searchQuery" 
          @keyup.enter="searchAddress"
          type="text" 
          placeholder="Поиск адреса..." 
          class="px-3 py-2 border border-gray-300 rounded-l-lg flex-grow focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none shadow-sm"
        />
        <button 
          @click="searchAddress"
          class="px-3 py-2 bg-ashleigh text-white rounded-r-lg hover:bg-opacity-90 shadow-sm"
        >
          🔍
        </button>
      </div>
      
      <!-- Результаты поиска -->
      <div v-if="searchResults.length > 0" class="mt-2 bg-white rounded-lg border border-gray-300 shadow-md max-h-60 overflow-y-auto">
        <div 
          v-for="(result, index) in searchResults" 
          :key="index"
          @click="selectSearchResult(result)"
          class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
        >
          {{ result.display_name }}
        </div>
      </div>
    </div>
    
    <!-- Координаты маркера -->
    <div class="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md px-3 py-2 text-xs text-gray-600 flex flex-col sm:flex-row sm:items-center">
      <span class="mr-2 mb-1 sm:mb-0">Координаты маркера:</span>
      <div v-if="marker">
        <span class="font-mono">{{ marker.lat.toFixed(6) }}, {{ marker.lng.toFixed(6) }}</span>
      </div>
      <div v-else>
        <span class="italic">Маркер не установлен</span>
      </div>
    </div>
    
    <!-- Кнопка сохранения -->
    <div class="absolute bottom-4 right-4 z-10">
      <button 
        @click="saveLocation"
        class="px-3 py-2 bg-ashleigh text-white rounded-lg hover:bg-opacity-90 shadow-md disabled:opacity-50"
        :disabled="!marker"
      >
        Сохранить местоположение
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

// Входные параметры
const props = defineProps({
  initialLocation: {
    type: Object,
    default: () => null
  },
  address: {
    type: String,
    default: ''
  }
})

// Определение событий
const emit = defineEmits(['location-selected'])

// Ссылка на контейнер карты
const mapContainer = ref(null)

// Карта и маркер
const map = ref(null)
const marker = ref(null)
const isMapInitialized = ref(false)

// Поиск
const searchQuery = ref(props.address || '')
const searchResults = ref([])
const isSearching = ref(false)

// Инициализация карты
const initMap = () => {
  // Если мы не на клиенте или карта уже инициализирована, то выходим
  if (!process.client || isMapInitialized.value) return
  
  try {
    // Создаем карту
    map.value = L.map(mapContainer.value).setView([55.7558, 37.6173], 10) // Москва по умолчанию
    
    // Добавляем слой OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value)
    
    // Если есть начальное местоположение, устанавливаем маркер
    if (props.initialLocation) {
      marker.value = {
        lat: props.initialLocation.lat,
        lng: props.initialLocation.lng
      }
      
      // Создаем маркер на карте
      L.marker([marker.value.lat, marker.value.lng])
        .addTo(map.value)
        .bindPopup(props.address || 'Выбранное местоположение')
        .openPopup()
      
      // Центрируем карту на маркере
      map.value.setView([marker.value.lat, marker.value.lng], 15)
    }
    
    // Если нет начального местоположения, но есть адрес, ищем его
    else if (props.address) {
      searchAddress()
    }
    
    // Добавляем обработчик клика по карте
    map.value.on('click', (e) => {
      // Если маркер уже существует, удаляем его
      map.value.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.value.removeLayer(layer)
        }
      })
      
      // Создаем новый маркер
      marker.value = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }
      
      // Добавляем маркер на карту
      L.marker([marker.value.lat, marker.value.lng])
        .addTo(map.value)
        .bindPopup('Выбранное местоположение')
        .openPopup()
      
      // Получаем адрес по координатам (обратное геокодирование)
      reverseGeocode(marker.value)
    })
    
    isMapInitialized.value = true
  } catch (error) {
    console.error('Ошибка инициализации карты:', error)
  }
}

// Поиск адреса
const searchAddress = async () => {
  if (!searchQuery.value || isSearching.value) return
  
  isSearching.value = true
  searchResults.value = []
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}`)
    
    if (!response.ok) {
      throw new Error('Ошибка поиска адреса')
    }
    
    const data = await response.json()
    searchResults.value = data
    
    // Если есть результаты, автоматически выбираем первый
    if (data.length > 0) {
      selectSearchResult(data[0])
    }
  } catch (error) {
    console.error('Ошибка поиска адреса:', error)
  } finally {
    isSearching.value = false
  }
}

// Выбор результата поиска
const selectSearchResult = (result) => {
  if (!map.value) return
  
  // Очищаем результаты поиска
  searchResults.value = []
  
  // Удаляем существующие маркеры
  map.value.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.value.removeLayer(layer)
    }
  })
  
  // Создаем новый маркер
  marker.value = {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon)
  }
  
  // Добавляем маркер на карту
  L.marker([marker.value.lat, marker.value.lng])
    .addTo(map.value)
    .bindPopup(result.display_name)
    .openPopup()
  
  // Центрируем карту на маркере
  map.value.setView([marker.value.lat, marker.value.lng], 15)
  
  // Обновляем поле ввода
  searchQuery.value = result.display_name
}

// Обратное геокодирование
const reverseGeocode = async (coordinates) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}`)
    
    if (!response.ok) {
      throw new Error('Ошибка обратного геокодирования')
    }
    
    const data = await response.json()
    
    if (data.display_name) {
      // Обновляем поле ввода
      searchQuery.value = data.display_name
      
      // Обновляем попап маркера
      map.value.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.bindPopup(data.display_name).openPopup()
        }
      })
    }
  } catch (error) {
    console.error('Ошибка обратного геокодирования:', error)
  }
}

// Сохранение местоположения
const saveLocation = () => {
  if (!marker.value) return
  
  emit('location-selected', { 
    lat: marker.value.lat, 
    lng: marker.value.lng,
    address: searchQuery.value
  })
}

// Инициализация при монтировании компонента
onMounted(() => {
  // Проверяем, что Leaflet загружен
  if (process.client && typeof L !== 'undefined') {
    initMap()
  } else {
    // Если Leaflet не загружен, загружаем его динамически
    const loadLeaflet = () => {
      // Загружаем CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css'
      document.head.appendChild(link)
      
      // Загружаем JS
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js'
      script.onload = () => {
        initMap()
      }
      document.head.appendChild(script)
    }
    
    loadLeaflet()
  }
})

// Наблюдаем за изменением адреса
watch(() => props.address, (newAddress) => {
  if (newAddress && !searchQuery.value) {
    searchQuery.value = newAddress
    if (isMapInitialized.value) {
      searchAddress()
    }
  }
})
</script>

<style scoped>
/* Стили для Leaflet, если нужны дополнительные */
</style> 