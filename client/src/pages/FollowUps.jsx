import { useState, useEffect } from 'react';
import { taskService, userService } from '../services/taskService';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { FaTasks, FaSpinner, FaCalendarAlt, FaUserCircle, FaFlag, FaSort, FaFilter, FaEye, FaSearch, FaEdit, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pagination from '../components/Pagination';
import moment from 'moment';

export default function FollowUps() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [selectedDate, setSelectedDate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const tasksRes = await taskService.getFollowUps();
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-400';
      case 'In Progress': return 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400';
      case 'Completed': return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400';
      case 'Cancelled': return 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-400';
      default: return 'bg-gray-100 dark:bg-neutral-800 text-foreground';
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'border-red-500';
      case 'High': return 'border-orange-500';
      case 'Medium': return 'border-yellow-500';
      case 'Low': return 'border-green-500';
      default: return 'border-gray-300';
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

  // Filter and sort logic
  const filteredAndSortedTasks = (() => {
    let result = [...tasks];

    // 1. Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(task => 
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.assignedTo?.displayName?.toLowerCase().includes(searchLower) ||
        task.assignedTo?.email?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 2. Date filter
    if (selectedDate) {
      const targetDateStr = moment(selectedDate).format('YYYY-MM-DD');
      result = result.filter(
        task => moment(task.dueDate).format('YYYY-MM-DD') === targetDateStr
      );
    }

    // 3. Overdue filter
    if (filterOverdue && !selectedDate) {
      const today = moment().startOf('day');
      result = result.filter(
        task => moment(task.dueDate).isBefore(today) && task.status !== 'Completed'
      );
    }

    // 4. Status filter
    if (filterStatus !== 'all') {
      result = result.filter(task => task.status === filterStatus);
    }

    // 5. Priority filter
    if (filterPriority !== 'all') {
      result = result.filter(task => task.priority === filterPriority);
    }

    // 6. Type / Frequency filter
    if (filterType === 'recurring') {
      result = result.filter(task => !!task.recurringTaskId);
    } else if (filterType === 'regular') {
      result = result.filter(task => !task.recurringTaskId);
    } else if (filterType === 'daily') {
      result = result.filter(task => 
        task.taskFrequency === 'Daily' || task.recurringTaskId?.frequency === 'Daily'
      );
    } else if (filterType === 'weekly') {
      result = result.filter(task => 
        task.taskFrequency === 'Weekly' || task.recurringTaskId?.frequency === 'Weekly'
      );
    } else if (filterType === 'monthly') {
      result = result.filter(task => 
        task.taskFrequency === 'Monthly' || task.recurringTaskId?.frequency === 'Monthly'
      );
    }

    // 7. Sorting
    const priorityOrder = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
    if (sortBy === 'dueDate') {
      result.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    } else if (sortBy === 'dueDateDesc') {
      result.sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    } else if (sortBy === 'priority') {
      result.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
    } else if (sortBy === 'status') {
      const statusOrder = { 'In Progress': 1, 'Pending': 2, 'Completed': 3, 'Cancelled': 4 };
      result.sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5));
    } else if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'created') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'all') {
      result.sort((a, b) => {
        const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
        return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
      });
    }

    return result;
  })();

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedDate ? 1 : 0,
    filterOverdue ? 1 : 0,
    filterPriority !== 'all' ? 1 : 0,
    filterStatus !== 'all' ? 1 : 0,
    filterType !== 'all' ? 1 : 0,
    sortBy !== 'dueDate' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedDate(null);
    setFilterOverdue(false);
    setFilterPriority('all');
    setFilterStatus('all');
    setFilterType('all');
    setSortBy('dueDate');
  };

  const paginatedTasks = filteredAndSortedTasks.slice((page - 1) * pageSize, page * pageSize);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-accent mx-auto mb-4" />
          <p className="text-xl font-semibold text-muted-foreground">Loading follow ups...</p>
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

        <motion.div className="flex items-center justify-between mb-4" variants={itemVariants}>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground drop-shadow-md flex items-center gap-2">
            <FaTasks className="text-accent text-2xl sm:text-3xl" /> Follow Ups
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

        <motion.p 
          className="text-muted-foreground text-sm mb-4 relative z-10"
          variants={itemVariants}
        >
          Tasks you created and assigned to team members
        </motion.p>

        {showFilters && (
        <motion.div
          className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl shadow-xs border border-border mb-5 space-y-3 relative z-30"
          variants={itemVariants}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Bar */}
          <div className="flex items-center gap-2 w-full">
            <FaSearch className="text-muted-foreground flex-shrink-0 text-sm" />
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search follow ups by title, assignee, tags, or description..."
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

          {/* Controls Grid */}
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
                <option value="Cancelled">Cancelled</option>
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
                <option value="status">Status</option>
                <option value="title">Title (A-Z)</option>
                <option value="created">Recently Created</option>
              </select>
            </div>
          </div>

          {/* Date Picker & Pills */}
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
            </div>
          </div>
        </motion.div>
        )}

        {filteredAndSortedTasks.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            variants={itemVariants}
          >
            <FaTasks className="text-6xl text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Follow Ups Found</h3>
            <p className="text-muted-foreground">You haven't assigned any tasks yet</p>
          </motion.div>
        ) : (
          <>
            <ul className="space-y-4">
              {paginatedTasks.map((task, index) => (
                <motion.li
                  key={task._id || index}
                  className={`bg-white dark:bg-neutral-900 border border-border border-l-4 ${getPriorityBorderColor(task.priority)} p-4 rounded-lg shadow-sm`}
                  variants={taskCardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <Link 
                        to={`/tasks/${task._id}`}
                        className="flex-1"
                      >
                        <h4 className="text-base font-semibold text-foreground hover:text-primary transition-colors break-words">
                          {task.title}
                        </h4>
                      </Link>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)} flex-shrink-0`}>
                        {task.status}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2 break-words">{task.description}</p>
                    )}

                    {task.recurringTaskId && (
                      <p className="text-xs text-foreground font-medium flex items-center gap-1 mb-2">
                        <span className="bg-muted px-2 py-1 rounded text-xs">🔁 Recurring</span>
                      </p>
                    )}

                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <FaCalendarAlt className="text-muted-foreground" />
                        <span>Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}</span>
                      </p>

                      <p className="text-xs flex items-center gap-1">
                        <FaFlag className={getPriorityColor(task.priority)} />
                        <span className={`font-bold ${getPriorityColor(task.priority)}`}>
                          Priority: {task.priority}
                        </span>
                      </p>

                      <p className="text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                        <FaUserCircle className="text-muted-foreground flex-shrink-0" />
                        <span>Assigned to:</span>
                        <span className="font-semibold text-foreground break-all">
                          {task.assignedTo?.displayName || task.assignedTo?.email || task.assignedTo}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3 flex gap-2 justify-end">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="flex items-center justify-center bg-primary hover:bg-zinc-800 text-primary-foreground px-3 py-2 rounded-full shadow-xs text-xs font-medium transition-all duration-300"
                      >
                        <FaEye className="sm:mr-1" /> <span className="hidden sm:inline">View Details</span>
                      </Link>
                      <Link
                        to={`/edit-task/${task._id}`}
                        className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-full shadow-xs text-xs font-medium transition-all duration-300"
                      >
                        <FaEdit className="sm:mr-1" /> <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={filteredAndSortedTasks.length}
              onPageChange={setPage}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
