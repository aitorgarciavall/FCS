
import React, { useState, useRef, useEffect } from 'react';
import { getClubAssistantResponse } from '../services/geminiService';
import { Message } from '../types';

const ClubAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hola! Soc l\'assistent del CF Santpedor. En què et puc ajudar avui?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const responseText = await getClubAssistantResponse(userMsg);
    setMessages(prev => [...prev, { role: 'model', text: responseText || 'No he pogut respondre ara mateix.' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="bg-white dark:bg-surface-dark w-[350px] max-w-[calc(100vw-3rem)] h-[500px] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-white/10 overflow-hidden animate-fade-in">
          <div className="p-4 bg-primary text-background-dark flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">smart_toy</span>
              <span className="font-bold">Club AI Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-grow p-4 space-y-4 overflow-y-auto no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-background-dark rounded-br-none' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl animate-pulse text-sm">
                  Pensant...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-white/10 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escriu la teva consulta..."
              className="flex-grow bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-primary dark:text-white"
            />
            <button 
              onClick={handleSend}
              className="size-10 rounded-lg bg-primary text-background-dark flex items-center justify-center hover:bg-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="size-14 rounded-full bg-primary text-background-dark shadow-xl flex items-center justify-center hover:scale-110 transition-transform animate-bounce-slow"
        >
          <span className="material-symbols-outlined text-3xl">smart_toy</span>
        </button>
      )}
    </div>
  );
};

export default ClubAssistant;
