import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { 
  Megaphone, RefreshCw, Power, AlertCircle, Loader2, 
  TrendingUp, MousePointer, DollarSign, BarChart3, Users, ShoppingCart 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const MarketingDashboard = () => {
  const [campaigns, setCampaigns] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null); 

  // Estados para KPIs Gerais
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0); // Novo KPI
  const [avgCPC, setAvgCPC] = useState(0);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/api/marketing/campaigns');
      const actualData = response.data || response;

      if (Array.isArray(actualData)) {
        setCampaigns(actualData);
        calculateKPIs(actualData);
      } else {
        setCampaigns([]);
        setError('Erro no formato de dados.');
      }

    } catch (err) {
      console.error(err);
      setError('Falha ao carregar dados do Facebook.');
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (data) => {
    const spend = data.reduce((acc, curr) => acc + (curr.total_spend || 0), 0);
    const clicks = data.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
    const leads = data.reduce((acc, curr) => acc + (curr.leads || 0), 0); // Soma leads
    
    const cpc = clicks > 0 ? spend / clicks : 0;

    setTotalSpend(spend);
    setTotalLeads(leads);
    setAvgCPC(cpc);
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setUpdating(id);
    try {
      await api.post(`/api/marketing/campaigns/${id}/toggle`, { status: newStatus });
      
      if (Array.isArray(campaigns)) {
          const updatedList = campaigns.map(c => 
            c.id === id ? { ...c, status: newStatus } : c
          );
          setCampaigns(updatedList);
      }
    } catch (err) {
      alert("Erro ao alterar status.");
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateBudget = async (id, newBudget) => {
    if (!newBudget || newBudget < 5) return alert("Mínimo R$ 5,00");
    setUpdating(id);
    try {
      await api.post(`/api/marketing/campaigns/${id}/budget`, { budget: parseFloat(newBudget) });
      alert("Orçamento atualizado!");
    } catch (err) {
      alert("Erro ao atualizar orçamento.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" /> Gestão de Tráfego
          </h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral das suas campanhas Meta Ads</p>
        </div>
        <button 
          onClick={fetchCampaigns}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium shadow-sm"
        >
          <RefreshCw size={16} /> Atualizar
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* --- KPIS (CARDS) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Users size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Total de Leads</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    {totalLeads.toLocaleString('pt-BR')}
                </h3>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <TrendingUp size={24} />
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">CPC Médio</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    R$ {avgCPC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
            </div>
        </div>
      </div>

      {/* --- GRÁFICO E TABELA (GRID) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gráfico de Barras */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={20} className="text-gray-400" /> Comparativo de Investimento
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaigns}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" hide />
                        <YAxis tickFormatter={(val) => `R$${val}`} stroke="#9ca3af" fontSize={12} />
                        <Tooltip 
                            formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto Total']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="total_spend" radius={[4, 4, 0, 0]}>
                            {campaigns.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.status === 'ACTIVE' ? '#10b981' : '#9ca3af'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Tabela Detalhada */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Detalhamento das Campanhas</h3>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                    <th className="p-4">Status</th>
                    <th className="p-4">Campanha</th>
                    <th className="p-4 text-center">Resultados</th> {/* COLUNA NOVA */}
                    <th className="p-4 text-right">Gasto Total</th>
                    <th className="p-4 w-40">Orçamento/Dia</th>
                    <th className="p-4 text-center">Ações</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {Array.isArray(campaigns) && campaigns.map((camp) => (
                    <tr key={camp.id} className={`hover:bg-gray-50 transition-colors ${updating === camp.id ? 'opacity-50 pointer-events-none' : ''}`}>
                    <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        camp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                        {camp.status === 'ACTIVE' ? 'ATIVO' : 'PAUSADO'}
                        </span>
                    </td>
                    <td className="p-4 font-medium text-gray-900 max-w-xs truncate" title={camp.name}>
                        {camp.name}
                    </td>
                    
                    {/* --- CÉLULA DE RESULTADOS --- */}
                    <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                            {camp.purchases > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-bold">
                                    <ShoppingCart size={12} /> {camp.purchases} Vendas
                                </span>
                            )}
                            {camp.leads > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                                    <Users size={12} /> {camp.leads} Leads
                                </span>
                            )}
                            {camp.purchases === 0 && camp.leads === 0 && (
                                <span className="text-gray-400 text-xs">{camp.clicks} Cliques</span>
                            )}
                        </div>
                    </td>

                    <td className="p-4 text-right font-bold text-gray-900">
                        R$ {camp.total_spend ? camp.total_spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </td>
                    <td className="p-4">
                        <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                        <input 
                            type="number"
                            className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                            defaultValue={camp.daily_budget}
                            onBlur={(e) => {
                            if (parseFloat(e.target.value) !== camp.daily_budget) {
                                if(window.confirm(`Alterar orçamento para R$ ${e.target.value}?`)) {
                                handleUpdateBudget(camp.id, e.target.value);
                                }
                            }
                            }}
                        />
                        </div>
                    </td>
                    <td className="p-4 text-center">
                        <button 
                        onClick={() => handleToggle(camp.id, camp.status)}
                        disabled={updating === camp.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-colors uppercase ${
                            camp.status === 'ACTIVE'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                        >
                        <Power size={14} />
                        {camp.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;