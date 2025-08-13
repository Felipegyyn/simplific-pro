import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import eventService from '../services/eventService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2, 
  Search, Filter, Calendar, CheckCircle, Clock, LogOut, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import logo from '../assets/LOGO.png';

const Transactions = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // ▼▼▼ ADICIONE ESTA FUNÇÃO AQUI ▼▼▼
  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses são de 0 a 11
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  // ▲▲▲ FIM DA FUNÇÃO ▲▲▲

  // ▼▼▼ ADICIONE ESTA NOVA FUNÇÃO AQUI ▼▼▼
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Data inválida';
    // Pega a parte da data antes do 'T' (ex: "2025-08-29")
    const datePart = dateString.split('T')[0];
    // Adiciona um horário para evitar que o JS interprete como UTC
    const localDate = new Date(`${datePart}T12:00:00`);
    // Formata para o padrão local (ex: "29/08/2025")
    return localDate.toLocaleDateString();
  };
  // ▲▲▲ FIM DA NOVA FUNÇÃO ▲▲▲

  // Estados para transações e modal
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    transaction_date: getLocalDate(),
    status: 'pendente'
  });

  const [categorias, setCategorias] = useState([]);
  const [categoriasLoading, setCategoriasLoading] = useState(true);
  const [novaCategoria, setNovaCategoria] = useState('');

const adicionarCategoria = async (novaCategoria) => {
  try {

    const existe = Array.isArray(categorias) && categorias.some(
    (cat) => cat.name.toLowerCase() === novaCategoria.toLowerCase() && cat.type === (formData.type === 'income' ? 'entrada' : 'saida')
);
    if (existe) {
      alert('Essa categoria já existe.');
      return;
    }

    // 👉 Chamada correta, APENAS UMA
    const categoriaData = {
  name: novaCategoria,
  type: formData.type === 'income' ? 'entrada' : 'saida'
};

console.log('✅ Dados enviados para API:', categoriaData);

await apiService.post('/api/categories', categoriaData);


    await loadCategorias(); // 🔄 Atualiza lista a partir do backend
    // Forçar renderização correta
    setFormData((prev) => ({ ...prev, category: novaCategoria }));

    alert('Categoria cadastrada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar categoria:', error.response ? error.response.data : error.message);
    alert('Erro ao criar categoria. Tente novamente.');
  }
};


  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    transaction_date: '',
    status: 'pendente'
  });

  // Carregar transações da API
  useEffect(() => {
    loadTransacoes();
    loadCategorias();
  }, []);

