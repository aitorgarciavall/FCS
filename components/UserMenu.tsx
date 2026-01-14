import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { UserService } from '../services/userService';
import AvatarUpload from './AvatarUpload';
import { User } from '../types';

interface UserMenuProps {
  userId: string;
  isAdmin: boolean;
  onLogout: () => void;
  isMobile?: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ userId, isAdmin, onLogout, isMobile = false }) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchProfile = async () => {
    try {
      const userProfile = await UserService.getUserById(userId);
      setProfile(userProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Tancar el menú si es clica fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarUpdate = (newUrl: string) => {
    if (profile) {
      setProfile({ ...profile, avatar_url: newUrl });
    }
    // Opcional: Refrescar tot el perfil
    fetchProfile();
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  // Versió Mòbil (Simplificada, només botons/links, l'avatar es gestiona diferent o s'integra al menú existent)
  // Però com que el UserMenu es crida DINS del menú mòbil o a la barra, hem de decidir.
  // En aquest cas, el Header ja té un disseny mòbil específic.
  // Aquest component serà principalment per a l'escriptori, o per substituir la part d'usuari al mòbil.
  
  // Si és mòbil, retornem una estructura que s'adapti al flux del menú mòbil del Header.tsx
  // Però per ara, el farem servir com a dropdown "flotant" a escriptori, i integrat a mòbil.

  if (isMobile) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                <div 
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 cursor-pointer border border-primary/20"
                >
                     {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                            {profile?.email ? getInitials(profile.email) : 'U'}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                        <span className="material-symbols-outlined text-sm">edit</span>
                    </div>
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold truncate text-gray-900 dark:text-white">
                        {profile?.full_name || profile?.email || 'Usuari'}
                    </span>
                    <button 
                        onClick={() => setIsAvatarModalOpen(true)}
                        className="text-xs text-primary text-left hover:underline"
                    >
                        Canviar foto
                    </button>
                </div>
            </div>

             {isAdmin && (
                  <Link 
                    to="/keyper"
                    className="w-full bg-primary/10 py-3 rounded-lg font-bold text-primary text-center flex items-center justify-center gap-2 border border-primary/20"
                  >
                    <span className="material-symbols-outlined">dashboard</span> Tornar a Gestió
                  </Link>
                )}
                <button 
                  onClick={onLogout}
                  className="w-full bg-red-50 dark:bg-red-900/10 py-3 rounded-lg font-bold text-red-600 dark:text-red-400 text-center flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">logout</span> Tancar Sessió
                </button>

            <AvatarUpload 
                isOpen={isAvatarModalOpen} 
                onClose={() => setIsAvatarModalOpen(false)}
                onUploadComplete={handleAvatarUpdate}
                currentAvatarUrl={profile?.avatar_url}
            />
        </div>
    )
  }

  // Versió Escriptori (Dropdown)
  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary text-white flex items-center justify-center border-2 border-white dark:border-background-dark shadow-sm">
            {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
                <span className="font-bold text-sm">
                    {profile?.email ? getInitials(profile.email) : 'U'}
                </span>
            )}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden xl:block max-w-[100px] truncate">
            {profile?.full_name || 'El meu compte'}
        </span>
        <span className="material-symbols-outlined text-slate-400 text-[18px]">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden py-2 animate-fade-in z-50">
           <div className="px-4 py-3 border-b border-gray-50 dark:border-white/5 mb-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {profile?.full_name || 'Usuari'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                    {profile?.email}
                </p>
           </div>
           
           <button
                onClick={() => {
                    setIsOpen(false);
                    setIsAvatarModalOpen(true);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
           >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                Canviar Foto de Perfil
           </button>

           {isAdmin && (
               <Link
                    to="/keyper"
                    onClick={() => setIsOpen(false)}
                    className="w-full block text-left px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2"
               >
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    Gestió
               </Link>
           )}

           <div className="h-px bg-gray-100 dark:bg-white/5 my-2"></div>

           <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2"
           >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sortir
           </button>
        </div>
      )}

      <AvatarUpload 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)}
        onUploadComplete={handleAvatarUpdate}
        currentAvatarUrl={profile?.avatar_url}
      />
    </div>
  );
};

export default UserMenu;
