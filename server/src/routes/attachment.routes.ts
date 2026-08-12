import { Router } from 'express';
import {
  uploadAttachment,
  getTaskAttachments,
  deleteAttachment,
} from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.post('/tasks/:taskId', upload.single('photo'), uploadAttachment);
router.get('/tasks/:taskId', getTaskAttachments);
router.delete('/:id', deleteAttachment);

export default router;