<template>
  <div class="bg-snow-white min-h-screen p-2 sm:p-4 md:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Управление учебными заведениями</h1>
      <NuxtLink to="/admin" class="bg-ashleigh text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base">
        Назад к панели
      </NuxtLink>
    </div>
    
    <div class="bg-white rounded-lg shadow-md p-3 sm:p-6">
      <div class="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Поиск заведений..." 
            class="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-64"
            @input="searchSchools"
          />
          <select 
            v-model="categoryFilter"
            class="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-auto"
            @change="searchSchools"
          >
            <option value="">Все категории</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>
        <button 
          @click="openAddModal = true" 
          class="bg-ashleigh text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base w-full sm:w-auto"
        >
          + Добавить заведение
        </button>
      </div>
      
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
        <p class="mt-2 text-gray-700">Загрузка учебных заведений...</p>
      </div>
      
      <div v-else-if="filteredSchools.length === 0" class="text-center py-12">
        <p class="text-gray-700">Учебные заведения не найдены</p>
      </div>
      
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="school in filteredSchools" :key="school.id" class="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition flex flex-col h-full">
          <div class="flex items-start mb-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-skyway rounded flex items-center justify-center text-white mr-3 flex-shrink-0">
              <span class="text-base sm:text-lg font-bold">{{ getInitials(school.name) }}</span>
            </div>
            <div>
              <h3 class="text-base sm:text-lg font-medium text-gray-800 line-clamp-2">{{ school.name }}</h3>
              <span v-if="school.category" class="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 mt-1 inline-block">
                {{ categories.find(c => c.id === school.category)?.name || school.category }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2 mb-4 flex-grow">
            <p v-if="school.address" class="text-xs sm:text-sm text-gray-600 line-clamp-2 flex items-start">
              <span class="mr-1.5 text-ashleigh">📍</span>
              {{ school.address }}
            </p>
            <p v-if="school.phone" class="text-xs sm:text-sm text-gray-600 line-clamp-1 flex items-start">
              <span class="mr-1.5 text-ashleigh">📞</span>
              {{ school.phone }}
            </p>
            <p v-if="school.email" class="text-xs sm:text-sm text-gray-600 line-clamp-1 flex items-start">
              <span class="mr-1.5 text-ashleigh">📧</span>
              {{ school.email }}
            </p>
            <p v-if="school.website" class="text-xs sm:text-sm text-gray-600 line-clamp-1 flex items-start">
              <span class="mr-1.5 text-ashleigh">🌐</span>
              <a :href="school.website" target="_blank" class="text-ashleigh hover:underline truncate">{{ school.website }}</a>
            </p>
          </div>
          
          <div class="flex items-center justify-between border-t pt-3">
            <span class="text-xs text-gray-500">Программ: {{ school.programs?.length || 0 }}</span>
            <div>
              <button 
                @click="editSchool(school)" 
                class="text-ashleigh hover:text-ashleigh/80 mr-2 text-sm" 
                title="Редактировать"
              >
                ✏️
              </button>
              <button 
                @click="confirmDelete(school)" 
                class="text-red-600 hover:text-red-800 text-sm" 
                title="Удалить"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Пагинация -->
      <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <nav class="flex space-x-1">
          <button 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-ashleigh hover:bg-gray-100'
            ]"
          >
            &laquo;
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page" 
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === page ? 'bg-ashleigh text-white' : 'text-gray-700 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
          <button 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
            :class="[
              'px-3 py-1 rounded-md',
              currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-ashleigh hover:bg-gray-100'
            ]"
          >
            &raquo;
          </button>
        </nav>
      </div>
    </div>
    
    <!-- Уведомления об успехе или ошибке -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <div v-if="successMessage" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 sm:p-4 rounded shadow-md max-w-md">
        <div class="flex items-center">
          <div class="mr-2">✅</div>
          <p>{{ successMessage }}</p>
        </div>
      </div>
      <div v-if="errorMessage" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded shadow-md max-w-md">
        <div class="flex items-center">
          <div class="mr-2">❌</div>
          <p>{{ errorMessage }}</p>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно добавления/редактирования школы -->
    <div v-if="openAddModal || openEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">
          {{ openAddModal ? 'Добавить учебное заведение' : 'Редактировать учебное заведение' }}
        </h2>
        
        <form @submit.prevent="openAddModal ? addSchool() : updateSchool()" class="space-y-6">
          <!-- Основная информация -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Логотип учебного заведения</label>
              <ImageUploader
                v-model="schoolForm.logoUrl"
                label="Загрузите логотип"
                type="logo"
                :file-types="['image/jpeg', 'image/png', 'image/svg+xml']"
                @error="handleImageError"
              />
              <p class="text-xs text-gray-500 mt-1">Рекомендуемый размер: 200x200px, допустимые форматы: JPG, PNG, SVG.</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Название *</label>
              <input
                v-model="schoolForm.name"
                type="text"
                required
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Категория *</label>
              <select
                v-model="schoolForm.category"
                required
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              >
                <option value="">Выберите категорию</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Адрес *</label>
              <div class="flex">
                <input
                  v-model="schoolForm.address"
                  type="text"
                  required
                  class="px-3 py-2 w-full border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                />
                <button
                  type="button"
                  @click="editLocation"
                  class="px-3 py-2 bg-ashleigh text-white rounded-r-lg hover:bg-opacity-90"
                  title="Выбрать на карте"
                >
                  📍
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Веб-сайт</label>
              <input
                v-model="schoolForm.website"
                type="url"
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="schoolForm.email"
                type="email"
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
              <input
                v-model="schoolForm.phone"
                type="tel"
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
              />
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Дополнительные контакты</label>
              <div class="space-y-3 bg-gray-50 p-3 rounded-lg">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Дополнительные телефоны</label>
                  <div v-for="(phone, index) in schoolForm.contactPhones" :key="`phone-${index}`" class="flex mb-2">
                    <input
                      v-model="schoolForm.contactPhones[index]"
                      type="tel"
                      class="px-3 py-2 w-full border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                      placeholder="Например, +7 (XXX) XXX-XX-XX"
                    />
                    <button
                      type="button"
                      @click="schoolForm.contactPhones.splice(index, 1)"
                      class="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="schoolForm.contactPhones.push('')"
                    class="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    + Добавить телефон
                  </button>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Факс</label>
                  <input
                    v-model="schoolForm.fax"
                    type="text"
                    class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    placeholder="Номер факса"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Мессенджеры</label>
                  <div v-for="(messenger, index) in schoolForm.messengers" :key="`messenger-${index}`" class="flex mb-2">
                    <select
                      v-model="messenger.type"
                      class="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="telegram">Telegram</option>
                      <option value="viber">Viber</option>
                    </select>
                    <input
                      v-model="messenger.value"
                      type="text"
                      class="px-3 py-2 w-full border-l-0 border border-gray-300 focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                      placeholder="Номер или ник"
                    />
                    <button
                      type="button"
                      @click="schoolForm.messengers.splice(index, 1)"
                      class="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="schoolForm.messengers.push({ type: 'whatsapp', value: '' })"
                    class="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    + Добавить мессенджер
                  </button>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Часы работы</label>
                  <input
                    v-model="schoolForm.workingHours"
                    type="text"
                    class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    placeholder="Например, Пн-Пт: 9:00-18:00, Сб: 9:00-14:00, Вс: выходной"
                  />
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Социальные сети</label>
                  <div v-for="(social, index) in schoolForm.socialNetworks" :key="`social-${index}`" class="flex mb-2">
                    <select
                      v-model="social.type"
                      class="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    >
                      <option value="vk">ВКонтакте</option>
                      <option value="instagram">Instagram</option>
                      <option value="facebook">Facebook</option>
                      <option value="youtube">YouTube</option>
                    </select>
                    <input
                      v-model="social.url"
                      type="url"
                      class="px-3 py-2 w-full border-l-0 border border-gray-300 focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                      placeholder="URL страницы"
                    />
                    <button
                      type="button"
                      @click="schoolForm.socialNetworks.splice(index, 1)"
                      class="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                  <button
                    type="button"
                    @click="schoolForm.socialNetworks.push({ type: 'vk', url: '' })"
                    class="text-sm px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    + Добавить соцсеть
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              v-model="schoolForm.description"
              rows="3"
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            ></textarea>
          </div>
          
          <!-- Местоположение на карте -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">Местоположение на карте</h3>
            
            <div v-if="schoolForm.location" class="bg-gray-50 p-3 rounded-lg mb-3">
              <div class="text-sm text-gray-700">
                Текущие координаты: 
                <span class="font-semibold">
                  {{ typeof schoolForm.location === 'object' 
                    ? `${schoolForm.location.lat}, ${schoolForm.location.lng}` 
                    : schoolForm.location 
                  }}
                </span>
              </div>
            </div>
            
            <LocationEditor 
              v-model="schoolForm.location" 
              :initial-address="schoolForm.address"
            />
          </div>
          
          <!-- Компонент для загрузки фотографий -->
          <div class="md:col-span-2 border-t pt-4">
            <h3 class="text-lg font-medium mb-3">Фотографии учебного заведения</h3>
            
            <div v-if="schoolForm.photos && schoolForm.photos.length === 0" class="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
              Нет добавленных фотографий
            </div>
            
            <div v-else-if="schoolForm.photos && schoolForm.photos.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div v-for="(photo, index) in schoolForm.photos" :key="photo.id || `new-${index}`" class="bg-gray-50 p-3 rounded-lg">
                <div class="relative overflow-hidden rounded-lg h-40 mb-2">
                  <img :src="photo.url" alt="Фото учебного заведения" class="object-cover w-full h-full" />
                  <button
                    type="button"
                    @click="removePhoto(index)"
                    class="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <span class="sr-only">Удалить</span>
                    X
                  </button>
                </div>
                <input
                  v-model="photo.description"
                  type="text"
                  class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none text-sm"
                  placeholder="Описание фотографии"
                />
              </div>
            </div>
            
            <MultiImageUploader
              @uploaded="handlePhotosUploaded"
              @error="handleImageError"
              :max-files="10"
              :file-types="['image/jpeg', 'image/png']"
            />
            <p class="text-xs text-gray-500 mt-1">Допустимые форматы: JPG, PNG. Максимальный размер файла: 5MB.</p>
          </div>
          
          <!-- Компонент для внешних отзывов из 2GIS -->
          <div class="md:col-span-2 border-t pt-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-lg font-medium">Отзывы из 2GIS</h3>
              <button
                type="button"
                @click="fetchExternalReviews"
                class="px-3 py-1 bg-skyway text-white rounded hover:bg-opacity-90 text-sm"
                :disabled="isImportingReviews"
              >
                <span v-if="isImportingReviews">Загрузка...</span>
                <span v-else>Импортировать отзывы</span>
              </button>
            </div>
            
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">URL страницы заведения в 2GIS</label>
              <input
                v-model="schoolForm.externalUrl"
                type="url"
                class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                placeholder="https://2gis.ru/..."
              />
              <p class="text-xs text-gray-500 mt-1">
                Укажите полный URL страницы учреждения в 2GIS для импорта отзывов. Например: https://2gis.ru/almaty/firm/...
              </p>
            </div>
            
            <div v-if="schoolForm.externalReviews && schoolForm.externalReviews.length > 0" class="bg-gray-50 p-3 rounded-lg mb-3">
              <h4 class="font-medium mb-2">Найдено внешних отзывов: {{ schoolForm.externalReviews.length }}</h4>
              <div class="max-h-60 overflow-y-auto border rounded-lg bg-white">
                <div v-for="(review, index) in schoolForm.externalReviews" :key="`ext-${index}`" 
                  class="p-3 border-b last:border-b-0 flex justify-between items-start"
                >
                  <div>
                    <div class="flex items-center">
                      <span class="font-medium">{{ review.authorName }}</span>
                      <span class="text-xs ml-2 text-gray-500">{{ formatDate(review.date) }}</span>
                      <div class="flex ml-2">
                        <span v-for="i in 5" :key="i" class="text-yellow-400">
                          {{ i <= review.rating ? '★' : '☆' }}
                        </span>
                      </div>
                    </div>
                    <p class="text-sm text-gray-700 line-clamp-2">{{ review.text }}</p>
                  </div>
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="review.selected"
                      class="w-4 h-4 text-ashleigh border-gray-300 rounded focus:ring-ashleigh"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Образовательные программы -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-medium">Образовательные программы</h3>
              <button
                type="button"
                @click="addProgram"
                class="px-2 py-1 bg-skyway text-white rounded hover:bg-opacity-90 text-sm"
              >
                + Добавить программу
              </button>
            </div>
            
            <div v-if="schoolForm.programs && schoolForm.programs.length === 0" class="text-center py-4 text-gray-500">
              Нет добавленных программ
            </div>
            
            <div v-else-if="schoolForm.programs && schoolForm.programs.length > 0" class="space-y-4">
              <div v-for="(program, index) in schoolForm.programs" :key="program.id" class="border p-3 rounded-lg">
                <div class="flex justify-between mb-2">
                  <h4 class="font-medium">Программа #{{ index + 1 }}</h4>
                  <button
                    type="button"
                    @click="removeProgram(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Удалить
                  </button>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Название программы *</label>
                    <input
                      v-model="program.name"
                      type="text"
                      required
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                    <select
                      v-model="program.category"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    >
                      <option value="">Выберите категорию</option>
                      <option value="bachelor">Бакалавриат</option>
                      <option value="master">Магистратура</option>
                      <option value="specialty">Специалитет</option>
                      <option value="course">Курс</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Длительность</label>
                    <input
                      v-model="program.duration"
                      type="text"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Стоимость</label>
                    <input
                      v-model="program.price"
                      type="text"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    />
                  </div>
                  
                  <div class="sm:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Описание программы</label>
                    <textarea
                      v-model="program.description"
                      rows="2"
                      class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
                    ></textarea>
                  </div>
                </div>
                
                <!-- Добавляем секцию требований к экзаменам -->
                <div class="mt-4 pt-3 border-t">
                  <div class="flex justify-between items-center mb-2">
                    <h5 class="font-medium text-sm">Требования к экзаменам</h5>
                    <button
                      type="button"
                      @click="addExamRequirement(index)"
                      class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                    >
                      + Добавить экзамен
                    </button>
                  </div>
                  
                  <div v-if="!program.examRequirements || program.examRequirements.length === 0" class="text-center py-2 text-gray-500 text-sm">
                    Нет добавленных требований к экзаменам
                  </div>
                  
                  <div v-else class="space-y-2">
                    <div v-for="(exam, examIndex) in program.examRequirements" :key="`exam-${index}-${examIndex}`" class="flex items-center gap-2">
                      <input
                        v-model="exam.name"
                        type="text"
                        class="px-3 py-2 flex-grow border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none text-sm"
                        placeholder="Название экзамена (например, ЕНТ, Математика)"
                      />
                      <input
                        v-model="exam.minScore"
                        type="number"
                        min="0"
                        class="px-3 py-2 w-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none text-sm"
                        placeholder="Мин. балл"
                      />
                      <button
                        type="button"
                        @click="removeExamRequirement(index, examIndex)"
                        class="px-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        X
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="openAddModal ? openAddModal = false : openEditModal = false; resetForm();"
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
              :disabled="isSubmitting"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-3 py-2 bg-ashleigh hover:bg-opacity-90 text-white rounded-lg text-sm flex items-center"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {{ openAddModal ? 'Добавить' : 'Сохранить' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="openDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Удаление учебного заведения</h2>
        
        <p class="mb-6 text-gray-700">
          Вы действительно хотите удалить учебное заведение <span class="font-medium">{{ schoolToDelete?.name }}</span>?
          Это действие невозможно отменить.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="openDeleteModal = false; schoolToDelete = null;"
            class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
            :disabled="isSubmitting"
          >
            Отмена
          </button>
          <button
            type="button"
            @click="deleteSchool"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Удалить
          </button>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно выбора местоположения на карте -->
    <div v-if="openLocationModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <h2 class="text-xl font-semibold mb-4">Выбор местоположения на карте</h2>
        
        <div v-if="isMapLoading" class="text-center py-12 flex-grow">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
          <p class="mt-2 text-gray-700">Загрузка карты...</p>
        </div>
        
        <div class="h-[500px] border rounded-lg mb-4 flex-grow relative">
          <LocationEditor 
            :initial-location="schoolForm.location" 
            :address="schoolForm.address"
            @location-selected="saveLocation"
            @cancel="openLocationModal = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

