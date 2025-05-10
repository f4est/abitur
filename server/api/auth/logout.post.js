export default defineEventHandler(async (event) => {
  try {
    // Удаляем куки токена, устанавливая срок действия в прошлое
    setCookie(event, 'token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Срок действия устанавливаем в 0, что приведет к удалению куки
      path: '/' // Важно указать тот же путь, который использовался при установке
    })

    // Возвращаем успешный статус
    return {
      message: 'Выход выполнен успешно'
    }
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error)
    return createError({
      statusCode: 500,
      message: 'Произошла ошибка при выходе из системы'
    })
  }
}) 