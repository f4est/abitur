import prisma from '../../utils/prisma'
import jwt from 'jsonwebtoken'

// Проверка авторизации
const verifyToken = (event) => {
  const authHeader = getRequestHeader(event, 'authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Проверка прав администратора
const isAdmin = (user) => {
  return user && user.role === 'ADMIN'
}

export default defineEventHandler(async (event) => {
  try {
    // Проверяем авторизацию
    const user = verifyToken(event)
    if (!user) {
      return {
        statusCode: 401,
        body: { message: 'Требуется авторизация' }
      }
    }
    
    // Обрабатываем методы GET, POST, PUT, DELETE
    const method = event.req.method
    const url = event.req.url
    
    // GET запрос - получение всех вопросов
    if (method === 'GET' && url.endsWith('/api/test-api/questions')) {
      // Получаем все вопросы теста
      const questions = await prisma.testQuestion.findMany()
      
      // Если вопросов нет, возвращаем пустой массив
      if (!questions || questions.length === 0) {
        return {
          statusCode: 200,
          body: []
        }
      }
      
      // Приводим JSON-строки к объектам JavaScript для удобства использования
      const formattedQuestions = questions.map(q => {
        try {
          // Убедимся, что options это массив объектов
          let parsedOptions = [];
          
          if (q.options) {
            if (typeof q.options === 'string') {
              try {
                parsedOptions = JSON.parse(q.options);
                
                // Проверяем, является ли результат массивом
                if (!Array.isArray(parsedOptions)) {
                  console.error(`Ошибка формата options для вопроса ${q.id}: options не является массивом`);
                  parsedOptions = [];
                }
              } catch (e) {
                console.error(`Ошибка парсинга options для вопроса ${q.id}:`, e);
              }
            } else if (Array.isArray(q.options)) {
              parsedOptions = q.options;
            }
          }
          
          // Проверяем, что у каждого варианта ответа есть правильная структура
          parsedOptions = parsedOptions.map((opt, index) => {
            // Если структура неправильная - создаем корректную
            const properOption = { value: index + 1 };
            
            // Если есть поле text - используем его
            if (opt && typeof opt.text === 'string') {
              properOption.text = opt.text;
            }
            // Если text нет - проверяем, может быть передан просто строковый вариант
            else if (typeof opt === 'string') {
              properOption.text = opt;
            }
            // Если есть числовые ключи - это неправильная структура, берем "Вариант ответа" по умолчанию
            else if (opt && Object.keys(opt).some(k => !isNaN(parseInt(k)))) {
              properOption.text = `Вариант ответа ${index + 1}`;
            }
            // Запасной вариант
            else {
              properOption.text = `Вариант ответа ${index + 1}`;
            }
            
            // Если есть поле value - используем его
            if (opt && typeof opt.value === 'number') {
              properOption.value = opt.value;
            }
            
            return properOption;
          });
          
          // Для weights применяем аналогичную логику
          let parsedWeights = {};
          if (q.weights) {
            try {
              parsedWeights = typeof q.weights === 'string' ? JSON.parse(q.weights) : q.weights;
            } catch (e) {
              console.error(`Ошибка парсинга weights для вопроса ${q.id}:`, e);
            }
          }
          
          return {
            ...q,
            options: parsedOptions,
            weights: parsedWeights
          };
        } catch (e) {
          // Если произошла ошибка парсинга, возвращаем исходные строки
          console.error(`Ошибка обработки вопроса ${q.id}:`, e);
          return q;
        }
      });
      
      console.log('Отправка вопросов:', formattedQuestions.length);
      // Для отладки выводим первый вопрос, если он есть
      if (formattedQuestions.length > 0) {
        console.log('Пример вопроса:', JSON.stringify(formattedQuestions[0], null, 2));
      }
      
      return {
        statusCode: 200,
        body: formattedQuestions
      }
    }
    
    // GET запрос - получение конкретного вопроса по ID
    if (method === 'GET' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
      const id = parseInt(url.split('/').pop())
      
      if (isNaN(id)) {
        return {
          statusCode: 400,
          body: { message: 'Некорректный ID вопроса' }
        }
      }
      
      // Получаем вопрос по ID
      const question = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!question) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }
      
      // Форматируем ответ
      try {
        const formattedQuestion = {
          ...question,
          options: question.options ? JSON.parse(question.options) : [],
          weights: question.weights ? JSON.parse(question.weights) : {}
        }
        
        return {
          statusCode: 200,
          body: formattedQuestion
        }
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 200,
          body: question
        }
      }
    }
    
    // POST запрос - создание нового вопроса
    if (method === 'POST' && url.endsWith('/api/test-api/questions')) {
      // Проверяем права администратора
      if (!isAdmin(user)) {
        return {
          statusCode: 403,
          body: { message: 'Доступ запрещен. Требуются права администратора.' }
        }
      }
      
      // Получаем данные из тела запроса
      const body = await readBody(event)
      
      // Проверяем обязательные поля
      if (!body.question || !body.category) {
        return {
          statusCode: 400,
          body: { message: 'Поля "question" и "category" обязательны' }
        }
      }
      
      // Подготавливаем варианты ответов
      let optionsData = []
      
      if (Array.isArray(body.options)) {
        // Если это массив строк, преобразуем их в объекты с текстом и значением
        optionsData = body.options.map((opt, index) => {
          if (typeof opt === 'string') {
            return { text: opt, value: index + 1 }
          } else if (typeof opt === 'object' && opt !== null) {
            return { 
              text: opt.text || `Вариант ${index + 1}`, 
              value: typeof opt.value === 'number' ? opt.value : index + 1 
            }
          }
          return { text: `Вариант ${index + 1}`, value: index + 1 }
        })
      }
      
      // Подготавливаем данные для сохранения
      const data = {
        question: body.question,
        category: body.category,
        options: JSON.stringify(optionsData),
        weights: body.weights ? (typeof body.weights === 'string' ? body.weights : JSON.stringify(body.weights)) : '{}'
      }
      
      // Создаем новый вопрос
      const question = await prisma.testQuestion.create({
        data
      })
      
      // Форматируем ответ
      try {
        const formattedQuestion = {
          ...question,
          options: JSON.parse(question.options),
          weights: question.weights ? JSON.parse(question.weights) : {}
        }
        
        return {
          statusCode: 201,
          body: formattedQuestion
        }
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 201,
          body: question
        }
      }
    }
    
    // PUT запрос - обновление вопроса
    if (method === 'PUT' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
      // Проверяем права администратора
      if (!isAdmin(user)) {
        return {
          statusCode: 403,
          body: { message: 'Доступ запрещен. Требуются права администратора.' }
        }
      }
      
      const id = parseInt(url.split('/').pop())
      
      if (isNaN(id)) {
        return {
          statusCode: 400,
          body: { message: 'Некорректный ID вопроса' }
        }
      }
      
      // Проверяем существование вопроса
      const existingQuestion = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!existingQuestion) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }
      
      // Получаем данные из тела запроса
      const body = await readBody(event)
      
      // Подготавливаем данные для обновления
      const updateData = {}
      
      if (body.question) updateData.question = body.question
      if (body.category) updateData.category = body.category
      
      // Обрабатываем варианты ответов
      if (body.options) {
        if (Array.isArray(body.options)) {
          // Преобразуем варианты ответов в нужный формат
          const optionsData = body.options.map((opt, index) => {
            if (typeof opt === 'string') {
              return { text: opt, value: index + 1 }
            } else if (typeof opt === 'object' && opt !== null) {
              return { 
                text: opt.text || `Вариант ${index + 1}`, 
                value: typeof opt.value === 'number' ? opt.value : index + 1 
              }
            }
            return { text: `Вариант ${index + 1}`, value: index + 1 }
          })
          
          updateData.options = JSON.stringify(optionsData)
        } else {
          updateData.options = typeof body.options === 'string' ? body.options : JSON.stringify(body.options)
        }
      }
      
      // Обрабатываем веса
      if (body.weights) {
        updateData.weights = typeof body.weights === 'string' ? body.weights : JSON.stringify(body.weights)
      }
      
      // Обновляем вопрос
      const updatedQuestion = await prisma.testQuestion.update({
        where: { id },
        data: updateData
      })
      
      // Форматируем ответ
      try {
        const formattedQuestion = {
          ...updatedQuestion,
          options: JSON.parse(updatedQuestion.options),
          weights: updatedQuestion.weights ? JSON.parse(updatedQuestion.weights) : {}
        }
        
        return {
          statusCode: 200,
          body: formattedQuestion
        }
      } catch (error) {
        // В случае ошибки парсинга возвращаем оригинальные данные
        return {
          statusCode: 200,
          body: updatedQuestion
        }
      }
    }
    
    // DELETE запрос - удаление вопроса
    if (method === 'DELETE' && url.match(/\/api\/test-api\/questions\/\d+$/)) {
      // Проверяем права администратора
      if (!isAdmin(user)) {
        return {
          statusCode: 403,
          body: { message: 'Доступ запрещен. Требуются права администратора.' }
        }
      }
      
      const id = parseInt(url.split('/').pop())
      
      if (isNaN(id)) {
        return {
          statusCode: 400,
          body: { message: 'Некорректный ID вопроса' }
        }
      }
      
      // Проверяем существование вопроса
      const existingQuestion = await prisma.testQuestion.findUnique({
        where: { id }
      })
      
      if (!existingQuestion) {
        return {
          statusCode: 404,
          body: { message: 'Вопрос не найден' }
        }
      }
      
      // Удаляем вопрос
      await prisma.testQuestion.delete({
        where: { id }
      })
      
      return {
        statusCode: 200,
        body: { message: 'Вопрос успешно удален' }
      }
    }
    
    // Если запрос не соответствует ни одному из обработчиков
    return {
      statusCode: 404,
      body: { message: 'Маршрут не найден' }
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error)
    return {
      statusCode: 500,
      body: { message: 'Внутренняя ошибка сервера', error: error.message }
    }
  }
}) 