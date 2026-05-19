import { app } from './app';
import { config } from '../shared/config';
import { verifyMailConnection } from '../infrastructure/mail/transporter';

const startServer = async () => {
  // Проверяем сервисы перед запуском
  await verifyMailConnection();

  app.listen(config.port, () => {
    console.log(`🚀 Clean Architecture API Server is running on port ${config.port}`);
  });
};

startServer().catch(console.error);