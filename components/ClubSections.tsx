
import React from 'react';

// Shared layout component for consistency
const SectionLayout: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="py-16 bg-background-light dark:bg-background-dark min-h-screen animate-fade-in">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#111813] dark:text-white mb-4">{title}</h1>
        <div className="h-1 w-20 bg-primary mx-auto rounded-full mb-6"></div>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
      </div>
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-8 md:p-12 text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
        {children}
      </div>
    </div>
  </div>
);

export const ClubPresentacio: React.FC = () => (
  <SectionLayout 
    title="Presentació" 
    subtitle="Benvinguts al Club de Futbol Santpedor, una entitat amb història i futur."
  >
    <p>
      El <span className="font-bold text-primary-dark dark:text-primary">CF Santpedor</span> és molt més que un equip de futbol; som el cor esportiu del nostre poble. 
      Fundat l'any 1920, portem més d'un segle representant els colors verd-i-blanc amb orgull per tots els camps de Catalunya.
    </p>
    <p>
      La nostra entitat ha estat, és i serà un punt de trobada per a nens, nenes, joves i famílies que troben en l'esport una forma de vida. 
      Ubicats al Camp de Futbol Municipal de Santpedor, gaudim d'unes instal·lacions modernes on centenars de jugadors creixen cada any, no només com a esportistes, sinó com a persones.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
        <span className="block text-3xl font-bold text-primary mb-1">+100</span>
        <span className="text-sm font-medium">Anys d'Història</span>
      </div>
      <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
        <span className="block text-3xl font-bold text-primary mb-1">+300</span>
        <span className="text-sm font-medium">Jugadors/es</span>
      </div>
      <div className="text-center p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
        <span className="block text-3xl font-bold text-primary mb-1">20</span>
        <span className="text-sm font-medium">Equips</span>
      </div>
    </div>
    <p>
      Des de l'escoleta fins al primer equip i els veterans, tots compartim la mateixa passió. Som el club de tothom i treballem incansablement 
      per mantenir viu l'esperit del futbol popular i formatiu.
    </p>
  </SectionLayout>
);

export const ClubIdeari: React.FC = () => (
  <SectionLayout 
    title="El Nostre Ideari" 
    subtitle="La filosofia que guia cada entrenament i cada partit."
  >
    <h3 className="text-xl font-bold text-[#111813] dark:text-white mb-2">Formar persones abans que jugadors</h3>
    <p>
      Entenem el futbol com una eina educativa potentíssima. El nostre principal objectiu no és només guanyar partits, sinó formar ciutadans 
      responsables, respectuosos i compromesos. Creiem que els valors que s'aprenen al vestidor (companyonia, sacrifici, humilitat) són els mateixos que serveixen per a la vida.
    </p>
    
    <div className="my-8 space-y-4">
      <div className="flex items-start gap-4">
        <div className="bg-primary/20 p-2 rounded-full text-primary-dark dark:text-primary">
          <span className="material-symbols-outlined">handshake</span>
        </div>
        <div>
          <h4 className="font-bold text-lg dark:text-white">Respecte</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Respecte absolut per als companys, els rivals, els àrbitres i el públic. Sense respecte no hi ha futbol.</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-primary/20 p-2 rounded-full text-primary-dark dark:text-primary">
          <span className="material-symbols-outlined">groups</span>
        </div>
        <div>
          <h4 className="font-bold text-lg dark:text-white">Treball en equip</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ningú és millor que tots nosaltres junts. Fomentem la col·laboració i el suport mutu en tot moment.</p>
        </div>
      </div>
      <div className="flex items-start gap-4">
        <div className="bg-primary/20 p-2 rounded-full text-primary-dark dark:text-primary">
          <span className="material-symbols-outlined">bolt</span>
        </div>
        <div>
          <h4 className="font-bold text-lg dark:text-white">Esforç i Superació</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Valorem l'actitud per sobre de l'aptitud. L'esforç no es negocia i la millora constant és la nostra meta.</p>
        </div>
      </div>
    </div>
    <p>
      Volem que cada jugador/a se senti orgullós de pertànyer al CF Santpedor, no pels títols que guanyem, sinó per la manera com els guanyem o els perdem: 
      sempre amb el cap ben alt i donant la mà al rival.
    </p>
  </SectionLayout>
);

