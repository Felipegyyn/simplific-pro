import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import apiService from '../services/api';

// ---------------------------------------------------------------------------
// Dados de fallback usados enquanto a API não responde (ou em caso de erro)
// ---------------------------------------------------------------------------
const FALLBACK_DATA = [
  { symbol: 'IBOV',   price: 128540, change: +0.6  },
  { symbol: 'PETR4',  price: 38.50,  change: +1.2  },
  { symbol: 'VALE3',  price: 62.10,  change: -0.8  },
  { symbol: 'MXRF11', price: 10.40,  change: -0.5  },
  { symbol: 'USD',    price:  5.45,  change: null   },
  { symbol: 'EUR',    price:  5.92,  change: null   },
  { symbol: 'BTC',    price: 98420,  change: +3.2  },
];

// ---------------------------------------------------------------------------
// Formata um número de preço para exibição
// ---------------------------------------------------------------------------
const formatPrice = (price) => {
  if (price == null) return '—';
  if (price >= 1000) {
    return price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return Number(price).toFixed(2);
};

// ---------------------------------------------------------------------------
// Item individual da fita
// ---------------------------------------------------------------------------
const TickerItem = ({ symbol, price, change }) => {
  const hasChange = change != null;
  const isPositive = hasChange && change >= 0;
  const color = !hasChange ? 'text-gray-400' : isPositive ? 'text-emerald-400' : 'text-red-400';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span className="inline-flex items-center gap-1.5 mx-6 whitespace-nowrap text-sm font-medium">
      <span className="text-gray-300 font-semibold tracking-wide">{symbol}</span>
      <span className="text-white">R$ {formatPrice(price)}</span>
      {hasChange && (
        <span className={`inline-flex items-center gap-0.5 ${color}`}>
          <Icon className="h-3 w-3" />
          {isPositive ? '+' : ''}{Number(change).toFixed(1)}%
        </span>
      )}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Skeleton de carregamento — mesma altura da fita real
// ---------------------------------------------------------------------------
const TickerSkeleton = () => (
  <div className="bg-slate-900 border-b border-slate-700 h-9 flex items-center px-6 gap-8 overflow-hidden">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-2 animate-pulse">
        <div className="h-3 w-12 bg-slate-700 rounded" />
        <div className="h-3 w-16 bg-slate-700 rounded" />
        <div className="h-3 w-10 bg-slate-700 rounded" />
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Converte a resposta da API em um array uniforme { symbol, price, change }
// ---------------------------------------------------------------------------
const buildTickerItems = (data) => {
  const items = [];

  // Ibovespa
  if (data.ibovespa) {
    items.push({
      symbol: 'IBOV',
      price: data.ibovespa.current_price,
      change: data.ibovespa.change_percent,
    });
  }

  // Mercado americano (S&P 500, Nasdaq, etc.)
  if (Array.isArray(data.us_market)) {
    data.us_market.forEach((m) =>
      items.push({ symbol: m.name || m.ticker || 'US', price: m.current_price ?? m.price, change: m.change_percent })
    );
  } else if (data.us_market) {
    items.push({
      symbol: data.us_market.name || 'S&P500',
      price: data.us_market.current_price ?? data.us_market.price,
      change: data.us_market.change_percent,
    });
  }

  // Top gainers (até 5)
  if (Array.isArray(data.top_gainers)) {
    data.top_gainers.slice(0, 5).forEach((g) =>
      items.push({ symbol: g.ticker, price: g.price, change: g.change_percent })
    );
  }

  // Top losers (até 5)
  if (Array.isArray(data.top_losers)) {
    data.top_losers.slice(0, 5).forEach((l) =>
      items.push({ symbol: l.ticker, price: l.price, change: l.change_percent })
    );
  }

  // Moedas (sem variação percentual disponível na rota)
  if (Array.isArray(data.currencies)) {
    data.currencies.forEach((c) =>
      items.push({ symbol: c.name, price: c.buy, change: null })
    );
  }

  // Cripto (se vier no payload)
  if (Array.isArray(data.crypto)) {
    data.crypto.forEach((c) =>
      items.push({ symbol: c.name, price: c.price, change: c.change_percent })
    );
  }

  return items;
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
const StockTicker = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const response = await apiService.get('/api/investments/market-data');
        if (!cancelled) {
          const built = buildTickerItems(response);
          setItems(built.length > 0 ? built : FALLBACK_DATA);
        }
      } catch {
        if (!cancelled) setItems(FALLBACK_DATA);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <TickerSkeleton />;

  // Duplica para garantir loop contínuo sem salto visual
  const loopItems = [...items, ...items];
  // Velocidade proporcional à quantidade de itens
  const duration = Math.max(30, loopItems.length * 2.5);

  return (
    <div className="bg-slate-900 border-b border-slate-700 overflow-hidden h-9 flex items-center">
      <div
        className="flex"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {loopItems.map((item, i) => (
          <TickerItem key={`${item.symbol}-${i}`} {...item} />
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default StockTicker;
