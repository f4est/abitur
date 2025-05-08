const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Очистка базы данных перед заполнением (опционально)
  console.log('Очистка существующих данных...');
  await prisma.testResult.deleteMany();
  await prisma.testQuestion.deleteMany();
  await prisma.savedSchool.deleteMany();
  await prisma.review.deleteMany();
  await prisma.examRequirement.deleteMany();
  await prisma.educationalProgram.deleteMany();
  await prisma.schoolPhoto.deleteMany();
  await prisma.school.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Создание пользователей...');
  
  // Создание администратора
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Администратор',
      role: 'ADMIN'
    }
  });
  
  // Создание обычного пользователя
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Пользователь',
      role: 'USER'
    }
  });
  
  console.log('Создание вопросов теста...');
  
  // Создание вопросов теста
  const questions = [
    {
      question: 'Какой вид деятельности вам больше нравится?',
      options: JSON.stringify([
        'Работа с людьми', 
        'Работа с техникой', 
        'Работа с информацией', 
        'Творческая деятельность'
      ]),
      category: 'Карьера',
      weights: JSON.stringify([
        { 1: 8, 2: 5, 3: 3, 4: 4, 5: 6 }, // Веса для "Работа с людьми"
        { 1: 9, 2: 2, 3: 7, 4: 3, 5: 4 }, // Веса для "Работа с техникой"
        { 1: 6, 2: 7, 3: 8, 4: 2, 5: 9 }, // Веса для "Работа с информацией"
        { 1: 4, 2: 8, 3: 3, 4: 9, 5: 5 }  // Веса для "Творческая деятельность"
      ])
    },
    {
      question: 'Что для вас важнее в будущей профессии?',
      options: JSON.stringify([
        'Высокая зарплата', 
        'Возможность помогать людям', 
        'Творческая реализация', 
        'Карьерный рост'
      ]),
      category: 'Карьера',
      weights: JSON.stringify([
        { 1: 6, 2: 3, 3: 4, 4: 5, 5: 9 }, // Веса для "Высокая зарплата"
        { 1: 3, 2: 9, 3: 6, 4: 7, 5: 4 }, // Веса для "Возможность помогать людям"
        { 1: 4, 2: 7, 3: 5, 4: 9, 5: 3 }, // Веса для "Творческая реализация"
        { 1: 7, 2: 5, 3: 4, 4: 6, 5: 8 }  // Веса для "Карьерный рост"
      ])
    },
    {
      question: 'Какие предметы вам больше нравятся?',
      options: JSON.stringify([
        'Математика и физика', 
        'Гуманитарные науки', 
        'Искусство и дизайн', 
        'Информатика и программирование'
      ]),
      category: 'Навыки',
      weights: JSON.stringify([
        { 1: 9, 2: 3, 3: 8, 4: 4, 5: 6 }, // Веса для "Математика и физика"
        { 1: 2, 2: 9, 3: 5, 4: 7, 5: 4 }, // Веса для "Гуманитарные науки"
        { 1: 3, 2: 6, 3: 4, 4: 9, 5: 3 }, // Веса для "Искусство и дизайн"
        { 1: 9, 2: 3, 3: 7, 4: 5, 5: 8 }  // Веса для "Информатика и программирование"
      ])
    },
  ];
  
  for (const q of questions) {
    await prisma.testQuestion.create({
      data: q
    });
  }
  
  console.log('Создание тестовых учебных заведений...');
  
  // Создание учебных заведений
  const school1 = await prisma.school.create({
    data: {
      name: 'Казахский Национальный Университет им. аль-Фараби',
      description: 'Один из ведущих университетов Казахстана с богатой историей и традициями.',
      address: 'г. Алматы, пр. аль-Фараби, 71',
      contacts: '+7 (727) 377-33-30',
      websiteUrl: 'https://www.kaznu.kz',
      programs: {
        create: [
          {
            name: 'Информационные системы',
            code: '5B070300',
            description: 'Подготовка специалистов в области разработки и внедрения информационных систем.',
            duration: '4 года',
            price: 1000000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 70 },
                { examName: 'Физика', minScore: 65 }
              ]
            }
          }
        ]
      }
    }
  });
  
  console.log('База данных успешно заполнена!');
  console.log('Администратор: admin@example.com / admin123');
  console.log('Пользователь: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 