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
import { cn } from "@/lib/utils";
import apiService from '../services/api';
import logo from '../assets/LOGO.png';
import styles from './Transactions.module.css';

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
    <div className={styles.pageContainer}>
      <header className="glass-panel rounded-none border-x-0 border-t-0 border-white/5 sticky top-0 z-10 print:hidden">
        <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')} 
                className="mr-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 hidden sm:block">Bem-vindo, {user.name}</span>
              <Button variant="outline" size="sm" onClick={onLogout} className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[100%] mx-auto p-4 sm:p-6 lg:p-8">
        <div className={styles.header}>
          <div>
            <h2 className={styles.pageTitle}>
              Lançamentos Financeiros
            </h2>
            <p className={styles.pageSubtitle}>Gerencie suas receitas e despesas com precisão tecnológica</p>
          </div>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxSuccess}>
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Total Receitas</p>
              <p className={styles.summaryValue}>R$ {totalReceitas.toLocaleString()}</p>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxDanger}>
                  <TrendingDown className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Total Despesas</p>
              <p className={styles.summaryValue}>R$ {totalDespesas.toLocaleString()}</p>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxPrimary}>
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Saldo Líquido</p>
              <p className={cn(styles.summaryValue, saldoLiquido >= 0 ? styles.textSuccess : styles.textDanger)}>
                R$ {saldoLiquido.toLocaleString()}
              </p>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxWarning}>
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Pendentes</p>
              <p className={styles.summaryValue}>{totalPendentes}</p>
            </div>
          </div>
        </div>

        <Tabs value={filtroAtivo} onValueChange={setFiltroAtivo} className="space-y-6">
          <TabsList className={styles.tabsList + " mb-6"}>
              <TabsTrigger value="todas" className={styles.tabsTrigger}>Todas</TabsTrigger>
              <TabsTrigger value="receita" className={styles.tabsTrigger}>Receitas</TabsTrigger>
              <TabsTrigger value="despesa" className={styles.tabsTrigger}>Despesas</TabsTrigger>
              <TabsTrigger value="pendentes" className={styles.tabsTrigger}>Pendentes</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-4 border-white/5">
            <div className="flex gap-2 items-center">
              <Input 
                type="date" 
                value={dataInicial} 
                onChange={(e) => setDataInicial(e.target.value)} 
                className="w-36 glass-panel border-white/10 text-xs h-9" 
              />
              <span className="text-slate-500">até</span>
              <Input 
                type="date" 
                value={dataFinal} 
                onChange={(e) => setDataFinal(e.target.value)} 
                className="w-36 glass-panel border-white/10 text-xs h-9" 
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
              <Popover>
                  <PopoverTrigger asChild>
                      <Button variant="outline" className="border-white/10 hover:bg-white/5 text-slate-600 dark:text-slate-300 h-9">
                          <Wallet className="h-4 w-4 mr-2" />
                          Contas
                          {selectedContas.length > 0 && (
                              <Badge className="ml-2 bg-cyan-500/20 text-cyan-400 border-none h-5">
                                  {selectedContas.length}
                              </Badge>
                          )}
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 glass-panel border-white/10 text-slate-200 p-3" align="end">
                      <div className="space-y-2">
                          <h4 className="font-medium text-xs text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Filtrar por Conta:</h4>
                          {contas.length === 0 ? (
                              <p className="text-xs text-slate-500 italic">Nenhuma conta cadastrada.</p>
                          ) : (
                              contas.map(conta => (
                                  <div key={conta.id} className="flex items-center space-x-2 p-1 hover:bg-white/5 rounded transition-colors cursor-pointer" onClick={() => toggleContaFilter(conta.id.toString())}>
                                      <Checkbox 
                                          id={`filter-conta-${conta.id}`} 
                                          checked={selectedContas.includes(conta.id.toString())}
                                          onCheckedChange={() => {}}
                                          className="border-white/20 data-[state=checked]:bg-cyan-500"
                                      />
                                      <label className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer flex-1">
                                          {conta.bank_name}
                                      </label>
                                  </div>
                              ))
                          )}
                          {selectedContas.length > 0 && (
                              <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10" onClick={() => setSelectedContas([])}>
                                  Limpar Filtro
                              </Button>
                          )}
                      </div>
                  </PopoverContent>
              </Popover>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
                <Input 
                  placeholder="Buscar lançamentos..." 
                  value={busca} 
                  onChange={(e) => setBusca(e.target.value)} 
                  className="pl-10 w-full sm:w-64 glass-panel border-white/10 text-sm h-9" 
                />
              </div>
              
              <div className="flex gap-2">
                <Dialog open={isModalOpen} onOpenChange={(open) => {
                  if (open) {
                    carregarCategoriasAntesDeAbrir();
                  } else {
                    setIsModalOpen(false);
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-900/20 h-9 px-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Lançamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]" aria-describedby="descricaoDialog">
                    <DialogHeader className="mb-4">
                      <DialogTitle className="text-white">Novo Lançamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-600 dark:text-slate-300">Descrição *</Label>
                        <Input id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Ex: Supermercado, Salário..." required className="glass-panel border-white/10" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type" className="text-slate-600 dark:text-slate-300">Tipo *</Label>
                          <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                            <SelectTrigger className="glass-panel border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent className="glass-panel border-white/10">
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                              <SelectItem value="credit_card">💳 Cartão de Crédito</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-slate-600 dark:text-slate-300">Valor *</Label>
                          <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0,00" required className="glass-panel border-white/10" />
                        </div>
                      </div>

                      {formData.type === 'credit_card' && (
                        <div className="space-y-2">
                          <Label htmlFor="credit_card" className="text-slate-600 dark:text-slate-300">Selecione o Cartão *</Label>
                          <Select value={formData.credit_card_id} onValueChange={(val) => handleInputChange('credit_card_id', val)}>
                              <SelectTrigger className="glass-panel border-white/10">
                                  <SelectValue placeholder="Selecione um cartão" />
                              </SelectTrigger>
                              <SelectContent className="glass-panel border-white/10">
                                  {cartoes.map(cartao => (
                                      <SelectItem key={cartao.id} value={cartao.id.toString()}>
                                          {cartao.name} (Final {cartao.last_digits})
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className={formData.type === 'credit_card' ? 'opacity-50 pointer-events-none' : 'space-y-2'}>
                        <Label htmlFor="bank_account" className="text-slate-600 dark:text-slate-300">Conta Bancária (Opcional)</Label>
                        <Select 
                          disabled={formData.type === 'credit_card'} 
                          value={formData.type === 'credit_card' ? 'none' : formData.bank_account_id} 
                          onValueChange={(val) => handleInputChange('bank_account_id', val)}
                        >
                            <SelectTrigger className="glass-panel border-white/10">
                                <SelectValue placeholder="Selecione uma conta" />
                            </SelectTrigger>
                            <SelectContent className="glass-panel border-white/10">
                                <SelectItem value="none">Nenhuma</SelectItem>
                                {contas.map(conta => (
                                    <SelectItem key={conta.id} value={conta.id.toString()}>
                                        {conta.bank_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-slate-600 dark:text-slate-300">Categoria *</Label>
                        <div className="flex items-center gap-2">
                          <Select key={formData.type + categorias.length} value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                            <SelectTrigger className="glass-panel border-white/10 flex-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent className="glass-panel border-white/10 max-h-[250px]">
                              {(Array.isArray(categorias) ? categorias : [])
                                .filter((cat) => {
                                  const targetType = formData.type === 'income' ? 'entrada' : 'saida';
                                  return cat?.type === targetType;
                                })
                                .map((cat, index) => (
                                  <SelectItem key={index} value={cat.name}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button 
                            type="button" 
                            variant="outline" 
                            className="w-10 h-10 border-white/10 hover:bg-white/5"
                            onClick={() => {
                              if (categoriasLoading) return;
                              if (!formData.type) { alert('Selecione o tipo primeiro.'); return; }
                              const nome = prompt('Nova categoria:');
                              if (nome) adicionarCategoria(nome.trim());
                            }}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="transaction_date" className="text-slate-600 dark:text-slate-300">Data</Label>
                          <Input id="transaction_date" type="date" value={formData.transaction_date} onChange={(e) => handleInputChange('transaction_date', e.target.value)} className="glass-panel border-white/10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-slate-600 dark:text-slate-300">Status</Label>
                          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                            <SelectTrigger className="glass-panel border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent className="glass-panel border-white/10">
                              <SelectItem value="confirmada">Confirmada</SelectItem>
                              <SelectItem value="pendente">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-white">Cancelar</Button>
                        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Criar Transação</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="w-9 h-9 border-white/10 hover:bg-white/5 text-slate-600 dark:text-slate-300" 
                  onClick={() => fileInputRef.current.click()} 
                  disabled={isUploading} 
                  title="Importar Extrato"
                >
                  {isUploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                </Button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
              </div>
            </div>
          </div>

          {uploadResult && (
            <div className={`p-4 rounded-lg text-sm mb-6 glass-panel border-white/10 ${uploadResult.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              <div className="flex items-center gap-2">
                {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
                {uploadResult.message}
              </div>
            </div>
          )}

          <TabsContent value={filtroAtivo} className="space-y-6">
            {(() => {
              const LancamentoRow = ({ transacao, showTipo }) => {
                let borderStyle = '';
                if (transacao.status === 'pendente') {
                  borderStyle = styles.transactionRowWarning;
                } else if (transacao.type === 'income') {
                  borderStyle = styles.transactionRowSuccess;
                } else {
                  borderStyle = styles.transactionRowDanger;
                }

                return (
                <div className={`${styles.transactionRow} ${borderStyle} group`}>
                  <div className="flex-1 z-10 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-white">{transacao.description}</h3>
                      {showTipo && (
                        <Badge className={`border-none text-[10px] uppercase font-bold px-1.5 py-0 ${transacao.type === 'income' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                          {transacao.type === 'income' ? 'Receita' : 'Despesa'}
                        </Badge>
                      )}
                      <Badge className={`border-none text-[10px] uppercase font-bold px-1.5 py-0 ${transacao.status === 'confirmada' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                        {transacao.status === 'confirmada' ? 'Confirmada' : 'Pendente'}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-500">
                      <span><span className="font-medium text-slate-600 dark:text-slate-400">Categoria:</span> {transacao.category || 'Sem categoria'}</span>
                      <span><span className="font-medium text-slate-600 dark:text-slate-400">Conta:</span> {transacao.account_label || '---'}</span>
                      <span><span className="font-medium text-slate-600 dark:text-slate-400">Data:</span> {formatDateForDisplay(transacao.transaction_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4 sm:mt-0 sm:ml-4 w-full sm:w-auto justify-between sm:justify-end z-10">
                    <span className={`text-lg font-bold whitespace-nowrap ${transacao.type === 'income' ? styles.textSuccess : styles.textDanger}`}>
                      R$ {(transacao.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="flex gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {transacao.status === 'pendente' && (
                        <Button variant="ghost" size="sm" onClick={() => confirmarTransacao(transacao.id)} className="h-8 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 px-2">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Confirmar</span>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => abrirModalEdicao(transacao)} className="h-8 w-8 p-0 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => excluirTransacao(transacao)} className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:text-rose-300">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )};

              const receitasFiltradas = transacoesFiltradas.filter(t => t?.type === 'income');
              const despesasFiltradas = transacoesFiltradas.filter(t => t?.type === 'expense');

              if (filtroAtivo === 'todas') {
                return (
                  <div className={styles.mainGrid}>
                    {/* ── CARD RECEITAS ── */}
                    <div className={styles.premiumCard + " h-fit"}>
                      <div className={styles.cardHeader}>
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <TrendingUp className="h-5 w-5" />
                          <h4 className="font-semibold uppercase tracking-wider text-sm">Receitas</h4>
                        </div>
                      </div>
                      <div className={styles.cardContent + " pt-0 space-y-3"}>
                        {receitasFiltradas.length > 0
                          ? receitasFiltradas.map(t => <LancamentoRow key={t.id} transacao={t} showTipo={false} />)
                          : <div className={styles.emptyState}>Nenhuma receita encontrada</div>
                        }
                      </div>
                    </div>

                    {/* ── CARD DESPESAS ── */}
                    <div className={styles.premiumCard + " h-fit"}>
                      <div className={styles.cardHeader}>
                        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                          <TrendingDown className="h-5 w-5" />
                          <h4 className="font-semibold uppercase tracking-wider text-sm">Despesas</h4>
                        </div>
                      </div>
                      <div className={styles.cardContent + " pt-0 space-y-3"}>
                        {despesasFiltradas.length > 0
                          ? despesasFiltradas.map(t => <LancamentoRow key={t.id} transacao={t} showTipo={false} />)
                          : <div className={styles.emptyState}>Nenhuma despesa encontrada</div>
                        }
                      </div>
                    </div>
                  </div>
                );
              }

              const titulo = filtroAtivo === 'receita' ? 'Receitas'
                           : filtroAtivo === 'despesa' ? 'Despesas'
                           : 'Lançamentos Pendentes';

              return (
                <div className={styles.premiumCard}>
                  <div className={styles.cardHeader + " flex-col sm:flex-row items-start sm:items-center"}>
                    <h4 className="font-semibold uppercase tracking-wider text-sm text-slate-800 dark:text-white">{titulo}</h4>
                    {filtroAtivo === 'pendentes' && (
                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[120px]">
                          <p className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-500/70 mb-0.5">Receitas</p>
                          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {receitasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-center min-w-[120px]">
                          <p className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-500/70 mb-0.5">Despesas</p>
                          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                            R$ {despesasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardContent + " pt-0"}>
                    <div className="grid grid-cols-1 gap-3">
                      {transacoesFiltradas.length > 0
                        ? transacoesFiltradas.map(t => t && <LancamentoRow key={t.id} transacao={t} showTipo={filtroAtivo === 'pendentes'} />)
                        : <div className={styles.emptyState + " col-span-1"}>Nenhum lançamento encontrado</div>
                      }
                    </div>
                  </div>
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Lançamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const tipoSelecionado = editFormData.type === 'income' ? 'entrada' : 'saida';
              const categoriaObj = categorias.find(cat => cat.name === editFormData.category && cat.type === tipoSelecionado);
              const payload = {
                description: editFormData.description,
                value: Math.abs(parseFloat(editFormData.amount)),
                type: tipoSelecionado,
                category_id: categoriaObj?.id,
                bank_account_id: editFormData.bank_account_id === 'none' ? null : parseInt(editFormData.bank_account_id),
                date: editFormData.transaction_date,
                status: editFormData.status
              };
              editarTransacao(selectedTransacao.id, payload);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_description" className="text-slate-600 dark:text-slate-300">Descrição *</Label>
                <Input id="edit_description" value={editFormData.description} onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))} required className="glass-panel border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_amount" className="text-slate-600 dark:text-slate-300">Valor *</Label>
                  <Input id="edit_amount" type="number" step="0.01" value={editFormData.amount} onChange={(e) => setEditFormData(prev => ({...prev, amount: e.target.value}))} required className="glass-panel border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_type" className="text-slate-600 dark:text-slate-300">Tipo *</Label>
                  <Select value={editFormData.type} onValueChange={(value) => setEditFormData(prev => ({...prev, type: value}))}>
                    <SelectTrigger className="glass-panel border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_bank_account" className="text-slate-600 dark:text-slate-300">Conta Bancária</Label>
                <Select value={editFormData.bank_account_id} onValueChange={(value) => setEditFormData(prev => ({...prev, bank_account_id: value}))}>
                    <SelectTrigger className="glass-panel border-white/10">
                        <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {contas.map(conta => (
                            <SelectItem key={conta.id} value={conta.id.toString()}>
                                {conta.bank_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_category" className="text-slate-600 dark:text-slate-300">Categoria *</Label>
                <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger className="glass-panel border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="glass-panel border-white/10 max-h-[250px]">
                    {(Array.isArray(categorias) ? categorias : [])
                      .filter((cat) => cat.type === (editFormData.type === 'income' ? 'entrada' : 'saida'))
                      .map((cat, index) => <SelectItem key={index} value={cat.name}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_transaction_date" className="text-slate-600 dark:text-slate-300">Data</Label>
                  <Input id="edit_transaction_date" type="date" value={editFormData.transaction_date} onChange={(e) => setEditFormData(prev => ({...prev, transaction_date: e.target.value}))} className="glass-panel border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_status" className="text-slate-600 dark:text-slate-300">Status</Label>
                  <Select value={editFormData.status} onValueChange={(value) => setEditFormData(prev => ({...prev, status: value}))}>
                    <SelectTrigger className="glass-panel border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-white">Cancelar</Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar Alterações</Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

export default Transactions;
