import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, BellOff, Settings, Trash2, Check, X, 
  CreditCard, Target, TrendingUp, Calendar
} from 'lucide-react';
import notificationService from '../services/notifications';

const NotificationCenter = ({ notifications, onMarkAsRead, onClearAll }) => {
  const [settings, setSettings] = useState(notificationService.getSettings());

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'goal': return <Target className="h-4 w-4" />;
      case 'investment': return <TrendingUp className="h-4 w-4" />;
      case 'schedule': return <Calendar className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes}m atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    return time.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Central de Notificações</h2>
          {notifications.filter(n => !n.read).length > 0 && (
            <Badge variant="destructive">
              {notifications.filter(n => !n.read).length}
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onClearAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Todas
          </Button>
        </div>
      </div>

      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Status do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Notificações do Navegador</span>
            <Badge variant={settings.enabled ? "default" : "secondary"}>
              {settings.enabled ? "Habilitadas" : "Desabilitadas"}
            </Badge>
          </div>
          
          {!settings.enabled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <BellOff className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  Clique no ícone de cadeado na barra de endereços para habilitar notificações
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Lembretes de Pagamento</Label>
              <p className="text-sm text-gray-500">
                Receba alertas sobre vencimentos próximos
              </p>
            </div>
            <Switch
              checked={settings.paymentReminders}
              onCheckedChange={(checked) => handleSettingChange('paymentReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Atualizações de Metas</Label>
              <p className="text-sm text-gray-500">
                Notificações sobre progresso e conquistas
              </p>
            </div>
            <Switch
              checked={settings.goalUpdates}
              onCheckedChange={(checked) => handleSettingChange('goalUpdates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Alertas de Orçamento</Label>
              <p className="text-sm text-gray-500">
                Avisos quando atingir limites de gastos
              </p>
            </div>
            <Switch
              checked={settings.budgetAlerts}
              onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Atualizações de Investimentos</Label>
              <p className="text-sm text-gray-500">
                Informações sobre performance da carteira
              </p>
            </div>
            <Switch
              checked={settings.investmentUpdates}
              onCheckedChange={(checked) => handleSettingChange('investmentUpdates', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação ainda</p>
              <p className="text-sm">Você receberá alertas importantes aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.body}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teste de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Teste de Notificação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Teste diferentes tipos de notificações para verificar se estão funcionando
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => notificationService.notifyPaymentDue({
                  id: 999,
                  description: 'Teste de Pagamento',
                  amount: 1500,
                  daysUntilDue: 2
                })}
              >
                Teste Pagamento
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => notificationService.notifyGoalAchieved({
                  id: 999,
                  name: 'Meta de Teste',
                  target_amount: 10000
                })}
              >
                Teste Meta
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => notificationService.notifyBudgetAlert({
                  category: 'Teste',
                  spent_percentage: 85
                })}
              >
                Teste Orçamento
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;

