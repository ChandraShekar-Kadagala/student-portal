import { FileText, Download, Calendar } from 'lucide-react';

export default function FileCard({ material }) {
  const handleDownload = () => {
    // Assuming pdf_url is a direct link or Supabase storage public URL
    window.open(material.pdf_url, '_blank');
  };

  const formattedDate = new Date(material.uploaded_date || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="glass-card p-5 group flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-100 shadow-sm group-hover:scale-110 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
        <FileText size={24} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-lg font-bold text-slate-800 truncate mb-1">
          {material.material_type} {material.unit_number ? `- Unit ${material.unit_number}` : ''}
        </h4>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formattedDate}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">PDF Document</span>
        </div>
      </div>

      <button 
        onClick={handleDownload}
        className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center hover:bg-primary-600 hover:text-white hover:shadow-lg hover:shadow-primary-600/30 transition-all duration-300 transform group-hover:translate-x-1"
        title="Download PDF"
      >
        <Download size={18} />
      </button>
    </div>
  );
}
