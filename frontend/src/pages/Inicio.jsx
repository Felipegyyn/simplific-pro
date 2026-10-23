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
      
      {/* 1. CABEÇALHO EXECUTIVO */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>Visão Geral</h1>
          <p className={styles.pageSubtitle}>Acompanhamento consolidado da sua operação e fluxo de caixa.</p>
        </div>
        
        <div className={styles.filterPanel}>
          <Select value={mesFiltro.toString()} onValueChange={(val) => setMesFiltro(parseInt(val))}>
            <SelectTrigger className="w-[125px] border-none shadow-none focus:ring-0 bg-transparent font-medium h-8 text-xs text-foreground">
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
            <SelectTrigger className="w-[85px] border-none shadow-none focus:ring-0 bg-transparent font-medium h-8 text-xs text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((ano) => (
                <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {/* 2. KPI STRIP (Taste Skill §5: One container split by 1px hairlines) */}
      <section className={styles.kpiStrip}>
        <div className={styles.kpiCell}>
          <p className={styles.kpiLabel}>
            Saldo Consolidado
            <Wallet size={14} className="text-muted-foreground" />
          </p>
          <p className={cn(styles.kpiValue, styles.kpiValueLead, saldoTotalGlobal < 0 && 'text-rose-600 dark:text-rose-400')}>
            R$ {saldoTotalGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className={styles.kpiMeta}>
            <span>{contas.length} contas bancárias ativas</span>
          </div>
        </div>

        <div className={styles.kpiCell}>
          <p className={styles.kpiLabel}>
            Entradas do Mês
            <ArrowUpCircle size={14} className="text-emerald-600 dark:text-emerald-500" />
          </p>
          <p className={cn(styles.kpiValue, 'text-emerald-600 dark:text-emerald-500')}>
            R$ {totaisDoMes.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className={styles.kpiMeta}>
            <span>Confirmadas no período</span>
          </div>
        </div>

        <div className={styles.kpiCell}>
          <p className={styles.kpiLabel}>
            Saídas do Mês
            <ArrowDownCircle size={14} className="text-muted-foreground" />
          </p>
          <p className={styles.kpiValue}>
            R$ {totaisDoMes.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className={styles.kpiMeta}>
            <span>Total debitado / liquidado</span>
          </div>
        </div>

        <div className={styles.kpiCell}>
          <p className={styles.kpiLabel}>
            Pendências
            <Clock size={14} className="text-amber-500" />
          </p>
          <p className={cn(styles.kpiValue, transacoesPendentes.length > 0 && 'text-amber-600 dark:text-amber-400')}>
            {transacoesPendentes.length} {transacoesPendentes.length === 1 ? 'pendente' : 'pendentes'}
          </p>
          <div className={styles.kpiMeta}>
            <span>Aguardando liquidação</span>
          </div>
        </div>
      </section>

      {/* 3. MAIN DASHBOARD GRID */}
      <div className={styles.mainGrid}>
        
        {/* COLUNA ESQUERDA: LANÇAMENTOS E PENDÊNCIAS */}
        <div className={styles.leftColumn}>
          
          {/* CARD LANÇAMENTOS */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleArea}>
                <span className={styles.cardIcon}><DollarSign size={16} /></span>
                <h2 className={styles.cardTitle}>Lançamentos</h2>
              </div>
              
              <div className={styles.cardActionArea}>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <button className={styles.btnPrimaryDark}>
                      <Plus size={14} /> Novo
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Lançamento Rápido</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Tipo</Label>
                          <Select value={formData.type} onValueChange={(val) => handleInputChange('type', val)}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Valor (R$)</Label>
                          <Input type="number" step="0.01" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} placeholder="0,00" required className="h-9 font-mono" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Descrição</Label>
                        <Input value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Ex: Mercado, Assinatura..." required className="h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium">Categoria</Label>
                        <Select value={formData.category} onValueChange={(val) => handleInputChange('category', val)}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {categorias.filter(c => c.type === (formData.type === 'income' ? 'entrada' : 'saida')).map((cat, idx) => (
                              <SelectItem key={idx} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full h-9 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 font-medium">
                        Confirmar Lançamento
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* SEGMENTED CONTROL */}
            <div className={styles.segmentedControl}>
              <button
                type="button"
                onClick={() => setAbaAtiva('expense')}
                className={cn(styles.segmentBtn, abaAtiva === 'expense' && styles.segmentBtnActive)}
              >
                Despesas
              </button>
              <button
                type="button"
                onClick={() => setAbaAtiva('income')}
                className={cn(styles.segmentBtn, abaAtiva === 'income' && styles.segmentBtnActive)}
              >
                Receitas
              </button>
            </div>

            {/* LISTA DE TRANSAÇÕES */}
            <div className={styles.cardContentScroll}>
              {loading ? (
                <div className={styles.emptyState}>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-500"></div>
                </div>
              ) : transacoesFiltradas.length === 0 ? (
                <div className={styles.emptyState}>
                  <Zap size={20} className="text-muted-foreground opacity-40" />
                  <p className={styles.emptyText}>Nenhum lançamento no período.</p>
                </div>
              ) : (
                <div>
                  {transacoesFiltradas.map((t) => (
                    <div key={t.id} className={styles.listRow}>
                      <div className={styles.itemMain}>
                        <span className={styles.itemTitle}>{t.description}</span>
                        <div className={styles.itemMeta}>
                          <span>{formatDateForDisplay(t.transaction_date)}</span>
                          <span>•</span>
                          <span className={styles.itemCategoryTag}>{t.category || 'Geral'}</span>
                        </div>
                      </div>
                      <div className={cn(styles.itemValue, abaAtiva === 'income' ? styles.itemValuePositive : styles.itemValueNegative)}>
                        {abaAtiva === 'expense' ? '-' : '+'} R$ {(t.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CARD PENDÊNCIAS */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleArea}>
                <span className={styles.cardIcon}><Clock size={16} /></span>
                <h2 className={styles.cardTitle}>Pendências a Liquidar</h2>
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {transacoesPendentes.length}
              </Badge>
            </div>

            <div className={styles.cardContentScroll}>
              {loading ? (
                <div className={styles.emptyState}>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                </div>
              ) : transacoesPendentes.length === 0 ? (
                <div className={styles.emptyState}>
                  <CheckCircle size={20} className="text-emerald-500 opacity-60" />
                  <p className={styles.emptyText}>Tudo em dia! Sem pendências.</p>
                </div>
              ) : (
                <div>
                  {transacoesPendentes.map((t) => (
                    <div key={t.id} className={styles.listRow}>
                      <div className={styles.itemMain}>
                        <span className={styles.itemTitle}>{t.description}</span>
                        <div className={styles.itemMeta}>
                          <span className={t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                            {t.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                          <span>•</span>
                          <span>{formatDateForDisplay(t.transaction_date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={cn(styles.itemValue, t.type === 'income' ? styles.itemValuePositive : styles.itemValueNegative)}>
                          R$ {(t.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        
                        <button 
                          className={styles.btnConfirmItem}
                          title="Confirmar lançamento"
                          onClick={() => confirmarTransacao(t.id)}
                        >
                          <CheckCircle size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: VISÃO POR CONTA, CARTÕES, METAS E AGENDA */}
        <div className={styles.rightColumn}>
          
          {/* VISÃO POR INSTITUIÇÃO (GRÁFICO RECHARTS) */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleArea}>
                <span className={styles.cardIcon}><Landmark size={16} /></span>
                <h2 className={styles.cardTitle}>Saldos por Instituição</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Consolidado</span>
                <span className={cn('text-sm font-semibold font-mono', saldoTotalGlobal < 0 && 'text-rose-600')}>
                  R$ {saldoTotalGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className={styles.cardContent}>
              <div className={styles.chartContainer}>
                {loading ? (
                  <div className={styles.emptyState}>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-500"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGraficoSaldos} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                        dy={6}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'var(--text-muted)', fontSize: 11 }} 
                        tickFormatter={(val) => `R$${Math.round(val/1000)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface-elevated)' }} />
                      <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={36}>
                        {dadosGraficoSaldos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.value < 0 ? '#e11d48' : '#18181b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* CARTÕES DE CRÉDITO */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleArea}>
                <span className={styles.cardIcon}><CreditCard size={16} /></span>
                <h2 className={styles.cardTitle}>Cartões de Crédito</h2>
              </div>
              <button className={styles.btnOutline} onClick={() => navigate('/credit-cards')}>
                Gerenciar cartões
              </button>
            </div>
            
            <div className={styles.cardContent}>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : cartoes.length === 0 ? (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>Nenhum cartão cadastrado.</p>
                  <button className={cn(styles.btnOutline, 'mt-2')} onClick={() => navigate('/credit-cards')}>
                    Adicionar Cartão
                  </button>
                </div>
              ) : (
                <div className={styles.cardsGrid}>
                  {cartoes.map(cartao => {
                    const bankDomain = getBankLogo(cartao.name);
                    const percUsado = cartao.limit > 0 ? (cartao.usado / cartao.limit) * 100 : 0;
                    
                    return (
                      <div key={cartao.id} className={styles.cardItem}>
                        <div className={styles.cardItemTop}>
                          <div className={styles.cardItemBrand}>
                            <div className={styles.cardLogoBox}>
                              {bankDomain ? (
                                <img src={`https://www.google.com/s2/favicons?domain=${bankDomain}&sz=64`} alt="Banco" className={styles.cardLogoImg} />
                              ) : (
                                <CreditCard size={14} className="text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className={styles.cardName}>{cartao.name}</p>
                              <span className={styles.cardDigits}>•••• {cartao.last_digits || '0000'}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => abrirModalGasto(cartao)} 
                            className={styles.btnIcon} 
                            title="Lançar gasto neste cartão"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* PROGRESS BAR */}
                        <div className={styles.cardProgressTrack}>
                          <div 
                            className={cn(styles.cardProgressFill, percUsado > 80 && styles.cardProgressFillDanger)} 
                            style={{ width: `${Math.min(percUsado, 100)}%` }}
                          />
                        </div>

                        <div className={styles.cardItemBottom}>
                          <div>
                            <p className={styles.cardMetricLabel}>Disponível</p>
                            <p className={styles.cardMetricValue}>R$ {cartao.disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          </div>
                          <div className="text-right">
                            <p className={styles.cardMetricLabel}>Limite Total</p>
                            <p className="text-xs text-muted-foreground font-mono">R$ {cartao.limit.toLocaleString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* METAS E EVENTOS */}
          <div className={styles.bottomRow}>
            
            {/* PRÓXIMOS EVENTOS */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                  <span className={styles.cardIcon}><Calendar size={16} /></span>
                  <h2 className={styles.cardTitle}>Próximos Compromissos</h2>
                </div>
                <button onClick={() => navigate('/schedule')} className={styles.btnIcon} title="Ver agenda completa">
                  <Edit size={13} />
                </button>
              </div>
              
              <div className={styles.cardContentScroll} style={{ minHeight: '140px', maxHeight: '180px' }}>
                {eventosProximos.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Nenhum compromisso nos próximos 7 dias.</p>
                  </div>
                ) : (
                  <div>
                    {eventosProximos.map(e => (
                      <div key={e.id} className={styles.listRow}>
                        <div className={styles.itemMain}>
                          <span className={styles.itemTitle}>{e.title}</span>
                          <span className={styles.itemMeta}>{formatDateForDisplay(e.date)}</span>
                        </div>
                        {e.value && (
                          <span className={styles.itemValue}>R$ {e.value.toLocaleString('pt-BR')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className={styles.cardFooter}>
                <button className={styles.btnOutline} onClick={() => setIsEventoModalOpen(true)}>
                  <Plus size={13} /> Novo Evento
                </button>
              </div>
            </div>

            {/* METAS ATIVAS */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitleArea}>
                  <span className={styles.cardIcon}><Target size={16} /></span>
                  <h2 className={styles.cardTitle}>Metas Ativas</h2>
                </div>
                <button onClick={() => navigate('/goals')} className={styles.btnIcon} title="Ver todas as metas">
                  <Edit size={13} />
                </button>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.metaStatsGrid}>
                  <div className={styles.metaStatBox}>
                    <p className={styles.metaStatLabel}>Objetivo Total</p>
                    <p className={styles.metaStatVal}>R$ {valorTotalMetas.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className={styles.metaStatBox}>
                    <p className={styles.metaStatLabel}>Acumulado</p>
                    <p className={cn(styles.metaStatVal, 'text-emerald-600 dark:text-emerald-400')}>
                      R$ {valorAcumuladoMetas.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
                    <span>Progresso global</span>
                    <span>{valorTotalMetas > 0 ? ((valorAcumuladoMetas / valorTotalMetas) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div 
                      className={styles.progressBarFill} 
                      style={{ width: `${valorTotalMetas > 0 ? Math.min((valorAcumuladoMetas / valorTotalMetas) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-center mt-1">
                    Faltam R$ {Math.max(valorRestanteMetas, 0).toLocaleString('pt-BR')} para atingir
                  </p>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.btnOutline} onClick={() => setIsAddValorMetaModalOpen(true)}>
                  <DollarSign size={13} /> Injetar Capital
                </button>
              </div>
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
  );
};

export default Inicio;