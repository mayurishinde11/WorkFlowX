import { Router } from 'express';
import { getDashboardStats } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', authorize('ADMIN', 'MANAGER'), getDashboardStats);

export default router;