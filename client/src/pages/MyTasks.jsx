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
    FaSearch,
    FaTimes,
    FaSyncAlt,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../components/Pagination";
import moment from "moment";

export default function MyTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("dueDate");
    const [selectedDate, setSelectedDate] = useState(null);
    const [filterPriority, setFilterPriority] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [filterOverdue, setFilterOverdue] = useState(false);
    const [showCompleted, setShowCompleted] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const [pendingTasks, setPendingTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [pagePending, setPagePending] = useState(1);
    const [pageCompleted, setPageCompleted] = useState(1);
    const pageSize = 10;

    const [searchParams] = useSearchParams();
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [timeData, setTimeData] = useState({ startTime: '', endTime: '' });

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
        
        const taskToComplete = tasks?.find(t => t._id === taskId);
        const assignedToEmail = taskToComplete?.assignedTo?.email || taskToComplete?.assignedTo;
        if (taskToComplete && assignedToEmail && assignedToEmail !== user.email) {
            toast.error("You can only complete tasks assigned to you.");
            return;
        }
        
        setSelectedTaskId(taskId);
        setShowTimeModal(true);
    };

    const handleTimeModalSubmit = async () => {
        if (!selectedTaskId || !user?.email) return;
        
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
                taskId: selectedTaskId,
                actualStartTime: actualStartTimeISO,
                actualEndTime: actualEndTimeISO
            };
            
            await taskService.completeTask(payload);
            toast.success("Task marked as completed!");
            loadTasks();
            
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

    useEffect(() => {
        if (user?.email) {
            loadTasks();
        }
    }, [user]);

    useEffect(() => {
        const view = searchParams.get("view");
        const date = searchParams.get("date");
        const overdue = searchParams.get("overdue");

        if (view === "completed") setShowCompleted(true);
        if (date === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            setSelectedDate(today);
        }
        if (overdue === "true") setFilterOverdue(true);
    }, []);

    useEffect(() => {
        if (!tasks) return;
        let result = [...tasks];

        if (searchTerm.trim()) {
            const query = searchTerm.toLowerCase();
            result = result.filter(task => 
                task.title?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.createdBy?.displayName?.toLowerCase().includes(query) ||
                task.createdBy?.email?.toLowerCase().includes(query) ||
                task.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        if (selectedDate) {
            const targetDateStr = moment(selectedDate).format('YYYY-MM-DD');
            result = result.filter(task => 
                moment(task.dueDate).format('YYYY-MM-DD') === targetDateStr
            );
        }

        if (filterOverdue && !selectedDate) {
            const today = moment().startOf('day');
            result = result.filter(task => 
                moment(task.dueDate).isBefore(today) && task.status !== "Completed"
            );
        }

        if (filterStatus !== "all") {
            result = result.filter(task => task.status === filterStatus);
        }

        if (filterPriority !== "all") {
            result = result.filter(task => task.priority === filterPriority);
        }

        if (filterType === "recurring") {
            result = result.filter(task => !!task.recurringTaskId);
        } else if (filterType === "regular") {
            result = result.filter(task => !task.recurringTaskId);
        } else if (filterType === "daily") {
            result = result.filter(task => 
                task.taskFrequency === "Daily" || task.recurringTaskId?.frequency === "Daily"
            );
        } else if (filterType === "weekly") {
            result = result.filter(task => 
                task.taskFrequency === "Weekly" || task.recurringTaskId?.frequency === "Weekly"
            );
        } else if (filterType === "monthly") {
            result = result.filter(task => 
                task.taskFrequency === "Monthly" || task.recurringTaskId?.frequency === "Monthly"
            );
        }

        const priorityOrder = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
        if (sortBy === "dueDate") {
            result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        } else if (sortBy === "dueDateDesc") {
            result.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
        } else if (sortBy === "priority") {
            result.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
        } else if (sortBy === "title") {
            result.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (sortBy === "created") {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (sortBy === "all") {
            result.sort((a, b) => {
                const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
                if (dateDiff !== 0) return dateDiff;
                return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
            });
        }

        const pend = result.filter(task => task.status !== "Completed");
        const comp = result.filter(task => task.status === "Completed");
        setPendingTasks(pend);
        setCompletedTasks(comp);
        setPagePending(1);
        setPageCompleted(1);
    }, [tasks, searchTerm, sortBy, selectedDate, filterOverdue, filterPriority, filterStatus, filterType]);

    const activeFiltersCount = [
        searchTerm ? 1 : 0,
        selectedDate ? 1 : 0,
        filterOverdue ? 1 : 0,
        filterPriority !== "all" ? 1 : 0,
        filterStatus !== "all" ? 1 : 0,
        filterType !== "all" ? 1 : 0,
        sortBy !== "dueDate" ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const handleResetFilters = () => {
        setSearchTerm("");
        setSelectedDate(null);
        setFilterOverdue(false);
        setFilterPriority("all");
        setFilterStatus("all");
        setFilterType("all");
        setSortBy("dueDate");
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
        hover: { scale: 1.01, boxShadow: "0px 6px 20px rgba(59, 130, 246, 0.15)" },
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
                    <FaSpinner className="animate-spin text-6xl text-accent mx-auto mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground">Loading tasks...</p>
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

                <motion.div className="flex items-center justify-between mb-6" variants={itemVariants}>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground drop-shadow-md flex items-center gap-2">
                        <FaTasks className="text-accent text-xl sm:text-2xl" /> My Tasks
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                                showFilters 
                                    ? 'bg-primary text-primary-foreground border-primary' 
                                    : 'bg-muted hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border-border'
                            }`}
                            title="Toggle Filters"
                        >
                            <FaFilter className="text-xs" />
                            <span>Filters</span>
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                        {activeFiltersCount > 0 && (
                            <button
                                onClick={handleResetFilters}
                                className="px-2.5 py-1.5 rounded-lg border border-border text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer font-medium"
                                title="Reset all filters"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </motion.div>

                {showFilters && (
                <motion.div
                    className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl shadow-xs border border-border mb-5 space-y-3 relative z-30"
                    variants={itemVariants}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center gap-2 w-full">
                        <FaSearch className="text-muted-foreground flex-shrink-0 text-sm" />
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search tasks by title, description, tags, or creator..."
                                className="flex-1 border border-border px-3 py-2 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground bg-white dark:bg-neutral-900 placeholder:text-muted-foreground/60 transition-colors"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="text-muted-foreground hover:text-foreground text-xs p-1 cursor-pointer"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground bg-white dark:bg-neutral-900 cursor-pointer"
                            >
                                <option value="all">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Priority</label>
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="w-full border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground bg-white dark:bg-neutral-900 cursor-pointer"
                            >
                                <option value="all">All Priorities</option>
                                <option value="Urgent">🚨 Urgent</option>
                                <option value="High">🔴 High</option>
                                <option value="Medium">🟡 Medium</option>
                                <option value="Low">🟢 Low</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Type / Frequency</label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground bg-white dark:bg-neutral-900 cursor-pointer"
                            >
                                <option value="all">All Types</option>
                                <option value="regular">Regular Tasks</option>
                                <option value="recurring">🔁 Recurring Only</option>
                                <option value="daily">Daily Schedule</option>
                                <option value="weekly">Weekly Schedule</option>
                                <option value="monthly">Monthly Schedule</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full border border-border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground bg-white dark:bg-neutral-900 cursor-pointer"
                            >
                                <option value="dueDate">Due Date (Earliest)</option>
                                <option value="dueDateDesc">Due Date (Latest)</option>
                                <option value="priority">Priority (High to Low)</option>
                                <option value="title">Title (A-Z)</option>
                                <option value="created">Recently Created</option>
                                <option value="all">Due Date & Priority</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-border">
                        <div className="flex items-center gap-2 w-full sm:w-auto relative">
                            <FaCalendarAlt className="text-muted-foreground text-xs flex-shrink-0" />
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date) => {
                                    setSelectedDate(date);
                                    setFilterOverdue(false);
                                }}
                                placeholderText="Filter by Due Date"
                                popperClassName="!z-[99999]"
                                popperPlacement="bottom-start"
                                portalId="root"
                                className="border border-border px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground bg-white dark:bg-neutral-900 cursor-pointer w-36"
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate(null)}
                                    className="text-rose-500 hover:text-rose-700 text-xs px-1.5 py-0.5 cursor-pointer font-medium"
                                >
                                    Clear Date
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    setSelectedDate(today);
                                    setFilterOverdue(false);
                                }}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                                    selectedDate && moment(selectedDate).isSame(moment(), 'day')
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-white dark:bg-neutral-900 border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                                Today
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setFilterOverdue(!filterOverdue);
                                    setSelectedDate(null);
                                }}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                                    filterOverdue
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : 'bg-white dark:bg-neutral-900 border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                                ⚠️ Overdue
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowCompleted((v) => !v)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                                    showCompleted
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white dark:bg-neutral-900 border-border text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                }`}
                            >
                                {showCompleted ? <FaToggleOn /> : <FaToggleOff />}
                                <span>{showCompleted ? "Completed" : "Show Completed"}</span>
                            </button>
                        </div>
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
                                                        <p className="text-xs text-foreground font-medium flex items-center gap-1 mt-1">
                                                            <span className="bg-muted px-2 py-1 rounded text-xs">🔁 Recurring</span>
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                        <FaCalendarAlt className="text-muted-foreground" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className={`font-bold ${task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                            Priority: {task.priority}
                                                        </span>
                                                    </p>
                                                    {task.createdBy && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
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
                                    <motion.p className="text-muted-foreground italic text-center py-4">
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
                                                className="bg-neutral-50 dark:bg-neutral-900 border border-border border-l-4 border-l-emerald-500 p-3 rounded-lg shadow-xs"
                                                variants={taskCardVariants}
                                                initial="hidden"
                                                animate="visible"
                                                whileHover={{ scale: 1.01 }}
                                            >
                                                <div>
                                                    <h4 className="text-base line-through font-medium text-muted-foreground break-words">{task.title}</h4>
                                                    {task.recurringTaskId && (
                                                        <p className="text-xs text-foreground font-medium flex items-center gap-1 mt-1">
                                                            <span className="bg-muted px-2 py-1 rounded text-xs">🔁 Recurring</span>
                                                        </p>
                                                    )}
                                                    {task.completedAt && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                            <FaCheck className="text-emerald-500" /> Completed on: {new Date(task.completedAt).toLocaleDateString()}
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
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <FaCalendarAlt className="text-muted-foreground" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                                                    </p>
                                                    {task.createdBy && (
                                                        <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
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
                                <p className="text-xs text-muted-foreground mt-1">
                                    If you don't provide an end time, it will be set to now.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleTimeModalCancel}
                                className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTimeModalSubmit}
                                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-zinc-800 font-medium transition-colors cursor-pointer"
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
