import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import WhatsNewModal from '@/components/WhatsNewModal';
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
  AlertTriangle, CheckCircle, Clock, Activity, Bell, BellRing, FileText,BookOpen, Image, Download
} from 'lucide-react';
import logo from '../assets/LOGO.png';
import { cn } from "@/lib/utils";
import apiService from '../services/api';
import notificationService from '../services/notifications';
import NotificationCenter from '@/components/NotificationCenter';
import styles from './Dashboard.module.css';

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
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);


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


// ▼▼▼ SUBSTITUA A FUNÇÃO 'handleGenerateVisualReport' INTEIRA POR ESTA ▼▼▼
const handleGenerateVisualReport = async () => {
  setIsGeneratingReport(true);
  setGeneratedImageUrl(null); // Usaremos o state antigo de imagem
  setIsReportModalOpen(false);

  try {
    const response = await apiService.post('/api/reports/visual-reports', {
      month: selectedMonth,
      year: selectedYear,
    });

    if (response.data && response.data.image_url) {
      setGeneratedImageUrl(response.data.image_url); // Armazena apenas a URL
      setIsReportModalOpen(true);
    } else {
      throw new Error("A resposta da API não continha um URL de imagem.");
    }
  } catch (error) {
    console.error("Erro ao gerar relatório visual:", error);
    alert(error.response?.data?.error || "Não foi possível gerar seu relatório visual. Tente novamente.");
  } finally {
    setIsGeneratingReport(false);
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

  // ▼▼▼ COLE O BLOCO ABAIXO ANTES DO RETURN ▼▼▼
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
  //{ name: 'Novas Funcionalidades', url: 'SEU_LINK_DO_GOOGLE_DRIVE' },
];
// ▲▲▲ FIM DO BLOCO ▲▲▲

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
    <div className={styles.pageContainer}>
      <WhatsNewModal />
      
      {/* Page Header Area */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>
            Olá, {user?.name?.split(' ')[0]}
          </h1>
          <p className={styles.pageSubtitle}>Bem-vindo de volta ao seu centro de controle.</p>
        </div>

        <div className={styles.actionPanel}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={styles.iconBtn}>
                <BookOpen className="h-4 w-4 mr-2" style={{ color: '#06b6d4' }} />
                <span className="text-sm font-semibold">Tutoriais</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Guia Rápido</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {tutorials.map((tutorial) => (
                <DropdownMenuItem key={tutorial.name} className="cursor-pointer">
                  <a href={tutorial.url} target="_blank" rel="noopener noreferrer" className="w-full">
                    {tutorial.name}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isNotificationCenterOpen} onOpenChange={setIsNotificationCenterOpen}>
            <DialogTrigger asChild>
              <button className={styles.iconBtn}>
                {unreadCount > 0 ? <BellRing className="h-4 w-4" style={{ color: '#06b6d4' }} /> : <Bell className="h-4 w-4" />}
                {unreadCount > 0 && (
                  <span className={styles.notificationBadge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
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
        </div>
      </div>

      <div className={styles.filterPanel}>
        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
          <SelectTrigger className="w-32 border-none bg-transparent focus:ring-0 font-semibold shadow-none">
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
        <div className={styles.filterDivider}></div>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
          <SelectTrigger className="w-24 border-none bg-transparent focus:ring-0 font-semibold shadow-none">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2027">2027</SelectItem>
            <SelectItem value="2028">2028</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid de Cards Principais */}
      <div className={styles.summaryGrid}>
        <div className={styles.premiumCard}>
          <div className={`${styles.cardTopAccent} ${styles.accentGreen}`}></div>
          <div className={styles.cardHeaderPlain}>
            <div className={styles.iconBox + ' ' + styles.iconBoxSuccess}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className={`${styles.summaryDiff} ${receitaPercentual >= 0 ? styles.diffPositive : styles.diffNegative}`}>
              {receitaPercentual >= 0 ? '+' : ''}{receitaPercentual.toFixed(1)}%
            </span>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.summaryLabel}>Total Receitas</p>
            <h3 className={styles.summaryValue}>{formatCurrency(totalReceitas)}</h3>
          </div>
        </div>

        <div className={styles.premiumCard}>
          <div className={`${styles.cardTopAccent} ${styles.accentRed}`}></div>
          <div className={styles.cardHeaderPlain}>
            <div className={styles.iconBox + ' ' + styles.iconBoxDanger}>
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className={`${styles.summaryDiff} ${despesaPercentual > 0 ? styles.diffNegative : styles.diffPositive}`}>
              {despesaPercentual > 0 ? '+' : ''}{despesaPercentual.toFixed(1)}%
            </span>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.summaryLabel}>Total Despesas</p>
            <h3 className={styles.summaryValue}>{formatCurrency(totalDespesas)}</h3>
          </div>
        </div>

        <div className={styles.premiumCard}>
          <div className={`${styles.cardTopAccent} ${styles.accentBlue}`}></div>
          <div className={styles.cardHeaderPlain}>
            <div className={styles.iconBox + ' ' + styles.iconBoxPrimary}>
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.summaryLabel}>Saldo Líquido</p>
            <h3 className={styles.summaryValue}>{formatCurrency(saldoLiquido)}</h3>
            <div className="mt-2 flex items-center gap-2">
              <statusSaldo.Icon className="h-4 w-4" style={{ color: saldoLiquido >= 0 ? '#10b981' : '#f59e0b' }} />
              <span className="text-xs font-bold" style={{ color: saldoLiquido >= 0 ? '#10b981' : '#f59e0b' }}>{statusSaldo.text}</span>
            </div>
          </div>
        </div>

        <div className={styles.premiumCard}>
          <div className={`${styles.cardTopAccent} ${styles.accentPurple}`}></div>
          <div className={styles.cardHeaderPlain}>
            <div className={styles.iconBox + ' ' + styles.iconBoxPurple}>
              <Building2 className="h-5 w-5" />
            </div>
            <span className={`${styles.summaryDiff} ${dashboardData.summary.investmentsProfitability >= 0 ? styles.diffPositive : styles.diffNegative}`}>
              {dashboardData.summary.investmentsProfitability >= 0 ? '+' : ''}{dashboardData.summary.investmentsProfitability.toFixed(2)}%
            </span>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.summaryLabel}>Investimentos</p>
            <h3 className={styles.summaryValue}>{formatCurrency(dashboardData.summary.investmentsCurrentValue)}</h3>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.premiumCard + ' ' + styles.colSpan1}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                    <Activity className="h-4 w-4" style={{ color: '#06b6d4' }} />
                    <h3 className={styles.cardTitle}>Status Operacional</h3>
                </div>
            </div>
            <div className={styles.cardContent}>
              <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">Metas Ativas</p>
                      <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-slate-800 dark:text-white">{dashboardData.summary.metasAtivas}</span>
                          <Target className="h-4 w-4 text-orange-400" />
                      </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">Próximos Eventos</p>
                      <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-slate-800 dark:text-white">{dashboardData.summary.proximosEventos}</span>
                          <Calendar className="h-4 w-4 text-pink-400" />
                      </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">Limite Cartões</p>
                      <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-slate-800 dark:text-white">{formatCurrency(dashboardData.summary.limiteDisponivelCartoes)}</span>
                          <CreditCard className="h-4 w-4 text-purple-400" />
                      </div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5">
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">Score Financeiro</p>
                      <div className="flex items-center justify-between">
                          <span className={cn("text-lg font-bold", dashboardData.overallStatus.color.replace('text-', 'text-'))}>{dashboardData.overallStatus.text}</span>
                          <dashboardData.overallStatus.Icon className={cn("h-4 w-4", dashboardData.overallStatus.color.replace('text-', 'text-'))} />
                      </div>
                  </div>
              </div>
            </div>
        </div>

        <div className={styles.premiumCard + ' ' + styles.colSpan2}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <h3 className={styles.cardTitle}>Maiores Gastos</h3>
                </div>
            </div>
            <div className={styles.cardContentNoPad}>
              {dashboardData.chartData.top5Expenses.map((gasto, index) => (
                <div key={index} className={styles.listItem}>
                  <div className={styles.itemMain}>
                    <div>
                      <p className={styles.itemLabel}>{gasto.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-1/3">
                    <span className={styles.itemValue}>{formatCurrency(gasto.value)}</span>
                    <div className="relative h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-full transition-all duration-500" 
                          style={{ width: `${gasto.percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {dashboardData.chartData.top5Expenses.length === 0 && (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>Sem gastos no período</p>
                </div>
              )}
            </div>
        </div>
      </div>

      <div className={styles.mainGrid} style={{ gridTemplateColumns: 'repeat(1, 1fr)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={styles.premiumCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <h3 className={styles.cardTitle}>Evolução Financeira</h3>
                </div>
            </div>
            <div className={styles.cardContent}>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboardData.chartData.evolution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                   <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$${value}`}
                  />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                      itemStyle={{ fontSize: '12px' }}
                      formatter={(value) => [formatCurrency(value), '']} 
                    />
                    <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className={styles.premiumCard}>
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                    <PieChartIcon className="h-4 w-4 text-purple-500" />
                    <h3 className={styles.cardTitle}>Planejado vs. Realizado</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={pvrTypeFilter} onValueChange={setPvrTypeFilter}>
                    <SelectTrigger className="w-28 h-8 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border-none shadow-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saida">Despesas</SelectItem>
                      <SelectItem value="entrada">Receitas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={pvrCategoryFilter} onValueChange={setPvrCategoryFilter}>
                    <SelectTrigger className="w-32 h-8 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 border-none shadow-none">
                      <SelectValue placeholder="Categoria..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px]">
                      <SelectItem value="all">Todas</SelectItem> 
                      {categories
                        .filter(cat => cat.type === pvrTypeFilter)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
            </div>
            <div className={styles.cardContent}>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={pvrData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                      formatter={(value) => [formatCurrency(value), '']} 
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="planejado" fill="rgba(167, 139, 250, 0.4)" name="Planejado" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="realizado" stroke="#10b981" strokeWidth={3} name="Realizado" dot={{ r: 4, fill: '#10b981' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Seu Resumo Visual</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {generatedImageUrl ? (
              <>
                <img src={generatedImageUrl} alt="Resumo financeiro visual" className="rounded-lg w-full border border-slate-200 dark:border-white/10" />
                <Button asChild className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700">
                  <a href={generatedImageUrl} download={`resumo_simplific_${selectedYear}_${selectedMonth}.png`}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Imagem
                  </a>
                </Button>
              </>
            ) : (
              <p className="text-center py-8 text-slate-400 italic">Carregando imagem...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// LINHA CORRIGIDA
export default Dashboard;