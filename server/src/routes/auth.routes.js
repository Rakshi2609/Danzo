import express from 'express';
import { login, getCurrentUser } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', verifyToken, getCurrentUser);

export default router;

