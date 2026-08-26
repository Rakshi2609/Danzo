import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';

const router = express.Router();

// Bot auth: custom API key from env (BOT_API_KEY). Hermes sends it as X-Bot-Key header.
const verifyBotKey = (req, res, next) => {
  const key = req.headers['x-bot-key'];
  if (!process.env.BOT_API_KEY || key !== process.env.BOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized bot' });
  }
  next();
};

router.use(verifyBotKey);

const toNumber = (user) => (user && user.phone ? String(user.phone).replace(/[^0-9]/g, '') : null);

// GET /api/bot/tasks/due?within_hours=24
// Tasks due within N hours (default 24) that are not completed/cancelled, with assignee phone
router.get('/tasks/due', async (req, res) => {
  const withinHours = parseInt(req.query.within_hours, 10) || 24;
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinHours * 3600 * 1000);

  const tasks = await Task.find({
    dueDate: { $gte: new Date(now.getTime() - 7 * 24 * 3600 * 1000), $lte: cutoff }, // include overdue up to 7 days
    status: { $in: ['Pending', 'In Progress'] }
  })
    .populate('assignedTo', 'displayName phone email')
    .sort({ dueDate: 1 })
    .lean();

  res.json({
    count: tasks.length,
    tasks: tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      overdue: new Date(t.dueDate) < now,
      assignee: t.assignedTo ? { name: t.assignedTo.displayName, phone: toNumber(t.assignedTo), email: t.assignedTo.email } : null
    }))
  });
});

// GET /api/bot/tasks/today — tasks due today for the daily briefing
router.get('/tasks/today', async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const tasks = await Task.find({
    dueDate: { $gte: start, $lt: end },
    status: { $in: ['Pending', 'In Progress'] }
  })
    .populate('assignedTo', 'displayName phone email')
    .sort({ dueDate: 1 })
    .lean();

  res.json({
    count: tasks.length,
    tasks: tasks.map((t) => ({
      id: t._id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      status: t.status,
      assignee: t.assignedTo ? { name: t.assignedTo.displayName, phone: toNumber(t.assignedTo) } : null
    }))
  });
});

// GET /api/bot/tasks/for?phone=918660677696 — all open tasks for one person by phone
router.get('/tasks/for', async (req, res) => {
  const phone = String(req.query.phone || '').replace(/[^0-9]/g, '');
  if (!phone) return res.status(400).json({ error: 'phone query param required' });

  const user = await User.findOne({ phone }).lean();
  if (!user) return res.status(404).json({ error: 'No user with that phone number' });

  const tasks = await Task.find({
    assignedTo: user._id,
    status: { $in: ['Pending', 'In Progress'] }
  })
    .sort({ dueDate: 1 })
    .lean();

  res.json({
    user: { name: user.displayName, phone: user.phone, role: user.role },
    count: tasks.length,
    tasks: tasks.map((t) => ({
      id: t._id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      dueDate: t.dueDate,
      status: t.status,
      overdue: new Date(t.dueDate) < new Date()
    }))
  });
});

// POST /api/bot/reminders/mark  { taskId }  — mark that a reminder was sent (avoids duplicates)
const remindedIds = new Set(); // in-memory; move to DB later if needed
router.post('/reminders/mark', async (req, res) => {
  const { taskId } = req.body || {};
  if (!taskId) return res.status(400).json({ error: 'taskId required' });
  remindedIds.add(String(taskId));
  res.json({ ok: true, taskId, markedAt: new Date().toISOString() });
});

// GET /api/bot/reminders/pending?within_hours=24 — due tasks not yet reminded
router.get('/reminders/pending', async (req, res) => {
  const withinHours = parseInt(req.query.within_hours, 10) || 24;
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinHours * 3600 * 1000);

  const tasks = await Task.find({
    dueDate: { $lte: cutoff },
    status: { $in: ['Pending', 'In Progress'] }
  })
    .populate('assignedTo', 'displayName phone email')
    .sort({ dueDate: 1 })
    .lean();

  const pending = tasks
    .filter((t) => !remindedIds.has(String(t._id)))
    .filter((t) => t.assignedTo && toNumber(t.assignedTo));

  res.json({
    count: pending.length,
    tasks: pending.map((t) => ({
      id: t._id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate,
      overdue: new Date(t.dueDate) < now,
      assignee: { name: t.assignedTo.displayName, phone: toNumber(t.assignedTo) }
    }))
  });
});

// GET /api/bot/users/check?phone=918660677696 — is this phone a registered user?
// Used by the WhatsApp bridge as a dynamic allowlist fallback.
router.get('/users/check', async (req, res) => {
  const phone = String(req.query.phone || '').replace(/[^0-9]/g, '');
  if (!phone) return res.status(400).json({ error: 'phone query param required' });

  const user = await User.findOne({ phone, isActive: true }).select('displayName phone role').lean();
  res.json({ allowed: !!user, user: user ? { name: user.displayName, phone: user.phone, role: user.role } : null });
});

// GET /api/bot/summary — quick stats for "how are we doing?" questions
router.get('/summary', async (req, res) => {
  const [total, pending, inProgress, completed, overdue] = await Promise.all([
    Task.countDocuments({}),
    Task.countDocuments({ status: 'Pending' }),
    Task.countDocuments({ status: 'In Progress' }),
    Task.countDocuments({ status: 'Completed' }),
    Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $in: ['Pending', 'In Progress'] } })
  ]);
  res.json({ total, pending, inProgress, completed, overdue });
});

export default router;
