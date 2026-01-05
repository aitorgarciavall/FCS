
import React, { useState } from 'react';
import { Screen } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import NewsSection from './components/NewsSection';
import Institucional from './components/Institucional';
import TeamsSection from './components/TeamsSection';
import ClubAssistant from './components/ClubAssistant';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);

  const renderContent = () => {
    switch (currentScreen) {
      case Screen.HOME:
        return (
          <>
            <Hero />
            <NewsSection />
            <TeamsSection />
            <Institucional />
          </>
        );
      case Screen.TEAMS:
        return <TeamsSection />;
      case Screen.NEWS:
        return <NewsSection />;
      case Screen.CLUB:
        return (
          <div className="min-h-screen pt-10">
            <Institucional />
          </div>
        );
      case Screen.CONTACT:
        return (
          <div className="min-h-[50vh] flex items-center justify-center px-4">
            <div className="max-w-xl w-full text-center space-y-6">
              <h2 className="text-4xl font-bold dark:text-white">Contacte</h2>
              <p className="text-gray-500 dark:text-gray-400">Pots trobar-nos a l'estadi o enviar-nos un missatge.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-primary mb-2">call</span>
                  <p className="font-bold">Telèfon</p>
                  <p className="text-sm text-gray-500">+34 93X XXX XXX</p>
                </div>
                <div className="p-6 bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-primary mb-2">mail</span>
                  <p className="font-bold">Email</p>
                  <p className="text-sm text-gray-500">info@cfsantpedor.com</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Hero />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header currentScreen={currentScreen} setScreen={setCurrentScreen} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
      <ClubAssistant />
    </div>
  );
};

export default App;
