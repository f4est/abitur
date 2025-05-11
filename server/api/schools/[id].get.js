import { prisma } from "~/server/db/prisma";
import path from 'path';
import fs from 'fs';

// Получаем ID школы из параметров URL
export default defineEventHandler(async (event) => {
  try {
    const id = parseInt(event.context.params.id);
    
    if (!id || isNaN(id)) {
      return createError({
        statusCode: 400,
        message: 'Некорректный ID школы'
      });
    }
    
    // Получаем детали школы из базы данных
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        photos: true,
        programs: true
      }
    });
    
    if (!school) {
      return createError({
        statusCode: 404,
        message: 'Школа не найдена'
      });
    }
    
    // Обрабатываем examRequirements в программах, конвертируя JSON-строки в объекты
    if (school.programs && school.programs.length > 0) {
      school.programs = school.programs.map(program => {
        if (program.examRequirements) {
          try {
            program.examRequirements = typeof program.examRequirements === 'string'
              ? JSON.parse(program.examRequirements)
              : program.examRequirements;
          } catch (e) {
            console.error(`Ошибка при разборе examRequirements для программы ${program.id}:`, e);
            program.examRequirements = [];
          }
        } else {
          program.examRequirements = [];
        }
        return program;
      });
    }
    
    // Проверяем URL логотипа
    let logoUrl = school.logoUrl;
    
    // Если URL не начинается с / или http, считаем его относительным и добавляем /
    if (logoUrl && !logoUrl.startsWith('/') && !logoUrl.startsWith('http')) {
      logoUrl = `/${logoUrl}`;
    }
    
    // Если URL начинается с /, убедимся что файл существует на сервере
    if (logoUrl && logoUrl.startsWith('/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', logoUrl);
        // Если файл не существует, сбрасываем URL
        if (!fs.existsSync(filePath)) {
          console.warn(`Логотип не найден на сервере: ${filePath}`);
          logoUrl = null;
        }
      } catch (error) {
        console.error(`Ошибка при проверке логотипа: ${error.message}`);
        // При ошибке проверки не меняем URL
      }
    }
    
    // Проверяем URL фотографий
    const normalizedPhotos = school.photos.map(photo => {
      let photoUrl = photo.url;
      
      // Если URL не начинается с / или http, считаем его относительным и добавляем /
      if (photoUrl && !photoUrl.startsWith('/') && !photoUrl.startsWith('http')) {
        photoUrl = `/${photoUrl}`;
      }
      
      // Если URL начинается с /, убедимся что файл существует на сервере
      if (photoUrl && photoUrl.startsWith('/')) {
        try {
          const filePath = path.join(process.cwd(), 'public', photoUrl);
          // Если файл не существует, сбрасываем URL
          if (!fs.existsSync(filePath)) {
            console.warn(`Фото не найдено на сервере: ${filePath}`);
            photoUrl = null;
          }
        } catch (error) {
          console.error(`Ошибка при проверке фото: ${error.message}`);
          // При ошибке проверки не меняем URL
        }
      }
      
      return {
        ...photo,
        url: photoUrl
      };
    });
    
    // Возвращаем школу с нормализованными URL
    const normalizedSchool = {
      ...school,
      logoUrl,
      photos: normalizedPhotos
    };
    
    // Добавляем поле coordinates на основе latitude и longitude
    if (normalizedSchool.latitude !== null && normalizedSchool.longitude !== null) {
      normalizedSchool.coordinates = `${normalizedSchool.latitude},${normalizedSchool.longitude}`;
      console.log(`API schools/[id].get: Создано поле coordinates: ${normalizedSchool.coordinates}`);
    }
    
    return {
      body: normalizedSchool
    };
  } catch (error) {
    console.error('Ошибка при получении школы:', error);
    return createError({
      statusCode: 500,
      message: 'Ошибка при получении данных учебного заведения'
    });
  }
}); 