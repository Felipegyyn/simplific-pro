import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import eventService from '../services/eventService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend, ComposedChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, CreditCard, Target, 
  PieChart as PieChartIcon, Calendar, Users, LogOut, 
  ArrowUpRight, ArrowDownRight, Wallet, Building2,
  AlertTriangle, CheckCircle, Clock, Activity, Bell, BellRing, FileText
} from 'lucide-react';
import logo from '../assets/LOGO.png';
import apiService from '../services/api';
import notificationService from '../services/notifications';
import NotificationCenter from '@/components/NotificationCenter';

const Dashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalReceitas: 0,
      totalDespesas: 0,
      saldoLiquido: 0,
      totalInvestimentos: 0,
      totalMetas: 0,
      metasConcluidas: 0,
      proximosEventos: 0,
      cartoesPendentes: 0
    },
    chartData: {
      evolution: [],
      categories: [],
      investments: [],
      top5Expenses: []
    },
    overallStatus: { text: 'Carregando...', Icon: Clock, badgeText: '', badgeColor: '', color: '' },
    loading: true
  });
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [pvrData, setPvrData] = useState([]);
  const [pvrLoading, setPvrLoading] = useState(true);
  const [pvrTypeFilter, setPvrTypeFilter] = useState('saida');
  const [pvrCategoryFilter, setPvrCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [summaryData, setSummaryData] = useState(null);

  const loadSummaryData = async () => {
    try {
      // CORREÇÃO: Usando a função correta do apiService
      const data = await apiService.getDashboardSummary(selectedYear, selectedMonth);
      setSummaryData(data);
    } catch (error) {
      console.error("Erro ao carregar resumo do dashboard:", error);
      setSummaryData(null);
    }
  };

  const calculateInvestmentValues = (investment) => {
    let currentValue = investment.current_value;
    if (investment.expected_monthly_yield) {
      const principal = investment.initial_value;
      const monthlyRate = (investment.expected_monthly_yield ?? 0) / 100;
      if (principal && monthlyRate) {
        const purchaseDate = new Date(investment.purchase_date);
        const today = new Date();
        purchaseDate.setUTCHours(0, 0, 0, 0);
        today.setUTCHours(0, 0, 0, 0);
        let months = (today.getFullYear() - purchaseDate.getFullYear()) * 12;
        months -= purchaseDate.getMonth();
        months += today.getMonth();
        const numberOfMonths = months <= 0 ? 0 : months;
        currentValue = principal * Math.pow(1 + monthlyRate, numberOfMonths);
      }
    }
    const initialValue = investment.initial_value;
    let profitability = 0;
    if (initialValue && initialValue !== 0) {
      profitability = ((currentValue - initialValue) / initialValue) * 100;
    }
    return {
      dynamic_current_value: currentValue,
      dynamic_profitability: profitability,
    };
  };

  const getOverallStatus = (summary) => {
    const { saldoLiquido, proximosEventos, metasAtivas } = summary;
    let score = 0;
    if (saldoLiquido > 0) score += 2;
    if (proximosEventos === 0) score += 1;
    if (metasAtivas > 0) score += 1;
    
    if (score === 4) return { text: 'Excelente', badgeText: 'Tudo em dia', color: 'text-green-600', badgeColor: 'bg-green-100 text-green-800', Icon: CheckCircle };
    if (score >= 2) return { text: 'Bom', badgeText: 'No caminho certo', color: 'text-blue-600', badgeColor: 'bg-blue-100 text-blue-800', Icon: Activity };
    if (saldoLiquido <= 0) return { text: 'Atenção', badgeText: 'Saldo negativo', color: 'text-yellow-600', badgeColor:'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', Icon: AlertTriangle };
    return { text: 'Revisar', badgeText: 'Verificar pendências', color: 'text-red-600', badgeColor:'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', Icon: AlertTriangle };
  };

  useEffect(() => {
    loadSummaryData();
    loadDashboardData();
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

    const handleTransactionsChange = () => {
      console.log('Dashboard ouviu a mudança nas transações, atualizando dados...');
      loadDashboardData();
    };
    eventService.on('transactionsChanged', handleTransactionsChange);

    return () => {
        unsubscribe();
        eventService.off('transactionsChanged', handleTransactionsChange);
    };
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    const loadPvrData = async () => {
      setPvrLoading(true);
      try {
        if (categories.length === 0) {
          // CORREÇÃO: Usando a função correta do apiService
          const categoriesResponse = await apiService.getCategories();
          setCategories(categoriesResponse || []);
        }
        // CORREÇÃO: Usando a função correta do apiService
        const response = await apiService.getPlannedVsRealized(selectedYear, pvrTypeFilter, pvrCategoryFilter !== 'all' ? pvrCategoryFilter : null);
        setPvrData(response || []);
      } catch (error) {
        console.error("Erro ao carregar dados de Planejado vs Realizado:", error);
        setPvrData([]);
      } finally {
        setPvrLoading(false);
      }
    };
    loadPvrData();
  }, [selectedYear, pvrTypeFilter, pvrCategoryFilter]);

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      const [
        transactionsData,
        investmentsData,
        goalsData,
        scheduleData,
        creditCardsData,
        allCategoriesData
      ] = await Promise.all([
        apiService.getTransactions().catch(() => ({ transactions: [] })),
        apiService.getInvestments().catch(() => ({ investments: [] })),
        apiService.getGoals().catch(() => ([])),
        apiService.getScheduleEvents().catch(() => ([])),
        apiService.getCreditCards().catch(() => ([])),
        // CORREÇÃO: Usando a função correta do apiService
        apiService.getCategories().catch(() => [])
      ]);

      setCategories(Array.isArray(allCategoriesData) ? allCategoriesData : []);

      const transactions = transactionsData.transactions || [];
      const investments = investmentsData || [];
      const goals = Array.isArray(goalsData) ? goalsData : [];
      console.log("DADOS BRUTOS RECEBIDOS DE GOALS:", JSON.stringify(goalsData, null, 2));
      console.log("ARRAY 'goals' PROCESSADO:", JSON.stringify(goals, null, 2));
      const events = Array.isArray(scheduleData) ? scheduleData : [];
      const creditCards = Array.isArray(creditCardsData) ? creditCardsData : (creditCardsData?.credit_cards || []);

      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.transaction_date || t.date);
        return transactionDate.getMonth() + 1 === selectedMonth && 
               transactionDate.getFullYear() === selectedYear;
      });

      const receitas = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
      const despesas = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const gastosPorCategoria = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((acc, transaction) => {
          const category = transaction.category || 'Sem Categoria';
          const value = transaction.amount || 0;
          if (!acc[category]) {
            acc[category] = 0;
          }
          acc[category] += value;
          return acc;
        }, {});

      const top5Gastos = Object.entries(gastosPorCategoria)
        .map(([name, value]) => ({
          name,
          value,
          percent: despesas > 0 ? (value / despesas) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      const investimentosCalculados = investments.map(inv => {
        const calculatedData = calculateInvestmentValues(inv);
        return { ...inv, ...calculatedData };
      });

      const valorTotalInvestido = investimentosCalculados.reduce((sum, inv) => sum + (inv.initial_value ?? 0), 0);
      const valorAtualTotal = investimentosCalculados.reduce((sum, inv) => sum + (inv.dynamic_current_value ?? 0), 0);
      const lucroTotal = valorAtualTotal - valorTotalInvestido;
      const rentabilidadeTotal = valorTotalInvestido !== 0 ? (lucroTotal / valorTotalInvestido) * 100 : 0;
      
      const metasConcluidas = goals.filter(meta => meta.is_completed).length;
      const metasAtivas = goals.filter(meta => meta.is_active && !meta.is_completed).length;
      const hoje = new Date().toISOString().split('T')[0];
      const proximosEventos = events.filter(e => e.date >= hoje && !e.is_completed).length;
      const limiteTotalCartoes = creditCards.reduce((sum, card) => sum + (card.limit || 0), 0);
      const limiteDisponivelCartoes = creditCards.reduce((sum, card) => sum + (card.available_limit || 0), 0);
      const overallStatus = getOverallStatus({ saldoLiquido: receitas - despesas, proximosEventos, metasAtivas });

      const evolutionData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(selectedYear, selectedMonth - 1 - i, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const monthTransactions = transactions.filter(t => {
          const tDate = new Date(t.transaction_date || t.date);
          return tDate.getMonth() + 1 === month && tDate.getFullYear() === year;
        });
        
        const monthReceitas = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
        const monthDespesas = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
        
        evolutionData.push({
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          receitas: monthReceitas,
          despesas: monthDespesas,
          saldo: monthReceitas - monthDespesas
        });
      }

      const categoriesMap = {};
      filteredTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const category = t.category || 'Outros';
            categoriesMap[category] = (categoriesMap[category] || 0) + (t.amount || 0);
        });
      
      const categoriesData = Object.keys(categoriesMap).length > 0 
        ? Object.entries(categoriesMap).map(([name, value], index) => ({
            name,
            value,
            color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff88', '#ff0088'][index % 6]
          }))
        : [];

      const investmentsChartData = investments.length > 0
        ? investments.map((inv, index) => ({
            name: inv.name || inv.symbol,
            value: inv.current_value,
            color: ['#8884d8', '#82ca9d', '#ffc658'][index % 3]
          }))
        : [];

      setDashboardData({
        summary: {
          totalReceitas: receitas,
          totalDespesas: despesas,
          saldoLiquido: receitas - despesas,
          investmentsCurrentValue: valorAtualTotal,
          investmentsProfitability: rentabilidadeTotal,
          metasAtivas: metasAtivas,
          metasConcluidas: metasConcluidas,
          proximosEventos,
          limiteTotalCartoes: limiteTotalCartoes,
          limiteDisponivelCartoes: limiteDisponivelCartoes
        },
        chartData: {
          evolution: evolutionData,
          categories: categoriesData,
          investments: investmentsChartData,
          top5Expenses: top5Gastos
        },
        overallStatus: overallStatus,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

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
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    notificationService.clearOldNotifications();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  let totalReceitas = dashboardData.summary.totalReceitas;
  let totalDespesas = dashboardData.summary.totalDespesas;
  let saldoLiquido = dashboardData.summary.saldoLiquido;
  let receitaPercentual = 0;
  let despesaPercentual = 0;
  let statusSaldo = { text: 'Carregando...', Icon: Clock, color: 'text-gray-100' };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  };

  if (summaryData) {
    totalReceitas = summaryData.current_month.revenue;
    totalDespesas = summaryData.current_month.expense;
    saldoLiquido = totalReceitas - totalDespesas;

    receitaPercentual = calculatePercentageChange(totalReceitas, summaryData.previous_month.revenue);
    despesaPercentual = calculatePercentageChange(totalDespesas, summaryData.previous_month.expense);

    if (saldoLiquido > 0) {
      statusSaldo = { text: 'Saldo positivo', Icon: ArrowUpRight, color: 'text-blue-100' };
    } else if (saldoLiquido < 0) {
      statusSaldo = { text: 'Saldo negativo', Icon: ArrowDownRight, color: 'text-orange-300' };
    } else {
      statusSaldo = { text: 'Saldo zerado', Icon: Wallet, color: 'text-blue-100' };
    }
  }

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-700">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
            <h1 className="text-xl font-bold text-green-800 dark:text-green-400">Simplific Pro</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
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
            
            <span className="hidden sm:inline text-sm text-gray-600 dark:text-slate-300">
              Seja bem-vindo - <strong>{user?.name || 'Usuário'}</strong>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="flex items-center space-x-2"
            >
              <LogOut size={16} />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium dark:text-slate-200">Filtrar por:</span>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Janeiro</SelectItem>
              <SelectItem value="2">Fevereiro</SelectItem>
              <SelectItem value="3">Março</SelectItem>
              <SelectItem value="4">Abril</SelectItem>
              <SelectItem value="5">Maio</SelectItem>
              <SelectItem value="6">Junho</SelectItem>
              <SelectItem value="7">Julho</SelectItem>
              <SelectItem value="8">Agosto</SelectItem>
              <SelectItem value="9">Setembro</SelectItem>
              <SelectItem value="10">Outubro</SelectItem>
              <SelectItem value="11">Novembro</SelectItem>
              <SelectItem value="12">Dezembro</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Receitas</p>
                <p className="text-2xl font-bold">{formatCurrency(totalReceitas)}</p>
              </div>
              <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span className="text-sm text-green-100">{receitaPercentual.toFixed(1)}% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Despesas</p>
                <p className="text-2xl font-bold">{formatCurrency(totalDespesas)}</p>
              </div>
              <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
                <TrendingDown className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span className="text-sm text-red-100">{despesaPercentual > 0 ? '+' : ''}{despesaPercentual.toFixed(1)}% vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Saldo Líquido</p>
                <p className="text-2xl font-bold">{formatCurrency(saldoLiquido)}</p>
              </div>
              <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <div className={`flex items-center mt-4 ${statusSaldo.color}`}>
              <statusSaldo.Icon className="h-4 w-4 mr-1" />
              <span className="text-sm">{statusSaldo.text}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Investimentos</p>
                <p className="text-2xl font-bold">{formatCurrency(dashboardData.summary.investmentsCurrentValue)}</p>
              </div>
              <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            <div className="flex items-center mt-4">
              {dashboardData.summary.investmentsProfitability >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm text-purple-100">
                {dashboardData.summary.investmentsProfitability.toFixed(2)}% rentabilidade
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium dark:text-slate-400">Metas Ativas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{dashboardData.summary.metasAtivas}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {dashboardData.summary.metasConcluidas} concluídas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
               <p className="text-gray-600 text-sm font-medium dark:text-slate-400">Próximos Eventos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{dashboardData.summary.proximosEventos}</p>
              </div>
              <Calendar className="h-8 w-8 text-pink-500" />
            </div>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Esta semana
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium dark:text-slate-400">Limite disponível</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">
                  {formatCurrency(dashboardData.summary.limiteDisponivelCartoes)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              {dashboardData.summary.limiteTotalCartoes > 0 && 
               (dashboardData.summary.limiteDisponivelCartoes / dashboardData.summary.limiteTotalCartoes <= 0.1) ? (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Atenção
                </Badge>
              ) : (
               <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Tudo certo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium dark:text-slate-400">Status Geral</p>
                <p className={`text-2xl font-bold ${dashboardData.overallStatus.color}`}>
                  {dashboardData.overallStatus.text}
                </p>
              </div>
              <dashboardData.overallStatus.Icon className={`h-8 w-8 ${dashboardData.overallStatus.color}`} />
            </div>
            <div className="mt-2">
              <Badge variant="default" className={`text-xs ${dashboardData.overallStatus.badgeColor}`}>
                <dashboardData.overallStatus.Icon className="h-3 w-3 mr-1" />
                {dashboardData.overallStatus.badgeText}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
               <TrendingDown className="h-5 w-5 mr-2 text-red-600 dark:text-slate-50" />
                Top 5 Maiores Gastos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.chartData.top5Expenses.map((gasto, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium dark:text-slate-200">{gasto.name}</span>
                    <span className="font-bold">{formatCurrency(gasto.value)}</span>
                  </div>
                  <div className="flex items-center">
                    <Progress value={gasto.percent} className="h-2 flex-1" />
                    <span className="text-xs text-gray-500 w-12 text-right">{gasto.percent.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChartIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-slate-50" />
                Gastos por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dashboardData.chartData.categories}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="#999"
                    fontSize={12}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    formatter={(value) => [formatCurrency(value), 'Valor Gasto']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {dashboardData.chartData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
               <TrendingUp className="h-5 w-5 mr-2 text-green-600 dark:text-slate-50" />
                Evolução Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.chartData.evolution}>
                  <CartesianGrid stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Planejado vs. Realizado</span>
                <div className="flex items-center gap-2">
                  <Select value={pvrTypeFilter} onValueChange={setPvrTypeFilter}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saida">Despesas</SelectItem>
                      <SelectItem value="entrada">Receitas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={pvrCategoryFilter} onValueChange={setPvrCategoryFilter}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue placeholder="Categoria..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] overflow-y-auto">
                      <SelectItem value="all">Todas</SelectItem> 
                      {categories
                        .filter(cat => cat.type === pvrTypeFilter)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={pvrData}>
                  <CartesianGrid stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="planejado" fill="#a78bfa" name="Planejado" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="realizado" stroke="#10b981" strokeWidth={3} name="Realizado" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// LINHA CORRIGIDA
export default Dashboard;