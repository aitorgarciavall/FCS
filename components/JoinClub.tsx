import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

// Tipus per al formulari
interface RegistrationData {
  // Dades Jugador
  player: {
    name: string;
    surname: string;
    dni: string;
    birthDate: string;
    email: string; // Opcional si és menor
    phone: string; // Opcional
    address: string;
    city: string;
    postalCode: string;
    shirtSize: string;
    allergies: string;
  };
  // Dades Tutor
  guardian: {
    isSameAsPlayer: boolean; // Si és major d'edat i paga ell mateix
    name: string;
    surname: string;
    dni: string;
    email: string; // Obligatori pel login del tutor
    phone: string;
    relationship: string; // Pare, Mare, Tutor...
  };
  // Dades SEPA
  sepa: {
    iban: string;
    holderName: string;
    swift: string;
    acceptedTerms: boolean;
  };
}

const INITIAL_DATA: RegistrationData = {
  player: { name: '', surname: '', dni: '', birthDate: '', email: '', phone: '', address: '', city: '', postalCode: '', shirtSize: '', allergies: '' },
  guardian: { isSameAsPlayer: false, name: '', surname: '', dni: '', email: '', phone: '', relationship: 'Pare/Mare' },
  sepa: { iban: '', holderName: '', swift: '', acceptedTerms: false }
};

