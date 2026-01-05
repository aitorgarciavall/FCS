
import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden bg-background-dark">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-transparent to-black/30"></div>
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAniP88WjXbMwG7yHN6m4VHMM7kg0LJIaeBNvyjrBGE6-0qiIUxvn-EFk5PgCU1OLfolUcN5idHXK-gW-OzNAlCYIi3atZgOE8U-2m05KfbG4JQQ6zFjYhI_SjQmc9GiGj94tOd5QqVJG8PO5p_Zm_TPHi2z0pKT7fjsNHDqmbSrN4nbsX7Ho0EEjL7KpQMA7PfjlUR7sIUE-kO599TYMqCotprMv7kCxLy1kzUnUKGFqy_EsiD-tO5_4aoPMyqsnfndoGIvUbzpBk"
          alt="Football team"
          className="h-full w-full object-cover transition-transform duration-[20s] hover:scale-105"
        />
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-4xl flex-col gap-6 md:gap-8">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary backdrop-blur-sm border border-primary/30">
              <span className="material-symbols-outlined text-sm">trophy</span>
              Orgull del Bages
            </span>
          </div>
          
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-black leading-none tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl drop-shadow-lg">
              CF <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 uppercase">Santpedor</span>
            </h1>
            <p className="max-w-xl text-lg font-medium leading-relaxed text-gray-200 sm:text-xl md:text-2xl drop-shadow-md">
              El cor del futbol a la Catalunya central. Passió, orgull i victòria des de 1920. Benvingut a la família.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button className="inline-flex h-14 min-w-[200px] items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-bold text-background-dark transition-all hover:bg-primary-dark hover:shadow-[0_0_20px_rgba(13,242,89,0.4)] hover:-translate-y-1">
              Fes-te soci <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="inline-flex h-14 min-w-[200px] items-center justify-center rounded-lg border border-white/30 bg-white/10 px-8 text-base font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20">
              Veure Partits
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
