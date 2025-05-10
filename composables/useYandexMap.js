/**
 * Composable для работы с Яндекс Картами
 */
export const useYandexMap = async () => {
  const config = useRuntimeConfig();
  const apiKey = config.public.yandexMapsApiKey;

  // Проверка, загружен ли API Яндекс Карт
  const isYmapsLoaded = () => {
    return typeof window !== 'undefined' && window.ymaps;
  };

  // Функция загрузки API Яндекс Карт
  const loadYmapsAPI = () => {
    return new Promise((resolve) => {
      if (isYmapsLoaded()) {
        resolve(window.ymaps);
        return;
      }

      // Создаем скрипт для загрузки API
      const script = document.createElement('script');
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      
      script.onload = () => {
        // После загрузки API инициализируем его
        window.ymaps.ready(() => {
          resolve(window.ymaps);
        });
      };

      document.head.appendChild(script);
    });
  };

  // Загружаем API, если еще не загружен
  if (!isYmapsLoaded()) {
    await loadYmapsAPI();
  } else {
    // Ждем, пока API будет готов к использованию
    await new Promise((resolve) => {
      if (window.ymaps.Map) {
        resolve();
      } else {
        window.ymaps.ready(resolve);
      }
    });
  }

  /**
   * Инициализирует карту в указанном контейнере
   * @param {HTMLElement} container - DOM элемент для размещения карты
   * @param {Object} initialCoords - начальные координаты центра карты
   * @param {number} initialZoom - начальный уровень масштаба
   * @returns {Object} - объект карты
   */
  const initMap = async (container, initialCoords = { lat: 55.7558, lng: 37.6173 }, initialZoom = 10) => {
    if (!container) {
      throw new Error('Не указан контейнер для карты');
    }

    return new window.ymaps.Map(container, {
      center: [initialCoords.lat, initialCoords.lng],
      zoom: initialZoom,
      controls: ['zoomControl', 'fullscreenControl', 'geolocationControl']
    });
  };

  /**
   * Поиск местоположения по запросу
   * @param {string} query - строка запроса
   * @returns {Array} - массив результатов поиска
   */
  const searchLocation = async (query) => {
    if (!query) return [];

    try {
      const res = await window.ymaps.geocode(query);
      const geoObjects = res.geoObjects;
      const results = [];

      // Преобразуем результаты поиска в удобный формат
      for (let i = 0; i < Math.min(geoObjects.getLength(), 5); i++) {
        const item = geoObjects.get(i);
        const coords = item.geometry.getCoordinates();
        
        results.push({
          id: i,
          name: item.getAddressLine(),
          lat: coords[0],
          lng: coords[1]
        });
      }

      return results;
    } catch (error) {
      console.error('Ошибка при поиске местоположения:', error);
      return [];
    }
  };

  /**
   * Прямое геокодирование (получение координат по адресу)
   * @param {string} address - адрес
   * @returns {Promise<Object>} - координаты
   */
  const geocode = async (address) => {
    try {
      const res = await window.ymaps.geocode(address);
      const firstGeoObject = res.geoObjects.get(0);
      
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        return {
          lat: coords[0],
          lng: coords[1],
          success: true
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Ошибка геокодирования:', error);
      return { success: false };
    }
  };

  /**
   * Обратное геокодирование (получение адреса по координатам)
   * @param {Object} coords - координаты
   * @returns {Promise<string>} - адрес
   */
  const reverseGeocode = async (coords) => {
    try {
      const res = await window.ymaps.geocode([coords.lat, coords.lng]);
      const firstGeoObject = res.geoObjects.get(0);
      
      if (firstGeoObject) {
        return {
          address: firstGeoObject.getAddressLine(),
          success: true
        };
      }
      
      return { success: false };
    } catch (error) {
      console.error('Ошибка обратного геокодирования:', error);
      return { success: false };
    }
  };

  return {
    initMap,
    searchLocation,
    geocode,
    reverseGeocode
  };
}; 