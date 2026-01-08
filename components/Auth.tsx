import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../hooks/useAuth';

const Auth: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Si ja estem logats, intentem anar al panell després d'un breu moment
      const timer = setTimeout(() => {
        navigate('/keyper');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Email o contrasenya incorrectes');
    }
    setLoading(false);
  };

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background-dark">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
            <span className="material-symbols-outlined text-3xl">check</span>
          </div>
          <h2 className="text-xl font-bold dark:text-white">Sessió restaurada</h2>
          <p className="text-gray-500 text-sm mt-2">Tornant al panell...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background-dark px-4">
      <div className="max-w-md w-full bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-white/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-dark dark:text-primary">
            <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
          </div>
          <h2 className="text-2xl font-bold dark:text-white">Accés Restringit</h2>
          <p className="text-gray-500 text-sm mt-2">Introdueix les teves credencials del club.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cfsantpedor.com"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Contrasenya</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Validant...' : 'Iniciar Sessió'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center">
          <p className="text-xs text-gray-400">
            Aquest accés està monitoritzat. Si has perdut la clau, contacta amb el Coordinador IT.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
