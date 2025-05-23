const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()

async function main() {
  console.log('Начинаем заполнение базы данных тестовыми данными...')
  
  // Создаем пользователей
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Администратор',
      role: 'ADMIN'
    }
  })
  
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Тестовый пользователь',
      role: 'USER'
    }
  })
  
  console.log('Создан администратор:', admin.email)
  console.log('Создан пользователь:', user.email)
  
  // Создаем учебные заведения
  const school1 = await prisma.school.create({
    data: {
      name: 'Политехнический колледж',
      description: 'Хороший колледж',
      address: 'Алматы, микрорайон Тастак-1, 1В',
      category: 'college',
      phoneNumber: '+7 (727) 123-45-67',
      email: 'college@example.com',
      website: 'http://college.example.com',
      latitude: 43.238949,
      longitude: 76.889709,
      // Контактная информация
      faxNumber: '238248',
      workingHours: 'Пн-Пт 8:00-18:00 Сб-Вс выходной',
      // Доп. контакты в JSON формате
      contacts: JSON.stringify({
        phones: ['+7 (727) 123-45-67', '+7 (727) 765-43-21'],
        fax: '238248',
        messengers: [
          { type: 'whatsapp', value: '+77771234567' },
          { type: 'telegram', value: '@college_example' }
        ],
        workingHours: 'Пн-Пт 8:00-18:00 Сб-Вс выходной',
        socialNetworks: [
          { type: 'vk', url: 'https://vk.com/college_example' },
          { type: 'instagram', url: 'https://instagram.com/college_example' }
        ]
      })
    }
  })
  
  const school2 = await prisma.school.create({
    data: {
      name: 'Университет информационных технологий',
      description: 'Ведущий университет в области IT',
      address: 'Алматы, ул. Жандосова, 42',
      category: 'university',
      phoneNumber: '+7 (727) 987-65-43',
      email: 'university@example.com',
      website: 'http://university.example.com',
      latitude: 43.238949,
      longitude: 76.889709
    }
  })
  
  console.log('Создано учебное заведение:', school1.name)
  console.log('Создано учебное заведение:', school2.name)
  
  // Создаем образовательные программы для МГУ
  const program1 = await prisma.educationalProgram.create({
    data: {
      name: 'Информационные системы',
      code: 'IS-101',
      description: 'Программа подготовки специалистов в области информационных систем',
      duration: '4 года',
      price: 450000,
      category: 'bachelor',
      schoolId: school1.id
    }
  })
  
  const program2 = await prisma.educationalProgram.create({
    data: {
      name: 'Программная инженерия',
      code: 'SE-202',
      description: 'Программа подготовки программных инженеров',
      duration: '4 года',
      price: 500000,
      category: 'bachelor',
      schoolId: school2.id
    }
  })
  
  console.log('Создана образовательная программа:', program1.name)
  console.log('Создана образовательная программа:', program2.name)
  
  // Добавляем фотографии для МГУ
  await prisma.schoolPhoto.createMany({
    data: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Moscow_05-2012_Lomonosov_University.jpg/1200px-Moscow_05-2012_Lomonosov_University.jpg',
        schoolId: school1.id
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Moscow_State_University_crop.jpg/800px-Moscow_State_University_crop.jpg',
        schoolId: school1.id
      }
    ]
  })
  
  // Добавляем фотографии для СПбГУ
  await prisma.schoolPhoto.createMany({
    data: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Saint_Petersburg_State_University.jpg',
        schoolId: school2.id
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/SPbGU_main_building.jpg/800px-SPbGU_main_building.jpg',
        schoolId: school2.id
      }
    ]
  })
  
  console.log('Фотографии добавлены')
  
  // Добавляем отзывы
  await prisma.review.create({
    data: {
      text: 'Отличный университет с многолетней историей и традициями. Дает фундаментальные знания и открывает много возможностей.',
      rating: 5,
      authorName: 'Иван Петров',
      userId: user.id,
      schoolId: school1.id
    }
  })
  
  await prisma.review.create({
    data: {
      text: 'Преподаватели высокого уровня, но кампус нуждается в обновлении.',
      rating: 4,
      authorName: 'Мария Сидорова',
      userId: user.id,
      schoolId: school2.id
    }
  })
  
  console.log('Отзывы добавлены')
  
  // Создаем вопросы для теста профориентации
  const question1 = await prisma.testQuestion.create({
    data: {
      question: 'Вам нравится работать с числами и анализировать данные?',
      options: JSON.stringify([
        { text: 'Очень нравится', value: 5 },
        { text: 'Скорее нравится', value: 4 },
        { text: 'Нейтрально', value: 3 },
        { text: 'Скорее не нравится', value: 2 },
        { text: 'Совсем не нравится', value: 1 }
      ]),
      category: 'analytical',
      weights: JSON.stringify({
        'it': 5,
        'economics': 4,
        'engineering': 3
      })
    }
  })
  
  const question2 = await prisma.testQuestion.create({
    data: {
      question: 'Вам интересно изучать иностранные языки?',
      options: JSON.stringify([
        { text: 'Очень интересно', value: 5 },
        { text: 'Скорее интересно', value: 4 },
        { text: 'Нейтрально', value: 3 },
        { text: 'Скорее не интересно', value: 2 },
        { text: 'Совсем не интересно', value: 1 }
      ]),
      category: 'linguistics',
      weights: JSON.stringify({
        'linguistics': 5,
        'international': 4,
        'education': 3
      })
    }
  })
  
  console.log('Создан вопрос теста:', question1.question)
  console.log('Создан вопрос теста:', question2.question)
  
  console.log('Заполнение базы данных завершено!')
}

main()
  .catch(e => {
    console.error('Ошибка при заполнении базы данных:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 