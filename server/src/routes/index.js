import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import taskRoutes from './task.routes.js';
import recurringTaskRoutes from './recurringTask.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import botRoutes from './bot.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/recurring-tasks', recurringTaskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/bot', botRoutes);

export default router;
