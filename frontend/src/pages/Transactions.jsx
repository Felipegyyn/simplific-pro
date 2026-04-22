import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import eventService from '../services/eventService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox'; // <--- IMPORT NOVO
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // <--- IMPORT NOVO
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, Edit, Trash2, 
  Search, Filter, Calendar, CheckCircle, Clock, LogOut, ArrowLeft,
  FileText, RefreshCw, Wallet // <--- Wallet ADICIONADO
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import logo from '../assets/LOGO.png';

const Transactions = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const getLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Data inválida';
    const datePart = dateString.split('T')[0];
    const localDate = new Date(`${datePart}T12:00:00`);
    return localDate.toLocaleDateString();
  };

  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTransacao, setSelectedTransacao] = useState(null);
  
  // Estados de Contas e Cartões
  const [contas, setContas] = useState([]);
  const [cartoes, setCartoes] = useState([]); // <--- NOVO ESTADO
  const [selectedContas, setSelectedContas] = useState([]); 

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    bank_account_id: 'none',
    credit_card_id: 'none', // <--- NOVO CAMPO
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

      const categoriaData = {
        name: novaCategoria,
        type: (formData.type === 'income' ? 'entrada' : 'saida')
      };

      await apiService.post('/api/categories', categoriaData);
      await loadCategorias();
      setFormData((prev) => ({ ...prev, category: novaCategoria }));
      alert('Categoria cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      alert('Erro ao criar categoria. Tente novamente.');
    }
  };

  const [editFormData, setEditFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    bank_account_id: 'none',
    credit_card_id: 'none', // <--- NOVO CAMPO
    transaction_date: '',
    status: 'pendente'
  });

  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    loadTransacoes();
    loadCategorias();
    loadContas();
    loadCartoes(); // <--- CHAMADA NOVA
  }, []);

  const loadContas = async () => {
    try {
        const data = await apiService.get('/api/bank-accounts');
        setContas(data || []);
    } catch (error) {
        console.error("Erro ao carregar contas:", error);
    }
  };

  const loadCartoes = async () => {
    try {
        const data = await apiService.get('/api/credit-cards');
        setCartoes(data || []);
    } catch (error) {
        console.error("Erro ao carregar cartões:", error);
    }
  };

  const loadTransacoes = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/api/transactions');
      let lista = [];
      if (response && response.data && Array.isArray(response.data.transactions)) {
        lista = response.data.transactions;
      } else if (response && Array.isArray(response.data)) {
        lista = response.data;
      } else if (response && Array.isArray(response.transactions)) {
        lista = response.transactions;
      }
      setTransacoes(Array.isArray(lista) ? lista : []);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      setTransacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      setCategoriasLoading(true);
      const response = await apiService.get('/api/categories');
      setCategorias(response || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategorias([]);
    } finally {
      setCategoriasLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const token = localStorage.getItem('simplific_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/import-statement`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload,
      });
      
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || 'Erro no servidor.');

      setUploadResult({ success: true, message: result.mensagem });
      await loadTransacoes();

    } catch (error) {
      setUploadResult({ success: false, message: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const carregarCategoriasAntesDeAbrir = async () => {
    setCategoriasLoading(true);
    await loadCategorias();
    await loadContas();
    await loadCartoes(); // <--- CARREGA CARTÕES TAMBÉM
    setCategoriasLoading(false);
    setIsModalOpen(true);
  };

  const criarTransacao = async (dadosTransacao) => {
    try {
      await apiService.post('/api/transactions', dadosTransacao);
      await loadTransacoes();
      await loadContas(); 
      eventService.emit('transactionsChanged');
      setIsModalOpen(false);
      
      if (dadosTransacao.type === 'entrada') {
          alert("Valor adicionado com sucesso!");
      } else {
          alert("Transação criada com sucesso!");
      }

      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        bank_account_id: 'none',
        credit_card_id: 'none', // <--- RESET NOVO CAMPO
        transaction_date: getLocalDate(),
        status: 'pendente'
      });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Erro ao criar transação. Tente novamente.');
    }
  };

  // ▼▼▼ NOVA FUNÇÃO PARA LANÇAR NO CARTÃO ▼▼▼
  const criarTransacaoCartao = async (cardId, dados) => {
    try {
      await apiService.post(`/api/credit-cards/${cardId}/transactions`, dados);
      setIsModalOpen(false);
      alert("✅ Gasto lançado no cartão com sucesso!");
      
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        bank_account_id: 'none',
        credit_card_id: 'none',
        transaction_date: getLocalDate(),
        status: 'pendente'
      });
      
      eventService.emit('transactionsChanged'); 
    } catch (error) {
      console.error('Erro ao lançar no cartão:', error);
      alert('Erro ao lançar gasto no cartão. Verifique o limite.');
    }
  };
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  const confirmarTransacao = async (id) => {
    try {
      await apiService.post(`/api/transactions/${id}/confirm`);
      await loadTransacoes();
      await loadContas();
      eventService.emit('transactionsChanged');
      alert('Transação confirmada com sucesso!');
    } catch (error) {
      console.error('Erro ao confirmar transação:', error);
      alert('Erro ao confirmar transação. Tente novamente.');
    }
  };

  const editarTransacao = async (id, dados) => {
    try {
      const response = await apiService.put(`/api/transactions/${id}`, dados);
      if (response) {
        await loadTransacoes();
        eventService.emit('transactionsChanged');
        setIsEditModalOpen(false);
        setSelectedTransacao(null);
        alert('Transação atualizada com sucesso!');
      } else {
        alert('A API não retornou uma confirmação. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      alert('Erro ao editar transação. Tente novamente.');
    }
  };

  const abrirModalEdicao = (transacao) => {
    setSelectedTransacao(transacao);
    setEditFormData({
      description: transacao.description,
      amount: (transacao.amount || 0).toString(),
      type: transacao.type === 'entrada' ? 'income' : 'expense',
      category: transacao.category,
      bank_account_id: transacao.bank_account_id ? transacao.bank_account_id.toString() : 'none', // <--- LINHA ADICIONADA
      transaction_date: transacao.transaction_date,
      status: transacao.status
    });
    setIsEditModalOpen(true);
  };

  const excluirTransacao = async (transacao) => {
    let mensagem = 'Tem certeza que deseja excluir esta transação?';
    if (transacao.status === 'confirmada') {
      mensagem = 'Este lançamento está confirmado e afetará o saldo da conta. Tem certeza que deseja excluir?';
    }

    if (window.confirm(mensagem)) {
      try {
        await apiService.delete(`/api/transactions/${transacao.id}`);
        await loadTransacoes();
        await loadContas();
        eventService.emit('transactionsChanged');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formData.type !== 'credit_card' && (!formData.bank_account_id || formData.bank_account_id === 'none')) {
        if (!window.confirm("Nenhuma conta adicionada, deseja continuar?")) {
            return;
        }
    }

    if (formData.type === 'credit_card' && (!formData.credit_card_id || formData.credit_card_id === 'none')) {
      alert('Por favor, selecione um cartão de crédito.');
      return;
    }

    const amount = parseFloat(formData.amount);
    const finalAmount = Math.abs(amount);

    if (formData.type === 'expense' && formData.bank_account_id && formData.bank_account_id !== 'none') {
        const contaSelecionada = contas.find(c => c.id.toString() === formData.bank_account_id.toString());
        if (contaSelecionada) {
            if (contaSelecionada.balance < finalAmount) {
                if (!window.confirm("Essa conta não tem saldo suficiente, deseja continuar?")) {
                    return;
                }
            }
        }
    }

    const targetType = formData.type === 'income' ? 'entrada' : 'saida';
    const categoriaSelecionada = categorias.find(cat => cat.name === formData.category && cat.type === targetType);

    if (!categoriaSelecionada) {
      alert('Categoria inválida.');
      return;
    }

    if (formData.type === 'credit_card') {
      // Lançar no CARTÃO DE CRÉDITO
      criarTransacaoCartao(parseInt(formData.credit_card_id), {
        description: formData.description,
        value: finalAmount,
        category_id: categoriaSelecionada.id,
        date: formData.transaction_date,
        payment_method: 'a_vista',
        installments: 1
      });
    } else {
      // Lançar como TRANSAÇÃO NORMAL
      criarTransacao({
        description: formData.description,
        value: finalAmount,
        type: targetType,
        category_id: categoriaSelecionada.id,
        bank_account_id: formData.bank_account_id === 'none' ? null : parseInt(formData.bank_account_id),
        date: formData.transaction_date,
        status: formData.status,
        format: 'variavel',
        payment_form: 'a_vista'
      });
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'type') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        category: '' 
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // --- FUNÇÃO PARA ALTERNAR O FILTRO DE CONTAS ---
  const toggleContaFilter = (contaId) => {
    setSelectedContas(prev => 
        prev.includes(contaId) 
            ? prev.filter(id => id !== contaId) 
            : [...prev, contaId]
    );
  };

  const [filtroAtivo, setFiltroAtivo] = useState('todas');
  const [busca, setBusca] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  // --- LÓGICA DE FILTRAGEM ATUALIZADA ---
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

        // Lógica do Filtro de Conta Múltiplo
        const matchConta = selectedContas.length === 0 || 
                           (transacao.bank_account_id && selectedContas.includes(transacao.bank_account_id.toString()));

        const baseMatch = matchBusca && dentroDoPeriodo && matchConta; // <--- INCLUIU matchConta

        switch (filtroAtivo) {
          case 'receita':
            return transacao.type === 'income' && baseMatch;
          case 'despesa':
            return transacao.type === 'expense' && baseMatch;
          case 'pendentes':
            return transacao.status === 'pendente' && baseMatch;
          case 'todas':
          default:
            return baseMatch;
        }
      })
    : [];

  const { totalReceitas, totalDespesas, totalPendentes } = useMemo(() => {
    let receitas = 0;
    let despesas = 0;
    let pendentes = 0;

    for (const t of transacoesFiltradas) {
      if (t.status === 'confirmada') {
        if (t.type === 'income') {
          receitas += (t.amount || 0);
        } else if (t.type === 'expense') {
          despesas += (t.amount || 0);
        }
      }
      if (t.status === 'pendente') {
        pendentes++;
      }
    }
    return { totalReceitas: receitas, totalDespesas: despesas, totalPendentes: pendentes };
  }, [transacoesFiltradas]);

  const saldoLiquido = totalReceitas - totalDespesas;

  const { receitasPendentes, despesasPendentes } = useMemo(() => {
    const pending = transacoes.filter(t => t.status === 'pendente');
    const receitas = pending.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const despesas = pending.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    return { receitasPendentes: receitas, despesasPendentes: despesas };
  }, [transacoes]);

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

  const getRowBorderClass = (transacao) => {
    if (transacao.status === 'pendente') return 'border-l-4 border-l-orange-400';
    return transacao.type === 'income' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100 p-4 sm:p-0">
      <header className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm border-b">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">Bem-vindo, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </div>
          </div>
      </header>

      <div className="py-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Lançamentos Financeiros</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie suas receitas e despesas</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0"><TrendingUp className="h-8 w-8 text-green-600 ark:text-green-400" /></div>
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
                  <div className="flex-shrink-0"><TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" /></div>
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
                  <div className="flex-shrink-0"><DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" /></div>
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
                  <div className="flex-shrink-0"><Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" /></div>
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
              <div className="flex gap-4 items-center">
                <div>
                  <Label htmlFor="data_inicial"></Label>
                  <Input id="data_inicial" type="date" value={dataInicial} onChange={(e) => setDataInicial(e.target.value)} className="w-36" />
                </div>
                <div>
                  <Label htmlFor="data_final"></Label>
                  <Input id="data_final" type="date" value={dataFinal} onChange={(e) => setDataFinal(e.target.value)} className="w-36" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
                
                {/* ▼▼▼ NOVO BOTÃO DE FILTRAR CONTAS ▼▼▼ */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="border-dashed h-10">
                            <Wallet className="h-4 w-4 mr-2" />
                            Contas
                            {selectedContas.length > 0 && (
                                <span className="ml-2 rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-xs font-bold">
                                    {selectedContas.length}
                                </span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-3" align="end">
                        <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-500 mb-2">Filtrar por Conta:</h4>
                            {contas.length === 0 ? (
                                <p className="text-xs text-gray-400">Nenhuma conta cadastrada.</p>
                            ) : (
                                contas.map(conta => (
                                    <div key={conta.id} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`filter-conta-${conta.id}`} 
                                            checked={selectedContas.includes(conta.id.toString())}
                                            onCheckedChange={() => toggleContaFilter(conta.id.toString())}
                                        />
                                        <label 
                                            htmlFor={`filter-conta-${conta.id}`} 
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                        >
                                            {conta.bank_name}
                                        </label>
                                    </div>
                                ))
                            )}
                            {selectedContas.length > 0 && (
                                <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-8" onClick={() => setSelectedContas([])}>
                                    Limpar Filtro
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
                {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                  <Input placeholder="Buscar transações..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-10 w-full sm:w-64" />
                </div>
                
                <Dialog open={isModalOpen} onOpenChange={(open) => {
                  if (open) {
                    carregarCategoriasAntesDeAbrir();
                    setFormData({
                      description: '',
                      amount: '',
                      type: 'expense', 
                      category: '',
                      bank_account_id: 'none',
                      credit_card_id: 'none', // <--- RESET NOVO CAMPO
                      transaction_date: getLocalDate(),
                      status: 'pendente'
                    });
                  } else {
                    setIsModalOpen(false);
                  }
                }}>
                  <DialogTrigger asChild>
                  <Button size="icon" className="w-10 h-10 bg-green-700 hover:bg-green-800" title="Novo Lançamento">
                  <Plus className="h-6 w-6" />
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
                        <Input id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Ex: Supermercado, Salário..." required />
                      </div>

                      <div>
                        <Label htmlFor="type">Tipo *</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Receita</SelectItem>
                            <SelectItem value="expense">Despesa</SelectItem>
                            <SelectItem value="credit_card">💳 Cartão de Crédito</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Campo Cartão de Crédito - SÓ APARECE SE TIPO FOR credit_card */}
                      {formData.type === 'credit_card' && (
                        <div>
                          <Label htmlFor="credit_card">Selecione o Cartão *</Label>
                          <Select value={formData.credit_card_id} onValueChange={(val) => handleInputChange('credit_card_id', val)}>
                              <SelectTrigger>
                                  <SelectValue placeholder="Selecione um cartão" />
                              </SelectTrigger>
                              <SelectContent>
                                  {cartoes.map(cartao => (
                                      <SelectItem key={cartao.id} value={cartao.id.toString()}>
                                          {cartao.name} (Final {cartao.last_digits})
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Campo Conta Bancária */}
                      <div className={formData.type === 'credit_card' ? 'opacity-50 pointer-events-none' : ''}>
                        <Label htmlFor="bank_account">Conta Bancária (Opcional)</Label>
                        <Select 
                          disabled={formData.type === 'credit_card'} 
                          value={formData.type === 'credit_card' ? 'none' : formData.bank_account_id} 
                          onValueChange={(val) => handleInputChange('bank_account_id', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma conta" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                {contas.map(conta => (
                                    <SelectItem key={conta.id} value={conta.id.toString()}>
                                        {conta.bank_name} - Ag: {conta.agency} CC: {conta.account_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <div className="flex items-center gap-2">
                          <Select key={formData.type + categorias.length} value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent className="max-h-[250px] overflow-y-auto">
                              {(Array.isArray(categorias) ? categorias : [])
                                .filter((cat) => {
                                  // Se for Receita, mostra entrada. Se for Despesa ou Cartão, mostra saida.
                                  const targetType = formData.type === 'income' ? 'entrada' : 'saida';
                                  return cat?.type === targetType;
                                })
                                .map((cat, index) => (
                                  <SelectItem key={index} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Input
                            type="text" placeholder="+" className="w-10 h-10 text-center p-0" maxLength={1}
                            onClick={() => {
                              if (categoriasLoading) { alert('As categorias ainda estão carregando. Tente novamente em instantes.'); return; }
                              if (!formData.type) { alert('Por favor, selecione o tipo antes de adicionar uma categoria.'); return; }
                              const nomeCategoria = prompt('Digite o nome da nova categoria:');
                              if (nomeCategoria) { adicionarCategoria(nomeCategoria.trim()); }
                            }}
                            readOnly
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="amount">Valor *</Label>
                        <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0,00" required />
                      </div>

                      <div>
                        <Label htmlFor="transaction_date">Data</Label>
                        <Input id="transaction_date" type="date" value={formData.transaction_date} onChange={(e) => handleInputChange('transaction_date', e.target.value)} />
                      </div>

                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmada">Confirmada</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-green-700 hover:bg-green-800">Criar Transação</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button variant="outline" size="icon" className="w-10 h-10 ml-2" onClick={() => fileInputRef.current.click()} disabled={isUploading} title="Importar Extrato">
                {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
              </div>
            </div>

            {uploadResult && (
              <div className={`p-3 rounded-md text-sm mb-4 ${uploadResult.success ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                {uploadResult.message}
              </div>
            )}

            <TabsContent value={filtroAtivo} className="space-y-4">
              {/* ── helper: linha de lançamento ── */}
              {(() => {
                const LancamentoRow = ({ transacao, showTipo }) => (
                  <div className={`${getRowBorderClass(transacao)} bg-white dark:bg-slate-800/30 rounded-r-lg px-4 py-3 flex flex-col sm:flex-row justify-between items-start hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors`}>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm dark:text-slate-100">{transacao.description}</h3>
                        {showTipo && getTipoBadge(transacao.type)}
                        {getStatusBadge(transacao.status)}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                        <span><span className="font-medium">Categoria:</span> {transacao.category || 'Sem categoria'}</span>
                        <span><span className="font-medium">Conta:</span> {transacao.account_label || '---'}</span>
                        <span><span className="font-medium">Data:</span> {formatDateForDisplay(transacao.transaction_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 sm:mt-0 sm:ml-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`text-base font-bold whitespace-nowrap ${transacao.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {(transacao.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex gap-1">
                        {transacao.status === 'pendente' && (
                          <Button variant="outline" size="sm" onClick={() => confirmarTransacao(transacao.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Confirmar
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(transacao)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => excluirTransacao(transacao)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );

                const receitasFiltradas = transacoesFiltradas.filter(t => t?.type === 'income');
                const despesasFiltradas = transacoesFiltradas.filter(t => t?.type === 'expense');

                if (filtroAtivo === 'todas') {
                  return (
                    <>
                      {/* ── CARD RECEITAS ── */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                            <TrendingUp className="h-5 w-5" />
                            Receitas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {receitasFiltradas.length > 0
                            ? receitasFiltradas.map(t => <LancamentoRow key={t.id} transacao={t} showTipo={false} />)
                            : <p className="text-center text-sm text-gray-500 dark:text-slate-400 py-4">Nenhuma receita encontrada</p>
                          }
                        </CardContent>
                      </Card>

                      {/* ── CARD DESPESAS ── */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <TrendingDown className="h-5 w-5" />
                            Despesas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {despesasFiltradas.length > 0
                            ? despesasFiltradas.map(t => <LancamentoRow key={t.id} transacao={t} showTipo={false} />)
                            : <p className="text-center text-sm text-gray-500 dark:text-slate-400 py-4">Nenhuma despesa encontrada</p>
                          }
                        </CardContent>
                      </Card>
                    </>
                  );
                }

                // Abas: receita / despesa / pendentes
                const titulo = filtroAtivo === 'receita' ? 'Receitas'
                             : filtroAtivo === 'despesa' ? 'Despesas'
                             : 'Transações Pendentes';

                return (
                  <Card>
                    <CardHeader className="pb-3">
                      {filtroAtivo === 'pendentes' ? (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <CardTitle>{titulo}</CardTitle>
                          <div className="flex items-center gap-4">
                            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                              <p className="text-xs font-medium text-green-700 dark:text-green-300">Receitas</p>
                              <p className="text-lg font-bold text-green-600">
                                R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                              <p className="text-xs font-medium text-red-700 dark:text-red-300">Despesas</p>
                              <p className="text-lg font-bold text-red-600">
                                R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <CardTitle>{titulo}</CardTitle>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {transacoesFiltradas.length > 0
                        ? transacoesFiltradas.map(t => t && <LancamentoRow key={t.id} transacao={t} showTipo={filtroAtivo === 'pendentes'} />)
                        : <p className="text-center text-sm text-gray-500 dark:text-slate-400 py-6">Nenhuma transação encontrada</p>
                      }
                    </CardContent>
                  </Card>
                );
              })()}
            </TabsContent>
          </Tabs>

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
                const tipoSelecionado = editFormData.type === 'income' ? 'entrada' : 'saida';
                const categoriaObj = categorias.find(cat => cat.name === editFormData.category && cat.type === tipoSelecionado);
                if (!categoriaObj) { alert('Categoria inválida. Por favor, selecione uma da lista.'); return; }
                
                const payload = {
                  description: editFormData.description,
                  value: Math.abs(parseFloat(editFormData.amount)),
                  type: tipoSelecionado,
                  category_id: categoriaObj.id,
                  bank_account_id: editFormData.bank_account_id === 'none' ? null : parseInt(editFormData.bank_account_id), // <--- LINHA ADICIONADA
                  date: editFormData.transaction_date,
                  status: editFormData.status
                };
                editarTransacao(selectedTransacao.id, payload);
              }} className="space-y-4">
                <div>
                  <Label htmlFor="edit_description">Descrição *</Label>
                  <Input id="edit_description" value={editFormData.description} onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_amount">Valor *</Label>
                    <Input id="edit_amount" type="number" step="0.01" value={editFormData.amount} onChange={(e) => setEditFormData(prev => ({...prev, amount: e.target.value}))} required />
                  </div>
                  <div>
                    <Label htmlFor="edit_type">Tipo *</Label>
                    <Select value={editFormData.type} onValueChange={(value) => setEditFormData(prev => ({...prev, type: value}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* ▼▼▼ NOVO CAMPO DE CONTA BANCÁRIA NA EDIÇÃO ▼▼▼ */}
                <div>
                  <Label htmlFor="edit_bank_account">Conta Bancária (Opcional)</Label>
                  <Select value={editFormData.bank_account_id} onValueChange={(value) => setEditFormData(prev => ({...prev, bank_account_id: value}))}>
                      <SelectTrigger>
                          <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {contas.map(conta => (
                              <SelectItem key={conta.id} value={conta.id.toString()}>
                                  {conta.bank_name} - Ag: {conta.agency} CC: {conta.account_number}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                {/* ▲▲▲ FIM DO NOVO CAMPO ▲▲▲ */}

                <div>
                  <Label htmlFor="edit_category">Categoria *</Label>
                  <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="max-h-[250px] overflow-y-auto">
                      {(Array.isArray(categorias) ? categorias : [])
                        .filter((cat) => cat.type === (editFormData.type === 'income' ? 'entrada' : 'saida'))
                        .map((cat, index) => <SelectItem key={index} value={cat.name}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_transaction_date">Data</Label>
                    <Input id="edit_transaction_date" type="date" value={editFormData.transaction_date} onChange={(e) => setEditFormData(prev => ({...prev, transaction_date: e.target.value}))} />
                  </div>
                  <div>
                    <Label htmlFor="edit_status">Status</Label>
                    <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({...prev, status: value}))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmada">Confirmada</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </div>
  );
};

export default Transactions;