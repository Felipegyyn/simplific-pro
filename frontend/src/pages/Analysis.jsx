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
    return <p className="text-center text-gray-500 py-12">Carregando dados da DRE...</p>;
  }

  if (!data || !data.summary) {
    return <p className="text-center text-gray-500 py-12">Nenhum dado encontrado para o período selecionado.</p>;
  }

  const { summary, details } = data;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-2/3">Descrição</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Receitas */}
        <TableRow className="font-semibold bg-slate-50 dark:bg-slate-800">
          <TableCell>Receita Bruta</TableCell>
          <TableCell className="text-right text-green-600">{formatCurrency(summary.total_receitas)}</TableCell>
        </TableRow>
        {details.receitas.map((item, index) => (
          <TableRow key={`receita-${index}`}>
            <TableCell className="pl-8">{item.category}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
          </TableRow>
        ))}

        {/* Despesas */}
        <TableRow className="font-semibold bg-slate-50 dark:bg-slate-800">
          <TableCell>Despesas</TableCell>
          <TableCell className="text-right text-red-600">{formatCurrency(summary.total_despesas)}</TableCell>
        </TableRow>
        {details.despesas.map((item, index) => (
          <TableRow key={`despesa-${index}`}>
            <TableCell className="pl-8">{item.category}</TableCell>
            <TableCell className="text-right">{formatCurrency(item.value)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow className="text-lg font-bold bg-slate-100 dark:bg-slate-900">
          <TableCell>Resultado Líquido</TableCell>
          <TableCell className={`text-right ${summary.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.resultado_liquido)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

// Componente para o Relatório de Fluxo de Caixa
const CashFlowReport = ({ data, isLoading }) => {
  if (isLoading) {
    return <p className="text-center text-gray-500 py-12">Carregando dados do Fluxo de Caixa...</p>;
  }
  
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-12">Nenhum planejamento encontrado para o ano selecionado.</p>;
  }

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
  <TableRow>
    <TableHead className="sticky left-0 bg-white dark:bg-slate-900 min-w-[150px]">Categoria</TableHead>
    {meses.map(mes => (
      <React.Fragment key={mes}>
        <TableHead className="text-center">{`Planejado ${mes}`}</TableHead>
        <TableHead className="text-center">{`Realizado ${mes}`}</TableHead>
      </React.Fragment>
    ))}
  </TableRow>
</TableHeader>
        <TableBody>
  {data.map((row, index) => (
    <TableRow key={index}>
      <TableCell className="font-semibold sticky left-0 bg-white dark:bg-slate-900">{row.category}</TableCell>
      {row.monthly_data.map(month => {
        const diff = month.realized - month.planned;
        const isOverBudget = diff > 0 && month.planned > 0;
        return (
          <React.Fragment key={`${row.category}-${month.month}`}>
            <TableCell className="text-center text-blue-600">
              {formatCurrency(month.planned)}
            </TableCell>
            <TableCell className={`text-center ${isOverBudget ? 'text-red-500 font-bold' : 'text-green-600'}`}>
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
  // Estados para os filtros
  const [dreYear, setDreYear] = useState(new Date().getFullYear());
  const [dreMonth, setDreMonth] = useState(new Date().getMonth() + 1);
  const [cashFlowYear, setCashFlowYear] = useState(new Date().getFullYear());

  // Estados para os dados e carregamento
  const [dreData, setDreData] = useState(null);
  const [isDreLoading, setIsDreLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState([]);
  const [isCashFlowLoading, setIsCashFlowLoading] = useState(true);

  // Efeito para buscar dados da DRE
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

  // Efeito para buscar dados do Fluxo de Caixa
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
    <div className="p-4 sm:p-6 space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Análise Financeira</h2>
        <p className="text-gray-600 dark:text-gray-400">Relatórios detalhados para uma visão completa da sua saúde financeira.</p>
      </div>

      <Tabs defaultValue="dre" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
          <TabsTrigger value="dre">DRE (Demonstração de Resultados)</TabsTrigger>
          <TabsTrigger value="cash-flow">Fluxo de Caixa (Planejado vs. Realizado)</TabsTrigger>
        </TabsList>

        {/* Conteúdo da Aba DRE */}
        <TabsContent value="dre">
          <Card>
            <CardHeader>
              <CardTitle>Demonstração de Resultados do Exercício</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Select value={dreMonth.toString()} onValueChange={(value) => setDreMonth(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={dreYear.toString()} onValueChange={(value) => setDreYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <DreReport data={dreData} isLoading={isDreLoading} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo da Aba Fluxo de Caixa */}
        <TabsContent value="cash-flow">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Analítico</CardTitle>
              <div className="flex gap-4 pt-4">
                 <Select value={cashFlowYear.toString()} onValueChange={(value) => setCashFlowYear(parseInt(value))}>
                  <SelectTrigger className="w-full sm:w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <CashFlowReport data={cashFlowData} isLoading={isCashFlowLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analysis;
