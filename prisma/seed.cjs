const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаю заполнение базы данных...');

  // Создаем администратора
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Администратор',
      role: 'ADMIN'
    }
  });
  console.log('Создан администратор:', admin.email);

  // Создаем тестового пользователя
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Тестовый пользователь',
      role: 'USER'
    }
  });
  console.log('Создан пользователь:', user.email);

  // Создаем тестовые учебные заведения
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
  });
  console.log('Создано учебное заведение:', school1.name);

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
  });
  console.log('Создано учебное заведение:', school2.name);

  // Создаем тестовые программы обучения
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
  });
  console.log('Создана образовательная программа:', program1.name);

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
  });
  console.log('Создана образовательная программа:', program2.name);

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
  });
  console.log('Создан вопрос теста:', question1.question);

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
  });
  console.log('Создан вопрос теста:', question2.question);

  console.log('База данных успешно заполнена!');
}

main()
  .catch((e) => {
    console.error('Ошибка заполнения базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 