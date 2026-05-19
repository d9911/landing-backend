import { Router } from 'express';
import { sendFeedbackController } from '../features/feedback/send/controller';

export const appRouter = Router();

appRouter.post('/feedback', sendFeedbackController);