import { Request, Response } from 'express';
import { sendFeedbackUseCase } from './useCase';
import { FeedbackDTO } from './dto';

export const sendFeedbackController = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, comment } = req.body as FeedbackDTO;

    // Валидация (можно вынести в shared/middlewares, если её станет много)
    if (!name || !phone || !email || !comment) {
      return res.status(400).json({ error: 'Все поля обязательны.' });
    }

    const emailValidator = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValidator.test(email)) {
      return res.status(400).json({ error: 'Некорректный формат email.' });
    }

    // Вызов бизнес-логики
    const result = await sendFeedbackUseCase({ name, phone, email, comment });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Критическая ошибка контроллера:', error);

    if (error.code === 'EAUTH' || error.response?.includes('535')) {
      return res.status(500).json({ error: 'Ошибка аутентификации SMTP. Проверьте .env' });
    }

    return res.status(500).json({ error: 'Внутренняя ошибка сервера при обработке заявки.' });
  }
};