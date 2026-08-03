import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, Download, TrendingUp, TrendingDown, PieChart, BarChart3,
  Calendar, Filter, RefreshCw, ArrowLeft, LogOut, DollarSign,
  Target, CreditCard, Activity, AlertCircle, CheckCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Cell, Pie, BarChart, Bar, AreaChart, Area,
  ComposedChart, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import logo from '../assets/LOGO.png';
import { cn } from "@/lib/utils";
import styles from './Reports.module.css';

const Reports = ({ user, onLogout }) => {
  const navigate = useNavigate();
  // ▼▼▼ ADICIONE O CÓDIGO ABAIXO ▼▼▼
  const reportRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: `Balanço Financeiro - ${new Date().toLocaleDateString('pt-BR')}`,
  });
  // ▲▲▲ FIM DO BLOCO A SER ADICIONADO ▲▲▲
  const [reportData, setReportData] = useState({
    summary: {
      totalReceitas: 0,
      totalDespesas: 0,
      saldoLiquido: 0,
      rentabilidadeMedia: 0,
    },
    charts: {
      cashFlow: [],
      categoryBreakdown: [],
      creditCardUsage: [],
      budgetDistribution: [],
      // ▼▼▼ ADICIONE ESTAS CHAVES FALTANTES ▼▼▼
      investmentPerformance: [],
      goalProgress: [],
    },
    loading: true
  });

  const [filters, setFilters] = useState({
    period: 'last_6_months',
    startDate: '',
    endDate: '',
    category: 'all',
    type: 'all'
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [investmentChartData, setInvestmentChartData] = useState([]); 
  const [investmentYear, setInvestmentYear] = useState(new Date().getFullYear()); 
  const [goalsReportData, setGoalsReportData] = useState({ summary: {}, goalsList: [] }); // <-- ADICIONE ESTA LINHA
 

  // ▼▼▼ ADICIONE O NOVO useEffect AQUI ▼▼▼
  useEffect(() => {
  const loadInvestmentData = async () => {
    // Continua sendo ativado apenas se a aba "Investimentos" estiver ativa
    if (activeTab === 'investments') {
      try {
        // AGORA USA o estado 'investmentYear' para a chamada
        const response = await apiService.get(`/api/reports/investment-performance?year=${investmentYear}`);
        setInvestmentChartData(response || []);
      } catch (error) {
        console.error("Erro ao carregar dados de performance de investimentos:", error);
        setInvestmentChartData([]);
      }
    }
  };

  loadInvestmentData();
}, [activeTab, investmentYear]); 

useEffect(() => {
    const loadGoalsData = async () => {
      if (activeTab === 'goals') {
        try {
          const response = await apiService.get('/api/reports/goals-summary');
          setGoalsReportData(response || { summary: {}, goalsList: [] });
        } catch (error) {
          console.error("Erro ao carregar dados do relatório de metas:", error);
          setGoalsReportData({ summary: {}, goalsList: [] });
        }
      }
    };

    loadGoalsData();
  }, [activeTab]);



  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // ▼▼▼ NOVA FUNÇÃO QUE FORÇA O ENVIO DOS FILTROS NA URL ▼▼▼
  const loadReportData = async () => {
    try {
      setReportData(prev => ({ ...prev, loading: true }));

      // TRUQUE DE MESTRE: Converte o objeto de filtros em uma Query String real
      // Fica assim: "?period=last_month&type=income"
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      // Enviamos a string de busca colada na URL! Agora o backend é obrigado a ler.
      const response = await apiService.get(`/api/reports/overview?${queryParams.toString()}`);

      if (response) {
        setReportData(prevState => ({
          ...prevState,
          summary: response.summary || prevState.summary,
          charts: {
            ...prevState.charts,
            ...(response.charts || {})
          },
          loading: false,
        }));
      } else {
        setReportData(prev => ({ ...prev, loading: false }));
      }

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      setReportData(prev => ({ ...prev, loading: false }));
    }
  };

  // O useEffect FICA ABAIXO da função para o React rodar perfeitamente
  useEffect(() => {
    loadReportData();
  }, [filters]);
  // ▲▲▲ FIM DO PASSO 1 ▲▲▲

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  if (reportData.loading) {
    return (
     <div className="p-6 bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="p-6 h-screen bg-gray-50 dark:bg-slate-900">Gerando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      
      {/* cabeçalho novo */}
      <PageHeader user={user} onLogout={onLogout} />

      {/* Main Content */}
      
        <div>

          {/* Header com Filtros */}
          <div className="mb-8 print:hidden">
            <div className={styles.header}>
              <div>
                <h2 className={styles.pageTitle}>Balanço Geral</h2>
                <p className={styles.pageSubtitle}>Análise detalhada da sua situação financeira</p>
              </div>
              <div className={styles.actionPanel}>
                {/* ▼▼▼ DELETE O BOTÃO ABAIXO ▼▼▼ */}
                 {/*<Button onClick={handlePrint}>
                  <Download className="h-4 w-4 mr-2" />
                   Exportar PDF
                </Button>*/} {/* COMENTADO PORQUE TÁ DANDO ERRO. SERÁ ATIVADO NOVAMENTE DEPOIS */}
                {/* ▲▲▲ FIM DO BOTÃO A SER DELETADO ▲▲▲ */}
              </div>
            </div>

            {/* Filtros */}
            <div className={styles.filterPanel}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className={styles.filterGrid}>
                <div className="space-y-2">
                  <Label htmlFor="period" className={styles.filterLabel}>Período de Análise</Label>
                  <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                    <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-none shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_month">Último Mês</SelectItem>
                      <SelectItem value="last_3_months">Últimos 3 Meses</SelectItem>
                      <SelectItem value="last_6_months">Últimos 6 Meses</SelectItem>
                      <SelectItem value="last_year">Último Ano</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filters.period === 'custom' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className={styles.filterLabel}>Data Início</Label>
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-none shadow-none focus-visible:ring-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className={styles.filterLabel}>Data Fim</Label>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border-none shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="type" className={styles.filterLabel}>Tipo de Fluxo</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-none shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Fluxos</SelectItem>
                      <SelectItem value="income">Apenas Receitas</SelectItem>
                      <SelectItem value="expense">Apenas Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

        {/* ▼▼▼ AQUI COMEÇA A "MOLDURA" QUE SERÁ IMPRESSA ▼▼▼ */}
        <div ref={reportRef}></div>

          {/* Resumo Executivo */}
          <div className={styles.summaryGrid}>
            <div className={styles.premiumCard}>
              <div className={`${styles.cardTopAccent} ${styles.accentGreen}`}></div>
              <div className={styles.cardHeaderPlain}>
                <div className={styles.iconBox + ' ' + styles.iconBoxSuccess}>
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.summaryLabel}>Total Receitas</p>
                <h3 className={styles.summaryValue}>{formatCurrency(reportData.summary.totalReceitas)}</h3>
              </div>
            </div>

            <div className={styles.premiumCard}>
              <div className={`${styles.cardTopAccent} ${styles.accentRed}`}></div>
              <div className={styles.cardHeaderPlain}>
                <div className={styles.iconBox + ' ' + styles.iconBoxDanger}>
                  <TrendingDown className="h-5 w-5" />
                </div>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.summaryLabel}>Total Despesas</p>
                <h3 className={styles.summaryValue}>{formatCurrency(reportData.summary.totalDespesas)}</h3>
              </div>
            </div>

            <div className={styles.premiumCard}>
              <div className={`${styles.cardTopAccent} ${styles.accentBlue}`}></div>
              <div className={styles.cardHeaderPlain}>
                <div className={styles.iconBox + ' ' + styles.iconBoxPrimary}>
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.summaryLabel}>Saldo Líquido</p>
                <h3 className={cn(styles.summaryValue, reportData.summary.saldoLiquido >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                  {formatCurrency(reportData.summary.saldoLiquido)}
                </h3>
              </div>
            </div>

            <div className={styles.premiumCard}>
              <div className={`${styles.cardTopAccent} ${styles.accentPurple}`}></div>
              <div className={styles.cardHeaderPlain}>
                <div className={styles.iconBox + ' ' + styles.iconBoxPurple}>
                  <Activity className="h-5 w-5" />
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", 
                  (reportData.summary.averageGrowth || 0) >= 0 
                    ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/10" 
                    : "text-red-500 bg-red-500/10 border-red-500/10"
                )}>
                  {(reportData.summary.averageGrowth || 0) >= 0 ? '+' : ''}{(reportData.summary.averageGrowth || 0).toFixed(1)}%
                </span>
              </div>
              <div className={styles.cardContent}>
                <p className={styles.summaryLabel}>Crescimento Médio</p>
                <h3 className={styles.summaryValue}>{formatPercentage(reportData.summary.averageGrowth || 0)}</h3>
              </div>
            </div>
          </div>

          {/* Tabs de Relatórios */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className={styles.tabsList + " print:hidden"}>
              <TabsTrigger value="overview" className={styles.tabsTrigger}>Visão Geral</TabsTrigger>
              <TabsTrigger value="cashflow" className={styles.tabsTrigger}>Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="categories" className={styles.tabsTrigger}>Categorias</TabsTrigger>
              <TabsTrigger value="investments" className={styles.tabsTrigger}>Investimentos</TabsTrigger>
              <TabsTrigger value="goals" className={styles.tabsTrigger}>Metas</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview">
              <div className={styles.mainGrid}>
                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <h3 className={styles.cardTitle}>Evolução Mensal</h3>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={reportData.charts.cashFlow}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                            formatter={(value) => [formatCurrency(value), '']} 
                          />
                          <Legend iconType="circle" />
                          {(filters.type === 'all' || filters.type === 'income') && (
                            <Bar dataKey="receitas" fill="rgba(16, 185, 129, 0.4)" radius={[4, 4, 0, 0]} name="Receitas" />
                          )}
                          {(filters.type === 'all' || filters.type === 'expense') && (
                            <Bar dataKey="despesas" fill="rgba(239, 68, 68, 0.4)" radius={[4, 4, 0, 0]} name="Despesas" />
                          )}
                          <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} name="Saldo Líquido" />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <h3 className={styles.cardTitle}>Distribuição por Categoria</h3>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.charts.categoryBreakdown} margin={{ bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45} 
                            textAnchor="end" 
                            interval={0} 
                            stroke="#94a3b8" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                            formatter={(value) => [formatCurrency(value), 'Gasto']}
                          />
                          <Bar dataKey="value" fill="rgba(59, 130, 246, 0.6)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <CreditCard className="h-4 w-4" style={{ color: '#06b6d4' }} />
                      <h3 className={styles.cardTitle}>Uso de Cartões de Crédito</h3>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className="h-[300px]">
                      {reportData.charts.creditCardUsage && reportData.charts.creditCardUsage.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData.charts.creditCardUsage} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(150,150,150,0.1)" />
                            <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={80} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                              formatter={(value) => [formatCurrency(value), '']} 
                            />
                            <Legend iconType="circle" />
                            <Bar dataKey="spent" stackId="a" fill="#f43f5e" name="Gasto" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="available" stackId="a" fill="rgba(150,150,150,0.1)" name="Disponível" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className={styles.emptyState}>
                          Nenhum dado de cartão para exibir.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <Target className="h-4 w-4 text-emerald-500" />
                      <h3 className={styles.cardTitle}>Orçamento Mensal</h3>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className="h-[300px]">
                      {reportData.charts.budgetDistribution && reportData.charts.budgetDistribution.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportData.charts.budgetDistribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                            <XAxis dataKey="category" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                              formatter={(value) => [formatCurrency(value), 'Orçamento']} 
                            />
                            <Bar dataKey="budget" fill="rgba(16, 185, 129, 0.5)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className={styles.emptyState}>
                          Nenhum orçamento para o mês atual.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Fluxo de Caixa */}
            <TabsContent value="cashflow">
              <div className="flex flex-col gap-6">
                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <h3 className={styles.cardTitle}>Análise de Fluxo de Caixa (Acumulado)</h3>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={reportData.charts.cashFlow}>
                          <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                            formatter={(value) => [formatCurrency(value), '']} 
                          />
                          <Legend iconType="circle" />
                          {(filters.type === 'all' || filters.type === 'income') && (
                            <Area type="monotone" dataKey="receitas" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" name="Receitas" />
                          )}
                          {(filters.type === 'all' || filters.type === 'expense') && (
                            <Area type="monotone" dataKey="despesas" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExpense)" name="Despesas" />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className={styles.mainGridThreeCols}>
                  <div className={styles.premiumCard}>
                    <div className={styles.cardContent + " flex flex-col items-center justify-center text-center"}>
                      <div className={styles.iconBox + " " + styles.iconBoxSuccess + " mb-4"}>
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <p className={styles.summaryLabel}>Meses Positivos</p>
                      <p className={styles.summaryValue}>
                        {reportData.summary.totalMonths > 0 
                          ? `${reportData.summary.positiveMonths}/${reportData.summary.totalMonths}` 
                          : '—'}
                      </p>
                    </div>
                  </div>

                  <div className={styles.premiumCard}>
                    <div className={styles.cardContent + " flex flex-col items-center justify-center text-center"}>
                      <div className={styles.iconBox + " " + styles.iconBoxPrimary + " mb-4"}>
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <p className={styles.summaryLabel}>Crescimento Médio</p>
                      <p className={styles.summaryValue}>
                        {reportData.summary.averageGrowth >= 0 ? '+' : ''}
                        {(reportData.summary.averageGrowth || 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className={styles.premiumCard}>
                    <div className={styles.cardContent + " flex flex-col items-center justify-center text-center"}>
                      <div className={styles.iconBox + " " + styles.iconBoxWarning + " mb-4"}>
                        <AlertCircle className="h-8 w-8" />
                      </div>
                      <p className={styles.summaryLabel}>Pico de Gasto</p>
                      <p className={styles.summaryValue + " uppercase text-xl"}>
                        {reportData.summary.highestSpendingMonth || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Categorias */}
            <TabsContent value="categories">
              <div className={styles.mainGrid}>
                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <h3 className={styles.cardTitle}>Gastos por Categoria</h3>
                    </div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.charts.categoryBreakdown} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(150,150,150,0.1)" />
                          <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} width={100} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                            formatter={(value) => [formatCurrency(value), '']} 
                          />
                          <Bar dataKey="value" fill="rgba(244, 63, 94, 0.6)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleArea}>
                      <h3 className={styles.cardTitle}>Detalhamento Analítico</h3>
                    </div>
                  </div>
                  <div className={styles.cardContentNoPad}>
                    {reportData.charts.categoryBreakdown.map((category, index) => (
                      <div key={index} className={styles.listItem}>
                        <div className={styles.itemMain}>
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color, boxShadow: `0 0 8px ${category.color}40` }}
                          ></div>
                          <span className={styles.itemLabel}>{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className={styles.itemValue}>{formatCurrency(category.value)}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Investimentos */}
            <TabsContent value="investments">
              <div className={styles.premiumCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>Performance dos Investimentos</h3>
                    <p className={styles.pageSubtitle + " mt-1"}>Evolução do valor total da carteira e rentabilidade real.</p>
                  </div>
                  <div className={styles.actionPanel}>
                    <Select value={investmentYear.toString()} onValueChange={(value) => setInvestmentYear(Number(value))}>
                      <SelectTrigger className="w-32 bg-slate-100 dark:bg-slate-800 border-none shadow-none focus:ring-0 font-semibold">
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className={styles.cardContent}>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={investmentChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.1)" />
                        <XAxis dataKey="mes" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: 'var(--text-main)' }}
                          formatter={(value, name) => [name === "Rentabilidade %" ? `${value.toFixed(2)}%` : formatCurrency(value), name]}
                        />
                        <Legend iconType="circle" />
                        <Bar yAxisId="left" dataKey="valor" fill="rgba(59, 130, 246, 0.4)" name="Valor da Carteira" radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="rentabilidade" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} name="Rentabilidade %" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Metas */}
            <TabsContent value="goals">
              <div className="flex flex-col gap-6">
                <div className={styles.summaryGrid}>
                  <div className={styles.premiumCard}>
                    <div className={styles.cardContent + " flex flex-col items-center justify-center text-center"}>
                      <div className={styles.iconBox + " " + styles.iconBoxPrimary + " mb-4"}>
                        <Target className="h-6 w-6" />
                      </div>
                      <p className={styles.summaryLabel}>Total de Metas</p>
                      <p className={styles.summaryValue}>{goalsReportData.summary.totalGoals || 0}</p>
                    </div>
                  </div>

                  <div className={styles.premiumCard}>
                    <div className={styles.cardContent + " flex flex-col items-center justify-center text-center"}>
                      <div className={styles.iconBox + " " + styles.iconBoxSuccess + " mb-4"}>
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <p className={styles.summaryLabel}>Concluídas</p>
                      <p className={styles.summaryValue}>{goalsReportData.summary.completedGoals || 0}</p>
                    </div>
                  </div>

                  <div className={styles.premiumCard}>
                    <div className={styles.cardContent + " flex flex-col items-center justify-center text-center"}>
                      <div className={styles.iconBox + " " + styles.iconBoxPurple + " mb-4"}>
                        <PieChart className="h-6 w-6" />
                      </div>
                      <p className={styles.summaryLabel}>Progresso Médio</p>
                      <p className={styles.summaryValue}>{(goalsReportData.summary.averageProgress || 0).toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className={styles.premiumCard}>
                    <div className={styles.cardContent + " flex flex-col items-center justify-center text-center"}>
                      <div className={styles.iconBox + " " + styles.iconBoxWarning + " mb-4"}>
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <p className={styles.summaryLabel}>Total Economizado</p>
                      <p className={styles.summaryValue + " text-2xl"}>{formatCurrency(goalsReportData.summary.totalSaved || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.mainGrid}>
                  {goalsReportData.goalsList.length > 0 ? (
                    goalsReportData.goalsList.map((goal) => (
                      <div key={goal.id} className={styles.premiumCard}>
                        <div className={`${styles.cardTopAccent} ${goal.is_completed ? styles.accentGreen : styles.accentBlue}`}></div>
                        <div className={styles.cardHeaderPlain}>
                          <h4 className="font-bold text-slate-800 dark:text-white text-lg">{goal.name}</h4>
                          <Badge className={cn("border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest", 
                            goal.is_completed ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          )}>
                            {goal.is_completed ? "Concluída" : "Em Andamento"}
                          </Badge>
                        </div>
                        
                        <div className={styles.cardContent + " pt-0 space-y-4"}>
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-slate-500 dark:text-slate-400">Progresso: <span className="text-slate-800 dark:text-white">{goal.progress_percentage.toFixed(1)}%</span></span>
                            <span className="text-slate-600 dark:text-slate-200">{formatCurrency(goal.current_value)} / {formatCurrency(goal.target_value)}</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-2.5 p-0.5 border border-slate-300 dark:border-white/5">
                            <div 
                              className={cn("h-full rounded-full transition-all duration-1000", 
                                goal.is_completed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                              )}
                              style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                            ></div>
                          </div>
                          {!goal.is_completed && (
                            <div className="pt-2 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                 Faltam {formatCurrency(goal.target_value - goal.current_value)}
                               </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.colSpanFull + " " + styles.emptyState}>
                      Nenhuma meta ativa encontrada.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      
    </div>
  );
};

export default Reports;

