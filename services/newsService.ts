
import { supabase } from './supabaseClient';
import { NewsItem } from '../types';

export const NewsService = {
  // 1. Obtenir totes les notícies
  getAll: async (): Promise<NewsItem[]> => {
    console.log(`[TRACE ${new Date().toISOString()}] NewsService.getAll: Iniciant petició a DB...`);
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[TRACE ${new Date().toISOString()}] NewsService.getAll: ERROR DB`, error);
      throw error;
    }

    console.log(`[TRACE ${new Date().toISOString()}] NewsService.getAll: Èxit. Rebuts ${data.length} registres.`);

    return data.map((item: any) => ({
      id: item.id,
      category: item.category,
      date: new Date(item.created_at).toLocaleDateString('ca-ES'),
      title: item.title,
      description: item.description,
      imageUrl: item.media_url,
      mediaType: item.media_type,
      linkText: 'Llegir més'
    }));
  },

  // 2. Pujar fitxer (Imatge o Vídeo)
  uploadMedia: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`; // Use timestamp instead of random for cleaner names
    const filePath = `${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('news-media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtenir URL pública
    const { data: publicUrlData } = supabase.storage
      .from('news-media')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  },

  // 3. Crear notícia
  create: async (news: Omit<NewsItem, 'id' | 'date' | 'linkText'>, file?: File, authorId?: string) => {
    let mediaUrl = news.imageUrl;
    let mediaType = news.mediaType || 'image';

    if (file) {
      mediaUrl = await NewsService.uploadMedia(file);
      // Detectar si és vídeo
      if (file.type.startsWith('video/')) {
        mediaType = 'video';
      }
    }

    const { error } = await supabase
      .from('news')
      .insert({
        title: news.title,
        description: news.description,
        category: news.category,
        media_url: mediaUrl,
        media_type: mediaType,
        created_at: new Date().toISOString(),
        author_id: authorId
      });

    if (error) throw error;
  },

  // 4. Actualitzar notícia
  update: async (id: string, news: Partial<NewsItem>, file?: File) => {
    let mediaUrl = news.imageUrl;
    let mediaType = news.mediaType;

    if (file) {
      mediaUrl = await NewsService.uploadMedia(file);
      if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else {
        mediaType = 'image';
      }
    }

    const updateData: any = {
      title: news.title,
      description: news.description,
      category: news.category,
    };

    if (mediaUrl) {
      updateData.media_url = mediaUrl;
      updateData.media_type = mediaType;
    }

    const { error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;
  },

  // 5. Esborrar notícia
  delete: async (id: string) => {
    // Nota: Per fer-ho perfecte hauríem d'esborrar també la imatge de l'Storage, 
    // però per ara esborrem només el registre.
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
