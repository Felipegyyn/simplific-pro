import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRing, LogOut, BookOpen, Building2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import logo from '../assets/LOGO.png';
import notificationService from '../services/notifications';
import NotificationCenter from '@/components/NotificationCenter';

// Tutoriais Específicos para Empresa (Pode personalizar depois)
const businessTutorials = [
  { name: 'Primeiros passos no ERP', url: '#' },
  { name: 'Como cadastrar Clientes', url: '#' },
  { name: 'Fluxo de Caixa', url: '#' },
];

const PageHeaderBusiness = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  // --- Lógica de Notificações (Compartilhada) ---
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
    return () => unsubscribe();
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

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-cyan-100 dark:border-slate-800 mb-6">
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Lado Esquerdo: Identidade da Empresa */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Simplific Pro" className="h-8 w-auto opacity-90" />
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
          <div className="flex items-center gap-2">
             <div className="bg-cyan-100 dark:bg-cyan-900/30 p-1.5 rounded-md text-cyan-700 dark:text-cyan-400">
                <Building2 size={18} />
             </div>
             <div>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight hidden sm:block">
                  Simplific Empresas
                </h1>
                <Badge variant="outline" className="hidden sm:inline-flex text-[10px] h-4 px-1 py-0 border-cyan-200 text-cyan-600">
                  Módulo PJ
                </Badge>
             </div>
          </div>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          
          {/* Dropdown de Tutoriais (Empresarial) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden sm:flex border-cyan-200 hover:bg-cyan-50 dark:border-slate-700 dark:hover:bg-slate-800">
                <BookOpen className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                Ajuda
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Central de Ajuda PJ</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {businessTutorials.map((tutorial) => (
                <DropdownMenuItem key={tutorial.name} asChild>
                  <a href={tutorial.url} className="cursor-pointer">
                    {tutorial.name}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notificações */}
          <Dialog open={isNotificationCenterOpen} onOpenChange={setIsNotificationCenterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="relative border-slate-200 dark:border-slate-700">
                {unreadCount > 0 ? <BellRing className="h-4 w-4 text-cyan-600" /> : <Bell className="h-4 w-4" />}
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 bg-cyan-600 hover:bg-cyan-700 border-none text-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Notificações da Empresa</DialogTitle>
              </DialogHeader>
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onClearAll={handleClearAllNotifications}
              />
            </DialogContent>
          </Dialog>
          
          {/* Usuário Admin */}
          <div className="text-right hidden md:block">
             <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">{user?.name?.split(' ')[0]}</span>
             <span className="block text-xs text-slate-400">Administrador</span>
          </div>

          {/* Botão Sair */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut size={18} />
          </Button>

        </div>
      </div>
    </header>
  );
};

export default PageHeaderBusiness;