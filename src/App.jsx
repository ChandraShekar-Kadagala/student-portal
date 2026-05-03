import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubjectPage from './pages/SubjectPage';
import AdminPanel from './pages/AdminPanel';

// Components
import Layout from './components/Layout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        
        <Route path="/" element={session ? <Layout session={session} /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard session={session} />} />
          <Route path="subject/:subjectCode" element={<SubjectPage />} />
          <Route path="admin" element={<AdminPanel session={session} />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
