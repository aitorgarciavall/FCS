import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationService, Notification } from '../../services/notificationService';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await NotificationService.getNotifications(user.id);
      setNotifications(data);
      const count = data.filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchNotifications();

    // Subscribe to realtime
    const subscription = NotificationService.subscribeToNotifications(user.id, () => {
        // Play sound (optional) or just refresh
        fetchNotifications();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
        try {
            await NotificationService.markAsRead(notification.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, is_read: true} : n));
        } catch (e) {
            console.error(e);
        }
    }
    
    setIsOpen(false);
    if (notification.link) {
        navigate(notification.link);
    }
  };

  const markAllRead = async () => {
      if (!user) return;
      try {
          await NotificationService.markAllAsRead(user.id);
          setNotifications(prev => prev.map(n => ({...n, is_read: true})));
          setUnreadCount(0);
      } catch (e) {
          console.error(e);
      }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
      >
        <span className={`material-symbols-outlined ${unreadCount > 0 ? 'text-primary animate-pulse' : 'text-gray-600 dark:text-gray-300'}`}>
            notifications
        </span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-surface-dark">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-surface-dark rounded-xl shadow-xl border border-gray-200 dark:border-white/10 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                <h3 className="font-bold text-sm dark:text-white">Notificacions</h3>
                {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
                        Marcar tot llegit
                    </button>
                )}
            </div>
            
            <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No tens notificacions
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div 
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-3 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                        >
                            <div className="flex gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!notification.is_read ? 'bg-primary' : 'bg-transparent'}`}></div>
                                <div>
                                    <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                        {notification.content}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      )}
    </div>
  );
};
