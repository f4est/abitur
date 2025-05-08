const { spawn } = require('child_process');
const path = require('path');

// Функция для запуска команды
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`Запуск команды: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Команда завершилась с кодом ошибки: ${code}`));
      }
    });
  });
}

async function main() {
  try {
    // Сброс базы данных
    console.log('Сброс базы данных...');
    await runCommand('npx', ['prisma', 'migrate', 'reset', '--force']);
    
    // Применение миграций
    console.log('Применение миграций...');
    await runCommand('npx', ['prisma', 'migrate', 'dev', '--name', 'initial']);
    
    // Запуск скрипта seed.js
    console.log('Заполнение базы данных тестовыми данными...');
    await runCommand('node', [path.join(__dirname, 'seed.js')]);
    
    console.log('База данных успешно инициализирована!');
    console.log('Данные для входа:');
    console.log('Администратор: admin@example.com / admin123');
    console.log('Пользователь: user@example.com / user123');
  } catch (error) {
    console.error('Ошибка при инициализации базы данных:', error);
    process.exit(1);
  }
}

main(); 