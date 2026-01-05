
import React, { useState } from 'react';
import { Screen } from '../types';

interface HeaderProps {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
}

const Header: React.FC<HeaderProps> = ({ currentScreen, setScreen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Inici', screen: Screen.HOME },
    { name: 'Equips', screen: Screen.TEAMS },
    { name: 'Notícies', screen: Screen.NEWS },
    { name: 'El Club', screen: Screen.CLUB },
    { name: 'Contacte', screen: Screen.CONTACT },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-white/10 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setScreen(Screen.HOME)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-background-dark">
            <span className="material-symbols-outlined text-2xl">sports_soccer</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#111813] dark:text-white">CF Santpedor</h2>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.screen}
              onClick={() => setScreen(link.screen)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                currentScreen === link.screen ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {link.name}
            </button>
          ))}
          <button className="flex items-center justify-center rounded-lg bg-primary h-10 px-6 text-sm font-bold text-background-dark hover:bg-primary-dark transition-all transform hover:scale-105">
            Fes-te soci
          </button>
        </nav>

        <button 
          className="md:hidden p-2 text-slate-600 dark:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-background-dark border-b border-gray-200 dark:border-white/10 px-4 py-4 space-y-4 animate-fade-in">
          {navLinks.map((link) => (
            <button
              key={link.screen}
              onClick={() => {
                setScreen(link.screen);
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              {link.name}
            </button>
          ))}
          <button className="w-full bg-primary py-3 rounded-lg font-bold text-background-dark">
            Fes-te soci
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