export const ClubObjectius: React.FC = () => (
  <SectionLayout 
    title="Objectius" 
    subtitle="Fites esportives i socials per a la temporada."
  >
    <div className="space-y-8">
      <div>
        <h3 className="flex items-center gap-2 text-xl font-bold text-[#111813] dark:text-white border-b border-gray-100 dark:border-white/10 pb-2 mb-4">
          <span className="material-symbols-outlined text-primary">sports_soccer</span>
          Àmbit Esportiu
        </h3>
        <ul className="list-disc pl-5 space-y-2 marker:text-primary">
          <li>Garantir una formació tècnica i tàctica de qualitat adaptada a cada etapa evolutiva del jugador.</li>
          <li>Consolidar els equips de futbol base en les seves respectives categories, prioritzant l'aprenentatge sobre el resultat immediat en les etapes primerenques.</li>
          <li>Aconseguir que el primer equip sigui el mirall on es reflecteixi la base, nodrint-se majoritàriament de jugadors formats a la casa.</li>
          <li>Fomentar el futbol femení i augmentar el nombre d'equips femenins al club.</li>
        </ul>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-xl font-bold text-[#111813] dark:text-white border-b border-gray-100 dark:border-white/10 pb-2 mb-4">
          <span className="material-symbols-outlined text-primary">public</span>
          Àmbit Social
        </h3>
        <ul className="list-disc pl-5 space-y-2 marker:text-primary">
          <li>Ser un referent d'integració social a Santpedor, acollint famílies de tots els orígens.</li>
          <li>Organitzar tornejos i esdeveniments (Campus d'Estiu, Torneig de Reis) que dinamitzin la vida del poble.</li>
          <li>Fomentar hàbits de vida saludables i lluitar contra el sedentarisme infantil.</li>
          <li>Mantenir una comunicació fluida i transparent amb els socis i les famílies.</li>
        </ul>
      </div>
    </div>
  </SectionLayout>
);

export const ClubReglament: React.FC = () => (
  <SectionLayout 
    title="Reglament Intern" 
    subtitle="Normes de convivència per al bon funcionament del club."
  >
    <div className="bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400 p-4 mb-8">
      <p className="text-sm text-yellow-800 dark:text-yellow-200">
        <span className="font-bold">Nota:</span> Aquest és un resum dels punts més importants. El document complet està a disposició dels socis a les oficines del club.
      </p>
    </div>

    <div className="space-y-6">
      <section>
        <h3 className="font-bold text-lg dark:text-white mb-2">1. Drets i Deures dels Jugadors</h3>
        <p>Tots els jugadors tenen dret a rebre una formació adequada i ser tractats amb respecte. Tenen el deure d'assistir als entrenaments amb puntualitat, cuidar el material i respectar les decisions tècniques.</p>
      </section>

      <section>
        <h3 className="font-bold text-lg dark:text-white mb-2">2. Comportament de les Famílies</h3>
        <p>Les famílies són una part fonamental del club. S'espera que animin l'equip de forma positiva. Està terminantment prohibit insultar, menysprear àrbitres o rivals, o donar instruccions tècniques des de la grada.</p>
      </section>

      <section>
        <h3 className="font-bold text-lg dark:text-white mb-2">3. Ús de les Instal·lacions</h3>
        <p>Tots els membres del club han de vetllar pel bon estat del Camp Municipal, vestidors i material esportiu. Qualsevol desperfecte intencionat serà sancionat.</p>
      </section>

      <section>
        <h3 className="font-bold text-lg dark:text-white mb-2">4. Règim Disciplinari</h3>
        <p>El club es reserva el dret d'aplicar sancions esportives o disciplinàries en cas d'incompliment greu d'aquestes normes, seguint els estatuts de l'entitat.</p>
      </section>
    </div>
  </SectionLayout>
);

export const ClubOrganigrama: React.FC = () => (
  <SectionLayout 
    title="Organigrama Esportiu" 
    subtitle="L'equip humà que fa possible el dia a dia del CF Santpedor."
  >
    <div className="space-y-12">
      {/* Junta Directiva */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#111813] dark:text-white mb-6">Junta Directiva</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
            </div>
            <p className="font-bold dark:text-white">Joan García</p>
            <p className="text-sm text-primary font-medium">President</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
            </div>
            <p className="font-bold dark:text-white">Maria López</p>
            <p className="text-sm text-primary font-medium">Vicepresidenta</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
            </div>
            <p className="font-bold dark:text-white">Marc Vila</p>
            <p className="text-sm text-primary font-medium">Secretari</p>
          </div>
        </div>
      </div>

      {/* Direcció Esportiva */}
      <div className="text-center border-t border-gray-100 dark:border-white/10 pt-10">
        <h3 className="text-2xl font-bold text-[#111813] dark:text-white mb-6">Àrea Esportiva</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl text-left">
            <div className="bg-primary/20 p-3 rounded-full text-primary-dark dark:text-primary">
              <span className="material-symbols-outlined">sports_score</span>
            </div>
            <div>
              <p className="font-bold dark:text-white">Jordi Martínez</p>
              <p className="text-sm text-gray-500">Director Esportiu</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl text-left">
            <div className="bg-primary/20 p-3 rounded-full text-primary-dark dark:text-primary">
              <span className="material-symbols-outlined">school</span>
            </div>
            <div>
              <p className="font-bold dark:text-white">Anna Soler</p>
              <p className="text-sm text-gray-500">Coord. Futbol Base</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SectionLayout>
);
