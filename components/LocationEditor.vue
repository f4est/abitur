<template>
  <div class="w-full h-full relative">
    <!-- Панель управления над картой -->
    <div class="absolute top-0 left-0 right-0 z-[2000] bg-white/90 backdrop-blur-sm p-3 rounded-b-lg shadow-lg">
      <!-- Информация о координатах -->
      <div class="flex justify-between items-center">
        <div class="text-sm">
          <span class="font-medium">Координаты:</span>
          <span>{{ coordinates.lat.toFixed(6) }}, {{ coordinates.lng.toFixed(6) }}</span>
        </div>
        
        <!-- Кнопки управления -->
        <div class="flex space-x-2">
          <button
            @click="saveLocation"
            class="px-3 py-1.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 text-sm"
          >
            Сохранить
          </button>
          <button
            @click="$emit('cancel')"
            class="px-3 py-1.5 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>

    <!-- Контейнер для карты -->
    <div class="w-full h-full pt-[50px]">
      <div ref="mapContainer" class="w-full h-full rounded-lg"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useYandexMap } from '~/composables/useYandexMap'

const props = defineProps({
  initialLocation: {
    type: Object,
    default: () => ({ lat: 43.238949, lng: 76.889709 }) // Координаты Алматы по умолчанию
  },
  address: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['location-selected', 'cancel'])

const mapContainer = ref(null)
const coordinates = ref(props.initialLocation || { lat: 43.238949, lng: 76.889709 }) // Проверка на null
const detectedAddress = ref('')

let map = null
let marker = null

onMounted(async () => {
  const { initMap, reverseGeocode } = await useYandexMap()
  
  try {
    // Инициализируем карту
    map = await initMap(mapContainer.value, coordinates.value)
    
    // Добавляем маркер
    marker = new window.ymaps.Placemark(
      [coordinates.value.lat, coordinates.value.lng], 
      {}, 
      { draggable: true }
    )
    
    map.geoObjects.add(marker)
    
    // Обработчик перетаскивания маркера
    marker.events.add('dragend', async () => {
      const position = marker.geometry.getCoordinates()
      coordinates.value = {
        lat: position[0],
        lng: position[1]
      }
      
      // Получаем адрес по координатам
      try {
        const result = await reverseGeocode(coordinates.value)
        if (result.success) {
          detectedAddress.value = result.address
        }
      } catch (error) {
        console.error('Ошибка при получении адреса:', error)
      }
    })
    
    // Обработчик клика по карте
    map.events.add('click', async (e) => {
      const position = e.get('coords')
      coordinates.value = {
        lat: position[0],
        lng: position[1]
      }
      marker.geometry.setCoordinates(position)
      
      // Получаем адрес по координатам
      try {
        const result = await reverseGeocode(coordinates.value)
        if (result.success) {
          detectedAddress.value = result.address
        }
      } catch (error) {
        console.error('Ошибка при получении адреса:', error)
      }
    })
    
    // Получаем начальный адрес
    if (!props.address && coordinates.value) {
      try {
        const result = await reverseGeocode(coordinates.value)
        if (result.success) {
          detectedAddress.value = result.address
        }
      } catch (error) {
        console.error('Ошибка при получении начального адреса:', error)
      }
    }
  } catch (error) {
    console.error('Ошибка при инициализации карты:', error)
  }
})

const saveLocation = () => {
  emit('location-selected', {
    lat: coordinates.value.lat,
    lng: coordinates.value.lng,
    address: detectedAddress.value
  })
}

// Следим за изменением начального местоположения
watch(() => props.initialLocation, (newLocation) => {
  if (newLocation && newLocation.lat && newLocation.lng && map && marker) {
    coordinates.value = newLocation
    marker.geometry.setCoordinates([newLocation.lat, newLocation.lng])
    map.setCenter([newLocation.lat, newLocation.lng])
  }
})
</script> 