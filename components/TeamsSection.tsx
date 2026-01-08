import React, { useRef, useState, useEffect } from 'react';
import { TeamCategory } from '../types';
import { TeamService } from '../services/teamService';

const TeamsSection: React.FC = () => {
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await TeamService.getAll();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching teams for section:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeams();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-background-light dark:bg-background-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase mb-4 border border-primary/20">Categories del Club</span>
            <h2 className="text-3xl md:text-5xl font-black dark:text-white mb-4">Els Nostres Equips</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl">Formació, passió i treball en equip des dels més petits fins al primer equip.</p>
          </div>
          
          {/* Desktop Navigation Buttons */}
          <div className="hidden md:flex gap-3">
            <button 
              onClick={() => scroll('left')}
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-white hover:bg-primary hover:text-white hover:border-primary transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-white hover:bg-primary hover:text-white hover:border-primary transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-6 pb-10 -mx-4 px-4 snap-x snap-mandatory scroll-smooth"
        >
          {isLoading ? (
            // Loading skeleton
            [1, 2, 3].map((i) => (
              <div key={i} className="snap-center shrink-0 w-[300px] md:w-[320px] bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100 dark:border-white/5">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))
          ) : categories.length === 0 ? (
            <div className="w-full text-center py-10 text-gray-500">No hi ha equips disponibles en aquest moment.</div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="snap-center shrink-0 w-[300px] md:w-[320px] bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group border border-gray-100 dark:border-white/5">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {cat.tag && (
                    <span className="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase">{cat.tag}</span>
                  )}
                  <img 
                    src={cat.imageUrl} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                </div>
                <div className="p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-xl font-bold dark:text-white group-hover:text-primary transition-colors">{cat.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{cat.age}</p>
                  </div>
                  <button className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-white font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all">
                    Veure Equip <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-10 flex justify-center">
          <div className="bg-primary/10 rounded-2xl p-8 md:p-12 w-full flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/20">
            <div className="flex flex-col gap-3 text-center md:text-left max-w-lg">
              <h2 className="text-2xl md:text-3xl font-black dark:text-white">Uneix-te al club</h2>
              <p className="text-gray-600 dark:text-gray-400 text-base">Busquem nous talents. T'interessa formar part del CF Santpedor? Tenim lloc per a tu.</p>
            </div>
            <button className="h-12 px-8 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              Totes les categories
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamsSection;