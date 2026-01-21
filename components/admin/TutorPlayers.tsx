import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/userService';
import { PlayerGuardian, User } from '../../types';

const TutorPlayers: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<PlayerGuardian[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [editingPlayer, setEditingPlayer] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Data
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (user) {
      loadPlayers();
    }
  }, [user]);

  const loadPlayers = async () => {
    try {
      if (!user?.id) return;
      const data = await UserService.getManagedPlayers(user.id);
      setPlayers(data || []);
    } catch (err) {
      console.error('Error loading players:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (playerData: User) => {
    setEditingPlayer(playerData);
    setFormData({
      full_name: playerData.full_name,
      birth_date: playerData.birth_date,
      dni: playerData.dni,
      shirt_size: playerData.shirt_size,
      allergies: playerData.allergies,
      phone_secondary: playerData.phone_secondary,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlayer(null);
    setFormData({});
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer?.id) return;

    setSaving(true);
    try {
      await UserService.updateUser(editingPlayer.id, formData);
      // Reload list to show changes
      await loadPlayers();
      handleCloseModal();
    } catch (err) {
      console.error('Error updating player:', err);
      alert('Error al guardar les dades del jugador');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregant jugadors...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold dark:text-white">Els meus Jugadors</h1>
        <button 
          onClick={() => alert("Per afegir un nou jugador, posa't en contacte amb l'administració del club.")}
          className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          + Afegir Jugador
        </button>
      </div>
      
      {players.length === 0 ? (
        <div className="bg-white dark:bg-surface-dark p-8 rounded-xl text-center border border-gray-200 dark:border-white/10">
          <p className="text-gray-500">No tens cap jugador vinculat al teu compte.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((pg) => {
             const p = pg.player;
             if (!p) return null;
             
             return (
              <div key={pg.id} className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden flex items-center justify-center">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl text-gray-400">person</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-white">{p.full_name}</h3>
                    <p className="text-sm text-gray-500">{pg.relationship_type}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 flex-1">
                  <p><span className="font-semibold">Equip:</span> {p.teams && p.teams.length > 0 ? p.teams[0].name : 'Sense equip'}</p>
                  <p><span className="font-semibold">DNI:</span> {p.dni || '-'}</p>
                  <p><span className="font-semibold">Naixement:</span> {p.birth_date || '-'}</p>
                  <p><span className="font-semibold">Talla:</span> {p.shirt_size || '-'}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-white/10">
                  <button 
                    onClick={() => handleEditClick(p)}
                    className="w-full bg-gray-50 hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Editar Dades
                  </button>
                </div>
              </div>
             );
          })}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold dark:text-white">Editar Jugador</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom Complet</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleFormChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Naixement</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date || ''}
                    onChange={handleFormChange}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">DNI / NIE</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni || ''}
                    onChange={handleFormChange}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Talla Samarreta</label>
                  <select
                    name="shirt_size"
                    value={formData.shirt_size || ''}
                    onChange={handleFormChange}
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  >
                    <option value="">Selecciona...</option>
                    <option value="6Y">6 Anys</option>
                    <option value="8Y">8 Anys</option>
                    <option value="10Y">10 Anys</option>
                    <option value="12Y">12 Anys</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telèfon (Fill)</label>
                  <input
                    type="tel"
                    name="phone_secondary"
                    value={formData.phone_secondary || ''}
                    onChange={handleFormChange}
                    placeholder="Opcional"
                    className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Al·lèrgies / Observacions Mèdiques</label>
                <textarea
                  name="allergies"
                  value={formData.allergies || ''}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  placeholder="Escriu aquí qualsevol al·lèrgia o condició important..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  Cancel·lar
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardant...' : 'Guardar Canvis'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorPlayers;
