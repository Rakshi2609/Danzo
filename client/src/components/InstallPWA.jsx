import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);

  useEffect(() => {
    const handler = e => {
      e.preventDefault();
      console.log('We are being triggered :D');
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = evt => {
    evt.preventDefault();
    if (!promptInstall) {
      alert("App installation is not currently supported in this browser window, or it is already installed.");
      return;
    }
    promptInstall.prompt();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs border transition-all cursor-pointer ${
        supportsPWA
          ? 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:border-neutral-200 dark:hover:bg-neutral-200'
          : 'bg-neutral-100 text-neutral-800 border-neutral-300 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-700'
      }`}
      onClick={onClick}
      title="Install App"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App</span>
    </motion.button>
  );
}

