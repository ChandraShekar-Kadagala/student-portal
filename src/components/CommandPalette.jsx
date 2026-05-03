import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, BookOpen, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [materials, setMaterials] = useState([]);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleCustomEvent = () => setIsOpen(true);
    window.addEventListener('open-command-palette', handleCustomEvent);
    return () => window.removeEventListener('open-command-palette', handleCustomEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchAllMaterials();
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    
    const searchTerms = query.toLowerCase().split(' ');
    const filtered = materials.filter(item => {
      const searchString = `${item.title} ${item.code} ${item.material_type}`.toLowerCase();
      return searchTerms.every(term => searchString.includes(term));
    });
    setResults(filtered.slice(0, 5)); // Show top 5
  }, [query, materials]);

  const fetchAllMaterials = async () => {
    if (materials.length > 0) return; // Cache it
    const { data, error } = await supabase
      .from('materials_with_subjects')
      .select('*');
    if (!error && data) {
      setMaterials(data);
    }
  };

  const handleSelect = (item) => {
    setIsOpen(false);
    navigate(`/subject/${item.code}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-[90%] max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-[101]"
          >
            <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search subjects, notes, or questions..."
                className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-lg"
              />
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                <X size={20} />
              </button>
            </div>

            {query && results.length > 0 && (
              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-500">
                      {item.material_type === 'Unit Notes' ? <BookOpen size={20} /> :
                       item.material_type === 'Questions' ? <FileText size={20} /> :
                       <Clock size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs font-medium">
                          {item.code}
                        </span>
                        <span>•</span>
                        <span>{item.material_type}</span>
                        {item.unit_number && (
                          <>
                            <span>•</span>
                            <span>Unit {item.unit_number}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {query && results.length === 0 && (
              <div className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                <Search size={32} className="mx-auto mb-3 opacity-20" />
                <p>No materials found matching "{query}"</p>
              </div>
            )}

            {!query && (
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 flex justify-between">
                <span>Start typing to search instantly</span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded shadow-sm">esc</kbd> to close
                </span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