const loadTransacoes = async () => {
  try {
    setLoading(true);
    const response = await apiService.get('/api/transactions');
    console.log('Retorno da API:', response);

    let lista = [];

    if (response && response.data && Array.isArray(response.data.transactions)) {
      lista = response.data.transactions;
    } else if (response && Array.isArray(response.data)) {
      lista = response.data;
    } else if (response && Array.isArray(response.transactions)) { // Fallback se o backend mudar estrutura
      lista = response.transactions;
    } else {
      console.error('Formato inesperado da resposta:', response);
    }

    // 🔑 Garantir que o estado é sempre um array
    setTransacoes(Array.isArray(lista) ? lista : []);
  } catch (error) {
    console.error('Erro ao carregar transações:', error.response ? error.response.data : error.message);
    setTransacoes([]); // Limpa corretamente em caso de erro
  } finally {
    setLoading(false);
  }
};


  const loadCategorias = async () => {
  try {
    setCategoriasLoading(true); // Início do carregamento
    const response = await apiService.get('/api/categories');
    console.log('🔍 Resposta completa da API:', response);
    setCategorias(response || []);
    console.log('Categorias carregadas:', response);
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    setCategorias([]);
  } finally {
    setCategoriasLoading(false); // Final do carregamento
  }
};
const carregarCategoriasAntesDeAbrir = async () => {
  setCategoriasLoading(true);
  await loadCategorias();  // Garante carregamento completo
  setCategoriasLoading(false);
  setIsModalOpen(true);
};


  // Função para criar nova transação
  const criarTransacao = async (dadosTransacao) => {
  try {
    // Correção: criar a transação no backend
    await apiService.post('/api/transactions', dadosTransacao);
    await loadTransacoes(); // Depois de criar, recarregar
    eventService.emit('transactionsChanged'); // <-- ADICIONE ESTA LINHA
    setIsModalOpen(false); // Fechar modal
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      transaction_date: getLocalDate(),
      status: 'pendente'
    });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    alert('Erro ao criar transação. Tente novamente.');
  }
};


  // Função para confirmar transação
  const confirmarTransacao = async (id) => {
  try {
    await apiService.post(`/api/transactions/${id}/confirm`);
    await loadTransacoes();
    eventService.emit('transactionsChanged'); // <-- ADICIONE ESTA LINHA
    alert('Transação confirmada com sucesso!');
  } catch (error) {
    console.error('Erro ao confirmar transação:', error);
    alert('Erro ao confirmar transação. Tente novamente.');
  }
};


  // Função para editar transação
  const editarTransacao = async (id, dados) => {
    try {
      const response = await apiService.put(`/api/transactions/${id}`, dados);
      if (response.success) {
        await loadTransacoes();
        eventService.emit('transactionsChanged'); // <-- ADICIONE ESTA LINHA
        setIsEditModalOpen(false);
        setSelectedTransacao(null);
        alert('Transação atualizada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      alert('Erro ao editar transação. Tente novamente.');
    }
  };

  // Função para abrir modal de edição
  const abrirModalEdicao = (transacao) => {
    setSelectedTransacao(transacao);
    setEditFormData({
  description: transacao.description,
  amount: (transacao.amount || 0).toString(), // VOLTAR PARA amount
  type: transacao.type, // Simplificado para usar o tipo diretamente
  category: transacao.category,
  transaction_date: transacao.transaction_date,
  status: transacao.status
});

    setIsEditModalOpen(true);
  };

  // Função para excluir transação
  const excluirTransacao = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await apiService.delete(`/api/transactions/${id}`);
        await loadTransacoes(); // Recarregar lista
        eventService.emit('transactionsChanged'); // <-- ADICIONE ESTA LINHA
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
        alert('Erro ao excluir transação. Tente novamente.');
      }
    }
  };

  const buscarCategoryId = (categoriaSelecionada) => {
  const categoriaEncontrada = categorias.find(cat => cat.name === categoriaSelecionada && cat.type === (formData.type === 'income' ? 'entrada' : 'saida'));
  return categoriaEncontrada ? categoriaEncontrada.id : null;

};
  // Função para lidar com submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.amount || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Converter amount para número positivo
    const amount = parseFloat(formData.amount);
    const finalAmount = Math.abs(amount); // Garante que o valor é sempre positivo


    const categoriaSelecionada = categorias.find(cat => cat.name === formData.category && cat.type === (formData.type === 'income' ? 'entrada' : 'saida'));

if (!categoriaSelecionada) {
  alert('Categoria inválida.');
  return;
}

criarTransacao({
  description: formData.description,
  value: finalAmount,
  type: formData.type === 'income' ? 'entrada' : 'saida',
  category_id: buscarCategoryId(formData.category),
  date: formData.transaction_date,
  status: formData.status,
  format: 'variavel',
  payment_form: 'a_vista'
});


  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
  if (field === 'type') {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      category: '' // Se mudar o tipo, zera a categoria
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
};


const [filtroAtivo, setFiltroAtivo] = useState('todas');
const [busca, setBusca] = useState('');
const [dataInicial, setDataInicial] = useState('');
const [dataFinal, setDataFinal] = useState('');


const transacoesFiltradas = Array.isArray(transacoes)
  ? transacoes.filter(transacao => {
      if (!transacao) return false;

      const matchBusca = transacao.description?.toLowerCase().includes(busca.toLowerCase()) ||
                         transacao.category?.toLowerCase().includes(busca.toLowerCase());

      const dataTransacao = new Date(transacao.transaction_date);
      const dataInicio = dataInicial ? new Date(dataInicial) : null;
      const dataFim = dataFinal ? new Date(dataFinal) : null;

      const dentroDoPeriodo = (!dataInicio || dataTransacao >= dataInicio) &&
                              (!dataFim || dataTransacao <= dataFim);

      switch (filtroAtivo) {
        case 'receita':
          return transacao.type === 'income' && matchBusca && dentroDoPeriodo;
        case 'despesa':
          return transacao.type === 'expense' && matchBusca && dentroDoPeriodo;
        case 'pendentes':
          return transacao.status === 'pendente' && matchBusca && dentroDoPeriodo;
        case 'todas':
        default:
          return matchBusca && dentroDoPeriodo;
      }
    })
  : [];


  
  // Calcular totais
