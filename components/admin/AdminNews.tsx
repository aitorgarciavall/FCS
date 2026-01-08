import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NewsItem } from '../../types';
import { NewsService } from '../../services/newsService';
import { useAuth } from '../../hooks/useAuth';

const AdminNews: React.FC = () => {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  
  // Estats locals per UI (edició, formularis)
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentNewsItem, setCurrentNewsItem] = useState<Partial<NewsItem>>({});

  // 1. React Query: Obtenir notícies (amb caché automàtica)
  const { data: news = [], isLoading, isError, error } = useQuery({
    queryKey: ['news'],
    queryFn: NewsService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minuts sense refrescar
  });

  // 2. React Query: Mutacions (Crear/Editar)
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (currentNewsItem.id) {
        return NewsService.update(currentNewsItem.id, {
          title: currentNewsItem.title,
          description: currentNewsItem.description,
          category: currentNewsItem.category,
          imageUrl: currentNewsItem.imageUrl,
        }, selectedFile || undefined);
      } else {
        return NewsService.create({
          title: currentNewsItem.title || 'Sense títol',
          description: currentNewsItem.description || '',
          category: currentNewsItem.category || 'Club',
          imageUrl: currentNewsItem.imageUrl || '',
        }, selectedFile || undefined);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] }); // Refresca la llista automàticament
      setIsEditing(false);
      setCurrentNewsItem({});
      setSelectedFile(null);
    },
    onError: () => {
      alert("Error al guardar la notícia.");
    }
  });

  // 3. React Query: Mutació (Esborrar)
  const deleteMutation = useMutation({
    mutationFn: NewsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
    onError: () => {
      alert("Error esborrant la notícia.");
    }
  });

  const canEditNews = () => hasRole('SUPER_ADMIN') || hasRole('COORDINATOR');

  const handleEditNews = (item: NewsItem) => {
    if (!canEditNews()) return alert("No tens permisos.");
    setCurrentNewsItem(item);
    setIsEditing(true);
    setSelectedFile(null);
  };

  const handleDeleteNews = (id: string) => {
    if (!canEditNews()) return alert("No tens permisos.");
    if (confirm('Estàs segur?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditNews()) return alert("No tens permisos.");
    saveMutation.mutate();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">Gestió de Notícies</h2>
        {canEditNews() && (
          <button 
            onClick={() => { setIsEditing(true); setCurrentNewsItem({}); setSelectedFile(null); }}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span> Nova Notícia
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-lg border border-gray-200 dark:border-white/10 max-w-2xl">
          <h3 className="text-lg font-bold mb-4 dark:text-white">{currentNewsItem.id ? 'Editar' : 'Crear'} Notícia</h3>
          <form onSubmit={handleSaveNews} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Títol</label>
              <input type="text" className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={currentNewsItem.title || ''} onChange={e => setCurrentNewsItem({...currentNewsItem, title: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multimèdia</label>
              <input type="file" accept="image/*,video/*" onChange={e => e.target.files && setSelectedFile(e.target.files[0])}
                className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white"
                value={currentNewsItem.category || ''} onChange={e => setCurrentNewsItem({...currentNewsItem, category: e.target.value})}>
                <option value="Club">Club</option>
                <option value="Primer Equip">Primer Equip</option>
                <option value="Futbol Base">Futbol Base</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripció</label>
              <textarea className="w-full px-4 py-2 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-white h-32"
                value={currentNewsItem.description || ''} onChange={e => setCurrentNewsItem({...currentNewsItem, description: e.target.value})} required></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsEditing(false)} disabled={saveMutation.isPending} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/10 rounded-lg">Cancel·lar</button>
              <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2">
                {saveMutation.isPending ? 'Guardant...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
              Carregant...
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4 text-red-500">Error carregant notícies: {error.message}</p>
              <button 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['news'] })}
                className="text-primary font-bold hover:underline"
              >
                Torna-ho a provar
              </button>
            </div>
          ) : news.length === 0 ? (
             <div className="p-12 text-center text-gray-500">
              <p className="mb-4">No s'han trobat notícies.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Títol</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Categoria</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Accions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {news.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4 font-medium dark:text-white">{item.title}</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">{item.category}</span></td>
                    <td className="px-6 py-4 text-right">
                      {canEditNews() && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditNews(item)} className="text-blue-500 p-2"><span className="material-symbols-outlined">edit</span></button>
                          <button onClick={() => handleDeleteNews(item.id)} className="text-red-500 p-2"><span className="material-symbols-outlined">delete</span></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNews;