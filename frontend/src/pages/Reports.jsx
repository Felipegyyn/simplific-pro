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
  useEffect(() => {
    loadReportData();
  }, [filters]);

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

// ▼▼▼ SUBSTITUA A FUNÇÃO loadReportData POR ESTA VERSÃO FINAL ▼▼▼
  const loadReportData = async () => {
    try {
      setReportData(prev => ({ ...prev, loading: true }));

      const response = await apiService.get('/api/reports/overview', {
        params: filters
      });

      if (response) {
        // Usa a forma funcional do setState para mesclar os dados
        setReportData(prevState => ({
          ...prevState, // Mantém a estrutura antiga
          summary: response.summary, // Atualiza o resumo
          charts: {
            ...prevState.charts,  // Mantém TODAS as chaves de gráficos existentes (como goalProgress)
            ...response.charts,    // Sobrescreve apenas as que vieram da API (cashFlow, etc.)
          },
          loading: false,
        }));
      } else {
        // Caso a resposta seja vazia, apenas para de carregar
        setReportData(prev => ({ ...prev, loading: false }));
      }

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      setReportData(prev => ({ ...prev, loading: false }));
    }
  };  

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
    <div className="sm:p-6 bg-gray-50 dark:bg-slate-900">
      
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
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="period">Período</Label>
                    <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                      <SelectTrigger>
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
                      <div>
                        <Label htmlFor="startDate">Data Início</Label>
                        <Input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">Data Fim</Label>
                        <Input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                   {/* ▼▼▼ AQUI COMEÇA A "MOLDURA" QUE SERÁ IMPRESSA ▼▼▼ */}
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="income">Receitas</SelectItem>
                        <SelectItem value="expense">Despesas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        {/* ▼▼▼ AQUI COMEÇA A "MOLDURA" QUE SERÁ IMPRESSA ▼▼▼ */}
        <div ref={reportRef}></div>

          {/* Resumo Executivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Receitas</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(reportData.summary.totalReceitas)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Despesas</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(reportData.summary.totalDespesas)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${reportData.summary.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(reportData.summary.saldoLiquido)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            {/* Card Corrigido */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Crescimento Médio</p>
                  {/* Texto atualizado */}
                  <p className="text-2xl font-bold text-blue-600">
                    {/* Usando o novo dado 'averageGrowth' com formatação segura */}
                    {reportData.summary.averageGrowth >= 0 ? '+' : ''}
                    {formatPercentage(reportData.summary.averageGrowth || 0)}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          </div>

          {/* Tabs de Relatórios */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 print:hidden">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="investments">Investimentos</TabsTrigger>
              <TabsTrigger value="goals">Metas</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
<TabsContent value="overview" className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={reportData.charts.cashFlow}>
            <CartesianGrid stroke="hsl(var(--border))" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} name="Saldo" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
      {/* NOVA VERSÃO (Gráfico de Barras) */}
<ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={reportData.charts.categoryBreakdown}
    margin={{
      top: 5,
      right: 20,
      left: 10,
      bottom: 5, // Deixa um pouco de espaço na base
    }}
  >
    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
    <XAxis 
      dataKey="name" 
      angle={-45} // Inclina os nomes para não sobrepor
      textAnchor="end" // Alinha o texto inclinado corretamente
      height={80} // Aumenta o espaço para os nomes longos
      interval={0} // Garante que todos os nomes de categoria apareçam
      tick={{ fontSize: 12 }} 
    />
    <YAxis 
      tickFormatter={(value) => formatCurrency(value)} 
      tick={{ fontSize: 12 }}
    />
    <Tooltip 
      formatter={(value) => formatCurrency(value)}
      cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
    />
    <Bar dataKey="value" name="Gasto" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>
      </CardContent>
    </Card>

    {/* NOVA LINHA DE GRÁFICOS */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
          Uso de Cartões de Crédito
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reportData.charts.creditCardUsage && reportData.charts.creditCardUsage.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={reportData.charts.creditCardUsage}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid stroke="hsl(var(--border))" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="spent" stackId="a" fill="#ef4444" name="Gasto" />
              <Bar dataKey="available" stackId="a" fill="#d1d5db" name="Disponível" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>Nenhum dado de cartão de crédito para exibir.</p>
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
          Orçamento Mensal por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reportData.charts.budgetDistribution && reportData.charts.budgetDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.charts.budgetDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid stroke="hsl(var(--border))" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="budget" fill="#10b981" name="Orçamento" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            <p>Nenhum orçamento encontrado para o mês atual.</p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</TabsContent>

            
{/* ▼▼▼ SUBSTITUA TODO ESTE BLOCO DE CÓDIGO ▼▼▼ */}
          {/* Fluxo de Caixa */}
          <TabsContent value="cashflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={reportData.charts.cashFlow}>
                    <CartesianGrid stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Area type="monotone" dataKey="receitas" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Receitas" />
                    <Area type="monotone" dataKey="despesas" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Despesas" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Meses Positivos</p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.totalMonths > 0 
                        ? `${reportData.summary.positiveMonths}/${reportData.summary.totalMonths}` 
                        : 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Crescimento Médio</p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.averageGrowth >= 0 ? '+' : ''}
                      {(reportData.summary.averageGrowth || 0).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Maior Gasto</p>
                    <p className="text-2xl font-bold">
                      {reportData.summary.highestSpendingMonth || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* ▲▲▲ FIM DO BLOCO DE SUBSTITUIÇÃO ▲▲▲ */}
            {/* Categorias */}
            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Gastos por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.charts.categoryBreakdown}>
                        <CartesianGrid stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Bar dataKey="value" fill="#f2250aff" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhamento por Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reportData.charts.categoryBreakdown.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(category.value)}</p>
                            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">{category.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Investimentos */}
