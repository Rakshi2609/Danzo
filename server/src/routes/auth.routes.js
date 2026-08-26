import express from 'express';
import { login, getCurrentUser } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.get('/me', verifyToken, getCurrentUser);

export default router;

