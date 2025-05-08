const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Начало заполнения базы данных (часть 2)...');

  // 6. Казахский национальный медицинский университет им. С.Д. Асфендиярова
  const kaznmu = await prisma.school.create({
    data: {
      name: 'Казахский национальный медицинский университет им. С.Д. Асфендиярова',
      description: 'КазНМУ — старейший и крупнейший медицинский университет Казахстана, основанный в 1930 году. Университет готовит высококвалифицированных специалистов в области медицины, стоматологии, фармации и общественного здравоохранения. КазНМУ сотрудничает с ведущими медицинскими школами мира и имеет современные клинические базы.',
      address: 'г. Алматы, ул. Толе би, 94',
      coordinates: '43.256389,76.926667',
      logoUrl: '/images/placeholders/kaznmu-logo.svg',
      websiteUrl: 'https://kaznmu.kz/',
      contacts: 'Телефон: +7 (727) 338-70-90, Email: info@kaznmu.kz',
      photos: {
        create: [
          { url: '/images/placeholders/kaznmu-photo1.svg' },
          { url: '/images/placeholders/kaznmu-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Общая медицина',
            code: '6B10101',
            description: 'Программа подготовки врачей общей практики',
            duration: '5 лет',
            price: 1800000,
            examRequirements: {
              create: [
                { examName: 'Биология', minScore: 80 },
                { examName: 'Химия', minScore: 75 }
              ]
            }
          },
          {
            name: 'Стоматология',
            code: '6B10102',
            description: 'Программа подготовки стоматологов',
            duration: '5 лет',
            price: 2000000,
            examRequirements: {
              create: [
                { examName: 'Биология', minScore: 85 },
                { examName: 'Химия', minScore: 80 }
              ]
            }
          }
        ]
      }
    }
  });

  // 7. Казахская национальная академия искусств им. Т.К. Жургенова
  const kaznai = await prisma.school.create({
    data: {
      name: 'Казахская национальная академия искусств им. Т.К. Жургенова',
      description: 'КазНАИ — ведущее учебное заведение Казахстана в области искусства и культуры, основанное в 1978 году. Академия готовит профессионалов в области театра, кино, хореографии, живописи, скульптуры, дизайна и музыки. КазНАИ является культурным центром, где регулярно проводятся выставки, спектакли и концерты.',
      address: 'г. Алматы, ул. Панфилова, 127',
      coordinates: '43.261111,76.947222',
      logoUrl: '/images/placeholders/kaznai-logo.svg',
      websiteUrl: 'https://kaznai.kz/',
      contacts: 'Телефон: +7 (727) 261-46-22, Email: info@kaznai.kz',
      photos: {
        create: [
          { url: '/images/placeholders/kaznai-photo1.svg' },
          { url: '/images/placeholders/kaznai-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Актерское искусство',
            code: '6B02102',
            description: 'Программа подготовки актеров театра и кино',
            duration: '4 года',
            price: 850000,
            examRequirements: {
              create: [
                { examName: 'Творческий экзамен', minScore: 85 },
                { examName: 'Литература', minScore: 70 }
              ]
            }
          },
          {
            name: 'Графический дизайн',
            code: '6B02107',
            description: 'Программа подготовки специалистов в области графического дизайна',
            duration: '4 года',
            price: 900000,
            examRequirements: {
              create: [
                { examName: 'Творческий экзамен', minScore: 80 },
                { examName: 'История искусств', minScore: 65 }
              ]
            }
          }
        ]
      }
    }
  });

  // 8. Казахский национальный аграрный университет
  const kaznau = await prisma.school.create({
    data: {
      name: 'Казахский национальный аграрный университет',
      description: 'КазНАУ — ведущий аграрный университет Казахстана, основанный в 1929 году. Университет специализируется на подготовке специалистов для агропромышленного комплекса, ветеринарии, лесного хозяйства и пищевой промышленности. КазНАУ обладает современной научно-исследовательской базой и экспериментальными хозяйствами.',
      address: 'г. Алматы, пр. Абая, 8',
      coordinates: '43.242778,76.905833',
      logoUrl: '/images/placeholders/kaznau-logo.svg',
      websiteUrl: 'https://kaznau.kz/',
      contacts: 'Телефон: +7 (727) 262-11-08, Email: info@kaznau.kz',
      photos: {
        create: [
          { url: '/images/placeholders/kaznau-photo1.svg' },
          { url: '/images/placeholders/kaznau-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Агрономия',
            code: '6B08102',
            description: 'Программа подготовки специалистов в области растениеводства',
            duration: '4 года',
            price: 750000,
            examRequirements: {
              create: [
                { examName: 'Биология', minScore: 60 },
                { examName: 'Химия', minScore: 55 }
              ]
            }
          },
          {
            name: 'Ветеринарная медицина',
            code: '6B09101',
            description: 'Программа подготовки ветеринарных врачей',
            duration: '5 лет',
            price: 850000,
            examRequirements: {
              create: [
                { examName: 'Биология', minScore: 65 },
                { examName: 'Химия', minScore: 60 }
              ]
            }
          }
        ]
      }
    }
  });

  // 9. Международный университет информационных технологий
  const iitu = await prisma.school.create({
    data: {
      name: 'Международный университет информационных технологий',
      description: 'МУИТ — ведущий университет в области информационных технологий, основанный в 2009 году. Университет специализируется на подготовке IT-специалистов, аналитиков данных, специалистов по кибербезопасности и разработчиков программного обеспечения. МУИТ сотрудничает с крупными IT-компаниями и имеет современные лаборатории.',
      address: 'г. Алматы, ул. Манаса, 34/1',
      coordinates: '43.233611,76.911111',
      logoUrl: '/images/placeholders/iitu-logo.svg',
      websiteUrl: 'https://iitu.edu.kz/',
      contacts: 'Телефон: +7 (727) 330-85-00, Email: info@iitu.kz',
      photos: {
        create: [
          { url: '/images/placeholders/iitu-photo1.svg' },
          { url: '/images/placeholders/iitu-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Информационные системы',
            code: '6B06103',
            description: 'Программа подготовки специалистов по информационным системам',
            duration: '4 года',
            price: 1500000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 75 },
                { examName: 'Физика', minScore: 70 }
              ]
            }
          },
          {
            name: 'Кибербезопасность',
            code: '6B06106',
            description: 'Программа подготовки специалистов по информационной безопасности',
            duration: '4 года',
            price: 1600000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 80 },
                { examName: 'Информатика', minScore: 75 }
              ]
            }
          }
        ]
      }
    }
  });

  // 10. Алматинский технологический университет
  const atu = await prisma.school.create({
    data: {
      name: 'Алматинский технологический университет',
      description: 'АТУ — ведущий университет в области пищевой, легкой промышленности и дизайна, основанный в 1957 году. Университет специализируется на подготовке специалистов для пищевой и перерабатывающей промышленности, индустрии моды, экономики и IT-технологий. АТУ имеет современные лаборатории и сотрудничает с ведущими предприятиями отрасли.',
      address: 'г. Алматы, ул. Толе би, 100',
      coordinates: '43.255,76.936111',
      logoUrl: '/images/placeholders/atu-logo.svg',
      websiteUrl: 'https://atu.edu.kz/',
      contacts: 'Телефон: +7 (727) 293-52-92, Email: info@atu.kz',
      photos: {
        create: [
          { url: '/images/placeholders/atu-photo1.svg' },
          { url: '/images/placeholders/atu-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Технология пищевых продуктов',
            code: '6B07201',
            description: 'Программа подготовки специалистов пищевой промышленности',
            duration: '4 года',
            price: 850000,
            examRequirements: {
              create: [
                { examName: 'Биология', minScore: 60 },
                { examName: 'Химия', minScore: 55 }
              ]
            }
          },
          {
            name: 'Дизайн одежды',
            code: '6B02108',
            description: 'Программа подготовки дизайнеров одежды и текстиля',
            duration: '4 года',
            price: 900000,
            examRequirements: {
              create: [
                { examName: 'Творческий экзамен', minScore: 75 },
                { examName: 'История искусств', minScore: 65 }
              ]
            }
          }
        ]
      }
    }
  });

  // 11. Казахская головная архитектурно-строительная академия
  const kazgasa = await prisma.school.create({
    data: {
      name: 'Казахская головная архитектурно-строительная академия',
      description: 'КазГАСА — ведущий архитектурно-строительный вуз Казахстана, основанный в 1980 году. Академия специализируется на подготовке архитекторов, дизайнеров, строителей и специалистов в области градостроительства. КазГАСА имеет мощную научно-исследовательскую базу и сотрудничает с ведущими архитектурными бюро.',
      address: 'г. Алматы, ул. Рыскулбекова, 28',
      coordinates: '43.229444,76.876389',
      logoUrl: '/images/placeholders/kazgasa-logo.svg',
      websiteUrl: 'https://kazgasa.kz/',
      contacts: 'Телефон: +7 (727) 309-61-00, Email: info@kazgasa.kz',
      photos: {
        create: [
          { url: '/images/placeholders/kazgasa-photo1.svg' },
          { url: '/images/placeholders/kazgasa-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Архитектура',
            code: '6B07301',
            description: 'Программа подготовки архитекторов',
            duration: '5 лет',
            price: 1200000,
            examRequirements: {
              create: [
                { examName: 'Творческий экзамен', minScore: 80 },
                { examName: 'Математика', minScore: 70 }
              ]
            }
          },
          {
            name: 'Строительство',
            code: '6B07302',
            description: 'Программа подготовки инженеров-строителей',
            duration: '4 года',
            price: 950000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 65 },
                { examName: 'Физика', minScore: 60 }
              ]
            }
          }
        ]
      }
    }
  });

  // 12. Алматинская академия экономики и статистики
  const aesa = await prisma.school.create({
    data: {
      name: 'Алматинская академия экономики и статистики',
      description: 'ААЭС — специализированный экономический вуз, основанный в 1992 году. Академия готовит специалистов в области экономики, финансов, учета, аудита, статистики и информационных систем. ААЭС сотрудничает с ведущими предприятиями и финансовыми институтами Казахстана.',
      address: 'г. Алматы, ул. Жандосова, 59',
      coordinates: '43.219722,76.896667',
      logoUrl: '/images/placeholders/aesa-logo.svg',
      websiteUrl: 'https://aesa.kz/',
      contacts: 'Телефон: +7 (727) 309-58-15, Email: info@aesa.kz',
      photos: {
        create: [
          { url: '/images/placeholders/aesa-photo1.svg' },
          { url: '/images/placeholders/aesa-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Экономика',
            code: '6B04105',
            description: 'Программа подготовки экономистов',
            duration: '4 года',
            price: 750000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 60 },
                { examName: 'География', minScore: 55 }
              ]
            }
          },
          {
            name: 'Учет и аудит',
            code: '6B04106',
            description: 'Программа подготовки бухгалтеров и аудиторов',
            duration: '4 года',
            price: 800000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 65 },
                { examName: 'География', minScore: 60 }
              ]
            }
          }
        ]
      }
    }
  });

  // 13. Университет "Туран"
  const turan = await prisma.school.create({
    data: {
      name: 'Университет "Туран"',
      description: 'Университет "Туран" — частный многопрофильный университет, основанный в 1992 году. Университет предлагает образовательные программы в области экономики, права, психологии, журналистики и информационных технологий. "Туран" активно развивает международное сотрудничество и предоставляет возможности для зарубежных стажировок.',
      address: 'г. Алматы, ул. Сатпаева, 16-18',
      coordinates: '43.238056,76.953056',
      logoUrl: '/images/placeholders/turan-logo.svg',
      websiteUrl: 'https://turan-edu.kz/',
      contacts: 'Телефон: +7 (727) 260-40-00, Email: info@turan-edu.kz',
      photos: {
        create: [
          { url: '/images/placeholders/turan-photo1.svg' },
          { url: '/images/placeholders/turan-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Психология',
            code: '6B03103',
            description: 'Программа подготовки психологов',
            duration: '4 года',
            price: 900000,
            examRequirements: {
              create: [
                { examName: 'Биология', minScore: 70 },
                { examName: 'География', minScore: 65 }
              ]
            }
          },
          {
            name: 'Журналистика',
            code: '6B03201',
            description: 'Программа подготовки журналистов',
            duration: '4 года',
            price: 850000,
            examRequirements: {
              create: [
                { examName: 'Литература', minScore: 75 },
                { examName: 'История', minScore: 70 }
              ]
            }
          }
        ]
      }
    }
  });

  // 14. Казахская академия спорта и туризма
  const kazast = await prisma.school.create({
    data: {
      name: 'Казахская академия спорта и туризма',
      description: 'КазАСТ — ведущий спортивный вуз Казахстана, основанный в 1944 году. Академия готовит специалистов в области физической культуры, спорта, туризма и рекреации. Выпускники КазАСТ успешно представляют Казахстан на международных соревнованиях, включая Олимпийские игры.',
      address: 'г. Алматы, пр. Абая, 85',
      coordinates: '43.24,76.901389',
      logoUrl: '/images/placeholders/kazast-logo.svg',
      websiteUrl: 'https://kazast.edu.kz/',
      contacts: 'Телефон: +7 (727) 292-30-07, Email: info@kazast.kz',
      photos: {
        create: [
          { url: '/images/placeholders/kazast-photo1.svg' },
          { url: '/images/placeholders/kazast-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Физическая культура и спорт',
            code: '6B01403',
            description: 'Программа подготовки тренеров и преподавателей физкультуры',
            duration: '4 года',
            price: 700000,
            examRequirements: {
              create: [
                { examName: 'Творческий экзамен', minScore: 75 },
                { examName: 'Биология', minScore: 60 }
              ]
            }
          },
          {
            name: 'Туризм',
            code: '6B11101',
            description: 'Программа подготовки специалистов туристской индустрии',
            duration: '4 года',
            price: 750000,
            examRequirements: {
              create: [
                { examName: 'География', minScore: 65 },
                { examName: 'Иностранный язык', minScore: 60 }
              ]
            }
          }
        ]
      }
    }
  });

  // 15. Нархоз Университет
  const narxoz = await prisma.school.create({
    data: {
      name: 'Нархоз Университет',
      description: 'Нархоз — ведущий экономический университет Казахстана, основанный в 1963 году. Университет специализируется на подготовке специалистов в области экономики, финансов, бизнеса, цифровых технологий и права. Нархоз имеет международные аккредитации и сотрудничает с ведущими бизнес-школами мира.',
      address: 'г. Алматы, ул. Жандосова, 55',
      coordinates: '43.219167,76.895',
      logoUrl: '/images/placeholders/narxoz-logo.svg',
      websiteUrl: 'https://narxoz.kz/',
      contacts: 'Телефон: +7 (727) 346-64-64, Email: info@narxoz.kz',
      photos: {
        create: [
          { url: '/images/placeholders/narxoz-photo1.svg' },
          { url: '/images/placeholders/narxoz-photo2.svg' }
        ]
      },
      programs: {
        create: [
          {
            name: 'Финансы',
            code: '6B04104',
            description: 'Программа подготовки финансистов и банкиров',
            duration: '4 года',
            price: 1300000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 70 },
                { examName: 'География', minScore: 65 }
              ]
            }
          },
          {
            name: 'Государственное и местное управление',
            code: '6B04107',
            description: 'Программа подготовки государственных служащих',
            duration: '4 года',
            price: 1200000,
            examRequirements: {
              create: [
                { examName: 'Математика', minScore: 65 },
                { examName: 'История', minScore: 70 }
              ]
            }
          }
        ]
      }
    }
  });

  console.log('Оставшиеся 10 учебных заведений добавлены...');

  return { kaznmu, kaznai, kaznau, iitu, atu, kazgasa, aesa, turan, kazast, narxoz };
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Заполнение базы данных (часть 2) завершено.');
    await prisma.$disconnect();
  }); 