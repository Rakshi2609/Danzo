import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  Flame,
  Trophy,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Shield,
  Sparkles,
  Check
} from 'lucide-react';

export default function UserStreakPopover() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      setIsOpen(false);
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const streak = user?.loginStreak || 1;
  const longestStreak = user?.longestStreak || streak;
  const loginHistory = useMemo(() => {
    const history = user?.loginHistory || [];
    const todayStr = new Date().toISOString().split('T')[0];
    if (!history.includes(todayStr)) {
      return [...history, todayStr];
    }
    return history;
  }, [user?.loginHistory]);

  const totalActiveDays = loginHistory.length || 1;

  // Calendar computation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button Chip */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`inline-flex items-center gap-2.5 h-9 px-3 rounded-lg border transition-all cursor-pointer shadow-xs ${
          isOpen
            ? 'bg-neutral-200/80 border-neutral-400 dark:bg-neutral-800 dark:border-neutral-600'
            : 'bg-muted/50 border-border hover:bg-muted text-foreground'
        }`}
        title="View Profile & Login Streak"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-5 h-5 rounded-full object-cover border border-border"
          />
        ) : (
          <UserIcon className="w-4 h-4 text-muted-foreground" />
        )}

        <span className="text-xs font-semibold text-foreground max-w-[110px] truncate">
          {user.displayName || 'User'}
        </span>

        {/* Streak Pill */}
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Flame className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{streak}d</span>
        </span>
      </motion.button>

      {/* Popover Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-88 z-50 rounded-2xl border border-border bg-white dark:bg-neutral-900 shadow-2xl shadow-black/20 p-4 text-foreground backdrop-blur-xl"
          >
            {/* Header: User Profile Info */}
            <div className="flex items-center gap-3 pb-3.5 border-b border-border">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-11 h-11 rounded-full object-cover border-2 border-border shadow-xs"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-border">
                  <UserIcon className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold truncate text-foreground">
                    {user.displayName || 'User'}
                  </h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-border">
                    {user.role || 'Member'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            {/* Streak Hero Card */}
            <div className="my-3.5 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-xs">
                    <Flame className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                      {streak} Day{streak > 1 ? 's' : ''} Streak!
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {streak > 1 ? 'Keep the momentum going!' : 'Great start! Log in daily to build streak.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Streak Stats Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-amber-500/20 text-center">
                <div className="p-1.5 rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-500" /> Best Streak
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">
                    {longestStreak} day{longestStreak > 1 ? 's' : ''}
                  </div>
                </div>
                <div className="p-1.5 rounded-lg bg-white/60 dark:bg-neutral-800/60 border border-border">
                  <div className="text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
                    <CalendarIcon className="w-3 h-3 text-blue-500" /> Active Days
                  </div>
                  <div className="text-xs font-bold text-foreground mt-0.5">
                    {totalActiveDays} day{totalActiveDays > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Mini Streak Calendar */}
            <div className="p-2.5 rounded-xl border border-border bg-neutral-50/50 dark:bg-neutral-950/40">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-foreground">
                  {monthNames[month]} {year}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevMonth}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Previous month"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Next month"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Day Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-1">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Empty cells before month start */}
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-6" />
                ))}

                {/* Days of Month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isActive = loginHistory.includes(dateStr);
                  const isToday = isCurrentMonth && dayNum === todayDate;

                  return (
                    <div
                      key={dayNum}
                      className={`h-6 w-full flex items-center justify-center rounded-md text-[11px] font-semibold transition-all relative ${
                        isActive
                          ? 'bg-amber-500 text-white font-bold shadow-xs'
                          : isToday
                          ? 'border border-primary text-foreground font-bold'
                          : 'text-muted-foreground/80 hover:bg-muted/50'
                      }`}
                      title={`${dateStr}: ${isActive ? 'Active Check-in' : isToday ? 'Today' : 'No login recorded'}`}
                    >
                      {isActive ? (
                        <span className="flex items-center justify-center">
                          {dayNum}
                        </span>
                      ) : (
                        <span>{dayNum}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  <span>Active Day</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full border border-primary inline-block"></span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard');
                }}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Dashboard
              </button>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer px-2.5 py-1 rounded-md hover:bg-rose-500/10"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
