import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/taskService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Flame,
  Trophy,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Save,
  MessageSquare,
  Sparkles,
  Info,
  Clock,
  Shuffle
} from 'lucide-react';

const PROFILE_BACKGROUNDS = [
  '/profile/_s30qa.gif',
  '/profile/gif2.gif',
  '/profile/gif3.jpg',
  '/profile/gif4.jpg',
  '/profile/hdsjakd.webp',
  '/profile/images.jpeg',
];

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Randomize background on every visit / refresh
  const [bgImage, setBgImage] = useState(() => {
    const randomIndex = Math.floor(Math.random() * PROFILE_BACKGROUNDS.length);
    return PROFILE_BACKGROUNDS[randomIndex];
  });

  const handleShuffleBackground = () => {
    const remaining = PROFILE_BACKGROUNDS.filter(img => img !== bgImage);
    const nextBg = remaining[Math.floor(Math.random() * remaining.length)];
    setBgImage(nextBg);
    toast.success('Wallpaper updated!', { duration: 1500 });
  };

  // Editable form fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data } = await userService.getCurrentUser();
      const currentUser = data?.user || user;
      setProfileData(currentUser);
      setDisplayName(currentUser?.displayName || '');
      setPhone(currentUser?.phone || '');
    } catch (error) {
      console.error('Failed to load user profile:', error);
      if (user) {
        setProfileData(user);
        setDisplayName(user.displayName || '');
        setPhone(user.phone || '');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    try {
      setSaving(true);
      // Clean phone number: keep numbers only
      const cleanPhone = phone ? phone.replace(/[^\d]/g, '') : '';
      
      if (cleanPhone && (cleanPhone.length < 10 || cleanPhone.length > 15)) {
        toast.error('Please enter a valid 10-15 digit phone number with country code (e.g. 918660677696)');
        setSaving(false);
        return;
      }

      const { data } = await userService.updateProfile({
        displayName: displayName.trim(),
        phone: cleanPhone
      });

      setProfileData(data);
      setPhone(data.phone || '');
      setDisplayName(data.displayName || '');
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Streak & Activity Calculations
  const streak = profileData?.loginStreak || user?.loginStreak || 1;
  const longestStreak = profileData?.longestStreak || user?.longestStreak || streak;
  const loginHistory = useMemo(() => {
    const history = profileData?.loginHistory || user?.loginHistory || [];
    const todayStr = new Date().toISOString().split('T')[0];
    if (!history.includes(todayStr)) {
      return [...history, todayStr];
    }
    return history;
  }, [profileData?.loginHistory, user?.loginHistory]);

  const totalActiveDays = loginHistory.length;

  // Calendar calculations
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

  const role = profileData?.role || user?.role || 'Member';

  if (loading && !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-3 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] rounded-2xl overflow-hidden p-3 sm:p-5 lg:p-6 mb-8">
      {/* Dynamic Animated GIF / Image Page Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <img
          key={`bg-${bgImage}`}
          src={bgImage}
          alt="Profile Background"
          className="w-full h-full object-cover object-center filter brightness-[0.45] dark:brightness-[0.25] saturate-125 transform scale-105 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-neutral-950/40 dark:bg-neutral-950/70 backdrop-blur-md"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        {/* Profile Banner Card */}
        <div className="relative rounded-2xl border border-white/20 dark:border-white/10 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Cover with user's GIF / image background */}
          <div className="h-36 sm:h-48 relative overflow-hidden group">
            <img
              key={`cover-${bgImage}`}
              src={bgImage}
              alt="Profile Cover Banner"
              className="w-full h-full object-cover object-center transform scale-105 filter brightness-90 dark:brightness-80 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            {/* Quick Shuffle Wallpaper button */}
            <button
              onClick={handleShuffleBackground}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all shadow-md cursor-pointer hover:scale-105"
              title="Shuffle to another picture/GIF"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shuffle Wallpaper</span>
            </button>
          </div>

          {/* Profile Info Header */}
          <div className="px-5 sm:px-8 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Avatar with negative top margin so ONLY avatar floats over the cover banner */}
                <div className="relative -mt-12 sm:-mt-16 shrink-0 self-start sm:self-auto">
                  {profileData?.photoURL || user?.photoURL ? (
                    <img
                      src={profileData?.photoURL || user?.photoURL}
                      alt={profileData?.displayName || user?.displayName || 'User'}
                      className="w-22 h-22 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white dark:border-neutral-900 shadow-xl bg-neutral-100 dark:bg-neutral-800"
                    />
                  ) : (
                    <div className="w-22 h-22 sm:w-28 sm:h-28 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-xl text-neutral-600 dark:text-neutral-300">
                      <User className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                  )}
                  <span className="absolute bottom-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" title="Online"></span>
                </div>

                {/* Name & Details - ALWAYS fully within the card body, zero slicing on laptop/mobile */}
                <div className="pt-2 sm:pt-4 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                      {profileData?.displayName || user?.displayName || 'User'}
                    </h1>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground shadow-xs">
                      {role}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{profileData?.email || user?.email}</span>
                  </p>
                </div>
              </div>

              {/* Edit Profile Toggle Button */}
              <div className="self-start sm:self-center mt-2 sm:mt-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                    isEditing
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-transparent'
                      : 'bg-white dark:bg-neutral-800 border-border hover:bg-neutral-100 dark:hover:bg-neutral-700 text-foreground'
                  }`}
                >
                  {isEditing ? 'Cancel Editing' : 'Edit Contact Info'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Layout: Contact Info & Streak Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Personal & Contact Details */}
          <div className="lg:col-span-6 space-y-6">
            {/* Contact Details Card */}
            <div className="p-6 rounded-2xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span>Contact & Identity</span>
                </h2>
                {profileData?.phone && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3" /> WhatsApp Ready
                  </span>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Display Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        placeholder="Enter your name"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-border bg-neutral-50 dark:bg-neutral-950 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="email"
                        value={profileData?.email || user?.email || ''}
                        disabled
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-border bg-neutral-100 dark:bg-neutral-800 text-muted-foreground cursor-not-allowed opacity-75"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Managed via Google Authentication
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      Phone Number (for WhatsApp Reminders)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 918660677696 (Country code + Number)"
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border border-border bg-neutral-50 dark:bg-neutral-950 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Enter digits with country code, without '+' or spaces (e.g. 918660677696).
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDisplayName(profileData?.displayName || '');
                        setPhone(profileData?.phone || '');
                        setIsEditing(false);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-semibold border border-border hover:bg-muted text-foreground cursor-pointer transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-zinc-800 active:bg-zinc-950 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {/* Display Name */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-neutral-50/70 dark:bg-neutral-950/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</div>
                        <div className="text-sm font-semibold text-foreground">{profileData?.displayName || user?.displayName || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-neutral-50/70 dark:bg-neutral-950/60">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</div>
                        <div className="text-sm font-semibold text-foreground truncate">{profileData?.email || user?.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                      Verified
                    </span>
                  </div>

                  {/* Phone Number */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-neutral-50/70 dark:bg-neutral-950/60">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-foreground">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Phone</div>
                        <div className="text-sm font-semibold text-foreground">
                          {profileData?.phone ? (
                            <span>+{profileData.phone}</span>
                          ) : (
                            <span className="text-muted-foreground italic">No phone number added</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!profileData?.phone && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                      >
                        + Add Phone
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp & Bot Alerts Info Card */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/10 backdrop-blur-md shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                    WhatsApp Task Reminders
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    When your phone number is linked, you can receive automated WhatsApp notifications for task deadlines, pending follow-ups, and recurring reminder generation.
                  </p>
                </div>
              </div>
            </div>

            {/* Security & Authentication Info */}
            <div className="p-5 rounded-2xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <span>Security & Session</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
                  <span className="text-muted-foreground">Session Token Lifespan</span>
                  <span className="font-semibold text-foreground">7 Days Persistent Auth</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
                  <span className="text-muted-foreground">Authentication Provider</span>
                  <span className="font-semibold text-foreground">Google Firebase OAuth</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-border">
                  <span className="text-muted-foreground">Account Status</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Streak Tracker & Mini Calendar */}
          <div className="lg:col-span-6 space-y-6">
            {/* Streak Overview Card */}
            <div className="p-6 rounded-2xl border border-white/20 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-lg">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Daily Login Streak</span>
                </h2>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {streak} Day{streak > 1 ? 's' : ''} Active
                </span>
              </div>

              {/* Streak Hero Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/20 mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-sm shrink-0">
                    <Flame className="w-7 h-7 fill-white animate-pulse" />
                  </div>
                  <div>
                    <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                      {streak} Consecutive Day{streak > 1 ? 's' : ''}
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">
                      {streak > 2 ? 'Incredible momentum! Keep checking in daily.' : 'Log in every day to keep building your streak.'}
                    </p>
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-amber-500/20">
                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-border text-center">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center justify-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" /> All-Time Record
                    </div>
                    <div className="text-base font-extrabold text-foreground mt-0.5">
                      {longestStreak} Day{longestStreak > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-border text-center">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground flex items-center justify-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-blue-500" /> Total Check-ins
                    </div>
                    <div className="text-base font-extrabold text-foreground mt-0.5">
                      {totalActiveDays} Day{totalActiveDays > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Calendar */}
              <div className="p-4 rounded-xl border border-border bg-neutral-50/70 dark:bg-neutral-950/60">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    <span>{monthNames[month]} {year}</span>
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevMonth}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Previous month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Next month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Headers (Mon - Sun) */}
                <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-muted-foreground mb-1.5">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-8" />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                    const isActive = loginHistory.includes(dateStr);
                    const isToday = isCurrentMonth && dayNum === todayDate;

                    return (
                      <div
                        key={dayNum}
                        className={`h-8 w-full flex items-center justify-center rounded-lg text-xs font-semibold transition-all relative ${
                          isActive
                            ? 'bg-amber-500 text-white font-bold shadow-xs'
                            : isToday
                            ? 'border-2 border-primary text-foreground font-bold'
                            : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                        title={`${dateStr}: ${isActive ? 'Active Check-in' : isToday ? 'Today' : 'No activity'}`}
                      >
                        {dayNum}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-3.5 pt-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    <span>Active Login Day</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full border-2 border-primary inline-block"></span>
                    <span>Today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