const totalReceitas = (Array.isArray(transacoes) ? transacoes : [])
  .filter(t => t.type === 'income' && t.status === 'confirmada')
  .reduce((sum, t) => sum + (t.amount || 0), 0); // VOLTAR PARA amount

const totalDespesas = (Array.isArray(transacoes) ? transacoes : [])
  .filter(t => t.type === 'expense' && t.status === 'confirmada')
  .reduce((sum, t) => sum + (t.amount || 0), 0); // VOLTAR PARA amount

const totalPendentes = (Array.isArray(transacoes) ? transacoes : [])
  .filter(t => t.status === 'pendente')
  .length;

const saldoLiquido = totalReceitas - totalDespesas;



  const getStatusBadge = (status) => {
    return status === 'confirmada' ? 
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Confirmada</Badge> :
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">Pendente</Badge>;
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'income' ? 
  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Receita</Badge> :
  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">Despesa</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100 p-4 sm:p-0">
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
      
        <div className="py-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Lançamentos Financeiros</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas receitas e despesas</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600 ark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Receitas</p>
                    <p className="text-2xl font-bold text-green-600 ark:text-green-400">R$ {totalReceitas.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Despesas</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">R$ {totalDespesas.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${saldoLiquido >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      R$ {saldoLiquido.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Pendentes</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{totalPendentes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

  <Tabs value={filtroAtivo} onValueChange={setFiltroAtivo} className="space-y-6">
   <TabsList className="grid w-full sm:w-auto grid-cols-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="receita">Receitas</TabsTrigger>
                <TabsTrigger value="despesa">Despesas</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              </TabsList>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Filtro de Período */}
            <div className="flex gap-4 items-center">
             <div>
            <Label htmlFor="data_inicial"></Label>
            <Input
            id="data_inicial"
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className="w-36"
            />
            </div>
            <div>
            <Label htmlFor="data_final"></Label>
            <Input
            id="data_final"
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            className="w-36"
            />
            </div>
            </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input
                    placeholder="Buscar transações..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Dialog open={isModalOpen} onOpenChange={(open) => {
  if (open) {
  carregarCategoriasAntesDeAbrir();
  setFormData({
  description: '',
  amount: '',
  type: 'expense', 
  category: '',
  transaction_date: getLocalDate(),
  status: 'pendente'
});

  } else {
    setIsModalOpen(false);
  }
}}>

                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] px-6" aria-describedby="descricaoDialog">
                  <p id="descricaoDialog" className="sr-only">Formulário para criar nova transação financeira.</p>
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-lg font-semibold">Nova Transação</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3">

  
  <div>
  <Label htmlFor="description">Descrição *</Label>
  <Input
    id="description"
    value={formData.description}
    onChange={(e) => handleInputChange('description', e.target.value)}
    placeholder="Ex: Supermercado, Salário..."
    required
  />
</div>

  <div>
    <Label htmlFor="type">Tipo *</Label>
    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="income">Receita</SelectItem>
        <SelectItem value="expense">Despesa</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div>
    <Label htmlFor="category">Categoria *</Label>
<div className="flex items-center gap-2">
  <Select key={formData.type + categorias.length}value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
    <SelectTrigger>
      <SelectValue placeholder="Selecione..." />
    </SelectTrigger>
    <SelectContent className="max-h-[250px] overflow-y-auto">
     {(Array.isArray(categorias) ? categorias : [])
  .filter((cat) => {
  console.log('Tipo selecionado:', formData.type === 'income' ? 'entrada' : 'saida');
  return cat?.type === (formData.type === 'income' ? 'entrada' : 'saida');
})
  .map((cat, index) => (
    <SelectItem key={index} value={cat.name}>
      {cat.name}
    </SelectItem>
))}
    </SelectContent>
  </Select>

  <Input
  type="text"
  placeholder="+"
  className="w-10 h-10 text-center p-0"
  maxLength={1}
onClick={() => {
  if (categoriasLoading) {
  alert('As categorias ainda estão carregando. Tente novamente em instantes.');
  return;
}

if (!formData.type) {
  alert('Por favor, selecione o tipo antes de adicionar uma categoria.');
  return;
}

console.log('👉 Categoria criada:', novaCategoria, 'Tipo:', formData.type === 'income' ? 'entrada' : 'saida');


  const nomeCategoria = prompt('Digite o nome da nova categoria:');
  if (nomeCategoria) {
    adicionarCategoria(nomeCategoria.trim());
  }
}}

  readOnly
