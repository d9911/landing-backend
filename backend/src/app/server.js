import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import nodemailer from 'nodemailer'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Инициализация безопасного SMTP-транспорта
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  secure: process.env.SMTP_SECURE === 'true', // true для 465, false для остальных портов
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Роут обработки формы обратной связи по спецификации ТЗ
app.post('/api/feedback', async (req, res) => {
  const { name, phone, email, comment } = req.body

  // 1. Строгая валидация входящего контракта данных на стороне сервера
  if (!name || !phone || !email || !comment) {
    return res.status(400).json({ error: 'Серверная ошибка: Все поля (имя, телефон, email, комментарий) обязательны.' })
  }

  const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailValidator.test(email)) {
    return res.status(400).json({ error: 'Серверная ошибка: Передан некорректный формат email.' })
  }

  try {
    // 2. Транзакция №1: Уведомление для владельца сайта
    const ownerMailPayload = {
      from: '"Portfolio API" <no-reply@d9911.pro>',
      to: process.env.OWNER_EMAIL || 'd.99113@gmail.com',
      subject: '🔥 Новая заявка на разработку от ' + name,
      text: `Заявка:\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nКомментарий: ${comment}`,
      html: `<h2>Новый лид в воронке портфолио</h2>
                  <p><b>Имя соискателя/заказчика:</b> ${name}</p>
                  <p><b>Телефон для связи:</b> ${phone}</p>
                  <p><b>Email:</b> ${email}</p>
                  <p><b>Техническое задание/Комментарий:</b></p>
                  <p style="background:#f5f2eb; padding:12px; border-left:4px solid #ff7a17;">${comment}</p>`,
    }

    // 3. Транзакция №2: Копия письма пользователю (Auto-reply confirmation)
    const userMailPayload = {
      from: '"Den Gu Studio" <no-reply@d9911.pro>',
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

    // Высокопроизводительное параллельное выполнение независимых асинхронных операций
    await Promise.all([transporter.sendMail(ownerMailPayload), transporter.sendMail(userMailPayload)])

    return res.status(200).json({ success: true, message: 'Обе транзакции успешно выполнены по протоколу SMTP.' })
  } catch (error) {
    console.error('Критический сбой SMTP Транспорта на сервере:', error)
    return res.status(500).json({ error: 'Критическая ошибка бэкенда при попытке отправки транзакционных писем.' })
  }
})

app.listen(port, () => {
  console.log(`🚀 API сервер успешно развернут на порту ${port}`)
})
