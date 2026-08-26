import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'danzo_super_secret_jwt_key_7_days_2026';

export const verifyToken = async (req, res, next) => {
  console.log('🟣 Backend Middleware: Verifying token...');
  const token = req.headers.authorization?.split('Bearer ')[1];

  if (!token) {
    console.log('❌ Backend Middleware: No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    let user = null;

    // 1. First attempt to verify as a 7-day signed JWT
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('🟣 Backend Middleware: 7-day JWT valid, User ID:', decoded.id || decoded.firebaseUid);
      if (decoded.id) {
        user = await User.findById(decoded.id);
      } else if (decoded.firebaseUid) {
        user = await User.findOne({ firebaseUid: decoded.firebaseUid });
      }
    } catch (jwtError) {
      // 2. If not a valid JWT or expired, fallback to verifying with Firebase Admin
      console.log('🟣 Backend Middleware: Falling back to Firebase ID token verification...');
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('🟣 Backend Middleware: Firebase ID token valid, UID:', decodedToken.uid);
      user = await User.findOne({ firebaseUid: decodedToken.uid });
    }

    if (!user || !user.isActive) {
      console.log('❌ Backend Middleware: User not found or inactive');
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    console.log('🟣 Backend Middleware: User found, access granted');
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Backend Middleware: Token verification error:', error.message || error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

