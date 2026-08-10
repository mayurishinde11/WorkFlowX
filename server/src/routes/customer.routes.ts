import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', authorize('ADMIN', 'MANAGER'), createCustomer);
router.patch('/:id', authorize('ADMIN', 'MANAGER'), updateCustomer);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), deleteCustomer);

export default router;