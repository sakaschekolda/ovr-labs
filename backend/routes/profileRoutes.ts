import express from 'express';
import { getProfile, getUserEvents } from '../controllers/profileController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

// Все роуты профиля требуют аутентификации
router.use(authenticateJWT);

// Получить профиль пользователя
router.get('/', getProfile);

// Получить мероприятия пользователя
router.get('/events', getUserEvents);

// Get user events
router.get('/events', getUserEvents);

export default router; 