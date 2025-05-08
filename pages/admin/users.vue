<template>
  <div class="bg-gray-50 min-h-screen p-2 sm:p-4 md:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">Управление пользователями</h1>
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
            placeholder="Поиск пользователей..." 
            class="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-64"
            @input="searchUsers"
          />
          <select 
            v-model="roleFilter"
            class="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none w-full sm:w-auto"
            @change="searchUsers"
          >
            <option value="">Все роли</option>
            <option value="ADMIN">Администраторы</option>
            <option value="USER">Пользователи</option>
          </select>
        </div>
        <button 
          @click="openAddModal = true" 
          class="bg-ashleigh text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-opacity-90 transition text-sm sm:text-base w-full sm:w-auto"
        >
          + Добавить пользователя
        </button>
      </div>
      
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-ashleigh"></div>
        <p class="mt-2 text-gray-700">Загрузка пользователей...</p>
      </div>
      
      <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
        <p class="text-gray-700">Пользователи не найдены</p>
      </div>
      
      <div v-else class="overflow-x-auto bg-white rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden sm:table-cell">ID</th>
              <th class="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Имя</th>
              <th class="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">Email</th>
              <th class="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Роль</th>
              <th class="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Действия</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-700 hidden sm:table-cell">{{ user.id }}</td>
              <td class="px-3 py-4 sm:px-6 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-skyway flex items-center justify-center text-white flex-shrink-0">
                    {{ getInitials(user.name) }}
                  </div>
                  <div class="ml-2 sm:ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-xs text-gray-500 md:hidden">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-700 hidden md:table-cell">{{ user.email }}</td>
              <td class="px-3 py-4 sm:px-6 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                  :class="user.role === 'ADMIN' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-3 py-4 sm:px-6 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button 
                    @click="editUser(user)" 
                    class="text-ashleigh hover:text-ashleigh/80"
                  >
                    <span class="hidden sm:inline mr-1">Изменить</span>
                    <span class="sm:hidden">✏️</span>
                  </button>
                  <button 
                    @click="confirmDelete(user)" 
                    class="text-red-600 hover:text-red-800"
                  >
                    <span class="hidden sm:inline">Удалить</span>
                    <span class="sm:hidden">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Добавляем пагинацию -->
      <div v-if="totalPages > 1" class="flex justify-center my-4">
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
    
    <!-- Модальное окно добавления пользователя -->
    <div v-if="openAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">Добавить пользователя</h2>
        
        <form @submit.prevent="addUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input
              v-model="userForm.name"
              type="text"
              required
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <input
              v-model="userForm.password"
              type="password"
              required
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              v-model="userForm.role"
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            >
              <option value="USER">Пользователь</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="openAddModal = false"
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm sm:text-base"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-3 py-2 bg-ashleigh hover:bg-opacity-90 text-white rounded-lg text-sm sm:text-base"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модальное окно редактирования пользователя -->
    <div v-if="openEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold mb-4">Редактировать пользователя</h2>
        
        <form @submit.prevent="updateUser" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input
              v-model="userForm.name"
              type="text"
              required
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              required
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Новый пароль (оставьте пустым, чтобы не менять)</label>
            <input
              v-model="userForm.password"
              type="password"
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              v-model="userForm.role"
              class="px-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-ashleigh focus:border-ashleigh outline-none"
            >
              <option value="USER">Пользователь</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </div>
          
          <div class="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              @click="openEditModal = false"
              class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm sm:text-base"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-3 py-2 bg-ashleigh hover:bg-opacity-90 text-white rounded-lg text-sm sm:text-base"
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Модальное окно подтверждения удаления -->
    <div v-if="openDeleteModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">Удаление пользователя</h2>
        
        <p class="mb-6 text-gray-700">
          Вы действительно хотите удалить пользователя <span class="font-medium">{{ userToDelete?.name }}</span>?
          Это действие невозможно отменить.
        </p>
        
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="openDeleteModal = false; userToDelete = null;"
            class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm"
            :disabled="isSubmitting"
          >
            Отмена
          </button>
          <button
            type="button"
            @click="deleteUser"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm flex items-center"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Удалить
          </button>
        </div>
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
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Состояние загрузки
const isLoading = ref(true)
const isSubmitting = ref(false)

// Параметры запроса
const searchQuery = ref('')
const roleFilter = ref('')
const currentPage = ref(1)
const limit = 10

// Пользователи
const users = ref([])
const totalUsers = ref(0)
const totalPages = computed(() => Math.ceil(totalUsers.value / limit))

// Фильтрация пользователей
const filteredUsers = computed(() => {
  let result = [...users.value]
  
  // Фильтр по поисковому запросу
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.name.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query)
    )
  }
  
  // Фильтр по роли
  if (roleFilter.value) {
    result = result.filter(user => user.role === roleFilter.value)
  }
  
  return result
})

// Модальные окна
const openAddModal = ref(false)
const openEditModal = ref(false)
const openDeleteModal = ref(false)

// Форма пользователя
const userForm = ref({
  id: null,
  name: '',
  email: '',
  password: '',
  role: 'USER'
})

// ID пользователя для удаления
const userToDelete = ref(null)

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

// Токен для API-запросов
const token = process.client ? localStorage.getItem('token') : null

