import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { taskService, dashboardService } from "../services/taskService";
import { motion } from "framer-motion";
import {
  FaTasks,
  FaCalendarDay,
  FaInfoCircle,
  FaExclamationTriangle,
  FaClipboardList,
  FaUserCheck,
} from "react-icons/fa";
import toast from 'react-hot-toast';
import WhatsAppPhoneCard from "../components/WhatsAppPhoneCard";
import LoadingScreen from "../components/common/LoadingScreen";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // All state declarations MUST be at the top before any conditional returns
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [assignedByMeTasks, setAssignedByMeTasks] = useState([]);
  const [showAllToday, setShowAllToday] = useState(false);
  const [showAllOverdue, setShowAllOverdue] = useState(false);
  const [showAllFollowups, setShowAllFollowups] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  });

  // Fetch tasks when user is available
  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        taskService.getMyTasks(),
        dashboardService.getStats()
      ]);
      
      setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
      setStats(statsRes.data || {});
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard data');
      setTasks([]);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks due today and overdue tasks - only tasks assigned TO me
  useEffect(() => {
    if (!tasks || !user) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only show tasks assigned TO me (not tasks I assigned to others)
      const myTasks = tasks.filter(
        (task) => {
          if (!task || !task.assignedTo) return false;
          const assignedToId = typeof task.assignedTo === 'object' ? task.assignedTo._id : task.assignedTo;
          const assignedToEmail = typeof task.assignedTo === 'object' ? task.assignedTo.email : null;
          return assignedToId === user._id || assignedToEmail === user.email;
        }
      );

      const filteredToday = myTasks.filter(
        (task) =>
          new Date(task.dueDate).toDateString() === today.toDateString() &&
          task.status !== 'Completed'
      );
      setTodayTasks(filteredToday);

      const filteredOverdue = myTasks.filter(
        (task) => new Date(task.dueDate) < today && task.status !== 'Completed'
      );
      setOverdueTasks(filteredOverdue);
    } catch (err) {
      console.error('Error filtering tasks:', err);
      setError('Failed to process tasks');
    }
  }, [tasks, user]);

  // Get tasks assigned BY me (where I'm the creator)
  useEffect(() => {
    if (!tasks || !user) return;
    
    try {
      const tasksIAssigned = tasks.filter(
        (task) => {
          if (!task || !task.createdBy) return false;
          const createdById = typeof task.createdBy === 'object' ? task.createdBy._id : task.createdBy;
          return createdById === user._id || task.createdBy === user._id;
        }
      );
      setAssignedByMeTasks(tasksIAssigned);
    } catch (err) {
      console.error('Error filtering assigned tasks:', err);
    }
  }, [tasks, user]);

  // Framer Motion variants
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const linkButtonVariants = {
    hover: { scale: 1.05, boxShadow: "0px 4px 15px rgba(59, 130, 246, 0.3)" },
    tap: { scale: 0.95 },
  };

  // Calendar helpers - must be before conditional returns
  const fmtKey = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const startOfMonth = new Date(monthCursor);
  const endOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth()+1, 0);
  const startDay = new Date(startOfMonth);
  startDay.setDate(startOfMonth.getDate() - startOfMonth.getDay());
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    d.setHours(0,0,0,0);
    return d;
  });

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0,0,0,0);
    return t;
  }, []);

  const tasksByDate = useMemo(() => {
    const map = {};
    if (!user) return map;
    // Only include tasks assigned TO me
    (tasks || []).filter(t => {
      if (!t || !t.assignedTo) return false;
      const assignedToId = typeof t.assignedTo === 'object' ? t.assignedTo._id : t.assignedTo;
      const assignedToEmail = typeof t.assignedTo === 'object' ? t.assignedTo.email : null;
      return assignedToId === user._id || assignedToEmail === user.email;
    }).forEach(t => {
      if (!t?.dueDate) return;
      try {
        const d = new Date(t.dueDate);
        d.setHours(0,0,0,0);
        const key = fmtKey(d);
        if (!map[key]) map[key] = [];
        map[key].push(t);
      } catch (e) {
        console.error('Error processing task date:', e);
      }
    });
    return map;
  }, [tasks, user]);

  // Derived totals for progress ring
  const { totalTasks, completedPct } = useMemo(() => {
    const total = stats?.total || 0;
    const completed = stats?.completed || 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { totalTasks: total, completedPct: pct };
  }, [stats]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <motion.div
          className="bg-white p-8 rounded-xl shadow-xs border border-border max-w-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <FaExclamationTriangle className="text-red-500 text-5xl mb-4 mx-auto" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {error}
          </p>
          <motion.button
            onClick={() => {
              setError(null);
              loadDashboardData();
            }}
            className="inline-flex h-10 items-center bg-primary text-primary-foreground font-medium py-2.5 px-5 rounded-lg text-sm shadow-xs hover:bg-zinc-800 active:bg-zinc-950 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Conditional rendering for unauthenticated user
  if (!user && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
        <motion.div
          className="bg-white p-8 rounded-xl shadow-xs border border-border max-w-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <FaInfoCircle className="text-red-500 text-5xl mb-4 mx-auto" />
          <h2 className="text-xl font-semibold tracking-tight text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            You need to be logged in to view this page.
          </p>
          <Link to="/login">
            <motion.button
              className="inline-flex h-10 items-center bg-primary text-primary-foreground font-medium py-2.5 px-5 rounded-lg text-sm shadow-xs hover:bg-zinc-800 active:bg-zinc-950 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Go to Login
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (loading || authLoading) {
    return <LoadingScreen message="Loading dashboard analytics..." submessage="Fetching metrics, attendance, and tasks" />;
  }

  return (
    <div className="min-h-screen bg-transparent p-2 sm:p-4 lg:p-6">
      <motion.div
        className="max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 bg-white dark:bg-neutral-900 rounded-xl border border-border shadow-xs relative"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-xl sm:text-2xl font-semibold tracking-tight mb-4 sm:mb-5 text-foreground flex items-center gap-2 relative z-10"
          variants={itemVariants}
        >
          <FaTasks className="text-accent text-lg sm:text-xl" /> Your Dashboard
        </motion.h2>

        {/* WhatsApp phone number settings */}
        <div className="mb-3 sm:mb-4 relative z-10">
          <WhatsAppPhoneCard user={user} />
        </div>

        {/* TODAY'S TASKS & OVERDUE TASKS AT TOP - Side by side on larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 relative z-10">
          {/* Today's Due Tasks Section */}
          <motion.div
            className="p-3 sm:p-4 bg-neutral-50/70 dark:bg-neutral-950/50 rounded-xl border border-border shadow-xs"
            variants={itemVariants}
          >
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <FaCalendarDay className="text-xs" /> Today's Due Tasks
              </span>
              <Link to="/my-tasks" className="text-xs font-medium text-accent hover:underline">View all</Link>
            </h3>
            {todayTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">
                No tasks are due today. Enjoy your day!
              </p>
            ) : (
              <>
                <ul className="space-y-1.5 sm:space-y-2">
                  {(showAllToday ? todayTasks : todayTasks.slice(0, 3)).map((task, index) => (
                  <motion.li
                    key={task._id || index}
                    className="border border-border p-2 sm:p-2.5 rounded-lg bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-muted/40 transition-colors duration-150 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                  >
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                      {task.title}
                    </p>
                    <div className="grid grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground">
                      <p>
                        <strong>By:</strong>{" "}
                        <span className="font-medium text-foreground">
                          {task.createdBy && typeof task.createdBy === 'object'
                            ? (task.createdBy.displayName || task.createdBy.email || 'Unknown')
                            : (task.createdBy || 'Unknown')}
                        </span>
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className={`font-medium ${task.status === 'Completed' ? 'text-green-600' : task.status === 'In Progress' ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {task.status || 'Pending'}
                        </span>
                      </p>
                      <p>
                        <strong>Due:</strong>{" "}
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Priority:</strong>{" "}
                        <span className={`font-medium ${task.priority === 'High' || task.priority === 'Urgent' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {task.priority}
                        </span>
                      </p>
                    </div>
                    
                  </motion.li>
                ))}
                </ul>
                {todayTasks.length > 3 && (
                  <button
                    onClick={() => setShowAllToday(!showAllToday)}
                    className="w-full mt-2 py-1.5 text-xs text-accent font-medium hover:bg-muted rounded-md transition-colors"
                  >
                    {showAllToday ? "Show Less" : `Load More (${todayTasks.length - 3} more)`}
                  </button>
                )}
              </>
            )}
          </motion.div>

          {/* Overdue Tasks Section */}
          <motion.div
            className="p-3 sm:p-4 bg-neutral-50/70 dark:bg-neutral-950/50 rounded-xl border border-border shadow-xs"
            variants={itemVariants}
          >
            <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <FaExclamationTriangle className="text-xs text-amber-500" /> Overdue Tasks
              </span>
              <Link to="/my-tasks" className="text-xs font-medium text-accent hover:underline">View all</Link>
            </h3>
            {overdueTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">
                No overdue tasks. Great job!
              </p>
            ) : (
              <>
                <ul className="space-y-1.5 sm:space-y-2">
                  {(showAllOverdue ? overdueTasks : overdueTasks.slice(0, 3)).map((task, index) => (
                  <motion.li
                    key={task._id || index}
                    className="border border-border p-2 sm:p-2.5 rounded-lg bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-muted/40 transition-colors duration-150 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                  >
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                      {task.title}
                    </p>
                    <div className="grid grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground">
                      <p>
                        <strong>By:</strong>{" "}
                        <span className="font-medium text-foreground">
                          {task.createdBy && typeof task.createdBy === 'object'
                            ? (task.createdBy.displayName || task.createdBy.email || 'Unknown')
                            : (task.createdBy || 'Unknown')}
                        </span>
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        <span className={`font-medium ${task.status === 'Completed' ? 'text-green-600' : task.status === 'In Progress' ? 'text-yellow-600' : 'text-gray-600'}`}>
                          {task.status || 'Pending'}
                        </span>
                      </p>
                      <p>
                        <strong>Due:</strong>{" "}
                        <span className="text-red-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </p>
                      <p>
                        <strong>Priority:</strong>{" "}
                        <span className={`font-medium ${task.priority === 'High' || task.priority === 'Urgent' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {task.priority}
                        </span>
                      </p>
                    </div>
                  </motion.li>
                ))}
                </ul>
                {overdueTasks.length > 3 && (
                  <button
                    onClick={() => setShowAllOverdue(!showAllOverdue)}
                    className="w-full mt-2 py-1.5 text-xs text-accent font-medium hover:bg-muted rounded-md transition-colors"
                  >
                    {showAllOverdue ? "Show Less" : `Load More (${overdueTasks.length - 3} more)`}
                  </button>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* CALENDAR SECTION */}
        <motion.div
          className="mb-3 sm:mb-4 p-3 sm:p-4 bg-neutral-50/70 dark:bg-neutral-950/50 rounded-xl border border-border shadow-xs relative z-10"
          variants={itemVariants}
        >
          <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center gap-2">
            <FaCalendarDay className="text-xs" /> Calendar
          </h3>
          
          {/* Completion Progress Ring */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="hsl(240 5.9% 90%)" strokeWidth="12" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="hsl(238 55% 60%)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${((100 - completedPct) / 100) * (2 * Math.PI * 42)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-semibold text-foreground">{completedPct}%</span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[10px] sm:text-xs text-muted-foreground">Overall completion</p>
              <p className="text-sm sm:text-base font-semibold text-foreground">{stats?.completed || 0} / {totalTasks}</p>
            </div>
          </div>

          {/* Month selector */}
          <div className="flex items-center justify-between mb-3">
            <button
              className="h-8 px-2.5 sm:px-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
            >
              Prev
            </button>
            <div className="font-medium text-sm sm:text-base text-foreground">
              {monthCursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </div>
            <button
              className="h-8 px-2.5 sm:px-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
            >
              Next
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((d, idx) => {
              const key = fmtKey(d);
              const dayTasks = tasksByDate[key] || [];
              const pending = dayTasks.filter(t => t.status !== 'Completed');
              const completed = dayTasks.filter(t => t.status === 'Completed');
              const isCurrentMonth = d.getMonth() === monthCursor.getMonth();
              const isToday = d.getTime() === today.getTime();
              const isOverdueDay = d < today && pending.length > 0;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(`/my-tasks?date=${key}`)}
                  className={`relative h-10 sm:h-12 rounded-md border text-left p-0.5 sm:p-1 flex flex-col justify-between transition-colors cursor-pointer
                    ${isCurrentMonth ? 'bg-white dark:bg-neutral-900 border-border text-foreground' : 'bg-muted/40 border-border/60 text-muted-foreground/50'}
                    ${isToday ? 'ring-2 ring-accent/50 border-accent/40' : ''}
                    hover:bg-muted/70`}
                  title={`${pending.length} pending, ${completed.length} completed`}
                >
                  <div className="text-[10px] sm:text-xs font-semibold">{d.getDate()}</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {pending.length > 0 && (
                      <span className={`inline-flex items-center justify-center text-[8px] sm:text-[10px] min-w-[14px] sm:min-w-[16px] h-3 sm:h-4 px-0.5 sm:px-1 rounded-full ${isOverdueDay ? 'bg-red-500 text-white' : 'bg-accent text-white'}`}>{pending.length}</span>
                    )}
                    {completed.length > 0 && (
                      <span className="inline-flex items-center justify-center text-[8px] sm:text-[10px] min-w-[14px] sm:min-w-[16px] h-3 sm:h-4 px-0.5 sm:px-1 rounded-full bg-green-500 text-white">{completed.length}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center text-[10px] sm:text-xs mt-3 sm:mt-4 text-muted-foreground gap-2 sm:gap-4">
            <div className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-accent inline-block"></span> Pending</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500 inline-block"></span> Completed</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500 inline-block"></span> Overdue pending</div>
          </div>

          {/* Quick Filters */}
          <div className="mt-2 sm:mt-3 grid grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-2">
            <Link to="/my-tasks">
              <motion.button
                className="w-full bg-white dark:bg-neutral-900 border border-border text-foreground px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                View All Tasks
              </motion.button>
            </Link>
            <Link to="/recurring-tasks">
              <motion.button
                className="w-full bg-white dark:bg-neutral-900 border border-border text-foreground px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Recurring Reminders
              </motion.button>
            </Link>
            <Link to="/follow-ups">
              <motion.button
                className="w-full bg-white dark:bg-neutral-900 border border-border text-foreground px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                variants={linkButtonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Follow Ups
              </motion.button>
            </Link>
            {user?.role === 'Admin' && (
              <Link to="/admin">
                <motion.button
                  className="w-full bg-white dark:bg-neutral-900 border border-border text-foreground px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-muted transition-colors cursor-pointer"
                  variants={linkButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Admin Panel
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>

        {/* FOLLOWUPS - TASKS ASSIGNED BY ME */}
        <motion.div
          className="mb-3 sm:mb-4 p-3 sm:p-4 bg-neutral-50/70 dark:bg-neutral-950/50 rounded-xl border border-border shadow-xs relative z-10"
          variants={itemVariants}
        >
          <h3 className="text-sm font-semibold mb-3 text-foreground flex items-center justify-between gap-2">
            <span className="flex items-center gap-1">
              <FaUserCheck className="text-xs" /> Follow Ups
            </span>
            <Link to="/follow-ups" className="text-xs font-medium text-accent hover:underline">View all</Link>
          </h3>
          {assignedByMeTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-xs sm:text-sm">
              You haven't assigned any tasks yet.
            </p>
          ) : (
            <>
              <ul className="space-y-1.5 sm:space-y-2">
                {(showAllFollowups ? assignedByMeTasks : assignedByMeTasks.slice(0, 3)).map((task, index) => (
                <motion.li
                  key={task._id || index}
                  className="border border-border p-2 sm:p-2.5 rounded-lg bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 hover:bg-muted/40 transition-colors duration-150 cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => task?._id && navigate(`/tasks/${task._id}`)}
                >
                  <p className="text-xs sm:text-sm font-medium text-foreground mb-1">
                    {task.title}
                  </p>
                  <div className="grid grid-cols-2 gap-y-0.5 text-[10px] sm:text-xs text-muted-foreground">
                    <p>
                      <strong>To:</strong> {typeof task.assignedTo === 'object' 
                        ? (task.assignedTo?.displayName || task.assignedTo?.email || 'Unknown')
                        : 'Unknown'}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`font-medium ${
                          task.status === 'Completed'
                            ? "text-green-600"
                            : task.status === "In Progress"
                            ? "text-yellow-600"
                            : "text-gray-600"
                        }`}
                      >
                        {task.status || "Pending"}
                      </span>
                    </p>
                    <p>
                      <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Priority:</strong>{" "}
                      <span
                        className={`font-medium ${
                          task.priority === "High" || task.priority === "Urgent"
                            ? "text-red-500"
                            : task.priority === "Medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
            {assignedByMeTasks.length > 3 && (
              <button
                onClick={() => setShowAllFollowups(!showAllFollowups)}
                className="w-full mt-2 py-1.5 text-xs text-accent font-medium hover:bg-muted rounded-md transition-colors"
              >
                {showAllFollowups ? "Show Less" : `Load More (${assignedByMeTasks.length - 3} more)`}
              </button>
            )}
          </>
        )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
