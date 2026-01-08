import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserRoles } from '../../hooks/useUserRoles';
import Auth from '../Auth';
import { supabase } from '../../services/supabaseClient';

const AdminLayout: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();

  // Aquest hook només s'activarà quan tinguem usuari
  const { data: roles = [], isLoading: rolesLoading } = useUserRoles(user?.id);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Helpers de rols
  const isAdmin = roles.includes('SUPER_ADMIN') || 
                  roles.includes('ADMIN') || 
                  roles.includes('Administrador Global');

  // 1. CARREGANT TOTAL (Auth o Rols)
  // Si estem verificant sessió O estem verificant rols -> Spinner
  if (authLoading || (user && rolesLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-gray-500 text-sm">Verificant credencials...</p>
        </div>
      </div>
    );
  }

  // 2. NO LOGAT -> Login
  if (!user) {
    return <Auth />;
  }

  // 3. LOGAT PERÒ SENSE PERMISOS -> Accés Denegat
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background-dark p-4">
        <div className="bg-white dark:bg-surface-dark p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-gray-200 dark:border-white/10">
          <span className="material-symbols-outlined text-red-500 text-5xl mb-4">lock_person</span>
          <h2 className="text-2xl font-bold dark:text-white mb-2">Accés Denegat</h2>
          <p className="text-gray-500 mb-6">L'usuari {user.email} no té permisos d'administrador.</p>
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg mb-6 text-left text-xs text-gray-400">
            <p className="font-bold mb-1">Diagnòstic:</p>
            <p>ID: {user.id}</p>
            <p>Rols detectats: {roles.length > 0 ? roles.join(', ') : 'Cap'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors w-full"
          >
            Tancar Sessió
          </button>
        </div>
      </div>
    );
  }

  // 4. TOT OK -> Panell
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background-dark flex animate-fade-in">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-white/10 hidden md:flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            <h2 className="text-xl font-black text-[#111813] dark:text-white">Admin Panel</h2>
          </div>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <div className="mt-2 flex gap-1 flex-wrap">
            {roles.map(role => (
              <span key={role} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase">
                {role === 'Administrador Global' ? 'Global' : role}
              </span>
            ))}
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/keyper"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/keyper' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined">dashboard</span> Tauler
          </Link>
          <Link
            to="/keyper/news"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/keyper/news') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined">newspaper</span> Notícies
          </Link>
          <Link
            to="/keyper/teams"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/keyper/teams') ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined">groups</span> Equips
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-500 hover:text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
            <span className="material-symbols-outlined">logout</span> Tancar sessió
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-8 overflow-y-auto min-h-screen">
        <Outlet context={{ roles }} /> 
      </main>
    </div>
  );
};

export default AdminLayout;