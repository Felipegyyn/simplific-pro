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
  PieChart, BarChart3, LogOut, ArrowLeft, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { useNavigate } from 'react-router-dom';
import  apiService  from '../services/api';
import logo from '../assets/LOGO.png';
import InvestmentDetailModal from './InvestmentDetailModal';
import HomeBroker from '@/components/HomeBroker';

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100">
      <header className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm border-b">
                      
                        <div className="flex justify-between items-center h-16">
                          <div className="flex items-center">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate('/dashboard')}
                              className="mr-4"
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Voltar
                            </Button>
                            <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              Bem-vindo, {user.name}
                            </span>
                            <Button variant="outline" size="sm" onClick={onLogout}>
                              <LogOut className="h-4 w-4 mr-2" />
                              Sair
                            </Button>
                          </div>
                        </div>
                      
                    </header>
        <div className="p-4 sm:p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Carteira de Investimentos</h2>
            <p className="text-gray-600 dark:text-gray-400">Acompanhe seus investimentos e rentabilidade</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Cards de Resumo (já usam os valores calculados) */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Investido</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">R$ {(valorTotalInvestido ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Valor Atual</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {(valorAtualTotal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  {lucroTotal >= 0 ? <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" /> : <TrendingDown className="h-8 w-8 text-red-600" />}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Lucro/Prejuízo</p>
                    <p className={`text-2xl font-bold ${getRentabilidadeColor(lucroTotal)}`}>R$ {(lucroTotal ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                   <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                   <div className="ml-4">
                     <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Rentabilidade</p>
                     <p className={`text-2xl font-bold ${getRentabilidadeColor(rentabilidadeTotal)}`}>{(rentabilidadeTotal ?? 0).toFixed(2)}%</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="carteira" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="carteira">Carteira</TabsTrigger>
               <TabsTrigger value="home-broker">Home Broker</TabsTrigger> 
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="analise">Análise</TabsTrigger>
            </TabsList>

            {/* ADICIONE ESTE NOVO BLOCO DE CONTEÚDO */}
            <TabsContent value="home-broker">
            <HomeBroker />
            </TabsContent>
            
            <TabsContent value="carteira" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-slate-100">Meus Investimentos</h3>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" />Novo Investimento</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
  <DialogHeader>
    <DialogTitle>Novo Investimento</DialogTitle>
  </DialogHeader>
  <form onSubmit={handleSubmit} className="space-y-4">
    <div>
      <Label htmlFor="name">Nome do Investimento *</Label>
      <Input
        id="name"
        value={formData.name}
        onChange={(e) => handleInputChange('name', e.target.value)}
        placeholder="Ex: Tesouro Selic 2029, ITSA4"
        required
      />
    </div>
    
    <div>
      <Label htmlFor="type">Tipo *</Label>
      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
          <SelectItem value="Ações">Ações</SelectItem>
          <SelectItem value="FII">Fundos Imobiliários</SelectItem>
          <SelectItem value="Criptomoedas">Criptomoedas</SelectItem>
          <SelectItem value="Fundos">Fundos de Investimento</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="initial_value">Valor Investido (R$) *</Label>
        <Input
          id="initial_value"
          type="number"
          step="0.01"
          value={formData.initial_value}
          onChange={(e) => handleInputChange('initial_value', e.target.value)}
          placeholder="5000.00"
          required
        />
      </div>
      <div>
        <Label htmlFor="current_value">Valor Atual (R$)</Label>
        <Input
          id="current_value"
          type="number"
          step="0.01"
          value={formData.current_value}
          onChange={(e) => handleInputChange('current_value', e.target.value)}
          placeholder="Deixe vazio para usar valor investido"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="purchase_date">Data da Compra *</Label>
            <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={(e) => handleInputChange('purchase_date', e.target.value)}
            required
            />
        </div>
        {/* Bloco Condicional para Ticker ou Rentabilidade */}
{['Ações', 'FII'].includes(formData.type) ? (
    <div>
        <Label htmlFor="ticker">Ticker *</Label>
        <Input
            id="ticker"
            value={formData.ticker}
            onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
            placeholder="Ex: ITSA4, MXRF11"
            required
        />
    </div>
) : (
    <div>
        <Label htmlFor="expected_monthly_yield">Rentabilidade Esperada (% a.m.)</Label>
        <Input
            id="expected_monthly_yield"
            type="number"
            step="0.01"
            value={formData.expected_monthly_yield}
            onChange={(e) => handleInputChange('expected_monthly_yield', e.target.value)}
            placeholder="Ex: 1.2"
        />
    </div>
)}
    </div>
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
        Cancelar
      </Button>
      <Button type="submit">
        Adicionar Investimento
      </Button>
    </div>
  </form>
</DialogContent>
                </Dialog>
              </div>

{/* ▼▼▼ COLE O NOVO MODAL DE EDIÇÃO AQUI ▼▼▼ */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Editar Investimento</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateInvestment} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-name">Nome do Investimento *</Label>
                        <Input
                        id="edit-name"
                        value={editFormData.name}
                        onChange={(e) => handleEditInputChange('name', e.target.value)}
                        required
                        />
                    </div>
                    <div>
                        <Label htmlFor="edit-type">Tipo *</Label>
                        <Select value={editFormData.type} onValueChange={(value) => handleEditInputChange('type', value)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Renda Fixa">Renda Fixa</SelectItem>
                            <SelectItem value="Ações">Ações</SelectItem>
                            <SelectItem value="FII">Fundos Imobiliários</SelectItem>
                            <SelectItem value="Criptomoedas">Criptomoedas</SelectItem>
                            <SelectItem value="Fundos">Fundos de Investimento</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <Label htmlFor="edit-initial_value">Valor Investido (R$)</Label>
                        <Input
                            id="edit-initial_value"
                            type="number" step="0.01"
                            value={editFormData.initial_value}
                            onChange={(e) => handleEditInputChange('initial_value', e.target.value)}
                        />
                        </div>
                        <div>
                        <Label htmlFor="edit-current_value">Valor Atual (R$)</Label>
                        <Input
                            id="edit-current_value"
                            type="number" step="0.01"
                            value={editFormData.current_value}
                            onChange={(e) => handleEditInputChange('current_value', e.target.value)}
                        />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                        <Label htmlFor="edit-purchase_date">Data da Compra *</Label>
                        <Input
                            id="edit-purchase_date"
                            type="date"
                            value={editFormData.purchase_date}
                            onChange={(e) => handleEditInputChange('purchase_date', e.target.value)}
                            required
                        />
                        </div>
                        {/* Bloco Condicional para Ticker ou Rentabilidade (Edição) */}
{['Ações', 'FII'].includes(editFormData.type) ? (
    <div>
        <Label htmlFor="edit-ticker">Ticker *</Label>
        <Input
            id="edit-ticker"
            value={editFormData.ticker}
            onChange={(e) => handleEditInputChange('ticker', e.target.value.toUpperCase())}
            placeholder="Ex: ITSA4, MXRF11"
            required
        />
    </div>
) : (
    <div>
        <Label htmlFor="edit-expected_monthly_yield">Rentabilidade Esperada (% a.m.)</Label>
        <Input
            id="edit-expected_monthly_yield"
            type="number" step="0.01"
            value={editFormData.expected_monthly_yield}
            onChange={(e) => handleEditInputChange('expected_monthly_yield', e.target.value)}
            placeholder="Ex: 1.2"
        />
    </div>
)}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
        {/* --- FIM DO MODAL DE EDIÇÃO --- */}

              {/* ========================================================== */}
              {/* PASSO 4: ATUALIZAR A EXIBIÇÃO DOS CARDS INDIVIDUAIS */}
              {/* ========================================================== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {investimentosCalculados.map((inv) => (
                  <Card key={inv.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold dark:text-slate-100">{inv.name}</h3>
                            {getTipoBadge(inv.type)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-600 dark:text-slate-400">Valor Investido</p>
                              <p className="text-blue-600 font-bold">R$ {(inv.initial_value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600 dark:text-slate-400">Valor Atual</p>
                              {/* Usa o novo valor calculado */}
                              <p className="text-green-600 font-bold">R$ {(inv.dynamic_current_value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600 dark:text-slate-400">Rentabilidade</p>
                              {/* Usa a nova rentabilidade calculada */}
                              <p className={`font-bold ${getRentabilidadeColor(inv.dynamic_profit_percentage)}`}>
                                {(inv.dynamic_profit_percentage ?? 0) > 0 ? '+' : ''}{(inv.dynamic_profit_percentage ?? 0).toFixed(2)}%
                              </p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-600 dark:text-slate-400">Data Compra</p>
                              <p>{formatLocalDate(inv.purchase_date)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 ml-0 mt-4 sm:mt-0 sm:ml-4">
                          <Button variant="outline" size="sm" onClick={() => abrirModalDetalhes(inv.id)}>
                          <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(inv)}>
                          <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => excluirInvestimento(inv.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Performance */}
            <TabsContent value="performance" className="space-y-6">
              <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evolução da Carteira</CardTitle>
    
    {/* ▼▼▼ FILTRO DE ANO ADICIONADO AQUI ▼▼▼ */}
    <div className="w-40">
      <Select 
        value={performanceYear} 
        onValueChange={(value) => setPerformanceYear(Number(value))}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map(year => (
            <SelectItem key={year} value={String(year)}>{year}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </CardHeader>
  <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolucaoData}>
                        <CartesianGrid stroke="hsl(var(--border))" />
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, 'Valor']} />
                        <Line 
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CardContent>
  <p className="text-blue-500">Melhores Performances ✅ </p>
  <div className="space-y-3">
    {topPerformers.length > 0 ? (
      topPerformers.map((inv) => (
        <div key={inv.id} className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div>
            <p className="font-medium">{inv.name}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{inv.type}</p>
          </div>
          <p className="text-green-600 font-bold">
            +{(inv.dynamic_profit_percentage ?? 0).toFixed(2)}%
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 dark:text-slate-400 text-center py-4">Nenhum investimento com performance positiva.</p>
    )}
  </div>
</CardContent>

            <CardContent>
  <p className="text-red-500">Atenção necessária‼️ </p>
  <div className="space-y-3">
    {bottomPerformers.length > 0 ? (
      bottomPerformers.map((inv) => (
        <div key={inv.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div>
            <p className="font-medium">{inv.name}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{inv.type}</p>
          </div>
          <p className="text-red-600 font-bold">
            {(inv.dynamic_profit_percentage ?? 0).toFixed(2)}%
          </p>
        </div>
      ))
    ) : (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-slate-400">Todos os investimentos estão positivos! 🎉</p>
      </div>
    )}
  </div>
</CardContent>
              </div>
            </TabsContent>

{/* Análise */}
<TabsContent value="analise" className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Tipo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-slate-400">
              <p>Nenhum dado para exibir.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Resumo da Carteira</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-slate-400">Total de Ativos</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{summaryData.total_assets}</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-slate-400">Ativos Positivos</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{summaryData.positive_assets}</p>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold dark:text-slate-100">Distribuição por Valor</h4>
            {summaryData.distribution.length > 0 ? (
              summaryData.distribution.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium dark:text-slate-100">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              ))
            ) : (
               <p className="text-gray-500 dark:text-slate-400 text-center py-4">Nenhum dado para exibir.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>
          </Tabs>
          {/* ▼▼▼ ADICIONE A CHAMADA PARA O NOVO MODAL AQUI ▼▼▼ */}
        <InvestmentDetailModal 
          isOpen={isDetailModalOpen} 
          onClose={() => setIsDetailModalOpen(false)} 
          investmentId={selectedInvestmentId}
          onUpdate={loadInvestimentos}
        />
        </div>
      
    </div>
  );
};
            
            

export default Investments;