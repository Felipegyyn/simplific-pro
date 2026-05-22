import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
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
    <div className="overflow-hidden rounded-xl border border-white/5">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="w-2/3 text-slate-300 font-bold uppercase tracking-wider text-[10px]">Descrição</TableHead>
            <TableHead className="text-right text-slate-300 font-bold uppercase tracking-wider text-[10px]">Valor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Receitas */}
          <TableRow className="font-bold bg-emerald-500/5 border-white/5">
            <TableCell className="text-white">Receita Bruta</TableCell>
            <TableCell className="text-right text-emerald-400">{formatCurrency(summary.total_receitas)}</TableCell>
          </TableRow>
          {details.receitas.map((item, index) => (
            <TableRow key={`receita-${index}`} className="border-white/5 hover:bg-white/2 transition-colors">
              <TableCell className="pl-8 text-slate-400">{item.category}</TableCell>
              <TableCell className="text-right text-slate-200">{formatCurrency(item.value)}</TableCell>
            </TableRow>
          ))}

          {/* Despesas */}
          <TableRow className="font-bold bg-red-500/5 border-white/5">
            <TableCell className="text-white">Despesas</TableCell>
            <TableCell className="text-right text-red-400">{formatCurrency(summary.total_despesas)}</TableCell>
          </TableRow>
          {details.despesas.map((item, index) => (
            <TableRow key={`despesa-${index}`} className="border-white/5 hover:bg-white/2 transition-colors">
              <TableCell className="pl-8 text-slate-400">{item.category}</TableCell>
              <TableCell className="text-right text-slate-200">{formatCurrency(item.value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className="bg-slate-900/80 border-t-2 border-white/10">
          <TableRow className="hover:bg-transparent">
            <TableCell className="text-lg font-bold text-white">Resultado Líquido</TableCell>
            <TableCell className={cn("text-right text-lg font-bold", summary.resultado_liquido >= 0 ? 'text-emerald-400' : 'text-red-400')}>
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
    <div className="overflow-x-auto rounded-xl border border-white/5">
      <Table>
        <TableHeader className="bg-white/5">
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="sticky left-0 bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px] min-w-[150px] z-10">Categoria</TableHead>
            {meses.map(mes => (
              <React.Fragment key={mes}>
                <TableHead className="text-center text-slate-300 font-bold uppercase tracking-wider text-[10px] min-w-[120px]">Plan. {mes}</TableHead>
                <TableHead className="text-center text-slate-300 font-bold uppercase tracking-wider text-[10px] min-w-[120px]">Real. {mes}</TableHead>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className="border-white/5 hover:bg-white/2 transition-colors">
              <TableCell className="font-bold sticky left-0 bg-slate-900 text-slate-200 border-r border-white/5 z-10">{row.category}</TableCell>
              {row.monthly_data.map(month => {
                const diff = month.realized - month.planned;
                const isOverBudget = diff > 0 && month.planned > 0;
                return (
                  <React.Fragment key={`${row.category}-${month.month}`}>
                    <TableCell className="text-center text-cyan-400/60 font-medium">
                      {formatCurrency(month.planned)}
                    </TableCell>
                    <TableCell className={cn("text-center font-bold", isOverBudget ? 'text-red-400' : 'text-emerald-400')}>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Análise Financeira
          </h1>
          <p className="text-slate-400 mt-1">Relatórios detalhados para uma visão completa da sua saúde financeira.</p>
        </div>
      </div>

      <Tabs defaultValue="dre" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 glass-panel p-1 border-white/5">
          <TabsTrigger value="dre" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">DRE (Demonstração de Resultados)</TabsTrigger>
          <TabsTrigger value="cash-flow" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Fluxo de Caixa (Planejado vs. Realizado)</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Aba DRE */}
        <TabsContent value="dre">
          <div className="glass-panel p-6 border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <h3 className="text-lg font-bold text-white">Demonstração de Resultados</h3>
              <div className="flex items-center gap-3 glass-panel p-1 pr-3 border-white/10">
                <Select value={dreMonth.toString()} onValueChange={(value) => setDreMonth(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[150px] border-none bg-transparent focus:ring-0"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dreYear.toString()} onValueChange={(value) => setDreYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[100px] border-none bg-transparent focus:ring-0"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DreReport data={dreData} isLoading={isDreLoading} />
          </div>
        </TabsContent>

        {/* Conteúdo da Aba Fluxo de Caixa */}
        <TabsContent value="cash-flow">
          <div className="glass-panel p-6 border-white/5">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <h3 className="text-lg font-bold text-white">Fluxo de Caixa Analítico</h3>
              <div className="glass-panel p-1 pr-3 border-white/10">
                 <Select value={cashFlowYear.toString()} onValueChange={(value) => setCashFlowYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[120px] border-none bg-transparent focus:ring-0"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CashFlowReport data={cashFlowData} isLoading={isCashFlowLoading} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
