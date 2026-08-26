import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { taskService } from "../services/taskService";
import {
    FaSort,
    FaCalendarAlt,
    FaCheck,
    FaTasks,
    FaRegSadTear,
    FaSpinner,
    FaUserCircle,
    FaToggleOn,
    FaToggleOff,
    FaClock,
    FaFilter,
    FaEye,
    FaTrash,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";

export default function MyTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sortBy, setSortBy] = useState("none");
    const [selectedDate, setSelectedDate] = useState(null);
    const [pendingTasks, setPendingTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [pagePending, setPagePending] = useState(1);
    const [pageCompleted, setPageCompleted] = useState(1);
    const pageSize = 10;
    const [showCompleted, setShowCompleted] = useState(false);
    const [filterOverdue, setFilterOverdue] = useState(false);
    const [searchParams] = useSearchParams();
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [timeData, setTimeData] = useState({ startTime: '', endTime: '' });
    const [showFilters, setShowFilters] = useState(false);

    const loadTasks = async () => {
        if (!user?.email) return;
        
        try {
            setLoading(true);
            const { data } = await taskService.getMyTasks();
            setTasks(data);
            setError(null);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            setError('Failed to load tasks');
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (taskId) => {
        if (!user?.email) return;
        
        // Find the task to verify ownership
        const taskToComplete = tasks?.find(t => t._id === taskId);
        
        // Check if user is assigned to this task (assignedTo is a populated object with _id, email, displayName)
        const assignedToEmail = taskToComplete?.assignedTo?.email || taskToComplete?.assignedTo;
        if (taskToComplete && assignedToEmail && assignedToEmail !== user.email) {
            toast.error("You can only complete tasks assigned to you.");
            return;
        }
        
        // Show modal to ask for time tracking
        setSelectedTaskId(taskId);
        setShowTimeModal(true);
    };

    const handleTimeModalSubmit = async () => {
        if (!selectedTaskId || !user?.email) return;
        
        try {
            const today = new Date();
            const todayDateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
            
            let actualStartTimeISO = null;
            let actualEndTimeISO = null;
            
            // Combine today's date with the time inputs
            if (timeData.startTime) {
                actualStartTimeISO = new Date(`${todayDateStr}T${timeData.startTime}`).toISOString();
            }
            if (timeData.endTime) {
                actualEndTimeISO = new Date(`${todayDateStr}T${timeData.endTime}`).toISOString();
            }
            
            const payload = { 
                taskId: selectedTaskId,
                actualStartTime: actualStartTimeISO,
                actualEndTime: actualEndTimeISO
            };
            
            console.log('Completing task with payload:', payload);
            
            await taskService.completeTask(payload);
            toast.success("Task marked as completed!");
            loadTasks();
            
            // Reset modal state
            setShowTimeModal(false);
            setSelectedTaskId(null);
            setTimeData({ startTime: '', endTime: '' });
        } catch (e) {
            console.error('Error completing task:', e);
            toast.error("Could not complete task: " + (e.response?.data?.message || e.response?.data?.error || e.message));
        }
    };

    const handleTimeModalCancel = () => {
        setShowTimeModal(false);
        setSelectedTaskId(null);
        setTimeData({ startTime: '', endTime: '' });
    };

    // const handleDelete = async (taskId) => {
    //     if (!window.confirm("Are you sure you want to delete this task?")) return;
    //     try {
    //         await taskService.deleteTask({taskId});
    //         toast.success("Task deleted successfully!");
    //         loadTasks();
    //     } catch (e) {
    //         toast.error("Failed to delete task: " + (e.response?.data?.message || e.message));
    //     }
    // };

    // Initial data fetch
    useEffect(() => {
        if (user?.email) {
            loadTasks();
        }
    }, [user]);

    // Initialize filters based on URL query params only once on mount
    useEffect(() => {
        const view = searchParams.get("view"); // 'completed' | 'pending'
        const date = searchParams.get("date"); // 'today' or 'YYYY-MM-DD'
        const overdue = searchParams.get("overdue"); // 'true'

        if (view === "completed") setShowCompleted(true);
        if (view === "pending") setShowCompleted(false);

        if (date) {
            if (date === "today") {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setSelectedDate(today);
                setShowCompleted(false);
                setFilterOverdue(false);
            } else {
                // parse YYYY-MM-DD
                const parts = date.split("-");
                if (parts.length === 3) {
                    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                    if (!isNaN(d.getTime())) {
                        d.setHours(0,0,0,0);
                        setSelectedDate(d);
                        setShowCompleted(false);
                        setFilterOverdue(false);
                    }
                }
            }
        }

        if (overdue === "true") {
            setFilterOverdue(true);
            setShowCompleted(false);
            setSelectedDate(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!tasks) return;
        let filteredAndSortedTasks = [...tasks];

        if (selectedDate) {
            filteredAndSortedTasks = filteredAndSortedTasks.filter(
                (task) => new Date(task.dueDate).toDateString() === selectedDate.toDateString()
            );
        }

        if (filterOverdue && !selectedDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            filteredAndSortedTasks = filteredAndSortedTasks.filter(
                (task) => new Date(task.dueDate) < today && task.status !== "Completed"
            );
        }

        if (sortBy === "dueDate") {
            filteredAndSortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === "priority") {
            const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
            filteredAndSortedTasks.sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));
        } else if (sortBy === "daily") {
            filteredAndSortedTasks = filteredAndSortedTasks.filter(task => 
                task.taskFrequency === "Daily" || task.recurringTaskId?.frequency === "Daily"
            );
        } else if (sortBy === "weekly") {
            filteredAndSortedTasks = filteredAndSortedTasks.filter(task => 
                task.taskFrequency === "Weekly" || task.recurringTaskId?.frequency === "Weekly"
            );
        } else if (sortBy === "monthly") {
            filteredAndSortedTasks = filteredAndSortedTasks.filter(task => 
                task.taskFrequency === "Monthly" || task.recurringTaskId?.frequency === "Monthly"
            );
        } else if (sortBy === "all") {
            const priorityOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
            filteredAndSortedTasks.sort((a, b) => {
                const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
                if (dateDiff !== 0) return dateDiff;
                return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
            });
        }

        const pend = filteredAndSortedTasks.filter(task => task.status !== "Completed");
        const comp = filteredAndSortedTasks.filter(task => task.status === "Completed");
        setPendingTasks(pend);
        setCompletedTasks(comp);
        setPagePending(1);
        setPageCompleted(1);
    }, [tasks, sortBy, selectedDate, filterOverdue]);

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

    const getPriorityBorderColor = (priority) => {
        switch (priority) {
            case "High": return "border-red-500";
            case "Medium": return "border-orange-500";
            case "Low": return "border-cyan-500";
            default: return "border-gray-300";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-5xl text-accent mx-auto mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground">Loading your tasks...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent p-2 sm:p-3 lg:p-4">
            <motion.div
                className="max-w-4xl mx-auto mt-2 p-4 sm:p-6 bg-white dark:bg-neutral-900 rounded-xl border border-border shadow-xs relative"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="absolute inset-0 "></div>

                <motion.div className="flex items-center justify-center gap-3 mb-6" variants={itemVariants}>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-foreground drop-shadow-md flex items-center gap-2">
                        <FaTasks className="text-accent text-xl sm:text-2xl" /> Tasks
                    </h2>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 bg-muted hover:bg-border rounded-lg transition-colors duration-200 cursor-pointer"
                        title="Toggle Filters"
                    >
                        <FaFilter className="text-accent text-lg" />
                    </button>
                </motion.div>

                {showFilters && (
                <motion.div
                    className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl shadow-xs border border-border mb-4 space-y-3 relative z-10"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Sort Section */}
                    <div className="flex items-center gap-2 w-full">
                        <FaSort className="text-lg sm:text-xl text-accent flex-shrink-0" />
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="flex-1 border border-border rounded-lg px-2 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                        >
                            <option value="none">Sort: Default</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                            <option value="daily">Frequency: Daily</option>
                            <option value="weekly">Frequency: Weekly</option>
                            <option value="monthly">Frequency: Monthly</option>
                            <option value="all">Due Date & Priority</option>
                        </select>
                    </div>

                    {/* Date Filter Section */}
                    <div className="flex items-center gap-2 w-full">
                        <FaCalendarAlt className="text-lg sm:text-xl text-accent flex-shrink-0" />
                        <div className="flex-1 flex items-center gap-2">
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => setSelectedDate(date)}
                                placeholderText="Filter by Due Date"
                                className="flex-1 border border-border px-2 py-2 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/40 text-foreground bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
                                wrapperClassName="flex-1"
                            />
                            {selectedDate && (
                                <motion.button
                                    onClick={() => setSelectedDate(null)}
                                    className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 transition-colors duration-200 flex-shrink-0 cursor-pointer"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    Clear
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Completed Toggle Section */}
                    <div className="w-full">
                        <motion.button
                            onClick={() => setShowCompleted((v) => !v)}
                            className="w-full inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 border border-border text-foreground px-3 py-2 rounded-lg hover:bg-muted transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title={showCompleted ? "Show Pending Tasks" : "Show Completed Tasks"}
                        >
                            {showCompleted ? <FaToggleOn className="text-green-600" /> : <FaToggleOff className="text-neutral-400" />}
                            {showCompleted ? "Showing Completed" : "Show Completed"}
                        </motion.button>
                    </div>
                </motion.div>
                )}

                {error ? (
                    <motion.p className="text-red-600 text-center text-lg font-medium py-10">
                        <FaRegSadTear className="inline-block mr-2 text-2xl" /> {error}
                    </motion.p>
                ) : (
                    <>
                        {!showCompleted ? (
                            <>
                                <motion.h3 className="text-base font-semibold mt-4 mb-3 text-foreground">
                                    Pending Tasks
                                </motion.h3>

                                {pendingTasks.length === 0 ? (
                                    <motion.p className="text-muted-foreground italic text-center py-4">
                                        No pending tasks found. Time to relax!
                                    </motion.p>
                                ) : (
                                    <>
                                    <ul className="space-y-4">
                                        {pendingTasks
                                          .slice((pagePending - 1) * pageSize, pagePending * pageSize)
                                          .map((task, index) => (
                                            <motion.li
                                                key={task._id || index}
                                                className={`bg-white dark:bg-neutral-900 border border-border border-l-4 ${getPriorityBorderColor(task.priority)} p-3 rounded-lg shadow-sm transition-all duration-300`}
                                                variants={taskCardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                whileHover="hover"
                                            >
                                                <div>
                                                    <h4 className="text-base font-semibold text-foreground break-words">{task.title}</h4>
                                                    <p className="text-sm font-medium text-muted-foreground break-words">{task.description}</p>
                                                    {task.recurringTaskId && (
                                                        <p className="text-xs text-accent font-medium flex items-center gap-1 mt-1">
                                                            <span className="bg-muted px-2 py-1 rounded text-xs">🔁 Recurring</span>
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                                        <FaCalendarAlt className="text-muted-foreground" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        <span className={`font-bold ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                            Priority: {task.priority}
                                                        </span>
                                                    </p>
                                                    {task.createdBy && (
                                                        <p className="text-xs text-gray-600 flex items-center gap-1 min-w-0">
                                                            <FaUserCircle className="text-muted-foreground flex-shrink-0" />
                                                            <span>From:</span>
                                                            <span className="font-medium text-foreground break-all">
                                                                {task.createdBy.displayName || task.createdBy.email || task.createdBy}
                                                            </span>
                                                        </p>
                                                    )}
                                                    <div className="mt-3 flex flex-row gap-2 justify-end">
                                                        <Link
                                                            to={`/tasks/${task._id}`}
                                                            className="flex items-center justify-center bg-primary hover:bg-zinc-800 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FaEye className="sm:mr-1" /> <span className="hidden sm:inline">View Details</span>
                                                        </Link>
                                                        <motion.button
                                                            onClick={() => handleComplete(task._id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-full shadow text-xs font-medium transition-all duration-300"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title="Complete"
                                                        >
                                                            <FaCheck className="sm:mr-1" /> <span className="hidden sm:inline">Complete</span>
                                                        </motion.button>
                                                        {/* <motion.button
                                                            onClick={() => handleDelete(task._id)}
                                                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-full shadow text-xs font-medium transition-all duration-300"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            title="Delete"
                                                        >
                                                            <FaTrash className="sm:mr-1" /> <span className="hidden sm:inline">Delete</span>
                                                        </motion.button> */}
                                                    </div>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                    <Pagination
                                      page={pagePending}
                                      pageSize={pageSize}
                                      total={pendingTasks.length}
                                      onPageChange={setPagePending}
                                    />
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <motion.h3 className="text-base font-semibold mt-4 mb-3 text-foreground">
                                    Completed Tasks
                                </motion.h3>

                                {completedTasks.length === 0 ? (
                                    <motion.p className="text-gray-500 italic text-center py-4">
                                        No completed tasks yet. Keep up the good work!
                                    </motion.p>
                                ) : (
                                    <>
                                    <ul className="space-y-4">
                                        {completedTasks
                                          .slice((pageCompleted - 1) * pageSize, pageCompleted * pageSize)
                                          .map((task, index) => (
                                            <motion.li
                                                key={task._id || index}
                                                className="bg-gray-100 border-l-4 border-green-500 p-3 rounded-lg shadow-sm"
                                                variants={taskCardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <div>
                                                    <h4 className="text-base line-through font-medium text-muted-foreground break-words">{task.title}</h4>
                                                    {task.recurringTaskId && (
                                                        <p className="text-xs text-accent font-medium flex items-center gap-1 mt-1">
                                                            <span className="bg-muted px-2 py-1 rounded text-xs">🔁 Recurring</span>
                                                        </p>
                                                    )}
                                                    {task.completedAt && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <FaCheck className="text-green-500" /> Completed on: {new Date(task.completedAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                    {(task.actualStartTime || task.actualEndTime) && (
                                                        <div className="mt-1 space-y-1">
                                                            {task.actualStartTime && (
                                                                <div className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded-full border border-border">
                                                                    <FaClock className="text-muted-foreground text-xs" />
                                                                    <span className="text-xs font-medium text-foreground">
                                                                        Started: {new Date(task.actualStartTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {task.actualEndTime && (
                                                                <div className="inline-flex items-center gap-1 bg-gradient-to-r bg-muted px-2 py-1 rounded-full border border-border ml-2">
                                                                    <FaClock className="text-muted-foreground text-xs" />
                                                                    <span className="text-xs font-medium text-foreground">
                                                                        Finished: {new Date(task.actualEndTime).toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <FaCalendarAlt className="text-muted-foreground" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                    {task.createdBy && (
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 min-w-0">
                                                            <FaUserCircle className="text-muted-foreground/70 flex-shrink-0" />
                                                            <span>From:</span>
                                                            <span className="font-light break-all">
                                                                {task.createdBy.displayName || task.createdBy.email || task.createdBy}
                                                            </span>
                                                        </p>
                                                    )}
                                                    <div className="mt-3 flex justify-end">
                                                        <Link
                                                            to={`/tasks/${task._id}`}
                                                            className="flex items-center justify-center bg-primary hover:bg-zinc-800 text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FaEye className="sm:mr-1" /> <span className="hidden sm:inline">View Details</span>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </ul>
                                    <Pagination
                                      page={pageCompleted}
                                      pageSize={pageSize}
                                      total={completedTasks.length}
                                      onPageChange={setPageCompleted}
                                    />
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </motion.div>

            {/* Time Tracking Modal */}
            {showTimeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-neutral-900 border border-border rounded-xl shadow-xl max-w-md w-full p-6 text-foreground"
                    >
                        <h3 className="text-2xl font-bold text-foreground mb-4">Track Your Time</h3>
                        <p className="text-muted-foreground mb-4">
                            Record what time you started and finished this task today.
                        </p>
                        <div className="bg-muted/50 border border-border rounded-lg p-3 mb-6">
                            <p className="text-sm text-foreground flex items-center gap-2">
                                <FaCalendarAlt className="text-accent" />
                                <span className="font-semibold">Date: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    Start Time (Optional)
                                </label>
                                <input
                                    type="time"
                                    value={timeData.startTime}
                                    onChange={(e) => setTimeData({ ...timeData, startTime: e.target.value })}
                                    className="w-full border border-border rounded-lg p-2.5 bg-neutral-50 dark:bg-neutral-950 text-foreground focus:ring-2 focus:ring-accent/40 focus:border-accent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">
                                    End Time (Optional)
                                </label>
                                <input
                                    type="time"
                                    value={timeData.endTime}
                                    onChange={(e) => setTimeData({ ...timeData, endTime: e.target.value })}
                                    className="w-full border border-border rounded-lg p-2.5 bg-neutral-50 dark:bg-neutral-950 text-foreground focus:ring-2 focus:ring-accent/40 focus:border-accent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    If you don't provide an end time, it will be set to now.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleTimeModalCancel}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-muted-foreground hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTimeModalSubmit}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-zinc-800 font-medium transition-colors"
                            >
                                Complete Task
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
