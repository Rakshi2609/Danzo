import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { FaTasks, FaUserCircle, FaSignOutAlt, FaHome } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { Sun, Moon } from "lucide-react";
import InstallPWA from "../InstallPWA";
import { useTheme } from "../../contexts/ThemeContext";

const Navbar = ({ onMenuClick, isSidebarOpen = false, showMenu = true }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navLinkClasses =
    "inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  const mobileNavLinkClasses =
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted active:bg-muted w-full text-left text-foreground";

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo + sidebar toggle */}
          <div className="flex items-center gap-2">
            {showMenu && user && (
              <button
                className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={onMenuClick}
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <IoClose className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
              </button>
            )}
            <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FaTasks className="text-sm" />
              </span>
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Danzo
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1.5">
            {user ? (
              <>
                <div className="flex items-center gap-2.5 h-9 px-3 rounded-lg border border-border bg-muted/50 mr-1">
                  <FaUserCircle className="text-lg text-muted-foreground" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{user.displayName || 'User'}</span>
                    <span className="text-[10px] font-medium uppercase tracking-wide bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                      {user.role || 'Member'}
                    </span>
                  </div>
                </div>

                <InstallPWA />

                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
                </button>

                <motion.button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-zinc-800 active:bg-zinc-950 transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  <FaSignOutAlt className="text-xs" /> Logout
                </motion.button>
              </>
            ) : (
              <>
                <Link to="/">
                  <motion.button
                    className={navLinkClasses}
                    whileTap={{ scale: 0.97 }}
                  >
                    <FaHome /> Home
                  </motion.button>
                </Link>

                <button
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors cursor-pointer"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
                </button>

                <Link to="/login">
                  <motion.button
                    className="inline-flex items-center h-9 px-4 rounded-lg text-sm font-medium bg-primary text-primary-foreground shadow-xs hover:bg-zinc-800 active:bg-zinc-950 transition-colors"
                    whileTap={{ scale: 0.97 }}
                  >
                    Login
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button & Theme toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-muted/50 text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>
            <button
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <IoClose className="text-xl" /> : <HiOutlineMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border bg-white"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4 space-y-1.5">
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg border border-border bg-muted/50">
                    <FaUserCircle className="text-2xl text-muted-foreground" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{user.displayName || 'User'}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide bg-accent/10 text-accent px-1.5 py-0.5 rounded-full mt-1 inline-block w-fit">
                        {user.role || 'Member'}
                      </span>
                    </div>
                  </div>

                  <div className="px-1 py-1">
                    <InstallPWA />
                  </div>

                  <motion.button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className={`${mobileNavLinkClasses} text-red-600 hover:bg-red-50 active:bg-red-50`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaSignOutAlt className="text-base" /> Logout
                  </motion.button>
                </>
              ) : (
                <>
                  <Link to="/" onClick={closeMobileMenu}>
                    <motion.button
                      className={mobileNavLinkClasses}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaHome className="text-base" /> Home
                    </motion.button>
                  </Link>

                  <Link to="/login" onClick={closeMobileMenu}>
                    <motion.button
                      className="w-full h-10 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-xs active:bg-zinc-950 transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      Login
                    </motion.button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
