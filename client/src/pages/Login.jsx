
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaTasks } from 'react-icons/fa';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🟢 Login: useEffect triggered, user:', user);
    if (user) {
      console.log('🟢 Login: User exists, navigating to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      console.log('🟢 Login: Starting Google sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('🟢 Login: Google sign-in successful', result.user.email);
      console.log('🟢 Login: Waiting for AuthContext to sync user...');
      toast.success('Logged in successfully!');
      // Don't navigate here - let the useEffect handle it after AuthContext syncs
    } catch (error) {
      console.error('❌ Login: Login error:', error);
      toast.error(error.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 via-zinc-50 to-indigo-50 relative overflow-hidden">
      {/* Decorative blurred background shape */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-gradient-to-tr from-zinc-200 via-zinc-100 to-indigo-100 rounded-full filter blur-3xl opacity-60 z-0"
      />
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-xl shadow-xs border border-border">
          <div className="flex flex-col items-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2, type: 'spring', stiffness: 120 }}
              className="bg-gradient-to-tr bg-primary p-4 rounded-full shadow-xs mb-3"
            >
              <FaTasks className="text-white text-4xl drop-shadow" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1 drop-shadow-md tracking-tight">Denzo</h1>
            <p className="text-gray-600 text-base font-medium">Sign in to manage your tasks</p>
          </div>

          <motion.button
            onClick={handleGoogleLogin}
            whileHover={{ scale: 1.04, boxShadow: '0px 4px 24px rgba(59,130,246,0.15)' }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-border text-accent px-6 py-3 rounded-xl hover:bg-muted/50 hover:bg-muted transition-colors font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-accent/40"
          >
            <FcGoogle size={28} />
            Sign in with Google
          </motion.button>

          <p className="mt-7 text-center text-sm text-gray-500">
            Sign in with your Google account to continue
          </p>
        </div>
      </motion.div>
    </div>
  );
}
