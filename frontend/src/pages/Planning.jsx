import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart3, DollarSign, TrendingUp, Plus, Edit, Trash2, 
  Calendar, Target, LogOut, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import logo from '../assets/LOGO.png';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
const TIPOS_PADRAO = ['entrada', 'saida'];


const Planning = ({ user, onLogout }) => {
  const navigate = useNavigate();
  //primeiro array de cores
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
  //segundo array de cores
  const COLORS_SAIDAS = ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D', '#450A0A'];

  // Estados para planejamentos e modal

  const [planejamentosVisaoGeral, setPlanejamentosVisaoGeral] = useState([]);
  const [planejamentos, setPlanejamentos] = useState([]);
  const [resumo, setResumo] = useState({
  totalPlanejado: 0,
  totalGasto: 0,
  disponivel: 0,
  progressoMedio: 0
});

const [graficoLinha, setGraficoLinha] = useState([]);
const [graficoEntrada, setGraficoEntrada] = useState([]);
const [graficoSaida, setGraficoSaida] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
  if (isModalOpen) {
    loadCategories();
  }
}, [isModalOpen]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlanejamento, setSelectedPlanejamento] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    category_id: '',
    form: '',
    value: '',
    date: '',
    is_recurring: false,
    observations: '',
    recurrence_period: ''
  });

  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroAnoVisaoGeral, setFiltroAnoVisaoGeral] = useState(new Date().getFullYear());
  const [filtroTipoVisaoGeral, setFiltroTipoVisaoGeral] = useState(''); 
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    total_amount: '',
    start_date: '',
    end_date: ''
  });
  

  // Carregar planejamentos da API
  useEffect(() => {
  const carregarDados = async () => {
    const queryParams = new URLSearchParams();
    if (filtroAnoVisaoGeral) queryParams.append('ano', filtroAnoVisaoGeral);
    if (filtroTipoVisaoGeral) queryParams.append('type', filtroTipoVisaoGeral);

    const planos = await apiService.get(`/planning?${queryParams.toString()}`);
    const transacoesResponse = await apiService.get(`/transactions?${queryParams.toString()}`);

    const categoriasResponse = await apiService.get('/categories');
  
    setCategories(categoriasResponse); 


    const planosData = planos.plannings || [];
    const transacoesData = transacoesResponse.transacoes || transacoesResponse.transactions || [];

    setPlanejamentosVisaoGeral(planosData);
    calcularResumo(planosData, transacoesData);

    // Dados para gráfico de linha
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const linha = meses.map((mes, i) => {
      const planejadoMes = planosData
        .filter(p => new Date(p.start_date).getMonth() === i)
        .reduce((acc, p) => acc + parseFloat(p.total_amount), 0);

      const realizadoMes = transacoesData
        .filter(t => new Date(t.date).getMonth() === i)
        .reduce((acc, t) => acc + parseFloat(t.value), 0);

      return {
        data: mes,
        planejado: planejadoMes,
        realizado: realizadoMes
      };
    });
    setGraficoLinha(linha);

// ========================
// DISTRIBUIÇÃO DE ENTRADAS (com category_name corrigido)
// ========================
console.log("planosData", planosData); // debug



    // Dados para gráfico de rosca - saídas
    const saidasCorrigidas = planosData

  .filter(p => (p.type || '').toLowerCase() === 'saida' || (p.type || '').toLowerCase() === 'expense')
  .map(p => {
    const categoria = categories.find(c => c.id === p.category_id);
    return {
      category_name: categoria ? categoria.name : 'Sem Categoria',
      total_amount: parseFloat(p.total_amount)
    };
  });

const saidaPorCategoriaCorrigida = {};
saidasCorrigidas.forEach(p => {
  saidaPorCategoriaCorrigida[p.category_name] =
    (saidaPorCategoriaCorrigida[p.category_name] || 0) + p.total_amount;
});

const totalSaidasCorrigidas = Object.values(saidaPorCategoriaCorrigida).reduce((a, b) => a + b, 0);

const saidaFormatada = Object.entries(saidaPorCategoriaCorrigida).map(([name, value]) => ({
  name,
  value,
  percent: totalSaidasCorrigidas > 0 ? (value / totalSaidasCorrigidas) * 100 : 0
}));

setGraficoSaida(saidaFormatada);

  };

  carregarDados();
}, [filtroAnoVisaoGeral, filtroTipoVisaoGeral]);



  useEffect(() => {
  loadPlanejamentos();
}, [filtroTipo, filtroCategoria, filtroInicio, filtroFim]);