/>
</div>

  </div>

  <div>
    <Label htmlFor="amount">Valor *</Label>
    <Input
      id="amount"
      type="number"
      step="0.01"
      value={formData.amount}
      onChange={(e) => handleInputChange('amount', e.target.value)}
      placeholder="0,00"
      required
    />
  </div>

  <div>
    <Label htmlFor="transaction_date">Data</Label>
    <Input
      id="transaction_date"
      type="date"
      value={formData.transaction_date}
      onChange={(e) => handleInputChange('transaction_date', e.target.value)}
    />
  </div>

  <div>
    <Label htmlFor="status">Status</Label>
    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="confirmada">Confirmada</SelectItem>
        <SelectItem value="pendente">Pendente</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <div className="flex justify-between pt-4">
    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
  Cancelar
</Button>
<Button type="submit" className="bg-green-700 hover:bg-green-800">
  Criar Transação
</Button>

  </div>

</form>

                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <TabsContent value={filtroAtivo} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                {filtroAtivo === 'todas' && 'Todas as Transações'}
                {filtroAtivo === 'receita' && 'Receitas'}
                {filtroAtivo === 'despesa' && 'Despesas'}
                {filtroAtivo === 'pendentes' && 'Transações Pendentes'}
                </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(Array.isArray(transacoesFiltradas) ? transacoesFiltradas : []).map((transacao) => (transacao && (
                      <div key={transacao.id} className="border dark:border-slate-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold dark:text-slate-100">{transacao.description}</h3>
                              {getTipoBadge(transacao.type)}
                              {getStatusBadge(transacao.status)}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-2 text-sm text-gray-600 dark:text-slate-400">
                              <div>
                                <p className="font-medium">Categoria</p>
                                <p>{transacao.category || 'Sem categoria'}</p>
                              </div>
                              <div>
                                <p className="font-medium">Data</p>
                                <p>{formatDateForDisplay(transacao.transaction_date)}</p>
                              </div>
                              <div>
  <p className="font-medium">Valor</p>
  <p className={`text-lg font-bold ${transacao.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
    R$ {(transacao.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
  </p>
</div>
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col md:flex-row justify-end gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                            {transacao.status === 'pendente' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => confirmarTransacao(transacao.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmar
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => abrirModalEdicao(transacao)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => excluirTransacao(transacao.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                    ))}
                  </div>

                  {transacoesFiltradas.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-slate-400">Nenhuma transação encontrada</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Modal para Editar Transação */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px] px-6">
              <DialogHeader>
                <DialogTitle>Editar Transação</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!editFormData.description || !editFormData.amount || !editFormData.category) {
                  alert('Por favor, preencha todos os campos obrigatórios.');
                  return;
                }
                
                const amount = parseFloat(editFormData.amount);
                const finalAmount = Math.abs(amount); // Garante que o valor é sempre positivo
                editarTransacao(selectedTransacao.id, {
              ...editFormData,
               value: finalAmount, // Chave alterada para 'value'
              amount: undefined // Remove a chave 'amount' antiga do payload
              });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="edit_description">Descrição *</Label>
                  <Input
                    id="edit_description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Ex: Supermercado, Salário..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_amount">Valor *</Label>
                    <Input
                      id="edit_amount"
                      type="number"
                      step="0.01"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData(prev => ({...prev, amount: e.target.value}))}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_type">Tipo *</Label>
                    <Select value={editFormData.type} onValueChange={(value) => setEditFormData(prev => ({...prev, type: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_category">Categoria *</Label>
                  <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                    {(Array.isArray(categorias) ? categorias : [])
  .filter((cat) => cat.type === editFormData.type === 'income' ? 'entrada' : 'saida')
  .map((cat, index) => (
    <SelectItem key={index} value={cat.name}>
      {cat.name}
    </SelectItem>
))}
                  </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_transaction_date">Data</Label>
                    <Input
                      id="edit_transaction_date"
                      type="date"
                      value={editFormData.transaction_date}
                      onChange={(e) => setEditFormData(prev => ({...prev, transaction_date: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_status">Status</Label>
                    <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({...prev, status: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmada">Confirmada</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
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

export default Transactions;

