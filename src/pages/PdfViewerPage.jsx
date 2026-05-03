import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import StudyAssistant from '../components/StudyAssistant';

export default function PdfViewerPage() {
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMastered, setIsMastered] = useState(false);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    async function loadMaterial() {
      try {
        const { data, error } = await supabase
          .from('materials_with_subjects')
          .select('*')
          .eq('id', materialId)
          .single();

        if (error) throw error;
        setMaterial(data);

        // Get signed URL
        const { data: urlData, error: urlError } = await supabase
          .storage
          .from('study-materials')
          .createSignedUrl(data.storage_path, 3600);

        if (urlError) throw urlError;
        setPdfUrl(urlData.signedUrl);

        // Check if mastered
        if (session?.user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('material_id', materialId)
            .single();
          
          if (progressData) {
            setIsMastered(true);
          }
        }

      } catch (err) {
        console.error('Error loading material:', err);
      } finally {
        setLoading(false);
      }
    }

    if (materialId) {
      loadMaterial();
    }
  }, [materialId, session]);

  const handleToggleMastery = async () => {
    if (!session?.user) return;
    
    try {
      if (isMastered) {
        // Unmark
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', session.user.id)
          .eq('material_id', materialId);
        setIsMastered(false);
      } else {
        // Mark as mastered
        await supabase
          .from('user_progress')
          .insert([
            { user_id: session.user.id, material_id: materialId }
          ]);
        setIsMastered(true);
      }
    } catch (error) {
      console.error('Error toggling mastery:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Material not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Main Content Area: Header + PDF */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <div className="glass-card px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="text-primary-500" size={24} />
                {material.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {material.code} • {material.material_type} {material.unit_number ? `• Unit ${material.unit_number}` : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleMastery}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
              isMastered 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-inner'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm'
            }`}
          >
            {isMastered ? '✨ Mastered' : 'Mark as Mastered'}
          </button>
        </div>

        {/* PDF Iframe Container */}
        <div className="flex-1 glass-card overflow-hidden bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl relative border border-slate-200 dark:border-slate-800 shadow-inner">
          {pdfUrl ? (
            <iframe 
              src={`${pdfUrl}#toolbar=0`} 
              className="w-full h-full border-none absolute inset-0 rounded-2xl"
              title={material.title}
            />
          ) : (
            <div className="flex items-center justify-center h-full">Failed to load PDF viewer.</div>
          )}
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="w-full md:w-96 shrink-0 h-[60vh] md:h-full">
        <StudyAssistant contextTitle={material.title} />
      </div>
    </div>
  );
}
