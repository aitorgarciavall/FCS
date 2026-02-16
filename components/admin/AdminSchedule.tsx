import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useModal } from '../../context/ModalContext';
import { scheduleService } from '../../services/scheduleService';
import { TrainingSession } from '../../types';

const AdminSchedule: React.FC = () => {
  const { user } = useAuth();
  const { showAlert, showConfirm } = useModal();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    day_of_week: 1,
    start_time: '17:00',
    end_time: '18:30',
    team_name: '',
    field_name: 'Camp Municipal',
    color: '#055894'
  });

  const PRESET_COLORS = [
    '#055894', // Blau (Principal)
    '#E11D48', // Vermell
    '#10B981', // Verd
    '#F59E0B', // Ambre
    '#8B5CF6', // Lila
    '#EC4899', // Rosa
    '#F97316', // Taronja
    '#06B6D4', // Cian
    '#374151', // Gris
    '#84CC16'  // Llima
  ];

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const data = await scheduleService.getSchedule();
      setSessions(data);
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (session: TrainingSession) => {
    setEditingId(session.id);
    setFormData({
      day_of_week: session.day_of_week,
      start_time: session.start_time.slice(0, 5),
      end_time: session.end_time.slice(0, 5),
      team_name: session.team_name,
      field_name: session.field_name || 'Camp Municipal',
      color: session.color || '#055894'
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      day_of_week: 1,
      start_time: '17:00',
      end_time: '18:30',
      team_name: '',
      field_name: 'Camp Municipal',
      color: '#055894'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const sessionData = {
        ...formData,
        start_time: formData.start_time.includes(':') && formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time,
        end_time: formData.end_time.includes(':') && formData.end_time.length === 5 ? `${formData.end_time}:00` : formData.end_time,
      };

      if (editingId) {
        await scheduleService.updateSession(editingId, sessionData);
        setEditingId(null);
      } else {
        await scheduleService.createSession(sessionData);
      }

      await loadSchedule();
      setFormData(prev => ({ ...prev, team_name: '', field_name: '' }));
      showAlert({ message: 'Horari guardat correctament!', type: 'success' });
    } catch (error: any) {
      showAlert({ message: 'Error guardant la sessió: ' + (error.message || error), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Segur que vols eliminar aquesta sessió?');
    if (!confirmed) return;
    try {
      await scheduleService.deleteSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (editingId === id) cancelEdit();
      showAlert({ message: 'Sessió eliminada.', type: 'success' });
    } catch (error: any) {
      console.error('Error deleting:', error);
      showAlert({ message: 'Error eliminant la sessió: ' + (error.message || error), type: 'error' });
    }
  };

  const days = [
    { id: 1, name: 'Dilluns' },
    { id: 2, name: 'Dimarts' },
    { id: 3, name: 'Dimecres' },
    { id: 4, name: 'Dijous' },
    { id: 5, name: 'Divendres' },
    { id: 6, name: 'Dissabte' },
    { id: 7, name: 'Diumenge' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#111813] ">Gestió d'Horaris</h1>
          <p className="text-slate-600 ">Defineix les franges d'entrenament setmanals.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white  p-6 rounded-xl shadow-sm border border-gray-200  sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold ">
                {editingId ? 'Editar Sessió' : 'Afegir Sessió'}
              </h3>
              {editingId && (
                <button 
                  onClick={cancelEdit}
                  className="text-xs text-red-500 hover:text-red-700 font-bold uppercase"
                >
                  Cancel·lar
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 ">Dia de la setmana</label>
                <select
                  value={formData.day_of_week}
                  onChange={e => setFormData({ ...formData, day_of_week: Number(e.target.value) })}
                  className="w-full rounded-lg border-gray-300  bg-gray-50  p-2.5 text-sm"
                >
                  {days.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 ">Hora Inici</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full rounded-lg border-gray-300  bg-gray-50  p-2.5 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 ">Hora Final</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full rounded-lg border-gray-300  bg-gray-50  p-2.5 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 ">Equip / Grup</label>
                <input
                  type="text"
                  value={formData.team_name}
                  onChange={e => setFormData({ ...formData, team_name: e.target.value })}
                  placeholder="Ex: Benjamí A"
                  className="w-full rounded-lg border-gray-300  bg-gray-50  p-2.5 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 ">Color de l'etiqueta</label>
                <div className="grid grid-cols-5 gap-2 p-2 bg-gray-50  rounded-lg border border-gray-200 ">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`h-8 w-full rounded-md border-2 transition-all ${
                        formData.color === c ? 'border-primary scale-110 shadow-md ring-2 ring-primary/20' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary-dark'}`}
              >
                {isSubmitting ? 'Guardant...' : (editingId ? 'Actualitzar Horari' : 'Afegir Horari')}
              </button>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white  rounded-xl shadow-sm border border-gray-200  overflow-hidden">
            <div className="p-4 border-b border-gray-200  bg-gray-50 ">
              <h3 className="font-bold ">Sessions Programades</h3>
            </div>
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No hi ha sessions programades.</div>
            ) : (
              <div className="divide-y divide-gray-100 ">
                {days.map(day => {
                  const daySessions = sessions.filter(s => s.day_of_week === day.id);
                  if (daySessions.length === 0) return null;

                  return (
                    <div key={day.id} className="p-4">
                      <h4 className="font-bold text-[#055894] mb-2 text-sm uppercase tracking-wider">{day.name}</h4>
                      <div className="space-y-2">
                        {daySessions.map(session => {
                          // Determinant color nítid consistent amb ScheduleSection
                          const getVividColor = (name: string, storedColor?: string) => {
                            if (storedColor) {
                              return {
                                border: `border-[${storedColor}]`,
                                bg: `bg-[${storedColor}]/5`,
                                text: `text-[${storedColor}]`,
                                style: { 
                                  borderColor: storedColor, 
                                  backgroundColor: `${storedColor}10`, // 10 opacitat en hex
                                  color: storedColor 
                                }
                              };
                            }

                            const colors = [
                              { border: 'border-[#055894]', bg: 'bg-[#055894]/5', text: 'text-[#033b63]', style: {} },
                              { border: 'border-[#550000]', bg: 'bg-[#550000]/5', text: 'text-[#550000]', style: {} },
                              { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', style: {} },
                              { border: 'border-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', style: {} },
                              { border: 'border-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', style: {} },
                            ];
                            let hash = 0;
                            for (let i = 0; i < name.length; i++) {
                              hash = name.charCodeAt(i) + ((hash << 5) - hash);
                            }
                            return colors[Math.abs(hash) % colors.length];
                          };
                          
                          const colorData = getVividColor(session.team_name, session.color);

                          return (
                            <div 
                              key={session.id} 
                              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${editingId === session.id ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400/20' : `${colorData.border} ${colorData.bg} ${colorData.text}`}`}
                              style={editingId === session.id ? {} : colorData.style}
                            >
                              <div className="flex items-center gap-4">
                                <div className="text-sm font-mono font-bold">
                                  {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                                </div>
                                <div>
                                  <div className="font-black uppercase tracking-tight">{session.team_name}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEdit(session)}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-white :bg-white/10 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete(session.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 :bg-red-900/20 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </div>
                        )})}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedule;
