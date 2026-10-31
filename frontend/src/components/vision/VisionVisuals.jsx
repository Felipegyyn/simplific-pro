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
  const [hoveredCatIdx, setHoveredCatIdx] = useState(null);

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

  // Cálculo da proporção para a barra de fluxo e percentuais de categorias
  const totalVolume = (receitas || 0) + (despesas || 0);
  const receitasPct = totalVolume > 0 ? Math.round((receitas / totalVolume) * 100) : 50;
  const despesasPct = 100 - receitasPct;

  const displayedCategories = (categorias || []).slice(0, 6);
  const totalCategoriasValue = displayedCategories.reduce((acc, c) => acc + (Number(c.value) || 0), 0) || despesas || 1;
  const topCategory = displayedCategories.length > 0
    ? [...displayedCategories].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))[0]
    : null;
  const topCategoryPct = topCategory
    ? ((Number(topCategory.value) / totalCategoriasValue) * 100).toFixed(1).replace('.', ',') + '%'
    : '0%';

  const activeTooltipCat = hoveredCatIdx !== null && displayedCategories[hoveredCatIdx]
    ? displayedCategories[hoveredCatIdx]
    : (displayedCategories[2] || displayedCategories[0] || null);

  const comprometimentoRenda = detalhes_saldo?.comprometimento_renda
    ?? (receitas > 0 ? Math.round((despesas / receitas) * 100) : (despesas > 0 ? 100 : 0));

  const saldoVariacaoPct = receitas > 0
    ? Math.round((saldo / receitas) * 100)
    : 0;

  return (
    <div className={`${styles.glassCard} ${styles.financeCardSquare}`}>
      {/* Cabeçalho estilo FigCraft Redesign */}
      <div className={styles.financeHeader}>
        <div className={styles.financeTitleGroup}>
          <div className={styles.financeIconBox}>
            <Wallet size={18} />
          </div>
          <div className={styles.financeTitleTexts}>
            <span className={styles.financeMainTitle}>Balanço Financeiro</span>
            <span className={styles.financeSubTitle}>Análise inteligente de fluxo de caixa e categorias</span>
          </div>
        </div>

        <div className={styles.financeHeaderBadges}>
          {comprometimentoRenda > 0 && (
            <span className={comprometimentoRenda > 100 ? styles.commitmentAlertPill : styles.commitmentOkPill}>
              {comprometimentoRenda > 100 ? '▲' : '●'} {comprometimentoRenda}% da renda comprometida
            </span>
          )}
          <span className={styles.periodPill}>{periodo || 'Mês Atual'} ▾</span>
        </div>
      </div>

      {/* Grid de 3 Métricas Chave Interativas (Cantos Retos) */}
      <div className={styles.metricsGrid}>
        {/* KPI 1: RECEITAS */}
        <div 
          className={`${styles.metricBox} ${styles.metricBoxInteractive} ${activeKpi === 'receitas' ? styles.metricActiveReceitas : ''}`}
          onClick={() => handleKpiToggle('receitas')}
          role="button"
          tabIndex={0}
          title="Clique para ver o detalhamento de receitas"
        >
          <div className={styles.metricTopRow}>
            <div className={`${styles.metricLabel} ${styles.metricLabelReceitas}`}>
              <ArrowDownLeft size={13} />
              <span>RECEITAS</span>
            </div>
            <span className={styles.metricCountMeta}>
              {detalhes_receitas.length} {detalhes_receitas.length === 1 ? 'entrada' : 'entradas'}
            </span>
          </div>
          <div className={`${styles.metricValue} ${styles.metricPositive}`}>
            {formatBRL(receitas)}
          </div>
          <div className={styles.kpiActionHint}>
            {activeKpi === 'receitas' ? (
              <span className={styles.kpiHintActive}>Ocultar entradas ↑</span>
            ) : (
              <span>Ver entradas detalhadas →</span>
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
          <div className={styles.metricTopRow}>
            <div className={`${styles.metricLabel} ${styles.metricLabelDespesas}`}>
              <ArrowUpRight size={13} />
              <span>DESPESAS</span>
            </div>
            <span className={styles.metricCountMeta}>
              {detalhes_despesas.length} {detalhes_despesas.length === 1 ? 'saída' : 'saídas'}
            </span>
          </div>
          <div className={`${styles.metricValue} ${styles.metricNegative}`}>
            {formatBRL(despesas)}
          </div>
          <div className={styles.kpiActionHint}>
            {activeKpi === 'despesas' ? (
              <span className={styles.kpiHintActive}>Ocultar saídas ↑</span>
            ) : (
              <span>Ver saídas detalhadas →</span>
            )}
          </div>
        </div>

        {/* KPI 3: SALDO LÍQUIDO */}
        <div 
          className={`${styles.metricBox} ${styles.metricBoxInteractive} ${saldo < 0 ? styles.metricBoxDeficit : ''} ${activeKpi === 'saldo' ? styles.metricActiveSaldo : ''}`}
          onClick={() => handleKpiToggle('saldo')}
          role="button"
          tabIndex={0}
          title="Clique para ver o raio-x do fluxo de caixa"
        >
          <div className={styles.metricTopRow}>
            <div className={`${styles.metricLabel} ${saldo < 0 ? styles.metricLabelDeficit : ''}`}>
              <Wallet size={13} />
              <span>SALDO LÍQUIDO</span>
            </div>
            <span className={styles.metricCountMeta}>
              {saldo < 0 ? `Déficit ${saldoVariacaoPct}%` : `Superávit +${saldoVariacaoPct}%`}
            </span>
          </div>
          <div className={`${styles.metricValue} ${saldo >= 0 ? styles.metricPositive : styles.metricNegative}`}>
            {formatBRL(saldo)}
          </div>
          <div className={`${styles.kpiActionHint} ${saldo < 0 ? styles.kpiActionHintDeficit : ''}`}>
            {activeKpi === 'saldo' ? (
              <span className={styles.kpiHintActive}>Ocultar Raio-X ↑</span>
            ) : (
              <span>Abrir Raio-X de caixa →</span>
            )}
          </div>
        </div>

        {taxa_poupanca > 0 && (
          <div className={styles.metricBox}>
            <div className={styles.metricTopRow}>
              <div className={styles.metricLabel}>
                <Sparkles size={13} className="text-amber-500" />
                <span>TAXA POUPANÇA</span>
              </div>
            </div>
            <div className={`${styles.metricValue} ${styles.metricPositive}`}>
              {taxa_poupanca}%
            </div>
          </div>
        )}
      </div>

      {/* PAINEL DINÂMICO DE SUBINFORMAÇÕES OU DONUT + BARRAS DE CATEGORIAS */}
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

      {/* MODO PADRÃO: DONUT BOX (ESQUERDA) + CARDS DE CATEGORIAS COM BARRA DE PROGRESSO (DIREITA) */}
      {!activeKpi && (
        <>
          {displayedCategories.length > 0 ? (
            <div className={styles.chartContainer}>
              {/* Coluna Esquerda: Donut Chart Box com Centro Informativo e Badge de Seleção */}
              <div className={styles.donutCardBox}>
                <div className={styles.donutRingWrap}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayedCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={64}
                        outerRadius={92}
                        paddingAngle={3}
                        stroke="none"
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        onMouseEnter={(_, index) => setHoveredCatIdx(index)}
                        onMouseLeave={() => setHoveredCatIdx(null)}
                        onClick={(entry) => entry?.name && handleCategoryDrilldown(entry.name)}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        {displayedCategories.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || '#10b981'}
                            stroke="none"
                            opacity={hoveredCatIdx === null || hoveredCatIdx === index ? 1 : 0.45}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Centro da Rosca: Maior Fatia */}
                  {topCategory && (
                    <div className={styles.donutCenterInfo}>
                      <span className={styles.donutCenterLabel}>MAIOR FATIA</span>
                      <span className={styles.donutCenterPct}>{topCategoryPct}</span>
                      <span
                        className={styles.donutCenterName}
                        style={{ color: topCategory.color || '#34d399' }}
                      >
                        {topCategory.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Badge Inferior de Alto Contraste (Fatia Selecionada / Hovered) */}
                {activeTooltipCat && (
                  <div
                    className={styles.donutSelectedBox}
                    style={{ borderColor: activeTooltipCat.color || '#f59e0b' }}
                    onClick={() => handleCategoryDrilldown(activeTooltipCat.name)}
                    role="button"
                    tabIndex={0}
                    title={`Filtrar despesas de ${activeTooltipCat.name}`}
                  >
                    <span
                      className={styles.donutSelectedDot}
                      style={{ backgroundColor: activeTooltipCat.color || '#f59e0b' }}
                    />
                    <span className={styles.donutSelectedText}>
                      {activeTooltipCat.name}: {formatBRL(activeTooltipCat.value)}
                    </span>
                  </div>
                )}
              </div>

              {/* Coluna Direita: Lista de Categorias com Percentual + Barra Proporcional */}
              <div className={styles.categoriesList}>
                {displayedCategories.map((cat, idx) => {
                  const pctNum = Math.max(0, Math.min(100, ((Number(cat.value) || 0) / totalCategoriasValue) * 100));
                  const pctFormatted = pctNum.toFixed(1).replace('.', ',') + '%';
                  const catColor = cat.color || '#10b981';

                  return (
                    <div 
                      key={idx} 
                      className={`${styles.categoryItem} ${styles.categoryItemClickable} ${hoveredCatIdx === idx ? styles.categoryItemHovered : ''}`}
                      onClick={() => handleCategoryDrilldown(cat.name)}
                      onMouseEnter={() => setHoveredCatIdx(idx)}
                      onMouseLeave={() => setHoveredCatIdx(null)}
                      title={`Clique para filtrar lançamentos de ${cat.name}`}
                    >
                      <div className={styles.categoryItemTop}>
                        <div className={styles.categoryDotName}>
                          <div className={styles.colorDot} style={{ backgroundColor: catColor }} />
                          <span>{cat.name}</span>
                        </div>
                        <div className={styles.categoryRightGroup}>
                          <span className={styles.categoryPctText}>{pctFormatted}</span>
                          <span className={styles.categoryValue}>{formatBRL(cat.value)}</span>
                        </div>
                      </div>

                      <div className={styles.categoryProgressTrack}>
                        <div
                          className={styles.categoryProgressFill}
                          style={{
                            width: `${Math.max(2.5, pctNum)}%`,
                            backgroundColor: catColor
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
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
                    contentStyle={{ borderRadius: '0px', border: '1px solid #1e293b', backgroundColor: '#111622', color: '#f8fafc', fontSize: '12px' }} 
                    itemStyle={{ color: '#f8fafc' }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Bar dataKey="valor" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className={styles.interactiveHintFooter}>
            <Sparkles size={12} className="text-emerald-400" />
            <span>Toque nos cards acima ou em qualquer categoria para expandir as subinformações e lançamentos</span>
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
