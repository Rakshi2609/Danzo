import jwt from 'jsonwebtoken';
import admin from '../config/firebase.js';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'danzo_super_secret_jwt_key_7_days_2026';

export const login = async (req, res) => {
  try {
    console.log('🟣 Backend Auth: Login request received');
    const { token, email, displayName, photoURL } = req.body;
    let firebaseUid = null;

    // Verify Firebase ID Token
    if (token) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        firebaseUid = decoded.uid;
      } catch (err) {
        console.error('❌ Firebase ID token verification failed:', err.message);
        return res.status(401).json({ error: 'Invalid or expired authentication credentials' });
      }
    } else if (req.body.firebaseUid && process.env.NODE_ENV === 'development') {
      firebaseUid = req.body.firebaseUid;
    } else {
      return res.status(400).json({ error: 'Authentication token is required' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    console.log('🟣 Backend Auth: Verified Email:', email, 'UID:', firebaseUid);

    let user = null;
    if (firebaseUid) {
      user = await User.findOne({ firebaseUid });
    }
    if (!user && email) {
      user = await User.findOne({ email });
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (!user) {
      console.log('🟣 Backend Auth: Creating new user');
      user = await User.create({
        firebaseUid: firebaseUid || `user_${Date.now()}`,
        email,
        displayName,
        photoURL,
        loginStreak: 1,
        longestStreak: 1,
        lastLoginDate: today,
        loginHistory: [todayStr]
      });
      console.log('🟣 Backend Auth: User created:', user._id);
    } else {
      console.log('🟣 Backend Auth: User exists, updating');
      if (firebaseUid && !user.firebaseUid) {
        user.firebaseUid = firebaseUid;
      }
      user.displayName = displayName || user.displayName;
      user.photoURL = photoURL || user.photoURL;

      // Calculate and update login streak
      if (!user.loginHistory) user.loginHistory = [];
      const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
      if (lastLogin) {
        const lastDateStr = lastLogin.toISOString().split('T')[0];
        if (lastDateStr !== todayStr) {
          const lastMidnight = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
          const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const diffDays = Math.round((todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            user.loginStreak = (user.loginStreak || 0) + 1;
          } else if (diffDays > 1) {
            user.loginStreak = 1;
          }
        }
      } else {
        user.loginStreak = 1;
      }

      if (!user.loginHistory.includes(todayStr)) {
        user.loginHistory.push(todayStr);
      }

      if ((user.loginStreak || 1) > (user.longestStreak || 1)) {
        user.longestStreak = user.loginStreak;
      }

      user.lastLoginDate = today;
      await user.save();
      console.log('🟣 Backend Auth: User updated with streak:', user.loginStreak);
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

