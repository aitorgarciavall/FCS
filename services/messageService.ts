import { supabase } from './supabaseClient';
import { UserMessage } from '../types';

export const MessageService = {
  // Obtenir missatges rebuts
  getMyMessages: async (userId: string): Promise<UserMessage[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('receiver_id', userId)
      .eq('deleted_by_receiver', false) // NOSTRAT FILTER
      .order('created_at', { ascending: false });

    if (error) throw error;
    // Mapeig per assegurar tipus si cal, però supabase sol retornar correcte
    return data as any[]; 
  },

  // Obtenir missatges enviats
  getSentMessages: async (userId: string): Promise<UserMessage[]> => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        receiver:receiver_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('sender_id', userId)
      .eq('deleted_by_sender', false) // NOSTRAT FILTER
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any[];
  },

  // Enviar missatge individual
  sendMessage: async (senderId: string, receiverId: string, subject: string, content: string) => {
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        subject,
        content
      });
    
    if (error) throw error;
  },

  // Enviar broadcast
  sendBroadcast: async (senderId: string, roleCode: string, subject: string, content: string) => {
    const { error } = await supabase
      .rpc('send_broadcast_message', {
        p_sender_id: senderId,
        p_role_code: roleCode,
        p_subject: subject,
        p_content: content
      });

    if (error) throw error;
  },

  // Marcar com llegit
  markAsRead: async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);

    if (error) throw error;
  },

  // Esborrar missatge (Soft Delete)
  deleteMessage: async (messageId: string, userId: string) => {
    // Primer obtenim el missatge per saber si som sender o receiver
    const { data: message, error: fetchError } = await supabase
      .from('messages')
      .select('sender_id, receiver_id')
      .eq('id', messageId)
      .single();

    if (fetchError || !message) throw fetchError || new Error("Message not found");

    const updates: any = {};
    if (message.sender_id === userId) updates.deleted_by_sender = true;
    if (message.receiver_id === userId) updates.deleted_by_receiver = true;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('messages')
        .update(updates)
        .eq('id', messageId);
      
      if (error) throw error;
    }
  },
  
  // Comptar no llegits
  getUnreadCount: async (userId: string): Promise<number> => {
     const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);
      
     if (error) throw error;
     return count || 0;
  },

  // Subscripció a nous missatges (Realtime)
  subscribeToMessages: (userId: string, onMessageReceived: () => void) => {
    return supabase
      .channel('public:messages:' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        () => {
          onMessageReceived();
        }
      )
      .subscribe();
  }
};
