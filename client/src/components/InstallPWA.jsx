import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload } from 'react-icons/fa';

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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-2 px-4 py-2 text-white rounded-full shadow-md transition-all font-semibold text-sm ${supportsPWA ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg' : 'bg-gray-700/50 border border-gray-600 hover:bg-gray-700'}`}
      onClick={onClick}
      title="Install App"
    >
      <FaDownload className="text-sm" />
      <span className="hidden md:inline">Install App</span>
    </motion.button>
  );
}
