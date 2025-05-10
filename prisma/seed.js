import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Начинаем заполнение базы данных тестовыми данными...')
  
  // Создаем пользователей
  const adminPassword = await bcrypt.hash('admin123', 10)
  const userPassword = await bcrypt.hash('user123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: adminPassword,
      name: 'Администратор',
      role: 'ADMIN'
    }
  })
  
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      password: userPassword,
      name: 'Обычный пользователь',
      role: 'USER'
    }
  })
  
  console.log('Пользователи созданы:', { admin, user })
  
  // Создаем учебные заведения
  const mgu = await prisma.school.create({
    data: {
      name: 'Московский государственный университет',
      description: 'Ведущий вуз России, один из старейших и крупнейших университетов страны',
      address: 'г. Москва, Ленинские Горы, 1',
      coordinates: '55.702868,37.530865',
      logoUrl: 'https://www.msu.ru/info/logo/logo.jpg',
      websiteUrl: 'https://www.msu.ru',
      contacts: 'Email: info@msu.ru, Телефон: +7(495)939-10-00',
      category: 'Университет'
    }
  })
  
  const spbgu = await prisma.school.create({
    data: {
      name: 'Санкт-Петербургский государственный университет',
      description: 'Один из старейших и крупнейших университетов России',
      address: 'г. Санкт-Петербург, Университетская наб., 7/9',
      coordinates: '59.941174,30.299589',
      logoUrl: 'https://spbu.ru/sites/default/files/logo.jpg',
      websiteUrl: 'https://spbu.ru',
      contacts: 'Email: rector@spbu.ru, Телефон: +7(812)328-20-00',
      category: 'Университет'
    }
  })
  
  console.log('Учебные заведения созданы')
  
  // Создаем образовательные программы для МГУ
  await prisma.educationalProgram.create({
    data: {
      name: 'Прикладная математика и информатика',
      code: '01.03.02',
      description: 'Подготовка специалистов в области прикладной математики и программирования',
            duration: '4 года',
      price: 370000,
      schoolId: mgu.id,
            examRequirements: {
              create: [
          { name: 'Математика', minScore: 75 },
          { name: 'Информатика', minScore: 70 },
          { name: 'Русский язык', minScore: 65 }
        ]
      }
    }
  })
  
  await prisma.educationalProgram.create({
    data: {
      name: 'Фундаментальная и прикладная химия',
      code: '04.05.01',
      description: 'Подготовка специалистов в области химии и химических технологий',
      duration: '5 лет',
      price: 350000,
      schoolId: mgu.id,
      examRequirements: {
        create: [
          { name: 'Химия', minScore: 80 },
          { name: 'Математика', minScore: 65 },
          { name: 'Русский язык', minScore: 65 }
        ]
      }
    }
  })
  
  // Создаем образовательные программы для СПбГУ
  await prisma.educationalProgram.create({
    data: {
      name: 'Юриспруденция',
      code: '40.03.01',
      description: 'Подготовка специалистов в области права',
            duration: '4 года',
      price: 320000,
      schoolId: spbgu.id,
            examRequirements: {
              create: [
          { name: 'Обществознание', minScore: 75 },
          { name: 'История', minScore: 70 },
          { name: 'Русский язык', minScore: 65 }
        ]
      }
    }
  })
  
  await prisma.educationalProgram.create({
    data: {
      name: 'Экономика',
      code: '38.03.01',
      description: 'Подготовка специалистов в области экономики и финансов',
            duration: '4 года',
      price: 300000,
      schoolId: spbgu.id,
            examRequirements: {
              create: [
          { name: 'Математика', minScore: 75 },
          { name: 'Обществознание', minScore: 70 },
          { name: 'Русский язык', minScore: 65 }
        ]
      }
    }
  })
  
  console.log('Образовательные программы созданы')
  
  // Добавляем фотографии для МГУ
  await prisma.schoolPhoto.createMany({
    data: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Moscow_05-2012_Lomonosov_University.jpg/1200px-Moscow_05-2012_Lomonosov_University.jpg',
        schoolId: mgu.id
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Moscow_State_University_crop.jpg/800px-Moscow_State_University_crop.jpg',
        schoolId: mgu.id
      }
    ]
  })
  
  // Добавляем фотографии для СПбГУ
  await prisma.schoolPhoto.createMany({
    data: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Saint_Petersburg_State_University.jpg',
        schoolId: spbgu.id
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/SPbGU_main_building.jpg/800px-SPbGU_main_building.jpg',
        schoolId: spbgu.id
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
      schoolId: mgu.id
    }
  })
  
  await prisma.review.create({
    data: {
      text: 'Преподаватели высокого уровня, но кампус нуждается в обновлении.',
      rating: 4,
      authorName: 'Мария Сидорова',
      userId: user.id,
      schoolId: spbgu.id
    }
  })
  
  console.log('Отзывы добавлены')
  
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