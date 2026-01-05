
import React from 'react';

const pillars = [
  {
    title: 'Ideari',
    description: 'La nostra filosofia, valors i visió que mouen al CF Santpedor. Construint caràcter a través de l’esport.',
    icon: 'emoji_objects',
    link: 'Més informació'
  },
  {
    title: 'Objectius',
    description: 'Fites esportives i socials per a la temporada actual i el desenvolupament futur dels jugadors.',
    icon: 'flag',
    link: 'Veure fites'
  },
  {
    title: 'Reglament Intern',
    description: 'Pautes essencials per a jugadors i famílies per assegurar el respecte, la disciplina i el joc net.',
    icon: 'gavel',
    link: 'Llegir normes'
  }
];

const Institucional: React.FC = () => {
  return (
    <section className="py-20 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        <div className="flex flex-col gap-2 mb-12 text-center md:text-left">
          <div className="flex items-center gap-2 text-primary text-sm font-bold uppercase tracking-wider mb-2 justify-center md:justify-start">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Informació del Club</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black dark:text-white">Institucional</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mt-2">Descobreix els pilars del CF Santpedor. Des de la nostra filosofia central fins a les regles que ens guien.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="group relative flex flex-col bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-white/10 p-8 hover:border-primary/50 hover:shadow-lg transition-all transform hover:-translate-y-1">
              <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background-dark transition-colors mb-6">
                <span className="material-symbols-outlined text-[28px]">{pillar.icon}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white group-hover:text-primary transition-colors">{pillar.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{pillar.description}</p>
              <div className="mt-auto flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wide">
                <span>{pillar.link}</span>
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">arrow_forward</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Institucional;
