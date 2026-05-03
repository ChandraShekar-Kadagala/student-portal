import { FileText, Eye, Calendar, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function FileCard({ material }) {
  const navigate = useNavigate();

  const handleRead = () => {
    navigate(`/read/${material.id}`);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (material.storage_path) {
      const { data, error } = await supabase.storage
        .from('study-materials')
        .createSignedUrl(material.storage_path, 60);

      if (!error && data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    }
  };

  const formattedDate = new Date(material.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div 
      onClick={handleRead}
      className="glass-card p-5 group flex items-start gap-4 cursor-pointer"
    >
      <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 flex items-center justify-center flex-shrink-0 border border-red-100 dark:border-red-900/50 shadow-sm group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
        <FileText size={24} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 truncate mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {material.material_type} {material.unit_number ? `- Unit ${material.unit_number}` : ''}
        </h4>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formattedDate}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">PDF Document</span>
        </div>
      </div>

      <div className="flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handleDownload}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
          title="Download PDF"
        >
          <Download size={18} />
        </button>
        <button 
          className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-300 transform group-hover:translate-x-1"
          title="Read Document"
        >
          <Eye size={18} />
        </button>
      </div>
    </div>
  );
}