// Função para confirmar planejamento (versão corrigida)
  const confirmarPlanejamento = async (id) => {
    const confirmar = window.confirm(
      "Confirmar este planejamento? Uma transação de despesa será criada e o status será atualizado."
    );

    if (!confirmar) {
      return; // O usuário cancelou a ação
    }

    try {
      // 1. Chamar a rota correta no backend (PUT)
      // Esta rota já cuida de criar a transação E atualizar o status do planejamento.
      await apiService.put(`/planning/${id}/confirm`, { status: 'confirmed' });

      // 2. Mostrar mensagem de sucesso
      alert("Planejamento confirmado com sucesso! Lançamento criado.");

      // 3. Recarregar a lista de planejamentos para mostrar o status atualizado
      // Não vamos mais redirecionar, para que o usuário veja a mudança na tela.
      await loadPlanejamentos();

    } catch (error) {
      console.error("Erro ao confirmar planejamento:", error.response ? error.response.data : error.message);
      alert("Erro ao confirmar planejamento. Verifique o console para mais detalhes.");
    }
  };





  const loadPlanejamentos = async () => {
  try {
    setLoading(true);
    const params = new URLSearchParams();

    if (filtroTipo) params.append('type', filtroTipo);
    if (filtroCategoria) params.append('category_name', filtroCategoria);
    if (filtroInicio) params.append('start_date', filtroInicio);
    if (filtroFim) params.append('end_date', filtroFim);

    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`http://localhost:5000/api/planning${query}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("simplific_token")}`
      }
    });

    const data = await response.json();
    setPlanejamentos(data.plannings || []);
  } catch (error) {
    console.error('Erro ao carregar planejamentos:', error);
  } finally {
    setLoading(false);
  }
};

const calcularResumo = (planejamentos, transacoes) => {
  const totalPlanejado = planejamentos.reduce((acc, p) => acc + parseFloat(p.total_amount), 0);
  const totalGasto = transacoes.reduce((acc, t) => acc + parseFloat(t.amount), 0);
  const disponivel = totalPlanejado - totalGasto;

  //Progreso médio (Visão geral)
  const progressoMedio = totalPlanejado > 0 ? (totalGasto / totalPlanejado) * 100 : 0;

  setResumo({
    totalPlanejado,
    totalGasto,
    disponivel,
    progressoMedio
  });
};



