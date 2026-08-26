import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService, userService } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCalendar, FiUser, FiClock, FiMessageSquare, FiEdit, FiTrash2, FiUserPlus, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import confetti from 'canvas-confetti';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showReassignDropdown, setShowReassignDropdown] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [timeData, setTimeData] = useState({ startTime: '', endTime: '' });
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    loadTaskDetails();
    loadUsers();
  }, [id]);

  const loadUsers = async () => {
    try {
      const { data } = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users for reassign:', err);
    }
  };

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      const [taskRes, updatesRes] = await Promise.all([
        taskService.getTask(id),
        taskService.getTaskUpdates(id)
      ]);
      setTask(taskRes.data);
      setUpdates(updatesRes.data);
    } catch (error) {
      console.error('Failed to load task details:', error);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (newUserId) => {
    if (!newUserId || newUserId === task.assignedTo?._id) {
      setShowReassignDropdown(false);
      return;
    }
    try {
      setReassigning(true);
      const { data } = await taskService.reassignTask(id, newUserId);
      setTask(data);
      setShowReassignDropdown(false);
      toast.success('Task reassigned successfully!');
      // Reload activity/updates to show the reassignment comment
      const updatesRes = await taskService.getTaskUpdates(id);
      setUpdates(updatesRes.data);
    } catch (error) {
      console.error('Failed to reassign task:', error);
      toast.error(error.response?.data?.error || 'Failed to reassign task');
    } finally {
      setReassigning(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const { data } = await taskService.addComment(id, comment);
      setUpdates([data, ...updates]);
      setComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    try {
      const { data } = await taskService.addSubtask(id, newSubtask);
      setTask(data);
      setNewSubtask('');
      toast.success('Subtask added');
    } catch (error) {
      toast.error('Failed to add subtask');
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const { data } = await taskService.toggleSubtask(id, subtaskId);
      setTask(data);
    } catch (error) {
      toast.error('Failed to toggle subtask');
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const { data } = await taskService.deleteSubtask(id, subtaskId);
      setTask(data);
      toast.success('Subtask deleted');
    } catch (error) {
      toast.error('Failed to delete subtask');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'Completed') {
      // Show time tracking modal for completion
      setShowTimeModal(true);
    } else {
      // For other status changes, update directly
      try {
        await taskService.updateTaskStatus(id, newStatus);
        setTask({ ...task, status: newStatus });
        toast.success('Status updated successfully');
        loadTaskDetails(); // Reload to get the status change update
      } catch (error) {
        console.error('Failed to update status:', error);
        toast.error('Failed to update status');
      }
    }
  };

  const handleCompleteWithTime = async () => {
    if (!user?.email) return;

    try {
      const today = new Date();
      const todayDateStr = today.toISOString().split('T')[0];
      
      let actualStartTimeISO = null;
      let actualEndTimeISO = null;
      
      if (timeData.startTime) {
        actualStartTimeISO = new Date(`${todayDateStr}T${timeData.startTime}`).toISOString();
      }
      if (timeData.endTime) {
        actualEndTimeISO = new Date(`${todayDateStr}T${timeData.endTime}`).toISOString();
      }
      
      const payload = { 
        taskId: id,
        actualStartTime: actualStartTimeISO,
        actualEndTime: actualEndTimeISO
      };
      
      console.log('Completing task with payload:', payload);
      
      await taskService.completeTask(payload);
      
      // Trigger celebration animation
      triggerCelebration();
      
      // Show celebratory toast
      toast.success('🎉 Task completed successfully!', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
        }
      });
      
      // Reset modal state
      setShowTimeModal(false);
      setTimeData({ startTime: '', endTime: '' });
      
      // Reload task details
      loadTaskDetails();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Could not complete task: ' + (error.response?.data?.message || error.response?.data?.error || error.message));
    }
  };

  const handleTimeModalCancel = () => {
    setShowTimeModal(false);
    setTimeData({ startTime: '', endTime: '' });
  };

  const handleReaction = async (updateId, emoji) => {
    try {
      await taskService.toggleReaction(id, updateId, emoji);
      loadTaskDetails(); // Reload to get updated reactions
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const getInitials = (name, email) => {
    if (name) {
      const names = name.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[1][0]}` : name.substring(0, 2);
    }
    return email ? email.substring(0, 2) : '??';
  };

  const getAvatarColor = (str) => {
    const colors = [
      'bg-gradient-to-br from-zinc-500 to-zinc-700',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-green-400 to-green-600',
      'bg-gradient-to-br from-orange-400 to-orange-600',
      'bg-gradient-to-br from-pink-400 to-pink-600',
      'bg-gradient-to-br from-indigo-400 to-indigo-600',
      'bg-gradient-to-br from-teal-400 to-teal-600',
      'bg-gradient-to-br from-red-400 to-red-600',
    ];
    const hash = (str || '').split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'text-red-600 bg-red-50',
      Medium: 'text-yellow-600 bg-yellow-50',
      Low: 'text-green-600 bg-green-50'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-muted text-foreground',
      Completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-foreground';
  };

  const getUpdateIcon = (type) => {
    switch (type) {
      case 'Comment':
        return '💬';
      case 'StatusChange':
        return '🔄';
      case 'Assignment':
        return '👤';
      case 'Update':
        return '✏️';
      default:
        return '📝';
    }
  };

  const formatUpdateMessage = (update) => {
    if (update.type === 'StatusChange') {
      return `Changed status from "${update.oldValue}" to "${update.newValue}"`;
    }
    return update.content;
  };

  const isAssignedToMe = task?.assignedTo?._id === user?._id || task?.assignedTo?._id === user?.uid;
  const isCreatedByMe = task?.createdBy?._id === user?._id || task?.createdBy?._id === user?.uid;
  const canReassign = isCreatedByMe || user?.role === 'Admin' || user?.role === 'Manager';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">Task not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-accent hover:text-foreground"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm sm:text-base cursor-pointer"
        >
          <FiArrowLeft size={20} />
          Back
        </button>
        
        {/* Edit Button - Only show if user is the creator or Admin */}
        {(isCreatedByMe || user?.role === 'Admin') && (
          <button
            onClick={() => navigate(`/edit-task/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base rounded-lg transition-colors w-full sm:w-auto justify-center cursor-pointer shadow-xs font-medium"
          >
            <FiEdit size={18} />
            Edit Task
          </button>
        )}
      </motion.div>

      {/* Task Details Card */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-border p-4 sm:p-6 transition-shadow duration-300"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
          <div className="flex-1 w-full">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3">{task.title}</h1>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-xs ${getPriorityColor(task.priority)}`}>
                {task.priority} Priority
              </span>
              <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-xs ${getStatusColor(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>

          {/* Status Change Buttons - Only show if assigned to me */}
          {isAssignedToMe && task.status !== 'Completed' && (
            <div className="flex gap-2 w-full sm:w-auto">
              {task.status === 'Pending' && (
                <button
                  onClick={() => handleStatusChange('In Progress')}
                  className="px-3 sm:px-4 py-2 bg-primary text-primary-foreground text-sm sm:text-base rounded-lg hover:bg-zinc-800 transition-colors flex-1 sm:flex-initial whitespace-nowrap font-medium cursor-pointer"
                >
                  Start Task
                </button>
              )}
              {task.status === 'In Progress' && (
                <button
                  onClick={() => handleStatusChange('Completed')}
                  className="px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base rounded-lg shadow-xs transition-all duration-200 flex-1 sm:flex-initial whitespace-nowrap font-medium cursor-pointer"
                >
                  Mark Complete
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
            <div className="bg-muted p-2 rounded-lg">
              <FiCalendar className="text-accent" size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Due Date</p>
              <p className="text-sm sm:text-base text-foreground font-medium">
                {moment(task.dueDate).format('MMM DD, YYYY')}
                <span className={`ml-2 text-xs sm:text-sm ${moment(task.dueDate).isBefore(moment(), 'day') && task.status !== 'Completed' ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
                  ({moment(task.dueDate).fromNow()})
                </span>
              </p>
            </div>
          </div>

          {/* Assigned To with Reassign Action */}
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-muted p-2 rounded-lg">
                  <FiUser className="text-muted-foreground" size={18} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Assigned To</p>
                  <p className="text-sm sm:text-base text-foreground font-medium">
                    {task.assignedTo?.displayName || task.assignedTo?.email}
                    {isAssignedToMe && <span className="ml-2 text-accent text-xs sm:text-sm font-semibold">(You)</span>}
                  </p>
                </div>
              </div>

              {canReassign && !showReassignDropdown && (
                <button
                  type="button"
                  onClick={() => setShowReassignDropdown(true)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer flex items-center gap-1"
                >
                  <FiUserPlus className="text-xs" />
                  <span>Reassign</span>
                </button>
              )}
            </div>

            {/* Inline Reassign Selector */}
            {canReassign && showReassignDropdown && (
              <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 flex-wrap">
                <select
                  disabled={reassigning}
                  defaultValue=""
                  onChange={(e) => handleReassign(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-border bg-white dark:bg-neutral-900 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="" disabled>Select team member to assign...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id} disabled={u._id === task.assignedTo?._id}>
                      {u.displayName || u.email} {u._id === task.assignedTo?._id ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowReassignDropdown(false)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
              <FiUser className="text-emerald-600 dark:text-emerald-400" size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Created By</p>
              <p className="text-sm sm:text-base text-foreground font-medium">
                {task.createdBy?.displayName || task.createdBy?.email}
                {isCreatedByMe && <span className="ml-2 text-accent text-xs sm:text-sm font-semibold">(You)</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
            <div className="bg-muted p-2 rounded-lg">
              <FiClock className="text-muted-foreground" size={18} />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Created</p>
              <p className="text-sm sm:text-base text-foreground font-medium">{moment(task.createdAt).format('MMM DD, YYYY')}</p>
            </div>
          </div>

          {/* Show actual time tracking if task is completed */}
          {task.status === 'Completed' && (task.actualStartTime || task.actualEndTime) && (
            <>
              {task.actualStartTime && (
                <div className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
                  <div className="bg-cyan-500/10 border border-cyan-500/20 p-2 rounded-lg">
                    <FiClock className="text-cyan-600 dark:text-cyan-400" size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Work Started</p>
                    <p className="text-sm sm:text-base text-foreground font-medium">
                      {moment(task.actualStartTime).format('MMM DD, YYYY h:mm A')}
                    </p>
                  </div>
                </div>
              )}
              {task.actualEndTime && (
                <div className="flex items-center gap-2 sm:gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
                  <div className="bg-teal-500/10 border border-teal-500/20 p-2 rounded-lg">
                    <FiClock className="text-teal-600 dark:text-teal-400" size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Work Finished</p>
                    <p className="text-sm sm:text-base text-foreground font-medium">
                      {moment(task.actualEndTime).format('MMM DD, YYYY h:mm A')}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-accent rounded-full"></div>
              Description
            </h3>
            <p className="text-sm sm:text-base text-foreground/90 whitespace-pre-wrap leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl border border-border">{task.description}</p>
          </div>
        )}

        {/* Subtasks */}
        {(task.subtasks?.length > 0 || isAssignedToMe || isCreatedByMe) && (
          <div className="border-t border-border pt-4 mt-4">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="w-1 h-5 bg-accent rounded-full"></div>
              Follow-up Subtasks
            </h3>
            
            <div className="space-y-2 mb-4">
              {task.subtasks?.map((st) => (
                <div key={st._id} className="flex items-center justify-between p-2.5 sm:p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input 
                      type="checkbox" 
                      checked={st.isCompleted} 
                      onChange={() => handleToggleSubtask(st._id)}
                      disabled={!isAssignedToMe && !isCreatedByMe}
                      className="w-4 h-4 text-primary rounded border-border focus:ring-primary/40 cursor-pointer accent-primary"
                    />
                    <span className={`text-sm sm:text-base text-foreground truncate ${st.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {st.title}
                    </span>
                  </div>
                  {(isAssignedToMe || isCreatedByMe) && (
                    <button 
                      onClick={() => handleDeleteSubtask(st._id)}
                      className="ml-2 text-muted-foreground hover:text-rose-500 p-1 cursor-pointer transition-colors"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              
              {task.subtasks?.length === 0 && (
                <p className="text-sm text-muted-foreground italic p-2">No subtasks added yet.</p>
              )}
            </div>

            {(isAssignedToMe || isCreatedByMe) && task.status !== 'Completed' && (
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="flex-1 px-3.5 py-2 text-sm border border-border rounded-lg bg-neutral-50 dark:bg-neutral-950 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="submit"
                  disabled={!newSubtask.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>

      {/* Comments Section */}
      <motion.div 
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xs border border-border p-4 sm:p-6 transition-shadow duration-300"
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <div className="bg-muted p-2 rounded-lg">
            <FiMessageSquare className="text-accent" size={20} />
          </div>
          Activity & Comments
        </h2>

        {/* Add Comment Form - Show for both assignee and creator */}
        {(isAssignedToMe || isCreatedByMe) && (
          <form onSubmit={handleAddComment} className="mb-4 sm:mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isAssignedToMe ? "Add a comment or update..." : "Add a follow-up comment..."}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-border rounded-xl bg-neutral-50 dark:bg-neutral-950 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none"
              rows="3"
            />
            <div className="flex justify-end mt-2 sm:mt-3">
              <button
                type="submit"
                disabled={submitting || !comment.trim()}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-primary-foreground text-sm sm:text-base rounded-lg hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer shadow-xs"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        )}

        {/* Updates/Comments List */}
        <AnimatePresence>
          <div className="space-y-3 sm:space-y-4">
          {updates.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="bg-neutral-100 dark:bg-neutral-800 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiMessageSquare className="text-muted-foreground" size={32} />
              </div>
              <p className="text-muted-foreground text-sm sm:text-base">No comments or updates yet</p>
              <p className="text-muted-foreground/60 text-xs sm:text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            updates.map((update, index) => {
              const isAssignment = update.type === 'Assignment';
              const isStatusChange = update.type === 'StatusChange';

              return (
                <motion.div 
                  key={update._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-xl border transition-shadow duration-200 ${
                    isAssignment 
                      ? 'bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/20' 
                      : isStatusChange
                        ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/20'
                        : 'bg-neutral-50 dark:bg-neutral-950 border-border hover:shadow-xs'
                  }`}
                >
                  {/* User Avatar */}
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0 shadow-xs ring-2 ring-border ${getAvatarColor(update.userId?.email || update.userId?.displayName)}`}
                  >
                    {getInitials(update.userId?.displayName, update.userId?.email).toUpperCase()}
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <span className="font-semibold text-foreground text-sm sm:text-base truncate">
                        {update.userId?.displayName || update.userId?.email}
                      </span>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        {isAssignment && (
                          <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full font-bold border border-blue-500/20">
                            Reassignment
                          </span>
                        )}
                        {update.userId?._id === task.assignedTo?._id && (
                          <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full font-medium">Assignee</span>
                        )}
                        {update.userId?._id === task.createdBy?._id && (
                          <span className="text-xs bg-muted text-foreground px-2 py-0.5 rounded-full font-medium">Creator</span>
                        )}
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {moment(update.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-foreground/90 break-words leading-relaxed">
                      {isAssignment && <span className="font-medium text-blue-600 dark:text-blue-400 mr-1.5">👤</span>}
                      {formatUpdateMessage(update)}
                    </p>
                    
                    {/* Reactions */}
                    {!isAssignment && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {/* Quick Reaction Buttons */}
                        <div className="flex gap-1">
                          {['👍', '👏', '❤️', '🎉', '🔥'].map((emoji) => {
                            const reactors = update.reactions?.get?.(emoji) || [];
                            const hasReacted = reactors.includes(user?._id || user?.uid);
                            return (
                              <motion.button
                                key={emoji}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReaction(update._id, emoji)}
                                className={`px-2 py-1 rounded-full text-sm transition-all cursor-pointer ${
                                  hasReacted 
                                    ? 'bg-primary/10 border-2 border-primary' 
                                    : 'bg-neutral-100 dark:bg-neutral-800 border border-border hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                              >
                                {emoji}
                                {reactors.length > 0 && (
                                  <span className={`ml-1 text-xs font-semibold ${hasReacted ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {reactors.length}
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
        </AnimatePresence>
      </motion.div>

      {/* Time Tracking Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-neutral-900 border border-border rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-2xl font-bold text-foreground mb-4">Track Your Time</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Record what time you started and finished this task today.
            </p>
            <div className="bg-neutral-50 dark:bg-neutral-950 border border-border rounded-xl p-3 mb-6">
              <p className="text-sm text-foreground flex items-center gap-2">
                <FiCalendar className="text-accent" />
                <span className="font-semibold">Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Time (Optional)
                </label>
                <input
                  type="time"
                  value={timeData.startTime}
                  onChange={(e) => setTimeData({ ...timeData, startTime: e.target.value })}
                  className="w-full border border-border rounded-lg p-2.5 bg-neutral-50 dark:bg-neutral-950 text-foreground focus:ring-2 focus:ring-primary/30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Time (Optional)
                </label>
                <input
                  type="time"
                  value={timeData.endTime}
                  onChange={(e) => setTimeData({ ...timeData, endTime: e.target.value })}
                  className="w-full border border-border rounded-lg p-2.5 bg-neutral-50 dark:bg-neutral-950 text-foreground focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If you don't provide an end time, it will be set to now.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleTimeModalCancel}
                className="flex-1 px-4 py-2.5 border border-border rounded-lg text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteWithTime}
                className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-zinc-800 font-medium transition-colors cursor-pointer shadow-xs"
              >
                Complete Task
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
