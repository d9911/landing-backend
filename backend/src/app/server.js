import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

let transporter
const initializeTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '2525'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    console.log('✅ Используется реальный SMTP-транспорт из .env')

    try {
      await transporter.verify()
      console.log('✅ SMTP транспорт успешно проверен')
    } catch (verifyError) {
      console.error('❌ Ошибка проверки SMTP транспорта:', verifyError)
    }
  } else {
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('✅ Используется тестовый SMTP-транспорт (Ethereal)')
    console.log(`📧 Просмотр_отправленных писем: https://ethereal.email/message`)
  }
}

initializeTransporter().catch(console.error)

app.post('/api/feedback', async (req, res) => {
  const { name, phone, email, comment } = req.body

  if (!name || !phone || !email || !comment) {
    return res.status(400).json({ error: 'Серверная ошибка: Все поля (имя, телефон, email, комментарий) обязательны.' })
  }

  const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailValidator.test(email)) {
    return res.status(400).json({ error: 'Серверная ошибка: Передан некорректный формат email.' })
  }

  if (!transporter) {
    return res.status(500).json({ error: 'Серверная ошибка: SMTP-транспорт еще не инициализирован.' })
  }

  try {
    const ownerMailPayload = {
      from: '"Portfolio API" <admin@d9911.com>',
      to: process.env.OWNER_EMAIL || 'test@d9911.org',
      subject: '🔥 Новая заявка на разработку от ' + name,
      text: `Заявка:\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nКомментарий: ${comment}`,
      html: `<h2>Новый лид в воронке портфолио</h2>
                  <p><b>Имя соискателя/заказчика:</b> ${name}</p>
                  <p><b>Телефон для связи:</b> ${phone}</p>
                  <p><b>Email:</b> ${email}</p>
                  <p><b>Техническое задание/Комментарий:</b></p>
                  <p style="background:#f5f2eb; padding:12px; border-left:4px solid #ff7a17;">${comment}</p>`,
    }

    const userMailPayload = {
      from: '"Den Gu Studio" <admin@d9911.com>',
      to: email,
      subject: 'Подтверждение получения обращения · Den Gu',
      text: `Здравствуйте, ${name}. Ваше обращение принято. Копия вашего комментария: ${comment}`,
      html: `<div style="font-family:sans-serif; max-width:600px; color:#111111;">
                      <h3 style="color:#ff7a17;">Здравствуйте, ${name}!</h3>
                      <p>Ваше сообщение успешно доставлено на сервер разработчика. Наш бэкенд зафиксировал обращение.</p>
                      <p><b>Копия вашего комментария:</b></p>
                      <blockquote style="background:#f9f9f9; padding:12px; margin:0;">${comment}</blockquote>
                      <p>В ближайшее время я свяжусь с вами по номеру телефона: <b>${phone}</b>.</p>
                  </div>`,
    }
    try {
      console.log('🔄 Отправка основного письма...')
      const ownerResult = await transporter.sendMail(ownerMailPayload)
      console.log('✅ Письмо владельцу отправлено:', ownerResult.messageId)

      await new Promise((resolve) => setTimeout(resolve, 2000))

      let userWarning = null
      try {
        const userResult = await transporter.sendMail(userMailPayload)
        console.log('✅ Копия пользователю отправлена:', userResult.messageId)
      } catch (err) {
        console.warn('⚠️ Сбой отправки копии (лимиты Mailtrap):', err.message)

        userWarning = 'Основная заявка доставлена владельцу, но автоответ заблокирован лимитами тестового почтового сервера.'
      }

      return res.status(200).json({
        success: true,
        message: 'Ваше сообщение успешно зарегистрировано на сервере!',
        warning: userWarning,
      })
    } catch (error) {
      console.error('❌ Критический сбой SMTP Транспорта на сервере:', error)
      if (error.code === 'EAUTH' || error.response?.includes('535')) {
        return res.status(500).json({ error: 'Ошибка аутентификации SMTP. Проверьте учетные данные в .env' })
      }
      return res.status(500).json({ error: 'Критическая ошибка бэкенда при попытке отправки писем.' })
    }
  } catch (error) {
    console.error('❌ Критический сбой SMTP Транспорта на сервере:', error)

    if (error.code === 'EAUTH' || error.response?.includes('535')) {
      return res.status(500).json({ error: 'Ошибка аутентификации SMTP. Проверьте учетные данные в .env' })
    }
    return res.status(500).json({ error: 'Критическая ошибка бэкенда при попытке отправки транзакционных писем.' })
  }
})

app.listen(port, () => {
  console.log(`🚀 API сервер успешно развернут на порту ${port}`)
})
