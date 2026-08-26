import express from 'express';
import {
  getAllRecurringTasks,
  createRecurringTask,
  updateRecurringTask,
  deleteRecurringTask,
  toggleRecurringTask,
  triggerRecurringTasks
} from '../controllers/recurringTask.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { mutationLimiter, triggerLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', verifyToken, getAllRecurringTasks);
router.post('/', verifyToken, mutationLimiter, createRecurringTask);
router.post('/trigger-now', verifyToken, triggerLimiter, triggerRecurringTasks);
router.put('/:id', verifyToken, mutationLimiter, updateRecurringTask);
router.delete('/:id', verifyToken, mutationLimiter, deleteRecurringTask);
router.patch('/:id/toggle', verifyToken, mutationLimiter, toggleRecurringTask);

export default router;
