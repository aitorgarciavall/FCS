import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = 'alert' | 'confirm' | 'error' | 'success' | 'prompt';

interface ModalOptions {
  title?: string;
  message: string;
  type?: ModalType;
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
  placeholder?: string;
}

interface ModalContextType {
  showAlert: (options: string | ModalOptions) => Promise<void>;
  showConfirm: (options: string | ModalOptions) => Promise<boolean>;
  showPrompt: (options: string | ModalOptions) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<ModalOptions & { resolve: (val: any) => void }>({
    message: '',
    resolve: () => {},
  });

  const showAlert = (opt: string | ModalOptions): Promise<void> => {
    const baseOptions = typeof opt === 'string' ? { message: opt } : opt;
    return new Promise((resolve) => {
      setOptions({
        ...baseOptions,
        type: baseOptions.type || 'alert',
        confirmText: baseOptions.confirmText || 'D\'acord',
        resolve,
      });
      setIsOpen(true);
    });
  };

  const showConfirm = (opt: string | ModalOptions): Promise<boolean> => {
    const baseOptions = typeof opt === 'string' ? { message: opt } : opt;
    return new Promise((resolve) => {
      setOptions({
        ...baseOptions,
        type: baseOptions.type || 'confirm',
        confirmText: baseOptions.confirmText || 'Confirmar',
        cancelText: baseOptions.cancelText || 'Cancel·lar',
        resolve,
      });
      setIsOpen(true);
    });
  };

  const showPrompt = (opt: string | ModalOptions): Promise<string | null> => {
    const baseOptions = typeof opt === 'string' ? { message: opt } : opt;
    return new Promise((resolve) => {
      setInputValue(baseOptions.defaultValue || '');
      setOptions({
        ...baseOptions,
        type: 'prompt',
        confirmText: baseOptions.confirmText || 'Acceptar',
        cancelText: baseOptions.cancelText || 'Cancel·lar',
        resolve,
      });
      setIsOpen(true);
    });
  };

  const handleClose = (result: any) => {
    setIsOpen(false);
    if (options.type === 'prompt') {
      options.resolve(result ? inputValue : null);
    } else {
      options.resolve(result);
    }
    setInputValue('');
  };

  const getIcon = () => {
    switch (options.type) {
      case 'error': return <span className="material-symbols-outlined text-red-500 text-5xl">error</span>;
      case 'success': return <span className="material-symbols-outlined text-green-500 text-5xl">check_circle</span>;
      case 'confirm': return <span className="material-symbols-outlined text-amber-500 text-5xl">help</span>;
      case 'prompt': return <span className="material-symbols-outlined text-blue-500 text-5xl">edit_note</span>;
      default: return <span className="material-symbols-outlined text-primary text-5xl">info</span>;
    }
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform animate-scale-up border border-gray-100 dark:border-white/10">
            <div className="p-8 text-center">
              <div className="mb-4 flex justify-center">
                {getIcon()}
              </div>
              <h3 className="text-xl font-bold dark:text-white mb-2">
                {options.title || (options.type === 'confirm' ? 'Confirmació' : options.type === 'prompt' ? 'Introdueix dades' : 'Avís')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {options.message}
              </p>
              
              {options.type === 'prompt' && (
                <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={options.placeholder}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleClose(true);
                    if (e.key === 'Escape') handleClose(false);
                  }}
                />
              )}
            </div>
            <div className="flex border-t border-gray-100 dark:border-white/10">
              {(options.type === 'confirm' || options.type === 'prompt') && (
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 px-4 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-r border-gray-100 dark:border-white/10"
                >
                  {options.cancelText}
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className={`flex-1 px-4 py-4 text-sm font-bold transition-colors hover:opacity-90 ${options.type === 'error' ? 'text-red-500' : 'text-primary'}`}
              >
                {options.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within a ModalProvider');
  return context;
};