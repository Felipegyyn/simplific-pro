import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader'; // <--- ADICIONE ESTA LINHA
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowDownCircle, ArrowUpCircle, Wallet, Clock, CheckCircle, Landmark, CreditCard, Edit, Trash2, Calendar, Target, DollarSign  } from 'lucide-react';
import apiService from '../services/api';
import eventService from '../services/eventService';
import { Skeleton } from "@/components/ui/skeleton";
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
    if (nameLower.includes('btg')) return 'btgpactual.com';
    if (nameLower.includes('dm')) return 'vocedm.com.br';
    if (nameLower.includes('porto')) return 'portoseguro.com.br';
    if (nameLower.includes('picpay')) return 'picpay.com';
    if (nameLower.includes('sicredi')) return 'sicredi.com.br';
    if (nameLower.includes('sicoob')) return 'sicooob.com.br';



    
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
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tighter">
            Página Inicial
          </h1>
          <p className="text-slate-400 text-sm mt-1">Visão rápida da sua operação financeira hoje.</p>
        </div>
        
        <div className="flex items-center gap-2 glass-panel p-1.5 border-white/5 shadow-xl">
          <Select value={mesFiltro.toString()} onValueChange={(val) => setMesFiltro(parseInt(val))}>
            <SelectTrigger className="w-[130px] border-none shadow-none focus:ring-0 bg-transparent text-white font-bold h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10">
              {meses.map((mes, index) => (
                <SelectItem key={index} value={index.toString()}>{mes}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          <Select value={anoFiltro.toString()} onValueChange={(val) => setAnoFiltro(parseInt(val))}>
            <SelectTrigger className="w-[100px] border-none shadow-none focus:ring-0 bg-transparent text-white font-bold h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-panel border-white/10">
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA (LANÇAMENTOS + PENDÊNCIAS) */}
        <div className="col-span-1 flex flex-col gap-8">
          
          {/* 1. MINI TELA DE LANÇAMENTOS */}
          <div className="glass-panel border-white/5 flex flex-col h-[650px] overflow-hidden shadow-2xl relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-blue-500/40 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="p-6 border-b border-white/5 bg-white/2">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Wallet className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white">Lançamentos</h2>
                </div>
                
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none h-8 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 px-4">
                      <Plus className="h-3.5 w-3.5 mr-1" /> Novo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Lançamento Rápido</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-[10px] uppercase font-black ml-1">Tipo</Label>
                          <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                            <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent className="glass-panel border-white/10">
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-400 text-[10px] uppercase font-black ml-1">Valor (R$)</Label>
                          <Input type="number" step="0.01" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0,00" className="bg-white/5 border-white/10" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-[10px] uppercase font-black ml-1">Descrição</Label>
                        <Input value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Ex: Mercado" className="bg-white/5 border-white/10" required />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-400 text-[10px] uppercase font-black ml-1">Categoria</Label>
                        <Select value={formData.category} onValueChange={(val) => handleInputChange('category', val)}>
                          <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent className="glass-panel border-white/10 max-h-[200px]">
                            {categorias.filter(c => c.type === (formData.type === 'income' ? 'entrada' : 'saida')).map((cat, idx) => (
                              <SelectItem key={idx} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Confirmar Lançamento</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-6">
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                  <ArrowUpCircle className="h-3 w-3" /> R$ {totaisDoMes.receitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/10">
                  <ArrowDownCircle className="h-3 w-3" /> R$ {totaisDoMes.despesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </div>
              </div>

              <div className="flex rounded-xl bg-white/5 p-1 border border-white/5 shadow-inner">
                <button
                  onClick={() => setAbaAtiva('expense')}
                  className={cn("flex-1 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all", 
                    abaAtiva === 'expense' ? "bg-white/10 text-rose-400 shadow-lg" : "text-slate-500 hover:text-slate-300")}
                >
                  Despesas
                </button>
                <button
                  onClick={() => setAbaAtiva('income')}
                  className={cn("flex-1 text-[10px] font-black uppercase tracking-widest py-2 rounded-lg transition-all", 
                    abaAtiva === 'income' ? "bg-white/10 text-emerald-400 shadow-lg" : "text-slate-500 hover:text-slate-300")}
                >
                  Receitas
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-none">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              ) : transacoesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 italic text-sm p-8 text-center">
                  <Zap className="h-8 w-8 mb-4 opacity-10" />
                  <p>Nenhum lançamento confirmado.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {transacoesFiltradas.map((t) => (
                    <div key={t.id} className="p-5 hover:bg-white/5 transition-all flex justify-between items-center group/item relative overflow-hidden">
                      <div className="absolute left-0 inset-y-0 w-1 bg-cyan-500/0 group-hover/item:bg-cyan-500/50 transition-all"></div>
                      <div className="flex flex-col overflow-hidden relative z-10">
                        <span className="text-sm font-bold text-white group-hover/item:text-cyan-400 transition-colors truncate">{t.description}</span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatDateForDisplay(t.transaction_date)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span className="text-[10px] font-black text-cyan-500/60 uppercase tracking-tighter bg-cyan-500/5 px-2 py-0.5 rounded border border-cyan-500/10">
                            {t.category || 'Outros'}
                          </span>
                        </div>
                      </div>
                      <div className={cn("font-black text-sm whitespace-nowrap ml-4 relative z-10", abaAtiva === 'income' ? 'text-emerald-400' : 'text-slate-200')}>
                        {abaAtiva === 'expense' ? '-' : '+'} R$ {(t.amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. MINI TELA DE PENDÊNCIAS */}
          <div className="glass-panel border-white/5 flex flex-col flex-1 min-h-[300px] overflow-hidden shadow-2xl relative group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/20 via-orange-500/40 to-orange-500/20 opacity-30 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="py-4 px-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <Clock className="h-4 w-4 text-orange-400" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Pendências</h3>
                </div>
                <Badge className="bg-orange-500 text-white border-none shadow-lg shadow-orange-900/40 text-[10px] px-2 py-0.5 font-black">
                  {transacoesPendentes.length}
                </Badge>
            </div>

            <div className="overflow-y-auto flex-1 scrollbar-none">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
                </div>
              ) : transacoesPendentes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/10">
                    <CheckCircle className="h-6 w-6 text-emerald-500/40" />
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tudo em dia!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {transacoesPendentes.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-white/5 transition-all flex justify-between items-center group/p">
                      <div className="flex flex-col overflow-hidden flex-1 mr-4">
                        <span className="text-sm font-bold text-white truncate">{t.description}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[9px] font-black uppercase tracking-widest", t.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                            {t.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span className="text-[10px] text-slate-500 font-medium">{formatDateForDisplay(t.transaction_date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={cn("font-black text-sm whitespace-nowrap", t.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                          R$ {(t.amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </span>
                        
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 rounded-xl text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 shadow-xl opacity-40 group-hover/p:opacity-100 transition-all"
                          onClick={() => confirmarTransacao(t.id)}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUNAS DIREITAS (GRÁFICOS E INDICADORES) */}
        <div className="col-span-1 lg:col-span-2 space-y-8">

          {/* GRÁFICO DE SALDO POR CONTA */}
          <div className="glass-panel border-white/5 flex flex-col min-h-[380px] overflow-hidden shadow-2xl relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
            
            <div className="p-8 border-b border-white/5 bg-white/2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Landmark className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Visão por Instituição</h2>
                    <h3 className="text-white font-bold text-lg">Saldo por Conta</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Saldo Consolidado</p>
                <p className={cn("text-3xl font-black tracking-tighter", saldoTotalGlobal >= 0 ? 'text-white' : 'text-red-400')}>
                  R$ {saldoTotalGlobal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </p>
              </div>
            </div>
            
            <div className="p-8 flex-1">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
                </div>
              ) : (
                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGraficoSaldos} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }} 
                        dy={15}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} 
                        tickFormatter={(value) => `R$${value/1000}k`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.02)'}} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1500}>
                        {dadosGraficoSaldos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#f43f5e' : 'rgba(14, 165, 233, 0.4)'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* CARROSSEL DE CARTÕES DE CRÉDITO */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-purple-400" />
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cartões de Crédito</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 h-7" onClick={() => navigate('/credit-cards')}>
                Expandir Tudo
              </Button>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none px-2 -mx-2">
              {loading ? (
                <div className="flex gap-4 w-full">
                    <Skeleton className="h-44 w-72 bg-white/5 border-white/5" />
                    <Skeleton className="h-44 w-72 bg-white/5 border-white/5" />
                </div>
              ) : cartoes.length === 0 ? (
                <div className="flex-1 py-12 text-center glass-panel border-white/5 border-dashed">
                   <p className="text-slate-500 italic text-sm mb-4">Nenhum cartão ativo.</p>
                   <Button variant="outline" className="glass-panel border-white/10 text-cyan-400 text-xs font-bold" onClick={() => navigate('/credit-cards')}>Adicionar Agora</Button>
                </div>
              ) : (
                cartoes.map(cartao => {
                  const bankDomain = getBankLogo(cartao.name);
                  const percUsado = (cartao.usado / cartao.limit) * 100;
                  
                  return (
                    <div key={cartao.id} className="min-w-[320px] glass-card p-6 border-white/10 group/card relative overflow-hidden transition-all hover:border-white/20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/2 rounded-full -mr-16 -mt-16 blur-3xl opacity-0 group-hover/card:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
                        <div className={cn("h-full transition-all duration-1000", percUsado > 80 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-cyan-500')} style={{ width: `${Math.min(percUsado, 100)}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between items-start mb-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shadow-2xl group-hover/card:scale-110 transition-transform">
                            {bankDomain ? (
                              <img src={`https://www.google.com/s2/favicons?domain=${bankDomain}&sz=128`} alt="Bco" className="w-full h-full object-contain brightness-110" />
                            ) : (
                              <CreditCard className="text-slate-500 w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-base group-hover/card:text-cyan-400 transition-colors flex items-center gap-2">
                              {cartao.name}
                              <button onClick={() => abrirModalGasto(cartao)} className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all opacity-0 group-hover/card:opacity-100">
                                <Plus size={12} />
                              </button>
                            </h4>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">FINAL {cartao.last_digits || '0000'}</p>
                          </div>
                        </div>
                        <Badge className="bg-white/5 border-white/10 text-[9px] font-black uppercase text-slate-400">Padrão</Badge>
                      </div>

                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Disponível</p>
                          <p className="text-2xl font-black text-white tracking-tight">R$ {cartao.disponivel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold text-slate-500">Limite Total</p>
                          <p className="text-xs font-bold text-slate-300">R$ {cartao.limit.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* WIDGET AGENDA */}
            <div className="glass-panel border-white/5 flex flex-col min-h-[350px] overflow-hidden shadow-2xl group/ag">
              <div className="p-6 border-b border-white/5 bg-white/2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/10 rounded-lg border border-pink-500/20">
                    <Calendar className="h-4 w-4 text-pink-400" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Próximos Eventos</h3>
                </div>
                <button onClick={() => navigate('/schedule')} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-pink-400">
                  <Edit size={14} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-none">
                {eventosProximos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-30">
                    <Calendar className="h-10 w-10 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Agenda Livre</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {eventosProximos.map(e => (
                      <div key={e.id} className="p-5 flex justify-between items-center hover:bg-white/5 transition-all group/ev">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white group-hover/ev:text-pink-400 transition-colors">{e.title}</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{formatDateForDisplay(e.date)}</span>
                        </div>
                        {e.value && <span className="text-sm font-black text-rose-400">R$ {e.value.toLocaleString('pt-BR')}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-white/5 bg-white/2">
                <Button variant="outline" size="sm" className="w-full glass-panel border-white/10 text-pink-400 text-[10px] font-black uppercase tracking-widest hover:bg-pink-500/10 h-10" onClick={() => setIsEventoModalOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-2" /> Agendar Agora
                </Button>
              </div>
            </div>

            {/* WIDGET METAS */}
            <div className="glass-panel border-white/5 flex flex-col min-h-[350px] overflow-hidden shadow-2xl group/meta">
              <div className="p-6 border-b border-white/5 bg-white/2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <Target className="h-4 w-4 text-purple-400" />
                  </div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Metas Ativas</h3>
                </div>
                <button onClick={() => navigate('/goals')} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-500 hover:text-purple-400">
                   <Edit size={14} />
                </button>
              </div>

              <div className="p-8 space-y-8 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Objetivo Final</p>
                    <p className="text-xl font-black text-white tracking-tighter">R$ {valorTotalMetas.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Já Acumulado</p>
                    <p className="text-xl font-black text-emerald-400 tracking-tighter">R$ {valorAcumuladoMetas.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progresso Global</span>
                    <span className="text-2xl font-black text-purple-400 tracking-tighter">
                      {valorTotalMetas > 0 ? ((valorAcumuladoMetas / valorTotalMetas) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-3 p-0.5 border border-white/5 shadow-inner">
                    <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-400 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all duration-1000" style={{ width: `${valorTotalMetas > 0 ? Math.min((valorAcumuladoMetas / valorTotalMetas) * 100, 100) : 0}%` }}></div>
                  </div>
                  <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest italic">Faltam R$ {Math.max(valorRestanteMetas, 0).toLocaleString('pt-BR')} para o objetivo</p>
                </div>
              </div>

              <div className="p-4 border-t border-white/5 bg-white/2">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-black uppercase tracking-widest h-10 shadow-lg shadow-purple-900/20" onClick={() => setIsAddValorMetaModalOpen(true)}>
                  <DollarSign className="h-3.5 w-3.5 mr-2" /> Injetar Capital
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Inicio;