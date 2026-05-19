import { transporter } from '../../../infrastructure/mail/transporter';
import { config } from '../../../shared/config';
import { FeedbackDTO } from './dto';

interface SendFeedbackResult {
  success: boolean;
  message: string;
  warning?: string;
}

export const sendFeedbackUseCase = async (data: FeedbackDTO): Promise<SendFeedbackResult> => {
  const { name, phone, email, comment } = data;

  const ownerMailPayload = {
    from: '"Portfolio API" <no-reply@d9911.pro>',
    to: config.ownerEmail,
    subject: `🔥 Новая заявка на разработку от ${name}`,
    html: `<h2>Новый лид</h2>
           <p><b>Имя:</b> ${name}</p>
           <p><b>Телефон:</b> ${phone}</p>
           <p><b>Email:</b> ${email}</p>
           <p><b>Комментарий:</b></p>
           <p style="background:#f5f2eb; padding:12px; border-left:4px solid #ff7a17;">${comment}</p>`,
  };

  const userMailPayload = {
    from: '"Den Gu Studio" <no-reply@d9911.pro>',
    to: email,
    subject: 'Подтверждение получения обращения',
    html: `<h3>Здравствуйте, ${name}!</h3>
           <p>Ваше сообщение успешно доставлено.</p>
           <blockquote style="background:#f9f9f9; padding:12px;">${comment}</blockquote>`,
  };

  // 1. Критическая транзакция (владельцу)
  console.log('🔄 Отправка основного письма...');
  await transporter.sendMail(ownerMailPayload);

  // ⏳ Задержка для обхода лимитов
  await new Promise((resolve) => setTimeout(resolve, 2000));

  let warningMessage: string | undefined;

  // 2. Некритическая транзакция (копия пользователю)
  try {
    await transporter.sendMail(userMailPayload);
  } catch (error) {
    console.warn('⚠️ Сбой отправки копии (лимиты Mailtrap):', error);
    warningMessage = 'Основная заявка доставлена, но автоответ заблокирован лимитами почтового сервера.';
  }

  return {
    success: true,
    message: 'Ваше сообщение успешно зарегистрировано!',
    warning: warningMessage
  };
};