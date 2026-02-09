import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { MessageService } from '../../services/messageService';
import { UserService } from '../../services/userService';
import { UserMessage, User, Role } from '../../types';
import { supabase } from '../../services/supabaseClient';

export const MessagesSection: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'new'>('inbox');
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);
  
  // New Message Form State
  const [toType, setToType] = useState<'user' | 'role'>('user');
  const [recipients, setRecipients] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Load messages on tab change
  useEffect(() => {
    if (!user) return;
    loadMessages();

    // Subscribe to realtime updates if in inbox
    let subscription: any = null;
    if (activeTab === 'inbox') {
      subscription = MessageService.subscribeToMessages(user.id, () => {
         // When a new message arrives, reload the list
         // We could toast here too
         loadMessages();
      });
    }

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user, activeTab]);

  // Load users/roles when 'new' tab is active
  useEffect(() => {
    if (activeTab === 'new') {
      loadRecipients();
    }
  }, [activeTab]);

  const loadMessages = async () => {
    if (!user) return;
    setLoading(true);
    setSelectedMessage(null); // Deselect when changing tabs
    try {
        if (activeTab === 'inbox') {
            const data = await MessageService.getMyMessages(user.id);
            setMessages(data);
        } else if (activeTab === 'sent') {
            const data = await MessageService.getSentMessages(user.id);
            setMessages(data);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const loadRecipients = async () => {
     try {
         const allUsers = await UserService.getAllUsers();
         setRecipients(allUsers.filter(u => u.id !== user?.id));
         
         const allRoles = await UserService.getAllRoles();
         // Filter roles: Cannot broadcast to PLAYER or GUARDIAN (prevent spam)
         setRoles(allRoles.filter(r => r.code !== 'PLAYER' && r.code !== 'GUARDIAN'));
     } catch (err) {
         console.error(err);
     }
  };

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setLoading(true);
      setStatus(null);
      
      try {
          if (toType === 'user') {
              if (!selectedRecipient) throw new Error("Selecciona un destinatari");
              await MessageService.sendMessage(user.id, selectedRecipient, subject, content);
          } else {
              if (!selectedRecipient) throw new Error("Selecciona un rol");
              await MessageService.sendBroadcast(user.id, selectedRecipient, subject, content);
          }
          setStatus({ type: 'success', text: 'Missatge enviat correctament!' });
          setSubject('');
          setContent('');
          setSelectedRecipient('');
          // Optional: redirect to sent
          setTimeout(() => {
              setActiveTab('sent');
              setStatus(null);
          }, 1500);
      } catch (err: any) {
          setStatus({ type: 'error', text: 'Error enviant missatge: ' + err.message });
      } finally {
          setLoading(false);
      }
  };
  
  const handleRead = async (msg: UserMessage) => {
      setSelectedMessage(msg);
      if (!msg.is_read && activeTab === 'inbox' && user) {
          try {
            await MessageService.markAsRead(msg.id);
            setMessages(prev => prev.map(m => m.id === msg.id ? {...m, is_read: true} : m));
          } catch(e) {
            console.error("Failed to mark as read", e);
          }
      }
  };

  const handleDelete = async (msgId: string) => {
      if(!window.confirm("Estàs segur d'esborrar aquest missatge?")) return;
      if (!user) return; // Ensure user exists
      try {
          await MessageService.deleteMessage(msgId, user.id);
          setMessages(prev => prev.filter(m => m.id !== msgId));
          if(selectedMessage?.id === msgId) setSelectedMessage(null);
      } catch(e) {
          console.error("Error deleting", e);
      }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">mail</span>
          Missatgeria
        </h1>
        <div className="flex gap-2">
            <button 
                onClick={loadMessages}
                disabled={loading}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Refrescar"
            >
                <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
            <button 
                onClick={() => { setActiveTab('new'); setSelectedMessage(null); }}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
                <span className="material-symbols-outlined">add</span> Nou Missatge
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-4 flex flex-col gap-2">
           <button 
             onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
             className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'inbox' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
           >
             <span className="material-symbols-outlined">inbox</span> Rebuts
           </button>
           <button 
             onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
             className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === 'sent' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary font-bold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}
           >
             <span className="material-symbols-outlined">send</span> Enviats
           </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
            {activeTab === 'new' ? (
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl font-bold mb-6 dark:text-white">Redactar Nou Missatge</h2>
                    {status && (
                        <div className={`p-4 rounded-lg mb-4 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {status.text}
                        </div>
                    )}
                    <form onSubmit={handleSend} className="space-y-4">
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipus de Destinatari</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="toType" checked={toType === 'user'} onChange={() => setToType('user')} className="text-primary focus:ring-primary" />
                                    <span className="dark:text-gray-300">Usuari Específic</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="toType" checked={toType === 'role'} onChange={() => setToType('role')} className="text-primary focus:ring-primary" />
                                    <span className="dark:text-gray-300">Grup (Rol)</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {toType === 'user' ? 'Destinatari' : 'Rol Destí'}
                            </label>
                            <select 
                                value={selectedRecipient} 
                                onChange={(e) => setSelectedRecipient(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-surface-dark dark:text-white"
                                required
                            >
                                <option value="">Selecciona...</option>
                                {toType === 'user' ? (
                                    recipients.map(r => (
                                        <option key={r.id} value={r.id}>{r.full_name || r.email} {r.roles?.length ? `(${r.roles[0].name})` : ''}</option>
                                    ))
                                ) : (
                                    roles.map(r => (
                                        <option key={r.id} value={r.code}>{r.name}</option>
                                    ))
                                )}
                            </select>
                            {toType === 'role' && <p className="text-xs text-gray-500 mt-1">S'enviarà a tots els usuaris amb aquest rol.</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assumpte</label>
                            <input 
                                type="text" 
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full p-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-surface-dark dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Missatge</label>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full p-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-surface-dark dark:text-white"
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? 'Enviant...' : (
                                    <>
                                        <span className="material-symbols-outlined">send</span> Enviar
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex h-full flex-col md:flex-row gap-4">
                    {/* Message List */}
                    <div className={`${selectedMessage ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200 dark:border-white/10 overflow-y-auto pr-2`}>
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Carregant missatges...</div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No hi ha missatges.</div>
                        ) : (
                            <div className="space-y-2">
                                {messages.map(msg => (
                                    <div 
                                        key={msg.id}
                                        onClick={() => handleRead(msg)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedMessage?.id === msg.id ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5'} ${!msg.is_read && activeTab === 'inbox' ? 'bg-blue-50 dark:bg-blue-900/10 font-semibold' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">
                                                {activeTab === 'inbox' 
                                                    ? (msg.sender?.full_name || msg.sender?.email || 'Desconegut')
                                                    : (msg.receiver?.full_name || msg.receiver?.email || 'Desconegut')
                                                }
                                            </span>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{msg.subject}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Message Detail */}
                    <div className={`${selectedMessage ? 'block' : 'hidden md:block'} flex-1 pl-4 md:border-none border-t border-gray-200 pt-4 md:pt-0`}>
                        {selectedMessage ? (
                            <div className="h-full flex flex-col">
                                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold dark:text-white mb-2">{selectedMessage.subject}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => setSelectedMessage(null)} className="md:hidden text-gray-500">
                                                <span className="material-symbols-outlined">arrow_back</span>
                                            </button>
                                            <button onClick={() => handleDelete(selectedMessage.id)} className="text-red-500 hover:bg-red-50 rounded-full p-2" title="Esborrar">
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <div>
                                            <span className="font-bold">De:</span> {selectedMessage.sender?.full_name || selectedMessage.sender?.email}
                                            <br/>
                                            <span className="font-bold">Per a:</span> {selectedMessage.receiver?.full_name || selectedMessage.receiver?.email}
                                        </div>
                                        <div>{new Date(selectedMessage.created_at).toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                    {selectedMessage.content}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                                <span className="material-symbols-outlined text-6xl mb-4 opacity-20">mail</span>
                                <p>Selecciona un missatge per llegir-lo</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MessagesSection;
