import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Edit, Trash2, 
  PieChart, BarChart3, LogOut, ArrowLeft, Eye, Calculator
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import  apiService  from '../services/api';
import logo from '../assets/LOGO.png';
import styles from './Investments.module.css';
import InvestmentDetailModal from './InvestmentDetailModal';
import HomeBroker from '@/components/HomeBroker';
import StockTicker from '@/components/StockTicker';
const formatCurrency = (value) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const Investments = ({ user, onLogout }) => {
  const navigate = useNavigate();
const [evolucaoData, setEvolucaoData] = useState([]);
const [analysisData, setAnalysisData] = useState(null);
   // Estados para investimentos e modal
  const [investimentos, setInvestimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedInvestmentId, setSelectedInvestmentId] = useState(null);
  const [performanceYear, setPerformanceYear] = useState(new Date().getFullYear());
  const [editFormData, setEditFormData] = useState({
    name: '',
    type: '',
    ticker: '', // <-- ADICIONADO
    initial_value: '',
    current_value: '',
    purchase_date: '',
    expected_monthly_yield: '',
    quantity: ''
  });
  // FIM DO TRECHO ADICIONADO
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    ticker: '', // <-- ADICIONADO
    initial_value: '',
    current_value: '',
    purchase_date: new Date().toISOString().split('T')[0],
    expected_monthly_yield: '',
    quantity: '1'
  });

// ▼▼▼ ADICIONE ESTE BLOCO DE ESTADOS ▼▼▼
const [calculatorForm, setCalculatorForm] = useState({
  initialAmount: '',
  monthlyContribution: '',
  annualRate: '',
  periodYears: ''
});
const [calculatorResult, setCalculatorResult] = useState(null);
const [isCalculating, setIsCalculating] = useState(false);
// ▲▲▲ FIM DO BLOCO ▲▲▲

  // Carregar investimentos da API
  useEffect(() => {
    loadInvestimentos();
  }, []);

  const loadInvestimentos = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/investments');
      setInvestimentos(response || []);
    } catch (error) {
      console.error('Erro ao carregar investimentos:', error);
      setInvestimentos([]);
    } finally {
      setLoading(false);
    }
  };

const loadAnalysisData = async () => {
    try {
      const response = await apiService.get('/api/investments/analysis');
      setAnalysisData(response || null);
    } catch (error) {
      console.error('Erro ao carregar dados de análise:', error);
      setAnalysisData(null);
    }
  };

  useEffect(() => {
    if (investimentos.length > 0) {
      loadAnalysisData();
    }
  }, [investimentos]); // Executa sempre que a lista de investimentos mudar

