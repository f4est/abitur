export const useSavedSchools = () => {
  const savedSchoolsIds = useState('savedSchoolsIds', () => [])
  const isLoading = useState('savedSchoolsLoading', () => false)
  const isSavingOrDeleting = useState('savedSchoolsOperation', () => false)

  // Загрузка сохраненных учебных заведений
  const loadSavedSchools = async () => {
    // Пропускаем, если уже загружаем
    if (isLoading.value) return

    const token = localStorage.getItem('token')
    if (!token) {
      savedSchoolsIds.value = []
      return
    }

    isLoading.value = true
    try {
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.savedSchools && Array.isArray(data.savedSchools)) {
          console.log('Загружены сохраненные школы:', data.savedSchools.length)
          savedSchoolsIds.value = data.savedSchools.map(saved => saved.schoolId)
        } else {
          console.warn('Не удалось найти savedSchools в ответе API:', data)
          savedSchoolsIds.value = []
        }
      } else {
        console.error('Ошибка при загрузке данных пользователя:', response.status)
        savedSchoolsIds.value = []
      }
    } catch (error) {
      console.error('Ошибка загрузки сохраненных учебных заведений:', error)
      savedSchoolsIds.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Проверка, сохранено ли учебное заведение
  const isSchoolSaved = (schoolId) => {
    // Преобразуем в число для корректного сравнения
    const numericId = parseInt(schoolId)
    return savedSchoolsIds.value.includes(numericId)
  }

  // Сохранение/удаление учебного заведения
  const toggleSaveSchool = async (schoolId) => {
    // Пропускаем, если операция уже выполняется
    if (isSavingOrDeleting.value) return

    const token = localStorage.getItem('token')
    if (!token) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      navigateTo('/login')
      return
    }

    // Преобразуем в число для корректного сравнения
    const numericId = parseInt(schoolId)

    const isSaved = isSchoolSaved(numericId)
    const method = isSaved ? 'DELETE' : 'POST'

    isSavingOrDeleting.value = true
    try {
      const response = await fetch(`/api/schools/${numericId}/save`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        if (isSaved) {
          // Удаляем из сохраненных
          savedSchoolsIds.value = savedSchoolsIds.value.filter(id => id !== numericId)
          console.log(`Школа ${numericId} удалена из избранного`)
        } else {
          // Добавляем в сохраненные
          savedSchoolsIds.value.push(numericId)
          console.log(`Школа ${numericId} добавлена в избранное`)
        }
        
        // Обновляем пользователя в localStorage
        updateLocalStorageUser(numericId, !isSaved)
      } else {
        console.error('Ошибка при сохранении/удалении учебного заведения:', response.status)
      }
    } catch (error) {
      console.error('Ошибка при сохранении/удалении учебного заведения:', error)
    } finally {
      isSavingOrDeleting.value = false
    }
  }

  // Обновляем данные пользователя в localStorage
  const updateLocalStorageUser = (schoolId, isAdd) => {
    const userStr = localStorage.getItem('user')
    if (!userStr) return

    try {
      const userData = JSON.parse(userStr)
      if (!userData || !userData.id) return

      // Инициализируем массив savedSchools, если его нет
      if (!userData.savedSchools) {
        userData.savedSchools = []
      }

      if (isAdd) {
        // Добавляем учебное заведение, если его еще нет
        if (!userData.savedSchools.some(saved => saved.schoolId === schoolId)) {
          userData.savedSchools.push({
            userId: userData.id,
            schoolId: schoolId,
            createdAt: new Date().toISOString()
          })
        }
      } else {
        // Удаляем учебное заведение
        userData.savedSchools = userData.savedSchools.filter(
          saved => saved.schoolId !== schoolId
        )
      }

      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.error('Ошибка обновления localStorage:', e)
    }
  }

  return {
    savedSchoolsIds,
    isLoading,
    isSavingOrDeleting,
    loadSavedSchools,
    isSchoolSaved,
    toggleSaveSchool
  }
} 