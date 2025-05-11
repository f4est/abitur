<template>
  <div>
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-ashleigh"></div>
      <span class="ml-3 text-gray-500">Загрузка данных...</span>
    </div>
    
    <div v-else-if="!user" class="text-center py-16 bg-white rounded-lg shadow-md">
      <div class="mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 mx-auto text-ashleigh/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <p class="text-gray-600 text-lg mb-6">Для просмотра профиля необходимо авторизоваться</p>
      <NuxtLink to="/login" class="btn btn-primary text-lg px-8 py-3 inline-flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Войти
      </NuxtLink>
    </div>
    
    <div v-else>
      <div class="flex flex-col md:flex-row gap-6">
        <!-- Боковая панель профиля с улучшенным дизайном -->
        <div class="md:w-1/3">
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-skyway to-ashleigh h-24"></div>
            <div class="px-6 pb-6 -mt-12">
              <div class="flex flex-col items-center">
                <div class="relative group">
                  <div class="w-32 h-32 rounded-full bg-skyway text-white flex items-center justify-center overflow-hidden border-4 border-white shadow-lg group-hover:border-yolk-yellow transition-colors">
                    <ImageLoader
                      :src="user.avatarUrl"
                      :alt="user.name"
                      placeholder-type="avatar"
                      :show-initials="true"
                      :name="user.name"
                      class="w-full h-full"
                    />
                  </div>
                  <div class="absolute bottom-0 right-0 bg-ashleigh hover:bg-yolk-yellow text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer shadow-md transition-colors transform hover:scale-105" 
                       @click="openAvatarEditor"
                       title="Изменить аватар">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
                
                <h1 class="text-2xl font-bold mt-4 mb-1">{{ user.name }}</h1>
                <p class="text-gray-600 mb-5 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ user.email }}
                </p>
                
                <div class="flex w-full">
                  <button @click="openProfileEditor" class="btn btn-primary w-full flex items-center justify-center gap-2 py-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Редактировать профиль
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 class="text-xl font-semibold mb-4 flex items-center text-ashleigh">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
              Навигация
            </h2>
            
            <nav class="space-y-2">
              <button 
                @click="activeTab = 'saved'" 
                class="w-full text-left py-3 px-4 rounded-lg transition-all flex items-center"
                :class="activeTab === 'saved' ? 'bg-ashleigh/10 text-ashleigh font-medium' : 'hover:bg-gray-100'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Сохраненные учебные заведения
              </button>
              
              <button 
                @click="activeTab = 'tests'" 
                class="w-full text-left py-3 px-4 rounded-lg transition-all flex items-center"
                :class="activeTab === 'tests' ? 'bg-ashleigh/10 text-ashleigh font-medium' : 'hover:bg-gray-100'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Результаты тестов
              </button>
              
              <button 
                @click="activeTab = 'settings'" 
                class="w-full text-left py-3 px-4 rounded-lg transition-all flex items-center"
                :class="activeTab === 'settings' ? 'bg-ashleigh/10 text-ashleigh font-medium' : 'hover:bg-gray-100'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки
              </button>
            </nav>
          </div>
        </div>
        
        <!-- Основное содержимое профиля остается практически без изменений -->
        <div class="md:w-2/3">
          <!-- Сохраненные учебные заведения -->
          <div v-if="activeTab === 'saved'" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold mb-6 flex items-center text-ashleigh">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Сохраненные учебные заведения
            </h2>
            
            <div v-if="!user.savedSchools || user.savedSchools.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p class="text-gray-500 mb-4">У вас пока нет сохраненных учебных заведений</p>
              <NuxtLink to="/catalog" class="btn btn-primary inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2M7 7h10" />
                </svg>
                Перейти в каталог
              </NuxtLink>
            </div>
            
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                v-for="saved in user.savedSchools" 
                :key="saved.schoolId" 
                class="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white group"
              >
                <div class="flex gap-3">
                  <div class="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageLoader
                      :src="saved.school?.logoUrl"
                      :alt="saved.school?.name || 'Учебное заведение'"
                      placeholder-type="school-logo"
                      :name="saved.school?.name"
                    />
                  </div>
                  <div class="flex-grow">
                    <h3 class="text-lg font-semibold mb-1 group-hover:text-ashleigh transition-colors">
                      {{ saved.school ? saved.school.name : 'Загрузка...' }}
                    </h3>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">
                      {{ saved.school ? saved.school.address : 'Адрес загружается...' }}
                    </p>
                  </div>
                </div>
                
                <div class="flex space-x-2 justify-end mt-2">
                  <NuxtLink :to="`/catalog/${saved.schoolId}`" class="btn btn-secondary text-sm px-3 py-1.5 inline-flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Подробнее
                  </NuxtLink>
                  <button 
                    @click="removeSavedSchool(saved.schoolId)" 
                    class="btn text-sm px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white inline-flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Результаты тестов остаются без изменений -->
          <div v-else-if="activeTab === 'tests'" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-semibold mb-6 flex items-center text-ashleigh">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Результаты тестов
            </h2>
            
            <div v-if="!user.testResults || user.testResults.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <p class="text-gray-500 mb-4">Вы еще не проходили тест на профориентацию</p>
              <NuxtLink to="/test" class="btn btn-primary inline-flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Пройти тест
              </NuxtLink>
            </div>
            
            <div v-else class="space-y-6">
              <div 
                v-for="(result, index) in user.testResults" 
                :key="result.id" 
                class="border rounded-lg p-5 bg-white hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-ashleigh" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Результат теста {{ index + 1 }}
                  </h3>
                  <span class="text-sm text-gray-600">
                    {{ new Date(result.createdAt).toLocaleDateString() }} {{ new Date(result.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}
                  </span>
                </div>
                
                <div v-if="parseTestResults(result.results)" class="mt-5">
                  <div class="space-y-4">
                    <div 
                      v-for="(value, category) in parseTestResults(result.results)?.categories" 
                      :key="category" 
                      class="bg-gray-50 p-4 rounded-lg"
                    >
                      <div class="flex justify-between mb-2">
                        <span class="font-medium">{{ getCategoryName(category) }}</span>
                        <span class="font-bold text-ashleigh">{{ value }} баллов</span>
                      </div>
                      <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          class="h-full rounded-full"
                          :class="getBgColorClass(value, getMaxCategoryScore(result.results))"
                          :style="{ width: `${(value / getMaxCategoryScore(result.results)) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="parseTestResults(result.results)?.recommendations" class="mt-6 p-4 bg-ashleigh/10 rounded-lg">
                    <h4 class="font-medium mb-2 text-ashleigh flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Рекомендации:
                    </h4>
                    <p>{{ parseTestResults(result.results).recommendations }}</p>
                  </div>
                  
                  <div class="flex justify-end mt-4">
                    <NuxtLink to="/test" class="btn btn-secondary inline-flex items-center gap-2 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Пройти тест заново
                    </NuxtLink>
                  </div>
                </div>
                <div v-else class="bg-red-50 p-4 rounded-lg text-red-600">
                  Ошибка при загрузке результатов теста. Попробуйте пройти тест заново.
                </div>
              </div>
            </div>
          </div>
          
          <!-- Настройки профиля с улучшенным дизайном -->
          <div v-else-if="activeTab === 'settings'" class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-skyway to-ashleigh py-5 px-6">
              <h2 class="text-2xl font-semibold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Настройки профиля
              </h2>
            </div>
            
            <div class="p-6">
              <form @submit.prevent="updateProfile" class="space-y-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                  <input
                    id="name"
                    v-model="profileForm.name"
                    type="text"
                    class="input w-full py-2.5"
                    placeholder="Введите ваше имя"
                  />
                </div>
                
                <div>
                  <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Новый пароль</label>
                  <input
                    id="newPassword"
                    v-model="profileForm.newPassword"
                    type="password"
                    class="input w-full py-2.5"
                    placeholder="Оставьте пустым, если не хотите менять пароль"
                  />
                </div>
                
                <button type="submit" class="btn btn-primary py-2.5 w-full sm:w-auto">
                  Сохранить изменения
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно редактирования аватара -->
      <div v-if="isEditingAvatar" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md animate-[fadeIn_0.3s_ease-out_forwards]">
          <div class="bg-gradient-to-r from-skyway to-ashleigh py-4 px-6 flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-white">Изменение аватара</h2>
            <button @click="closeAvatarEditor" class="text-white hover:text-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-6 space-y-5">
            <ImageUploader
              v-model="avatarForm.avatarUrl"
              label="Загрузите новый аватар"
              @error="handleImageError"
              @change="handleImageUploaded"
            />
            
            <div v-if="avatarForm.avatarUrl" class="mt-2 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Изображение загружено. Нажмите "Сохранить", чтобы подтвердить.</span>
            </div>
            
            <div class="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                @click="closeAvatarEditor" 
                class="btn bg-gray-200 hover:bg-gray-300 py-2.5"
              >
                Отмена
              </button>
              <button 
                @click="updateAvatar" 
                class="btn btn-primary py-2.5"
                :disabled="!avatarForm.avatarUrl"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Модальное окно редактирования профиля -->
      <div v-if="isEditingProfile" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md animate-[fadeIn_0.3s_ease-out_forwards]">
          <div class="bg-gradient-to-r from-skyway to-ashleigh py-4 px-6 flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-white">Редактирование профиля</h2>
            <button @click="closeProfileEditor" class="text-white hover:text-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="updateProfile" class="p-6 space-y-5">
            <div>
              <label for="modalName" class="block text-sm font-medium text-gray-700 mb-2">Имя</label>
              <input
                id="modalName"
                v-model="profileForm.name"
                type="text"
                class="input w-full py-2.5"
                placeholder="Введите ваше имя"
              />
            </div>
            
            <div>
              <label for="modalPassword" class="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
              <input
                id="modalPassword"
                v-model="profileForm.newPassword"
                type="password"
                class="input w-full py-2.5"
                placeholder="Оставьте пустым, если не хотите менять пароль"
              />
            </div>
            
            <div class="flex justify-end space-x-3 pt-2">
              <button 
                type="button" 
                @click="closeProfileEditor" 
                class="btn bg-gray-200 hover:bg-gray-300 py-2.5"
              >
                Отмена
              </button>
              <button 
                type="submit" 
                class="btn btn-primary py-2.5"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

import ImageUploader from '~/components/ImageUploader.vue'
import { useSavedSchools } from '~/composables/useSavedSchools'
import ImageLoader from '~/components/ImageLoader.vue'

const user = ref(null)
const isLoading = ref(true)
const isEditingProfile = ref(false)
const isEditingAvatar = ref(false)
const activeTab = ref('saved')

const profileForm = reactive({
  name: '',
  newPassword: ''
})

const avatarForm = reactive({
  avatarUrl: ''
})

// Используем composable для управления сохраненными школами
const { toggleSaveSchool: toggleSaveSchoolAction } = useSavedSchools()

// Управление модальными окнами
const openAvatarEditor = () => {
  avatarForm.avatarUrl = user.value.avatarUrl || ''
  isEditingAvatar.value = true
}

const closeAvatarEditor = () => {
  isEditingAvatar.value = false
}

const openProfileEditor = () => {
  profileForm.name = user.value.name
  profileForm.newPassword = ''
  isEditingProfile.value = true
}

const closeProfileEditor = () => {
  isEditingProfile.value = false
}

// Обновление только аватара
const updateAvatar = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  
  try {
    // Отправляем только при условии, что новый URL отличается от текущего
    // и не пытаемся загрузить пустую строку
    if (avatarForm.avatarUrl === user.value.avatarUrl || !avatarForm.avatarUrl) {
      isEditingAvatar.value = false
      return
    }
    
    // Проверка, загружено ли изображение через компонент ImageUploader
    // Если URL начинается с /uploads/avatars/, значит файл уже загружен
    // Эта проверка нужна, потому что компонент ImageUploader сам взаимодействует с API
    if (!avatarForm.avatarUrl.startsWith('/uploads/avatars/')) {
      alert('Ошибка: загрузите изображение через предоставленный компонент')
      return
    }
    
    // URL уже сохранен в базе данных при загрузке через API, 
    // но обновим пользовательский интерфейс
    user.value.avatarUrl = avatarForm.avatarUrl
    isEditingAvatar.value = false
    
    // Обновляем данные пользователя в localStorage
    updateUserInLocalStorage(user.value)
    
    // Показываем уведомление об успешном обновлении
    alert('Аватар успешно обновлен')
  } catch (error) {
    console.error('Ошибка обновления аватара:', error)
    alert('Ошибка обновления аватара')
  }
}

// Вспомогательная функция для обновления пользователя в localStorage
const updateUserInLocalStorage = (userData) => {
  const storedUserData = localStorage.getItem('user')
  try {
    if (storedUserData && storedUserData !== 'undefined' && storedUserData !== 'null') {
      const storedUser = JSON.parse(storedUserData)
      storedUser.name = userData.name
      storedUser.avatarUrl = userData.avatarUrl
      localStorage.setItem('user', JSON.stringify(storedUser))
    }
  } catch (error) {
    console.error('Ошибка при обновлении данных пользователя:', error)
    // В случае ошибки, записываем новые данные пользователя
    localStorage.setItem('user', JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatarUrl: userData.avatarUrl
    }))
  }
}

