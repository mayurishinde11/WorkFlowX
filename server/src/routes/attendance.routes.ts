import { Router } from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getEmployeeAttendance,
} from '../controllers/attendance.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/me', getMyAttendance);
router.get('/employee/:id', authorize('ADMIN', 'MANAGER'), getEmployeeAttendance);

export default router;