useEffect(() => {
    if (investimentos.length > 0) {
      loadAnalysisData();
    }
  }, [investimentos]); // Executa sempre que a lista de investimentos mudar


  // ▼▼▼ ADICIONE O CÓDIGO DO PASSO 3 AQUI ▼▼▼
  useEffect(() => {
    const loadEvolutionData = async () => {
      if (!performanceYear) return;
      try {
        const response = await apiService.get(`/api/investments/portfolio-evolution?year=${performanceYear}`);
        setEvolucaoData(response || []);
      } catch (error) {
        console.error('Erro ao carregar evolução da carteira:', error);
        setEvolucaoData([]);
      }
    };
    loadEvolutionData();
  }, [performanceYear, investimentos]); // Recarrega se o ano mudar ou se a lista de investimentos for atualizada
  // ▲▲▲ FIM DO PASSO 3 ▲▲▲

  const criarInvestimento = async (dadosInvestimento) => {
    try {
      await apiService.post('/api/investments', dadosInvestimento);
      alert('✅ Investimento adicionado com sucesso!');
      await loadInvestimentos();
      setIsModalOpen(false);
      setFormData({
        name: '',
        type: '',
        initial_value: '',
        current_value: '',
        purchase_date: new Date().toISOString().split('T')[0],
        expected_monthly_yield: '',
        quantity: '1'
      });
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao criar investimento.';
      alert(`❌ ${errorMessage}`);
    }
  };

  const excluirInvestimento = async (id) => {
    if (confirm('Tem certeza que deseja excluir este investimento?')) {
      try {
        await apiService.delete(`/api/investments/${id}`);
        await loadInvestimentos();
      } catch (error) {
        console.error('Erro ao excluir investimento:', error);
        alert('Erro ao excluir investimento. Tente novamente.');
      }
    }
  };

  // ▼▼▼ ADICIONE O NOVO CONJUNTO DE FUNÇÕES PARA EDIÇÃO AQUI ▼▼▼

  // Função para lidar com mudanças no formulário DE EDIÇÃO
  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função que abre o modal de edição e preenche com dados
  const abrirModalEdicao = (investment) => {
    setEditingInvestment(investment); // Guarda o investimento que está sendo editado
    setEditFormData({ // Preenche o formulário de edição com os dados dele
      name: investment.name,
      type: investment.type,
      initial_value: investment.initial_value,
      current_value: investment.current_value,
      purchase_date: investment.purchase_date,
      quantity: investment.quantity,
      expected_monthly_yield: investment.expected_monthly_yield ?? ''
    });
    setIsEditModalOpen(true);
  };

  // Função que é chamada ao clicar em "Salvar Alterações"
  const handleUpdateInvestment = async (e) => {
    e.preventDefault();
    if (!editingInvestment) return;

    // Monta o payload com os dados do formulário de edição
    const payload = {
      ...editFormData,
      ticker: editFormData.ticker || null, // Envia o ticker ou null se estiver vazio
      initial_value: parseFloat(editFormData.initial_value),
      current_value: parseFloat(editFormData.current_value),
      quantity: parseFloat(editFormData.quantity),
      expected_monthly_yield: editFormData.expected_monthly_yield ? parseFloat(editFormData.expected_monthly_yield) : null
    };

    try {
      // Faz a chamada PUT para a API
      await apiService.put(`/api/investments/${editingInvestment.id}`, payload);
      alert('✅ Investimento atualizado com sucesso!');
      
      // Fecha o modal e recarrega os dados
      setIsEditModalOpen(false);
      await loadInvestimentos();

    } catch (error) {
      console.error('Erro ao atualizar investimento:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar investimento.';
      alert(`❌ ${errorMessage}`);
    }
  };
  
  const abrirModalDetalhes = (investmentId) => {
    setSelectedInvestmentId(investmentId);
    setIsDetailModalOpen(true);
  };

  // Em Investments.jsx, adicione estas duas funções

const handleCalculatorChange = (e) => {
  const { name, value } = e.target;
  setCalculatorForm(prev => ({ ...prev, [name]: value }));
};

const handleCalculate = async (e) => {
  e.preventDefault();
  setIsCalculating(true);
  setCalculatorResult(null);
  try {
    const response = await apiService.post('/api/investments/calculate-projection', {
      initialAmount: parseFloat(calculatorForm.initialAmount) || 0,
      monthlyContribution: parseFloat(calculatorForm.monthlyContribution) || 0,
      annualRate: parseFloat(calculatorForm.annualRate) || 0,
      periodYears: parseInt(calculatorForm.periodYears) || 0
    });
    setCalculatorResult(response);
  } catch (error) {
    console.error("Erro ao calcular projeção:", error);
    alert(error.response?.data?.error || "Erro ao calcular. Verifique os valores.");
  } finally {
    setIsCalculating(false);
  }
};
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.initial_value || !formData.purchase_date) {
      alert('Nome, Tipo, Valor Investido e Data da Compra são obrigatórios.');
      return;
    }
    const payload = {
      name: formData.name,
      type: formData.type,
      ticker: formData.ticker || null, // Envia o ticker ou null se estiver vazio
      initial_value: parseFloat(formData.initial_value),
      current_value: parseFloat(formData.current_value) || parseFloat(formData.initial_value),
      purchase_date: formData.purchase_date,
      quantity: parseFloat(formData.quantity) || 1,
      expected_monthly_yield: formData.expected_monthly_yield 
        ? parseFloat(formData.expected_monthly_yield) 
        : null
    };
    criarInvestimento(payload);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

