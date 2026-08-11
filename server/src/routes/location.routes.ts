import { Router } from 'express';
import {
  recordLocation,
  getActiveEmployeeLocations,
  getEmployeeLocationHistory,
  getTaskLocationHistory,
} from '../controllers/location.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', recordLocation);
router.get('/employees', authorize('ADMIN', 'MANAGER'), getActiveEmployeeLocations);
router.get('/employee/:id', authorize('ADMIN', 'MANAGER'), getEmployeeLocationHistory);
router.get('/task/:taskId', getTaskLocationHistory);

export default router;