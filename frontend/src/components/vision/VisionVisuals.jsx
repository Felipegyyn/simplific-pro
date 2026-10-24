// frontend/src/components/vision/VisionVisuals.jsx
import React from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, 
  CheckCircle2, Landmark, CreditCard as CardIcon, 
  Calendar, Clock, Video, Target, ExternalLink,
  Wallet, Sparkles, Building2
} from 'lucide-react';
import styles from './VisionVisuals.module.css';

// Formata valores em Real Brasileiro (BRL)
export const formatBRL = (val) => {
  return (Number(val) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

// ==============================================================================
// 1. GRÁFICO FINANCEIRO EXPLICATIVO (VisionFinanceChart)
// ==============================================================================
export const VisionFinanceChart = ({ data }) => {
  if (!data) return null;

  const { periodo, receitas = 0, despesas = 0, saldo = 0, taxa_poupanca = 0, categorias = [] } = data;

  const barData = [
    { name: 'Receitas', valor: receitas, fill: '#10b981' },
    { name: 'Despesas', valor: despesas, fill: '#f43f5e' }
  ];

  return (
    <div className={styles.glassCard}>
      <div className={styles.financeHeader}>
        <div className={styles.financeTitle}>
          <Wallet size={18} className="text-emerald-500" />
          <span>Balanço Financeiro</span>
        </div>
        <span className={styles.periodPill}>{periodo || 'Mês Atual'}</span>
      </div>

      {/* Grid de Métricas Chave */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricBox}>
          <div className={styles.metricLabel}>
            <ArrowDownLeft size={13} className="text-emerald-500" />
            <span>Receitas</span>
          </div>
          <div className={`${styles.metricValue} ${styles.metricPositive}`}>
            {formatBRL(receitas)}
          </div>
        </div>

        <div className={styles.metricBox}>
          <div className={styles.metricLabel}>
            <ArrowUpRight size={13} className="text-rose-500" />
            <span>Despesas</span>
          </div>
          <div className={`${styles.metricValue} ${styles.metricNegative}`}>
            {formatBRL(despesas)}
          </div>
        </div>

        <div className={styles.metricBox}>
          <div className={styles.metricLabel}>
            <Wallet size={13} />
            <span>Saldo Líquido</span>
          </div>
          <div className={`${styles.metricValue} ${saldo >= 0 ? styles.metricPositive : styles.metricNegative}`}>
            {formatBRL(saldo)}
          </div>
        </div>

        {taxa_poupanca > 0 && (
          <div className={styles.metricBox}>
            <div className={styles.metricLabel}>
              <Sparkles size={13} className="text-amber-500" />
              <span>Taxa Poupança</span>
            </div>
            <div className={`${styles.metricValue} ${styles.metricPositive}`}>
              {taxa_poupanca}%
            </div>
          </div>
        )}
      </div>

      {/* Gráfico Recharts Donut de Categorias ou Barras */}
      {categorias && categorias.length > 0 ? (
        <div className={styles.chartContainer}>
          <div style={{ width: '160px', height: '160px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorias}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categorias.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#10b981'} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value) => [formatBRL(value), 'Gasto']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backgroundColor: '#18181b',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.categoriesList}>
            {categorias.slice(0, 5).map((cat, idx) => (
              <div key={idx} className={styles.categoryItem}>
                <div className={styles.categoryDotName}>
                  <div className={styles.colorDot} style={{ backgroundColor: cat.color || '#10b981' }} />
                  <span>{cat.name}</span>
                </div>
                <span className={styles.categoryValue}>{formatBRL(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', height: '140px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={12} width={70} />
              <RechartsTooltip 
                formatter={(val) => [formatBRL(val), 'Total']} 
                contentStyle={{ borderRadius: '8px', backgroundColor: '#18181b', color: '#fff', fontSize: '12px' }} 
              />
              <Bar dataKey="valor" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ==============================================================================
// 2. RECIBO BANCÁRIO DIGITAL (VisionReceiptCard)
// ==============================================================================
export const VisionReceiptCard = ({ data }) => {
  if (!data) return null;

  const isEntrada = data.type_trans === 'entrada';

  return (
    <div className={styles.receiptCard}>
      <div className={styles.receiptTopBadge}>
        <CheckCircle2 size={18} className="text-emerald-500 animate-bounce" />
        <span>{data.title || 'Lançamento Confirmado'}</span>
      </div>

      <div className={`${styles.receiptAmount} ${isEntrada ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
        {isEntrada ? `+ ${formatBRL(data.value)}` : `- ${formatBRL(data.value)}`}
      </div>

      <div className={styles.receiptDetails}>
        <div className={styles.receiptRow}>
          <span className={styles.receiptRowLabel}>Descrição</span>
          <span className={styles.receiptRowValue}>{data.description}</span>
        </div>

        <div className={styles.receiptRow}>
          <span className={styles.receiptRowLabel}>Categoria</span>
          <span className={styles.receiptRowValue}>{data.category}</span>
        </div>

        {data.bank_account && (
          <div className={styles.receiptRow}>
            <span className={styles.receiptRowLabel}>Conta / Banco</span>
            <span className={styles.receiptRowValue}>{data.bank_account}</span>
          </div>
        )}

        {data.installments && data.installments > 1 && (
          <div className={styles.receiptRow}>
            <span className={styles.receiptRowLabel}>Parcelas</span>
            <span className={styles.receiptRowValue}>{data.installments}x</span>
          </div>
        )}

        <div className={styles.receiptRow}>
          <span className={styles.receiptRowLabel}>Data e Hora</span>
          <span className={styles.receiptRowValue}>{data.timestamp || 'Hoje'}</span>
        </div>
      </div>

      <div className={styles.receiptFooter}>
        <span>Sincronizado automaticamente com o Simplific Pro</span>
      </div>
    </div>
  );
};

// ==============================================================================
// 3. CARTÃO DE CRÉDITO COM BARRA DE LIMITE (VisionCreditCardWidget)
// ==============================================================================
export const VisionCreditCardWidget = ({ data }) => {
  if (!data) return null;
  const cards = Array.isArray(data) ? data : [data];

  return (
    <div className="flex flex-col gap-3 w-full">
      {cards.map((card, idx) => {
        const percentUsed = card.limit_total > 0 
          ? Math.min(100, Math.round((card.invoice_current / card.limit_total) * 100)) 
          : 0;

        return (
          <div key={idx} className={styles.creditCardWidget}>
            <div className={styles.cardGlint}></div>
            
            <div className={styles.cardHeaderRow}>
              <span className={styles.cardName}>{card.name || 'Cartão de Crédito'}</span>
              <div className={styles.cardChip}></div>
            </div>

            <div className={styles.cardBalanceRow}>
              <div className={styles.invoiceLabel}>Fatura Atual</div>
              <div className={styles.invoiceAmount}>{formatBRL(card.invoice_current)}</div>
            </div>

            <div className={styles.progressBarContainer}>
              <div className={styles.progressBarFill} style={{ width: `${percentUsed}%` }}></div>
            </div>

            <div className={styles.cardFooterDates}>
              <span>Disp: {formatBRL(card.limit_available)} ({100 - percentUsed}%)</span>
              <span>Vencimento: dia {card.due_day}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ==============================================================================
// 4. METAS COM BARRA DE PROGRESSO (VisionGoalWidget)
// ==============================================================================
export const VisionGoalWidget = ({ data }) => {
  if (!data) return null;
  const goals = Array.isArray(data) ? data : [data];

  return (
    <div className={styles.glassCard}>
      <div className={styles.financeHeader}>
        <div className={styles.financeTitle}>
          <Target size={18} className="text-emerald-500" />
          <span>Suas Metas Financeiras</span>
        </div>
      </div>

      {goals.map((g, idx) => (
        <div key={idx} className={styles.goalItem}>
          <div className={styles.goalHeader}>
            <span className={styles.goalName}>{g.name}</span>
            <span className={styles.goalPercent}>{g.percentage}%</span>
          </div>

          <div className={styles.progressBarContainer} style={{ height: '8px' }}>
            <div 
              className={styles.progressBarFill} 
              style={{ 
                width: `${Math.min(g.percentage, 100)}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)' 
              }}
            ></div>
          </div>

          <div className={styles.goalValues}>
            <span>Guardado: {formatBRL(g.current)}</span>
            <span>Alvo: {formatBRL(g.target)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==============================================================================
// 5. AGENDA & REUNIÕES GOOGLE MEET (VisionScheduleCard)
// ==============================================================================
export const VisionScheduleCard = ({ data }) => {
  if (!data) return null;
  const events = Array.isArray(data) ? data : [data];

  return (
    <div className={styles.glassCard}>
      <div className={styles.financeHeader}>
        <div className={styles.financeTitle}>
          <Calendar size={18} className="text-blue-500" />
          <span>Agenda e Compromissos</span>
        </div>
      </div>

      {events.map((ev, idx) => (
        <div key={idx} className={styles.scheduleItem}>
          <div className={styles.scheduleTop}>
            <div className={styles.scheduleTitle}>{ev.title}</div>
            <div className={styles.scheduleTimeBadge}>
              <Clock size={12} className="inline mr-1" />
              {ev.time ? `${ev.date} às ${ev.time}` : ev.date}
            </div>
          </div>

          {ev.attendee && (
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              Convidado: {ev.attendee}
            </div>
          )}

          {ev.meet_link && (
            <a 
              href={ev.meet_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.meetButton}
            >
              <Video size={14} />
              <span>Entrar no Google Meet</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
};

// ==============================================================================
// 6. COTAÇÕES DE ATIVOS (VisionAssetCard)
// ==============================================================================
export const VisionAssetCard = ({ data }) => {
  if (!data) return null;
  const isPositivo = !String(data.change).startsWith('-');

  return (
    <div className={`${styles.glassCard} ${styles.assetCard}`}>
      <div className={styles.assetLeft}>
        <span className={styles.assetTicker}>{data.ticker}</span>
        <span className={styles.assetName}>{data.name}</span>
      </div>

      <div className={styles.assetRight}>
        <span className={styles.assetPrice}>{formatBRL(data.price)}</span>
        <span className={`${styles.assetChange} ${isPositivo ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositivo ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {data.change}
        </span>
      </div>
    </div>
  );
};

// ==============================================================================
// 7. CARDS DE PESQUISA COM FOTOS REAIS (VisionWebCards)
// ==============================================================================
export const VisionWebCards = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) return null;

  return (
    <div className={styles.webCardsGrid}>
      {data.map((item, idx) => (
        <div key={idx} className={styles.webCard}>
          <div className={styles.webCardImageWrapper}>
            <img 
              src={item.image_url} 
              alt={item.title} 
              className={styles.webCardImage} 
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
              }}
            />
            {item.price && (
              <span className={styles.priceTagBadge}>{item.price}</span>
            )}
          </div>

          <div className={styles.webCardBody}>
            <span className={styles.webCardDomain}>{item.domain}</span>
            <div className={styles.webCardTitle} title={item.title}>
              {item.title}
            </div>
            <div className={styles.webCardSnippet}>
              {item.snippet}
            </div>
            
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.webCardLinkBtn}
            >
              <span>Ver no site</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

// ==============================================================================
// DISPATCHER PRINCIPAL (VisionVisualRenderer)
// ==============================================================================
export const VisionVisualRenderer = ({ visuals }) => {
  if (!visuals || !Array.isArray(visuals) || visuals.length === 0) return null;

  return (
    <div className={styles.visualsWrapper}>
      {visuals.map((vis, idx) => {
        switch (vis.type) {
          case 'finance_chart':
            return <VisionFinanceChart key={idx} data={vis.data} />;
          case 'receipt':
            return <VisionReceiptCard key={idx} data={vis} />;
          case 'credit_cards':
            return <VisionCreditCardWidget key={idx} data={vis.data} />;
          case 'goals':
            return <VisionGoalWidget key={idx} data={vis.data} />;
          case 'schedule':
            return <VisionScheduleCard key={idx} data={vis.data} />;
          case 'asset_quote':
            return <VisionAssetCard key={idx} data={vis.data} />;
          case 'web_cards':
            return <VisionWebCards key={idx} data={vis.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default VisionVisualRenderer;
