import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, BookOpen, Shield, Menu, X, UserCircle, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function Layout({ session }) {
  const [role, setRole] = useState('student');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function getProfile() {
      if (!session?.user?.id) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!error && data) {
        setRole(data.role);
      }
    }
    getProfile();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: BookOpen },
    ...(role === 'admin' ? [{ name: 'Admin Panel', path: '/admin', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-primary-200/40 blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent-200/40 blur-3xl mix-blend-multiply"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-200/40 blur-3xl mix-blend-multiply"></div>
      </div>

      <nav className="fixed w-full z-50 px-4 py-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel max-w-7xl mx-auto px-6 py-3 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <BookOpen size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Study<span className="text-gradient">Hub</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 relative py-2 ${
                      isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-primary-600' : ''} />
                    {link.name}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4 border-l border-slate-200 dark:border-slate-700 pl-6">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-full transition-all duration-300"
                title="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                <UserCircle size={18} className="text-primary-500" />
                <span>{session?.user?.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all duration-300 group"
                title="Logout"
              >
                <LogOut size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-24 mx-4 z-40 glass-panel md:hidden overflow-hidden"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <link.icon size={20} />
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 p-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 w-full text-left"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        <Outlet />
      </main>
    </div>
  );
}
