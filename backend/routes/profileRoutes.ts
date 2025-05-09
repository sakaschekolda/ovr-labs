import { Router } from 'express';
import { getProfile, updateProfile, getUserEvents } from '../controllers/profileController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Получение профиля
router.get('/', authenticateJWT, getProfile);

// Обновление профиля
router.put('/', authenticateJWT, updateProfile);

// Получение событий пользователя
router.get('/events', authenticateJWT, getUserEvents);

export default router; 