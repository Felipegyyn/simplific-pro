import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRing, LogOut, BookOpen 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import logo from '../assets/LOGO.png';
import notificationService from '../services/notifications';
import NotificationCenter from '@/components/NotificationCenter';

// Lista de tutoriais centralizada
const tutorials = [
  { name: 'Primeiros passos', url: 'https://drive.google.com/file/d/10eHUcQS7rOOp1c4glcFY2Q9JevMvQNyf/view?usp=sharing' },
  { name: 'Planejamento', url: 'https://drive.google.com/file/d/1F-z6QO8OQaySz1OUshtQIj6kEjVhrIUP/view?usp=drive_link' },
  { name: 'Lançamentos', url: 'https://drive.google.com/file/d/1Jv60P9xCEf2c9_PMwGxipQyNF6lAWK5I/view?usp=drive_link' },
  { name: 'Cartões', url: 'https://drive.google.com/file/d/1TqYdxBrC8mgFfADKLtd4VP2wGc0BPEgt/view?usp=drive_link' },
  { name: 'Metas', url: 'https://drive.google.com/file/d/1HBegoIhPzfVpWLuNTxMziilSxnxu0_A3/view?usp=drive_link' },
  { name: 'Investimentos', url: 'https://drive.google.com/file/d/1FXA8k_S7_oSoxu_0jMEFSu6IA-DiWpGa/view?usp=drive_link' },
  { name: 'Agenda', url: 'https://drive.google.com/file/d/1gwuEcxEV6t7lSJSuqjUgO8ganuE6osoy/view?usp=drive_link' },
  { name: 'Análise e Balanço', url: 'https://drive.google.com/file/d/1LeSJHcaBlzZ22KhQuFmyJ-7EqGZdkmIv/view?usp=drive_link' },
  { name: 'Assessor Simplific', url: 'https://drive.google.com/file/d/1kKL3cdwyLx_J7KLeQ78FudKn2oMgw6dQ/view?usp=drive_link' },
];

const PageHeader = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // --- Lógica de Notificações (Extraída do Dashboard) ---
  useEffect(() => {
    loadNotifications();
    
    const unsubscribe = notificationService.subscribe((event, data) => {
      if (event === 'notification_sent') {
        const newNotification = {
          id: Date.now(),
          title: data.title,
          body: data.options.body,
          timestamp: new Date(),
          read: false,
          type: data.options.tag?.split('-')[0] || 'general'
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadNotifications = () => {
    const history = notificationService.getNotificationHistory();
    const formattedNotifications = history.map(n => ({
      id: n.id,
      title: n.title,
      body: n.options.body,
      timestamp: n.timestamp,
      read: false,
      type: n.options.tag?.split('-')[0] || 'general'
    }));
    
    setNotifications(formattedNotifications);
    setUnreadCount(formattedNotifications.filter(n => !n.read).length);
  };

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    notificationService.clearOldNotifications();
  };
  // -----------------------------------------------------

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700 mb-6">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Lado Esquerdo: Logo e Título */}
        <div className="flex items-center">
          <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
          <h1 className="text-xl font-bold text-green-800 dark:text-green-400 hidden sm:block">Simplific Pro</h1>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Dropdown de Tutoriais */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <BookOpen className="h-4 w-4 mr-2" />
                Tutoriais
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Guia Rápido</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tutorials.map((tutorial) => (
                <DropdownMenuItem key={tutorial.name} asChild>
                  <a href={tutorial.url} target="_blank" rel="noopener noreferrer">
                    {tutorial.name}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Central de Notificações */}
          <Dialog open={isNotificationCenterOpen} onOpenChange={setIsNotificationCenterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                {unreadCount > 0 ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Central de Notificações</DialogTitle>
              </DialogHeader>
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAllNotifications}
              />
            </DialogContent>
          </Dialog>
          
          {/* Info do Usuário */}
          <span className="hidden md:inline text-sm text-gray-600 dark:text-slate-300">
             <strong>{user?.name?.split(' ')[0] || 'Usuário'}</strong>
          </span>

          {/* Botão Sair */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="flex items-center space-x-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sair</span>
          </Button>

        </div>
      </div>
    </header>
  );
};

export default PageHeader;