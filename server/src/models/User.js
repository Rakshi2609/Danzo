import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: String,
  phone: {
    type: String,
    default: '',
    index: true
  }, // E.164 format without '+', e.g. 918660677696 — used by WhatsApp bot reminders
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Member'],
    default: 'Member',
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
