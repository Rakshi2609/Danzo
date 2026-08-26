import { useState, useEffect } from 'react';
import { recurringTaskService, userService } from '../services/taskService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaSync, FaSpinner, FaCalendarAlt, FaUserCircle, FaFlag, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function RecurringTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tasksRes = await recurringTaskService.getAll();
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNow = async () => {
    const loadingToast = toast.loading('Generating tasks from recurring reminders...');
    try {
      const response = await recurringTaskService.triggerNow();
      toast.dismiss(loadingToast);
      const { generated = 0, skipped = 0 } = response.data || {};
      toast.success(`Generated ${generated} new task(s) (${skipped} already up-to-date)!`);
      loadData();
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Failed to trigger tasks:', error);
      toast.error(error.response?.data?.error || 'Failed to generate tasks');
    }
  };

  const getFrequencyColor = (frequency) => {
    switch (frequency) {
      case 'Daily': return 'bg-muted text-foreground';
      case 'Weekly': return 'bg-muted text-foreground';
      case 'Monthly': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-500';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const taskCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    hover: { scale: 1.02, boxShadow: "0px 6px 20px rgba(59, 130, 246, 0.15)" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-accent mx-auto mb-4" />
          <p className="text-xl font-semibold text-muted-foreground">Loading recurring reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-2 sm:p-3 lg:p-4">
      <motion.div
        className="max-w-4xl mx-auto mt-2 p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-xl border border-border shadow-xs relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 "></div>

        <motion.div className="flex items-center justify-between mb-6" variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground drop-shadow-md flex items-center gap-2">
            <FaSync className="text-accent text-2xl sm:text-3xl" /> Recurring Reminders
          </h2>
          <motion.button
            onClick={handleTriggerNow}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs text-sm font-medium cursor-pointer"
          >
            <FaSync className="text-sm" />
            <span className="hidden sm:inline">Generate Now</span>
          </motion.button>
        </motion.div>

        <motion.div 
          className="bg-neutral-50 dark:bg-neutral-950 p-3 sm:p-4 rounded-xl shadow-xs border border-border mb-6 relative z-10"
          variants={itemVariants}
        >
          <p className="text-sm text-foreground leading-relaxed">
            <strong>About Recurring Reminders:</strong> These reminders automatically create tasks daily at 9 PM. Click "Generate Now" to manually create tasks. You have <strong>{tasks.length}</strong> recurring {tasks.length === 1 ? 'reminder' : 'reminders'}.
          </p>
        </motion.div>

        {tasks.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            variants={itemVariants}
          >
            <FaSync className="text-6xl text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Recurring Reminders Yet</h3>
            <p className="text-muted-foreground">Create your first recurring reminder to automate task generation</p>
          </motion.div>
        ) : (
          <ul className="space-y-4">
            {tasks.map((task, index) => (
              <motion.li
                key={task._id || index}
                className="bg-white dark:bg-neutral-900 border border-border border-l-4 border-l-accent p-4 rounded-lg shadow-sm relative z-10"
                variants={taskCardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h4 className="text-base font-semibold text-foreground break-words">{task.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getFrequencyColor(task.frequency)}`}>
                      {task.frequency}
                    </span>
                    {task.taskTemplate?.priority && (
                      <span className={`text-xs font-bold ${getPriorityColor(task.taskTemplate.priority)}`}>
                        <FaFlag className="inline mr-1" />{task.taskTemplate.priority}
                      </span>
                    )}
                    {!task.isActive && (
                      <span className="text-xs bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400 px-2 py-1 rounded font-medium">Paused</span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2 break-words italic">"{task.description}"</p>
                  )}
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <FaUserCircle className="text-muted-foreground" />
                      <span>Assigned to:</span>
                      <span className="font-semibold text-foreground">{task.assignedTo?.displayName || task.assignedTo?.email}</span>
                    </p>
                    
                    <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                      <FaCalendarAlt className="text-muted-foreground" />
                      <span><strong>From:</strong> {format(new Date(task.startDate), 'MMM dd, yyyy')}</span>
                      <span className="mx-1">•</span>
                      <span><strong>To:</strong> {task.endDate ? format(new Date(task.endDate), 'MMM dd, yyyy') : 'No end date'}</span>
                    </p>
                    
                    {(task.taskTemplate?.startTime || task.taskTemplate?.endTime) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FaClock className="text-emerald-500" />
                        <span><strong>Time:</strong></span>
                        {task.taskTemplate.startTime && <span>{task.taskTemplate.startTime}</span>}
                        {task.taskTemplate.startTime && task.taskTemplate.endTime && <span> - </span>}
                        {task.taskTemplate.endTime && <span>{task.taskTemplate.endTime}</span>}
                      </p>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
