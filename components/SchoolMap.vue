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
      <!-- Контейнер для Яндекс.Карты -->
      <div ref="mapContainer" class="rounded-lg overflow-hidden border border-gray-200 h-64 relative">
        <!-- Эта надпись будет видна только до инициализации карты -->
        <div v-if="!mapInitialized" class="absolute inset-0 flex items-center justify-center bg-gray-100">
          <p class="text-gray-700">Инициализация карты...</p>
        </div>
      </div>
      
      <div class="mt-4">
        <a 
          :href="mapUrl" 
          target="_blank" 
          rel="noopener noreferrer"
          class="text-ashleigh hover:underline flex items-center"
        >
          <span>Открыть в Яндекс.Картах</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';

const props = defineProps({
  address: {
    type: String,
    required: true
  },
  schoolName: {
    type: String,
    required: true
  },
  coordinates: {
    type: String,
    default: null
  }
});

const isLoading = ref(true);
const hasMapData = ref(true);
const mapCoordinates = ref(null);
const mapContainer = ref(null);
const mapInstance = ref(null);
const mapInitialized = ref(false);
const ymapsLoaded = ref(false);

// Создаем URL для открытия карты во внешнем сервисе
const mapUrl = computed(() => {
  // Если есть координаты, используем их для более точного открытия карты
  if (props.coordinates) {
    try {
      const [lat, lng] = props.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return `https://yandex.ru/maps/?ll=${lng},${lat}&z=17&mode=whatshere&whatshere[point]=${lng},${lat}&whatshere[text]=${encodeURIComponent(props.schoolName)}`;
      }
    } catch (error) {
      console.error('Ошибка при обработке координат:', error);
    }
  }
  
  // Если координаты не указаны или некорректны, используем поиск по адресу
  const searchQuery = `${props.schoolName}, ${props.address}`;
  return `https://yandex.ru/maps/?text=${encodeURIComponent(searchQuery)}`;
});

// Загружаем API Яндекс.Карт
const loadYandexMapsAPI = () => {
  return new Promise((resolve, reject) => {
    // Проверяем, загружен ли уже API
    if (window.ymaps) {
      ymapsLoaded.value = true;
      resolve(window.ymaps);
      return;
    }

    // Получаем API ключ из конфигурации
    const config = useRuntimeConfig();
    const apiKey = config.public.yandexMapsApiKey;

    // Создаем скрипт для загрузки API
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;

    script.onload = () => {
      window.ymaps.ready(() => {
        ymapsLoaded.value = true;
        resolve(window.ymaps);
      });
    };

    script.onerror = (error) => {
      console.error('Ошибка при загрузке Яндекс.Карт:', error);
      reject(error);
    };

    document.head.appendChild(script);
  });
};

// Инициализируем карту
const initializeMap = async (coordinates) => {
  // Проверяем, загружен ли API
  if (!ymapsLoaded.value) {
    try {
      await loadYandexMapsAPI();
    } catch (error) {
      console.error('Не удалось загрузить API Яндекс.Карт:', error);
      hasMapData.value = false;
      isLoading.value = false;
      return;
    }
  }

  // Если карта уже инициализирована, удаляем ее
  if (mapInstance.value) {
    mapInstance.value.destroy();
    mapInstance.value = null;
  }

  // Ждем немного, чтобы DOM успел обновиться
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!mapContainer.value) {
    console.error('Контейнер для карты не найден');
    // Еще раз попробуем через небольшой промежуток времени
    setTimeout(() => {
      if (mapContainer.value) {
        initializeMap(coordinates);
      } else {
        console.error('Контейнер для карты не найден после повторной попытки');
        hasMapData.value = false;
        isLoading.value = false;
      }
    }, 500);
    return;
  }

  try {
    // Создаем карту
    mapInstance.value = new window.ymaps.Map(mapContainer.value, {
      center: [coordinates.lat, coordinates.lng],
      zoom: 16,
      controls: ['zoomControl', 'fullscreenControl']
    });

    // Добавляем метку на карту
    const placemark = new window.ymaps.Placemark(
      [coordinates.lat, coordinates.lng],
      {
        hintContent: props.schoolName,
        balloonContent: `<strong>${props.schoolName}</strong><br>${props.address}`
      },
      {
        preset: 'islands#redDotIcon'
      }
    );

    mapInstance.value.geoObjects.add(placemark);
    mapInitialized.value = true;
  } catch (error) {
    console.error('Ошибка при инициализации карты:', error);
    hasMapData.value = false;
  }
};

// Геокодирование адреса для получения координат
const geocodeAddress = async () => {
  if (!ymapsLoaded.value) {
    try {
      await loadYandexMapsAPI();
    } catch (error) {
      console.error('Не удалось загрузить API Яндекс.Карт:', error);
      hasMapData.value = false;
      isLoading.value = false;
      return null;
    }
  }

  const searchQuery = `${props.address}, ${props.schoolName}`;

  try {
    const result = await window.ymaps.geocode(searchQuery);
    const firstGeoObject = result.geoObjects.get(0);
    
    if (!firstGeoObject) {
      console.error('Не удалось найти координаты для адреса:', searchQuery);
      return null;
    }
    
    const coords = firstGeoObject.geometry.getCoordinates();
    return { lat: coords[0], lng: coords[1] };
  } catch (error) {
    console.error('Ошибка при геокодировании адреса:', error);
    return null;
  }
};

// Загрузка данных для карты
const loadMapData = async () => {
  isLoading.value = true;
  mapInitialized.value = false;
  
  try {
    // Проверяем переданные координаты
    if (props.coordinates) {
      try {
        const [lat, lng] = props.coordinates.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          mapCoordinates.value = { lat, lng };
          hasMapData.value = true;
          await initializeMap(mapCoordinates.value);
          return;
        }
      } catch (error) {
        console.error('Ошибка при обработке координат:', error);
      }
    }
    
    // Если координаты не указаны или некорректны, используем геокодирование по адресу
    if (props.address) {
      const coordinates = await geocodeAddress();
      if (coordinates) {
        mapCoordinates.value = coordinates;
        hasMapData.value = true;
        await initializeMap(mapCoordinates.value);
      } else {
        hasMapData.value = false;
      }
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
  // Проверяем, что мы находимся в браузере, а не на сервере
  if (process.client) {
    loadMapData();
  }
});

// Следим за изменением адреса и перезагружаем карту
watch(() => [props.address, props.coordinates], () => {
  if (process.client) {
    loadMapData();
  }
});

// Очищаем карту при уничтожении компонента
onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy();
    mapInstance.value = null;
  }
});
</script> 