<TabsContent value="investments" className="space-y-6">
  <Card>
  <CardHeader>
    <div className="flex justify-between items-center">
      <div>
        <CardTitle>Performance dos Investimentos</CardTitle>
        <p className="text-sm text-gray-500">
          Evolução do valor total da carteira e sua rentabilidade mensal.
        </p>
      </div>
      <div className="w-32">
        <Select
          value={investmentYear.toString()}
          onValueChange={(value) => setInvestmentYear(Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {/* Você pode gerar essa lista dinamicamente se preferir */}
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardHeader>
  <CardContent>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={investmentChartData}>
          <CartesianGrid stroke="hsl(var(--border))"   />
          <XAxis dataKey="mes" />

          {/* Eixo Y da Esquerda para Valor (R$) */}
          <YAxis 
            yAxisId="left" 
            tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
            label={{ value: 'Valor da Carteira (R$)', angle: -90, position: 'insideLeft' }}
          />

          {/* Eixo Y da Direita para Rentabilidade (%) */}
          <YAxis 
            yAxisId="right" 
            orientation="right"
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            label={{ value: 'Rentabilidade (%)', angle: 90, position: 'insideRight' }}
          />

          <Tooltip 
            formatter={(value, name) => {
              if (name === "Rentabilidade %") {
                return [`${value.toFixed(2)}%`, name];
              }
              return [formatCurrency(value), name];
            }}
          />
          <Legend />

          {/* Barras para o Valor da Carteira */}
          <Bar yAxisId="left" dataKey="valor" fill="#3b82f6" name="Valor da Carteira" />
          
          {/* Linha para a Rentabilidade */}
          <Line yAxisId="right" type="monotone" dataKey="rentabilidade" stroke="#ff7300" strokeWidth={3} name="Rentabilidade %" />
        </ComposedChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
</TabsContent>

            {/* ▼▼▼ SUBSTITUA TODO O BLOCO DA ABA "Metas" POR ESTE ▼▼▼ */}
<TabsContent value="goals" className="space-y-6">
  {/* Cards de Resumo das Metas */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <Card>
      <CardContent className="p-6 text-center">
        <Target className="h-10 w-10 text-blue-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total de Metas</p>
        <p className="text-2xl font-bold">{goalsReportData.summary.totalGoals || 0}</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Metas Concluídas</p>
        <p className="text-2xl font-bold">{goalsReportData.summary.completedGoals || 0}</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6 text-center">
        <PieChart className="h-10 w-10 text-purple-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Progresso Médio</p>
        <p className="text-2xl font-bold">{(goalsReportData.summary.averageProgress || 0).toFixed(1)}%</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6 text-center">
        <DollarSign className="h-10 w-10 text-yellow-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Economizado</p>
        <p className="text-2xl font-bold">{formatCurrency(goalsReportData.summary.totalSaved || 0)}</p>
      </CardContent>
    </Card>
  </div>

  {/* Lista de Metas */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {goalsReportData.goalsList.length > 0 ? (
      goalsReportData.goalsList.map((goal) => (
        <Card key={goal.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{goal.name}</span>
              <Badge variant={goal.is_completed ? "default" : "secondary"}>
                {goal.is_completed ? "Concluída" : "Em Andamento"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Progresso: {goal.progress_percentage.toFixed(1)}%</span>
                <span>{formatCurrency(goal.current_value)} / {formatCurrency(goal.target_value)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${goal.is_completed ? 'bg-green-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                ></div>
              </div>
              {!goal.is_completed && (
                <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
                  Faltam {formatCurrency(goal.target_value - goal.current_value)} para atingir a meta.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))
    ) : (
      <p className="col-span-full text-center text-gray-500 py-8">Nenhuma meta ativa encontrada.</p>
    )}
  </div>
</TabsContent>
{/* ▲▲▲ FIM DO BLOCO DE SUBSTITUIÇÃO ▲▲▲ */}
          </Tabs>
        </div>
      
    </div>
  );
};

export default Reports;

