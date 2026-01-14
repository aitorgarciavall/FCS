import React, { useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/canvasUtils';
import { supabase } from '../services/supabaseClient';
import { UserService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadComplete: (newUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ currentAvatarUrl, onUploadComplete, isOpen, onClose }) => {
  const { user } = useAuth();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setZoom(1);
      setError(null);
    }
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels || !user) return;

    try {
      setUploading(true);
      setError(null);

      // 1. Obtenir el blob retallat
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error('No s\'ha pogut crear la imatge retallada');

      // 2. Preparar el nom del fitxer
      const fileName = `${user.id}/${Date.now()}.jpg`;
      const filePath = `${fileName}`;

      // 3. Pujar a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedImageBlob, {
           upsert: true
        });

      if (uploadError) {
          if (uploadError.message.includes("Bucket not found")) {
               throw new Error("L'emmagatzematge 'avatars' no existeix. Contacta amb l'administrador.");
          }
          throw uploadError;
      }

      // 4. Obtenir la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 5. Actualitzar l'usuari
      await UserService.updateUser(user.id, { avatar_url: publicUrl });

      // 6. Finalitzar
      onUploadComplete(publicUrl);
      onClose();
      setImageSrc(null); // Reset
    } catch (e: any) {
      console.error('Error uploading avatar:', e);
      setError(e.message || 'Error al pujar la imatge');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0 pointer-events-none">
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-surface-dark text-left shadow-2xl transition-all sm:my-8 w-full max-w-md flex flex-col pointer-events-auto border border-white/10">
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Foto de Perfil</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {!imageSrc ? (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 shadow-inner">
                    {currentAvatarUrl ? (
                        <img src={currentAvatarUrl} alt="Avatar actual" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <span className="material-symbols-outlined text-5xl">person</span>
                        </div>
                    )}
                </div>
              <p className="text-sm text-gray-500 text-center mb-2">Puja una nova foto per personalitzar el teu perfil.</p>
              
              <label className="cursor-pointer bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transform hover:-translate-y-0.5">
                <span className="material-symbols-outlined">upload</span>
                Seleccionar Foto
                <input type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
              </label>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-64 bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-white/10">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <div className="px-2">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zoom</label>
                    <span className="text-xs text-gray-400">{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
                />
              </div>

               <div className="flex justify-end gap-2 mt-2">
                  <button 
                    onClick={() => setImageSrc(null)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Canviar foto
                  </button>
               </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2 border border-red-100 dark:border-red-900/30">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
            </div>
          )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black/20 flex justify-end gap-3">
              <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  disabled={uploading}
              >
                  Cancel·lar
              </button>
              {imageSrc && (
                   <button
                   onClick={handleSave}
                   disabled={uploading}
                   className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-primary/20"
               >
                   {uploading ? (
                       <>
                          <span className="animate-spin material-symbols-outlined text-lg">progress_activity</span>
                          Guardant...
                       </>
                   ) : (
                       'Guardar Foto'
                   )}
               </button>
              )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AvatarUpload;
