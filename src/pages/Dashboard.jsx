import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BookOpen, Database, Code2, LineChart, BrainCircuit, Calculator, ArrowRight } from 'lucide-react';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const subjects = [
  { code: 'MA201', name: 'Mathematics', icon: Calculator, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50' },
  { code: 'CS201', name: 'Data Structures', icon: Database, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
  { code: 'CS202', name: 'OOPs C++', icon: Code2, color: 'from-fuchsia-500 to-pink-500', bg: 'bg-fuchsia-50' },
  { code: 'HS202', name: 'Aptitude', icon: BrainCircuit, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
  { code: 'HSS201', name: 'Economics', icon: LineChart, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
];

export default function Dashboard({ session }) {
  const [progressData, setProgressData] = useState({});
  const username = session?.user?.email?.split('@')?.[0] || 'Student';

  useEffect(() => {
    async function loadProgress() {
      if (!session?.user) return;

      try {
        // Fetch all materials to count total per subject
        const { data: materials } = await supabase
          .from('materials_with_subjects')
          .select('id, code');
        
        // Fetch user's mastered materials
        const { data: mastered } = await supabase
          .from('user_progress')
          .select('material_id')
          .eq('user_id', session.user.id);
        
        if (materials && mastered) {
          const masteredSet = new Set(mastered.map(m => m.material_id));
          const progressMap = {};
          
          // Calculate counts
          subjects.forEach(sub => {
            const subjectMaterials = materials.filter(m => m.code === sub.code);
            const total = subjectMaterials.length;
            const completed = subjectMaterials.filter(m => masteredSet.has(m.id)).length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
            
            progressMap[sub.code] = { total, completed, percent };
          });
          
          setProgressData(progressMap);
        }
      } catch (error) {
        console.error('Error calculating progress:', error);
      }
    }

    loadProgress();
  }, [session]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-4">
          Welcome back, <br/>
          <span className="text-gradient">{username.toUpperCase()}</span> 👋
        </h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl">
          Dive into your premium learning materials. Select a subject below to explore notes, questions, and last-minute preparation guides.
        </p>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {subjects.map((subject) => {
          const Icon = subject.icon;
          return (
            <motion.div key={subject.code} variants={item}>
              <Link to={`/subject/${subject.code.toLowerCase()}`} className="block h-full">
                <div className="glass-card h-full p-6 group cursor-pointer relative overflow-hidden flex flex-col justify-between">
                  {/* Hover effect background highlight */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${subject.color} opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500 -z-10`}></div>
                  
                  <div>
                    <div className={`w-14 h-14 rounded-2xl ${subject.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                      <Icon size={28} className={`text-transparent bg-clip-text bg-gradient-to-br ${subject.color}`} />
                      {/* We use an actual icon color setup here since text-transparent on lucide SVG strokes doesn't always work perfectly, but we'll use a trick */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon size={28} style={{ stroke: 'url(#gradient-' + subject.code + ')' }} />
                        <svg width="0" height="0">
                          <linearGradient id={`gradient-${subject.code}`} x1="100%" y1="100%" x2="0%" y2="0%">
                            <stop stopColor="currentColor" offset="0%" className={`text-${subject.color.split(' ')[1].split('-')[1]}-500`} />
                            <stop stopColor="currentColor" offset="100%" className={`text-${subject.color.split(' ')[0].split('-')[1]}-500`} />
                          </linearGradient>
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-primary-600 transition-colors">{subject.name}</h3>
                    <p className="text-slate-500 text-sm font-medium mb-4">{subject.code} • Premium Materials</p>
                    
                    {/* Progress Bar */}
                    {progressData[subject.code] && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500">Progress</span>
                          <span className={`text-${subject.color.split(' ')[1].split('-')[1]}-600`}>{progressData[subject.code].percent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            className={`h-full bg-gradient-to-r ${subject.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${progressData[subject.code].percent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium pt-1 text-right">
                          {progressData[subject.code].completed} of {progressData[subject.code].total} mastered
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between text-sm font-semibold text-primary-600 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore Course</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
