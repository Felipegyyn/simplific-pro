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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100">
      
      {/* cabeçalho novo */}
      <PageHeader user={user} onLogout={onLogout} />

      {/* Main Content */}
      
        <div>

          {/* Header com Filtros */}
          <div className="mb-8 print:hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Balanço Geral</h2>
                <p className="text-gray-600 dark:text-slate-400">Análise detalhada da sua situação financeira</p>
              </div>
              <div className="flex space-x-2">
                {/* ▼▼▼ DELETE O BOTÃO ABAIXO ▼▼▼ */}
                 {/*<Button onClick={handlePrint}>
                  <Download className="h-4 w-4 mr-2" />
                   Exportar PDF
                </Button>*/} {/* COMENTADO PORQUE TÁ DANDO ERRO. SERÁ ATIVADO NOVAMENTE DEPOIS */}
                {/* ▲▲▲ FIM DO BOTÃO A SER DELETADO ▲▲▲ */}
              </div>
            </div>

            {/* Filtros */}
            <div className="glass-panel p-6 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="period" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Período de Análise</Label>
                  <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-cyan-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
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
                      <Label htmlFor="startDate" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data Início</Label>
                      <Input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Data Fim</Label>
                      <Input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Fluxo</Label>
                  <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-cyan-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/20">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Receitas</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(reportData.summary.totalReceitas)}</h3>
            </div>

            <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-red-500/20 transition-all"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/20">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Total Despesas</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatCurrency(reportData.summary.totalDespesas)}</h3>
            </div>

            <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/20">
                  <DollarSign className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Saldo Líquido</p>
              <h3 className={cn("text-2xl font-bold mt-1", reportData.summary.saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {formatCurrency(reportData.summary.saldoLiquido)}
              </h3>
            </div>

            <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/20">
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", 
                  (reportData.summary.averageGrowth || 0) >= 0 
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/10" 
                    : "text-red-400 bg-red-500/10 border-red-500/10"
                )}>
                  {(reportData.summary.averageGrowth || 0) >= 0 ? '+' : ''}{(reportData.summary.averageGrowth || 0).toFixed(1)}%
                </span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Crescimento Médio</p>
              <h3 className="text-2xl font-bold text-white mt-1">{formatPercentage(reportData.summary.averageGrowth || 0)}</h3>
            </div>
          </div>

          {/* Tabs de Relatórios */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 glass-panel p-1 border-white/5 print:hidden">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Visão Geral</TabsTrigger>
              <TabsTrigger value="cashflow" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Categorias</TabsTrigger>
              <TabsTrigger value="investments" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Investimentos</TabsTrigger>
              <TabsTrigger value="goals" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Metas</TabsTrigger>
            </TabsList>

                        {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Evolução Mensal</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={reportData.charts.cashFlow}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
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

                <div className="glass-panel p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Distribuição por Categoria</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.charts.categoryBreakdown} margin={{ bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          interval={0} 
                          stroke="rgba(255,255,255,0.4)" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                          formatter={(value) => [formatCurrency(value), 'Gasto']}
                        />
                        <Bar dataKey="value" fill="rgba(59, 130, 246, 0.6)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-cyan-400" />
                    Uso de Cartões de Crédito
                  </h3>
                  <div className="h-[300px]">
                    {reportData.charts.creditCardUsage && reportData.charts.creditCardUsage.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.charts.creditCardUsage} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                          <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.8)" fontSize={10} tickLine={false} axisLine={false} width={80} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            formatter={(value) => [formatCurrency(value), '']} 
                          />
                          <Legend iconType="circle" />
                          <Bar dataKey="spent" stackId="a" fill="#f43f5e" name="Gasto" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="available" stackId="a" fill="rgba(255,255,255,0.05)" name="Disponível" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
                        Nenhum dado de cartão para exibir.
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-panel p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Target className="h-5 w-5 text-emerald-400" />
                    Orçamento Mensal
                  </h3>
                  <div className="h-[300px]">
                    {reportData.charts.budgetDistribution && reportData.charts.budgetDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData.charts.budgetDistribution}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="category" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                            formatter={(value) => [formatCurrency(value), 'Orçamento']} 
                          />
                          <Bar dataKey="budget" fill="rgba(16, 185, 129, 0.5)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
                        Nenhum orçamento para o mês atual.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Fluxo de Caixa */}
            <TabsContent value="cashflow" className="space-y-6">
              <div className="glass-panel p-6 border-white/5">
                <h3 className="text-lg font-bold text-white mb-8">Análise de Fluxo de Caixa (Acumulado)</h3>
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="glass-panel p-6 border-white/5 text-center group transition-all hover:bg-white/5">
                  <div className="p-3 bg-emerald-500/10 rounded-full w-fit mx-auto mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Meses Positivos</p>
                  <p className="text-3xl font-black text-white">
                    {reportData.summary.totalMonths > 0 
                      ? `${reportData.summary.positiveMonths}/${reportData.summary.totalMonths}` 
                      : '—'}
                  </p>
                </div>

                <div className="glass-panel p-6 border-white/5 text-center group transition-all hover:bg-white/5">
                  <div className="p-3 bg-blue-500/10 rounded-full w-fit mx-auto mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Crescimento Médio</p>
                  <p className="text-3xl font-black text-white">
                    {reportData.summary.averageGrowth >= 0 ? '+' : ''}
                    {(reportData.summary.averageGrowth || 0).toFixed(1)}%
                  </p>
                </div>

                <div className="glass-panel p-6 border-white/5 text-center group transition-all hover:bg-white/5">
                  <div className="p-3 bg-orange-500/10 rounded-full w-fit mx-auto mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
                    <AlertCircle className="h-8 w-8 text-orange-400" />
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Pico de Gasto</p>
                  <p className="text-xl font-black text-white uppercase">
                    {reportData.summary.highestSpendingMonth || '—'}
                  </p>
                </div>
              </div>
            </TabsContent>
          {/* ▲▲▲ FIM DO BLOCO DE SUBSTITUIÇÃO ▲▲▲ */}
            {/* Categorias */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Gastos por Categoria</h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.charts.categoryBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.8)" fontSize={10} tickLine={false} axisLine={false} width={100} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                          formatter={(value) => [formatCurrency(value), '']} 
                        />
                        <Bar dataKey="value" fill="rgba(244, 63, 94, 0.6)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6">Detalhamento Analítico</h3>
                  <div className="space-y-3">
                    {reportData.charts.categoryBreakdown.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <span className="font-bold text-slate-200">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-white">{formatCurrency(category.value)}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Investimentos */}
            <TabsContent value="investments" className="space-y-6">
              <div className="glass-panel p-6 border-white/5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Performance dos Investimentos</h3>
                    <p className="text-xs text-slate-400">Evolução do valor total da carteira e rentabilidade real.</p>
                  </div>
                  <div className="glass-panel p-1 pr-3 border-white/10">
                    <Select value={investmentYear.toString()} onValueChange={(value) => setInvestmentYear(Number(value))}>
                      <SelectTrigger className="w-32 border-none bg-transparent focus:ring-0">
                        <SelectValue placeholder="Ano" />
                      </SelectTrigger>
                      <SelectContent className="glass-panel border-white/10">
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                        <SelectItem value="2026">2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={investmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="mes" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" stroke="rgba(255,255,255,0.4)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)' }}
                        formatter={(value, name) => [name === "Rentabilidade %" ? `${value.toFixed(2)}%` : formatCurrency(value), name]}
                      />
                      <Legend iconType="circle" />
                      <Bar yAxisId="left" dataKey="valor" fill="rgba(59, 130, 246, 0.4)" name="Valor da Carteira" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="rentabilidade" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} name="Rentabilidade %" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            {/* Metas */}
            <TabsContent value="goals" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel p-6 border-white/5 text-center group hover:bg-white/5 transition-all">
                  <div className="p-3 bg-blue-500/10 rounded-2xl w-fit mx-auto mb-4 border border-blue-500/20">
                    <Target className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total de Metas</p>
                  <p className="text-3xl font-black text-white">{goalsReportData.summary.totalGoals || 0}</p>
                </div>

                <div className="glass-panel p-6 border-white/5 text-center group hover:bg-white/5 transition-all">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit mx-auto mb-4 border border-emerald-500/20">
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Concluídas</p>
                  <p className="text-3xl font-black text-white">{goalsReportData.summary.completedGoals || 0}</p>
                </div>

                <div className="glass-panel p-6 border-white/5 text-center group hover:bg-white/5 transition-all">
                  <div className="p-3 bg-purple-500/10 rounded-2xl w-fit mx-auto mb-4 border border-purple-500/20">
                    <PieChart className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Progresso Médio</p>
                  <p className="text-3xl font-black text-white">{(goalsReportData.summary.averageProgress || 0).toFixed(1)}%</p>
                </div>

                <div className="glass-panel p-6 border-white/5 text-center group hover:bg-white/5 transition-all">
                  <div className="p-3 bg-amber-500/10 rounded-2xl w-fit mx-auto mb-4 border border-amber-500/20">
                    <DollarSign className="h-8 w-8 text-amber-400" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Economizado</p>
                  <p className="text-2xl font-black text-white">{formatCurrency(goalsReportData.summary.totalSaved || 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goalsReportData.goalsList.length > 0 ? (
                  goalsReportData.goalsList.map((goal) => (
                    <div key={goal.id} className="glass-card p-6 border-white/10 group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-center justify-between mb-6 relative z-10">
                        <h4 className="font-bold text-white text-lg">{goal.name}</h4>
                        <Badge className={cn("border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest", 
                          goal.is_completed ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"
                        )}>
                          {goal.is_completed ? "Concluída" : "Em Andamento"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-4 relative z-10">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-400">Progresso: <span className="text-white">{goal.progress_percentage.toFixed(1)}%</span></span>
                          <span className="text-slate-200">{formatCurrency(goal.current_value)} / {formatCurrency(goal.target_value)}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5 p-0.5 border border-white/5">
                          <div 
                            className={cn("h-full rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-1000", 
                              goal.is_completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'
                            )}
                            style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                          ></div>
                        </div>
                        {!goal.is_completed && (
                          <div className="pt-2 flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                               Faltam {formatCurrency(goal.target_value - goal.current_value)}
                             </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center glass-panel border-white/5 border-dashed">
                    <p className="text-slate-500 italic">Nenhuma meta ativa encontrada.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      
    </div>
  );
};

export default Reports;

