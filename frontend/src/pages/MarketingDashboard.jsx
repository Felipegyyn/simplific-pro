import React, { useState, useEffect } from 'react';
import api from '../services/api'; 
import { Megaphone, RefreshCw, Power, AlertCircle, Loader2 } from 'lucide-react';

const MarketingDashboard = () => {
  // Inicializa como array vazio para evitar erros
  const [campaigns, setCampaigns] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null); 

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log("--- [DEBUG] Buscando campanhas... ---");
      const response = await api.get('/api/marketing/campaigns');
      
      console.log("--- [DEBUG] Resposta recebida:", response.data); // <--- OLHE ISSO NO CONSOLE

      // BLINDAGEM: Só atualiza se for um Array. Se não for, assume vazio.
      if (Array.isArray(response.data)) {
        setCampaigns(response.data);
      } else {
        console.error("ERRO CRÍTICO: Dados recebidos não são uma lista!", response.data);
        setCampaigns([]); // Força lista vazia para não quebrar a tela
        setError('Erro: Formato de dados inválido recebido do servidor.');
      }

    } catch (err) {
      console.error("--- [DEBUG] Erro na requisição:", err);
      if (err.response && err.response.status === 403) {
        setError('Acesso negado: Seu usuário não é Admin.');
      } else if (err.response && err.response.status === 404) {
        setError('Erro 404: Rota não encontrada. Verifique o prefixo /api');
      } else {
        setError('Falha ao carregar campanhas. Verifique o console.');
      }
      setCampaigns([]); // Garante que não quebra no erro
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setUpdating(id);
    try {
      await api.post(`/api/marketing/campaigns/${id}/toggle`, { status: newStatus });
      
      // Atualiza localmente apenas se campaigns for um array válido
      if (Array.isArray(campaigns)) {
          setCampaigns(campaigns.map(c => 
            c.id === id ? { ...c, status: newStatus } : c
          ));
      }
    } catch (err) {
      alert("Erro ao alterar status no Facebook.");
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateBudget = async (id, newBudget) => {
    if (!newBudget || newBudget < 5) return alert("Mínimo R$ 5,00");
    
    setUpdating(id);
    try {
      await api.post(`/api/marketing/campaigns/${id}/budget`, { budget: parseFloat(newBudget) });
      alert("Orçamento atualizado com sucesso!");
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Megaphone size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Tráfego</h1>
            <p className="text-gray-500 text-sm">Controle suas campanhas do Meta Ads</p>
          </div>
        </div>
        <button 
          onClick={fetchCampaigns}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
        >
          <RefreshCw size={18} />
          Atualizar Dados
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4">Status</th>
                <th className="p-4">Campanha</th>
                <th className="p-4">Gasto Total</th>
                <th className="p-4 w-48">Orçamento Diário (R$)</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* BLINDAGEM EXTRA NO MAP */}
              {Array.isArray(campaigns) && campaigns.map((camp) => (
                <tr key={camp.id} className={`hover:bg-gray-50 transition-colors ${updating === camp.id ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      camp.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {camp.status === 'ACTIVE' ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{camp.name}</td>
                  <td className="p-4 text-gray-600">
                    R$ {camp.total_spend ? camp.total_spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-400 text-sm">R$</span>
                      <input 
                        type="number"
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-sm"
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
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
              
              {(!Array.isArray(campaigns) || campaigns.length === 0) && !error && !loading && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Nenhuma campanha encontrada no Facebook.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;