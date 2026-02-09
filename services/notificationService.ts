import { supabase } from './supabaseClient';

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'alert' | 'system';
  title: string;
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationService = {
  // Get all notifications
  getNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 to avoid overload

    if (error) throw error;
    return data as Notification[];
  },

  // Get unread count
  getUnreadCount: async (userId: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  // Mark single as read
  markAsRead: async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  // Mark all as read
  markAllAsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },

  // Subscribe to real-time changes
  subscribeToNotifications: (userId: string, onUpdate: () => void) => {
    return supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Nova notificació rebuda:', payload);
          onUpdate();
        }
      )
      .subscribe();
  }
};
