import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestQuestions() {
  console.log('Добавляем тестовые вопросы...');

  // Удаляем существующие вопросы
  await prisma.testQuestion.deleteMany({});

  // Добавляем новые вопросы
  await prisma.testQuestion.createMany({
    data: [
      {
        question: 'Как дела',
        category: 'general',
        options: JSON.stringify([
          { text: 'Отлично', value: 5 },
          { text: 'Хорошо', value: 4 }
        ]),
        weights: JSON.stringify({
          technical: 1,
          creative: 0,
          social: 0
        })
      },
      {
        question: 'Что вы предпочитаете делать в свободное время?',
        category: 'interests',
        options: JSON.stringify([
          { text: 'Читать книги или статьи', value: 3 },
          { text: 'Программировать или создавать что-то на компьютере', value: 4 },
          { text: 'Заниматься рисованием или другим видом искусства', value: 5 },
          { text: 'Общаться с друзьями или знакомыми', value: 2 }
        ]),
        weights: JSON.stringify({
          technical: 2,
          creative: 3,
          social: 1
        })
      },
      {
        question: 'Какие предметы в школе вам нравились больше всего?',
        category: 'academic',
        options: JSON.stringify([
          { text: 'Математика, физика или информатика', value: 4 },
          { text: 'Литература, история или языки', value: 3 },
          { text: 'Рисование, музыка или другие творческие предметы', value: 5 },
          { text: 'Биология, химия или другие естественные науки', value: 2 }
        ]),
        weights: JSON.stringify({
          technical: 3,
          creative: 2,
          science: 4
        })
      }
    ]
  });

  console.log('Тестовые вопросы добавлены.');
}

async function main() {
  try {
    console.log('Запускаем первый скрипт seed...');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
    
    console.log('Запускаем второй скрипт seed...');
    execSync('node prisma/seed-part2.js', { stdio: 'inherit' });
    
    // Добавляем тестовые вопросы
    await addTestQuestions();
    
    console.log('Все скрипты успешно выполнены.');
  } catch (error) {
    console.error('Ошибка при выполнении скриптов:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 