const loadCategories = async () => {
  try {
    const categoriasResponse = await apiService.get('/categories');
    const categoriasData = categoriasResponse.categories || categoriasResponse || [];
    setCategories(categoriasData);
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};



  // Função para editar planejamento
  const editarPlanejamento = async (id, dados) => {
    try {
      const response = await apiService.put(`/planning/${id}`, dados);
      if (response.success) {
        await loadPlanejamentos();
        setIsEditModalOpen(false);
        setSelectedPlanejamento(null);
        alert('Planejamento atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao editar planejamento:', error);
      alert('Erro ao editar planejamento. Tente novamente.');
    }
  };

  // Função para excluir planejamento
  const excluirPlanejamento = async (id) => {
  if (!window.confirm('Tem certeza que deseja excluir este planejamento?')) return;

  try {
    const response = await fetch(`http://localhost:5000/api/planning/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("simplific_token")}`
      }
    });

    if (response.status === 204) {
      await loadPlanejamentos();
      alert('Planejamento excluído com sucesso!');
    } else {
      const data = await response.json();
      throw new Error(data?.error || 'Erro inesperado');
    }
  } catch (error) {
    console.error('Erro ao excluir planejamento:', error);
    alert('Erro ao excluir planejamento. Tente novamente.');
  }
};

  // Função para abrir modal de edição
  const abrirModalEdicao = (planejamento) => {
  setSelectedPlanejamento(planejamento);
  setFormData({
    type: planejamento.type || '',
    category_id: planejamento.category_id || '',
    value: planejamento.total_amount || '',
    date: planejamento.date || '',
    is_recurring: planejamento.is_recurring || false,
    observations: planejamento.observations || '',
    recurrence_period: planejamento.recurrence_period || ''
  });
  setIsEditModalOpen(true);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
  type: formData.type,
  date: formData.date,
  category_id: formData.category_id,
  form: formData.form,
  value: parseFloat(formData.value),
  is_recurring: formData.is_recurring,
  observations: formData.observations,
  recurrence_period: parseInt(formData.recurrence_period) || 1
};

 

const response = await apiService.post('/planning', payload);

await loadPlanejamentos(); // Recarregar lista
setIsModalOpen(false);
setFormData({
  type: '',
  category_id: '',
  value: '',
  date: '',
  is_recurring: false,
  observations: ''
});

alert('Planejamento cadastrado com sucesso!'); // ✅ ALERTA AQUI
} catch (error) {
    alert('Erro ao criar planejamento');
  }
};

// ▼▼▼ COLE A NOVA FUNÇÃO EXATAMENTE AQUI ▼▼▼
  const handleSelectChange = (name, value) => {
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      // Se o campo alterado for 'type', limpa a seleção de 'category_id'
      if (name === 'type') {
        newState.category_id = ''; 
      }
      return newState;
    });
  };
  // ▲▲▲ FIM DA NOVA FUNÇÃO ▲▲▲

  const handleInputChange = (e) => {
  const { name, value, type: inputType, checked } = e.target;

  if (name === 'type') {
    setFormData(prev => ({
      ...prev,
      type: value,
      category_id: '' // reseta a categoria quando muda o tipo
    }));
    return;
  }

  setFormData(prev => ({
    ...prev,
    [name]: inputType === 'checkbox' ? checked : value
  }));
};


  // Dados Card orçamento por categoria

  const [orcamentos, setOrcamentos] = useState([]);

  const [abaAtiva, setAbaAtiva] = useState('visao-geral'); // CORRETO! Está antes de tudo

  useEffect(() => {
  if (abaAtiva !== 'orcamento') return;

  const carregarDadosOrcamento = async () => {
    try {
      // Busca os dados necessários
      const [planosResponse, transacoesResponse] = await Promise.all([
        apiService.get('/planning'),
        apiService.get('/transactions')
      ]);

      // Garante que temos arrays para trabalhar
      const planosData = planosResponse.plannings || [];
      const transacoesData = transacoesResponse.transacoes || transacoesResponse.transactions || [];

      // 1. Pega a lista de NOMES de categorias que têm um planejamento.
      //    Isso é mais confiável do que usar IDs, com base na estrutura dos dados.
      const nomesCategoriasComPlanejamento = [...new Set(planosData.map(p => p.category_name).filter(Boolean))];

      const orcamentosCalculados = nomesCategoriasComPlanejamento.map(nomeCategoria => {
        
        // 2. Calcula o total ORÇADO para esta categoria (usando o nome)
        const planejado = planosData
          .filter(p => p.category_name === nomeCategoria)
          .reduce((acc, p) => acc + parseFloat(p.total_amount || 0), 0);

        // 3. Calcula o total GASTO para esta categoria (usando o nome)
        //    Esta é a correção principal: filtramos por `t.category`, que é o campo esperado nas transações.
        const gasto = transacoesData
          .filter(t => t.category === nomeCategoria)
          .reduce((acc, t) => acc + parseFloat(t.value || t.amount || 0), 0);
        
        const disponivel = planejado - gasto;
        const progresso = planejado > 0 ? (gasto / planejado) * 100 : 0;

        return { 
          categoria: nomeCategoria, 
          orcado: planejado, 
          gasto, 
          disponivel, 
          progresso 
        };
      });

      setOrcamentos(orcamentosCalculados);

    } catch (error) {
      console.error("Erro ao carregar dados do orçamento:", error);
      setOrcamentos([]); 
    }
  };

  carregarDadosOrcamento();
}, [abaAtiva]);



  const [newCategory, setNewCategory] = useState({ name: '', type: '' });

