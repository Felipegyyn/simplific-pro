import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const MainLayout = ({ user, onLogout }) => {
  return (
    // Adicionamos dark:bg-slate-900 para mudar o fundo no modo escuro
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto">
        {/* O Outlet renderiza o componente da rota atual (Dashboard, Planning, etc.) */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;