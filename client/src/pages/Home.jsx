import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiCheckSquare, 
  FiRefreshCw, 
  FiUsers, 
  FiPieChart, 
  FiSmartphone, 
  FiShield 
} from 'react-icons/fi';
import InstallPWA from '../components/InstallPWA';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: <FiCheckSquare className="w-8 h-8 text-blue-400" />,
    title: "Task Management",
    description: "Create, assign, and track tasks with ease. Stay on top of your daily responsibilities."
  },
  {
    icon: <FiRefreshCw className="w-8 h-8 text-purple-400" />,
    title: "Recurring Tasks",
    description: "Automate your workflow by setting up tasks that repeat daily, weekly, or monthly."
  },
  {
    icon: <FiUsers className="w-8 h-8 text-green-400" />,
    title: "Team Follow-ups",
    description: "Keep track of pending follow-ups and ensure seamless team collaboration."
  },
  {
    icon: <FiPieChart className="w-8 h-8 text-pink-400" />,
    title: "Smart Dashboard",
    description: "Get a bird's-eye view of your productivity with our intuitive analytics dashboard."
  },
  {
    icon: <FiSmartphone className="w-8 h-8 text-yellow-400" />,
    title: "Installable App",
    description: "Download Danzo directly to your device for a fast, native-like experience."
  },
  {
    icon: <FiShield className="w-8 h-8 text-red-400" />,
    title: "Secure Access",
    description: "Role-based access control ensures your team's data remains private and secure."
  }
];

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col justify-center items-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center max-w-4xl z-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium text-sm tracking-wide uppercase"
          >
            Welcome to the Future of Work
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              Danzo Workspace
            </span>
          </h1>
          
          <p className="text-xl md:text-3xl text-gray-300 mb-12 font-light leading-relaxed">
            Your ultimate platform for managing tasks, tracking follow-ups, and ensuring nothing slips through the cracks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {currentUser ? (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg transition-all"
              >
                Go to Dashboard <FiArrowRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg transition-all"
              >
                Get Started <FiArrowRight className="w-5 h-5" />
              </motion.button>
            )}

            <div className="transform scale-110">
              <InstallPWA />
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-500 flex flex-col items-center"
        >
          <span className="text-xs uppercase tracking-widest mb-2 font-semibold">Discover More</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-32 px-6 bg-gray-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need in one place</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Danzo is built with powerful features designed to streamline your team's workflow and boost productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl hover:bg-gray-800 transition-colors"
              >
                <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mb-6 shadow-inner border border-gray-800">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Danzo Workspace. All rights reserved.</p>
      </footer>
    </div>
  );
}