const handleCreateCategory = async (e) => {
  e.preventDefault();
  try {
    await apiService.post('/categories', {
      name: newCategory.name,
      type: newCategory.type
    });
    setNewCategory({ name: '', type: '' });
    await loadCategories();
    alert('Categoria criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    alert('Erro ao criar categoria.');
  }
};

  const getProgressColor = (progresso) => {
    if (progresso <= 50) return 'bg-green-500';
    if (progresso <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };


const [tiposUnicos, setTiposUnicos] = useState(TIPOS_PADRAO);
const [categoriasUnicas, setCategoriasUnicas] = useState([]);
const [categoriasUnicasVisaoGeral, setCategoriasUnicasVisaoGeral] = useState([]);


useEffect(() => {
  const tiposPlanejados = [...new Set(planejamentos.map(p => p.type).filter(Boolean))];

  // Garante que sempre tenha "entrada" e "saida" no select, mesmo que não existam ainda no banco
  const tiposCompletos = Array.from(new Set([...TIPOS_PADRAO, ...tiposPlanejados]));

  setTiposUnicos(tiposCompletos);
}, [planejamentos]);



  useEffect(() => {
  if (categories.length && planejamentos.length) {
    const entradasCorrigidas = planejamentos
      .filter(p => (p.type || '').toLowerCase() === 'entrada' || (p.type || '').toLowerCase() === 'income')
      .map(p => {
        const categoria = categories.find(c => c.id === p.category_id);
        return {
          category_name: categoria ? categoria.name : 'Sem Categoria',
          total_amount: parseFloat(p.total_amount)
        };
      });

    const entradaPorCategoriaCorrigida = {};
    entradasCorrigidas.forEach(p => {
      entradaPorCategoriaCorrigida[p.category_name] =
        (entradaPorCategoriaCorrigida[p.category_name] || 0) + p.total_amount;
    });

    const total = Object.values(entradaPorCategoriaCorrigida).reduce((a, b) => a + b, 0);

    const entradaFormatada = Object.entries(entradaPorCategoriaCorrigida).map(([name, value]) => ({
      name,
      value,
      percent: total > 0 ? (value / total) * 100 : 0
    }));

    setGraficoEntrada(entradaFormatada);

        const saidasCorrigidas = planejamentos
      .filter(p => (p.type || '').toLowerCase() === 'saida' || (p.type || '').toLowerCase() === 'expense')
      .map(p => {
        const categoria = categories.find(c => c.id === p.category_id);
        return {
          category_name: categoria ? categoria.name : 'Sem Categoria',
          total_amount: parseFloat(p.total_amount)
        };
      });

    const saidaPorCategoria = {};
    saidasCorrigidas.forEach(p => {
      saidaPorCategoria[p.category_name] =
        (saidaPorCategoria[p.category_name] || 0) + p.total_amount;
    });

    const totalSaidas = Object.values(saidaPorCategoria).reduce((a, b) => a + b, 0);

    const saidaFormatada = Object.entries(saidaPorCategoria).map(([name, value]) => ({
      name,
      value,
      percent: totalSaidas > 0 ? (value / totalSaidas) * 100 : 0
    }));

    setGraficoSaida(saidaFormatada);

  }
}, [categories, planejamentos]);
  

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100">
      {/* Header */}
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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Planejamento Financeiro</h1>
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

      {/* Main Content */}
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Planejamento Financeiro</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie seus planejamentos e orçamentos</p>
          </div>

          <Tabs
          value={abaAtiva}
          onValueChange={(v) => setAbaAtiva(v)}
          className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="planejamentos">Planejamentos</TabsTrigger>
              <TabsTrigger value="orcamento">Orçamento por Categoria</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="visao-geral" className="space-y-6">
              {/* Cards de Resumo */}

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ano</label>
                 <select
                  value={filtroAnoVisaoGeral}
                  onChange={(e) => setFiltroAnoVisaoGeral(Number(e.target.value))}
                  className="border rounded dark:bg-slate-800 dark:border-slate-700 px-3 py-2"
                  >
                {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((ano) => (
                <option key={ano} value={ano}>{ano}</option>
                ))}
                </select>
              </div>
                {/* ▼▼▼ NOVO FILTRO DE TIPO ▼▼▼ */}
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
        <select
            value={filtroTipoVisaoGeral}
            onChange={(e) => setFiltroTipoVisaoGeral(e.target.value)}
            className="border rounded dark:bg-slate-800 dark:border-slate-700 px-3 py-2"
        >
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
        </select>
    </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Planejado</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        R$ {resumo.totalPlanejado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Utilizado</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        R$ {resumo.totalGasto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponível para uso</p>
                        <p className="text-2xl font-bold text-green-600">
                        R$ {resumo.disponivel.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Progresso Médio</p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {resumo.progressoMedio.toFixed(1)}%
                        </p>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-10">

  {/* Gráfico de Rosca - Entradas (profissional) */}
<div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg shadow p-4">
  <h4 className="font-semibold mb-2 dark:text-slate-200">Distribuição de Entradas</h4>
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Tooltip 
      formatter={(value, name) => [`R$ ${value.toLocaleString()}`, name]} 
    />
      <Pie
        data={graficoEntrada}
        dataKey="value"
        nameKey="name"
        innerRadius={50}
        outerRadius={100}
        paddingAngle={5}
        labelLine={false}
        label={({ name, percent }) =>
          `${name}: ${percent.toFixed(1)}%`
        }
      >
        {graficoEntrada.map((_, index) => (
          <Cell key={`entrada-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  </ResponsiveContainer>
</div>

  {/* Gráfico de Rosca - Saídas (profissional) */}
<div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg shadow p-4">
  <h4 className="font-semibold mb-2 dark:text-slate-200">Distribuição de Saídas</h4>
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie
        data={graficoSaida}
        dataKey="value"
        nameKey="name"
        innerRadius={50}
        outerRadius={100}
        paddingAngle={5}
        labelLine={false}
        label={({ name, percent }) =>
          `${name}: ${percent.toFixed(1)}%`
        }
      >
        {graficoSaida.map((_, index) => (
          <Cell
            key={`saida-${index}`}
            fill={COLORS_SAIDAS[index % COLORS_SAIDAS.length]} // segundo array
          />
        ))}
      </Pie>
      <Tooltip
        formatter={(value) =>
          `R$ ${parseFloat(value).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        }
      />
    </PieChart>
  </ResponsiveContainer>
</div>


</div>


              {/* Planejamentos Ativos */}
            </TabsContent>

            {/* Planejamentos */}
            <TabsContent value="planejamentos" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-gray-100">Meus Planejamentos</h3>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Planejamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Criar Novo Planejamento</DialogTitle>
                    </DialogHeader>
                   <form onSubmit={handleSubmit} className="space-y-4">
  <div className="space-y-2">
  <Label htmlFor="type">Tipo</Label>
  <Select
    value={formData.type}
    onValueChange={(value) => handleSelectChange('type', value)}
    required
  >
    <SelectTrigger id="type">
      <SelectValue placeholder="Selecione o tipo" />
    </SelectTrigger>
    <SelectContent>
      {tiposUnicos.map((tipo, index) => (
        <SelectItem key={index} value={tipo}>
          {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

  <div className="space-y-2">
  <Label htmlFor="category_id">Categoria</Label>
  <Select
    value={formData.category_id}
    onValueChange={(value) => handleSelectChange('category_id', value)}
    required
    disabled={!formData.type} // Bônus: desabilita se o tipo não for escolhido
  >
    <SelectTrigger id="category_id">
      <SelectValue placeholder="Selecione a categoria" />
    </SelectTrigger>
    <SelectContent>
      {/* Este filtro mostra apenas categorias do tipo selecionado */}
      {categories
        .filter(cat => cat.type === formData.type)
        .map((cat) => (
          <SelectItem key={cat.id} value={cat.id.toString()}>
            {cat.name}
          </SelectItem>
        ))}
    </SelectContent>
  </Select>
</div>

  <div className="space-y-2">
  <Label htmlFor="form">Forma</Label>
  <Select
    id="form"
    name="form"
    value={formData.form}
    onValueChange={(value) => handleSelectChange('form', value)}
    required
  >
    <SelectTrigger>
      <SelectValue placeholder="Selecione a forma" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="fixo">Fixo</SelectItem>
      <SelectItem value="variavel">Variável</SelectItem>
    </SelectContent>
  </Select>
</div>

  <div className="space-y-2">
    <Label htmlFor="value">Valor (R$)</Label>
    <Input
      id="value"
      name="value"
      type="number"
      value={formData.value}
      onChange={handleInputChange}
      placeholder="0,00"
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="date">Data</Label>
    <Input
      id="date"
      name="date"
      type="date"
      value={formData.date}
      onChange={handleInputChange}
      required
    />
  </div>

  <div className="space-y-2">
  <Label htmlFor="is_recurring">
    <input
      type="checkbox"
      id="is_recurring"
      name="is_recurring"
      checked={formData.is_recurring || false}
      onChange={handleInputChange}
      className="mr-2"
    />
    Recorrente
  </Label>
</div>

{formData.is_recurring && (
  <div className="space-y-2">
    <Label htmlFor="recurrence_period">Período da Recorrência (em meses)</Label>
    <Input
      id="recurrence_period"
      name="recurrence_period"
      type="number"
      value={formData.recurrence_period}
      onChange={handleInputChange}
      placeholder="Ex: 3"
      required={formData.is_recurring}
    />
  </div>
)}

  <div className="space-y-2">
    <Label htmlFor="observations">Observações</Label>
    <Input
      id="observations"
      name="observations"
      value={formData.observations}
      onChange={handleInputChange}
      placeholder="Observações do planejamento"
    />
  </div>

  <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
      Cancelar
    </Button>
    <Button type="submit">
      Criar Planejamento
    </Button>
  </div>
</form>

                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-4 items-end mb-4">
  <div>
    <Label className="block mb-1">Categoria</Label>
    <select
  value={filtroCategoria}
  onChange={(e) => setFiltroCategoria(e.target.value)}
  className="border rounded dark:bg-slate-800 dark:border-slate-700 px-3 py-2"
>
  <option value="">Todas</option>
  {categoriasUnicas.length > 0 &&
    categoriasUnicas.map((cat, index) => (
      <option key={index} value={cat}>{cat}</option>
    ))
  }
</select>

  </div>

  <div>
    <Label className="block mb-1">Tipo</Label>
   <select
  value={filtroTipo}
  onChange={(e) => setFiltroTipo(e.target.value)}
  className="border rounded dark:bg-slate-800 dark:border-slate-700 px-3 py-2"
>
  <option value="">Todos</option>
  {tiposUnicos.length > 0 &&
    tiposUnicos.map((tipo, index) => (
      <option key={index} value={tipo}>{tipo}</option>
    ))
  }
</select>



  </div>

  <div>
    <Label className="block mb-1">Início</Label>
    <Input
      type="date"
      value={filtroInicio}
      onChange={(e) => setFiltroInicio(e.target.value)}
      className="px-3 py-2"
    />
  </div>

  <div>
    <Label className="block mb-1">Fim</Label>
    <Input
      type="date"
      value={filtroFim}
      onChange={(e) => setFiltroFim(e.target.value)}
      className="px-3 py-2"
    />
  </div>

</div>

              <div className="grid gap-6">
                {planejamentos.map((plan) => (
                  <Card key={plan.id} className="relative">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg text-gray-600 dark:text-slate-400 font-semibold">
                          {plan.category_name}
                        </p>
                          <p className={`text-sm font-semibold ${plan.type === 'saida' ? 'text-red-600' : 'text-blue-600'}`}>
                          {plan.type}
                        </p>
                          <h3 className="text-base font-semibold mt-1">{plan.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(plan.start_date).toLocaleDateString()}
                        </p>
                          {plan.observations && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                          Descrição: {plan.observations}
                        </p>
                        )}
                        </div>

                        <div className="flex space-x-2">
                          {plan.status !== 'confirmed' && (
                          <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmarPlanejamento(plan.id)}
                          title="Confirmar Planejamento"
                          >
                          Confirmar
                          </Button>
                          )}

                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => abrirModalEdicao(plan)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => excluirPlanejamento(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Total</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">R$ {plan.total_amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Valor Gasto</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">R$ {(plan.spent_amount || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Disponível</p>
                          <p className="text-xl font-bold text-green-600">R$ {(plan.total_amount - (plan.spent_amount || 0)).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Progresso</p>
                          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{((plan.progresso ?? 0).toFixed(1))}%</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progresso do Planejamento</span>
                          <span>{(plan.progress || 0).toFixed(1)}%</span>
                        </div>
                        <Progress value={plan.progress || 0} className="h-3" />
                      </div>
                      {plan.status === 'confirmed' && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 text-xs font-bold text-black bg-lime-400 rounded">
                      CONFIRMADO
                      </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Orçamento por Categoria */}
            <TabsContent value="orcamento" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-gray-100">Orçamento por Categoria</h3>
                <Dialog>
  <DialogTrigger asChild>
    <Dialog>
  <DialogTrigger asChild>
    <Button>
      <Plus className="h-4 w-4 mr-2" />
      Nova Categoria
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[400px]">
  <DialogHeader>
    <DialogTitle>Nova Categoria</DialogTitle>
  </DialogHeader>
  {/* ▼▼▼ SUBSTITUA O FORMULÁRIO INTEIRO POR ESTE ▼▼▼ */}
  <form onSubmit={handleCreateCategory} className="space-y-4">
    <div>
      <Label htmlFor="new_category_name">Nome da Categoria</Label>
      <Input
        id="new_category_name"
        value={newCategory.name}
        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
        placeholder="Ex: Transporte, Salário..."
        required
      />
    </div>

    {/* CAMPO DE TIPO ADICIONADO */}
    <div>
      <Label htmlFor="new_category_type">Tipo</Label>
      <select
        id="new_category_type"
        value={newCategory.type}
        onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
        required
        className="border rounded dark:bg-slate-800 dark:border-slate-700 px-3 py-2 w-full mt-1 bg-white"
      >
        <option value="">Selecione o tipo</option>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const trigger = document.querySelector('[aria-controls="radix-r0"]'); // Adapte se necessário para fechar o modal
          if(trigger) trigger.click();
          setNewCategory({ name: '', type: '' });
        }}
      >
        Cancelar
      </Button>
      <Button type="submit">Salvar</Button>
    </div>
  </form>
</DialogContent>
</Dialog>

  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Nova Categoria</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleCreateCategory} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category_name">Nome da Categoria</Label>
        <Input
          id="category_name"
          name="category_name"
          value={newCategory.name}
          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="category_type">Tipo</Label>
        <select
          id="category_type"
          name="category_type"
          value={newCategory.type}
          onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
          required
          className="border rounded dark:bg-slate-800 dark:border-slate-700 px-3 py-2 w-full"
        >
          <option value="">Selecione o tipo</option>
          {tiposUnicos.map((tipo, index) => (
          <option key={index} value={tipo}>
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </option>
))}

        </select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="submit">Salvar</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

              </div>

              <div className="grid gap-4">
                {orcamentos.map((orc, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold dark:text-gray-100">{orc.categoria}</h3>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Orçado</p>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">R$ {orc.orcado.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Gasto</p>
                          <p className="text-lg font-bold text-red-600dark:text-red-400">R$ {orc.gasto.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Disponível</p>
                          <p className="text-lg font-bold text-green-600">R$ {(orc.orcado - orc.gasto).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Utilização do Orçamento</span>
                          <span className={`font-medium ${orc.progresso > 90 ? 'text-red-600' : orc.progresso > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {orc.progresso.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${getProgressColor(orc.progresso)}`}
                            style={{ width: `${Math.min(orc.progresso, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal para Editar Planejamento */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Planejamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
  e.preventDefault();
  editarPlanejamento(selectedPlanejamento.id, {
    ...formData,
    value: parseFloat(formData.value),
    recurrence_period: parseInt(formData.recurrence_period) || 1
  });
}} className="space-y-4">

  <div className="space-y-2">
    <Label htmlFor="type">Tipo</Label>
    <select
      id="type"
      name="type"
      value={formData.type}
      onChange={handleInputChange}
      required
      className="border rounded dark:bg-slate-800 dark:border-slate-700 px-3 py-2 w-full"
    >
      <option value="">Selecione o tipo</option>
      <option value="entrada">Entrada</option>
      <option value="saida">Saída</option>
      <option value="investimento">Investimento</option>
    </select>
  </div>

  {/* DEPOIS (o código corrigido) */}
  <div className="space-y-2">
    <Label htmlFor="category_id">Categoria</Label>
    <Select 
      value={formData.category_id}
      // A linha abaixo adapta a resposta para funcionar com sua função handleInputChange
      onValueChange={(value) => handleInputChange({ target: { name: 'category_id', value } })}
      required
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione a categoria" />
      </SelectTrigger>
      <SelectContent>
        {/* Este filtro extra garante que só apareçam categorias do tipo selecionado (entrada/saída) */}
        {categories
          .filter(cat => cat.type === formData.type)
          .map((cat) => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  <div className="space-y-2">
    <Label htmlFor="value">Valor (R$)</Label>
    <Input
      id="value"
      name="value"
      type="number"
      value={formData.value}
      onChange={handleInputChange}
      placeholder="0,00"
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="date">Data</Label>
    <Input
      id="date"
      name="date"
      type="date"
      value={formData.date}
      onChange={handleInputChange}
      required
    />
  </div>

  <div className="space-y-2">
    <Label htmlFor="is_recurring">
      <input
        type="checkbox"
        id="is_recurring"
        name="is_recurring"
        checked={formData.is_recurring || false}
        onChange={handleInputChange}
        className="mr-2"
      />
      Recorrente
    </Label>
  </div>

  {formData.is_recurring && (
    <div className="space-y-2">
      <Label htmlFor="recurrence_period">Período da Recorrência (em meses)</Label>
      <Input
        id="recurrence_period"
        name="recurrence_period"
        type="number"
        value={formData.recurrence_period}
        onChange={handleInputChange}
        placeholder="Ex: 3"
        required={formData.is_recurring}
      />
    </div>
  )}

  <div className="space-y-2">
    <Label htmlFor="observations">Observações</Label>
    <Input
      id="observations"
      name="observations"
      value={formData.observations}
      onChange={handleInputChange}
      placeholder="Observações do planejamento"
    />
  </div>

  <div className="flex justify-end space-x-2">
    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
      Cancelar
    </Button>
    <Button type="submit">
      Salvar Alterações
    </Button>
  </div>
</form>

            </DialogContent>
          </Dialog>
        </div>
      
    </div>
  );
};

export default Planning;

