
import { supabase } from './supabaseClient';
import { TeamCategory } from '../types';

export const TeamService = {
  // 1. Obtenir tots els equips
  getAll: async (): Promise<TeamCategory[]> => {
    console.log(`[TRACE ${new Date().toISOString()}] TeamService.getAll: Iniciant petició a DB...`);
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`[TRACE ${new Date().toISOString()}] TeamService.getAll: ERROR DB`, error);
      throw error;
    }

    console.log(`[TRACE ${new Date().toISOString()}] TeamService.getAll: Èxit. Rebuts ${data.length} registres.`);

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      age: item.age,
      imageUrl: item.image_url,
      tag: item.tag
    }));
  },

  // 2. Pujar imatge de l'equip
  uploadImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('teams-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('teams-media')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  // 3. Crear equip
  create: async (team: Omit<TeamCategory, 'id'>, file?: File) => {
    let imageUrl = team.imageUrl;

    if (file) {
      imageUrl = await TeamService.uploadImage(file);
    }

    const { error } = await supabase
      .from('teams')
      .insert({
        name: team.name,
        age: team.age,
        image_url: imageUrl,
        tag: team.tag
      });

    if (error) throw error;
  },

  // 4. Actualitzar equip
  update: async (id: string, team: Partial<TeamCategory>, file?: File) => {
    let imageUrl = team.imageUrl;

    if (file) {
      imageUrl = await TeamService.uploadImage(file);
    }

    const updateData: any = {
      name: team.name,
      age: team.age,
      tag: team.tag,
    };

    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    const { error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  // 5. Esborrar equip
  delete: async (id: string) => {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
