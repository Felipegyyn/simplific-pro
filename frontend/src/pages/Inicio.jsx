import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowDownCircle, ArrowUpCircle, Wallet, Clock, CheckCircle, Landmark, CreditCard, Edit, Trash2, Calendar, Target, DollarSign  } from 'lucide-react';
import apiService from '../services/api';
import eventService from '../services/eventService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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

  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [selectedCartao, setSelectedCartao] = useState(null);
  const [gastoFormData, setGastoFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'a_vista',
    installments: 1
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
      const [transRes, catRes, contasRes, cartoesRes, agendaRes, metasRes] = await Promise.all([
        apiService.get('/api/transactions'),
        apiService.get('/api/categories'),
        apiService.get('/api/bank-accounts'),
        apiService.get('/api/credit-cards'),
        apiService.get('/api/schedule'), // <-- Busca Agenda
        apiService.get('/api/goals')     // <-- Busca Metas
      ]);

      // ... (código de transações mantido igual)
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
      setEventos(Array.isArray(agendaRes) ? agendaRes : []);
      setMetas(Array.isArray(metasRes) ? metasRes : []);
      
      // Formata os cartões igual ao CreditCards.jsx
      if (Array.isArray(cartoesRes)) {
        setCartoes(cartoesRes.map(c => ({
          ...c,
          usado: c.limit - c.available_limit,
          disponivel: Number(c.available_limit) || 0
        })));
      }
    } catch (error) {
      console.error("Erro ao carregar dados do Início:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTRAGEM DOS DADOS (Confirmadas) ---
  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter(t => {
      if (!t || t.type !== abaAtiva || t.status === 'pendente') return false; 
      const dataTransacao = new Date(t.transaction_date);
      const dataLocal = new Date(dataTransacao.getTime() + dataTransacao.getTimezoneOffset() * 60000);
      return dataLocal.getMonth() === mesFiltro && dataLocal.getFullYear() === anoFiltro;
    }).sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  }, [transacoes, mesFiltro, anoFiltro, abaAtiva]);

  // --- FILTRAGEM DOS DADOS (Pendentes) ---
  const transacoesPendentes = useMemo(() => {
    return transacoes.filter(t => {
      if (!t || t.status !== 'pendente') return false;
      const dataTransacao = new Date(t.transaction_date);
      const dataLocal = new Date(dataTransacao.getTime() + dataTransacao.getTimezoneOffset() * 60000);
      return dataLocal.getMonth() === mesFiltro && dataLocal.getFullYear() === anoFiltro;
    }).sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date)); 
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

  // --- LÓGICA DO GRÁFICO DE SALDO POR CONTA ---
  const dadosGraficoSaldos = useMemo(() => {
    const saldosContas = contas.map(c => ({
      name: c.bank_name,
      value: parseFloat(c.balance) || 0,
      fill: '#0ea5e9' 
    }));

    let receitasSoltas = 0;
    let despesasSoltas = 0;
    
    transacoes.forEach(t => {
      if (t && t.status === 'confirmada' && !t.bank_account_id) {
        if (t.type === 'income') receitasSoltas += (t.amount || 0);
        if (t.type === 'expense') despesasSoltas += (t.amount || 0);
      }
    });
    
    const saldoSolto = receitasSoltas - despesasSoltas;

    if (saldoSolto !== 0) {
      saldosContas.push({
        name: 'S/ Conta Específica',
        value: saldoSolto,
        fill: '#94a3b8' 
      });
    }

    return saldosContas;
  }, [contas, transacoes]);

  const saldoTotalGlobal = useMemo(() => {
    return dadosGraficoSaldos.reduce((acc, curr) => acc + curr.value, 0);
  }, [dadosGraficoSaldos]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-border shadow-md rounded-lg">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.name}</p>
          <p className={`font-bold ${payload[0].value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            R$ {payload[0].value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
          </p>
        </div>
      );
    }
    return null;
  };

  // --- ESTADOS PARA AGENDA E METAS ---
  const [eventos, setEventos] = useState([]);
  const [metas, setMetas] = useState([]);
  
  // Modais
  const [isEventoModalOpen, setIsEventoModalOpen] = useState(false);
  const [isAddValorMetaModalOpen, setIsAddValorMetaModalOpen] = useState(false);
  const [selectedMetaAdd, setSelectedMetaAdd] = useState('');
  const [valorAdicionarMeta, setValorAdicionarMeta] = useState('');

  const [eventoFormData, setEventoFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    type: 'pagamento',
    category: ''
  });

  // --- NOVOS ESTADOS PARA CARTÕES ---
  const [cartoes, setCartoes] = useState([]);
  
  // --- IDENTIFICADOR DE LOGOS REAIS DOS BANCOS ---
  const getBankLogo = (cardName = '') => {
    const nameLower = cardName.toLowerCase();
    if (nameLower.includes('nubank') || nameLower.includes('nu')) return 'nubank.com.br';
    if (nameLower.includes('itaú') || nameLower.includes('itau')) return 'itau.com.br';
    if (nameLower.includes('inter')) return 'bancointer.com.br';
    if (nameLower.includes('c6')) return 'c6bank.com.br';
    if (nameLower.includes('bradesco')) return 'bradesco.com.br';
    if (nameLower.includes('santander')) return 'santander.com.br';
    if (nameLower.includes('brasil') || nameLower.includes('bb')) return 'bb.com.br';
    if (nameLower.includes('caixa')) return 'caixa.gov.br';
    if (nameLower.includes('xp')) return 'xpi.com.br';
    if (nameLower.includes('neon')) return 'neon.com.br';
    if (nameLower.includes('will')) return 'willbank.com.br';
    if (nameLower.includes('pan')) return 'bancopan.com.br';
    if (nameLower.includes('pag') || nameLower.includes('pagseguro')) return 'pagbank.com.br';
    if (nameLower.includes('mercado') || nameLower.includes('pago')) return 'mercadopago.com.br';
    
    return null; // Se não achar o nome do banco, retorna null
  };

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

  const abrirModalGasto = (cartao) => {
    setSelectedCartao(cartao);
    setIsGastoModalOpen(true);
  };

  const handleGastoSubmit = async (e) => {
    e.preventDefault();
    if (!gastoFormData.description || !gastoFormData.amount) return alert('Preencha os campos obrigatórios.');

    const categoriaObj = categorias.find(cat => cat.name === gastoFormData.category && cat.type === 'saida');
    if (!categoriaObj) return alert("Selecione uma categoria válida para a despesa.");

    try {
      const response = await apiService.post(`/api/credit-cards/${selectedCartao.id}/transactions`, {
        description: gastoFormData.description,
        value: parseFloat(gastoFormData.amount),
        date: gastoFormData.date,
        category_id: categoriaObj.id,
        payment_method: gastoFormData.payment_method,
        installments: gastoFormData.installments
      });
      
      if (response && response.category_id && response.value) {
        alert('✅ Gasto lançado no cartão com sucesso!');
        setIsGastoModalOpen(false);
        setGastoFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], payment_method: 'a_vista', installments: 1 });
        await carregarDados();
        eventService.emit('transactionsChanged');
      } else {
        alert('❌ Erro ao lançar o gasto. Verifique o Limite.');
      }
    } catch (error) {
      console.error(error);
      alert('❌ Erro ao lançar o gasto. Verifique o Limite.');
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const datePart = dateString.split('T')[0];
    const localDate = new Date(`${datePart}T12:00:00`);
    return localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  // --- LÓGICA DA AGENDA (Próximos 7 dias) ---
  const eventosProximos = useMemo(() => {
    const hojeDate = new Date();
    hojeDate.setHours(0,0,0,0);
    const daqui7Dias = new Date(hojeDate);
    daqui7Dias.setDate(hojeDate.getDate() + 7);

    return eventos.filter(e => {
      if (e.is_completed) return false;
      const dataE = new Date(e.date);
      // Ajuste de fuso horário
      const dataLocal = new Date(dataE.getTime() + dataE.getTimezoneOffset() * 60000);
      dataLocal.setHours(0,0,0,0);
      return dataLocal >= hojeDate && dataLocal <= daqui7Dias;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4); // Pega só os 4 primeiros
  }, [eventos]);

  const handleEventoSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.post('/api/schedule', eventoFormData);
      await carregarDados();
      setIsEventoModalOpen(false);
      setEventoFormData({ title: '', description: '', event_date: new Date().toISOString().split('T')[0], type: 'pagamento', category: '' });
      alert("Evento criado!");
    } catch (error) {
      alert("Erro ao criar evento.");
    }
  };

  // --- LÓGICA DAS METAS ---
  const metasAtivas = useMemo(() => metas.filter(m => m.is_active && !m.is_completed), [metas]);
  const valorTotalMetas = useMemo(() => metasAtivas.reduce((sum, m) => sum + m.target_value, 0), [metasAtivas]);
  const valorAcumuladoMetas = useMemo(() => metasAtivas.reduce((sum, m) => sum + m.current_value, 0), [metasAtivas]);
  const valorRestanteMetas = valorTotalMetas - valorAcumuladoMetas;

  const handleAddValorMetaSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMetaAdd || !valorAdicionarMeta) return alert("Preencha todos os campos.");
    try {
      await apiService.post(`/api/goals/${selectedMetaAdd}/contribute`, { amount: parseFloat(valorAdicionarMeta) });
      await carregarDados();
      setIsAddValorMetaModalOpen(false);
      setSelectedMetaAdd('');
      setValorAdicionarMeta('');
      alert("Valor adicionado à meta!");
    } catch (error) {
      alert("Erro ao adicionar valor.");
    }
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
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* 1. MINI TELA DE LANÇAMENTOS */}
          <Card className="border-border shadow-sm flex flex-col h-[480px] overflow-hidden">
            {/* ▼▼▼ CABEÇALHO VERDE ESCURO ▼▼▼ */}
            <CardHeader className="pb-4 border-b bg-emerald-800 text-white">
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Wallet className="h-5 w-5 text-emerald-300" />
                  Lançamentos
                </CardTitle>
                
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    {/* Botão Novo atualizado para destacar no verde escuro */}
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 h-8 text-xs shadow-sm">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Lançamento Rápido</DialogTitle>
                    </DialogHeader>
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
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Confirmar Lançamento</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Cores dos totais ajustadas para fundo escuro */}
              <div className="flex justify-between items-center text-sm px-1 mb-2">
                <div className="flex items-center gap-1.5 text-emerald-200 font-medium">
                  <ArrowUpCircle className="h-4 w-4" /> R$ {totaisDoMes.receitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <div className="flex items-center gap-1.5 text-rose-300 font-medium">
                  <ArrowDownCircle className="h-4 w-4" /> R$ {totaisDoMes.despesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
              </div>

              {/* Fundo da barra de abas ajustado para fundo escuro */}
              <div className="flex rounded-lg bg-emerald-900/60 p-1">
                <button
                  onClick={() => setAbaAtiva('expense')}
                  className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${abaAtiva === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-emerald-100 hover:text-white hover:bg-emerald-700/50'}`}
                >
                  Despesas
                </button>
                <button
                  onClick={() => setAbaAtiva('income')}
                  className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${abaAtiva === 'income' ? 'bg-white shadow-sm text-emerald-700' : 'text-emerald-100 hover:text-white hover:bg-emerald-700/50'}`}
                >
                  Receitas
                </button>
              </div>
            </CardHeader>
            {/* ▲▲▲ FIM DO CABEÇALHO VERDE ESCURO ▲▲▲ */}

            <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-border">
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
          <Card className="border-border shadow-sm flex flex-col flex-1 min-h-[400px] overflow-hidden">
            {/* ▼▼▼ CABEÇALHO VERDE ESCURO ▼▼▼ */}
            <CardHeader className="py-3 px-4 border-b bg-emerald-800 text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-white">
                  <Clock className="h-4 w-4 text-orange-400" />
                  Lançamentos Pendentes
                </CardTitle>
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {transacoesPendentes.length}
                </span>
              </div>
            </CardHeader>
            {/* ▲▲▲ FIM DO CABEÇALHO VERDE ESCURO ▲▲▲ */}

            <CardContent className="p-0 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-border">
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

       {/* COLUNAS DIREITAS (GRÁFICOS E INDICADORES) */}
        <div className="col-span-1 lg:col-span-2 space-y-6 flex flex-col h-[724px]">
          
          {/* GRÁFICO DE SALDO POR CONTA */}
          <Card className="border-border shadow-sm overflow-hidden">
            {/* ▼▼▼ CABEÇALHO VERDE ESCURO ▼▼▼ */}
            <CardHeader className="pb-3 pt-4 px-6 flex flex-row items-center justify-between bg-emerald-800 border-b text-white">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-100 uppercase tracking-wider">
                <Landmark className="h-4 w-4" />
                Saldo por Conta
              </CardTitle>
              <div className="text-right">
                <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider mb-0.5">Saldo Total</p>
                <p className={`text-xl font-bold ${saldoTotalGlobal >= 0 ? 'text-white' : 'text-red-300'}`}>
                  R$ {saldoTotalGlobal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </p>
              </div>
            </CardHeader>
            {/* ▲▲▲ FIM DO CABEÇALHO VERDE ESCURO ▲▲▲ */}
            
            <CardContent className="pt-4 pb-2">
              {loading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : dadosGraficoSaldos.length === 0 ? (
                <div className="flex justify-center items-center h-[200px] text-muted-foreground text-sm">
                  Nenhuma conta ou saldo registrado.
                </div>
              ) : (
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGraficoSaldos} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                        dy={10} 
                        tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 12 }} 
                        tickFormatter={(value) => `R$ ${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                        {dadosGraficoSaldos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#ef4444' : entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARROSSEL DE CARTÕES DE CRÉDITO */}
          <Card className="border-border shadow-sm flex flex-col flex-1 min-h-[250px] overflow-hidden">
            <CardHeader className="px-0 pt-0 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <CreditCard className="h-4 w-4" />
                Meus Cartões
              </CardTitle>
              {/* Ao clicar aqui, o usuário deve ser redirecionado para a página completa de cartões */}
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 h-6 px-2" onClick={() => window.location.href = '#/credit-cards'}>
                Gerenciar Todos
              </Button>
            </CardHeader>
            
            {/* Area rolável horizontal */}
            <CardContent className="p-0 overflow-x-auto flex gap-4 pb-2 scrollbar-thin scrollbar-thumb-emerald-200">
              {loading ? (
                <div className="flex justify-center items-center w-full h-full min-h-[160px]">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : cartoes.length === 0 ? (
                <div className="flex flex-col justify-center items-center w-full h-full min-h-[160px] bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300">
                   <p className="text-muted-foreground text-sm mb-2">Nenhum cartão cadastrado.</p>
                   <Button variant="outline" size="sm" onClick={() => window.location.href = '#/credit-cards'}>Adicionar Cartão</Button>
                </div>
              ) : (
                cartoes.map(cartao => {
                  const bankDomain = getBankLogo(cartao.name); // Busca o domínio do banco
                  const percUsado = (cartao.usado / cartao.limit) * 100;
                  
                  return (
                    <div key={cartao.id} className="min-w-[280px] sm:min-w-[300px] bg-white dark:bg-slate-800 border border-border rounded-xl p-4 shadow-sm flex flex-col justify-between shrink-0 hover:shadow-md transition-shadow relative overflow-hidden">
                      {/* Faixa decorativa neutra */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500/20"></div>
                      
                      <div className="flex justify-between items-start mb-4 mt-1">
                        <div className="flex items-center gap-3">
                          {/* ▼▼▼ O ÍCONE REAL DO BANCO AQUI ▼▼▼ */}
                          <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-slate-700 shadow-sm flex items-center justify-center p-1.5 border border-slate-100 dark:border-slate-600">
                            {bankDomain ? (
                              <img 
                                src={`https://www.google.com/s2/favicons?domain=${bankDomain}&sz=128`} 
                                alt="Logo Banco" 
                                className="w-full h-full object-contain rounded"
                              />
                            ) : (
                              <CreditCard className="text-slate-400 w-5 h-5" />
                            )}
                          </div>
                          {/* ▲▲▲ FIM DO ÍCONE ▲▲▲ */}

                          <div>
                            <h4 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                              {cartao.name}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 bg-emerald-50 hover:bg-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:hover:bg-emerald-800/50 rounded-full shrink-0" 
                                onClick={() => abrirModalGasto(cartao)} 
                                title="Lançar Gasto neste Cartão"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">Final {cartao.last_digits || '0000'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-auto">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Disponível</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            R$ {cartao.disponivel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                        </div>

                        {/* Barra de Progresso */}
                        <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percUsado > 80 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${Math.min(percUsado, 100)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Usado: R$ {cartao.usado.toLocaleString('pt-BR')}</span>
                          <span>Limite: R$ {cartao.limit.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* MODAL DE LANÇAR GASTO NO CARTÃO */}
          <Dialog open={isGastoModalOpen} onOpenChange={setIsGastoModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Lançar Gasto no Cartão</DialogTitle>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {selectedCartao?.name}
                </p>
              </DialogHeader>
              <form onSubmit={handleGastoSubmit} className="space-y-4 mt-2">
                <div>
                  <Label htmlFor="gasto_desc">Descrição *</Label>
                  <Input id="gasto_desc" value={gastoFormData.description} onChange={(e) => setGastoFormData(prev => ({...prev, description: e.target.value}))} placeholder="Ex: Ifood, Uber..." required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gasto_amount">Valor *</Label>
                    <Input id="gasto_amount" type="number" step="0.01" value={gastoFormData.amount} onChange={(e) => setGastoFormData(prev => ({...prev, amount: e.target.value}))} placeholder="0,00" required />
                  </div>
                  <div>
                    <Label htmlFor="gasto_date">Data</Label>
                    <Input id="gasto_date" type="date" value={gastoFormData.date} onChange={(e) => setGastoFormData(prev => ({...prev, date: e.target.value}))} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gasto_category">Categoria da Despesa</Label>
                  <Select value={gastoFormData.category} onValueChange={(value) => setGastoFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {categorias.filter(c => c.type === 'saida').map((cat, idx) => (
                        <SelectItem key={idx} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gasto_pay_method">Pagamento</Label>
                    <Select value={gastoFormData.payment_method} onValueChange={(value) => setGastoFormData(prev => ({...prev, payment_method: value, installments: 1}))}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="a_vista">À Vista</SelectItem>
                        <SelectItem value="parcelado">Parcelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {gastoFormData.payment_method === 'parcelado' && (
                    <div>
                      <Label htmlFor="gasto_install">Parcelas</Label>
                      <Input id="gasto_install" type="number" min="2" max="24" value={gastoFormData.installments} onChange={(e) => setGastoFormData(prev => ({...prev, installments: parseInt(e.target.value) || 1}))} />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsGastoModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Lançar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

{/* ▼▼▼ NOVA FILEIRA: AGENDA E METAS ▼▼▼ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[200px]">
            
            {/* WIDGET AGENDA */}
            <Card className="border-border shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-4 border-b bg-indigo-800 text-white flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-100">
                  <Calendar className="h-4 w-4" /> Próximos Eventos
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-indigo-200 hover:text-white h-6 px-2" onClick={() => window.location.href = '#/schedule'}>
                  Gerenciar
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto flex-1 flex flex-col">
                {eventosProximos.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <Calendar className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-muted-foreground">Sua agenda está livre!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {eventosProximos.map(e => (
                      <div key={e.id} className="p-3 flex justify-between items-center hover:bg-muted/30">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{e.title}</span>
                          <span className="text-xs text-muted-foreground">{formatDateForDisplay(e.date)}</span>
                        </div>
                        {e.value && <span className="text-sm font-semibold text-red-500">R$ {e.value.toLocaleString('pt-BR')}</span>}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Botão Novo Evento Rápido */}
                <div className="mt-auto p-3 border-t bg-muted/10">
                  <Dialog open={isEventoModalOpen} onOpenChange={setIsEventoModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full border-dashed border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400">
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Evento
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                      <DialogHeader><DialogTitle>Novo Evento Rápido</DialogTitle></DialogHeader>
                      <form onSubmit={handleEventoSubmit} className="space-y-4">
                        <div><Label>Título</Label><Input required value={eventoFormData.title} onChange={e => setEventoFormData({...eventoFormData, title: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                          <div><Label>Data</Label><Input type="date" required value={eventoFormData.event_date} onChange={e => setEventoFormData({...eventoFormData, event_date: e.target.value})} /></div>
                          <div>
                            <Label>Tipo</Label>
                            <Select value={eventoFormData.type} onValueChange={val => setEventoFormData({...eventoFormData, type: val})}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent><SelectItem value="pagamento">Pagamento</SelectItem><SelectItem value="recebimento">Recebimento</SelectItem><SelectItem value="lembrete">Lembrete</SelectItem></SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">Salvar Evento</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* WIDGET METAS */}
            <Card className="border-border shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="py-3 px-4 border-b bg-violet-800 text-white flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-violet-100">
                  <Target className="h-4 w-4" /> Visão de Metas
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-violet-200 hover:text-white h-6 px-2" onClick={() => window.location.href = '#/goals'}>
                  Gerenciar
                </Button>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 mb-4 text-center md:text-left">
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Total Almejado</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">R$ {valorTotalMetas.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Acumulado</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">R$ {valorAcumuladoMetas.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progresso Geral</span>
                    <span className="font-bold text-violet-600">
                      {valorTotalMetas > 0 ? ((valorAcumuladoMetas / valorTotalMetas) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div className="h-2 rounded-full bg-violet-500" style={{ width: `${valorTotalMetas > 0 ? Math.min((valorAcumuladoMetas / valorTotalMetas) * 100, 100) : 0}%` }}></div>
                  </div>
                  <p className="text-xs text-right text-muted-foreground mt-1">Faltam R$ {Math.max(valorRestanteMetas, 0).toLocaleString('pt-BR')}</p>
                </div>

                {/* Botão Adicionar Valor em Meta */}
                <div className="mt-auto">
                  <Dialog open={isAddValorMetaModalOpen} onOpenChange={setIsAddValorMetaModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-violet-600 hover:bg-violet-700 shadow-sm">
                        <DollarSign className="h-4 w-4 mr-2" /> Injetar Valor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px]">
                      <DialogHeader><DialogTitle>Adicionar Valor à Meta</DialogTitle></DialogHeader>
                      <form onSubmit={handleAddValorMetaSubmit} className="space-y-4">
                        <div>
                          <Label>Qual meta deseja abastecer?</Label>
                          <Select value={selectedMetaAdd} onValueChange={setSelectedMetaAdd}>
                            <SelectTrigger><SelectValue placeholder="Selecione a meta" /></SelectTrigger>
                            <SelectContent>
                              {metasAtivas.length === 0 ? (
                                <SelectItem value="none" disabled>Nenhuma meta ativa</SelectItem>
                              ) : (
                                metasAtivas.map(m => (
                                  <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Valor a injetar (R$)</Label>
                          <Input type="number" step="0.01" value={valorAdicionarMeta} onChange={e => setValorAdicionarMeta(e.target.value)} required placeholder="Ex: 150.00" />
                        </div>
                        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={!selectedMetaAdd}>Confirmar Injeção</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

          </div>
          {/* ▲▲▲ FIM DA NOVA FILEIRA ▲▲▲ */}
        </div>
      </div>
    </div>
  );
};

export default Inicio;