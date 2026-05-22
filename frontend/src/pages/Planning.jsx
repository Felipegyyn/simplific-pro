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

  const [resumoFiltrado, setResumoFiltrado] = useState({
  totalPlanejado: 0,
  totalGasto: 0,
  disponivel: 0,
});
  

  // Carregar planejamentos da API
  useEffect(() => {
  const carregarDados = async () => {
    const queryParams = new URLSearchParams();
    if (filtroAnoVisaoGeral) queryParams.append('ano', filtroAnoVisaoGeral);
    if (filtroTipoVisaoGeral) queryParams.append('type', filtroTipoVisaoGeral);

    const planos = await apiService.get(`/api/planning?${queryParams.toString()}`);
    const categoriasResponse = await apiService.get('/api/categories');
  
    setCategories(categoriasResponse); 


    const planosData = planos.plannings || [];

    setPlanejamentosVisaoGeral(planosData);
    calcularResumo(planosData);

    // Dados para gráfico de linha
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const linha = meses.map((mes, i) => {
      const planejadoMes = planosData
        .filter(p => new Date(p.start_date).getMonth() === i)
        .reduce((acc, p) => acc + parseFloat(p.total_amount), 0);

      const realizadoMes = planosData
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

useEffect(() => {
  // Calcula os totais com base nos planejamentos filtrados que já estão na tela
  const totalPlanejado = planejamentos.reduce((acc, p) => acc + parseFloat(p.total_amount || 0), 0);
  const totalGasto = planejamentos.reduce((acc, p) => acc + parseFloat(p.spent_amount || 0), 0);
  const disponivel = totalPlanejado - totalGasto;

  setResumoFiltrado({
    totalPlanejado,
    totalGasto,
    disponivel,
  });
}, [planejamentos]);

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
      await apiService.put(`/api/planning/${id}/confirm`, { status: 'confirmed' });

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

    // CORREÇÃO AQUI: Usando o apiService
    const response = await apiService.get(`/api/planning${query}`);

    setPlanejamentos(response.plannings || []);
  } catch (error) {
    console.error('Erro ao carregar planejamentos:', error);
  } finally {
    setLoading(false);
  }
};

// NOVA VERSÃO CORRIGIDA
const calcularResumo = (planejamentos) => {
  // Agora usamos 'total_amount' para o planejado, que está correto
  const totalPlanejado = planejamentos.reduce((acc, p) => acc + parseFloat(p.total_amount || 0), 0);
  
  // AQUI ESTÁ A CORREÇÃO PRINCIPAL:
  // Somamos o 'spent_amount' individual de cada planejamento.
  const totalGasto = planejamentos.reduce((acc, p) => acc + parseFloat(p.spent_amount || 0), 0);
  
  const disponivel = totalPlanejado - totalGasto;
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
    const categoriasResponse = await apiService.get('/api/categories');
    const categoriasData = categoriasResponse.categories || categoriasResponse || [];
    setCategories(categoriasData);
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
};



  // Função para editar planejamento
  const editarPlanejamento = async (id, dados) => {
    try {
      const response = await apiService.put(`/api/planning/${id}`, dados);
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
    // CORREÇÃO AQUI: Usando o apiService
    await apiService.delete(`/api/planning/${id}`);
    await loadPlanejamentos();
    alert('Planejamento excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir planejamento:', error);
    alert('Erro ao excluir planejamento. Tente novamente.');
  }
};

const handleExcluirOrcamento = async (orc) => {
  if (!orc.planningIds || orc.planningIds.length === 0) return;
  
  const confirmMsg = orc.planningIds.length > 1 
    ? `Tem certeza que deseja excluir os ${orc.planningIds.length} planejamentos da categoria "${orc.categoria}" neste período?`
    : `Tem certeza que deseja excluir o planejamento da categoria "${orc.categoria}" neste período?`;

  if (!window.confirm(confirmMsg)) return;

  try {
    setLoading(true);
    // Exclui todos os planejamentos vinculados àquela categoria no período
    await Promise.all(orc.planningIds.map(id => apiService.delete(`/api/planning/${id}`)));
    
    // Recarrega os dados para atualizar a interface
    await loadPlanejamentos();
    
    // Recarrega os dados raw para atualizar a aba de orçamento
    const [planosResp, transacoesResp] = await Promise.all([
      apiService.get('/api/planning'),
      apiService.get('/api/transactions')
    ]);
    setRawPlanosOrcamento(planosResp.plannings || []);
    setRawTransacoesOrcamento(transacoesResp.transacoes || transacoesResp.transactions || []);
    
    alert('Orçamento excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir orçamento:', error);
    alert('Erro ao excluir orçamento. Tente novamente.');
  } finally {
    setLoading(false);
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
const response = await apiService.post('/api/planning', payload);

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
        apiService.get('/api/planning'),
        apiService.get('/api/transactions')
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

  // ── Dados raw para filtro mensal do orçamento (novo, não altera useEffect existente) ──
  const [rawPlanosOrcamento, setRawPlanosOrcamento] = useState([]);
  const [rawTransacoesOrcamento, setRawTransacoesOrcamento] = useState([]);
  const [filtroMesOrcamento, setFiltroMesOrcamento] = useState('');
  const [filtroAnoOrcamento, setFiltroAnoOrcamento] = useState(String(new Date().getFullYear()));

  useEffect(() => {
    if (abaAtiva !== 'orcamento') return;
    const carregarRaw = async () => {
      try {
        const [planosResp, transacoesResp] = await Promise.all([
          apiService.get('/api/planning'),
          apiService.get('/api/transactions')
        ]);
        setRawPlanosOrcamento(planosResp.plannings || []);
        setRawTransacoesOrcamento(transacoesResp.transacoes || transacoesResp.transactions || []);
      } catch (e) {
        console.error('Erro ao carregar dados raw do orçamento:', e);
      }
    };
    carregarRaw();
  }, [abaAtiva]);

  const orcamentosComTipo = useMemo(() => {
    if (rawPlanosOrcamento.length === 0) return orcamentos.map(o => ({ ...o, tipo: '' }));

    let planos = rawPlanosOrcamento;
    let transacoes = rawTransacoesOrcamento;

    if (filtroAnoOrcamento) {
      const ano = parseInt(filtroAnoOrcamento);
      planos = planos.filter(p => new Date(p.date || p.start_date).getFullYear() === ano);
      transacoes = transacoes.filter(t => new Date(t.transaction_date || t.date).getFullYear() === ano);
    }
    if (filtroMesOrcamento) {
      const mes = parseInt(filtroMesOrcamento);
      planos = planos.filter(p => new Date(p.date || p.start_date).getMonth() + 1 === mes);
      transacoes = transacoes.filter(t => new Date(t.transaction_date || t.date).getMonth() + 1 === mes);
    }

    const nomes = [...new Set(planos.map(p => p.category_name).filter(Boolean))];
    return nomes.map(nomeCategoria => {
      const planosCategoria = planos.filter(p => p.category_name === nomeCategoria);
      const planningIds = planosCategoria.map(p => p.id); // Captura os IDs para exclusão
      const planejado = planosCategoria.reduce((acc, p) => acc + parseFloat(p.total_amount || 0), 0);
      const tipo = planosCategoria[0]?.type || '';
      const gasto = transacoes
        .filter(t => t.category === nomeCategoria)
        .reduce((acc, t) => acc + parseFloat(t.value || t.amount || 0), 0);
      const disponivel = planejado - gasto;
      const progresso = planejado > 0 ? (gasto / planejado) * 100 : 0;
      return { categoria: nomeCategoria, tipo, orcado: planejado, gasto, disponivel, progresso, planningIds };
    });
  }, [rawPlanosOrcamento, rawTransacoesOrcamento, filtroMesOrcamento, filtroAnoOrcamento, orcamentos]);

  const [newCategory, setNewCategory] = useState({ name: '', type: '' });

const handleCreateCategory = async (e) => {
  e.preventDefault();
  try {
    await apiService.post('/api/categories', {
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

  const getPlanRowBorderClass = (plan) => {
    if (plan.status !== 'confirmed') return 'border-l-4 border-l-orange-400';
    return plan.type === 'entrada' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500';
  };

  const getOrcBorderClass = (progresso) => {
    if (progresso > 90) return 'border-l-4 border-l-red-500';
    if (progresso > 70) return 'border-l-4 border-l-yellow-400';
    return 'border-l-4 border-l-green-500';
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
  if (planejamentos && planejamentos.length > 0) {
    // 1. Extrai todos os nomes de categoria da lista de planejamentos
    const nomesDeCategorias = planejamentos.map(p => p.category_name).filter(Boolean);
    
    // 2. Cria uma lista apenas com os nomes únicos e ordena em ordem alfabética
    const categoriasFiltradas = [...new Set(nomesDeCategorias)].sort();
    
    // 3. Atualiza o estado que popula o dropdown do filtro
    setCategoriasUnicas(categoriasFiltradas);
  } else {
    // Se não houver planejamentos, a lista de filtros fica vazia
    setCategoriasUnicas([]);
  }
}, [planejamentos]); // Este efeito será executado sempre que a lista de planejamentos mudar

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
    <div className="min-h-screen bg-transparent text-slate-200">
      {/* Header */}
      <header className="glass-panel rounded-none border-x-0 border-t-0 border-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-slate-400 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3 brightness-0 invert" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400 hidden sm:block">
                Bem-vindo, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout} className="border-white/10 hover:bg-white/5 text-slate-300">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Planejamento Financeiro
          </h2>
          <p className="text-slate-400">Gerencie seus planejamentos e orçamentos com precisão tecnológica</p>
        </div>

        <Tabs
          value={abaAtiva}
          onValueChange={(v) => setAbaAtiva(v)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 glass-panel p-1">
            <TabsTrigger value="visao-geral" className="data-[state=active]:active-gradient">Visão Geral</TabsTrigger>
            <TabsTrigger value="orcamento" className="data-[state=active]:active-gradient">Orçamento por Categoria</TabsTrigger>
            <TabsTrigger value="planejamentos" className="data-[state=active]:active-gradient">Planejamentos</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            {/* Filtros Visão Geral */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 glass-panel p-4 border-white/5">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Ano</label>
                <select
                  value={filtroAnoVisaoGeral}
                  onChange={(e) => setFiltroAnoVisaoGeral(Number(e.target.value))}
                  className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((ano) => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Tipo</label>
                <select
                  value={filtroTipoVisaoGeral}
                  onChange={(e) => setFiltroTipoVisaoGeral(e.target.value)}
                  className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                >
                  <option value="">Todos</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Target className="h-12 w-12 text-cyan-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total Planejado</p>
                <p className="text-2xl font-bold text-white">
                  R$ {resumo.totalPlanejado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign className="h-12 w-12 text-rose-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total Realizado</p>
                <p className="text-2xl font-bold text-white">
                  R$ {resumo.totalGasto.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.min(resumo.progressoMedio, 100)}%` }} />
                </div>
              </div>

              <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <TrendingUp className="h-12 w-12 text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-1">Total a realizar</p>
                <p className="text-2xl font-bold text-white">
                  R$ {resumo.disponivel.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, 100 - resumo.progressoMedio)}%` }} />
                </div>
              </div>

              <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BarChart3 className="h-12 w-12 text-purple-400" />
                </div>
                <p className="text-sm font-medium text-slate-400 mb-1">Progresso Médio</p>
                <p className="text-2xl font-bold text-white">
                  {resumo.progressoMedio.toFixed(1)}%
                </p>
                <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(resumo.progressoMedio, 100)}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Gráfico de Rosca - Entradas */}
              <div className="glass-panel p-6 border-white/5">
                <h4 className="font-semibold mb-4 text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  Distribuição de Entradas
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value, name) => [`R$ ${value.toLocaleString()}`, name]} 
                    />
                    <Pie
                      data={graficoEntrada}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
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

              {/* Gráfico de Rosca - Saídas */}
              <div className="glass-panel p-6 border-white/5">
                <h4 className="font-semibold mb-4 text-slate-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  Distribuição de Saídas
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={graficoSaida}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${percent.toFixed(1)}%`
                      }
                    >
                      {graficoSaida.map((_, index) => (
                        <Cell
                          key={`saida-${index}`}
                          fill={COLORS_SAIDAS[index % COLORS_SAIDAS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255, 255, 255, 0.1)', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
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
          </TabsContent>

          {/* Orçamento por Categoria */}
          <TabsContent value="orcamento" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-4 border-white/5">
              <div>
                <h3 className="text-lg font-semibold text-white">Orçamento por Categoria</h3>
                <p className="text-sm text-slate-400">Controle seus gastos por categoria mensalmente</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-900/20">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar orçamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-panel border-white/10 text-slate-200">
                    <DialogHeader>
                      <DialogTitle className="text-white">Criar Novo Planejamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-slate-300">Tipo</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => handleSelectChange('type', value)}
                          required
                        >
                          <SelectTrigger id="type" className="glass-panel border-white/10">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent className="glass-panel border-white/10">
                            {tiposUnicos.map((tipo, index) => (
                              <SelectItem key={index} value={tipo}>
                                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category_id" className="text-slate-300">Categoria</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) => handleSelectChange('category_id', value)}
                          required
                          disabled={!formData.type} 
                        >
                          <SelectTrigger id="category_id" className="glass-panel border-white/10">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent className="glass-panel border-white/10 max-h-[250px]">
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="form" className="text-slate-300">Forma</Label>
                          <Select
                            id="form"
                            name="form"
                            value={formData.form}
                            onValueChange={(value) => handleSelectChange('form', value)}
                            required
                          >
                            <SelectTrigger className="glass-panel border-white/10">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent className="glass-panel border-white/10">
                              <SelectItem value="fixo">Fixo</SelectItem>
                              <SelectItem value="variavel">Variável</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="value" className="text-slate-300">Valor (R$)</Label>
                          <Input
                            id="value"
                            name="value"
                            type="number"
                            value={formData.value}
                            onChange={handleInputChange}
                            placeholder="0,00"
                            required
                            className="glass-panel border-white/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date" className="text-slate-300">Data</Label>
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            className="glass-panel border-white/10"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <input
                            type="checkbox"
                            id="is_recurring"
                            name="is_recurring"
                            checked={formData.is_recurring || false}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-600 focus:ring-cyan-500/50"
                          />
                          <Label htmlFor="is_recurring" className="text-slate-300">Recorrente</Label>
                        </div>
                      </div>

                      {formData.is_recurring && (
                        <div className="space-y-2">
                          <Label htmlFor="recurrence_period" className="text-slate-300">Período da Recorrência (meses)</Label>
                          <Input
                            id="recurrence_period"
                            name="recurrence_period"
                            type="number"
                            value={formData.recurrence_period}
                            onChange={handleInputChange}
                            placeholder="Ex: 3"
                            required={formData.is_recurring}
                            className="glass-panel border-white/10"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="observations" className="text-slate-300">Observações</Label>
                        <Input
                          id="observations"
                          name="observations"
                          value={formData.observations}
                          onChange={handleInputChange}
                          placeholder="Observações do planejamento"
                          className="glass-panel border-white/10"
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                          Criar Planejamento
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-300">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-panel border-white/10 text-slate-200">
                    <DialogHeader>
                      <DialogTitle className="text-white">Nova Categoria</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="category_name" className="text-slate-300">Nome da Categoria</Label>
                        <Input
                          id="category_name"
                          name="category_name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="glass-panel border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category_type" className="text-slate-300">Tipo</Label>
                        <select
                          id="category_type"
                          name="category_type"
                          value={newCategory.type}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
                          required
                          className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                          <option value="">Selecione o tipo</option>
                          {tiposUnicos.map((tipo, index) => (
                            <option key={index} value={tipo}>
                              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Filtros Orçamento */}
            <div className="flex flex-wrap gap-4 items-end glass-panel p-4 border-white/5">
              <div>
                <Label className="block mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Ano</Label>
                <select
                  value={filtroAnoOrcamento}
                  onChange={(e) => setFiltroAnoOrcamento(e.target.value)}
                  className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map(a => (
                    <option key={a} value={String(a)}>{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="block mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Mês</Label>
                <select
                  value={filtroMesOrcamento}
                  onChange={(e) => setFiltroMesOrcamento(e.target.value)}
                  className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">Todos</option>
                  {['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'].map((m, i) => (
                    <option key={i+1} value={String(i+1)}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* DRE Orçamento */}
            {(() => {
              const OrcRow = ({ orc }) => (
                <div className={`${getOrcBorderClass(orc.progresso)} glass-card p-4 flex flex-col sm:flex-row justify-between items-start hover:bg-white/5 transition-all group relative overflow-hidden`}>
                  <div className="flex-1 min-w-0 z-10">
                    <h3 className="font-semibold text-sm text-white mb-2">{orc.categoria}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] mb-3">
                      <span className="text-cyan-400 font-medium">Orçado: R$ {orc.orcado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-rose-400 font-medium">Gasto: R$ {orc.gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-emerald-400 font-medium">Disponível: R$ {orc.disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(orc.progresso)}`} style={{ width: `${Math.min(orc.progresso, 100)}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-12 text-right ${orc.progresso > 90 ? 'text-rose-500' : orc.progresso > 70 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {orc.progresso.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-4 shrink-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleExcluirOrcamento(orc)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* Subtle background glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );

              const entradasOrc = orcamentosComTipo.filter(o => o.tipo === 'entrada');
              const saidasOrc = orcamentosComTipo.filter(o => o.tipo === 'saida');

              return (
                <div className="space-y-6">
                  <div className="glass-panel p-6 border-white/5">
                    <div className="flex items-center gap-2 text-emerald-400 mb-6">
                      <TrendingUp className="h-5 w-5" />
                      <h4 className="font-semibold uppercase tracking-wider text-sm">Entradas</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entradasOrc.length > 0
                        ? entradasOrc.map((o, i) => <OrcRow key={i} orc={o} />)
                        : <p className="col-span-2 text-center text-sm text-slate-500 py-8 glass-card border-dashed">Nenhum orçamento de entrada encontrado</p>
                      }
                    </div>
                  </div>

                  <div className="glass-panel p-6 border-white/5">
                    <div className="flex items-center gap-2 text-rose-400 mb-6">
                      <Target className="h-5 w-5" />
                      <h4 className="font-semibold uppercase tracking-wider text-sm">Saídas</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {saidasOrc.length > 0
                        ? saidasOrc.map((o, i) => <OrcRow key={i} orc={o} />)
                        : <p className="col-span-2 text-center text-sm text-slate-500 py-8 glass-card border-dashed">Nenhum orçamento de saída encontrado</p>
                      }
                    </div>
                  </div>
                </div>
              );
            })()}
          </TabsContent>

          {/* Planejamentos */}
          <TabsContent value="planejamentos" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-4 border-white/5">
              <h3 className="text-lg font-semibold text-white">Meus Planejamentos</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Filtros */}
              <div className="lg:col-span-2 glass-panel p-6 border-white/5 flex flex-wrap gap-4 items-end">
                <div>
                  <Label className="block mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Categoria</Label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">Todas</option>
                    {categoriasUnicas.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="block mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Tipo</Label>
                  <select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">Todos</option>
                    {tiposUnicos.map((tipo, index) => (
                      <option key={index} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="block mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Início</Label>
                  <Input
                    type="date"
                    value={filtroInicio}
                    onChange={(e) => setFiltroInicio(e.target.value)}
                    className="glass-panel border-white/10 text-xs h-9"
                  />
                </div>
                <div>
                  <Label className="block mb-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Fim</Label>
                  <Input
                    type="date"
                    value={filtroFim}
                    onChange={(e) => setFiltroFim(e.target.value)}
                    className="glass-panel border-white/10 text-xs h-9"
                  />
                </div>
              </div>

              {/* Minicard de Resumo */}
              <div className="glass-card border-white/10 p-6 flex flex-col justify-center bg-cyan-500/5">
                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Resumo Filtrado</span>
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Planejado</span>
                    <span className="text-sm font-bold text-cyan-400">
                      {resumoFiltrado.totalPlanejado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Realizado</span>
                    <span className="text-sm font-bold text-rose-400">
                      {resumoFiltrado.totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">A realizar</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {resumoFiltrado.disponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Planejamentos */}
            {(() => {
              const PlanRow = ({ plan }) => (
                <div className={`${getPlanRowBorderClass(plan)} glass-card p-4 flex flex-col sm:flex-row justify-between items-start hover:bg-white/5 transition-all group relative overflow-hidden`}>
                  <div className="flex-1 min-w-0 z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-semibold text-sm text-white">{plan.category_name}</h3>
                      {plan.status === 'confirmed' && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/20 text-[10px] uppercase font-bold px-1.5 py-0">
                          Confirmado
                        </Badge>
                      )}
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        {new Date(plan.start_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] mb-3">
                      <span className="text-cyan-400 font-medium">Planejado: R$ {parseFloat(plan.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-rose-400 font-medium">Gasto: R$ {parseFloat(plan.spent_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span className="text-emerald-400 font-medium">Disponível: R$ {(parseFloat(plan.total_amount) - parseFloat(plan.spent_amount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {plan.observations && (
                      <p className="text-[10px] text-slate-500 italic mb-3 line-clamp-1">"{plan.observations}"</p>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor(plan.progress || 0)}`} style={{ width: `${Math.min(plan.progress || 0, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-12 text-right">{(plan.progress || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 sm:mt-0 sm:ml-4 shrink-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    {plan.status !== 'confirmed' && (
                      <Button variant="outline" size="sm" onClick={() => confirmarPlanejamento(plan.id)} className="h-8 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                        Confirmar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => abrirModalEdicao(plan)} className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/5">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => excluirPlanejamento(plan.id)} className="h-8 w-8 p-0 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );

              const entradas = planejamentos.filter(p => p.type === 'entrada');
              const saidas = planejamentos.filter(p => p.type === 'saida');

              return (
                <div className="space-y-8">
                  <div className="glass-panel p-6 border-white/5">
                    <div className="flex items-center gap-2 text-emerald-400 mb-6">
                      <TrendingUp className="h-5 w-5" />
                      <h4 className="font-semibold uppercase tracking-wider text-sm">Entradas</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {entradas.length > 0
                        ? entradas.map(p => <PlanRow key={p.id} plan={p} />)
                        : <p className="col-span-2 text-center text-sm text-slate-500 py-12 glass-card border-dashed">Nenhuma entrada planejada</p>
                      }
                    </div>
                  </div>

                  <div className="glass-panel p-6 border-white/5">
                    <div className="flex items-center gap-2 text-rose-400 mb-6">
                      <Target className="h-5 w-5" />
                      <h4 className="font-semibold uppercase tracking-wider text-sm">Saídas</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {saidas.length > 0
                        ? saidas.map(p => <PlanRow key={p.id} plan={p} />)
                        : <p className="col-span-2 text-center text-sm text-slate-500 py-12 glass-card border-dashed">Nenhuma saída planejada</p>
                      }
                    </div>
                  </div>
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>

        {/* Modal para Editar Planejamento */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="glass-panel border-white/10 text-slate-200">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Planejamento</DialogTitle>
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
                <Label htmlFor="type" className="text-slate-300">Tipo</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-cyan-500/50"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="investimento">Investimento</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category_id" className="text-slate-300">Categoria</Label>
                <Select 
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange({ target: { name: 'category_id', value } })}
                  required
                >
                  <SelectTrigger className="glass-panel border-white/10">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10 max-h-[250px]">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value" className="text-slate-300">Valor (R$)</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="0,00"
                    required
                    className="glass-panel border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-300">Data</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="glass-panel border-white/10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="is_recurring_edit"
                  name="is_recurring"
                  checked={formData.is_recurring || false}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-cyan-600 focus:ring-cyan-500/50"
                />
                <Label htmlFor="is_recurring_edit" className="text-slate-300">Recorrente</Label>
              </div>

              {formData.is_recurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurrence_period_edit" className="text-slate-300">Período da Recorrência (meses)</Label>
                  <Input
                    id="recurrence_period_edit"
                    name="recurrence_period"
                    type="number"
                    value={formData.recurrence_period}
                    onChange={handleInputChange}
                    placeholder="Ex: 3"
                    required={formData.is_recurring}
                    className="glass-panel border-white/10"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observations_edit" className="text-slate-300">Observações</Label>
                <Input
                  id="observations_edit"
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  placeholder="Observações do planejamento"
                  className="glass-panel border-white/10"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
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