// Обновление профиля теперь обновляет только имя и пароль
const updateProfile = async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  
  try {
    console.log('Начинаю обновление профиля, текущее имя:', profileForm.name)
    
    const payload = {
      name: profileForm.name
    }
    
    if (profileForm.newPassword) {
      payload.password = profileForm.newPassword
    }
    
    console.log('Отправляемые данные:', payload)
    
    const response = await fetch('/api/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    
    console.log('Статус ответа:', response.status, response.statusText)
    
    const responseText = await response.text()
    console.log('Текст ответа:', responseText)
    
    let data
    try {
      data = JSON.parse(responseText)
      console.log('Распарсенные данные:', data)
    } catch (e) {
      console.error('Ошибка парсинга JSON:', e)
      alert('Произошла ошибка при обработке ответа сервера. Проверьте консоль.')
      return
    }
    
    if (response.ok) {
      console.log('Обновление успешно, новое имя:', data.body?.name)
      user.value.name = data.body?.name || user.value.name
      profileForm.newPassword = ''
      isEditingProfile.value = false
      
      // Обновляем данные пользователя в localStorage
      updateUserInLocalStorage(user.value)
      
      alert('Профиль успешно обновлен!')
    } else {
      console.error('Ошибка обновления профиля:', data.message || 'Неизвестная ошибка')
      alert(`Ошибка обновления профиля: ${data.message || 'Неизвестная ошибка'}`)
    }
  } catch (error) {
    console.error('Ошибка обновления профиля:', error)
    alert(`Ошибка обновления профиля: ${error.message}`)
  }
}

