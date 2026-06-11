import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import connectDB from './src/config/database.js';
import RecurringTask from './src/models/RecurringTask.js';
import Task from './src/models/Task.js';
import User from './src/models/User.js';
import { generateRecurringTasksCore } from './src/controllers/recurringTask.controller.js';
import { updateTaskStatus } from './src/controllers/task.controller.js';

const runTest = async () => {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // 1. Create a dummy user
    const user = new User({
      firebaseUid: 'test_user_uid_' + Date.now(),
      email: 'test@example.com',
      displayName: 'Test User'
    });
    await user.save();
    console.log('✅ Dummy user created');

    // 2. Create a recurring task (Start = today, End = today + 4 days)
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 4);

    const recurringTask = new RecurringTask({
      title: 'Test Recurring Task',
      description: 'Testing generation',
      frequency: 'Daily',
      startDate: today,
      endDate: endDate,
      assignedTo: user._id,
      createdBy: user._id,
      taskTemplate: {
        priority: 'High'
      }
    });
    await recurringTask.save();
    console.log('✅ Dummy RecurringTask created');

    // 3. Generate tasks
    const { generated, skipped } = await generateRecurringTasksCore();
    console.log(`✅ Tasks Generated: ${generated}, Skipped: ${skipped}`);

    // 4. Verify generated tasks
    const tasks = await Task.find({ recurringTaskId: recurringTask._id }).sort({ dueDate: 1 });
    console.log(`✅ Found ${tasks.length} tasks in DB`);
    tasks.forEach(t => console.log(`   - Task Due: ${t.dueDate.toDateString()}`));

    // 5. Test future task update restriction
    // Find a task in the future (if any)
    const futureTask = tasks.find(t => {
      const eod = new Date();
      eod.setHours(23, 59, 59, 999);
      return t.dueDate > eod;
    });

    if (futureTask) {
      console.log('✅ Found a future task, attempting to update its status...');
      
      const req = {
        body: { status: 'Completed' },
        task: futureTask,
        user: { _id: user._id }
      };
      
      let resStatus = null;
      let resJson = null;
      const res = {
        status: (s) => { resStatus = s; return res; },
        json: (j) => { resJson = j; }
      };

      await updateTaskStatus(req, res);
      
      if (resStatus === 403) {
        console.log(`✅ Test passed! Update blocked with message: ${resJson.error}`);
      } else {
        console.error(`❌ Test failed! Expected 403, got ${resStatus}`);
      }
    } else {
      console.log('⚠️ No future tasks generated to test update restriction.');
    }

    // Cleanup
    await Task.deleteMany({ recurringTaskId: recurringTask._id });
    await RecurringTask.findByIdAndDelete(recurringTask._id);
    await User.findByIdAndDelete(user._id);
    console.log('✅ Cleanup complete');

  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    mongoose.connection.close();
  }
};

runTest();
