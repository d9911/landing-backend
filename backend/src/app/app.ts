import express from 'express';
import cors from 'cors';
import { appRouter } from '../routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Подключаем все роуты с префиксом /api
app.use('/api', appRouter);