
import React from 'react';
import { NewsItem } from '../types';

const newsItems: NewsItem[] = [
  {
    id: '1',
    category: 'Partit',
    date: 'Oct 24, 2023',
    title: 'El primer equip s’emporta el derbi',
    description: 'Un gol d’últim minut assegura els 3 punts en un partit vibrant. L’equip ha demostrat caràcter fins al final.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGPH8bKA701xuP_4kBf4x4liksS7H8AO9SMFY7J637JfBOF5geAuXFqwYPe51s34fI9VBdu0VcTzo075J_Ikkzb7ejm9kUPEIcNXYjJgrtwFotQagUXwSeKHytOn5gAPze8ivqAxd4Z3hn0Iu9BRZcJ_0Fica6jIHghwyguOBpYqZuHdWwE0111XXoGGqEKHjxJ0RsSphMzwAod5VmYx6EcMgCLZwzXD8RdrtE9MrHIsJftK_1KFB9bK7_x1q5AikVT2lgevBbiek',
    linkText: 'Llegir crònica'
  },
  {
    id: '2',
    category: 'Acadèmia',
    date: 'Oct 20, 2023',
    title: 'Proves de selecció 2024/25',
    description: 'Busquem el pròxim talent. Obre la inscripció per a equips d’Infantil fins a Cadet. Vine a gaudir del futbol.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0u17tWllZSWX7CEVLjX24rpgy3g6B82eChJB8l9qa4kbXcYqD4bG2XpIUguwfgdoWPXyWVqMSKPoHlx5b3hlcmcd5SiwQIJznimXxV8ay2aVxYTgHjfMT9FA-IIgMKvlY2tlqcO_ToaQ4gsslHrH2o-jgePYCb_WG_dPGnf5S_w_BhY2WJaqnSDa0bLiK0tRlWnCW_m1s7CtzeiJFUXipSpRtXrK2C4mWXI-nGX_ODv7ueKwaepAvzPitAlq002vcTP3rHUI6XmU',
    linkText: 'Inscriu-te ara'
  },
  {
    id: '3',
    category: 'Events',
    date: 'Oct 15, 2023',
    title: 'Sopar de Gala de Fi de Temporada',
    description: 'Ens trobem aquest divendres per celebrar els èxits de tots els nostres equips. Serà una nit inoblidable.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJGJzQ9E5rfQm4AGOzpWl0ZIf34mNN9ooMH3-9n1uWDemZKDnqK24QwEd81yi2sTSrrcm0UqeDh9solFrOEfYGqy2Jo43Ph8WKjF8jdnJYgFsarvKYEYtZ5igroKToZPzG6URBKIk3x7oyvY7zAq8EO2okg2Tg0WwjGCguw7I6mFCMWMcroLRpkzNggCE3UBS_H0KZUWyIZ8r5LUjKoMr8RqvgAR8rNS0_9a5-W1Mi9HAUwWS_TGT6ejpKZxH1522BjoZrjup7pI0',
    linkText: 'Reserva tiquet'
  }
];

const NewsSection: React.FC = () => {
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
        {newsItems.map((item) => (
          <article key={item.id} className="group flex flex-col bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-transparent hover:border-primary/30">
            <div className="relative aspect-video overflow-hidden">
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-background-dark bg-primary rounded-md">{item.category}</span>
              </div>
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
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
