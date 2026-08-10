import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  assignTask,
  updateTaskStatus,
} from '../controllers/task.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', authorize('ADMIN', 'MANAGER'), createTask);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), updateTask);
router.patch('/:id/assign', authorize('ADMIN', 'MANAGER'), assignTask);
router.patch('/:id/status', updateTaskStatus);

export default router;