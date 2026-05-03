import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { BookOpen, User, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Map Registration Number to a dummy email format as requested
    const dummyEmail = `${regNo.trim().toLowerCase()}@student.com`;

    const { error } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50">
      {/* Decorative premium background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-primary-200/40 to-accent-200/40 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -top-[10%] -right-[5%] w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-[10%] -left-[5%] w-[500px] h-[500px] bg-fuchsia-300/30 rounded-full blur-[80px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10 mx-4"
      >
        <div className="glass-panel p-10 backdrop-blur-2xl bg-white/60">
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/30 mb-6"
            >
              <BookOpen size={32} strokeWidth={2.5} />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-center">Welcome to <span className="text-gradient">StudyHub</span></h1>
            <p className="text-slate-500 mt-2 text-center text-sm font-medium">Enter your credentials to access premium materials.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2"
              >
                <div className="mt-0.5">•</div>
                {error}
              </motion.div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Registration Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all text-slate-700 shadow-sm font-medium placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="e.g. 21BCE1234"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 focus:bg-white outline-none transition-all text-slate-700 shadow-sm font-medium placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group bg-slate-900 text-white rounded-xl py-3.5 font-semibold transition-all hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-xl shadow-slate-900/20 flex justify-center items-center"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary-500 to-accent-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-slate-500 text-sm font-medium">
          Protected by premium security.
        </p>
      </motion.div>
    </div>
  );
}
