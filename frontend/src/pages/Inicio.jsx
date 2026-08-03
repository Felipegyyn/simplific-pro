import React, { useState, useEffect, useMemo } from 'react';
import styles from './Inicio.module.css'; // Importando o CSS Modular
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ArrowDownCircle, ArrowUpCircle, Wallet, Clock, CheckCircle, Landmark, CreditCard, Edit, Trash2, Calendar, Target, DollarSign, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import eventService from '../services/eventService';
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Inicio = ({ user }) => {
  const navigate = useNavigate();
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
    <div className={styles.pageContainer}>
      
      {/* CABEÇALHO */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>
            Página Inicial
          </h1>
          <p className={styles.pageSubtitle}>Visão rápida da sua operação financeira hoje.</p>
        </div>
        
        <div className={styles.filterPanel}>
          <Select value={mesFiltro.toString()} onValueChange={(val) => setMesFiltro(parseInt(val))}>
            <SelectTrigger className="w-[130px] border-none shadow-none focus:ring-0 bg-transparent font-bold h-9 text-slate-800 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map((mes, index) => (
                <SelectItem key={index} value={index.toString()}>{mes}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className={styles.filterDivider}></div>
          <Select value={anoFiltro.toString()} onValueChange={(val) => setAnoFiltro(parseInt(val))}>
            <SelectTrigger className="w-[100px] border-none shadow-none focus:ring-0 bg-transparent font-bold h-9 text-slate-800 dark:text-white">
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

      <div className={styles.mainGrid}>
        
        {/* 1. LANÇAMENTOS */}
        <div className={styles.gridLancamentos}>
          <div className={styles.premiumCard} style={{ height: '100%' }}>
            <div className={`${styles.cardTopAccent} ${styles.accentGreen}`}></div>
            
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleArea}>
                <div className={`${styles.iconBox} ${styles.iconBoxSuccess}`}>
                  <Wallet size={16} />
                </div>
                <h2 className={styles.cardTitle}>Lançamentos</h2>
              </div>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-none h-8 text-[10px] font-black uppercase tracking-widest px-4">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Lançamento Rápido</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black ml-1">Tipo</Label>
                        <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Receita</SelectItem>
                            <SelectItem value="expense">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black ml-1">Valor (R$)</Label>
                        <Input type="number" step="0.01" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0,00" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black ml-1">Descrição</Label>
                      <Input value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Ex: Mercado" required />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-black ml-1">Categoria</Label>
                      <Select value={formData.category} onValueChange={(val) => handleInputChange('category', val)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent className="max-h-[200px]">
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

            <div className={styles.summaryRow}>
              <div className={`${styles.summaryBox} ${styles.summaryBoxUp}`}>
                <ArrowUpCircle size={12} /> R$ {totaisDoMes.receitas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <div className={`${styles.summaryBox} ${styles.summaryBoxDown}`}>
                <ArrowDownCircle size={12} /> R$ {totaisDoMes.despesas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
            </div>

            <div className={styles.tabsContainer}>
              <button
                onClick={() => setAbaAtiva('expense')}
                className={cn(styles.tabBtn, abaAtiva === 'expense' && styles.tabBtnActive)}
              >
                Despesas
              </button>
              <button
                onClick={() => setAbaAtiva('income')}
                className={cn(styles.tabBtn, abaAtiva === 'income' && styles.tabBtnActive)}
              >
                Receitas
              </button>
            </div>

            <div className={`${styles.cardContent} ${styles.scrollableList}`}>
              {loading ? (
                <div className={styles.emptyState}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                </div>
              ) : transacoesFiltradas.length === 0 ? (
                <div className={styles.emptyState}>
                  <Zap className={styles.emptyIcon} />
                  <p className={styles.emptyText}>Nenhum lançamento confirmado.</p>
                </div>
              ) : (
                <div>
                  {transacoesFiltradas.map((t) => (
                    <div key={t.id} className={styles.listItem}>
                      <div className={styles.itemMain}>
                        <span className={styles.itemTitle}>{t.description}</span>
                        <div className={styles.itemMeta}>
                          <span>{formatDateForDisplay(t.transaction_date)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                          <span className={styles.itemBadge}>
                            {t.category || 'Outros'}
                          </span>
                        </div>
                      </div>
                      <div className={cn(styles.itemValue, abaAtiva === 'income' ? styles.valuePositive : styles.valueNeutral)}>
                        {abaAtiva === 'expense' ? '-' : '+'} R$ {(t.amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. PENDÊNCIAS */}
        <div className={styles.gridPendencias}>
          <div className={styles.premiumCard} style={{ height: '100%', minHeight: '300px' }}>
             <div className={`${styles.cardTopAccent} ${styles.accentOrange}`}></div>
            
            <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                  <div className={`${styles.iconBox} ${styles.iconBoxWarning}`}>
                    <Clock size={16} />
                  </div>
                  <h3 className={styles.cardTitle}>Pendências</h3>
                </div>
                <Badge className="bg-orange-500 text-white border-none text-[10px] px-2 py-0.5 font-black">
                  {transacoesPendentes.length}
                </Badge>
            </div>

            <div className={`${styles.cardContent} ${styles.scrollableList}`}>
              {loading ? (
                <div className={styles.emptyState}>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-400"></div>
                </div>
              ) : transacoesPendentes.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={`${styles.iconBox} ${styles.iconBoxSuccess} mb-2`}>
                    <CheckCircle size={20} />
                  </div>
                  <p className={styles.emptyText}>Tudo em dia!</p>
                </div>
              ) : (
                <div>
                  {transacoesPendentes.map((t) => (
                    <div key={t.id} className={styles.listItem}>
                      <div className={styles.itemMain}>
                        <span className={styles.itemTitle}>{t.description}</span>
                        <div className={styles.itemMeta}>
                          <span className={t.type === 'income' ? styles.valuePositive : styles.valueNegative}>
                            {t.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                          <span>{formatDateForDisplay(t.transaction_date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={cn(styles.itemValue, t.type === 'income' ? styles.valuePositive : styles.valueNegative)}>
                          R$ {(t.amount || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </span>
                        
                        <button 
                          className={styles.btnAction}
                          style={{ color: '#10b981' }}
                          onClick={() => confirmarTransacao(t.id)}
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. VISÃO POR INSTITUIÇÃO */}
        <div className={styles.gridVisao}>
          <div className={styles.premiumCard} style={{ height: '100%' }}>
            <div className={`${styles.cardTopAccent} ${styles.accentCyan}`}></div>
            
            <div className={styles.chartHeader}>
              <div className={styles.cardTitleArea}>
                <div className={`${styles.iconBox} ${styles.iconBoxCyan}`}>
                    <Landmark size={16} />
                </div>
                <div>
                    <h2 className={styles.cardTitle}>Visão por Instituição</h2>
                </div>
              </div>
              <div className={styles.chartTotal}>
                <p className={styles.chartTotalLabel}>Saldo Consolidado</p>
                <p className={cn(styles.chartTotalValue, saldoTotalGlobal < 0 && styles.chartTotalValueNegative)}>
                  R$ {saldoTotalGlobal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </p>
              </div>
            </div>
            
            <div className={styles.chartBody}>
              {loading ? (
                <div className={styles.emptyState}>
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGraficoSaldos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-muted)', fontSize: 10 }} 
                      tickFormatter={(value) => `R$${value/1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--surface-elevated)'}} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40} animationDuration={1000}>
                      {dadosGraficoSaldos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#f43f5e' : '#06b6d4'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* 4. CARTÕES DE CRÉDITO */}
        <div className={styles.gridCartoes}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.carouselHeader}>
              <div className={styles.cardTitleArea}>
                <CreditCard size={16} style={{ color: '#a855f7' }} />
                <h3 className={styles.cardTitle}>Cartões de Crédito</h3>
              </div>
              <button className={styles.btnAction} style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }} onClick={() => navigate('/credit-cards')}>
                Expandir Tudo
              </button>
            </div>
            
            <div className={styles.carouselContainer}>
              {loading ? (
                <div className="flex gap-4 w-full">
                    <Skeleton className="h-44 w-72 bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/5" />
                    <Skeleton className="h-44 w-72 bg-slate-200 dark:bg-white/5 border-slate-300 dark:border-white/5" />
                </div>
              ) : cartoes.length === 0 ? (
                <div className={styles.emptyState}>
                   <p className={styles.emptyText}>Nenhum cartão ativo.</p>
                   <button className={styles.btnAction} onClick={() => navigate('/credit-cards')}>Adicionar Agora</button>
                </div>
              ) : (
                cartoes.map(cartao => {
                  const bankDomain = getBankLogo(cartao.name);
                  const percUsado = (cartao.usado / cartao.limit) * 100;
                  
                  return (
                    <div key={cartao.id} className={styles.ccCard}>
                      <div className={styles.ccBgEffect}></div>
                      <div className={styles.ccLimitBarBg}>
                        <div className={cn(styles.ccLimitBarFill, percUsado > 80 && styles.ccLimitBarFillWarning)} style={{ width: `${Math.min(percUsado, 100)}%` }}></div>
                      </div>
                      
                      <div className={styles.ccTop}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div className={styles.ccLogoBox}>
                            {bankDomain ? (
                              <img src={`https://www.google.com/s2/favicons?domain=${bankDomain}&sz=128`} alt="Bco" className={styles.ccLogoImg} />
                            ) : (
                              <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />
                            )}
                          </div>
                          <div className={styles.ccInfo}>
                            <h4 className={styles.ccName}>
                              {cartao.name}
                              <button onClick={() => abrirModalGasto(cartao)} className={styles.ccAddBtn}>
                                <Plus size={14} />
                              </button>
                            </h4>
                            <p className={styles.ccNumber}>FINAL {cartao.last_digits || '0000'}</p>
                          </div>
                        </div>
                        <span className={styles.ccBadge}>Padrão</span>
                      </div>

                      <div className={styles.ccBottom}>
                        <div>
                          <p className={styles.ccDispLabel}>Disponível</p>
                          <p className={styles.ccDispValue}>R$ {cartao.disponivel.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p className={styles.ccTotalLabel}>Limite Total</p>
                          <p className={styles.ccTotalValue}>R$ {cartao.limit.toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 5. EVENTOS E METAS */}
        <div className={styles.gridBottomRow}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', height: '100%' }}>
            
            {/* WIDGET AGENDA */}
            <div className={styles.premiumCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                  <div className={`${styles.iconBox} ${styles.iconBoxPink}`}>
                    <Calendar size={16} />
                  </div>
                  <h3 className={styles.cardTitle}>Próximos Eventos</h3>
                </div>
                <button onClick={() => navigate('/schedule')} className={styles.btnAction}>
                  <Edit size={14} />
                </button>
              </div>
              
              <div className={styles.cardContent} style={{ minHeight: '200px' }}>
                {eventosProximos.length === 0 ? (
                  <div className={styles.emptyState}>
                    <Calendar className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Agenda Livre</p>
                  </div>
                ) : (
                  <div>
                    {eventosProximos.map(e => (
                      <div key={e.id} className={styles.listItem}>
                        <div className={styles.itemMain}>
                          <span className={styles.itemTitle}>{e.title}</span>
                          <span className={styles.itemMeta}>{formatDateForDisplay(e.date)}</span>
                        </div>
                        {e.value && <span className={styles.itemValue} style={{ color: '#ec4899' }}>R$ {e.value.toLocaleString('pt-BR')}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={styles.cardFooter}>
                <button className={styles.btnPrimary} style={{ backgroundColor: '#ec4899' }} onClick={() => setIsEventoModalOpen(true)}>
                  <Plus size={14} /> Agendar Agora
                </button>
              </div>
            </div>

            {/* WIDGET METAS */}
            <div className={styles.premiumCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                  <div className={`${styles.iconBox} ${styles.iconBoxPurple}`}>
                    <Target size={16} />
                  </div>
                  <h3 className={styles.cardTitle}>Metas Ativas</h3>
                </div>
                <button onClick={() => navigate('/goals')} className={styles.btnAction}>
                   <Edit size={14} />
                </button>
              </div>

              <div className={styles.metaContainer}>
                <div className={styles.metaGrid}>
                  <div className={styles.metaBlock}>
                    <p className={styles.metaLabel}>Objetivo Final</p>
                    <p className={styles.metaValTarget}>R$ {valorTotalMetas.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className={`${styles.metaBlock} ${styles.metaBlockRight}`}>
                    <p className={styles.metaLabel}>Já Acumulado</p>
                    <p className={styles.metaValCurrent}>R$ {valorAcumuladoMetas.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className={styles.progressContainer}>
                  <div className={styles.progressHeader}>
                    <span className={styles.progressLabel}>Progresso Global</span>
                    <span className={styles.progressPercent}>
                      {valorTotalMetas > 0 ? ((valorAcumuladoMetas / valorTotalMetas) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div className={styles.progressBarFill} style={{ width: `${valorTotalMetas > 0 ? Math.min((valorAcumuladoMetas / valorTotalMetas) * 100, 100) : 0}%` }}></div>
                  </div>
                  <p className={styles.progressFooter}>Faltam R$ {Math.max(valorRestanteMetas, 0).toLocaleString('pt-BR')} para o objetivo</p>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.btnPrimary} style={{ backgroundColor: '#8b5cf6' }} onClick={() => setIsAddValorMetaModalOpen(true)}>
                  <DollarSign size={14} /> Injetar Capital
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* MODAL DE AGENDAMENTO RÁPIDO (PRÓXIMOS EVENTOS) */}
        <Dialog open={isEventoModalOpen} onOpenChange={setIsEventoModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Novo Evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEventoSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black ml-1">Título do Evento</Label>
                <Input
                  value={eventoFormData.title}
                  onChange={(e) => setEventoFormData({ ...eventoFormData, title: e.target.value })}
                  placeholder="Ex: Pagamento Aluguel"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black ml-1">Data</Label>
                  <Input
                    type="date"
                    value={eventoFormData.event_date}
                    onChange={(e) => setEventoFormData({ ...eventoFormData, event_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black ml-1">Tipo</Label>
                  <Select
                    value={eventoFormData.type}
                    onValueChange={(val) => setEventoFormData({ ...eventoFormData, type: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pagamento">Pagamento / Despesa</SelectItem>
                      <SelectItem value="recebimento">Recebimento / Receita</SelectItem>
                      <SelectItem value="compromisso">Compromisso</SelectItem>
                      <SelectItem value="lembrete">Lembrete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black ml-1">Descrição / Observação</Label>
                <Input
                  value={eventoFormData.description}
                  onChange={(e) => setEventoFormData({ ...eventoFormData, description: e.target.value })}
                  placeholder="Detalhes opcionais..."
                />
              </div>
              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold h-10 shadow-lg shadow-pink-900/20">
                Confirmar Agendamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL DE INJETAR CAPITAL NA META */}
        <Dialog open={isAddValorMetaModalOpen} onOpenChange={setIsAddValorMetaModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Injetar Capital em Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddValorMetaSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black ml-1">Selecione a Meta</Label>
                <Select
                  value={selectedMetaAdd}
                  onValueChange={(val) => setSelectedMetaAdd(val)}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione uma meta ativa..." /></SelectTrigger>
                  <SelectContent>
                    {metasAtivas.length === 0 ? (
                      <SelectItem value="none" disabled>Nenhuma meta ativa disponível</SelectItem>
                    ) : (
                      metasAtivas.map(m => (
                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black ml-1">Valor a Adicionar (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={valorAdicionarMeta}
                  onChange={(e) => setValorAdicionarMeta(e.target.value)}
                  placeholder="0,00"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 shadow-lg shadow-purple-900/20">
                Confirmar Injeção de Capital
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* MODAL DE LANÇAMENTO NO CARTÃO DE CRÉDITO */}
        <Dialog open={isGastoModalOpen} onOpenChange={setIsGastoModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Gasto no Cartão: {selectedCartao?.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGastoSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black ml-1">Descrição</Label>
                <Input
                  value={gastoFormData.description}
                  onChange={(e) => setGastoFormData({ ...gastoFormData, description: e.target.value })}
                  placeholder="Ex: Assinatura, Restaurante..."
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black ml-1">Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={gastoFormData.amount}
                    onChange={(e) => setGastoFormData({ ...gastoFormData, amount: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black ml-1">Data</Label>
                  <Input
                    type="date"
                    value={gastoFormData.date}
                    onChange={(e) => setGastoFormData({ ...gastoFormData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black ml-1">Categoria de Saída</Label>
                <Select
                  value={gastoFormData.category}
                  onValueChange={(val) => setGastoFormData({ ...gastoFormData, category: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {categorias.filter(c => c.type === 'saida').map((cat, idx) => (
                      <SelectItem key={idx} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black ml-1">Pagamento</Label>
                  <Select
                    value={gastoFormData.payment_method}
                    onValueChange={(val) => setGastoFormData({ ...gastoFormData, payment_method: val })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a_vista">À Vista</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {gastoFormData.payment_method === 'parcelado' && (
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black ml-1">Parcelas</Label>
                    <Input
                      type="number"
                      min="2"
                      max="48"
                      value={gastoFormData.installments}
                      onChange={(e) => setGastoFormData({ ...gastoFormData, installments: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-10 shadow-lg shadow-cyan-900/20">
                Lançar no Cartão
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Inicio;