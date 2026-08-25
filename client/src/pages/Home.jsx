import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  RefreshCw, 
  Users, 
  PieChart, 
  ShieldCheck, 
  Menu, 
  X,
  ArrowRight,
  Zap,
  Layers,
  Calendar,
  Clock,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
  Terminal,
  ArrowUpRight
} from 'lucide-react';
import InstallPWA from '../components/InstallPWA';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import KineticGrid from '@/components/ui/kinetic-grid';
import { TerminalSimulator } from '@/components/remocn/terminal-simulator';
import { CheckList } from '@/components/remocn/check-list';

const features = [
  {
    icon: <CheckSquare className="w-5 h-5 text-black dark:text-white" />,
    title: "Task Orchestration",
    description: "Structure, prioritize, and track team tasks with sub-task milestones and smart deadlines."
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-black dark:text-white" />,
    title: "Automated Recurring Schedules",
    description: "Eliminate manual overhead by configuring tasks that automatically reset daily, weekly, or monthly."
  },
  {
    icon: <Users className="w-5 h-5 text-black dark:text-white" />,
    title: "Accountability Follow-ups",
    description: "Keep visibility across team deliverables with designated ownership and automated reminders."
  },
  {
    icon: <PieChart className="w-5 h-5 text-black dark:text-white" />,
    title: "Executive Analytics",
    description: "Gain actionable clarity over throughput, resolution speed, and team workload distribution."
  },
  {
    icon: <Laptop className="w-5 h-5 text-black dark:text-white" />,
    title: "Instant PWA & Offline Support",
    description: "Install directly onto macOS, Windows, iOS, or Android with rapid offline caching."
  },
  {
    icon: <ShieldCheck className="w-5 h-5 text-black dark:text-white" />,
    title: "Role-Based Access & Security",
    description: "Granular administrative permissions backed by Firebase Admin authentication and MongoDB."
  }
];

const mockTasks = [
  {
    id: 1,
    title: "Finalize Design Token Architecture & Kinetic Grid System",
    tag: "Design System",
    priority: "High",
    due: "Today, 5:00 PM",
    assignee: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
    assigneeName: "Elena R.",
    completed: false
  },
  {
    id: 2,
    title: "Deploy Firebase Admin Auth & Agenda Cron Scheduler",
    tag: "Backend",
    priority: "Urgent",
    due: "Tomorrow",
    assignee: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    assigneeName: "David K.",
    completed: true
  },
  {
    id: 3,
    title: "Weekly Sprint Retrospective & Recurring Sync Setup",
    tag: "Product Ops",
    priority: "Routine",
    due: "Friday",
    assignee: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80",
    assigneeName: "Sarah M.",
    completed: false
  }
];

