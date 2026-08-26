import express from 'express';
import {
  getAllTasks,
  getMyTasks,
  getFollowUps,
  getTaskById,
  createTask,
  updateTask,
  reassignTask,
  updateTaskStatus,
  deleteTask,
  getTaskUpdates,
  addComment,
  completeTask,
  deleteTaskByBody,
  toggleReaction,
  addSubtask,
  toggleSubtask,
  deleteSubtask
} from '../controllers/task.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { canEditTask, canUpdateStatus, canComment } from '../middleware/taskPermissions.js';
import { mutationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/', verifyToken, getAllTasks);
router.get('/my-tasks', verifyToken, getMyTasks);
router.get('/follow-ups', verifyToken, getFollowUps);
router.get('/:id', verifyToken, getTaskById);
router.post('/', verifyToken, mutationLimiter, createTask);
router.put('/:id', verifyToken, canEditTask, mutationLimiter, updateTask);
router.patch('/:id/reassign', verifyToken, canEditTask, mutationLimiter, reassignTask);
router.patch('/:id/status', verifyToken, canUpdateStatus, updateTaskStatus);
router.patch('/complete', verifyToken, completeTask);
router.delete('/delete', verifyToken, deleteTaskByBody);
router.delete('/:id', verifyToken, canEditTask, deleteTask);
router.get('/:taskId/updates', verifyToken, getTaskUpdates);
router.post('/:taskId/updates', verifyToken, canComment, mutationLimiter, addComment);
router.post('/:taskId/updates/:updateId/react', verifyToken, toggleReaction);

// Subtask routes
router.post('/:taskId/subtasks', verifyToken, mutationLimiter, addSubtask);
router.patch('/:taskId/subtasks/:subtaskId', verifyToken, toggleSubtask);
router.delete('/:taskId/subtasks/:subtaskId', verifyToken, deleteSubtask);

export default router;
