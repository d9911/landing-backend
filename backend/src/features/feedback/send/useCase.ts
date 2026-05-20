import { createOwnerMailHtml, createUserMailHtml } from '../../../infrastructure/mail/templates';
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

  // Use authenticated SMTP user as FROM address to satisfy mail.ru restrictions
  const smtpUser = config.smtp.user || 'no-reply@d9911.pro';

  // 1. Письмо владельцу студии
  const ownerMailPayload = {
    from: `"Den Gu Studio API" <${smtpUser}>`,
    to: config.ownerEmail,
    subject: `🔥 Новая заявка на разработку от ${name}`,
    html: createOwnerMailHtml({ name, phone, email, comment })
  };

  // 2. Письмо-автоответчик клиенту
  const userMailPayload = {
    from: `"Den Gu Studio" <${smtpUser}>`,
    to: email,
    subject: '✨ Ваша заявка принята в работу — Den Gu Studio',
    html: createUserMailHtml({ name, comment })
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