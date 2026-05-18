import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Настройка SMTP транспорта (Данные берутся из .env)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

app.post('/api/feedback', async (req, res) => {
    const { name, phone, email, comment } = req.body;

    // 1. Серверная валидация входных данных
    if (!name || !phone || !email || !comment) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения на сервере.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Невалидный формат Email на сервере.' });
    }

    try {
        // 2. Транзакция 1: Письмо владельцу сайта
        const ownerMailOptions = {
            from: '"Developer Portfolio" <portfolio@example.com>',
            to: process.env.OWNER_EMAIL || 'owner@example.com',
            subject: '🔥 Новая заявка с Лендинга разработчика',
            text: `Новый лид:\nИмя: ${name}\nТелефон: ${phone}\nEmail: ${email}\nКомментарий: ${comment}`,
            html: `<h3>Новая заявка с сайта</h3>
                   <p><b>Имя:</b> ${name}</p>
                   <p><b>Телефон:</b> ${phone}</p>
                   <p><b>Email:</b> ${email}</p>
                   <p><b>Комментарий:</b> ${comment}</p>`
        };

        // 3. Транзакция 2: Авто-копия пользователю (Auto-reply confirmation)
        const userMailOptions = {
            from: '"Developer Studio" <no-reply@example.com>',
            to: email,
            subject: 'Ваша заявка успешно принята',
            text: `Здравствуйте, ${name}!\nМы получили ваш комментарий: "${comment}". Скоро свяжемся с вами.`,
            html: `<h3>Здравствуйте, ${name}!</h3>
                   <p>Это подтверждение того, что мы получили ваше сообщение.</p>
                   <blockquote>"${comment}"</blockquote>
                   <p>Мы свяжемся с вами по телефону ${phone} в ближайшее время.</p>`
        };

        // Выполняем обе отправки параллельно
        await Promise.all([
            transporter.sendMail(ownerMailOptions),
            transporter.sendMail(userMailOptions)
        ]);

        return res.status(200).json({ success: true, message: 'Письма успешно отправлены.' });

    } catch (error) {
        console.error('Ошибка SMTP Транспорта:', error);
        return res.status(500).json({ error: 'Ошибка сервера при отправке почты via SMTP.' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Сервер тестового задания запущен на порту ${port}`);
});