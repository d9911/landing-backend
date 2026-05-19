import nodemailer from 'nodemailer';
import { config } from '../../shared/config';

export const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ SMTP транспорт успешно проверен');
  } catch (error) {
    console.error('❌ Ошибка проверки SMTP транспорта:', error);
  }
};