import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ShieldCheck, UploadCloud, File, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const MATERIAL_TYPES = ['Unit Notes', 'Questions', 'Last Minute'];

export default function AdminPanel({ session }) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [file, setFile] = useState(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [materialType, setMaterialType] = useState(MATERIAL_TYPES[0]);
  const [unitNumber, setUnitNumber] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    async function checkRole() {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (data?.role !== 'admin') {
        navigate('/'); // Kick out if not admin
      } else {
        setIsAdmin(true);
      }
      setChecking(false);
    }
    checkRole();
  }, [session, navigate]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !subjectCode) {
      setStatus({ type: 'error', message: 'Please select a file and enter a subject code.' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', message: '' });

    try {
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${subjectCode}_${materialType.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
      const filePath = `${subjectCode.toLowerCase()}/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('study-materials')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the Subject UUID from the subjects table
      const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('id')
        .ilike('code', subjectCode)
        .single();

      if (subjectError || !subjectData) {
        throw new Error(`Invalid Subject Code. Ensure '${subjectCode.toUpperCase()}' exists in your subjects table.`);
      }

      // 3. Insert into Database
      const { error: dbError } = await supabase
        .from('materials')
        .insert([{
          subject_id: subjectData.id,
          title: file.name.split('.').slice(0, -1).join('.'), // title without extension
          material_type: materialType,
          unit_number: unitNumber ? parseInt(unitNumber) : null,
          storage_path: filePath,
          file_name: file.name
        }]);

      if (dbError) throw dbError;

      setStatus({ type: 'success', message: 'Premium material uploaded successfully!' });
      setFile(null);
      setUnitNumber('');
      
    } catch (error) {
      console.error('Upload Error:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to upload material.' });
    } finally {
      setUploading(false);
    }
  };

  if (checking) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;
  if (!isAdmin) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 mb-6">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 mb-2 tracking-tight">Admin <span className="text-gradient">Control Center</span></h1>
        <p className="text-slate-500 font-medium">Upload and manage premium study materials securely.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8"
      >
        {status.message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-3 border ${
              status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}
          >
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {status.message}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Code</label>
              <input
                type="text"
                required
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 shadow-sm font-medium uppercase placeholder:normal-case placeholder:text-slate-400"
                placeholder="e.g. DSA"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Unit Number (Optional)</label>
              <input
                type="number"
                min="1"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-slate-200/60 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-700 shadow-sm font-medium placeholder:text-slate-400"
                placeholder="e.g. 1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Material Type</label>
            <div className="flex flex-wrap gap-3">
              {MATERIAL_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMaterialType(type)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    materialType === type 
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' 
                      : 'bg-white/60 text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">PDF Document</label>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors relative overflow-hidden group ${
                file ? 'border-primary-500 bg-primary-50/50' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              
              {file ? (
                <div className="flex flex-col items-center text-center z-0">
                  <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-4">
                    <File size={32} />
                  </div>
                  <p className="text-slate-800 font-bold mb-1 truncate max-w-xs">{file.name}</p>
                  <p className="text-slate-500 text-sm font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="mt-4 px-4 py-1.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold hover:bg-red-100 hover:text-red-600 transition-colors z-20 relative"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center z-0">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 group-hover:text-primary-500 group-hover:scale-110 transition-all duration-500 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud size={32} />
                  </div>
                  <p className="text-slate-700 font-bold mb-1 text-lg">Click or drag PDF here</p>
                  <p className="text-slate-500 text-sm font-medium">Maximum file size: 50MB</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl py-4 font-bold text-lg transition-all hover:shadow-xl hover:shadow-primary-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center mt-4"
          >
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <UploadCloud size={20} />
                Upload Premium Material
              </span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
