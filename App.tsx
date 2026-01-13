
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import NewsSection from './components/NewsSection';
import Institucional from './components/Institucional';
import TeamsSection from './components/TeamsSection';
import { 
  ClubPresentacio, 
  ClubIdeari, 
  ClubObjectius, 
  ClubReglament, 
  ClubOrganigrama 
} from './components/ClubSections';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminNews from './components/admin/AdminNews';
import AdminTeams from './components/admin/AdminTeams';
import AdminUsers from './components/admin/AdminUsers';
import AdminUserNew from './components/admin/AdminUserNew';
import AdminUserEdit from './components/admin/AdminUserEdit';

// Home Page Component
const Home: React.FC = () => (
  <>
    <Hero />
    <NewsSection />
    <TeamsSection />
    <Institucional />
  </>
);

// Contact Page Component
const Contact: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center px-4 pt-20">
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

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header needs to be inside Router context, which App is */}
      <Header /> 
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/equips" element={<TeamsSection />} />
          <Route path="/noticies" element={<NewsSection />} />
          <Route path="/contacte" element={<Contact />} />
          
          {/* Club Sub-routes */}
          <Route path="/club/presentacio" element={<ClubPresentacio />} />
          <Route path="/club/ideari" element={<ClubIdeari />} />
          <Route path="/club/objectius" element={<ClubObjectius />} />
          <Route path="/club/reglament" element={<ClubReglament />} />
          <Route path="/club/organigrama" element={<ClubOrganigrama />} />
          
          {/* Admin Routes (Protected) */}
          <Route path="/keyper" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/new" element={<AdminUserNew />} />
            <Route path="users/edit/:userId" element={<AdminUserEdit />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
