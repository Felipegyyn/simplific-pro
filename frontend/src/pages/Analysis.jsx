import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from "@/lib/utils";
import styles from './Analysis.module.css';
import apiService from '../services/api';

// Helper para formatar moeda
const formatCurrency = (value) => {
  return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Componente para o Relatório DRE
const DreReport = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div></div>;
  }

  if (!data || !data.summary) {
    return <p className="text-center text-slate-500 py-12 italic">Nenhum dado encontrado para o período selecionado.</p>;
  }

  const { summary, details } = data;

  return (
    <div className={styles.tableContainer}>
      <Table>
        <TableHeader className={styles.tableHeader}>
          <TableRow className={styles.tableHeaderRow}>
            <TableHead className={"w-2/3 " + styles.tableHead}>Descrição</TableHead>
            <TableHead className={"text-right " + styles.tableHead}>Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Receitas */}
          <TableRow className={"font-bold " + styles.bgSuccessSubtle + " " + styles.tableRow}>
            <TableCell className="text-slate-800 dark:text-white">Receita Bruta</TableCell>
            <TableCell className={"text-right " + styles.textSuccess}>{formatCurrency(summary.total_receitas)}</TableCell>
          </TableRow>
          {details.receitas.map((item, index) => (
            <TableRow key={`receita-${index}`} className={styles.tableRow}>
              <TableCell className="pl-8 text-slate-600 dark:text-slate-400">{item.category}</TableCell>
              <TableCell className="text-right text-slate-700 dark:text-slate-200">{formatCurrency(item.value)}</TableCell>
            </TableRow>
          ))}

          {/* Despesas */}
          <TableRow className={"font-bold " + styles.bgDangerSubtle + " " + styles.tableRow}>
            <TableCell className="text-slate-800 dark:text-white">Despesas</TableCell>
            <TableCell className={"text-right " + styles.textDanger}>{formatCurrency(summary.total_despesas)}</TableCell>
          </TableRow>
          {details.despesas.map((item, index) => (
            <TableRow key={`despesa-${index}`} className={styles.tableRow}>
              <TableCell className="pl-8 text-slate-600 dark:text-slate-400">{item.category}</TableCell>
              <TableCell className="text-right text-slate-700 dark:text-slate-200">{formatCurrency(item.value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className={styles.tableFooter}>
          <TableRow className="hover:bg-transparent border-none">
            <TableCell className="text-lg font-bold text-slate-800 dark:text-white">Resultado Líquido</TableCell>
            <TableCell className={cn("text-right text-lg font-bold", summary.resultado_liquido >= 0 ? styles.textSuccess : styles.textDanger)}>
              {formatCurrency(summary.resultado_liquido)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

// Componente para o Relatório de Fluxo de Caixa
const CashFlowReport = ({ data, isLoading }) => {
  if (isLoading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div></div>;
  }
  
  if (!data || data.length === 0) {
    return <p className="text-center text-slate-500 py-12 italic">Nenhum planejamento encontrado para o ano selecionado.</p>;
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className={styles.tableContainer}>
      <Table>
        <TableHeader className={styles.tableHeader}>
          <TableRow className={styles.tableHeaderRow}>
            <TableHead className={styles.stickyLeft + " " + styles.tableHead + " min-w-[150px]"}>Categoria</TableHead>
            {meses.map(mes => (
              <React.Fragment key={mes}>
                <TableHead className={"text-center min-w-[120px] " + styles.tableHead}>Plan. {mes}</TableHead>
                <TableHead className={"text-center min-w-[120px] " + styles.tableHead}>Real. {mes}</TableHead>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className={styles.tableRow}>
              <TableCell className={"font-bold text-slate-700 dark:text-slate-200 " + styles.stickyLeft}>{row.category}</TableCell>
              {row.monthly_data.map(month => {
                const diff = month.realized - month.planned;
                const isOverBudget = diff > 0 && month.planned > 0;
                return (
                  <React.Fragment key={`${row.category}-${month.month}`}>
                    <TableCell className="text-center text-cyan-600 dark:text-cyan-400/60 font-medium">
                      {formatCurrency(month.planned)}
                    </TableCell>
                    <TableCell className={cn("text-center font-bold", isOverBudget ? styles.textDanger : styles.textSuccess)}>
                      {formatCurrency(month.realized)}
                    </TableCell>
                  </React.Fragment>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


const Analysis = () => {
  // ... (manter estados e efeitos intactos) ...
  const [dreYear, setDreYear] = useState(new Date().getFullYear());
  const [dreMonth, setDreMonth] = useState(new Date().getMonth() + 1);
  const [cashFlowYear, setCashFlowYear] = useState(new Date().getFullYear());

  const [dreData, setDreData] = useState(null);
  const [isDreLoading, setIsDreLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [isCashFlowLoading, setIsCashFlowLoading] = useState(true);

  useEffect(() => {
    const fetchDreData = async () => {
      setIsDreLoading(true);
      try {
        const response = await apiService.get(`/api/analysis/dre?year=${dreYear}&month=${dreMonth}`);
        setDreData(response);
      } catch (error) {
        console.error("Erro ao buscar dados da DRE:", error);
        setDreData(null);
      } finally {
        setIsDreLoading(false);
      }
    };
    fetchDreData();
  }, [dreYear, dreMonth]);

  useEffect(() => {
    const fetchCashFlowData = async () => {
      setIsCashFlowLoading(true);
      try {
        const response = await apiService.get(`/api/analysis/cash-flow?year=${cashFlowYear}`);
        setCashFlowData(response);
      } catch (error) {
        console.error("Erro ao buscar dados do Fluxo de Caixa:", error);
        setCashFlowData([]);
      } finally {
        setIsCashFlowLoading(false);
      }
    };
    fetchCashFlowData();
  }, [cashFlowYear]);

  const years = [2024, 2025, 2026];
  const months = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Análise Financeira</h1>
          <p className={styles.pageSubtitle}>Relatórios detalhados para uma visão completa da sua saúde financeira.</p>
        </div>
      </div>

      <Tabs defaultValue="dre">
        <TabsList className={styles.tabsList + " mb-6"}>
          <TabsTrigger value="dre" className={styles.tabsTrigger}>DRE (Demonstração de Resultados)</TabsTrigger>
          <TabsTrigger value="cash-flow" className={styles.tabsTrigger}>Fluxo de Caixa (Planejado vs. Realizado)</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Aba DRE */}
        <TabsContent value="dre">
          <div className={styles.premiumCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Demonstração de Resultados</h3>
              <div className={styles.actionPanel}>
                <Select value={dreMonth.toString()} onValueChange={(value) => setDreMonth(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-slate-100 dark:bg-slate-800 border-none shadow-none focus:ring-0 font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dreYear.toString()} onValueChange={(value) => setDreYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[100px] bg-slate-100 dark:bg-slate-800 border-none shadow-none focus:ring-0 font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 pt-0">
              <DreReport data={dreData} isLoading={isDreLoading} />
            </div>
          </div>
        </TabsContent>

        {/* Conteúdo da Aba Fluxo de Caixa */}
        <TabsContent value="cash-flow">
          <div className={styles.premiumCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Fluxo de Caixa Analítico</h3>
              <div className={styles.actionPanel}>
                 <Select value={cashFlowYear.toString()} onValueChange={(value) => setCashFlowYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[120px] bg-slate-100 dark:bg-slate-800 border-none shadow-none focus:ring-0 font-semibold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-6 pt-0">
              <CashFlowReport data={cashFlowData} isLoading={isCashFlowLoading} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