// ▼▼▼ ADICIONE OS DADOS PARA O GRÁFICO DE PIZZA AQUI ▼▼▼
  const { pieChartData, summaryData } = useMemo(() => {
  if (!analysisData) {
    return { pieChartData: [], summaryData: { distribution: [], total_assets: 0, positive_assets: 0 } };
  }

  const colors = {
    'Renda Fixa': '#10b981',
    'Ações': '#3b82f6',
    'FII': '#8b5cf6',
    'Criptomoedas': '#f97316',
    'Fundos': '#ec4899',
    'Outros': '#78716c'
  };

  const formattedPieData = analysisData.distribution.map(item => ({
    name: item.type,
    value: item.current_value,
    color: colors[item.type] || colors['Outros']
  }));

  const formattedSummaryData = {
    ...analysisData,
    distribution: formattedPieData
  };

  return { pieChartData: formattedPieData, summaryData: formattedSummaryData };

}, [analysisData]);



  // ==========================================================
  // PASSO 1: FUNÇÃO DE CÁLCULO DE JUROS COMPOSTOS
  // ==========================================================
  const calculateCompoundInterest = (investment) => {
    const principal = investment.initial_value;
    const monthlyRate = (investment.expected_monthly_yield ?? 0) / 100;
    
    if (!principal || !monthlyRate) {
      return {
        dynamic_current_value: investment.current_value,
        dynamic_profit_percentage: investment.profit_loss_percentage,
      };
    }
    
    const purchaseDate = new Date(investment.purchase_date);
    const today = new Date();

    // Corrige problema de fuso horário ao criar a data
    purchaseDate.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);

    // Calcula a diferença em meses
    let months = (today.getFullYear() - purchaseDate.getFullYear()) * 12;
    months -= purchaseDate.getMonth();
    months += today.getMonth();
    const numberOfMonths = months <= 0 ? 0 : months;

    const finalAmount = principal * Math.pow(1 + monthlyRate, numberOfMonths);
    const totalProfitPercentage = ((finalAmount - principal) / principal) * 100;

    return {
      dynamic_current_value: finalAmount,
      dynamic_profit_percentage: totalProfitPercentage,
    };
  };

  // ==========================================================
  // PASSO 2: PRÉ-CALCULAR OS DADOS DINÂMICOS COM useMemo
  // ==========================================================
  const investimentosCalculados = useMemo(() => {
    return investimentos.map(inv => {
      const calculatedData = calculateCompoundInterest(inv);
      return {
        ...inv,
        ...calculatedData,
      };
    });
  }, [investimentos]);

  // Cria uma lista com os 3 investimentos mais rentáveis
  const topPerformers = useMemo(() => {
    return [...investimentosCalculados] // Cria uma cópia para não alterar o original
      .sort((a, b) => b.dynamic_profit_percentage - a.dynamic_profit_percentage)
      .slice(0, 1);
  }, [investimentosCalculados]);

  // Cria uma lista com os 3 investimentos menos rentáveis (prejuízo primeiro)
  const bottomPerformers = useMemo(() => {
    return [...investimentosCalculados]
      .filter(inv => inv.dynamic_profit_percentage < 0) // Pega apenas os negativos
      .sort((a, b) => a.dynamic_profit_percentage - b.dynamic_profit_percentage)
      .slice(0, 1);
  }, [investimentosCalculados]);

  // ==========================================================
  // PASSO 3: ATUALIZAR OS CÁLCULOS DOS CARDS DE RESUMO
  // ==========================================================
  const valorTotalInvestido = investimentosCalculados.reduce((sum, inv) => sum + (inv.initial_value ?? 0), 0);
  const valorAtualTotal = investimentosCalculados.reduce((sum, inv) => sum + (inv.dynamic_current_value ?? 0), 0);
  const lucroTotal = valorAtualTotal - valorTotalInvestido;
  const rentabilidadeTotal = valorTotalInvestido !== 0 ? (lucroTotal / valorTotalInvestido) * 100 : 0;

  // Demais funções auxiliares...
  const getRentabilidadeColor = (rentabilidade) => rentabilidade >= 0 ? 'text-green-600' : 'text-red-600';
  const getTipoBadge = (tipo) => {
    const colors = { 'Renda Fixa': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', 'Ações': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', 'FII': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' };
    return <Badge className={colors[tipo]}>{tipo}</Badge>;
  };

  const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    // A data vem como "YYYY-MM-DD" do backend.
    const [year, month, day] = dateString.split('T')[0].split('-');
    // Apenas remontamos a data na ordem correta, sem usar new Date().
    return `${day}/${month}/${year}`;
  };

  return (
    <div className={styles.pageContainer}>
      <StockTicker />
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Carteira de Investimentos</h1>
          <p className={styles.pageSubtitle}>Acompanhe seus investimentos e rentabilidade com precisão tecnológica.</p>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <p className={styles.summaryLabel}>Total Investido</p>
            <div className={`${styles.iconBox} ${styles.iconBoxPrimary}`}>
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className={styles.summaryValue}>R$ {(valorTotalInvestido ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <p className={styles.summaryLabel}>Valor Atual</p>
            <div className={`${styles.iconBox} ${styles.iconBoxSuccess}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className={styles.summaryValue}>R$ {(valorAtualTotal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <p className={styles.summaryLabel}>Lucro/Prejuízo</p>
            <div className={`${styles.iconBox} ${lucroTotal >= 0 ? styles.iconBoxSuccess : styles.iconBoxDanger}`}>
              {lucroTotal >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </div>
          <p className={styles.summaryValue}>R$ {(lucroTotal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <p className={styles.summaryLabel}>Rentabilidade</p>
            <div className={`${styles.iconBox} ${rentabilidadeTotal >= 0 ? styles.iconBoxSuccess : styles.iconBoxDanger}`}>
              <BarChart3 className="h-5 w-5" />
            </div>
          </div>
          <p className={styles.summaryValue}>{(rentabilidadeTotal ?? 0).toFixed(2)}%</p>
        </div>
      </div>

        <Tabs defaultValue="carteira" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 glass-panel p-1 border-white/5">
            <TabsTrigger value="carteira" className="data-[state=active]:active-gradient">Carteira</TabsTrigger>
            <TabsTrigger value="home-broker" className="data-[state=active]:active-gradient">Home Broker</TabsTrigger> 
            <TabsTrigger value="performance" className="data-[state=active]:active-gradient">Performance</TabsTrigger>
            <TabsTrigger value="analise" className="data-[state=active]:active-gradient">Análise</TabsTrigger>
            <TabsTrigger value="calculadora" className="data-[state=active]:active-gradient">Calculadora</TabsTrigger>
          </TabsList>

          <TabsContent value="home-broker">
            <div className="glass-panel p-6 border-white/5">
              <HomeBroker />
            </div>
          </TabsContent>
          
          <TabsContent value="carteira" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-4 border-white/5">
              <h3 className="text-lg font-semibold text-white">Meus Investimentos</h3>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-900/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Investimento
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-white">Novo Investimento</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-600 dark:text-slate-300">Nome do Investimento *</Label>
                      <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Ex: Tesouro Selic, ITSA4..." required className="glass-panel border-white/10" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-slate-600 dark:text-slate-300">Tipo *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger className="glass-panel border-white/10">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-white/10">
                          <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                          <SelectItem value="Ações">Ações</SelectItem>
                          <SelectItem value="FII">Fundos Imobiliários</SelectItem>
                          <SelectItem value="Criptomoedas">Criptomoedas</SelectItem>
                          <SelectItem value="Fundos">Fundos de Investimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="initial_value" className="text-slate-600 dark:text-slate-300">Valor Investido (R$) *</Label>
                        <Input id="initial_value" type="number" step="0.01" value={formData.initial_value} onChange={(e) => handleInputChange('initial_value', e.target.value)} placeholder="0,00" required className="glass-panel border-white/10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="current_value" className="text-slate-600 dark:text-slate-300">Valor Atual (R$)</Label>
                        <Input id="current_value" type="number" step="0.01" value={formData.current_value} onChange={(e) => handleInputChange('current_value', e.target.value)} placeholder="Opcional" className="glass-panel border-white/10" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purchase_date" className="text-slate-600 dark:text-slate-300">Data da Compra *</Label>
                        <Input id="purchase_date" type="date" value={formData.purchase_date} onChange={(e) => handleInputChange('purchase_date', e.target.value)} required className="glass-panel border-white/10" />
                      </div>
                      {['Ações', 'FII'].includes(formData.type) ? (
                        <div className="space-y-2">
                          <Label htmlFor="ticker" className="text-slate-600 dark:text-slate-300">Ticker *</Label>
                          <Input id="ticker" value={formData.ticker} onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())} placeholder="Ex: ITSA4" required className="glass-panel border-white/10" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="expected_monthly_yield" className="text-slate-600 dark:text-slate-300">Rentabilidade (% a.m.)</Label>
                          <Input id="expected_monthly_yield" type="number" step="0.01" value={formData.expected_monthly_yield} onChange={(e) => handleInputChange('expected_monthly_yield', e.target.value)} placeholder="Ex: 1.2" className="glass-panel border-white/10" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-white">Cancelar</Button>
                      <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Adicionar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-white">Editar Investimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateInvestment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name" className="text-slate-600 dark:text-slate-300">Nome do Investimento *</Label>
                    <Input id="edit-name" value={editFormData.name} onChange={(e) => handleEditInputChange('name', e.target.value)} required className="glass-panel border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type" className="text-slate-600 dark:text-slate-300">Tipo *</Label>
                    <Select value={editFormData.type} onValueChange={(value) => handleEditInputChange('type', value)}>
                      <SelectTrigger className="glass-panel border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass-panel border-white/10">
                        <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                        <SelectItem value="Ações">Ações</SelectItem>
                        <SelectItem value="FII">Fundos Imobiliários</SelectItem>
                        <SelectItem value="Criptomoedas">Criptomoedas</SelectItem>
                        <SelectItem value="Fundos">Fundos de Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-initial_value" className="text-slate-600 dark:text-slate-300">Valor Investido (R$)</Label>
                      <Input id="edit-initial_value" type="number" step="0.01" value={editFormData.initial_value} onChange={(e) => handleEditInputChange('initial_value', e.target.value)} className="glass-panel border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-current_value" className="text-slate-600 dark:text-slate-300">Valor Atual (R$)</Label>
                      <Input id="edit-current_value" type="number" step="0.01" value={editFormData.current_value} onChange={(e) => handleEditInputChange('current_value', e.target.value)} className="glass-panel border-white/10" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-purchase_date" className="text-slate-600 dark:text-slate-300">Data da Compra *</Label>
                      <Input id="edit-purchase_date" type="date" value={editFormData.purchase_date} onChange={(e) => handleEditInputChange('purchase_date', e.target.value)} required className="glass-panel border-white/10" />
                    </div>
                    {['Ações', 'FII'].includes(editFormData.type) ? (
                      <div className="space-y-2">
                        <Label htmlFor="edit-ticker" className="text-slate-600 dark:text-slate-300">Ticker *</Label>
                        <Input id="edit-ticker" value={editFormData.ticker} onChange={(e) => handleEditInputChange('ticker', e.target.value.toUpperCase())} placeholder="Ex: ITSA4" required className="glass-panel border-white/10" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="edit-expected_monthly_yield" className="text-slate-600 dark:text-slate-300">Rentabilidade (% a.m.)</Label>
                        <Input id="edit-expected_monthly_yield" type="number" step="0.01" value={editFormData.expected_monthly_yield} onChange={(e) => handleEditInputChange('expected_monthly_yield', e.target.value)} className="glass-panel border-white/10" />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-white">Cancelar</Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar Alterações</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {investimentosCalculados.map((inv) => (
                <div key={inv.id} className={styles.premiumCard}>
                  <div className={styles.cardContent + " group relative overflow-hidden flex flex-col sm:flex-row justify-between items-start gap-4 z-10"}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{inv.name}</h3>
                        <Badge className={`border-none text-[10px] uppercase font-bold px-1.5 py-0 ${inv.type === 'Renda Fixa' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                          {inv.type}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[11px] uppercase tracking-wider">
                        <div>
                          <p className="text-slate-500 mb-1 font-bold">Valor Investido</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">R$ {(inv.initial_value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1 font-bold">Valor Atual</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">R$ {(inv.dynamic_current_value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Rentabilidade</p>
                          <p className={`font-bold ${(inv.dynamic_profit_percentage ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {(inv.dynamic_profit_percentage ?? 0) > 0 ? '+' : ''}{(inv.dynamic_profit_percentage ?? 0).toFixed(2)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1 font-bold">Data Compra</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{formatLocalDate(inv.purchase_date)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity mt-4 sm:mt-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10" onClick={() => abrirModalDetalhes(inv.id)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" onClick={() => abrirModalEdicao(inv)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10" onClick={() => excluirInvestimento(inv.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="glass-panel p-6 border-white/5">
              <div className="flex flex-row items-center justify-between mb-8">
                <h4 className="font-semibold uppercase tracking-wider text-sm text-white">Evolução da Carteira</h4>
                <div className="w-40">
                  <Select value={performanceYear} onValueChange={(value) => setPerformanceYear(Number(value))}>
                    <SelectTrigger className="glass-panel border-white/10 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                        <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="mes" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Patrimônio']} 
                    />
                    <Line type="monotone" dataKey="valor" stroke="#0891b2" strokeWidth={3} dot={{ fill: '#0891b2', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-6 border-white/5">
                <h4 className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest mb-6">Melhores Performances</h4>
                <div className="space-y-3">
                  {topPerformers.length > 0 ? (
                    topPerformers.map((inv) => (
                      <div key={inv.id} className="flex justify-between items-center p-3 glass-card bg-emerald-500/5 border-emerald-500/10">
                        <div>
                          <p className="text-sm font-bold text-white">{inv.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{inv.type}</p>
                        </div>
                        <p className="text-emerald-400 font-bold">
                          +{(inv.dynamic_profit_percentage ?? 0).toFixed(2)}%
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-8 text-xs italic">Nenhum dado positivo.</p>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6 border-white/5">
                <h4 className="text-[10px] uppercase font-bold text-rose-400 tracking-widest mb-6">Atenção Necessária</h4>
                <div className="space-y-3">
                  {bottomPerformers.length > 0 ? (
                    bottomPerformers.map((inv) => (
                      <div key={inv.id} className="flex justify-between items-center p-3 glass-card bg-rose-500/5 border-rose-500/10">
                        <div>
                          <p className="text-sm font-bold text-white">{inv.name}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{inv.type}</p>
                        </div>
                        <p className="text-rose-400 font-bold">
                          {(inv.dynamic_profit_percentage ?? 0).toFixed(2)}%
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Todos ativos saudáveis! 🎉</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analise" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-panel p-6 border-white/5">
                <h4 className="font-semibold uppercase tracking-wider text-sm text-white mb-8">Distribuição por Tipo</h4>
                <div className="h-80">
                  {pieChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          paddingAngle={5}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                          formatter={(value) => `R$ ${value.toLocaleString()}`} 
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
                      Nenhum dado para exibir.
                    </div>
                  )}
                </div>
              </div>

              <div className="glass-panel p-6 border-white/5">
                <h4 className="font-semibold uppercase tracking-wider text-sm text-white mb-8">Resumo da Carteira</h4>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 glass-card bg-cyan-500/5 border-cyan-500/10">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Total de Ativos</p>
                      <p className="text-2xl font-bold text-cyan-400">{summaryData.total_assets}</p>
                    </div>
                    <div className="text-center p-4 glass-card bg-emerald-500/5 border-emerald-500/10">
                      <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Ativos Positivos</p>
                      <p className="text-2xl font-bold text-emerald-400">{summaryData.positive_assets}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h5 className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-widest border-b border-white/5 pb-2">Distribuição por Valor</h5>
                    <div className="space-y-3">
                      {summaryData.distribution.length > 0 ? (
                        summaryData.distribution.map((item, index) => (
                          <div key={index} className="flex justify-between items-center group">
                            <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-3 group-hover:scale-150 transition-transform" style={{ backgroundColor: item.color }} />
                              <span className="text-sm text-slate-600 dark:text-slate-300">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-white">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))
                      ) : (
                         <p className="text-slate-500 text-center py-4 italic text-xs">Sem dados.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calculadora" className="space-y-6">
            <div className="glass-panel p-6 border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <Calculator className="h-6 w-6 text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-white">Simulador de Independência Financeira</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic">Projete o futuro do seu patrimônio com base em aportes e rentabilidade esperada.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <form onSubmit={handleCalculate} className="space-y-4 glass-card p-6 border-white/5 bg-white/5">
                  <div className="space-y-2">
                    <Label htmlFor="initialAmount" className="text-slate-600 dark:text-slate-300 text-xs">Aporte Inicial (R$)</Label>
                    <Input id="initialAmount" name="initialAmount" type="number" step="0.01" value={calculatorForm.initialAmount} onChange={handleCalculatorChange} placeholder="0,00" className="glass-panel border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthlyContribution" className="text-slate-600 dark:text-slate-300 text-xs">Aporte Mensal (R$)</Label>
                    <Input id="monthlyContribution" name="monthlyContribution" type="number" step="0.01" value={calculatorForm.monthlyContribution} onChange={handleCalculatorChange} placeholder="0,00" className="glass-panel border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="annualRate" className="text-slate-600 dark:text-slate-300 text-xs">Rentabilidade Anual (%)</Label>
                    <Input id="annualRate" name="annualRate" type="number" step="0.01" value={calculatorForm.annualRate} onChange={handleCalculatorChange} placeholder="8.5" className="glass-panel border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periodYears" className="text-slate-600 dark:text-slate-300 text-xs">Período (anos)</Label>
                    <Input id="periodYears" name="periodYears" type="number" value={calculatorForm.periodYears} onChange={handleCalculatorChange} placeholder="10" className="glass-panel border-white/10" />
                  </div>
                  <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white mt-4" disabled={isCalculating}>
                    {isCalculating ? 'Calculando...' : 'Calcular Projeção'}
                  </Button>
                </form>

                <div className="lg:col-span-2">
                  {calculatorResult ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="glass-card p-4 border-white/10 bg-emerald-500/5 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Acumulado</p>
                          <p className="text-sm font-bold text-emerald-400">{formatCurrency(calculatorResult.summary.final_amount)}</p>
                        </div>
                        <div className="glass-card p-4 border-white/10 bg-cyan-500/5 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Investido</p>
                          <p className="text-sm font-bold text-cyan-400">{formatCurrency(calculatorResult.summary.total_invested)}</p>
                        </div>
                        <div className="glass-card p-4 border-white/10 bg-purple-500/5 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Juros</p>
                          <p className="text-sm font-bold text-purple-400">{formatCurrency(calculatorResult.summary.total_gains)}</p>
                        </div>
                        <div className="glass-card p-4 border-white/10 bg-white/5 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Tempo</p>
                          <p className="text-sm font-bold text-white">{calculatorResult.summary.period_years} anos</p>
                        </div>
                      </div>
                      <div className="h-80 glass-panel p-6 border-white/5">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={calculatorResult.projection}>
                            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="year" stroke="#64748b" fontSize={10} unit="y" />
                            <YAxis stroke="#64748b" fontSize={10} tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                              formatter={(value) => [formatCurrency(value), 'Total']} 
                            />
                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full glass-panel border-dashed border-white/5 min-h-[300px]">
                      <Calculator className="h-12 w-12 text-slate-800 mb-4" />
                      <p className="text-slate-600 text-sm">Insira os parâmetros para gerar a simulação tecnológica.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <InvestmentDetailModal 
          isOpen={isDetailModalOpen} 
          onClose={() => setIsDetailModalOpen(false)} 
          investmentId={selectedInvestmentId}
          onUpdate={loadInvestimentos}
        />
      </div>
  );
};

export default Investments;
