import 'dotenv/config';

export const config = {
  port: process.env.PORT || 3001,
  ownerEmail: process.env.OWNER_EMAIL || 'test@gmail.com',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: process.env.SMTP_SECURE === 'true',
  }
};