// Извлекаем инициалы из имени для плейсхолдера аватара
const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Парсим результаты теста
const parseTestResults = (resultsStr) => {
  try {
    // Если строка, парсим JSON
    let results = typeof resultsStr === 'string' ? JSON.parse(resultsStr) : resultsStr
    
    // Проверяем структуру данных
    if (!results) return null
    
    // Если результаты внутри вложенного объекта (может быть в зависимости от API)
    if (results.results && typeof results.results === 'string') {
      results = JSON.parse(results.results)
    }
    
    // Для старого формата может понадобиться дополнительное преобразование
    if (results.categories) {
      return {
        categories: results.categories,
        answers: results.answers || [],
        recommendations: results.recommendations || ''
      }
    }
    
    // Если нет категорий, но есть ответы, создаем категории
    if (results.answers && Array.isArray(results.answers)) {
      const categoryCounts = {}
      
      // Просто подсчитываем количество ответов как пример
      results.answers.forEach((answer, index) => {
        const category = `Категория ${index % 5 + 1}`
        if (!categoryCounts[category]) {
          categoryCounts[category] = 0
        }
        categoryCounts[category] += (answer || 0) + 1
      })
      
      return {
        categories: categoryCounts,
        answers: results.answers,
        recommendations: 'Результаты основаны на ваших ответах в тесте профориентации.'
      }
    }
    
    // Если ничего не подходит, пробуем использовать как есть
    return results
  } catch (error) {
    console.error('Ошибка парсинга результатов теста:', error)
    return null
  }
}

