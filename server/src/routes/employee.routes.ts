import { Router } from 'express';
import {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
} from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER'), getEmployees);
router.get('/:id', authorize('ADMIN', 'MANAGER'), getEmployeeById);
router.post('/', authorize('ADMIN', 'MANAGER'), createEmployee);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), updateEmployee);
router.patch('/:id/deactivate', authorize('ADMIN', 'MANAGER'), deactivateEmployee);

export default router;