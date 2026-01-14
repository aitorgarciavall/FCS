
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabaseClient';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClubExpanded, setIsClubExpanded] = useState(false); // For mobile
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Opcional: Redirigir a l'inici si estem a /keyper
    if (location.pathname === '/keyper') {
      window.location.href = '/';
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { name: 'Inici', path: '/' },
    { name: 'Equips', path: '/equips' },
    { name: 'Notícies', path: '/noticies' },
    { 
      name: 'El Club', 
      path: '/club',
      dropdown: [
        { name: 'Presentació', path: '/club/presentacio' },
        { name: 'Ideari', path: '/club/ideari' },
        { name: 'Objectius', path: '/club/objectius' },
        { name: 'Reglament Intern', path: '/club/reglament' },
        { name: 'Organigrama esportiu', path: '/club/organigrama' },
      ]
    },
    { name: 'Contacte', path: '/contacte' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3 cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
            <span className="material-symbols-outlined text-2xl">sports_soccer</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#111813] dark:text-white">CF Santpedor</h2>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <div key={link.name} className="relative group">
              {link.dropdown ? (
                <button
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary py-2 ${
                    link.dropdown.some(d => isActive(d.path)) 
                      ? 'text-primary font-bold' 
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {link.name}
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-180">expand_more</span>
                </button>
              ) : (
                <Link
                  to={link.path}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary py-2 ${
                    isActive(link.path) 
                      ? 'text-primary font-bold' 
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {link.name}
                </Link>
              )}
              
              {/* Dropdown Menu */}
              {link.dropdown && (
                <div className="absolute top-full left-0 mt-0 w-56 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden py-1">
                    {link.dropdown.map((dropItem) => (
                      <Link
                        key={dropItem.path}
                        to={dropItem.path}
                        className={`block w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${
                          isActive(dropItem.path)
                            ? 'text-primary font-bold bg-gray-50 dark:bg-white/5' 
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {dropItem.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu userId={user.id} isAdmin={isAdmin()} onLogout={handleLogout} />
            ) : (
              <Link 
                to="/keyper"
                className="hidden lg:flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 h-10 px-4 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                Accés
              </Link>
            )}
            <button className="flex items-center justify-center rounded-lg bg-primary h-10 px-6 text-sm font-bold text-white hover:bg-primary-dark transition-all transform hover:scale-105">
              Fes-te soci
            </button>
          </div>
        </nav>

        <div className="flex md:hidden items-center gap-2">
          {user ? (
            <>
              {isAdmin() && location.pathname !== '/keyper' && (
                <Link 
                  to="/keyper"
                  className="p-2 text-primary"
                >
                  <span className="material-symbols-outlined">dashboard</span>
                </Link>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 text-red-500 dark:text-red-400"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            </>
          ) : (
            <Link 
              to="/keyper"
              className="p-2 text-slate-600 dark:text-white"
            >
              <span className="material-symbols-outlined">login</span>
            </Link>
          )}
          <button 
            className="p-2 text-slate-600 dark:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-background-dark border-b border-gray-200 dark:border-white/10 px-4 py-4 space-y-2 animate-fade-in overflow-y-auto max-h-[80vh]">
          {/* ... nav links ... */}
          {navLinks.map((link) => (
            <div key={link.name}>
              {/* ... link content stays the same ... */}
              {link.dropdown ? (
                <>
                  <button
                    onClick={() => setIsClubExpanded(!isClubExpanded)}
                    className="flex w-full items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
                  >
                    {link.name}
                    <span className={`material-symbols-outlined transition-transform ${isClubExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {isClubExpanded && (
                    <div className="pl-4 space-y-1 border-l-2 border-gray-100 dark:border-white/10 ml-1 mt-1 mb-2">
                      {link.dropdown.map((dropItem) => (
                        <Link
                          key={dropItem.path}
                          to={dropItem.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block w-full text-left py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary ${
                            isActive(dropItem.path) ? 'text-primary font-bold' : ''
                          }`}
                        >
                          {dropItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block w-full text-left py-2 text-sm font-medium text-slate-600 dark:text-slate-300 ${
                     isActive(link.path) ? 'text-primary font-bold' : ''
                  }`}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            {user ? (
              <UserMenu 
                userId={user.id} 
                isAdmin={isAdmin()} 
                onLogout={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                isMobile={true} 
              />
            ) : (
              <Link 
                to="/keyper"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-gray-100 dark:bg-white/5 py-3 rounded-lg font-bold text-slate-700 dark:text-slate-300 text-center"
              >
                Accés Administració
              </Link>
            )}
            <button className="w-full bg-primary py-3 rounded-lg font-bold text-white">
              Fes-te soci
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
