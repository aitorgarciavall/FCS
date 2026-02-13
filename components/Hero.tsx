
import React, { useEffect, useState } from 'react';

const Hero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-yale-blue-950">
      {/* Contenidor que actua com a "finestra" per al parallax */}
      <div 
        className="absolute inset-0 z-0"
        style={{ clipPath: 'inset(0 0 0 0)' }}
      >
        <div 
          className={`fixed inset-0 h-full w-full bg-cover bg-center transition-transform duration-[20s] ease-out ${isLoaded ? 'scale-100' : 'scale-110'}`}
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAniP88WjXbMwG7yHN6m4VHMM7kg0LJIaeBNvyjrBGE6-0qiIUxvn-EFk5PgCU1OLfolUcN5idHXK-gW-OzNAlCYIi3atZgOE8U-2m05KfbG4JQQ6zFjYhI_SjQmc9GiGj94tOd5QqVJG8PO5p_Zm_TPHi2z0pKT7fjsNHDqmbSrN4nbsX7Ho0EEjL7KpQMA7PfjlUR7sIUE-kO599TYMqCotprMv7kCxLy1kzUnUKGFqy_EsiD-tO5_4aoPMyqsnfndoGIvUbzpBk')`,
            pointerEvents: 'none'
          }}
          role="img"
          aria-label="Football team"
        />
        {/* Gradients de sobreposició per millorar la llegibilitat, també confinats al clip-path */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-yale-blue-950 via-yale-blue-900/60 to-transparent"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-yale-blue-950 via-transparent to-yale-blue-900/20"></div>
      </div>

      {/* Contingut del Hero */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-4xl flex-col gap-8">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-xl bg-yale-blue-500/20 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-yale-blue-200 backdrop-blur-md border border-yale-blue-400/30">
              <span className="material-symbols-outlined text-sm">military_tech</span>
              Orgull del Bages des de 1920
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl font-black leading-tight tracking-tighter text-white sm:text-8xl md:text-9xl uppercase">
              Club Futbol <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yale-blue-200 to-yale-blue-400">Santpedor</span>
            </h1>
            <p className="max-w-2xl text-xl font-medium leading-relaxed text-yale-blue-50/80 sm:text-2xl drop-shadow-md">
              Més que un club, una família unida per la passió al futbol. Formant jugadors i persones a la Catalunya central.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center mt-4">
            <button className="inline-flex h-16 min-w-[220px] items-center justify-center gap-3 rounded-2xl bg-white px-10 text-base font-black text-yale-blue-900 transition-all hover:bg-yale-blue-50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1 uppercase tracking-widest">
              Fes-te soci <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="inline-flex h-16 min-w-[220px] items-center justify-center rounded-2xl border-2 border-white/20 bg-white/5 px-10 text-base font-black text-white backdrop-blur-md transition-all hover:bg-white/10 uppercase tracking-widest">
              Veure Partits
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;