const JoinClub: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (section: keyof RegistrationData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleGuardianCheck = (checked: boolean) => {
    setData(prev => ({
      ...prev,
      guardian: { 
        ...prev.guardian, 
        isSameAsPlayer: checked,
        // Si és el mateix, pre-omplim amb dades del jugador
        name: checked ? prev.player.name : '',
        surname: checked ? prev.player.surname : '',
        dni: checked ? prev.player.dni : '',
        email: checked ? prev.player.email : '',
        phone: checked ? prev.player.phone : '',
        relationship: checked ? 'Self' : 'Pare/Mare'
      }
    }));
  };

  const validateStep = (currentStep: number): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (!data.player.name || !data.player.surname || !data.player.birthDate || !data.player.dni) {
        setError("Si us plau, omple els camps obligatoris del jugador.");
        return false;
      }
      // Check simple edat
      const birth = new Date(data.player.birthDate);
      const age = new Date().getFullYear() - birth.getFullYear();
      if (age < 18 && data.guardian.isSameAsPlayer) {
         setError("Un menor no pot ser el seu propi tutor legal.");
         return false;
      }
    }
    if (currentStep === 2) {
      if (!data.guardian.isSameAsPlayer) {
          if (!data.guardian.name || !data.guardian.email || !data.guardian.dni) {
             setError("Si us plau, omple les dades del tutor.");
             return false;
          }
      }
    }
    if (currentStep === 3) {
        if (!data.sepa.iban || !data.sepa.holderName || !data.sepa.acceptedTerms) {
            setError("Les dades bancàries i l'acceptació són obligatòries.");
            return false;
        }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setIsLoading(true);
    
    try {
        console.log("Enviant dades via API Server...");
        
        // Cridem al nostre backend en lloc de la funció SQL directa
        // Això garanteix que l'usuari es crea correctament amb totes les metadades d'Auth
        const response = await fetch('http://localhost:3001/api/register-family', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guardian: data.guardian,
                player: data.player,
                sepa: data.sepa
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.error || "Error desconegut en el registre.");
        }

        alert("Inscripció realitzada correctament! L'usuari ha estat creat. Pots accedir amb l'email del tutor i la contrasenya temporal: tempPassword123!");
        navigate('/');
    } catch (err: any) {
        console.error(err);
        setError(err.message || "Hi ha hagut un error en processar la sol·licitud.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background-dark pt-24 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Fes-te del Santpedor!
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Formulari d'inscripció temporada 2025-2026.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-8 px-4 relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-white/10 -z-0"></div>
            {[1, 2, 3, 4].map(s => (
                <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'}`}>
                    {s}
                </div>
            ))}
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100 dark:border-white/10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
                <span className="material-symbols-outlined">error</span>
                {error}
            </div>
          )}

          {/* STEP 1: JUGADOR */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span> Dades del Jugador
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nom *</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            value={data.player.name} onChange={e => updateField('player', 'name', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cognoms *</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            value={data.player.surname} onChange={e => updateField('player', 'surname', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">DNI / NIE *</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            value={data.player.dni} onChange={e => updateField('player', 'dni', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Data Naixement *</label>
                        <input type="date" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            value={data.player.birthDate} onChange={e => updateField('player', 'birthDate', e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Adreça Completa</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            value={data.player.address} onChange={e => updateField('player', 'address', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Població</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            value={data.player.city} onChange={e => updateField('player', 'city', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Codi Postal</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            value={data.player.postalCode} onChange={e => updateField('player', 'postalCode', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Talla Samarreta</label>
                        <select className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white"
                            value={data.player.shirtSize} onChange={e => updateField('player', 'shirtSize', e.target.value)}>
                            <option value="">Selecciona...</option>
                            <option value="6-8">6-8 Anys</option>
                            <option value="8-10">8-10 Anys</option>
                            <option value="10-12">10-12 Anys</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Al·lèrgies / Mèdic</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            placeholder="Cap o especificar..."
                            value={data.player.allergies} onChange={e => updateField('player', 'allergies', e.target.value)} />
                    </div>
                </div>
            </div>
          )}

          {/* STEP 2: TUTOR */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">supervisor_account</span> Dades del Tutor/Responsable
                </h3>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-500/30">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 text-primary rounded" 
                            checked={data.guardian.isSameAsPlayer}
                            onChange={(e) => handleGuardianCheck(e.target.checked)}
                        />
                        <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                            Sóc major d'edat i el meu propi responsable.
                        </span>
                    </label>
                </div>

                {!data.guardian.isSameAsPlayer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Nom *</label>
                            <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                                value={data.guardian.name} onChange={e => updateField('guardian', 'name', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Cognoms *</label>
                            <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                                value={data.guardian.surname} onChange={e => updateField('guardian', 'surname', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">DNI / NIE *</label>
                            <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                                value={data.guardian.dni} onChange={e => updateField('guardian', 'dni', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Relació</label>
                            <select className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white"
                                value={data.guardian.relationship} onChange={e => updateField('guardian', 'relationship', e.target.value)}>
                                <option value="Pare">Pare</option>
                                <option value="Mare">Mare</option>
                                <option value="Tutor Legal">Tutor Legal</option>
                                <option value="Altre">Altre</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email (Usuari d'accés) *</label>
                            <input type="email" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                                value={data.guardian.email} onChange={e => updateField('guardian', 'email', e.target.value)} />
                            <p className="text-[10px] text-gray-400 mt-1">Aquest email s'utilitzarà per accedir a l'Àrea Privada.</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Telèfon *</label>
                            <input type="tel" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                                value={data.guardian.phone} onChange={e => updateField('guardian', 'phone', e.target.value)} />
                        </div>
                    </div>
                )}
            </div>
          )}

          {/* STEP 3: SEPA */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">account_balance</span> Dades de Pagament (SEPA)
                </h3>
                
                <p className="text-sm text-gray-500 bg-gray-50 dark:bg-white/5 p-3 rounded">
                    La quota de soci i les mensualitats es giraran a aquest compte bancari.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Titular del Compte *</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white" 
                            placeholder="Nom complet del titular"
                            value={data.sepa.holderName} onChange={e => updateField('sepa', 'holderName', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">IBAN *</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white font-mono" 
                            placeholder="ESXX XXXX XXXX XXXX XXXX XXXX"
                            value={data.sepa.iban} onChange={e => updateField('sepa', 'iban', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">BIC / SWIFT (Opcional)</label>
                        <input type="text" className="w-full p-2 rounded border dark:bg-white/5 dark:border-white/10 dark:text-white font-mono" 
                            value={data.sepa.swift} onChange={e => updateField('sepa', 'swift', e.target.value)} />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 mt-0.5 text-primary rounded" 
                             checked={data.sepa.acceptedTerms} onChange={e => updateField('sepa', 'acceptedTerms', e.target.checked)} />
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                            Autoritzo al CF Santpedor a enviar instruccions a l'entitat financera del deutor per carregar al seu compte i a l'entitat financera per carregar els imports segons les instruccions del creditor. Aquest mandat és per a pagaments recurrents.
                        </span>
                    </label>
                </div>
            </div>
          )}

          {/* STEP 4: CONFIRMACIÓ */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-4xl">check</span>
                </div>
                <h3 className="text-2xl font-bold dark:text-white">Tot a punt!</h3>
                <p className="text-gray-500">
                    Revisa que les dades siguin correctes abans d'enviar la sol·licitud.
                    Es crearà un usuari pel <strong>Tutor</strong> ({data.guardian.email}) i es vincularà al jugador <strong>{data.player.name}</strong>.
                </p>

                <div className="bg-gray-50 dark:bg-white/5 text-left p-4 rounded-xl text-sm space-y-2 max-w-md mx-auto">
                    <p><strong>Jugador:</strong> {data.player.name} {data.player.surname}</p>
                    <p><strong>Tutor:</strong> {data.guardian.isSameAsPlayer ? 'El mateix jugador' : `${data.guardian.name} ${data.guardian.surname}`}</p>
                    <p><strong>IBAN:</strong> {data.sepa.iban}</p>
                </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-white/10">
            {step > 1 ? (
                <button onClick={prevStep} className="px-6 py-2 text-gray-500 hover:text-gray-800 dark:hover:text-white font-bold transition-colors">
                    Enrere
                </button>
            ) : <div></div>}
            
            {step < 4 ? (
                <button onClick={nextStep} className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-bold transition-all shadow-lg shadow-primary/20">
                    Següent
                </button>
            ) : (
                <button onClick={handleSubmit} disabled={isLoading} className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition-all shadow-lg shadow-green-600/20 flex items-center gap-2">
                    {isLoading ? 'Processant...' : 'Confirmar Inscripció'}
                </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinClub;
