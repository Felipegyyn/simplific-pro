import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TICKER_DATA = [
  { symbol: 'PETR4',  price: 38.50,  change: +1.2  },
  { symbol: 'VALE3',  price: 62.10,  change: -0.8  },
  { symbol: 'ITUB4',  price: 34.75,  change: +0.5  },
  { symbol: 'BBDC4',  price: 15.90,  change: -1.1  },
  { symbol: 'MGLU3',  price:  9.20,  change: +2.3  },
  { symbol: 'MXRF11', price: 10.40,  change: -0.5  },
  { symbol: 'KNRI11', price: 152.30, change: +0.3  },
  { symbol: 'HGLG11', price: 163.80, change: -0.2  },
  { symbol: 'XPML11', price:  98.50, change: +0.7  },
  { symbol: 'BBPO11', price: 138.60, change: +1.0  },
  { symbol: 'USD',    price:  5.45,  change: +0.4  },
  { symbol: 'EUR',    price:  5.92,  change: -0.1  },
  { symbol: 'BTC',    price: 98420,  change: +3.2  },
  { symbol: 'IBOV',   price: 128540, change: +0.6  },
];

const TickerItem = ({ symbol, price, change }) => {
  const isPositive = change >= 0;
  const color = isPositive ? 'text-emerald-400' : 'text-red-400';
  const Icon = isPositive ? TrendingUp : TrendingDown;

  const formattedPrice = price >= 1000
    ? price.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : price.toFixed(2);

  return (
    <span className="inline-flex items-center gap-1.5 mx-6 whitespace-nowrap text-sm font-medium">
      <span className="text-gray-300 font-semibold tracking-wide">{symbol}</span>
      <span className="text-white">R$ {formattedPrice}</span>
      <span className={`inline-flex items-center gap-0.5 ${color}`}>
        <Icon className="h-3 w-3" />
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    </span>
  );
};

const StockTicker = () => {
  // Duplica a lista para criar o efeito de loop contínuo sem salto
  const items = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div className="bg-slate-900 border-b border-slate-700 overflow-hidden h-9 flex items-center">
      <div
        className="flex"
        style={{
          animation: 'ticker-scroll 40s linear infinite',
          willChange: 'transform',
        }}
      >
        {items.map((item, i) => (
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