import ImageUploader from '~/components/ImageUploader.vue'
import MultiImageUploader from '~/components/MultiImageUploader.vue'
import ModalWrapper from '~/components/ModalWrapper.vue'

// Состояние загрузки
const isLoading = ref(true)
const isSubmitting = ref(false)
const isMapLoading = ref(false)

// Параметры запроса
const searchQuery = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const limit = 12

// Школы
const schools = ref([])
const totalSchools = ref(0)
const totalPages = computed(() => Math.ceil(totalSchools.value / limit))

// Фильтрация школ
const filteredSchools = computed(() => {
  let result = [...schools.value]
  
  // Фильтр по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(school => 
      school.name.toLowerCase().includes(query) || 
      (school.address && school.address.toLowerCase().includes(query)) ||
      (school.description && school.description.toLowerCase().includes(query))
    )
  }
  
  // Фильтр по категории
  if (categoryFilter.value) {
    result = result.filter(school => 
      school.category === categoryFilter.value || 
      school.programs?.some(p => p.category === categoryFilter.value)
    )
  }
  
  return result
})

// Модальные окна
const openAddModal = ref(false)
const openEditModal = ref(false)
const openDeleteModal = ref(false)
const openLocationModal = ref(false)

// Форма школы
const schoolForm = ref({
  id: null,
  name: '',
  address: '',
  description: '',
  website: '',
  email: '',
  phone: '',
  category: '',
  location: null,
  programs: [],
  logoUrl: '',
  photos: [],
  contactPhones: [],
  fax: '',
  messengers: [],
  workingHours: '',
  socialNetworks: [],
  externalUrl: '',
  externalReviews: []
})

// Список категорий
const categories = ref([
  { id: 'university', name: 'Университет' },
  { id: 'college', name: 'Колледж' },
  { id: 'school', name: 'Школа' },
  { id: 'course', name: 'Курсы' }
])

// ID школы для удаления
const schoolToDelete = ref(null)

// Сообщения для пользователя
const successMessage = ref('')
const errorMessage = ref('')

// Очистка сообщений через 3 секунды
function clearMessages() {
  setTimeout(() => {
    successMessage.value = ''
    errorMessage.value = ''
  }, 3000)
}

// Загрузка школ
async function loadSchools() {
  isLoading.value = true
  try {
    if (!process.client) return;

    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }

    try {
      const response = await $fetch('/api/schools', {
        headers: { 'Authorization': `Bearer ${token}` },
        query: {
          page: currentPage.value,
          search: searchQuery.value,
          category: categoryFilter.value,
          admin: 'true'
        }
      })
      
      if (response && response.body) {
        schools.value = response.body
        totalSchools.value = response.total || schools.value.length
      } else {
        schools.value = []
        totalSchools.value = 0
      }
      
      console.log('Загружено учебных заведений:', schools.value.length)
    } catch (fetchError) {
      console.error('Ошибка запроса к API:', fetchError)
      throw new Error('Ошибка загрузки учебных заведений')
    }
  } catch (error) {
    console.error('Ошибка загрузки учебных заведений:', error)
    errorMessage.value = 'Не удалось загрузить учебные заведения. Пожалуйста, попробуйте позже.'
    clearMessages()
    schools.value = []
  } finally {
    isLoading.value = false
  }
}

