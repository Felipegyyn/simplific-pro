import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Clock, TrendingUp, TrendingDown, DollarSign, Globe, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';

// Componente para a lista de Ativos (Altas ou Baixas)
const MoversList = ({ title, data, isPositive }) => (
  <div className="glass-panel p-5 border-white/5 relative overflow-hidden group">
    <div className={cn("absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl opacity-5", isPositive ? "bg-emerald-500" : "bg-red-500")}></div>
    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
      {isPositive ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-red-400" />}
      {title}
    </h3>
    <div className="space-y-4">
      {data.map(item => (
        <div key={item.ticker} className="flex justify-between items-center group/item transition-all hover:translate-x-1">
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm group-hover/item:text-cyan-400 transition-colors">{item.ticker}</span>
            <span className="text-[10px] text-slate-500 uppercase font-medium">B3 S.A.</span>
          </div>
          <div className="flex flex-col items-end">
            <span className={cn("text-xs font-black", isPositive ? "text-emerald-400" : "text-red-400")}>
              {item.change_percent > 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">R$ {item.price.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Componente para o card de Moedas ou Cripto
const AssetCard = ({ title, data, isCrypto = false, icon: Icon }) => (
  <div className="glass-panel p-6 border-white/5">
    <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
      <Icon size={14} className="text-cyan-400" />
      {title}
    </h3>
    <div className="space-y-5">
      {data.map(item => (
        <div key={item.name} className="flex justify-between items-center group/asset cursor-default">
          <span className="text-sm font-bold text-slate-200 group-hover/asset:text-white transition-colors">{item.name}</span>
          {isCrypto ? (
            <div className="text-right">
              <span className={cn("text-xs font-black block", item.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                {item.change_percent > 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
              </span>
              <span className="text-[10px] font-mono text-slate-500">R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          ) : (
            <Badge className="bg-white/5 border-white/10 text-cyan-400 font-mono text-[11px] px-2">R$ {item.buy?.toFixed(3)}</Badge>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Componente principal do Home Broker
const HomeBroker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [mainChartData, setMainChartData] = useState(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/investments/market-data');
        setMarketData(response);
        setMainChartData(response.ibovespa);
      } catch (error) {
        console.error("Erro ao buscar dados de mercado:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      setMainChartData(null);
      const response = await apiService.get(`/api/investments/ticker-details/${searchTerm}`);
      setMainChartData(response);
    } catch (error) {
      console.error("Erro ao buscar ativo:", error);
      setMainChartData(marketData.ibovespa);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full glass-panel bg-white/5 border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 w-full glass-panel bg-white/5 border-white/5" />
          <Skeleton className="h-48 w-full glass-panel bg-white/5 border-white/5" />
          <Skeleton className="h-48 w-full glass-panel bg-white/5 border-white/5" />
        </div>
      </div>
    );
  }

  if (!marketData) return null;

  const { ibovespa, top_gainers, top_losers, currencies, us_market } = marketData;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Coluna Principal (Gráfico e Movers) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div className='flex-1'>
                {!mainChartData ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-48 bg-white/5" />
                    <Skeleton className="h-10 w-64 bg-white/5" />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{mainChartData.name || 'Ibovespa'}</h2>
                      <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] uppercase font-black">Live</Badge>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <p className={cn("text-4xl font-black tracking-tighter", mainChartData.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {mainChartData.current_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <span className={cn("text-lg font-bold flex items-center gap-1", mainChartData.change_percent >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                        {mainChartData.change_percent > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        {mainChartData.change_percent?.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 flex items-center gap-3">
                      <span>Abertura: <span className="text-slate-600 dark:text-slate-300 font-mono">{mainChartData.open_price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span>Anterior: <span className="text-slate-600 dark:text-slate-300 font-mono">{mainChartData.previous_close?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></span>
                    </p>
                  </div>
                )}
              </div>

              <div className="relative w-full sm:w-1/3 group/search">
                <form onSubmit={handleSearch}>
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-500 group-focus-within/search:text-cyan-400 transition-colors" />
                  </div>
                  <input
                    placeholder="Buscar Ticker (ex: PETR4)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
              </div>
            </div>

            <div className="h-56 -mx-8 relative">
              {!mainChartData || !mainChartData.chart_data ? (
                <Skeleton className="h-full w-full bg-white/2" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mainChartData.chart_data}>
                    <defs>
                      <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={mainChartData.change_percent >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={mainChartData.change_percent >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(10px)', fontSize: '10px' }}
                      formatter={(value) => [formatCurrency(value), 'Preço']}
                      labelFormatter={(label, payload) => payload && payload.length ? `Horário: ${payload[0].payload.time}` : label}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke={mainChartData.change_percent >= 0 ? '#10b981' : '#f43f5e'}
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#chartColor)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="text-[10px] font-bold text-slate-500 mt-6 flex items-center uppercase tracking-widest gap-2">
              <Clock className="h-3 w-3 text-cyan-400" />
              <span>Gráfico intradiário • Intervalo 15m</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <MoversList title="Altas do Dia" data={top_gainers} isPositive />
            <MoversList title="Baixas do Dia" data={top_losers} isPositive={false} />
          </div>
        </div>

        {/* Coluna Laterall */}
        <div className="space-y-8">
          <AssetCard title="Câmbio / Moedas" data={currencies} icon={DollarSign} />
          <AssetCard title="Mercado Global" data={us_market} icon={Globe} isCrypto />

          <div className="glass-panel p-6 border-white/5 bg-gradient-to-br from-cyan-500/10 to-transparent relative overflow-hidden">
            <div className="relative z-10">
              <Zap className="h-6 w-6 text-cyan-400 mb-4" />
              <h4 className="text-sm font-bold text-white mb-2 tracking-tight">Análise em tempo real</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Sua carteira é sincronizada com dados oficiais da B3 e mercados internacionais 24 horas por dia.
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (value) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default HomeBroker;