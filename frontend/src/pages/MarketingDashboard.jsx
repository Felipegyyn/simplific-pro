import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { 
  Megaphone, RefreshCw, Power, AlertCircle, Loader2, 
  TrendingUp, DollarSign, BarChart3, Users, ShoppingCart, Wallet, Activity, CreditCard
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import styles from './MarketingDashboard.module.css';

const MarketingDashboard = () => {
  const [campaigns, setCampaigns] = useState([]); 
  
  // Inicialização segura
  const [accountInfo, setAccountInfo] = useState({ 
    balance: 0, 
    available_funds: 0,
    daily_chart: [] 
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null); 

  // KPIs Gerais
  const [totalSpend, setTotalSpend] = useState(0);
  const [avgCPC, setAvgCPC] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const campResponse = await api.get('/api/marketing/campaigns');
      const campData = campResponse.data || campResponse;

      const overviewResponse = await api.get('/api/marketing/overview');
      const overviewData = overviewResponse.data || overviewResponse;

      // Sanitização
      setAccountInfo({
        balance: overviewData?.balance || 0,
        available_funds: overviewData?.available_funds || 0,
        daily_chart: Array.isArray(overviewData?.daily_chart) ? overviewData.daily_chart : []
      });

      if (Array.isArray(campData)) {
        setCampaigns(campData);
        calculateKPIs(campData);
      } else {
        setCampaigns([]);
      }

    } catch (err) {
      console.error(err);
      setError('Não foi possível sincronizar com o Facebook agora.');
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (data) => {
    if (!Array.isArray(data)) return;
    const spend = data.reduce((acc, curr) => acc + (curr.total_spend || 0), 0);
    const clicks = data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
    const cpc = clicks > 0 ? spend / clicks : 0;
    setTotalSpend(spend);
    setAvgCPC(cpc);
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setUpdating(id);
    try {
      await api.post(`/api/marketing/campaigns/${id}/toggle`, { status: newStatus });
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: newStatus } : c));
    } catch (err) { alert("Erro ao alterar status."); } 
    finally { setUpdating(null); }
  };

  const handleUpdateBudget = async (id, newBudget) => {
    if (!newBudget || newBudget < 5) return alert("Mínimo R$ 5,00");
    setUpdating(id);
    try {
      await api.post(`/api/marketing/campaigns/${id}/budget`, { budget: parseFloat(newBudget) });
      alert("Orçamento atualizado!");
    } catch (err) { alert("Erro ao atualizar orçamento."); } 
    finally { setUpdating(null); }
  };

  // Valores Seguros
  const safeBalance = accountInfo?.balance ?? 0;
  const safeFunds = accountInfo?.available_funds ?? 0;
  
  // Gráfico agora usa os dados reais de ads, não mais do pixel instável
  const chartData = (accountInfo?.daily_chart && accountInfo.daily_chart.length > 0) 
    ? accountInfo.daily_chart 
    : [
        { name: 'Hoje', Clicks: 0, Leads: 0, Purchases: 0 }
      ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer + " p-6 max-w-7xl mx-auto space-y-8 pb-20"}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle + " flex items-center gap-2"}>
            <Megaphone className="text-cyan-600 dark:text-cyan-400" /> Cockpit de Tráfego
          </h1>
          <p className={styles.pageSubtitle}>Controle total da sua máquina de vendas</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg transition-colors font-medium shadow-sm">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {error && <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg border border-red-200 dark:border-red-500/20"><AlertCircle size={20} /> {error}</div>}

      {/* --- KPIS SUPERIORES --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* CARD 1: Fatura Atual (Dívida/Gasto não faturado) */}
        <div className={`${styles.premiumCard} flex flex-row items-center gap-4 relative overflow-hidden p-6`}>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg z-10 border border-red-100 dark:border-red-500/20">
                <CreditCard size={24} />
            </div>
            <div className="z-10">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fatura Atual (Devido)</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    R$ {safeBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
        </div>

        {/* CARD 2: Investimento Total */}
        <div className={`${styles.premiumCard} flex flex-row items-center gap-4 p-6`}>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                <DollarSign size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Investimento Total</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    R$ {totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
        </div>

        {/* CARD 3: Fundos Disponíveis (NOVO - Substituiu Leads) */}
        <div className={`${styles.premiumCard} flex flex-row items-center gap-4 relative overflow-hidden p-6`}>
             <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-400/10 rounded-bl-full"></div>
            <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 rounded-lg z-10 border border-cyan-100 dark:border-cyan-500/20">
                <Wallet size={24} />
            </div>
            <div className="z-10">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fundos Disponíveis</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                     {/* Se for 0, mostra traço ou valor */}
                     {safeFunds > 0 
                        ? `R$ ${safeFunds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                        : (safeBalance > 0 ? "Sob Consulta" : "Pré-pago/Limite") 
                     }
                </h3>
            </div>
        </div>

        {/* CARD 4: CPC */}
        <div className={`${styles.premiumCard} flex flex-row items-center gap-4 p-6`}>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-lg border border-purple-100 dark:border-purple-500/20">
                <TrendingUp size={24} />
            </div>
            <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">CPC Médio</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">R$ {avgCPC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
        </div>
      </div>

      {/* --- ÁREA DE GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICO 1: Performance Recente (7 Dias) */}
        <div className={`${styles.premiumCard} p-6`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-cyan-500 dark:text-cyan-400" /> Performance da Conta (7 Dias)
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}> 
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                        <XAxis dataKey="name" fontSize={12} stroke="var(--text-muted)" />
                        <YAxis fontSize={12} stroke="var(--text-muted)" />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--surface-main)', color: 'var(--text-main)' }} />
                        <Legend wrapperStyle={{ color: 'var(--text-main)' }} />
                        <Line type="monotone" dataKey="Clicks" stroke="var(--text-muted)" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Leads" stroke="#06b6d4" strokeWidth={2} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Purchases" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* GRÁFICO 2: Investimento */}
        <div className={`${styles.premiumCard} p-6`}>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-slate-400" /> Investimento por Campanha
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaigns}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                        <XAxis dataKey="name" hide />
                        <YAxis tickFormatter={(val) => `R$${val}`} stroke="var(--text-muted)" fontSize={12} />
                        <RechartsTooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']} contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', backgroundColor: 'var(--surface-main)', color: 'var(--text-main)' }} />
                        <Bar dataKey="total_spend" radius={[4, 4, 0, 0]}>
                            {campaigns.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.status === 'ACTIVE' ? '#10b981' : 'var(--text-muted)'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* ... TABELA DETALHADA ... */}
      <div className={`${styles.premiumCard} overflow-hidden`}>
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Detalhamento das Campanhas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/10 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">
                <th className="p-4">Status</th>
                <th className="p-4">Campanha</th>
                <th className="p-4 text-center">Resultados</th>
                <th className="p-4 text-right">Gasto Total</th>
                <th className="p-4 w-40">Orçamento/Dia</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {Array.isArray(campaigns) && campaigns.map((camp) => (
                <tr key={camp.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${updating === camp.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${camp.status === 'ACTIVE' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                      {camp.status === 'ACTIVE' ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-900 dark:text-slate-200 max-w-xs truncate" title={camp.name}>{camp.name}</td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                        {camp.purchases > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-500/20"><ShoppingCart size={12} /> {camp.purchases} Vendas</span>}
                        {camp.leads > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 text-xs font-bold border border-cyan-100 dark:border-cyan-500/20"><Users size={12} /> {camp.leads} Leads</span>}
                        {camp.purchases === 0 && camp.leads === 0 && <span className="text-slate-400 dark:text-slate-500 text-xs">{camp.clicks} Cliques</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900 dark:text-slate-200">R$ {camp.total_spend ? camp.total_spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
                  <td className="p-4">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-400 text-sm">R$</span>
                      <input 
                        type="number" className="w-full pl-8 pr-3 py-1.5 border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 rounded-md focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-sm text-slate-900 dark:text-white"
                        defaultValue={camp.daily_budget}
                        onBlur={(e) => { if (parseFloat(e.target.value) !== camp.daily_budget) { if(window.confirm(`Alterar para R$ ${e.target.value}?`)) handleUpdateBudget(camp.id, e.target.value); }}}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleToggle(camp.id, camp.status)} disabled={updating === camp.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-colors uppercase border ${camp.status === 'ACTIVE' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-900/40' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'}`}>
                      <Power size={14} /> {camp.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;