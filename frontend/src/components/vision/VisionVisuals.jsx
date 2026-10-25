// frontend/src/components/vision/VisionVisuals.jsx
import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ArrowDownLeft, ArrowUpRight, 
  CheckCircle2, Landmark, CreditCard as CardIcon, 
  Calendar, Clock, Video, Target, ExternalLink,
  Wallet, Sparkles, Building2, ChevronDown, ChevronUp,
  X, Filter, Flame, Info
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
// 1. GRÁFICO FINANCEIRO EXPLICATIVO INTERATIVO (VisionFinanceChart)
// ==============================================================================
export const VisionFinanceChart = ({ data }) => {
  if (!data) return null;

  const { 
    periodo, 
    receitas = 0, 
    despesas = 0, 
    saldo = 0, 
    taxa_poupanca = 0, 
    categorias = [],
    detalhes_receitas = [],
    detalhes_despesas = [],
    detalhes_saldo = {}
  } = data;

  const [activeKpi, setActiveKpi] = useState(null); // 'receitas' | 'despesas' | 'saldo' | null
  const [selectedCategory, setSelectedCategory] = useState(null); // Para filtrar despesas por categoria
  const [showAllTxs, setShowAllTxs] = useState(false);

  const handleKpiToggle = (kpi) => {
    if (activeKpi === kpi) {
      setActiveKpi(null);
      setSelectedCategory(null);
      setShowAllTxs(false);
    } else {
      setActiveKpi(kpi);
      setSelectedCategory(null);
      setShowAllTxs(false);
    }
  };

  const handleCategoryDrilldown = (catName) => {
    setActiveKpi('despesas');
    setSelectedCategory(catName);
    setShowAllTxs(false);
  };

  // Filtragem de despesas por categoria (se houver seleção)
  const filteredDespesas = selectedCategory
    ? detalhes_despesas.filter(t => (t.category || '').toLowerCase() === selectedCategory.toLowerCase())
    : detalhes_despesas;

  const displayedDespesas = showAllTxs ? filteredDespesas : filteredDespesas.slice(0, 5);

  const barData = [
    { name: 'Receitas', valor: receitas, fill: '#10b981' },
    { name: 'Despesas', valor: despesas, fill: '#f43f5e' }
  ];

  // Cálculo da proporção para a barra de fluxo
  const totalVolume = (receitas || 0) + (despesas || 0);
  const receitasPct = totalVolume > 0 ? Math.round((receitas / totalVolume) * 100) : 50;
  const despesasPct = 100 - receitasPct;

  return (
    <div className={styles.glassCard}>
      <div className={styles.financeHeader}>
        <div className={styles.financeTitle}>
          <Wallet size={18} className="text-emerald-500" />
          <span>Balanço Financeiro</span>
        </div>
        <span className={styles.periodPill}>{periodo || 'Mês Atual'}</span>
      </div>

      {/* Grid de Métricas Chave Interativas (Estilo Pierre) */}
      <div className={styles.metricsGrid}>
        {/* KPI 1: RECEITAS */}
        <div 
          className={`${styles.metricBox} ${styles.metricBoxInteractive} ${activeKpi === 'receitas' ? styles.metricActiveReceitas : ''}`}
          onClick={() => handleKpiToggle('receitas')}
          role="button"
          tabIndex={0}
          title="Clique para ver o detalhamento de receitas"
        >
          <div className={styles.metricLabel}>
            <ArrowDownLeft size={13} className="text-emerald-500" />
            <span>Receitas</span>
          </div>
          <div className={`${styles.metricValue} ${styles.metricPositive}`}>
            {formatBRL(receitas)}
          </div>
          <div className={styles.kpiActionHint}>
            {activeKpi === 'receitas' ? (
              <span className={styles.kpiHintActive}>Ocultar ▲</span>
            ) : (
              <span>Ver entradas ▼</span>
            )}
          </div>
        </div>

        {/* KPI 2: DESPESAS */}
        <div 
          className={`${styles.metricBox} ${styles.metricBoxInteractive} ${activeKpi === 'despesas' ? styles.metricActiveDespesas : ''}`}
          onClick={() => handleKpiToggle('despesas')}
          role="button"
          tabIndex={0}
          title="Clique para ver o detalhamento de despesas"
        >
          <div className={styles.metricLabel}>
            <ArrowUpRight size={13} className="text-rose-500" />
            <span>Despesas</span>
          </div>
          <div className={`${styles.metricValue} ${styles.metricNegative}`}>
            {formatBRL(despesas)}
          </div>
          <div className={styles.kpiActionHint}>
            {activeKpi === 'despesas' ? (
              <span className={styles.kpiHintActive}>Ocultar ▲</span>
            ) : (
              <span>Ver saídas ▼</span>
            )}
          </div>
        </div>

        {/* KPI 3: SALDO LÍQUIDO */}
        <div 
          className={`${styles.metricBox} ${styles.metricBoxInteractive} ${activeKpi === 'saldo' ? styles.metricActiveSaldo : ''}`}
          onClick={() => handleKpiToggle('saldo')}
          role="button"
          tabIndex={0}
          title="Clique para ver o raio-x do fluxo de caixa"
        >
          <div className={styles.metricLabel}>
            <Wallet size={13} />
            <span>Saldo Líquido</span>
          </div>
          <div className={`${styles.metricValue} ${saldo >= 0 ? styles.metricPositive : styles.metricNegative}`}>
            {formatBRL(saldo)}
          </div>
          <div className={styles.kpiActionHint}>
            {activeKpi === 'saldo' ? (
              <span className={styles.kpiHintActive}>Ocultar ▲</span>
            ) : (
              <span>Raio-X de caixa ▼</span>
            )}
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

      {/* PAINEL DINÂMICO DE SUBINFORMAÇÕES (ESTILO PIERRE) OU DONUT PADRÃO */}
      {activeKpi === 'receitas' && (
        <div className={styles.subDetailsWrapper}>
          <div className={styles.subDetailsHeader}>
            <div className={styles.subDetailsTitleWrap}>
              <div className={styles.subDetailsTitle}>
                <ArrowDownLeft size={16} className="text-emerald-500" />
                <span>Origem das Receitas</span>
              </div>
              <span className={styles.subDetailsBadge}>
                {detalhes_receitas.length} {detalhes_receitas.length === 1 ? 'entrada' : 'entradas'}
              </span>
            </div>
            <button 
              className={styles.subDetailsCloseBtn} 
              onClick={() => setActiveKpi(null)}
              title="Voltar ao gráfico"
            >
              <span>Voltar ao Gráfico</span>
              <X size={13} />
            </button>
          </div>

          {/* Cards resumo */}
          <div className={styles.kpiSummaryStrip}>
            <div className={styles.kpiSummaryCard}>
              <div className={styles.kpiSummaryCardLabel}>Maior Entrada</div>
              <div className={`${styles.kpiSummaryCardValue} text-emerald-500`}>
                {formatBRL(detalhes_saldo?.maior_receita?.value || receitas)}
              </div>
              <div className={styles.kpiSummaryCardSub} title={detalhes_saldo?.maior_receita?.description}>
                {detalhes_saldo?.maior_receita?.description || 'Receita principal'}
              </div>
            </div>

            <div className={styles.kpiSummaryCard}>
              <div className={styles.kpiSummaryCardLabel}>Média por Entrada</div>
              <div className={styles.kpiSummaryCardValue}>
                {formatBRL(detalhes_receitas.length > 0 ? (receitas / detalhes_receitas.length) : receitas)}
              </div>
              <div className={styles.kpiSummaryCardSub}>
                Em {detalhes_receitas.length || 1} lançamento(s)
              </div>
            </div>
          </div>

          {/* Lista de Entradas */}
          <div className={styles.transactionsList}>
            {detalhes_receitas.map((tx, idx) => (
              <div key={tx.id || idx} className={styles.transactionRow}>
                <div className={styles.txLeft}>
                  <div className={`${styles.txIconCircle} ${styles.txIconReceita}`}>
                    <ArrowDownLeft size={13} />
                  </div>
                  <div className={styles.txDescWrap}>
                    <span className={styles.txDesc} title={tx.description}>{tx.description}</span>
                    <div className={styles.txMeta}>
                      <span className={styles.txCategoryTag}>{tx.category || 'Receita'}</span>
                      {tx.date && <span className={styles.txDate}>{tx.date}</span>}
                    </div>
                  </div>
                </div>
                <div className={styles.txRight}>
                  <span className={`${styles.txValue} ${styles.metricPositive}`}>
                    + {formatBRL(tx.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeKpi === 'despesas' && (
        <div className={styles.subDetailsWrapper}>
          <div className={styles.subDetailsHeader}>
            <div className={styles.subDetailsTitleWrap}>
              <div className={styles.subDetailsTitle}>
                <ArrowUpRight size={16} className="text-rose-500" />
                <span>Detalhamento de Despesas</span>
              </div>
              <span className={styles.subDetailsBadge}>
                {filteredDespesas.length} {filteredDespesas.length === 1 ? 'saída' : 'saídas'}
              </span>
            </div>
            <button 
              className={styles.subDetailsCloseBtn} 
              onClick={() => { setActiveKpi(null); setSelectedCategory(null); }}
              title="Voltar ao gráfico"
            >
              <span>Voltar ao Gráfico</span>
              <X size={13} />
            </button>
          </div>

          {/* Chips para Filtrar por Categoria */}
          {categorias && categorias.length > 0 && (
            <div className={styles.categoryFilterBar}>
              <button
                className={`${styles.categoryFilterPill} ${!selectedCategory ? styles.categoryFilterPillActive : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                Todas ({detalhes_despesas.length})
              </button>
              {categorias.map((cat, idx) => (
                <button
                  key={idx}
                  className={`${styles.categoryFilterPill} ${selectedCategory === cat.name ? styles.categoryFilterPillActive : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                >
                  <span 
                    style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: cat.color || '#f43f5e',
                      display: 'inline-block' 
                    }} 
                  />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Lista de Saídas */}
          <div className={styles.transactionsList}>
            {displayedDespesas.map((tx, idx) => (
              <div key={tx.id || idx} className={styles.transactionRow}>
                <div className={styles.txLeft}>
                  <div className={`${styles.txIconCircle} ${styles.txIconDespesa}`}>
                    <ArrowUpRight size={13} />
                  </div>
                  <div className={styles.txDescWrap}>
                    <span className={styles.txDesc} title={tx.description}>{tx.description}</span>
                    <div className={styles.txMeta}>
                      <span className={styles.txCategoryTag}>{tx.category || 'Despesa'}</span>
                      {tx.date && <span className={styles.txDate}>{tx.date}</span>}
                    </div>
                  </div>
                </div>
                <div className={styles.txRight}>
                  <span className={`${styles.txValue} ${styles.metricNegative}`}>
                    - {formatBRL(tx.value)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Botão Ver Mais / Ver Menos */}
          {filteredDespesas.length > 5 && (
            <button
              className={styles.txExpandBtn}
              onClick={() => setShowAllTxs(!showAllTxs)}
            >
              {showAllTxs ? (
                <><span>Ver menos</span> <ChevronUp size={13} /></>
              ) : (
                <><span>Ver todas as {filteredDespesas.length} despesas</span> <ChevronDown size={13} /></>
              )}
            </button>
          )}
        </div>
      )}

      {activeKpi === 'saldo' && (
        <div className={styles.subDetailsWrapper}>
          <div className={styles.subDetailsHeader}>
            <div className={styles.subDetailsTitleWrap}>
              <div className={styles.subDetailsTitle}>
                <Wallet size={16} className="text-blue-500" />
                <span>Raio-X do Fluxo de Caixa</span>
              </div>
              <span className={`${styles.subDetailsBadge} ${saldo >= 0 ? 'text-emerald-500 font-semibold' : 'text-rose-500 font-semibold'}`}>
                {saldo >= 0 ? `Superávit de ${formatBRL(saldo)}` : `Déficit de ${formatBRL(Math.abs(saldo))}`}
              </span>
            </div>
            <button 
              className={styles.subDetailsCloseBtn} 
              onClick={() => setActiveKpi(null)}
              title="Voltar ao gráfico"
            >
              <span>Voltar ao Gráfico</span>
              <X size={13} />
            </button>
          </div>

          {/* Barra de Proporção Receitas vs Despesas */}
          <div className={styles.ratioBarContainer}>
            <div className={styles.ratioBarHeader}>
              <span>Receitas: {receitasPct}% ({formatBRL(receitas)})</span>
              <span>Despesas: {despesasPct}% ({formatBRL(despesas)})</span>
            </div>
            <div className={styles.ratioBarTrack}>
              <div 
                className={styles.ratioSegmentReceitas} 
                style={{ width: `${receitasPct}%` }} 
                title={`Receitas: ${formatBRL(receitas)} (${receitasPct}%)`} 
              />
              <div 
                className={styles.ratioSegmentDespesas} 
                style={{ width: `${despesasPct}%` }} 
                title={`Despesas: ${formatBRL(despesas)} (${despesasPct}%)`} 
              />
            </div>
          </div>

          {/* 4 KPI tiles Pierre */}
          <div className={styles.kpiSummaryStrip}>
            <div className={styles.kpiSummaryCard}>
              <div className={styles.kpiSummaryCardLabel}>Comprometimento</div>
              <div className={`${styles.kpiSummaryCardValue} ${detalhes_saldo?.comprometimento_renda > 100 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {detalhes_saldo?.comprometimento_renda || 0}%
              </div>
              <div className={styles.kpiSummaryCardSub}>
                {detalhes_saldo?.comprometimento_renda > 100 ? 'Despesas superam receita' : 'Margem de caixa saudável'}
              </div>
            </div>

            <div className={styles.kpiSummaryCard}>
              <div className={styles.kpiSummaryCardLabel}>Burn Rate Diário</div>
              <div className={styles.kpiSummaryCardValue}>
                {formatBRL(detalhes_saldo?.gasto_diario_medio || 0)}
              </div>
              <div className={styles.kpiSummaryCardSub}>
                Média em {detalhes_saldo?.dias_decorridos || 1} dias
              </div>
            </div>

            <div className={styles.kpiSummaryCard}>
              <div className={styles.kpiSummaryCardLabel}>Maior Despesa</div>
              <div className={`${styles.kpiSummaryCardValue} text-rose-500`}>
                {formatBRL(detalhes_saldo?.maior_despesa?.value || 0)}
              </div>
              <div className={styles.kpiSummaryCardSub} title={detalhes_saldo?.maior_despesa?.description}>
                {detalhes_saldo?.maior_despesa?.description || 'Nenhuma'}
              </div>
            </div>

            <div className={styles.kpiSummaryCard}>
              <div className={styles.kpiSummaryCardLabel}>Projeção Mês</div>
              <div className={`${styles.kpiSummaryCardValue} ${detalhes_saldo?.projecao_fechamento >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {formatBRL(detalhes_saldo?.projecao_fechamento || saldo)}
              </div>
              <div className={styles.kpiSummaryCardSub}>
                {detalhes_saldo?.dias_restantes || 0} dias restantes
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODO PADRÃO: GRÁFICO RECHARTS DONUT COM CATEGORIAS CLICÁVEIS */}
      {!activeKpi && (
        <>
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
                {categorias.slice(0, 6).map((cat, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.categoryItem} ${styles.categoryItemClickable}`}
                    onClick={() => handleCategoryDrilldown(cat.name)}
                    title={`Clique para filtrar lançamentos de ${cat.name}`}
                  >
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

          <div className={styles.interactiveHintFooter}>
            <Sparkles size={12} className="text-emerald-500" />
            <span>Toque nos cards acima ou nas categorias para ver as subinformações</span>
          </div>
        </>
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

        {data.receipt_image_url && (
          <div className={styles.receiptRow}>
            <span className={styles.receiptRowLabel}>Comprovante</span>
            <a 
              href={data.receipt_image_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-medium underline"
            >
              <span>Ver anexo</span>
              <ExternalLink size={11} />
            </a>
          </div>
        )}
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
  const [showAll, setShowAll] = useState(false);
  if (!data) return null;
  const cards = Array.isArray(data) ? data : [data];
  const displayedCards = showAll ? cards : cards.slice(0, 2);

  return (
    <div className="flex flex-col gap-3 w-full">
      {displayedCards.map((card, idx) => {
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

      {cards.length > 2 && (
        <button 
          type="button" 
          onClick={() => setShowAll(!showAll)}
          className={styles.expandButton}
        >
          {showAll ? (
            <span className="flex items-center justify-center gap-1">
              <ChevronUp size={14} /> Mostrar menos cartões
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <ChevronDown size={14} /> Ver todos os {cards.length} cartões
            </span>
          )}
        </button>
      )}
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
  const [showAll, setShowAll] = useState(false);
  if (!data) return null;
  const events = Array.isArray(data) ? data : [data];
  const displayedEvents = showAll ? events : events.slice(0, 3);

  return (
    <div className={styles.glassCard}>
      <div className={styles.financeHeader}>
        <div className={styles.financeTitle}>
          <Calendar size={18} className="text-blue-500" />
          <span>Agenda e Compromissos</span>
        </div>
      </div>

      {displayedEvents.map((ev, idx) => (
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

      {events.length > 3 && (
        <button 
          type="button" 
          onClick={() => setShowAll(!showAll)}
          className={styles.expandButton}
        >
          {showAll ? (
            <span className="flex items-center justify-center gap-1">
              <ChevronUp size={14} /> Mostrar menos compromissos
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <ChevronDown size={14} /> Ver todos os {events.length} compromissos
            </span>
          )}
        </button>
      )}
    </div>
  );
};

// ==============================================================================
// 6. COTAÇÕES DE ATIVOS (VisionAssetCard)
// ==============================================================================
export const VisionAssetCard = ({ data }) => {
  if (!data) return null;
  const isPositivo = !String(data.change).startsWith('-');

  // Exibe cotação cambial (USD/BRL, EUR/BRL) com 4 casas decimais quando relevante
  const precoFormatado = typeof data.price === 'number'
    ? (data.ticker === 'USD/BRL' || data.ticker === 'EUR/BRL'
        ? `R$ ${data.price.toFixed(4).replace('.', ',')}`
        : formatBRL(data.price))
    : data.price;

  return (
    <div className={`${styles.glassCard} ${styles.assetCard}`}>
      <div className={styles.assetTopRow}>
        <div className={styles.assetLeft}>
          <span className={styles.assetTicker}>{data.ticker}</span>
          <span className={styles.assetName}>{data.name}</span>
        </div>

        <div className={styles.assetRight}>
          <span className={styles.assetPrice}>{precoFormatado}</span>
          <span className={`${styles.assetChange} ${isPositivo ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositivo ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {data.change}
          </span>
        </div>
      </div>

      {data.news && data.news.title && (
        <div className={styles.assetNewsRow}>
          <span className={styles.assetNewsLabel}>Última notícia relevante:</span>
          {data.news.link ? (
            <a 
              href={data.news.link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.assetNewsLink}
            >
              {data.news.title}
            </a>
          ) : (
            <span className={styles.assetNewsLink}>{data.news.title}</span>
          )}
        </div>
      )}
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
