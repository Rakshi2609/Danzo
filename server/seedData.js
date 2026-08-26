import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/User.js';
import Task from './src/models/Task.js';
import TaskUpdate from './src/models/TaskUpdate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager';

async function seed() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    // 1. Check or Upsert Rakshith
    const primaryEmail = 'rakshithganjimut@gmail.com';
    let rakshith = await User.findOne({ email: primaryEmail });

    const now = new Date();
    const historyDates = [
      new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
      now.toISOString().split('T')[0],
    ];

    if (!rakshith) {
      rakshith = await User.create({
        firebaseUid: 'rakshith_main_uid',
        email: primaryEmail,
        displayName: 'Rakshith Ganjimut',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        phone: '918660677696',
        role: 'Admin',
        isActive: true,
        loginStreak: 5,
        longestStreak: 12,
        lastLoginDate: now,
        loginHistory: historyDates
      });
      console.log('Created primary user Rakshith (Admin)');
    } else {
      rakshith.role = 'Admin';
      rakshith.phone = rakshith.phone || '918660677696';
      rakshith.loginStreak = Math.max(rakshith.loginStreak || 0, 5);
      rakshith.longestStreak = Math.max(rakshith.longestStreak || 0, 12);
      rakshith.loginHistory = Array.from(new Set([...(rakshith.loginHistory || []), ...historyDates]));
      await rakshith.save();
      console.log('Updated existing user Rakshith with Admin role & active streak');
    }

    // 2. Team Members
    const teamMembersData = [
      {
        email: 'sarah.chen@danzo.io',
        displayName: 'Sarah Chen',
        role: 'Manager',
        phone: '919876543210',
        photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        loginStreak: 3,
        longestStreak: 7,
      },
      {
        email: 'alex.kumar@danzo.io',
        displayName: 'Alex Kumar',
        role: 'Member',
        phone: '919812345678',
        photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
        loginStreak: 4,
        longestStreak: 9,
      },
      {
        email: 'priya.sharma@danzo.io',
        displayName: 'Priya Sharma',
        role: 'Member',
        phone: '919823456789',
        photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        loginStreak: 2,
        longestStreak: 6,
      },
      {
        email: 'marcus.vance@danzo.io',
        displayName: 'Marcus Vance',
        role: 'Member',
        phone: '919834567890',
        photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        loginStreak: 6,
        longestStreak: 15,
      }
    ];

    const teamUsers = {};
    for (const m of teamMembersData) {
      let u = await User.findOne({ email: m.email });
      if (!u) {
        u = await User.create({
          firebaseUid: `team_${m.email.split('@')[0]}`,
          email: m.email,
          displayName: m.displayName,
          role: m.role,
          phone: m.phone,
          photoURL: m.photoURL,
          isActive: true,
          loginStreak: m.loginStreak,
          longestStreak: m.longestStreak,
          lastLoginDate: now,
          loginHistory: historyDates
        });
      }
      teamUsers[m.email] = u;
      console.log(`Team member ready: ${m.displayName} (${m.role})`);
    }

    // 3. Clear older demo tasks to keep data clean
    console.log('Seeding curated tasks...');

    const todayDate = new Date();
    const tomorrowDate = new Date(Date.now() + 86400000);
    const in2DaysDate = new Date(Date.now() + 2 * 86400000);
    const in3DaysDate = new Date(Date.now() + 3 * 86400000);
    const yesterdayDate = new Date(Date.now() - 86400000);

    const tasksToInsert = [
      // Tasks Assigned to Rakshith
      {
        title: '🚀 Architecture Review: Danzo 2.0 Realtime Engine',
        description: 'Review WebSocket sync layer, optimistic mutation queues, and token validation flow across distributed nodes.',
        status: 'In Progress',
        priority: 'Urgent',
        dueDate: tomorrowDate,
        assignedTo: rakshith._id,
        createdBy: teamUsers['sarah.chen@danzo.io']._id,
        tags: ['Architecture', 'Engine', 'V2'],
        subtasks: [
          { title: 'Benchmark WebSocket handshake under load', isCompleted: true },
          { title: 'Verify token expiration handling on 401', isCompleted: true },
          { title: 'Stress test optimistic queue reconciliation', isCompleted: false },
        ]
      },
      {
        title: '🔐 Production Security Audit & OAuth 2.0 Hardening',
        description: 'Perform penetration check on JWT secret lifecycle, cross-origin cookies, and helmet security headers.',
        status: 'Pending',
        priority: 'High',
        dueDate: in2DaysDate,
        assignedTo: rakshith._id,
        createdBy: rakshith._id,
        tags: ['Security', 'Auth', 'Audit'],
        subtasks: [
          { title: 'Check 7-day token expiration integrity', isCompleted: false },
          { title: 'Audit role-based ACL guards for Admin endpoints', isCompleted: false },
        ]
      },
      {
        title: '📊 Quarterly Tech Roadmap & Infrastructure Budget',
        description: 'Finalize capacity estimates for MongoDB Atlas clusters, Render web services, and automated notification bots.',
        status: 'Completed',
        priority: 'Medium',
        dueDate: yesterdayDate,
        assignedTo: rakshith._id,
        createdBy: rakshith._id,
        actualStartTime: new Date(Date.now() - 90000000),
        actualEndTime: new Date(Date.now() - 86400000),
        completedAt: yesterdayDate,
        tags: ['Planning', 'Budget', 'Infra'],
        subtasks: [
          { title: 'Compute cluster scaling costs', isCompleted: true },
          { title: 'Review WhatsApp Cloud API message tiers', isCompleted: true },
        ]
      },
      {
        title: '📱 Verify PWA Offline Sync and Service Worker Push',
        description: 'Test progressive web app manifest, cache busting, and background notification triggers on mobile devices.',
        status: 'In Progress',
        priority: 'High',
        dueDate: todayDate,
        assignedTo: rakshith._id,
        createdBy: teamUsers['alex.kumar@danzo.io']._id,
        tags: ['PWA', 'Mobile', 'Offline'],
        subtasks: [
          { title: 'Register service worker on localhost & staging', isCompleted: true },
          { title: 'Verify dark mode icon assets on home screen install', isCompleted: false },
        ]
      },

      // Tasks Created by Rakshith Assigned to Team (Rakshith's Follow-ups)
      {
        title: '🎨 Finalize Dark Mode Design Tokens and Micro-interactions',
        description: 'Audit side navbar contrast in light mode and ensure smooth transitions for streak calendars and floating modals.',
        status: 'In Progress',
        priority: 'High',
        dueDate: tomorrowDate,
        assignedTo: teamUsers['sarah.chen@danzo.io']._id,
        createdBy: rakshith._id,
        tags: ['Design', 'UI/UX', 'Dark Mode'],
        subtasks: [
          { title: 'Fix SideNavbar active item contrast', isCompleted: true },
          { title: 'Add popover drop animations with Framer Motion', isCompleted: true },
          { title: 'Polish time tracking modal dark styling', isCompleted: false },
        ]
      },
      {
        title: '⚡ Optimize MongoDB Indexing for Task Timeline Queries',
        description: 'Add compound indices on (assignedTo, status, dueDate) to improve dashboard calendar loading speed to <30ms.',
        status: 'Pending',
        priority: 'Urgent',
        dueDate: in2DaysDate,
        assignedTo: teamUsers['alex.kumar@danzo.io']._id,
        createdBy: rakshith._id,
        tags: ['Database', 'Performance', 'Backend'],
        subtasks: [
          { title: 'Explain execution plan for my-tasks queries', isCompleted: false },
          { title: 'Measure index cache hit ratio', isCompleted: false },
        ]
      },
      {
        title: '🧪 Automated E2E Test Suite for WhatsApp Reminder Webhooks',
        description: 'Build automated test cases verifying that daily 9 PM cron triggers correctly dispatch WhatsApp template notifications.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: in3DaysDate,
        assignedTo: teamUsers['priya.sharma@danzo.io']._id,
        createdBy: rakshith._id,
        tags: ['QA', 'E2E', 'WhatsApp'],
        subtasks: [
          { title: 'Mock WhatsApp Cloud API response payloads', isCompleted: true },
          { title: 'Validate phone number E.164 sanitization', isCompleted: false },
        ]
      },
      {
        title: '📝 Draft Danzo 2.0 Release Notes and Documentation',
        description: 'Write complete user guides for login streak tracking, profile WhatsApp settings, and task assignment workflow.',
        status: 'Completed',
        priority: 'Low',
        dueDate: yesterdayDate,
        assignedTo: teamUsers['marcus.vance@danzo.io']._id,
        createdBy: rakshith._id,
        completedAt: yesterdayDate,
        tags: ['Docs', 'Release', 'Guide'],
        subtasks: [
          { title: 'Draft /profile route guide', isCompleted: true },
          { title: 'Document 7-day JWT auto-refresh mechanism', isCompleted: true },
        ]
      },

      // Collaborative Team Tasks
      {
        title: '📈 Implement Team Productivity Analytics Widget',
        description: 'Calculate sprint velocity and weekly completed task breakdowns for manager dashboards.',
        status: 'Pending',
        priority: 'Medium',
        dueDate: in3DaysDate,
        assignedTo: teamUsers['marcus.vance@danzo.io']._id,
        createdBy: teamUsers['sarah.chen@danzo.io']._id,
        tags: ['Analytics', 'Dashboard'],
        subtasks: []
      }
    ];

    // Insert or update tasks
    for (const t of tasksToInsert) {
      const existing = await Task.findOne({ title: t.title });
      let createdTask;
      if (!existing) {
        createdTask = await Task.create(t);
        console.log(`Created task: ${t.title}`);
      } else {
        Object.assign(existing, t);
        createdTask = await existing.save();
        console.log(`Updated task: ${t.title}`);
      }

      // Add a friendly comment
      const commentCheck = await TaskUpdate.findOne({ taskId: createdTask._id, type: 'Comment' });
      if (!commentCheck) {
        await TaskUpdate.create({
          taskId: createdTask._id,
          userId: createdTask.createdBy,
          type: 'Comment',
          content: 'Let’s ensure this is thoroughly tested and meets our production standards! 🚀'
        });
      }
    }

    console.log('\n✨ Database successfully seeded with:');
    console.log('1. Primary Admin User: Rakshith Ganjimut (rakshithganjimut@gmail.com)');
    console.log('2. 4 Team Members (Sarah, Alex, Priya, Marcus)');
    console.log('3. Curated tasks assigned to you & created by you for your team!');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
