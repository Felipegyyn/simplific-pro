import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton"; // Importe o Skeleton


// Componente para a lista de Ativos (Altas ou Baixas)
const MoversList = ({ title, data, colorClass }) => (
  <div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.ticker} className="flex justify-between items-center text-sm">
          <span className="font-medium">{item.ticker}</span>
          <div className="flex items-center gap-4">
            <span className={colorClass}>
              {item.change_percent > 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
            </span>
            <span className="font-bold w-16 text-right">R$ {item.price.toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Componente para o card de Moedas ou Cripto
const AssetCard = ({ title, data, isCrypto = false }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm">
      {data.map(item => (
        <div key={item.name} className="flex justify-between items-center">
          <span className="font-medium">{item.name}</span>
          {isCrypto ? (
            <div className="text-right">
              <p className={`font-bold ${item.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change_percent.toFixed(2)}%
              </p>
              <p>R$ {item.price?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          ) : (
            <p className="font-bold">R$ {item.buy?.toFixed(3)}</p>
          )}
        </div>
      ))}
    </CardContent>
  </Card>
);

// Componente principal do Home Broker
const HomeBroker = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // <-- ADICIONE AQUI
  const [mainChartData, setMainChartData] = useState(null); // <-- E AQUI

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/api/investments/market-data');
        setMarketData(response);
        setMainChartData(response.ibovespa); // <--- ADICIONE ESTA LINHA
      } catch (error) {
        console.error("Erro ao buscar dados de mercado:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  // ▼▼▼ ADICIONE A FUNÇÃO COMPLETA AQUI ▼▼▼
  const handleSearch = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    if (!searchTerm.trim()) return; // Não faz nada se a busca for vazia

    try {
      // Mostra um feedback de carregamento no gráfico (opcional, mas bom)
      setMainChartData(null); 
      const response = await apiService.get(`/api/investments/ticker-details/${searchTerm}`);
      setMainChartData(response);
    } catch (error) {
      console.error("Erro ao buscar ativo:", error);
      alert(`Não foi possível encontrar o ativo "${searchTerm}".`);
      setMainChartData(marketData.ibovespa); // Volta para o Ibovespa em caso de erro
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-48 w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (!marketData) {
    return <p className="text-center text-red-500">Não foi possível carregar os dados do mercado.</p>;
  }

  const { ibovespa, top_gainers, top_losers, currencies, us_market } = marketData;
  const ibovColor = ibovespa.change_percent >= 0 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal (2/3 da tela) */}
        <div className="lg:col-span-2 space-y-6">
  <Card>
    <CardContent className="p-4">
      {/* O div abaixo agora contém toda a lógica da área do gráfico */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
        {/* Bloco de informações do Ativo (agora dinâmico) */}
        <div className='flex-1'>
          {/* Lógica de Carregamento e Exibição do Gráfico Principal */}
          {!mainChartData ? (
            // Mostra um esqueleto de carregamento enquanto busca
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-72" />
            </div>
          ) : (
            // Mostra os dados do ativo carregado (Ibovespa ou o buscado)
            <div>
              <h2 className="text-2xl font-bold">{mainChartData.name || 'Ibovespa'}</h2>
              <p className={`text-3xl font-bold ${mainChartData.change_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {mainChartData.current_price?.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                <span className="text-xl ml-2">{mainChartData.change_percent?.toFixed(2)}%</span>
              </p>
              <p className="text-xs text-gray-500">
                Fechamento anterior: {mainChartData.previous_close?.toLocaleString('pt-BR', {minimumFractionDigits: 2})} • Abertura: {mainChartData.open_price?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </p>
            </div>
          )}
        </div>

        {/* Formulário de Busca */}
        <div className="relative w-full sm:w-1/3">
          <form onSubmit={handleSearch}>
            <Input 
              placeholder="Ativo ou índice" 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {/* Área do Gráfico (também dinâmica) */}
      <div className="h-48">
        {!mainChartData || !mainChartData.chart_data ? (
            <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mainChartData.chart_data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <YAxis domain={['dataMin', 'dataMax']} hide />
              <Tooltip 
    contentStyle={{ 
        backgroundColor: '#fff', 
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '12px', 
        padding: '4px 8px' 
    }}
    labelStyle={{ fontWeight: 'bold', color: '#333' }}
    // A 'mágica' está nessas duas linhas abaixo:
    formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Preço']}
    labelFormatter={(label, payload) => {
        // payload[0].payload.time é o valor 'HH:MM' que vem da nossa API
        if (payload && payload.length) {
            return `Horário: ${payload[0].payload.time}`;
        }
        return label;
    }}
/>
              <Line type="monotone" dataKey="price" stroke={mainChartData.change_percent >= 0 ? '#10b981' : '#ef4444'} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ▼▼▼ ADICIONE O NOVO RODAPÉ AQUI ▼▼▼ */}
<div className="text-xs text-gray-500 mt-2 flex items-center">
    <Clock className="h-3 w-3 mr-1.5" />
    <span>Gráfico do dia (intradiário) com intervalo de 15 minutos.</span>
</div>
    </CardContent>
  </Card>

  {/* As listas de Maiores Altas e Baixas continuam iguais */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
    <MoversList title="✅ Maiores altas" data={top_gainers} colorClass="text-green-600" />
    <MoversList title="🔻 Maiores baixas" data={top_losers} colorClass="text-red-600" />
  </div>
</div>

        {/* Coluna Lateral (1/3 da tela) */}
        <div className="space-y-6">
          <AssetCard title="Moedas" data={currencies} />
          <AssetCard title="Mercado Americano" data={us_market} isCrypto />
        </div>
      </div>
    </div>
  );
};

export default HomeBroker;