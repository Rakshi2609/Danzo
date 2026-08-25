import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-__v');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update own profile (phone number for WhatsApp reminders, displayName)
export const updateProfile = async (req, res) => {
  try {
    const { phone, displayName } = req.body;
    const updateData = {};

    if (phone !== undefined) {
      // Normalize: strip spaces/dashes/plus, keep digits only (E.164 without '+')
      const normalized = String(phone).replace(/[^\d]/g, '');
      if (normalized && !/^\d{10,15}$/.test(normalized)) {
        return res.status(400).json({ error: 'Phone must be 10-15 digits with country code, e.g. 918660677696' });
      }
      updateData.phone = normalized;
    }
    if (displayName !== undefined) updateData.displayName = displayName;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('-__v');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