// Получаем название категории
const getCategoryName = (category) => {
  const categories = {
    'technical': 'Технические науки',
    'humanities': 'Гуманитарные науки',
    'science': 'Естественные науки',
    'arts': 'Искусство и творчество',
    'business': 'Бизнес и экономика',
    'medicine': 'Медицина и здравоохранение'
  }
  
  return categories[category] || category
}

// Получаем максимальный балл по категориям
const getMaxCategoryScore = (resultsStr) => {
  try {
    const results = typeof resultsStr === 'string' ? JSON.parse(resultsStr) : resultsStr
    if (!results || !results.categories) return 10
    
    return Math.max(...Object.values(results.categories))
  } catch (error) {
    console.error('Ошибка получения максимального балла:', error)
    return 10
  }
}

// Загрузка данных пользователя
const loadUserData = async () => {
  isLoading.value = true
  
  try {
    // Сначала проверяем, есть ли токен
    const token = localStorage.getItem('token')
    if (!token) {
      console.log('Нет токена для загрузки данных пользователя')
      isLoading.value = false
      return
    }
    
    // Проверяем, есть ли кэшированные данные пользователя в localStorage
    const userStr = localStorage.getItem('user')
    if (userStr && userStr !== 'undefined' && userStr !== 'null') {
      try {
        const userData = JSON.parse(userStr)
        if (userData && userData.id) {
          // Если есть валидные данные пользователя в localStorage, используем их
          console.log('Используем кэшированные данные пользователя:', userData.name)
          user.value = userData
          
          // Устанавливаем значения в форму
          profileForm.name = user.value.name || ''
          avatarForm.avatarUrl = user.value.avatarUrl || ''
          
          // Дополнительно запрашиваем свежие данные без ожидания (без await)
          fetchUserDataFromAPI(token)
          
          // Загружаем результаты тестов
          loadTestResults(token)
          
          isLoading.value = false
          return
        }
      } catch (e) {
        console.error('Ошибка при парсинге данных пользователя из localStorage:', e)
      }
    }
    
    // Если нет кэшированных данных или они некорректны, делаем запрос к API
    await fetchUserDataFromAPI(token)
    
    // Загружаем результаты тестов
    await loadTestResults(token)
    
  } catch (error) {
    console.error('Ошибка загрузки данных пользователя:', error)
    user.value = null
  } finally {
    isLoading.value = false
  }
}

