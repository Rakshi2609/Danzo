import Task from '../models/Task.js';
import TaskUpdate from '../models/TaskUpdate.js';
import User from '../models/User.js';
import RecurringTask from '../models/RecurringTask.js';

export const getAllTasks = async (req, res) => {
  try {
    // Only show tasks assigned to or created by current user (privacy)
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { createdBy: req.user._id }
      ]
    })
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email')
      .populate('recurringTaskId', 'title frequency isActive')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    console.log(`📋 Fetching tasks for user: ${req.user._id}`);
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email')
      .populate('recurringTaskId', 'title frequency isActive')
      .sort({ dueDate: 1 });
    
    const recurringCount = tasks.filter(t => t.recurringTaskId).length;
    const regularCount = tasks.length - recurringCount;
    
    console.log(`📋 Found ${tasks.length} tasks assigned to user (${regularCount} regular, ${recurringCount} recurring)`);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFollowUps = async (req, res) => {
  try {
    const tasks = await Task.find({ createdBy: req.user._id })
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email')
      .populate('recurringTaskId', 'title frequency isActive')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email')
      .populate('recurringTaskId', 'title frequency isActive');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Privacy check: only show task if user is assignee or creator
    const isAssignedToUser = task.assignedTo?._id.toString() === req.user._id.toString();
    const isCreatedByUser = task.createdBy?._id.toString() === req.user._id.toString();
    
    if (!isAssignedToUser && !isCreatedByUser) {
      return res.status(403).json({ error: 'Access denied: You do not have permission to view this task' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, startTime, endTime, priority, assignedTo, subtasks } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      startTime,
      endTime,
      priority,
      assignedTo,
      subtasks: subtasks || [],
      createdBy: req.user._id
    });

    await TaskUpdate.create({
      taskId: task._id,
      userId: req.user._id,
      type: 'Update',
      content: 'Task created'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, startTime, endTime, priority, assignedTo, subtasks } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldAssigneeId = task.assignedTo?.toString();
    const newAssigneeId = assignedTo ? assignedTo.toString() : null;
    const isReassigned = newAssigneeId && oldAssigneeId && oldAssigneeId !== newAssigneeId;

    const updateData = { title, description, dueDate, startTime, endTime, priority };
    if (assignedTo) {
      updateData.assignedTo = assignedTo;
    }
    if (subtasks !== undefined) {
      updateData.subtasks = subtasks;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    if (isReassigned) {
      const [oldUser, newUser] = await Promise.all([
        User.findById(oldAssigneeId),
        User.findById(newAssigneeId)
      ]);
      const oldName = oldUser?.displayName || oldUser?.email || 'Previous Assignee';
      const newName = newUser?.displayName || newUser?.email || 'New Assignee';
      const reassignContent = `Reassigned task from ${oldName} to ${newName}`;

      await TaskUpdate.create({
        taskId: task._id,
        userId: req.user._id,
        type: 'Assignment',
        oldValue: oldName,
        newValue: newName,
        content: reassignContent
      });
    } else {
      await TaskUpdate.create({
        taskId: task._id,
        userId: req.user._id,
        type: 'Update',
        content: 'Task updated'
      });
    }

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reassignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ error: 'New assignee is required' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldAssigneeId = task.assignedTo?.toString();
    const newAssigneeId = assignedTo.toString();

    if (oldAssigneeId === newAssigneeId) {
      const populated = await Task.findById(task._id)
        .populate('assignedTo', 'displayName email')
        .populate('createdBy', 'displayName email');
      return res.json(populated);
    }

    const [oldUser, newUser] = await Promise.all([
      User.findById(oldAssigneeId),
      User.findById(newAssigneeId)
    ]);

    if (!newUser) {
      return res.status(404).json({ error: 'New assignee user not found' });
    }

    task.assignedTo = newAssigneeId;
    await task.save();

    const oldName = oldUser?.displayName || oldUser?.email || 'Previous Assignee';
    const newName = newUser?.displayName || newUser?.email || 'New Assignee';
    const reassignContent = `Reassigned task from ${oldName} to ${newName}`;

    await TaskUpdate.create({
      taskId: task._id,
      userId: req.user._id,
      type: 'Assignment',
      oldValue: oldName,
      newValue: newName,
      content: reassignContent
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = req.task;

    const oldStatus = task.status;

    // Prevent future task updates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (task.dueDate && new Date(task.dueDate) > today) {
      return res.status(403).json({ error: 'Cannot update tasks with future dates' });
    }

    if (status === 'Completed') {
      const pendingSubtasks = task.subtasks?.filter(st => !st.isCompleted);
      if (pendingSubtasks && pendingSubtasks.length > 0) {
        return res.status(400).json({ error: 'Cannot complete task until all subtasks are completed' });
      }
    }

    task.status = status;

    if (status === 'Completed') {
      task.completedAt = new Date();
    }

    await task.save();

    await TaskUpdate.create({
      taskId: task._id,
      userId: req.user._id,
      type: 'StatusChange',
      oldValue: oldStatus,
      newValue: status
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete associated updates
    await TaskUpdate.deleteMany({ taskId: task._id });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTaskUpdates = async (req, res) => {
  try {
    const updates = await TaskUpdate.find({ taskId: req.params.taskId })
      .populate('userId', 'displayName email')
      .sort({ createdAt: -1 });

    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    const update = await TaskUpdate.create({
      taskId: req.params.taskId,
      userId: req.user._id,
      type: 'Comment',
      content
    });

    const populatedUpdate = await TaskUpdate.findById(update._id)
      .populate('userId', 'displayName email');

    res.status(201).json(populatedUpdate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { taskId, actualStartTime, actualEndTime } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only complete tasks assigned to you' });
    }

    // Prevent future task updates
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (task.dueDate && new Date(task.dueDate) > today) {
      return res.status(403).json({ error: 'Cannot complete tasks with future dates' });
    }

    const pendingSubtasks = task.subtasks?.filter(st => !st.isCompleted);
    if (pendingSubtasks && pendingSubtasks.length > 0) {
      return res.status(400).json({ error: 'Cannot complete task until all subtasks are completed' });
    }

    const oldStatus = task.status;
    task.status = 'Completed';
    task.completedAt = new Date();
    
    if (actualStartTime) {
      task.actualStartTime = new Date(actualStartTime);
    }
    
    if (actualEndTime) {
      task.actualEndTime = new Date(actualEndTime);
    } else {
      // If no end time provided, set to now
      task.actualEndTime = new Date();
    }

    await task.save();

    await TaskUpdate.create({
      taskId: task._id,
      userId: req.user._id,
      type: 'StatusChange',
      oldValue: oldStatus,
      newValue: 'Completed'
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTaskByBody = async (req, res) => {
  try {
    const { taskId } = req.body;
    
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions: only creator or assignee can delete
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();

    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: 'You do not have permission to delete this task' });
    }

    await Task.findByIdAndDelete(taskId);

    // Delete associated updates
    await TaskUpdate.deleteMany({ taskId });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleReaction = async (req, res) => {
  try {
    const { taskId, updateId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id.toString();

    const update = await TaskUpdate.findOne({ _id: updateId, taskId });

    if (!update) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Initialize reactions if not exists
    if (!update.reactions) {
      update.reactions = new Map();
    }

    // Get current users who reacted with this emoji
    const currentReactors = update.reactions.get(emoji) || [];

    // Toggle: if user already reacted, remove; otherwise add
    if (currentReactors.includes(userId)) {
      const filtered = currentReactors.filter(id => id !== userId);
      if (filtered.length === 0) {
        update.reactions.delete(emoji);
      } else {
        update.reactions.set(emoji, filtered);
      }
    } else {
      currentReactors.push(userId);
      update.reactions.set(emoji, currentReactors);
    }

    await update.save();

    res.json({ 
      message: 'Reaction updated', 
      reactions: Object.fromEntries(update.reactions) 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addSubtask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: 'Only creator or assignee can add subtasks' });
    }

    task.subtasks.push({ title });
    await task.save();

    await TaskUpdate.create({
      taskId: task._id,
      userId: req.user._id,
      type: 'Update',
      content: `Added subtask: "${title}"`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const toggleSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: 'Only creator or assignee can update subtasks' });
    }

    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: 'Subtask not found' });
    }

    subtask.isCompleted = !subtask.isCompleted;
    subtask.completedAt = subtask.isCompleted ? new Date() : null;

    // Check if task needs to be uncompleted
    if (!subtask.isCompleted && task.status === 'Completed') {
       task.status = 'In Progress'; // Fallback to In Progress if a subtask is unchecked
       task.completedAt = null;
    }

    await task.save();

    await TaskUpdate.create({
      taskId: task._id,
      userId: req.user._id,
      type: 'Update',
      content: `${subtask.isCompleted ? 'Completed' : 'Unchecked'} subtask: "${subtask.title}"`
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    if (!isCreator && !isAssignee) {
      return res.status(403).json({ error: 'Only creator or assignee can delete subtasks' });
    }

    task.subtasks.pull({ _id: subtaskId });
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'displayName email')
      .populate('createdBy', 'displayName email');

    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
