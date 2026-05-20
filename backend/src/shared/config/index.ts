import 'dotenv/config';

const getSmtpConfig = () => {
  const method = process.env.SMTP_METHOD || 'primary';
  if (method === 'secondary') {
    return {
      host: process.env.SMTP_HOST_2 || '',
      port: parseInt(process.env.SMTP_PORT_2 || '0', 10),
      user: process.env.SMTP_USER_2 || '',
      pass: process.env.SMTP_PASS_2 || '',
      secure: process.env.SMTP_SECURE_2 === 'true',
    };
  }
  // primary (default)
  return {
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    secure: process.env.SMTP_SECURE === 'true',
  };
};

export const config = {
  port: process.env.PORT || 3001,
  ownerEmail: process.env.OWNER_EMAIL || 'test@gmail.com',
  smtp: getSmtpConfig(),
};