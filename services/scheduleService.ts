import { supabase } from './supabaseClient';
import { TrainingSession } from '../types';

export const scheduleService = {
  async getSchedule(): Promise<TrainingSession[]> {
    const { data, error } = await supabase
      .from('training_schedules')
      .select('*')
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }

    return data || [];
  },

  async createSession(session: Omit<TrainingSession, 'id'>): Promise<TrainingSession> {
    const { data, error } = await supabase
      .from('training_schedules')
      .insert([session])
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    return data;
  },

  async updateSession(id: string, updates: Partial<TrainingSession>): Promise<TrainingSession> {
    const { data, error } = await supabase
      .from('training_schedules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating session:', error);
      throw error;
    }

    return data;
  },

  async deleteSession(id: string): Promise<void> {
    const { error } = await supabase
      .from('training_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }
};
