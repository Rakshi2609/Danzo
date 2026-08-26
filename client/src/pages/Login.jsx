import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Layers,
  Users,
  Repeat
} from 'lucide-react';

export default function Login() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setIsSigningIn(true);
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Welcome back, ${result.user.displayName || 'User'}!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      setIsSigningIn(false);
    }
  };

  const featureHighlights = [
    {
      icon: Zap,
      title: 'Real-Time Sync',
      desc: 'Seamless state updates across all connected devices.'
    },
    {
      icon: Repeat,
      title: 'Automated Routines',
      desc: 'Scheduled recurring triggers with Sunday skip protection.'
    },
    {
      icon: Users,
      title: 'Delegation & Follow-Ups',
      desc: 'Track assignments and monitor workflow progress directly.'
    }
  ];

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between transition-colors duration-300 ${
      isDark ? 'bg-neutral-950 text-white' : 'bg-neutral-50 text-neutral-950'
    }`}>
      {/* Top Navigation Bar */}
      <header className={`w-full border-b px-4 sm:px-8 py-3.5 flex items-center justify-between backdrop-blur-md sticky top-0 z-50 ${
        isDark ? 'bg-neutral-950/80 border-neutral-900' : 'bg-white/80 border-neutral-200'
      }`}>
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            isDark
              ? 'border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900'
              : 'border-neutral-200 text-neutral-700 hover:text-black hover:bg-neutral-100'
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg border text-sm transition-all cursor-pointer ${
              isDark
                ? 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800'
                : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-100'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left / Sign In Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 flex flex-col justify-center max-w-md mx-auto w-full"
          >
            <div className={`p-7 sm:p-9 rounded-2xl border shadow-xl transition-all ${
              isDark
                ? 'bg-neutral-900/90 border-neutral-800 backdrop-blur-xl shadow-black/40'
                : 'bg-white border-neutral-200 shadow-neutral-200/50'
            }`}>
              {/* Brand Logo & Pill */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-extrabold text-sm tracking-tighter shadow-sm">
                    DANZO
                  </div>
                  <span className="font-bold text-xl tracking-tight text-neutral-950 dark:text-white">
                    Danzo
                  </span>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  isDark
                    ? 'bg-neutral-800 border-neutral-700 text-neutral-300'
                    : 'bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>7-Day Session</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-7">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                  Sign in to your workspace
                </h1>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Enter your team environment to manage deliverables, recurring workflows, and task follow-ups.
                </p>
              </div>

              {/* Google Sign In Button */}
              <motion.button
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 px-4 rounded-xl border font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-sm ${
                  isDark
                    ? 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800 hover:border-neutral-700 text-white'
                    : 'bg-white border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 text-neutral-900'
                } ${isSigningIn ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSigningIn ? (
                  <div className="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FcGoogle className="text-xl" />
                )}
                <span>{isSigningIn ? 'Authenticating...' : 'Continue with Google'}</span>
              </motion.button>

              {/* Session Notice & Security Guarantee */}
              <div className={`mt-6 p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                isDark
                  ? 'bg-neutral-950/60 border-neutral-800/80 text-neutral-400'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-neutral-900 dark:text-neutral-200">7-Day Persistent Auth:</span>{' '}
                  Your secure JWT session stays active for 7 days without requiring repeated logins.
                </div>
              </div>

              {/* Terms Footer */}
              <p className="mt-6 text-center text-[11px] text-neutral-500 dark:text-neutral-500 leading-relaxed">
                By continuing, you agree to Danzo's Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>

          {/* Right / Features Preview Column (Desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden lg:flex lg:col-span-6 flex-col gap-5 pl-4"
          >
            {/* Live Interactive Task Widget Mockup */}
            <div className={`p-6 rounded-2xl border transition-all ${
              isDark
                ? 'bg-neutral-900/60 border-neutral-800/90'
                : 'bg-white border-neutral-200 shadow-lg shadow-neutral-100'
            }`}>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Live Workspace Preview
                  </span>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  Daily Sprint
                </span>
              </div>

              {/* Sample Task Items */}
              <div className="space-y-2.5 text-xs">
                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium line-through text-neutral-400">Deploy Token Engine API</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    Completed
                  </span>
                </div>

                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">Synchronize Team Standup</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500">
                    In Progress
                  </span>
                </div>

                <div className={`p-3 rounded-lg border flex items-center justify-between ${
                  isDark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <Repeat className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-neutral-700 dark:text-neutral-300">Daily Recurring Sync (1:00 AM)</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                    Automated
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featureHighlights.map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isDark
                        ? 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700'
                        : 'bg-white border-neutral-200 hover:border-neutral-300 shadow-xs'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white mb-2.5">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-semibold text-xs text-neutral-950 dark:text-white mb-1">
                      {feat.title}
                    </div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                      {feat.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <footer className={`w-full border-t py-4 text-center text-xs ${
        isDark ? 'border-neutral-900 text-neutral-600' : 'border-neutral-200 text-neutral-400'
      }`}>
        <p>&copy; {new Date().getFullYear()} Danzo Productivity. All rights reserved.</p>
      </footer>
    </div>
  );
}

