import RecurringTask from '../models/RecurringTask.js';
import Task from '../models/Task.js';

/**
 * Core recurring-task generator
 * Generates tasks from startDate up to endDate (or up to 1 year if no endDate)
 */
export const generateRecurringTasksCore = async (now = new Date()) => {
  const recurringTasks = await RecurringTask.find({
    isActive: true,
  }).populate('assignedTo createdBy');

  let generated = 0;
  let skipped = 0;

  for (const recurringTask of recurringTasks) {
    if (!recurringTask.startDate) continue;

    // Start generating from startDate or today, whichever is later
    let currentDate = new Date(recurringTask.startDate);
    currentDate.setHours(12, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentDate < today) {
      currentDate = new Date(today);
      currentDate.setHours(12, 0, 0, 0);
    }

    // Determine the end boundary
    let endBoundary = new Date(today);
    endBoundary.setFullYear(endBoundary.getFullYear() + 1); // Max 1 year ahead
    if (recurringTask.endDate && recurringTask.endDate < endBoundary) {
      endBoundary = new Date(recurringTask.endDate);
      endBoundary.setHours(23, 59, 59, 999);
    }

    while (currentDate <= endBoundary) {
      // Skip Sundays
      if (currentDate.getDay() === 0) {
        skipped++;
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      // Prevent duplicates
      const existingTask = await Task.findOne({
        recurringTaskId: recurringTask._id,
        dueDate: {
          $gte: new Date(currentDate.getTime() - 43200000), // start of day approx
          $lt: new Date(currentDate.getTime() + 43200000), // end of day approx
        },
      });

      if (!existingTask) {
        await Task.create({
          title: recurringTask.title,
          description: recurringTask.description,
          assignedTo: recurringTask.assignedTo._id || recurringTask.assignedTo,
          createdBy: recurringTask.createdBy._id || recurringTask.createdBy,
          recurringTaskId: recurringTask._id,
          priority: recurringTask.taskTemplate.priority,
          startTime: recurringTask.taskTemplate.startTime || null,
          endTime: recurringTask.taskTemplate.endTime || null,
          tags: recurringTask.taskTemplate.tags || [],
          dueDate: new Date(currentDate),
          status: 'Pending',
        });
        generated++;
      } else {
        skipped++;
      }

      // Increment date based on frequency
      if (recurringTask.frequency === 'Daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurringTask.frequency === 'Weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (recurringTask.frequency === 'Monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else {
        // Fallback
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    recurringTask.lastGeneratedAt = new Date();
    await recurringTask.save();
  }

  return { generated, skipped };
};

/* ============================
   CONTROLLERS
============================ */

export const getAllRecurringTasks = async (req, res) => {
  try {
    const tasks = await RecurringTask.find({
      assignedTo: req.user._id
    })
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRecurringTask = async (req, res) => {
  try {
    const {
      title,
      description,
      frequency,
      startDate,
      endDate,
      assignedTo,
      priority,
      startTime,
      endTime
    } = req.body;

    const recurringTask = await RecurringTask.create({
      title,
      description,
      frequency,
      startDate,
      endDate,
      assignedTo,
      createdBy: req.user._id,
      taskTemplate: {
        priority,
        startTime,
        endTime
      }
    });

    const populated = await RecurringTask.findById(recurringTask._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    // Trigger generation for this new task immediately
    await generateRecurringTasksCore();

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRecurringTask = async (req, res) => {
  try {
    const recurringTask = await RecurringTask.findById(req.params.id);

    if (!recurringTask) {
      return res.status(404).json({ error: 'Recurring task not found' });
    }

    if (recurringTask.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only creator can edit' });
    }

    const {
      title,
      description,
      frequency,
      startDate,
      endDate,
      assignedTo,
      priority,
      startTime,
      endTime
    } = req.body;

    recurringTask.title = title ?? recurringTask.title;
    recurringTask.description = description ?? recurringTask.description;
    recurringTask.frequency = frequency ?? recurringTask.frequency;
    recurringTask.startDate = startDate ?? recurringTask.startDate;
    recurringTask.endDate = endDate ?? recurringTask.endDate;
    recurringTask.assignedTo = assignedTo ?? recurringTask.assignedTo;

    recurringTask.taskTemplate.priority =
      priority ?? recurringTask.taskTemplate.priority;

    recurringTask.taskTemplate.startTime =
      startTime !== undefined ? startTime : recurringTask.taskTemplate.startTime;

    recurringTask.taskTemplate.endTime =
      endTime !== undefined ? endTime : recurringTask.taskTemplate.endTime;

    await recurringTask.save();

    const populated = await RecurringTask.findById(recurringTask._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRecurringTask = async (req, res) => {
  try {
    const recurringTask = await RecurringTask.findById(req.params.id);

    if (!recurringTask) {
      return res.status(404).json({ error: 'Recurring task not found' });
    }

    if (recurringTask.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only creator can delete' });
    }

    await RecurringTask.findByIdAndDelete(req.params.id);

    res.json({ message: 'Recurring task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleRecurringTask = async (req, res) => {
  try {
    const recurringTask = await RecurringTask.findById(req.params.id);

    if (!recurringTask) {
      return res.status(404).json({ error: 'Recurring task not found' });
    }

    recurringTask.isActive = !recurringTask.isActive;
    await recurringTask.save();

    res.json(recurringTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Manual trigger (same logic as Agenda)
export const triggerRecurringTasks = async (req, res) => {
  try {
    const result = await generateRecurringTasksCore(new Date());
    res.json({
      message: 'Recurring task generation completed',
      ...result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
