<template>
  <div>
    <!-- Главный баннер -->
    <section class="bg-ashleigh text-white py-8 sm:py-12 md:py-16 mb-6 sm:mb-12">
      <div class="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div class="w-full md:w-1/2 mb-6 md:mb-0">
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Платформа для абитуриентов</h1>
          <p class="text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
            Найдите подходящее учебное заведение и направление обучения. 
            Пройдите тест на профориентацию и узнайте, какие профессии вам подходят.
          </p>
          <div class="flex flex-wrap gap-2 sm:gap-4">
            <NuxtLink to="/catalog" class="px-4 sm:px-6 py-2 sm:py-3 bg-yolk-yellow text-gray-800 font-medium rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base">
              Смотреть каталог
            </NuxtLink>
            <NuxtLink to="/test" class="px-4 sm:px-6 py-2 sm:py-3 bg-white text-ashleigh font-medium rounded-lg hover:bg-gray-100 transition text-sm sm:text-base">
              Пройти тест
            </NuxtLink>
          </div>
        </div>
        <div class="w-full md:w-1/2 flex justify-center">
          <!-- Место для персонажей -->
          <div class="w-full h-60 sm:h-80 bg-skyway/20 rounded-lg flex items-center justify-center p-4">
            <img src="/images/placeholders/school-photo.svg" alt="Абитуриенты" class="max-h-full rounded-lg" />
          </div>
        </div>
      </div>
    </section>

    <!-- Как пользоваться платформой -->
    <section class="py-8 sm:py-12 mb-6 sm:mb-12">
      <div class="container mx-auto px-4">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-12">Как пользоваться платформой</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-skyway rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span class="text-xl sm:text-2xl font-bold text-white">1</span>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Пройдите тест</h3>
            <p class="text-sm sm:text-base text-gray-600">Узнайте свои предпочтения и получите рекомендации по выбору профессии</p>
          </div>
          
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-skyway rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span class="text-xl sm:text-2xl font-bold text-white">2</span>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Изучите каталог</h3>
            <p class="text-sm sm:text-base text-gray-600">Просмотрите учебные заведения и подходящие направления обучения</p>
          </div>
          
          <div class="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center sm:col-span-2 md:col-span-1 sm:max-w-md md:max-w-none mx-auto sm:mx-auto md:mx-0 w-full">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-skyway rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <span class="text-xl sm:text-2xl font-bold text-white">3</span>
            </div>
            <h3 class="text-lg sm:text-xl font-semibold mb-2 text-gray-800">Сохраните избранное</h3>
            <p class="text-sm sm:text-base text-gray-600">Добавляйте учебные заведения в избранное и возвращайтесь к ним позже</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Преимущества -->
    <section class="py-8 sm:py-12 bg-skyway/10 mb-6 sm:mb-12">
      <div class="container mx-auto px-4">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-12">Почему стоит использовать нашу платформу</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <div class="flex items-start">
            <div class="mr-3 sm:mr-4 bg-yolk-yellow p-2 sm:p-3 rounded-full flex-shrink-0">
              <!-- Иконка -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800">Актуальная информация</h3>
              <p class="text-sm sm:text-base text-gray-600">Наша база данных постоянно обновляется, мы следим за изменениями в учебных заведениях</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="mr-3 sm:mr-4 bg-yolk-yellow p-2 sm:p-3 rounded-full flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800">Отзывы и рейтинги</h3>
              <p class="text-sm sm:text-base text-gray-600">Мы собираем реальные отзывы об учебных заведениях, чтобы вы могли сделать осознанный выбор</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="mr-3 sm:mr-4 bg-yolk-yellow p-2 sm:p-3 rounded-full flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800">Контакты и адреса</h3>
              <p class="text-sm sm:text-base text-gray-600">Полная контактная информация, карта и режим работы каждого учебного заведения</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="mr-3 sm:mr-4 bg-yolk-yellow p-2 sm:p-3 rounded-full flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 text-gray-800">Профориентация</h3>
              <p class="text-sm sm:text-base text-gray-600">Наш тест поможет определиться с выбором будущей профессии на основе ваших интересов и навыков</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Регистрация/Начать -->
    <section class="py-8 sm:py-12 bg-ashleigh text-white text-center">
      <div class="container mx-auto px-4">
        <h2 class="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">Начните путь к успешному поступлению прямо сейчас</h2>
        <p class="text-base sm:text-lg md:text-xl mb-4 sm:mb-8 max-w-2xl mx-auto">
          Зарегистрируйтесь, чтобы получить доступ ко всем функциям платформы и сохранять свои результаты
        </p>
        <div class="flex flex-wrap justify-center gap-2 sm:gap-4">
          <NuxtLink to="/register" class="px-4 sm:px-6 py-2 sm:py-3 bg-white text-ashleigh font-medium rounded-lg hover:bg-gray-100 transition text-sm sm:text-base">
            Регистрация
          </NuxtLink>
          <NuxtLink to="/catalog" class="px-4 sm:px-6 py-2 sm:py-3 bg-yolk-yellow text-gray-800 font-medium rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base">
            Смотреть каталог
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useHead({
  title: 'Главная - Платформа для абитуриентов',
  meta: [
    { name: 'description', content: 'Платформа для абитуриентов, помогающая выбрать учебное заведение и направление обучения.' }
  ]
})
</script> 