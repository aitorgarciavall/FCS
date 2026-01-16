import { supabase } from './supabaseClient';
import { User } from '../types';

export interface Match {
  id: string;
  team_id: string;
  opponent: string;
  match_date: string;
  location: string;
  formation: 'F7' | 'F11';
  lineup: any; // JSON amb posicions i metadades { formation: 'F11', positions: { ... } }
  teams?: { name: string }; // Per joins
}

export const MatchService = {
  // Obtenir tots els partits
  getAll: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, teams(name)')
      .order('match_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Obtenir un partit per ID
  getById: async (id: string): Promise<Match | null> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, teams(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Crear partit
  create: async (match: Omit<Match, 'id' | 'teams'>) => {
    const { data, error } = await supabase
      .from('matches')
      .insert(match)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Actualitzar partit
  update: async (id: string, match: Partial<Match>) => {
    const { error } = await supabase
      .from('matches')
      .update(match)
      .eq('id', id);

    if (error) throw error;
  },

  // Esborrar partit
  delete: async (id: string) => {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
