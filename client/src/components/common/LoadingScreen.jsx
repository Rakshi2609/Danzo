import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles, Zap, ShieldCheck, Flame } from 'lucide-react';

const DEFAULT_MESSAGES = [
  { text: 'Syncing your workspace & deliverables...', icon: Zap },
  { text: 'Calibrating daily streaks & habits...', icon: Flame },
  { text: 'Securing encrypted workspace session...', icon: ShieldCheck },
  { text: 'Organizing delegations & follow-ups...', icon: CheckCircle2 },
  { text: 'Preparing high-velocity command center...', icon: Sparkles },
];

export default function LoadingScreen({
  message,
  submessage,
  fullScreen = true,
  variant = 'brand',
  size = 'md',
}) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (message) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % DEFAULT_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [message]);

  const currentMsg = message || DEFAULT_MESSAGES[messageIndex].text;
  const CurrentIcon = message ? Sparkles : DEFAULT_MESSAGES[messageIndex].icon;

  const content = (
    <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 max-w-sm sm:max-w-md w-full text-center select-none">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute -top-16 -left-16 w-48 h-48 bg-primary/15 dark:bg-accent/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-blue-500/15 dark:bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Center Emblem with Orbiting Ring */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer Orbiting Glow Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-dashed border-primary/30 dark:border-accent/40"
        />

        {/* Pulsing Second Aura */}
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-primary/20 via-accent/30 to-blue-500/20 blur-md"
        />

        {/* Central Brand Badge */}
        <motion.div
          animate={{ scale: [0.96, 1.04, 0.96] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-neutral-900 border border-border/80 shadow-xl flex items-center justify-center overflow-hidden"
        >
          {/* Subtle Inner Gradient Glint */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-neutral-200/50 dark:from-neutral-800/80 dark:to-neutral-950/80" />

          {/* Logo Monogram */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span className="font-extrabold text-2xl sm:text-3xl tracking-tight bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-900 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
              D
            </span>
            <div className="w-2 h-0.5 rounded-full bg-accent mt-0.5" />
          </div>
        </motion.div>
      </div>

      {/* Animated Brand Title */}
      <div className="mb-3">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center justify-center gap-2">
          <span>Danzo</span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-accent/15 text-accent border border-accent/20 tracking-wider">
            Workspace
          </span>
        </h2>
      </div>

      {/* Rotating Status Message with AnimatePresence */}
      <div className="h-10 sm:h-12 flex items-center justify-center w-full px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMsg}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground"
          >
            <CurrentIcon className="w-4 h-4 text-accent animate-pulse flex-shrink-0" />
            <span className="truncate">{currentMsg}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Submessage if provided */}
      {submessage && (
        <p className="text-[11px] text-muted-foreground/70 -mt-1 mb-2 max-w-xs truncate">
          {submessage}
        </p>
      )}

      {/* Shimmering High-Tech Progress Bar */}
      <div className="w-44 sm:w-52 h-1.5 bg-neutral-200/80 dark:bg-neutral-800/80 rounded-full overflow-hidden relative mt-2 border border-border/40 shadow-inner">
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary dark:via-accent to-transparent rounded-full"
        />
      </div>

      {/* Bottom Subtle Status Tag */}
      <p className="text-[10px] font-mono text-muted-foreground/60 mt-4 tracking-widest uppercase">
        Loading Assets • Please Wait
      </p>
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="w-full py-12 flex items-center justify-center bg-transparent">
        {content}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen fixed inset-0 z-50 flex items-center justify-center bg-background/80 dark:bg-background/90 backdrop-blur-xl"
    >
      {content}
    </motion.div>
  );
}
