import prisma from '../utils/prisma'
import bcrypt from 'bcrypt'
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

// Тестовые вопросы для профориентации
const testQuestions = [
  {
    question: 'Какой тип деятельности вам ближе?',
    options: JSON.stringify([
      'Работа с людьми',
      'Работа с техникой и технологиями',
      'Творческая деятельность',
      'Научно-исследовательская работа',
      'Физическая активность'
    ]),
    category: 'personality',
    weights: JSON.stringify({
      'humanities': [5, 0, 3, 2, 0],
      'technical': [0, 5, 1, 3, 2],
      'creative': [2, 0, 5, 0, 2],
      'science': [1, 3, 0, 5, 0],
      'physical': [2, 2, 1, 0, 5]
    })
  },
  {
    question: 'Что вас мотивирует в работе больше всего?',
    options: JSON.stringify([
      'Высокая зарплата',
      'Интересные задачи и вызовы',
      'Возможность помогать людям',
      'Стабильность и надежность',
      'Признание и статус'
    ]),
    category: 'motivation',
    weights: JSON.stringify({
      'commercial': [5, 3, 0, 2, 4],
      'academic': [1, 5, 2, 3, 0],
      'social': [0, 2, 5, 3, 1],
      'stability': [3, 0, 2, 5, 2],
      'leadership': [3, 2, 1, 0, 5]
    })
  },
  {
    question: 'Какие предметы в школе вам нравились больше всего?',
    options: JSON.stringify([
      'Математика и физика',
      'Языки и литература',
      'Биология и химия',
      'История и обществознание',
      'Информатика и программирование'
    ]),
    category: 'interests',
    weights: JSON.stringify({
      'technical': [5, 0, 2, 0, 4],
      'humanities': [0, 5, 0, 4, 0],
      'natural_science': [3, 0, 5, 1, 2],
      'social_science': [1, 3, 0, 5, 0],
      'it': [3, 0, 0, 0, 5]
    })
  }
];

// Тестовые школы
const testSchools = [
  {
    name: 'Технический университет',
    description: 'Ведущий технический вуз страны с многолетней историей и традициями.',
    address: 'г. Алматы, ул. Сатпаева, 22',
    coordinates: '43.238949,76.945465',
    logoUrl: 'https://picsum.photos/seed/tech1/200',
    websiteUrl: 'https://techuniversity.kz',
    contacts: 'info@techuniversity.kz, +7 (777) 123-45-67',
    programs: {
      create: [
        {
          name: 'Информационные системы',
          code: 'IS-101',
          description: 'Подготовка специалистов в области информационных систем.',
          duration: '4 года'
        },
        {
          name: 'Автоматизация и управление',
          code: 'AU-202',
          description: 'Подготовка инженеров по автоматизации производственных процессов.',
          duration: '4 года'
        }
      ]
    }
  },
  {
    name: 'Гуманитарный университет',
    description: 'Университет с фокусом на гуманитарные и социальные науки.',
    address: 'г. Алматы, ул. Абая, 105',
    coordinates: '43.241167,76.957825',
    logoUrl: 'https://picsum.photos/seed/hum1/200',
    websiteUrl: 'https://humanuniversity.kz',
    contacts: 'info@humanuniversity.kz, +7 (777) 987-65-43',
    programs: {
      create: [
        {
          name: 'Международные отношения',
          code: 'IR-301',
          description: 'Подготовка специалистов в области международных отношений и дипломатии.',
          duration: '4 года'
        },
        {
          name: 'Журналистика',
          code: 'JR-102',
          description: 'Обучение современной журналистике и медиакоммуникациям.',
          duration: '4 года'
        }
      ]
    }
  }
];

export default defineEventHandler(async (event) => {
  try {
    // Проверяем авторизацию и права администратора
    const user = verifyToken(event)
    if (!user || !isAdmin(user)) {
      return {
        statusCode: 403,
        body: { message: 'Доступ запрещен. Требуются права администратора.' }
      }
    }
    
    // Удаляем существующие данные
    await prisma.$transaction([
      prisma.testResult.deleteMany(),
      prisma.testQuestion.deleteMany(),
      prisma.examRequirement.deleteMany(),
      prisma.educationalProgram.deleteMany(),
      prisma.schoolPhoto.deleteMany(),
      prisma.review.deleteMany(),
      prisma.savedSchool.deleteMany(),
      prisma.school.deleteMany()
    ]);
    
    // Создаем тестовые вопросы
    const questions = await Promise.all(
      testQuestions.map(q => prisma.testQuestion.create({ data: q }))
    );
    
    // Создаем тестовые школы
    const schools = await Promise.all(
      testSchools.map(s => prisma.school.create({ data: s }))
    );
    
    return {
      body: {
        message: 'Тестовые данные успешно созданы',
        questionsCount: questions.length,
        schoolsCount: schools.length
      }
    }
  } catch (error) {
    console.error('Ошибка при создании тестовых данных:', error)
    return {
      statusCode: 500,
      body: { 
        message: 'Внутренняя ошибка сервера', 
        error: error.message,
        stack: error.stack
      }
    }
  }
}) 