// Вспомогательная функция для загрузки данных с API
const fetchUserDataFromAPI = async (token) => {
  try {
    console.log('Запрашиваем данные пользователя с API')
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data || !data.id) {
      throw new Error('Данные пользователя отсутствуют или некорректны')
    }
    
    console.log('Данные пользователя успешно получены:', data.name)
    console.log('Сохраненные учебные заведения:', data.savedSchools ? data.savedSchools.length : 0)
    user.value = data
    
    // Если есть сохраненные школы, но нет данных о них, загрузим дополнительную информацию
    if (data.savedSchools && Array.isArray(data.savedSchools)) {
      await loadSchoolDetails(data.savedSchools)
    }
    
    // Устанавливаем значения в форму
    profileForm.name = user.value.name || ''
    avatarForm.avatarUrl = user.value.avatarUrl || ''
    
    // Обновляем данные в localStorage
    localStorage.setItem('user', JSON.stringify(data))
    
  } catch (error) {
    console.error('Ошибка при получении данных с API:', error)
    
    // Проверяем, есть ли у нас данные пользователя из localStorage
    if (!user.value) {
      // Если нет, очищаем токен и пользователя, так как они недействительны
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      throw error // Пробрасываем ошибку дальше для обработки
    }
  }
}

// Функция для загрузки подробных данных о сохраненных учебных заведениях
const loadSchoolDetails = async (savedSchools) => {
  if (!Array.isArray(savedSchools) || savedSchools.length === 0) return
  
  const schoolDetails = await Promise.all(
    savedSchools.map(async (saved) => {
      if (saved.school && saved.school.name) {
        // Уже есть подробные данные
        return saved
      }
      
      try {
        const response = await fetch(`/api/schools/${saved.schoolId}`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.body) {
            // Обновляем информацию о школе
            saved.school = data.body
          }
        }
      } catch (error) {
        console.error(`Ошибка загрузки информации о школе ${saved.schoolId}:`, error)
      }
      
      return saved
    })
  )
  
  // Обновляем данные в user.value
  if (user.value) {
    user.value.savedSchools = schoolDetails
  }
}

