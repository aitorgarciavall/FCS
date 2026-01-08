
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold dark:text-white">Benvingut, Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Notícies Públiques</p>
              <p className="text-3xl font-bold dark:text-white mt-1">-</p>
            </div>
            <span className="material-symbols-outlined text-primary text-3xl">article</span>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Equips Actius</p>
              <p className="text-3xl font-bold dark:text-white mt-1">20</p>
            </div>
            <span className="material-symbols-outlined text-blue-500 text-3xl">groups</span>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl shadow-sm border border-gray-200 dark:border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Propers Partits</p>
              <p className="text-3xl font-bold dark:text-white mt-1">8</p>
            </div>
            <span className="material-symbols-outlined text-orange-500 text-3xl">event</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
