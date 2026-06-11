import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiCheckSquare, 
  FiRefreshCw, 
  FiUsers, 
  FiPieChart, 
  FiSmartphone, 
  FiShield,
  FiPlay
} from 'react-icons/fi';
import InstallPWA from '../components/InstallPWA';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: <FiCheckSquare className="w-6 h-6 text-indigo-400" />,
    title: "Task Management",
    description: "Create, assign, and track tasks with ease. Stay on top of your daily responsibilities."
  },
  {
    icon: <FiRefreshCw className="w-6 h-6 text-purple-400" />,
    title: "Recurring Tasks",
    description: "Automate your workflow by setting up tasks that repeat daily, weekly, or monthly."
  },
  {
    icon: <FiUsers className="w-6 h-6 text-pink-400" />,
    title: "Team Follow-ups",
    description: "Keep track of pending follow-ups and ensure seamless team collaboration."
  },
  {
    icon: <FiPieChart className="w-6 h-6 text-blue-400" />,
    title: "Smart Dashboard",
    description: "Get a bird's-eye view of your productivity with our intuitive analytics dashboard."
  },
  {
    icon: <FiSmartphone className="w-6 h-6 text-indigo-400" />,
    title: "Installable App",
    description: "Download Danzo directly to your device for a fast, native-like experience."
  },
  {
    icon: <FiShield className="w-6 h-6 text-purple-400" />,
    title: "Secure Access",
    description: "Role-based access control ensures your team's data remains private and secure."
  }
];

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden selection:bg-indigo-500/30">
      
      {/* Top Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            D
          </div>
          <span className="font-bold text-xl tracking-tight">Danzo</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Company</a>
          <a href="#" className="hover:text-white transition-colors">Blog</a>
        </div>
        
        <div className="flex items-center gap-4">
          <InstallPWA />
          <button 
            onClick={() => navigate('/login')} 
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => navigate(currentUser ? '/dashboard' : '/login')}
            className="px-5 py-2 rounded-full bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 text-indigo-300 text-sm font-semibold transition-all hover:border-indigo-400/50"
          >
            {currentUser ? 'Go to Dashboard' : 'Start free trial'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 md:pt-40 pb-20 px-4 md:px-6 flex flex-col items-center min-h-[90vh]">
        
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] md:w-[800px] h-[500px] bg-purple-600/20 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] md:w-[400px] h-[200px] bg-indigo-500/40 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />
        
        {/* Central Black Hole Core */}
        <div className="absolute top-[65%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] md:w-[250px] h-[80px] md:h-[100px] bg-black rounded-[100%] shadow-[0_0_60px_40px_rgba(139,92,246,0.5)] md:shadow-[0_0_80px_60px_rgba(139,92,246,0.5)] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-gray-300 flex items-center gap-2 max-w-[90vw] overflow-hidden whitespace-nowrap text-ellipsis"
          >
            <span className="text-indigo-400">✨</span>
            <span className="truncate">New: Our workflow automation just landed</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white leading-tight"
          >
            Work better with Danzo
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl font-light px-4"
          >
            Never miss a task, follow-up or recurring event.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-5xl relative mt-4 md:mt-10"
          >
            {/* Fake App Mockup Window */}
            <div className="rounded-xl md:rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden relative z-10 mx-2 md:mx-0">
              
              {/* Mockup Header */}
              <div className="h-10 md:h-12 border-b border-white/5 flex items-center px-3 md:px-4 bg-white/5">
                <div className="flex gap-1.5 md:gap-2">
                  <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                  <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                  <div className="w-2.5 md:w-3 h-2.5 md:h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                </div>
                <div className="mx-auto bg-black/50 rounded-md px-10 md:px-32 py-1 text-[10px] md:text-xs text-gray-500 border border-white/5 flex items-center gap-2">
                  <FiCheckSquare className="w-3 h-3" /> <span className="hidden sm:inline">Search anything...</span><span className="sm:hidden">Search</span>
                </div>
              </div>
              
              {/* Mockup Body */}
              <div className="flex flex-col md:flex-row h-[300px] md:h-[400px]">
                {/* Sidebar */}
                <div className="hidden md:flex w-64 border-r border-white/5 p-4 flex-col gap-2">
                  <div className="text-gray-500 text-xs font-semibold mb-2 px-2 uppercase tracking-wider">Workspace</div>
                  <div className="px-2 py-1.5 rounded bg-white/5 text-gray-200 text-sm flex items-center gap-3">
                    <FiPieChart className="w-4 h-4 text-indigo-400" /> Dashboard
                  </div>
                  <div className="px-2 py-1.5 rounded text-gray-400 text-sm flex items-center gap-3">
                    <FiCheckSquare className="w-4 h-4" /> My Tasks
                  </div>
                  <div className="px-2 py-1.5 rounded text-gray-400 text-sm flex items-center gap-3">
                    <FiRefreshCw className="w-4 h-4" /> Recurring
                  </div>
                </div>
                
                {/* Main Content Area */}
                <div className="flex-1 p-5 md:p-8 relative">
                  <div className="text-xs md:text-sm text-indigo-400 font-medium mb-1 md:mb-2">Today's Focus</div>
                  <div className="text-xl md:text-2xl font-semibold mb-4 md:mb-6">Complete Project Danzo</div>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-4 md:w-5 h-4 md:h-5 rounded border border-indigo-500/50 flex-shrink-0 mt-0.5 md:mt-1 bg-indigo-500/10"></div>
                      <div className="text-gray-300 text-xs md:text-sm leading-relaxed">Review final mockups and update styling for the new homepage design to match the Reflect aesthetic.</div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-4 md:w-5 h-4 md:h-5 rounded border border-gray-600 flex-shrink-0 mt-0.5 md:mt-1"></div>
                      <div className="text-gray-500 text-xs md:text-sm leading-relaxed">Integrate the new PWA download button into the navigation flow.</div>
                    </div>
                  </div>

                  {/* Play button overlay */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                    <FiPlay className="w-5 h-5 md:w-6 md:h-6 text-white ml-1 md:ml-1.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Reflection / Glow below mockup */}
            <div className="absolute -bottom-10 md:-bottom-20 left-1/2 -translate-x-1/2 w-[90%] md:w-[80%] h-[60px] md:h-[100px] bg-indigo-600/30 blur-[40px] md:blur-[60px] pointer-events-none" />
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 px-6 relative z-10 border-t border-white/5 bg-[#0A0A0F]/80 backdrop-blur-xl mt-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need, built right in</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              A carefully crafted set of features designed to make your daily workflow feel like magic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 border border-white/5 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-gray-600 text-sm relative z-10 bg-[#0A0A0F]">
        <p>&copy; {new Date().getFullYear()} Danzo Workspace. All rights reserved.</p>
      </footer>
    </div>
  );
}
