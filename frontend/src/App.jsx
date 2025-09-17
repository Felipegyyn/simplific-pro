import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Componentes
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Transactions from './pages/Transactions';
import CreditCards from './pages/CreditCards';
import Goals from './pages/Goals';
import Investments from './pages/Investments';
import Schedule from './pages/Schedule';
import AdminPanel from './pages/AdminPanel';
import Reports from './pages/Reports';
import Settings from './pages/Settings'; 
import Analysis from './pages/Analysis'; 
import SimplificIA from './pages/SimplificIA';
import MainLayout from './components/MainLayout'; 
import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext'; 
import HomePage from './pages/HomePage';

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
      <ThemeProvider> {/* <-- ADICIONE A TAG DE ABERTURA AQUI */}
        <Routes>
            <Route 
                path="/login" 
                element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} 
            />

            {/* Rota de Layout Protegido */}
            <Route 
                element={user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
            >
                <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
                <Route path="/planning" element={<Planning user={user} onLogout={handleLogout} />} />
                <Route path="/transactions" element={<Transactions user={user} onLogout={handleLogout} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/credit-cards" element={<CreditCards user={user} onLogout={handleLogout} />} />
                <Route path="/goals" element={<Goals user={user} onLogout={handleLogout} />} />
                <Route path="/investments" element={<Investments user={user} onLogout={handleLogout} />} />
                <Route path="/schedule" element={<Schedule user={user} onLogout={handleLogout} />} />
                <Route path="/simplific-ia" element={<SimplificIA user={user} onLogout={handleLogout} />} />
                <Route path="/analysis" element={<Analysis user={user} onLogout={handleLogout} />} />
                // Para este bloco:
                <Route 
                path="/admin" 
                element={
                <AdminRoute user={user}>
                <AdminPanel user={user} onLogout={handleLogout} />
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
         </ThemeProvider> {/* <-- ADICIONE A TAG DE FECHAMENTO AQUI */}
    </Router>
);
};

export default App;

