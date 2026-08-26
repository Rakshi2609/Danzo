import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'danzo_super_secret_jwt_key_7_days_2026';

export const login = async (req, res) => {
  try {
    console.log('🟣 Backend Auth: Login request received');
    const { token, email, displayName, photoURL } = req.body;
    let firebaseUid = req.user?.firebaseUid || req.body.firebaseUid;

    // If Firebase ID token is sent, verify and extract UID if not already available
    if (token && !firebaseUid) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        firebaseUid = decoded.uid;
      } catch (err) {
        console.warn('Firebase ID token verification in login route:', err.message);
      }
    }

    console.log('🟣 Backend Auth: Email:', email, 'UID:', firebaseUid);

    let user = null;
    if (firebaseUid) {
      user = await User.findOne({ firebaseUid });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      console.log('🟣 Backend Auth: Creating new user');
      user = await User.create({
        firebaseUid: firebaseUid || `user_${Date.now()}`,
        email,
        displayName,
        photoURL
      });
      console.log('🟣 Backend Auth: User created:', user._id);
    } else {
      console.log('🟣 Backend Auth: User exists, updating');
      if (firebaseUid && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
      }
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;
      await user.save();
      console.log('🟣 Backend Auth: User updated');
    }

    // Generate 7-day JWT token
    const jwtToken = jwt.sign(
      {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🟣 Backend Auth: 7-day JWT token generated successfully');
    res.json({
      user,
      token: jwtToken,
      expiresIn: '7d'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

