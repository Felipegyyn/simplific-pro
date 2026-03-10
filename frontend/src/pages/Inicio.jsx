import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowDownCircle, ArrowUpCircle, Wallet, Clock, CheckCircle } from 'lucide-react'; // <--- NOVOS ÍCONES ADICIONADOS
import apiService from '../services/api';
import eventService from '../services/eventService';

const Inicio = ({ user }) => {
  // --- ESTADOS GERAIS ---
  const [transacoes, setTransacoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DOS FILTROS DA MINI TELA ---
  const dataAtual = new Date();
  const [mesFiltro, setMesFiltro] = useState(dataAtual.getMonth());
  const [anoFiltro, setAnoFiltro] = useState(dataAtual.getFullYear());
  const [abaAtiva, setAbaAtiva] = useState('expense');

  // --- ESTADOS DO MODAL DE NOVO LANÇAMENTO ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    bank_account_id: 'none',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'confirmada'
  });

  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const anos = [2024, 2025, 2026, 2027, 2028];

  // --- CARREGAMENTO DE DADOS ---
  useEffect(() => {
    carregarDados();
    const handleTransactionsChange = () => carregarDados();
    eventService.on('transactionsChanged', handleTransactionsChange);
    return () => eventService.off('transactionsChanged', handleTransactionsChange);
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [transRes, catRes, contasRes] = await Promise.all([
        apiService.get('/api/transactions'),
        apiService.get('/api/categories'),
        apiService.get('/api/bank-accounts')
      ]);

      let listaTransacoes = [];
      if (transRes && transRes.data && Array.isArray(transRes.data.transactions)) {
        listaTransacoes = transRes.data.transactions;
      } else if (transRes && Array.isArray(transRes.data)) {
        listaTransacoes = transRes.data;
      } else if (transRes && Array.isArray(transRes.transactions)) {
        listaTransacoes = transRes.transactions;
      }

      setTransacoes(listaTransacoes);
      setCategorias(catRes || []);
      setContas(contasRes || []);
    } catch (error) {
      console.error("Erro ao carregar dados do Início:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRAGEM DOS DADOS (Confirmadas) ---
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      // Na tela principal mostramos apenas o que já foi confirmado ou tudo do mês selecionado
      if (!t || t.type !== abaAtiva || t.status === 'pendente') return false; 
      const dataTransacao = new Date(t.transaction_date);
      const dataLocal = new Date(dataTransacao.getTime() + dataTransacao.getTimezoneOffset() * 60000);
      return dataLocal.getMonth() === mesFiltro && dataLocal.getFullYear() === anoFiltro;
    }).sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [transacoes, mesFiltro, anoFiltro, abaAtiva]);

  // --- FILTRAGEM DOS DADOS (Pendentes) ---
  const transacoesPendentes = useMemo(() => {
    return transacoes.filter(t => {
      // Traz as pendências do mês selecionado
      if (!t || t.status !== 'pendente') return false;
      const dataTransacao = new Date(t.transaction_date);
      const dataLocal = new Date(dataTransacao.getTime() + dataTransacao.getTimezoneOffset() * 60000);
      return dataLocal.getMonth() === mesFiltro && dataLocal.getFullYear() === anoFiltro;
    }).sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)); // Mais antigas primeiro
  }, [transacoes, mesFiltro, anoFiltro]);

  const totaisDoMes = useMemo(() => {
    let receitas = 0;
    let despesas = 0;
    
    transacoes.forEach(t => {
      if (!t) return;
      const d = new Date(t.transaction_date);
      const dataLocal = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
      
      if (dataLocal.getMonth() === mesFiltro && dataLocal.getFullYear() === anoFiltro && t.status === 'confirmada') {
        if (t.type === 'income') receitas += (t.amount || 0);
        if (t.type === 'expense') despesas += (t.amount || 0);
      }
    });
    return { receitas, despesas };
  }, [transacoes, mesFiltro, anoFiltro]);

  // --- AÇÃO: CONFIRMAR TRANSAÇÃO PENDENTE ---
  const confirmarTransacao = async (id) => {
    try {
      await apiService.post(`/api/transactions/${id}/confirm`);
      await carregarDados();
      eventService.emit('transactionsChanged');
    } catch (error) {
      console.error('Erro ao confirmar transação:', error);
      alert('Erro ao confirmar transação.');
    }
  };

  // --- FUNÇÕES DO MODAL ---
  const handleInputChange = (field, value) => {
    if (field === 'type') {
      setFormData(prev => ({ ...prev, [field]: value, category: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const amount = parseFloat(formData.amount);
    const finalAmount = Math.abs(amount);
    const categoriaObj = categorias.find(cat => cat.name === formData.category && cat.type === (formData.type === 'income' ? 'entrada' : 'saida'));

    if (!categoriaObj) {
      alert('Categoria inválida.');
      return;
    }

    try {
      await apiService.post('/api/transactions', {
        description: formData.description,
        value: finalAmount,
        type: formData.type === 'income' ? 'entrada' : 'saida',
        category_id: categoriaObj.id,
        bank_account_id: formData.bank_account_id === 'none' ? null : parseInt(formData.bank_account_id),
        date: formData.transaction_date,
        status: formData.status,
        format: 'variavel',
        payment_form: 'a_vista'
      });

      await carregarDados();
      eventService.emit('transactionsChanged');
      setIsModalOpen(false);
      setAbaAtiva(formData.type);
      setFormData({ ...formData, description: '', amount: '', category: '' });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Erro ao criar transação.');
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const datePart = dateString.split('T')[0];
    const localDate = new Date(`${datePart}T12:00:00`);
    return localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Visão Geral</h1>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border shadow-sm">
          <Select value={mesFiltro.toString()} onValueChange={(val) => setMesFiltro(parseInt(val))}>
            <SelectTrigger className="w-[120px] border-none shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes, index) => (
                <SelectItem key={index} value={index.toString()}>{mes}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-6 w-px bg-border mx-1"></div>
          <Select value={anoFiltro.toString()} onValueChange={(val) => setAnoFiltro(parseInt(val))}>
            <SelectTrigger className="w-[90px] border-none shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA (LANÇAMENTOS + PENDÊNCIAS) */}
        <div className="col-span-1 flex flex-col gap-6 h-full">
          
          {/* 1. MINI TELA DE LANÇAMENTOS */}
          <Card className="border-border shadow-sm flex flex-col flex-1 min-h-0">
            <CardHeader className="pb-4 border-b">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Lançamentos
                </CardTitle>
                
                {/* MODAL DE NOVO LANÇAMENTO */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Lançamento Rápido</DialogTitle>
                    </DialogHeader>
                    {/* ... (Formulário do modal mantido igual) ... */}
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo</Label>
                          <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Valor</Label>
                          <Input type="number" step="0.01" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0,00" required />
                        </div>
                      </div>
                      <div>
                        <Label>Descrição</Label>
                        <Input value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Ex: Mercado" required />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select value={formData.category} onValueChange={(val) => handleInputChange('category', val)}>
                          <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {categorias.filter(c => c.type === (formData.type === 'income' ? 'entrada' : 'saida')).map((cat, idx) => (
                              <SelectItem key={idx} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Conta (Opcional)</Label>
                        <Select value={formData.bank_account_id} onValueChange={(val) => handleInputChange('bank_account_id', val)}>
                          <SelectTrigger><SelectValue placeholder="Selecione a conta" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {contas.map(conta => (
                              <SelectItem key={conta.id} value={conta.id.toString()}>{conta.bank_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Confirmar Lançamento</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex justify-between items-center text-sm px-1 mb-2">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                  <ArrowUpCircle className="h-4 w-4" /> R$ {totaisDoMes.receitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 font-medium">
                  <ArrowDownCircle className="h-4 w-4" /> R$ {totaisDoMes.despesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
              </div>

              <div className="flex rounded-lg bg-muted p-1">
                <button
                  onClick={() => setAbaAtiva('expense')}
                  className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${abaAtiva === 'expense' ? 'bg-white dark:bg-slate-800 shadow-sm text-red-600 dark:text-red-400' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Despesas
                </button>
                <button
                  onClick={() => setAbaAtiva('income')}
                  className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${abaAtiva === 'income' ? 'bg-white dark:bg-slate-800 shadow-sm text-green-600 dark:text-green-400' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Receitas
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-border">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : transacoesFiltradas.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Nenhum lançamento confirmado.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {transacoesFiltradas.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-muted/30 transition-colors flex justify-between items-center">
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate text-foreground">{t.description}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{formatDateForDisplay(t.transaction_date)}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground truncate max-w-[100px]">
                            {t.category || 'Outros'}
                          </span>
                        </div>
                      </div>
                      <div className={`font-semibold text-sm whitespace-nowrap ml-3 ${abaAtiva === 'income' ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                        {abaAtiva === 'expense' ? '-' : '+'} R$ {(t.amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. MINI TELA DE PENDÊNCIAS */}
          <Card className="border-border shadow-sm flex flex-col h-[280px] shrink-0">
            <CardHeader className="py-3 px-4 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Lançamentos Pendentes
                </CardTitle>
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {transacoesPendentes.length}
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-y-auto flex-1 min-h-0 scrollbar-thin scrollbar-thumb-border">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : transacoesPendentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <CheckCircle className="h-8 w-8 text-green-500/50 mb-2" />
                  <p className="text-muted-foreground text-sm font-medium">Tudo em dia!</p>
                  <p className="text-xs text-muted-foreground/70">Nenhuma pendência para este mês.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {transacoesPendentes.map((t) => (
                    <div key={t.id} className="p-3 hover:bg-muted/30 transition-colors flex justify-between items-center group">
                      <div className="flex flex-col overflow-hidden flex-1 mr-2">
                        <span className="text-sm font-medium truncate text-foreground">{t.description}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                            {t.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                          <span className="text-xs text-muted-foreground">• {formatDateForDisplay(t.transaction_date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {(t.amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </span>
                        
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-full text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/30"
                          onClick={() => confirmarTransacao(t.id)}
                          title="Confirmar lançamento"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ÁREA RESERVADA (COLUNAS DIREITAS) */}
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-full flex items-center justify-center min-h-[724px]">
            <p className="text-muted-foreground text-center">
              Espaço reservado para os próximos painéis (Gráficos, Constância, etc.)
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Inicio;