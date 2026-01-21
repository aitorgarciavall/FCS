import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/userService';
import { User } from '../../types';

const TutorProfile: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user?.id) return;
      const data = await UserService.getUserById(user.id);
      if (data) {
        setFormData(data);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      await UserService.updateUser(user.id, {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        dni: formData.dni,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        // Evitem editar email directament aquí per seguretat (requereix confirmació normalment)
      });
      setMessage({ type: 'success', text: 'Perfil actualitzat correctament' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Error al guardar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregant perfil...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">El meu Perfil</h1>
      
      <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
        
        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Dades Bàsiques */}
            <div className="col-span-2">
              <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:text-white dark:border-white/10">Dades Personals</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom Complet</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI / NIE</label>
              <input
                type="text"
                name="dni"
                value={formData.dni || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telèfon</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (No editable)</label>
              <input
                type="email"
                value={formData.email || ''}
                disabled
                className="w-full p-2 rounded-lg border border-gray-300 bg-gray-100 dark:bg-white/5 dark:border-white/5 dark:text-gray-400 cursor-not-allowed"
              />
            </div>

            {/* Adreça */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-bold mb-4 border-b pb-2 dark:text-white dark:border-white/10">Adreça</h3>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carrer i número</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Població</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Codi Postal</label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code || ''}
                onChange={handleChange}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
              />
            </div>

          </div>

          <div className="flex justify-end pt-6 border-t dark:border-white/10">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Guardant...' : 'Guardar Canvis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorProfile;