// Загрузка пользователей
async function loadUsers() {
  isLoading.value = true
  try {
    const { data, error } = await useFetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` },
      key: `admin-users-${currentPage.value}-${searchQuery.value}-${roleFilter.value}-${Date.now()}`
    })
    
    if (error.value) {
      throw new Error('Ошибка загрузки пользователей')
    }
    
    users.value = data.value.body || []
    totalUsers.value = data.value.total || users.value.length
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error)
    errorMessage.value = 'Не удалось загрузить пользователей. Пожалуйста, попробуйте позже.'
    clearMessages()
    users.value = []
  } finally {
    isLoading.value = false
  }
}

// Добавление пользователя
async function addUser() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    const { data, error } = await useFetch('/api/users', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: {
        name: userForm.value.name,
        email: userForm.value.email,
        password: userForm.value.password,
        role: userForm.value.role
      }
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Ошибка при добавлении пользователя')
    }
    
    // Добавление нового пользователя в список
    users.value.unshift(data.value.body)
    totalUsers.value++
    
    // Закрыть модальное окно и очистить форму
    openAddModal.value = false
    resetForm()
    
    // Показать сообщение об успехе
    successMessage.value = 'Пользователь успешно добавлен'
    clearMessages()
  } catch (error) {
    console.error('Ошибка при добавлении пользователя:', error)
    errorMessage.value = error.message || 'Не удалось добавить пользователя. Пожалуйста, проверьте данные и попробуйте снова.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Редактирование пользователя
function editUser(user) {
  userForm.value = {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    role: user.role
  }
  openEditModal.value = true
}

// Обновление пользователя
async function updateUser() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    // Подготовка данных для обновления
    const updateData = {
      name: userForm.value.name,
      email: userForm.value.email,
      role: userForm.value.role
    }
    
    // Добавляем пароль только если он указан
    if (userForm.value.password) {
      updateData.password = userForm.value.password
    }
    
    const { data, error } = await useFetch(`/api/users/${userForm.value.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: updateData
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Ошибка при обновлении пользователя')
    }
    
    // Обновление пользователя в списке
    const index = users.value.findIndex(u => u.id === userForm.value.id)
    if (index !== -1) {
      users.value[index] = { ...users.value[index], ...data.value.body }
    }
    
    // Закрыть модальное окно и очистить форму
    openEditModal.value = false
    resetForm()
    
    // Показать сообщение об успехе
    successMessage.value = 'Данные пользователя успешно обновлены'
    clearMessages()
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error)
    errorMessage.value = error.message || 'Не удалось обновить пользователя. Пожалуйста, проверьте данные и попробуйте снова.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Подтверждение удаления
function confirmDelete(user) {
  userToDelete.value = user
  openDeleteModal.value = true
}

// Удаление пользователя
async function deleteUser() {
  if (isSubmitting.value || !userToDelete.value) return
  
  isSubmitting.value = true
  try {
    const { error } = await useFetch(`/api/users/${userToDelete.value.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Ошибка при удалении пользователя')
    }
    
    // Удаление пользователя из списка
    users.value = users.value.filter(u => u.id !== userToDelete.value.id)
    totalUsers.value--
    
    // Закрыть модальное окно
    openDeleteModal.value = false
    userToDelete.value = null
    
    // Показать сообщение об успехе
    successMessage.value = 'Пользователь успешно удален'
    clearMessages()
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error)
    errorMessage.value = error.message || 'Не удалось удалить пользователя. Пожалуйста, попробуйте позже.'
    clearMessages()
  } finally {
    isSubmitting.value = false
  }
}

// Поиск пользователей
const debounceSearch = useDebounce(() => {
  currentPage.value = 1
  loadUsers()
}, 300)

function searchUsers() {
  debounceSearch()
}

// Сброс формы
function resetForm() {
  userForm.value = {
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'USER'
  }
}

// Пагинация
function goToPage(page) {
  currentPage.value = page
  loadUsers()
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

// Проверка URL на наличие параметров
onMounted(() => {
  const route = useRoute()
  
  // Если есть параметр edit, открываем модальное окно редактирования
  if (route.query.edit) {
    const userId = parseInt(route.query.edit)
    const fetchUserAndEdit = async () => {
      try {
        const { data, error } = await useFetch(`/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (error.value) throw new Error('Не удалось загрузить данные пользователя')
        
        editUser(data.value.body)
      } catch (error) {
        console.error('Ошибка при загрузке пользователя для редактирования:', error)
        errorMessage.value = 'Не удалось загрузить пользователя для редактирования'
        clearMessages()
      }
    }
    
    fetchUserAndEdit()
  }
  
  // Если есть параметр delete, открываем модальное окно удаления
  if (route.query.delete) {
    const userId = parseInt(route.query.delete)
    const fetchUserAndDelete = async () => {
      try {
        const { data, error } = await useFetch(`/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (error.value) throw new Error('Не удалось загрузить данные пользователя')
        
        confirmDelete(data.value.body)
      } catch (error) {
        console.error('Ошибка при загрузке пользователя для удаления:', error)
        errorMessage.value = 'Не удалось загрузить пользователя для удаления'
        clearMessages()
      }
    }
    
    fetchUserAndDelete()
  }
  
  // Загрузка списка пользователей
  loadUsers()
})

// Заголовок страницы
useHead({
  title: 'Управление пользователями - Админ-панель'
})
</script> 