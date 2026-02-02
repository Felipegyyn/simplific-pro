import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Componentes
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Achievements from './pages/Achievements';
import Planning from './pages/Planning';
import MarketingDashboard from './pages/MarketingDashboard';
import Transactions from './pages/Transactions';
import CreditCards from './pages/CreditCards';
import Goals from './pages/Goals';
import Contacts from './pages/Contacts';
import Investments from './pages/Investments';
import Schedule from './pages/Schedule';
import AdminPanel from './pages/AdminPanel';
import Reports from './pages/Reports';
import Settings from './pages/Settings'; 
import Analysis from './pages/Analysis'; 
import SimplificIA from './pages/SimplificIA';
import AdvisorFeatures from './pages/AdvisorFeatures';
import MainLayout from './components/MainLayout'; 
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext'; 
import HomePage from './pages/HomePage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CategoriesSettings from './pages/CategoriesSettings';

//--- IMPORTS EMPRESARIAIS
import BusinessAccess from './pages/empresas/BusinessAccess';
import Stakeholders from './pages/empresas/Stakeholders';
import CompanySettings from './pages/empresas/CompanySettings';

// --- NOVO: Importando as Páginas da Landing Page ---
import Beneficios from './pages/Beneficios';
import Inteligencia from './pages/Inteligencia';
import Planos from './pages/Planos';
import Termos from './pages/Termos';
import Privacidade from './pages/Privacidade';
import Contato from './pages/Contato';
import Checkout from './pages/Checkout';
import SecurityPage from './pages/SecurityPage'; // <--- 1. IMPORT NOVO AQUI
// --------------------------------------------------

// Serviços
import notificationService from './services/notifications';

// Componente Guardião para Rotas de Admin
const AdminRoute = ({ user, children }) => {
  if (user?.profile !== 'admin') {
    // Se não for admin, redireciona para o dashboard
    return <Navigate to="/dashboard" replace />;
  }
  // Se for admin, permite o acesso
  return children;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('simplific_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        localStorage.removeItem('simplific_user');
      }
    }
    
    // Inicializar sistema de notificações
    initializeNotifications();
    
    setIsLoading(false);
  }, []);

  const initializeNotifications = async () => {
    // Solicitar permissão para notificações
    await notificationService.requestPermission();
    
    // Configurar listener para novas notificações
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'notification_sent') {
        setNotifications(prev => [...prev, {
          id: Date.now(),
          title: data.title,
          body: data.options.body,
          timestamp: new Date(),
          read: false
        }]);
      }
    });

    // Cleanup
    return unsubscribe;
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('simplific_user', JSON.stringify(userData));
    
    // Enviar notificação de boas-vindas
    setTimeout(() => {
      notificationService.sendNotification(
        `Bem-vindo, ${userData.name}!`,
        {
          body: 'Você está conectado ao Simplific Pro. Gerencie suas finanças com facilidade!',
          icon: '/favicon.ico'
        }
      );
    }, 2000);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('simplific_user');
    localStorage.removeItem('simplific_token');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ThemeProvider>
        <Routes>

        {/* --- NOVO: Rotas Públicas da Landing Page --- */}
            {/* Elas ficam acessíveis mesmo sem login */}
            <Route path="/beneficios" element={<Beneficios />} />
            <Route path="/inteligencia" element={<Inteligencia />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/termos" element={<Termos />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/contato" element={<Contato />} />
            
            <Route path="/seguranca" element={<SecurityPage />} /> {/* <--- 2. ROTA NOVA AQUI */}

            {/* ------------------------------------------- */}

            <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} 
            />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rota de Layout Protegido */}
            <Route 
                element={user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            >
                <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
                <Route path="/planning" element={<Planning user={user} onLogout={handleLogout} />} />
                <Route path="/transactions" element={<Transactions user={user} onLogout={handleLogout} />} />
                <Route path="/credit-cards" element={<CreditCards user={user} onLogout={handleLogout} />} />
                <Route path="/goals" element={<Goals user={user} onLogout={handleLogout} />} />
                <Route path="/investments" element={<Investments user={user} onLogout={handleLogout} />} />
                <Route path="/schedule" element={<Schedule user={user} onLogout={handleLogout} />} />
                <Route path="/simplific-ia" element={<SimplificIA user={user} onLogout={handleLogout} />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/analysis" element={<Analysis user={user} onLogout={handleLogout} />} />
                <Route path="/categories" element={<CategoriesSettings user={user} />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/advisor-features" element={<AdvisorFeatures />} />
                
                <Route 
                path="/admin" 
                element={
                <AdminRoute user={user}>
                <AdminPanel user={user} onLogout={handleLogout} />
                </AdminRoute>
                } 
                />

              {/* Rota de Gestão de Marketing (Protegida) */}
                <Route 
                  path="/admin/marketing" 
                  element={
                    <AdminRoute user={user}>
                      <MarketingDashboard />
                    </AdminRoute>
                  } 
                />


                {/*Rotas protegidas empresairias*/} 
                <Route 
                  path="/business" 
                  element={
                  <AdminRoute user={user}>
                    <BusinessAccess user={user} onLogout={handleLogout} />
                  </AdminRoute>
                  } 
                />

              <Route 
                path="/business/stakeholders" 
                element={
                  <AdminRoute user={user}>
                    <Stakeholders user={user} onLogout={handleLogout} />
                  </AdminRoute>
                } 
              />

              <Route 
                path="/business/settings/company" 
                element={
                <AdminRoute user={user}>
                  <CompanySettings user={user} onLogout={handleLogout} />
                </AdminRoute>
                } 
              />

                <Route path="/reports" element={<Reports user={user} onLogout={handleLogout} />} />
                <Route path="/settings" element={<Settings user={user} onLogout={handleLogout} />} />
            </Route>

            <Route 
                path="/" 
                element={user ? <Navigate to="/dashboard" replace /> : <HomePage />}  
            />
        </Routes>
        
      </ThemeProvider>
    </Router>
  );
};

export default App;