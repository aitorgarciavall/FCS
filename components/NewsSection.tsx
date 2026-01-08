
import React, { useEffect, useState } from 'react';
import { NewsItem } from '../types';
import { NewsService } from '../services/newsService';

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true); // Reset loading state on retry
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000)
      );

      try {
        // Race between the fetch and the timeout
        const data = await Promise.race([
          NewsService.getAll(),
          timeoutPromise
        ]) as NewsItem[];
        
        setNews(data);
      } catch (error) {
        console.error("Error carregant notícies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 md:px-10 max-w-7xl mx-auto text-center">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 dark:bg-white/5 w-1/3 mx-auto rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 dark:bg-white/5 rounded-xl"></div>)}
          </div>
        </div>
      </section>
    );
  }

  // Si no hi ha notícies encara
  if (news.length === 0) return null;

  return (
    <section className="py-20 px-4 md:px-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="h-8 w-1 bg-primary rounded-full"></span>
            <h2 className="text-3xl md:text-4xl font-bold dark:text-white">Últimes Notícies</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl pl-3">Estigues informat dels resultats, novetats de l'acadèmia i esdeveniments del club.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline">
          Veure arxiu <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => (
          <article key={item.id} className="group flex flex-col bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-transparent hover:border-primary/30">
            <div className="relative aspect-video overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-white bg-primary rounded-md">{item.category}</span>
              </div>
              
              {item.mediaType === 'video' ? (
                <div className="relative w-full h-full">
                  <video 
                    src={item.imageUrl} 
                    className="w-full h-full object-cover"
                    muted
                    onMouseOver={e => (e.target as HTMLVideoElement).play()}
                    onMouseOut={e => (e.target as HTMLVideoElement).pause()}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                    <span className="material-symbols-outlined text-white text-5xl opacity-80">play_circle</span>
                  </div>
                </div>
              ) : (
                <img 
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80'} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>{item.date}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6 line-clamp-2">{item.description}</p>
              <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <a href="#" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark">
                  {item.linkText} <span className="material-symbols-outlined text-[18px]">arrow_right_alt</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default NewsSection;
