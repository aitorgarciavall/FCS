
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full pt-16 pb-8 border-t border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-background-dark">
                <span className="material-symbols-outlined">sports_soccer</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CF Santpedor</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
              Més que un club. Fomentant el talent, la passió i l'esperit de comunitat des de 1920. Uneix-te al nostre camí cap a l'excel·lència.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400 text-sm">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">location_on</span>
                <span>Carrer del Bruc, s/n,<br/>08251 Santpedor, Barcelona</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">mail</span>
                <a className="hover:text-primary transition-colors" href="mailto:info@cfsantpedor.com">info@cfsantpedor.com</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider">El Club</h3>
              <div className="flex flex-col gap-3">
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Sobre Nosaltres</a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Història</a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Transparència</a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider">Equips</h3>
              <div className="flex flex-col gap-3">
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Primer Equip</a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Acadèmia</a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Calendari</a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-slate-900 dark:text-white font-semibold text-sm uppercase tracking-wider">Afició</h3>
              <div className="flex flex-col gap-3">
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Soci</a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Botiga</a>
                <a className="text-slate-500 dark:text-slate-400 hover:text-primary text-sm transition-colors" href="#">Contacte</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">Estigues al dia</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                Rep els resultats i les notícies directament al teu correu.
              </p>
              <form className="flex flex-col gap-3">
                <input 
                  type="email" 
                  placeholder="el_teu@email.com"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary dark:text-white"
                />
                <button type="button" className="w-full bg-primary py-3 rounded-lg text-sm font-bold text-background-dark hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  Subscriu-te <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 dark:bg-slate-800 mb-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-sm">© 2024 CF Santpedor. Tots els drets reservats.</p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary transition-all">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary transition-all">
              <span className="material-symbols-outlined">flutter_dash</span>
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary transition-all">
              <span className="material-symbols-outlined">thumb_up</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
