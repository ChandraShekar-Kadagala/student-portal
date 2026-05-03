import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, FolderSearch, Loader2 } from 'lucide-react';
import FileCard from '../components/FileCard';
import clsx from 'clsx';

const TABS = ['Unit Notes', 'Questions', 'Last Minute'];

const subjectNames = {
  math: 'Mathematics',
  dsa: 'Data Structures',
  cpp: 'OOPs C++',
  apt: 'Aptitude',
  eco: 'Economics',
};

export default function SubjectPage() {
  const { subjectCode } = useParams();
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const subjectName = subjectNames[subjectCode?.toLowerCase()] || subjectCode?.toUpperCase();

  useEffect(() => {
    async function fetchMaterials() {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials_with_subjects')
        .select('*')
        .ilike('subject_id', subjectCode)
        .eq('material_type', activeTab)
        .order('unit_number', { ascending: true });

      if (!error && data) {
        setMaterials(data);
      } else {
        console.error('Error fetching materials:', error);
        setMaterials([]); // Handle gracefully
      }
      setLoading(false);
    }

    if (subjectCode) {
      fetchMaterials();
    }
  }, [subjectCode, activeTab]);

  return (
    <div className="w-full">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary-600 transition-colors mb-8 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-bold text-slate-800 mb-2">
          {subjectName} <span className="text-primary-500 text-2xl font-medium px-3 py-1 bg-primary-50 rounded-lg ml-2">{subjectCode?.toUpperCase()}</span>
        </h1>
        <p className="text-slate-500 font-medium">Access your comprehensive study materials below.</p>
      </motion.div>

      {/* Modern Tabs */}
      <div className="glass-panel p-2 mb-8 inline-flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                isActive ? "text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-tab"
                  className="absolute inset-0 bg-slate-900 rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={40} className="animate-spin text-primary-500 mb-4" />
            <p className="font-medium text-sm">Loading premium materials...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {materials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {materials.map((mat) => (
                    <FileCard key={mat.id} material={mat} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-panel border-dashed border-2 border-slate-200">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                    <FolderSearch size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">No {activeTab} Found</h3>
                  <p className="text-slate-500 font-medium max-w-sm">
                    We couldn't find any materials for this category yet. Check back later or request an admin to upload them.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
