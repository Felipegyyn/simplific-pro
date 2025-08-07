// Sistema de Notificações Push
class NotificationService {
  constructor() {
    this.permission = null;
    this.isSupported = 'Notification' in window;
    this.notifications = [];
    this.subscribers = [];
    
    this.init();
  }

  // Inicializar serviço de notificações
  async init() {
    if (!this.isSupported) {
      console.warn('Notificações não são suportadas neste navegador');
      return;
    }

    // Verificar permissão atual
    this.permission = Notification.permission;
    
    // Se ainda não foi solicitada, solicitar permissão
    if (this.permission === 'default') {
      await this.requestPermission();
    }

    // Configurar verificação periódica de lembretes
    this.setupPeriodicChecks();
  }

  // Solicitar permissão para notificações
  async requestPermission() {
    if (!this.isSupported) return false;

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('Erro ao solicitar permissão para notificações:', error);
      return false;
    }
  }

  // Verificar se notificações estão habilitadas
  isEnabled() {
    return this.isSupported && this.permission === 'granted';
  }

  // Enviar notificação
  async sendNotification(title, options = {}) {
    if (!this.isEnabled()) {
      console.warn('Notificações não estão habilitadas');
      return null;
    }

    const defaultOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'simplific-pro',
      requireInteraction: false,
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // Configurar eventos
      notification.onclick = () => {
        window.focus();
        if (options.onClick) {
          options.onClick();
        }
        notification.close();
      };

      notification.onclose = () => {
        if (options.onClose) {
          options.onClose();
        }
      };

      // Auto-fechar após 5 segundos se não for interativa
      if (!defaultOptions.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }

      // Armazenar notificação
      this.notifications.push({
        id: Date.now(),
        title,
        options: defaultOptions,
        timestamp: new Date(),
        notification
      });

      // Notificar subscribers
      this.notifySubscribers('notification_sent', { title, options: defaultOptions });

      return notification;
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      return null;
    }
  }

  // Notificações específicas do sistema financeiro
  async notifyPaymentDue(payment) {
    return this.sendNotification(
      `💳 Pagamento Vencendo`,
      {
        body: `${payment.description} - R$ ${payment.amount.toLocaleString()} vence em ${payment.daysUntilDue} dia(s)`,
        icon: '/icons/payment.png',
        tag: `payment-${payment.id}`,
        requireInteraction: true,
        onClick: () => {
          window.location.hash = '#/schedule';
        }
      }
    );
  }

  async notifyGoalAchieved(goal) {
    return this.sendNotification(
      `🎯 Meta Alcançada!`,
      {
        body: `Parabéns! Você atingiu a meta "${goal.name}" de R$ ${goal.target_amount.toLocaleString()}`,
        icon: '/icons/goal.png',
        tag: `goal-${goal.id}`,
        onClick: () => {
          window.location.hash = '#/goals';
        }
      }
    );
  }

  async notifyInvestmentUpdate(investment) {
    const isPositive = investment.return_percentage > 0;
    return this.sendNotification(
      `📈 Atualização de Investimento`,
      {
        body: `${investment.name}: ${isPositive ? '+' : ''}${investment.return_percentage.toFixed(2)}% (R$ ${investment.current_value.toLocaleString()})`,
        icon: isPositive ? '/icons/profit.png' : '/icons/loss.png',
        tag: `investment-${investment.id}`,
        onClick: () => {
          window.location.hash = '#/investments';
        }
      }
    );
  }

  async notifyBudgetAlert(budget) {
    return this.sendNotification(
      `⚠️ Alerta de Orçamento`,
      {
        body: `Você gastou ${budget.spent_percentage.toFixed(1)}% do orçamento de ${budget.category}`,
        icon: '/icons/warning.png',
        tag: `budget-${budget.category}`,
        requireInteraction: true,
        onClick: () => {
          window.location.hash = '#/planning';
        }
      }
    );
  }

  async notifyTransactionAdded(transaction) {
    const isIncome = transaction.amount > 0;
    return this.sendNotification(
      `💰 Nova Transação`,
      {
        body: `${isIncome ? 'Receita' : 'Despesa'}: ${transaction.description} - R$ ${Math.abs(transaction.amount).toLocaleString()}`,
        icon: isIncome ? '/icons/income.png' : '/icons/expense.png',
        tag: `transaction-${transaction.id}`,
        onClick: () => {
          window.location.hash = '#/transactions';
        }
      }
    );
  }

  // Configurar verificações periódicas
  setupPeriodicChecks() {
    // Verificar lembretes a cada hora
    setInterval(() => {
      this.checkUpcomingPayments();
      this.checkGoalProgress();
      this.checkBudgetLimits();
    }, 60 * 60 * 1000); // 1 hora

    // Verificação inicial após 30 segundos
    setTimeout(() => {
      this.checkUpcomingPayments();
    }, 30000);
  }

  // Verificar pagamentos próximos do vencimento
  async checkUpcomingPayments() {
    try {
      // Simular dados - em produção viria da API
      const upcomingPayments = [
        {
          id: 1,
          description: 'Cartão Nubank',
          amount: 2800,
          due_date: '2024-06-25',
          daysUntilDue: this.calculateDaysUntil('2024-06-25')
        }
      ];

      upcomingPayments.forEach(payment => {
        if (payment.daysUntilDue <= 3 && payment.daysUntilDue >= 0) {
          this.notifyPaymentDue(payment);
        }
      });
    } catch (error) {
      console.error('Erro ao verificar pagamentos:', error);
    }
  }

  // Verificar progresso das metas
  async checkGoalProgress() {
    try {
      // Simular dados - em produção viria da API
      const goals = [
        {
          id: 1,
          name: 'Reserva de Emergência',
          target_amount: 30000,
          current_amount: 30000,
          progress: 100
        }
      ];

      goals.forEach(goal => {
        if (goal.progress >= 100) {
          this.notifyGoalAchieved(goal);
        }
      });
    } catch (error) {
      console.error('Erro ao verificar metas:', error);
    }
  }

  // Verificar limites de orçamento
  async checkBudgetLimits() {
    try {
      // Simular dados - em produção viria da API
      const budgets = [
        {
          category: 'Alimentação',
          limit: 1500,
          spent: 1350,
          spent_percentage: 90
        }
      ];

      budgets.forEach(budget => {
        if (budget.spent_percentage >= 80) {
          this.notifyBudgetAlert(budget);
        }
      });
    } catch (error) {
      console.error('Erro ao verificar orçamentos:', error);
    }
  }

  // Calcular dias até uma data
  calculateDaysUntil(dateString) {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Sistema de subscribers para eventos
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers(event, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Erro ao notificar subscriber:', error);
      }
    });
  }

  // Obter histórico de notificações
  getNotificationHistory() {
    return this.notifications.slice(-50); // Últimas 50 notificações
  }

  // Limpar notificações antigas
  clearOldNotifications() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(
      notification => notification.timestamp > oneDayAgo
    );
  }

  // Configurações de notificação
  getSettings() {
    return {
      enabled: this.isEnabled(),
      permission: this.permission,
      supported: this.isSupported,
      paymentReminders: localStorage.getItem('notify_payments') !== 'false',
      goalUpdates: localStorage.getItem('notify_goals') !== 'false',
      budgetAlerts: localStorage.getItem('notify_budget') !== 'false',
      investmentUpdates: localStorage.getItem('notify_investments') !== 'false'
    };
  }

  updateSettings(settings) {
    localStorage.setItem('notify_payments', settings.paymentReminders);
    localStorage.setItem('notify_goals', settings.goalUpdates);
    localStorage.setItem('notify_budget', settings.budgetAlerts);
    localStorage.setItem('notify_investments', settings.investmentUpdates);
  }
}

export default new NotificationService();