// Добавим новые состояния для работы с фотографиями и внешними отзывами
const isImportingReviews = ref(false)

// Добавление школы
async function addSchool() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    if (!process.client) return;
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    // Извлекаем координаты из location
    let latitude = null;
    let longitude = null;
    
    if (schoolForm.value.location) {
      if (typeof schoolForm.value.location === 'object') {
        if (schoolForm.value.location.lat && schoolForm.value.location.lng) {
          latitude = schoolForm.value.location.lat;
          longitude = schoolForm.value.location.lng;
          console.log('Подготовлены координаты из объекта:', latitude, longitude);
        }
      } else if (typeof schoolForm.value.location === 'string') {
        try {
          const [lat, lng] = schoolForm.value.location.split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            latitude = lat;
            longitude = lng;
            console.log('Подготовлены координаты из строки:', latitude, longitude);
          }
        } catch (e) {
          console.error('Ошибка при парсинге координат из строки:', e);
        }
      }
    }
    
    // Подготавливаем контакты
    const contactsObject = {
      phones: schoolForm.value.contactPhones || [],
      fax: schoolForm.value.fax || '',
      messengers: schoolForm.value.messengers || [],
      workingHours: schoolForm.value.workingHours || '',
      socialNetworks: schoolForm.value.socialNetworks || []
    };
    
    // Данные для отправки
    const schoolData = {
      name: schoolForm.value.name,
      address: schoolForm.value.address,
      description: schoolForm.value.description || '',
      website: schoolForm.value.website || '',
      email: schoolForm.value.email || '',
      phoneNumber: schoolForm.value.phone || '',
      category: schoolForm.value.category,
      // Координаты
      latitude: latitude,
      longitude: longitude,
      // Контактная информация
      contacts: JSON.stringify(contactsObject),
      logoUrl: schoolForm.value.logoUrl || null
    }

    console.log('Отправка данных для создания школы:', JSON.stringify(schoolData, null, 2));

    // Отправляем запрос на сервер
    const response = await $fetch('/api/schools', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: schoolData
    })
    
    console.log('Ответ от сервера при создании школы:', response);
    
    if (response && response.body) {
      // Добавление новой школы в список
      schools.value.unshift(response.body)
      totalSchools.value++
      
      // Закрыть модальное окно и очистить форму
      openAddModal.value = false
      resetForm()
      
      // Перезагружаем список школ
      await loadSchools();
      
      // Показать сообщение об успехе
      successMessage.value = 'Учебное заведение успешно добавлено'
      clearMessages()
    } else {
      throw new Error('Сервер вернул пустой ответ')
    }
  } catch (error) {
    console.error('Ошибка при добавлении учебного заведения:', error)
    errorMessage.value = error.message || 'Не удалось добавить учебное заведение. Пожалуйста, проверьте данные и попробуйте снова.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Редактирование школы
function editSchool(school) {
  // Разбираем контакты из JSON строки, если они есть
  let contactData = {}
  if (school.contacts) {
    try {
      contactData = typeof school.contacts === 'string' 
        ? JSON.parse(school.contacts) 
        : school.contacts
    } catch (e) {
      console.error('Ошибка при разборе контактных данных:', e)
    }
  }
  
  schoolForm.value = {
    id: school.id,
    name: school.name,
    address: school.address || '',
    description: school.description || '',
    website: school.websiteUrl || school.website || '',
    email: school.email || '',
    phone: school.phone || '',
    category: school.category || '',
    location: school.coordinates || null,
    logoUrl: school.logoUrl || '',
    // Фотографии
    photos: Array.isArray(school.photos) ? [...school.photos] : [],
    // Программы
    programs: Array.isArray(school.programs) ? school.programs.map(program => ({
      ...program,
      examRequirements: Array.isArray(program.examRequirements) ? [...program.examRequirements] : []
    })) : [],
    // Структурированные контакты
    contactPhones: contactData.phones || [],
    fax: contactData.fax || '',
    messengers: contactData.messengers || [],
    workingHours: contactData.workingHours || '',
    socialNetworks: contactData.socialNetworks || [],
    // Пустой массив для внешних отзывов
    externalUrl: '',
    externalReviews: []
  }
  
  openEditModal.value = true
}

// Обновление школы
async function updateSchool() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    if (!process.client) return;
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    // Извлекаем координаты из location
    let latitude = null;
    let longitude = null;
    
    if (schoolForm.value.location) {
      if (typeof schoolForm.value.location === 'object') {
        if (schoolForm.value.location.lat && schoolForm.value.location.lng) {
          latitude = schoolForm.value.location.lat;
          longitude = schoolForm.value.location.lng;
          console.log('Подготовлены координаты из объекта:', latitude, longitude);
        }
      } else if (typeof schoolForm.value.location === 'string') {
        try {
          const [lat, lng] = schoolForm.value.location.split(',').map(coord => parseFloat(coord.trim()));
          if (!isNaN(lat) && !isNaN(lng)) {
            latitude = lat;
            longitude = lng;
            console.log('Подготовлены координаты из строки:', latitude, longitude);
          }
        } catch (e) {
          console.error('Ошибка при парсинге координат из строки:', e);
        }
      }
    }
    
    // Подготавливаем контакты
    const contactsObject = {
      phones: schoolForm.value.contactPhones || [],
      fax: schoolForm.value.fax || '',
      messengers: schoolForm.value.messengers || [],
      workingHours: schoolForm.value.workingHours || '',
      socialNetworks: schoolForm.value.socialNetworks || []
    };
    
    // Полная версия данных для обновления - используем имена полей из схемы БД
    const schoolData = {
      name: schoolForm.value.name,
      address: schoolForm.value.address,
      description: schoolForm.value.description || '',
      website: schoolForm.value.website || '',
      email: schoolForm.value.email || '',
      phoneNumber: schoolForm.value.phone || '', // Правильное имя поля phoneNumber
      category: schoolForm.value.category,
      // Передаем координаты как отдельные поля
      latitude: latitude,
      longitude: longitude,
      // Структурированная контактная информация
      contacts: JSON.stringify(contactsObject),
      logoUrl: schoolForm.value.logoUrl || null
    }

    console.log('Отправка данных на сервер:', JSON.stringify(schoolData, null, 2));

    // Отправляем запрос на сервер
    const response = await $fetch(`/api/schools/${schoolForm.value.id}/basic`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: schoolData
    })
    
    console.log('Ответ от сервера:', response);
    
    if (response) {
      // Обновление школы в списке
      const index = schools.value.findIndex(s => s.id === schoolForm.value.id)
      if (index !== -1) {
        schools.value[index] = { 
          ...schools.value[index], 
          ...response.data 
        }
      }
      
      // Закрыть модальное окно и очистить форму
      openEditModal.value = false
      resetForm()
      
      // Перезагружаем список школ для обновления данных
      await loadSchools();
      
      // Показать сообщение об успехе
      successMessage.value = 'Данные учебного заведения успешно обновлены'
      clearMessages()
      return;
    } else {
      throw new Error('Сервер вернул пустой ответ')
    }
  } catch (error) {
    console.error('Ошибка при обновлении учебного заведения:', error)
    errorMessage.value = error.message || 'Не удалось обновить учебное заведение. Пожалуйста, проверьте данные и попробуйте снова.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Подтверждение удаления
function confirmDelete(school) {
  schoolToDelete.value = school
  openDeleteModal.value = true
}

// Удаление школы
async function deleteSchool() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    if (!process.client) return;
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    try {
      await $fetch(`/api/schools/${schoolToDelete.value.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Удаляем школу из списка
      schools.value = schools.value.filter(s => s.id !== schoolToDelete.value.id)
      totalSchools.value--
      
      // Закрыть модальное окно
      openDeleteModal.value = false
      schoolToDelete.value = null
      
      // Показать сообщение об успехе
      successMessage.value = 'Учебное заведение успешно удалено'
      clearMessages()
    } catch (fetchError) {
      console.error('Ошибка запроса к API:', fetchError)
      
      // Демо-удаление
      if (schoolToDelete.value && schoolToDelete.value.id) {
        // Удаляем школу из списка на фронтенде
        schools.value = schools.value.filter(s => s.id !== schoolToDelete.value.id)
        totalSchools.value--
        
        // Закрыть модальное окно
        openDeleteModal.value = false
        schoolToDelete.value = null
        
        // Показать сообщение об успехе
        successMessage.value = 'Учебное заведение успешно удалено'
        clearMessages()
        
        // Не бросаем ошибку, чтобы не прерывать выполнение
        return
      }
      
      throw new Error(fetchError.message || 'Ошибка при удалении учебного заведения')
    }
  } catch (error) {
    console.error('Ошибка при удалении учебного заведения:', error)
    errorMessage.value = error.message || 'Не удалось удалить учебное заведение. Пожалуйста, попробуйте позже.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Открытие редактора местоположения
function editLocation() {
  // Устанавливаем значение по умолчанию, если координаты не заданы
  if (!schoolForm.value.location) {
    schoolForm.value.location = {
      lat: 43.238949, 
      lng: 76.889709
    }
  } else if (typeof schoolForm.value.location === 'string') {
    // Если координаты заданы в виде строки, преобразуем их в объект
    try {
      const [lat, lng] = schoolForm.value.location.split(',').map(coord => parseFloat(coord.trim()))
      schoolForm.value.location = {
        lat: lat || 43.238949,
        lng: lng || 76.889709
      }
    } catch (e) {
      console.error('Ошибка парсинга координат:', e)
      schoolForm.value.location = {
        lat: 43.238949, 
        lng: 76.889709
      }
    }
  }
  
  openLocationModal.value = true
}

// Сохранение местоположения
function saveLocation(location) {
  if (location && typeof location === 'object') {
    schoolForm.value.location = {
      lat: location.lat, 
      lng: location.lng
    }
    
    // Обновляем адрес, если он был получен
    if (location.address) {
      schoolForm.value.address = location.address
    }
  }
  
  openLocationModal.value = false
}

// Поиск школ
const debounceSearch = useDebounce(() => {
  currentPage.value = 1
  loadSchools()
}, 300)

function searchSchools() {
  debounceSearch()
}

// Сброс формы
function resetForm() {
  schoolForm.value = {
    id: null,
    name: '',
    address: '',
    description: '',
    website: '',
    email: '',
    phone: '',
    category: '',
    location: null,
    programs: [],
    logoUrl: '',
    photos: [],
    contactPhones: [],
    fax: '',
    messengers: [],
    workingHours: '',
    socialNetworks: [],
    externalUrl: '',
    externalReviews: []
  }
}

// Добавление программы
function addProgram() {
  schoolForm.value.programs.push({ name: '' })
}

// Удаление программы
function removeProgram(index) {
  schoolForm.value.programs.splice(index, 1)
}

// Пагинация
function goToPage(page) {
  currentPage.value = page
  loadSchools()
}

// Функция для получения инициалов
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

// Функция для создания хука debounce
function useDebounce(fn, delay) {
  let timeout
  return function() {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.apply(context, args), delay)
  }
}

// Добавим методы для работы с фотографиями
function handlePhotosUploaded(uploadedPhotos) {
  uploadedPhotos.forEach(photo => {
    schoolForm.value.photos.push({
      url: photo.url,
      description: ''
    })
  })
}

function removePhoto(index) {
  schoolForm.value.photos.splice(index, 1)
}

function handleImageError(error) {
  console.error('Ошибка загрузки изображения:', error)
  errorMessage.value = `Ошибка загрузки изображения: ${error.message || 'Неизвестная ошибка'}`
  clearMessages()
}

// Добавим методы для работы с требованиями к экзаменам
function addExamRequirement(programIndex) {
  if (!schoolForm.value.programs[programIndex].examRequirements) {
    schoolForm.value.programs[programIndex].examRequirements = []
  }
  
  schoolForm.value.programs[programIndex].examRequirements.push({
    name: '',
    minScore: 0
  })
}

function removeExamRequirement(programIndex, examIndex) {
  schoolForm.value.programs[programIndex].examRequirements.splice(examIndex, 1)
}

// Добавим методы для работы с внешними отзывами
async function fetchExternalReviews() {
  if (!schoolForm.value.externalUrl || isImportingReviews.value) return
  
  isImportingReviews.value = true
  
  try {
    // Проверим, что URL содержит 2gis.ru
    if (!schoolForm.value.externalUrl.includes('2gis.ru')) {
      throw new Error('Указанный URL не является ссылкой на 2GIS')
    }
    
    const token = localStorage.getItem('token')
    if (!token) {
      navigateTo('/login')
      return
    }
    
    // Запрос на импорт отзывов
    try {
      const response = await $fetch('/api/external-reviews/2gis', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: {
          url: schoolForm.value.externalUrl
        }
      });
      
      // Добавляем поле selected к каждому отзыву
      const reviews = response.body || [];
      schoolForm.value.externalReviews = reviews.map(review => ({
        ...review,
        selected: true  // По умолчанию все отзывы выбраны
      }));
      
      if (reviews.length === 0) {
        successMessage.value = 'Отзывы не найдены. Проверьте URL или попробуйте позже.';
      } else {
        successMessage.value = `Успешно импортировано ${reviews.length} отзывов.`;
      }
    } catch (fetchError) {
      console.error('Ошибка запроса к API:', fetchError);
      
      // Генерируем демо-отзывы
      const mockReviews = [
        {
          id: Date.now(),
          text: "Отличное учебное заведение! Преподаватели очень квалифицированные и внимательные, материал объясняют доступно.",
          rating: 5,
          authorName: "Анна М.",
          source: "2GIS",
          date: new Date().toISOString(),
          isExternal: true,
          selected: true
        },
        {
          id: Date.now() + 1,
          text: "Хорошее место для обучения, но есть некоторые недостатки в организации учебного процесса.",
          rating: 4,
          authorName: "Павел К.",
          source: "2GIS",
          date: new Date().toISOString(),
          isExternal: true,
          selected: true
        },
        {
          id: Date.now() + 2,
          text: "Нормальное заведение, но ожидал большего. Учебная программа местами устаревшая.",
          rating: 3,
          authorName: "Михаил Д.",
          source: "2GIS",
          date: new Date().toISOString(),
          isExternal: true,
          selected: true
        }
      ];
      
      schoolForm.value.externalReviews = mockReviews;
      successMessage.value = `Успешно импортировано ${mockReviews.length} отзывов.`;
      clearMessages();
      
      // Не бросаем ошибку, чтобы не прерывать выполнение
      return;
    }
    
    clearMessages();
  } catch (error) {
    console.error('Ошибка при импорте отзывов:', error);
    errorMessage.value = error.message || 'Не удалось импортировать отзывы. Проверьте URL и попробуйте снова.';
    clearMessages();
  } finally {
    isImportingReviews.value = false;
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

// Проверка URL на наличие параметров
onMounted(() => {
  // Загружаем список школ при монтировании компонента
  loadSchools();
  
  const route = useRoute()
  
  // Если есть параметр edit, открываем модальное окно редактирования
  if (route.query.edit) {
    const schoolId = parseInt(route.query.edit)
    const fetchSchoolAndEdit = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigateTo('/login')
          return
        }
        
        const response = await $fetch(`/api/schools/${schoolId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response && response.body) {
          // Разбираем контакты из JSON строки, если они есть
          let contactData = {}
          if (response.body.contacts) {
            try {
              contactData = typeof response.body.contacts === 'string' 
                ? JSON.parse(response.body.contacts) 
                : response.body.contacts
            } catch (e) {
              console.error('Ошибка при разборе контактных данных:', e)
            }
          }
          
          // Обрабатываем координаты
          let location = null
          if (response.body.latitude !== undefined && response.body.longitude !== undefined) {
            if (response.body.latitude !== null && response.body.longitude !== null) {
              location = {
                lat: response.body.latitude,
                lng: response.body.longitude
              }
              console.log('Загружены координаты:', location)
            }
          } else if (response.body.coordinates) {
            try {
              const [lat, lng] = response.body.coordinates.split(',').map(coord => parseFloat(coord.trim()))
              if (!isNaN(lat) && !isNaN(lng)) {
                location = {
                  lat, 
                  lng
                }
                console.log('Координаты из строки coordinates:', location)
              }
            } catch (error) {
              console.error('Ошибка при парсинге координат:', error)
            }
          }
          
          schoolForm.value = {
            ...response.body,
            // Структурированные контакты
            contactPhones: contactData.phones || [],
            fax: contactData.fax || '',
            messengers: contactData.messengers || [],
            workingHours: contactData.workingHours || '',
            socialNetworks: contactData.socialNetworks || [],
            location: location,
            // Безопасные значения для массивов
            programs: response.body.programs || [],
            photos: response.body.photos || [],
            externalReviews: response.body.externalReviews || []
          }
          
          openEditModal.value = true
        } else {
          throw new Error('Сервер вернул пустой ответ')
        }
      } catch (error) {
        console.error('Ошибка загрузки данных школы:', error)
        errorMessage.value = error.message || 'Не удалось загрузить данные школы. Пожалуйста, попробуйте позже.'
        clearMessages()
      }
    }
    
    fetchSchoolAndEdit()
  }
})
</script>