import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { 
  Megaphone, RefreshCw, Power, AlertCircle, Loader2, 
  TrendingUp, DollarSign, BarChart3, Users, ShoppingCart, Wallet, Activity, CreditCard
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';

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
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" /> Cockpit de Tráfego
          </h1>
          <p className="text-gray-500 text-sm mt-1">Controle total da sua máquina de vendas</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium shadow-sm">
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {error && <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200"><AlertCircle size={20} /> {error}</div>}

      {/* --- KPIS SUPERIORES --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* CARD 1: Fatura Atual (Dívida/Gasto não faturado) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg z-10">
                <CreditCard size={24} />
            </div>
            <div className="z-10">
                <p className="text-sm text-gray-500 font-medium">Fatura Atual (Devido)</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    R$ {safeBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
        </div>

        {/* CARD 2: Investimento Total */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <DollarSign size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Investimento Total</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    R$ {totalSpend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
        </div>

        {/* CARD 3: Fundos Disponíveis (NOVO - Substituiu Leads) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 relative">
             <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-bl-full"></div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg z-10">
                <Wallet size={24} />
            </div>
            <div className="z-10">
                <p className="text-sm text-gray-500 font-medium">Fundos Disponíveis</p>
                <h3 className="text-2xl font-bold text-gray-900">
                     {/* Se for 0, mostra traço ou valor */}
                     {safeFunds > 0 
                        ? `R$ ${safeFunds.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                        : (safeBalance > 0 ? "Sob Consulta" : "Pré-pago/Limite") 
                     }
                </h3>
            </div>
        </div>

        {/* CARD 4: CPC */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <TrendingUp size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">CPC Médio</p>
                <h3 className="text-2xl font-bold text-gray-900">R$ {avgCPC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
        </div>
      </div>

      {/* --- ÁREA DE GRÁFICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* GRÁFICO 1: Performance Recente (7 Dias) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-blue-500" /> Performance da Conta (7 Dias)
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}> 
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" />
                        <YAxis fontSize={12} stroke="#9ca3af" />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Clicks" stroke="#9ca3af" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Leads" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="Purchases" stroke="#22c55e" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* GRÁFICO 2: Investimento */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-gray-400" /> Investimento por Campanha
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaigns}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" hide />
                        <YAxis tickFormatter={(val) => `R$${val}`} stroke="#9ca3af" fontSize={12} />
                        <RechartsTooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="total_spend" radius={[4, 4, 0, 0]}>
                            {campaigns.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.status === 'ACTIVE' ? '#10b981' : '#9ca3af'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
      
      {/* ... TABELA DETALHADA (MANTENHA O CÓDIGO DA TABELA IGUAL AO ANTERIOR) ... */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Detalhamento das Campanhas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4">Status</th>
                <th className="p-4">Campanha</th>
                <th className="p-4 text-center">Resultados</th>
                <th className="p-4 text-right">Gasto Total</th>
                <th className="p-4 w-40">Orçamento/Dia</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Array.isArray(campaigns) && campaigns.map((camp) => (
                <tr key={camp.id} className={`hover:bg-gray-50 transition-colors ${updating === camp.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${camp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {camp.status === 'ACTIVE' ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900 max-w-xs truncate" title={camp.name}>{camp.name}</td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                        {camp.purchases > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold"><ShoppingCart size={12} /> {camp.purchases} Vendas</span>}
                        {camp.leads > 0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold"><Users size={12} /> {camp.leads} Leads</span>}
                        {camp.purchases === 0 && camp.leads === 0 && <span className="text-gray-400 text-xs">{camp.clicks} Cliques</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right font-bold text-gray-900">R$ {camp.total_spend ? camp.total_spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
                  <td className="p-4">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                      <input 
                        type="number" className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        defaultValue={camp.daily_budget}
                        onBlur={(e) => { if (parseFloat(e.target.value) !== camp.daily_budget) { if(window.confirm(`Alterar para R$ ${e.target.value}?`)) handleUpdateBudget(camp.id, e.target.value); }}}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleToggle(camp.id, camp.status)} disabled={updating === camp.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-colors uppercase ${camp.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
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