// Удаление сохраненного учебного заведения
const removeSavedSchool = async (schoolId) => {
  try {
    // Используем функцию из composable для удаления
    await toggleSaveSchoolAction(schoolId)
    
    // Обновляем отображение в интерфейсе
    if (user.value && user.value.savedSchools) {
      user.value.savedSchools = user.value.savedSchools.filter(
        saved => saved.schoolId !== schoolId
      )
      console.log(`Учебное заведение ${schoolId} удалено из избранного`)
    }
  } catch (error) {
    console.error('Ошибка удаления сохраненного учебного заведения:', error)
  }
}

// Новая функция для получения класса фона в зависимости от значения
function getBgColorClass(value, maxValue) {
  const percent = (value / maxValue) * 100
  
  if (percent >= 75) return 'bg-green-500'
  if (percent >= 50) return 'bg-ashleigh'
  if (percent >= 25) return 'bg-skyway'
  return 'bg-gray-400'
}

// Обработка ошибок загрузки изображения
const handleImageError = (error) => {
  console.error('Ошибка загрузки изображения:', error)
  alert(`Ошибка загрузки изображения: ${error}`)
}

// Успешная загрузка изображения
const handleImageUploaded = (result) => {
  console.log('Изображение успешно загружено:', result)
  // Автоматически обновляем аватар пользователя
  user.value.avatarUrl = result.url
  updateUserInLocalStorage(user.value)
}

// Загрузка результатов тестов профориентации
const loadTestResults = async (token) => {
  if (!token || !user.value) return
  
  try {
    console.log('Загружаем результаты тестов...')
    const response = await fetch('/api/test-api/results', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (data && data.body && Array.isArray(data.body)) {
      console.log('Получены результаты тестов:', data.body.length)
      user.value.testResults = data.body
      
      // Обновляем данные в localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user') || '{}')
      updatedUser.testResults = data.body
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  } catch (error) {
    console.error('Ошибка при загрузке результатов тестов:', error)
  }
}

onMounted(() => {
  loadUserData()
})

useHead({
  title: 'Профиль - Платформа для абитуриентов'
})
</script> 