import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserService } from '../../services/userService';
import { SepaInfo } from '../../types';

const TutorBilling: React.FC = () => {
  const { user } = useAuth();
  const [sepaData, setSepaData] = useState<Partial<SepaInfo>>({
    iban: '',
    account_holder: '',
    swift_bic: '',
    is_active: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      loadSepaInfo();
    }
  }, [user]);

  const loadSepaInfo = async () => {
    try {
      if (!user?.id) return;
      const data = await UserService.getSepaInfo(user.id);
      if (data) {
        setSepaData(data);
      } else {
        // Pre-fill account holder with user name if empty
        const userProfile = await UserService.getUserById(user.id);
        if (userProfile?.full_name) {
          setSepaData(prev => ({ ...prev, account_holder: userProfile.full_name }));
        }
      }
    } catch (err) {
      console.error('Error loading SEPA info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSepaData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    setMessage(null);

    try {
      await UserService.upsertSepaInfo({
        user_id: user.id,
        iban: sepaData.iban,
        account_holder: sepaData.account_holder,
        swift_bic: sepaData.swift_bic,
        is_active: true // Always force active for the primary record for now
      });
      setMessage({ type: 'success', text: 'Dades bancàries actualitzades correctament' });
    } catch (err) {
      console.error('Error updating SEPA info:', err);
      setMessage({ type: 'error', text: 'Error al guardar les dades bancàries' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregant dades de facturació...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold dark:text-white">Dades de Facturació</h1>
      
      <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
        
        <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
          <p className="font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">info</span>
            Domiciliació Bancària (SEPA)
          </p>
          <p className="mt-1">
            Aquestes dades s'utilitzaran per girar els rebuts de les quotes dels jugadors associats al teu compte.
          </p>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titular del Compte</label>
              <input
                type="text"
                name="account_holder"
                value={sepaData.account_holder || ''}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                placeholder="Nom i Cognoms"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN</label>
              <input
                type="text"
                name="iban"
                value={sepaData.iban || ''}
                onChange={handleChange}
                required
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-white/10 dark:bg-black/20 dark:text-white"
                placeholder="ESXX XXXX XXXX XXXX XXXX XXXX"
              />
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SWIFT / BIC (Opcional)</label>
              <input
                type="text"
                name="swift_bic"
                value={sepaData.swift_bic || ''}
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
              {saving ? 'Guardant...' : 'Guardar Dades Bancàries'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorBilling;