export default function Home() {
  const { user } = useAuth();
  const { isDark, toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const themeMode = isDark ? "dark" : "light";

  return (
    <div className={isDark ? "dark" : ""}>
      <KineticGrid 
        globalColor={themeMode}
        className={`min-h-screen font-sans overflow-x-hidden transition-colors duration-300 ${
          isDark ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {/* Navigation Header */}
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
          isDark 
            ? "bg-black/90 border-neutral-800" 
            : "bg-white/90 border-neutral-200"
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Brand Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-sm tracking-tighter">
                DANZO
              </div>
              <span className="font-bold text-lg tracking-tight text-black dark:text-white">
                Danzo
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
              <a href="#workspace" className="hover:text-black dark:hover:text-white transition-colors">Workspace</a>
              <a href="#architecture" className="hover:text-black dark:hover:text-white transition-colors">Architecture</a>
            </nav>

            {/* Actions & Theme Switcher */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${
                  isDark
                    ? "border-neutral-800 bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
                    : "border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200"
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <InstallPWA />

              <button 
                onClick={() => navigate('/login')} 
                className="text-sm font-semibold px-4 py-2 text-neutral-900 dark:text-neutral-200 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                Sign in
              </button>

              <button 
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm transition-all cursor-pointer"
              >
                <span>{user ? 'Dashboard' : 'Get Started'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu & Theme Switcher */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg border ${
                  isDark
                    ? "border-neutral-800 bg-neutral-900 text-neutral-100"
                    : "border-neutral-300 bg-neutral-100 text-neutral-900"
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                className={`p-2 rounded-lg ${isDark ? "text-neutral-200" : "text-neutral-900"}`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`border-b px-6 py-5 flex flex-col gap-4 md:hidden ${
                  isDark ? "bg-black border-neutral-800" : "bg-white border-neutral-200"
                }`}
              >
                <div className="flex flex-col gap-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="py-1">Features</a>
                  <a href="#workspace" onClick={() => setIsMobileMenuOpen(false)} className="py-1">Workspace</a>
                  <a href="#architecture" onClick={() => setIsMobileMenuOpen(false)} className="py-1">Architecture</a>
                </div>
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-col gap-2.5">
                  <InstallPWA />
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} 
                    className="w-full py-2.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-sm font-semibold text-neutral-900 dark:text-neutral-100"
                  >
                    Sign in
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate(user ? '/dashboard' : '/login'); }}
                    className="w-full py-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-sm font-semibold"
                  >
                    {user ? 'Dashboard' : 'Get Started'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Hero Section */}
        <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Minimalist Monochrome Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border mb-8 ${
              isDark 
                ? "bg-neutral-900 border-neutral-800 text-neutral-200" 
                : "bg-neutral-100 border-neutral-300 text-neutral-900 shadow-sm"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
            <span>Danzo Workspace 2.0</span>
            <span className="text-neutral-400 dark:text-neutral-600">/</span>
            <span className="font-bold">Kinetic Grid System</span>
          </motion.div>

          {/* Headline - Sharp High-Contrast Black & White */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 dark:text-white max-w-4xl leading-[1.08]"
          >
            The focused workspace for high-velocity teams
          </motion.h1>

          {/* Subtitle - Crisp and highly readable */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-neutral-800 dark:text-neutral-300 max-w-2xl font-medium leading-relaxed"
          >
            Orchestrate daily deliverables, automate recurring routines, and track follow-ups with instant clarity and responsive canvas physics.
          </motion.p>

          {/* Primary Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
          >
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Start for free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#workspace"
              className={`w-full sm:w-auto px-7 py-3.5 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                isDark 
                  ? "bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800" 
                  : "bg-white border-neutral-300 text-neutral-950 hover:bg-neutral-50 shadow-sm"
              }`}
            >
              <span>Explore workspace</span>
            </a>
          </motion.div>

          {/* Monochrome Trust Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-semibold text-neutral-700 dark:text-neutral-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
              <span>Full Offline PWA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
              <span>Real-time Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
              <span>Enterprise RBAC</span>
            </div>
          </motion.div>
        </section>

        {/* Animated CheckList Showcase Section */}
        <section id="workspace" className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-24">
          <div className={`p-6 sm:p-8 rounded-2xl border shadow-xl transition-all ${
            isDark 
              ? "bg-neutral-950/90 border-neutral-800 shadow-black" 
              : "bg-white/95 border-neutral-300 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)]"
          }`}>
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                <span className="ml-2 text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  check-list.scene
                </span>
              </div>
              <span className="text-xs font-mono font-medium text-neutral-500">
                Interactive CheckList
              </span>
            </div>

            <CheckList
              items={[
                "Render on your own machine",
                "No watermark, ever",
                "Every component MIT",
                { text: "Ships as source", checked: false },
              ]}
              width={720}
              fontSize={20}
              itemGap={12}
              closeGap={6}
              rowGap={10}
              perStep={1.4}
              strokeWidth={2.5}
              color={isDark ? "#ffffff" : "#0a0a0a"}
              boxColor={isDark ? "#ffffff" : "#0a0a0a"}
              tickColor="#6f7f35"
              step={3}
            />
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
          isDark ? "bg-black border-neutral-800" : "bg-neutral-50/80 border-neutral-200"
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                Everything required to scale productivity
              </h2>
              <p className="mt-3 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base font-medium">
                Engineered with high contrast and zero fluff to keep individual contributors and leadership aligned.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((item, idx) => (
                <div 
                  key={idx}
                  className={`p-6 rounded-xl border transition-all ${
                    isDark 
                      ? "bg-neutral-950 border-neutral-800 hover:border-neutral-500" 
                      : "bg-white border-neutral-300 hover:border-black hover:shadow-md"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 border ${
                    isDark 
                      ? "bg-neutral-900 border-neutral-800 text-white" 
                      : "bg-neutral-100 border-neutral-300 text-black shadow-sm"
                  }`}>
                    {item.icon}
                  </div>
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Terminal Simulator & Architecture Section */}
        <section id="architecture" className={`py-20 px-4 sm:px-6 lg:px-8 border-t transition-colors ${
          isDark ? "bg-neutral-950 border-neutral-800" : "bg-neutral-50/90 border-neutral-200"
        }`}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                <Terminal className="w-4 h-4" /> Production Terminal
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950 dark:text-white">
                Built for rapid builds and seamless execution
              </h2>
              <p className="text-sm sm:text-base font-medium text-neutral-700 dark:text-neutral-300 leading-relaxed">
                Zero friction local development and automated CI/CD compiling. The terminal simulator scene validates builds and runtime tasks in real-time.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-black dark:text-white shadow-sm">
                  React 19
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-black dark:text-white shadow-sm">
                  Tailwind CSS v4
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-black dark:text-white shadow-sm">
                  Express.js MongoDB
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-black dark:text-white shadow-sm">
                  Remotion Scene
                </span>
              </div>
            </div>

            {/* Terminal Simulator Container */}
            <div className="lg:col-span-6 w-full">
              <TerminalSimulator
                lines={[
                  { text: "npm run build", type: "command" },
                  { text: "Compiled successfully", type: "success", delay: 14 },
                ]}
                title="danzo-workspace ~/build"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-8 border-t text-center text-xs font-semibold transition-colors ${
          isDark ? "border-neutral-800 bg-black text-neutral-400" : "border-neutral-200 bg-neutral-100 text-neutral-700"
        }`}>
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-[9px]">
                D
              </div>
              <span className="font-bold text-black dark:text-white">Danzo</span>
              <span>— Task & Workflow Management</span>
            </div>
            <p>&copy; {new Date().getFullYear()} Danzo Workspace. All rights reserved.</p>
          </div>
        </footer>
      </KineticGrid>
    </div>
  );
}
