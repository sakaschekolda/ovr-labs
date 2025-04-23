import express, { Router, Request, Response } from 'express';
import { Router as ExpressRouter } from 'express'; // Импортируем тип

import userRoutes from '@routes/users.routes';
import eventRoutes from '@routes/events.routes';

const router: Router = express.Router();

router.use('/users', userRoutes);
router.use('/events', eventRoutes);

interface RootResponse {
  message: string;
  timestamp: string;
}

router.get('/', (req: Request, res: Response<RootResponse>) => {
  res.json({
    message:
      'API Main Protected Router. Contains /users and /events endpoints.',
    timestamp: new Date().toISOString(),
  });
});

export default router;
