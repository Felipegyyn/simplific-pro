import React, { useState, useEffect } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
    AlertCircle, Loader2, Search, FileText, Calendar, 
    Wallet, CheckCircle2, Filter, X, Settings
} from 'lucide-react';
import apiService from '../../services/api';

const BusinessReceivables = ({ user, onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [receivables, setReceivables] = useState([]); 
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Modal Manutenção
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({ value: '', due_date: '', status: '' });

  // --- CARREGAMENTO ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get('/api/business/receivables');
      setReceivables(data || []);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- LÓGICA DE CÁLCULO REAL-TIME ---
  const calculateUpdatedValues = (item) => {
      if (item.status === 'recebido') return { total: item.value, fine: 0, interest: 0, isLate: false };

      const today = new Date();
      today.setHours(0,0,0,0);
      
      // Correção de fuso horário simples para garantir comparação correta
      const [y, m, d] = item.due_date.split('-').map(Number);
      const due = new Date(y, m - 1, d); // Mês é base 0 no JS

      if (today <= due) return { total: item.value, fine: 0, interest: 0, isLate: false };

      const diffTime = Math.abs(today - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      let fineVal = 0, interestVal = 0;
      if (item.apply_penalty) {
          fineVal = item.value * (item.fine_percent / 100);
          const dailyInterestRate = (item.interest_percent / 100) / 30;
          interestVal = item.value * dailyInterestRate * diffDays;
      }

      return { total: item.value + fineVal + interestVal, fine: fineVal, interest: interestVal, isLate: true, daysLate: diffDays };
  };

  // --- ATUALIZAÇÃO ---
  const handleQuickUpdate = async (id, field, value) => {
      setReceivables(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
      try {
          await apiService.put(`/api/business/receivables/${id}`, { [field]: value });
      } catch (e) { alert("Erro ao atualizar."); loadData(); }
  };

  const handleQuickStatus = async (id, newStatus) => {
      try {
          await apiService.put(`/api/business/receivables/${id}/maintenance`, { status: newStatus });
          setReceivables(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      } catch(e) { alert("Erro."); }
  };

  const filteredList = receivables.filter(r => {
      const matchesSearch = r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.doc_nf?.includes(searchTerm);
      let matchesDate = true;
      if (dateFilter.start) matchesDate = matchesDate && r.due_date >= dateFilter.start;
      if (dateFilter.end) matchesDate = matchesDate && r.due_date <= dateFilter.end;
      return matchesSearch && matchesDate;
  });

  const totalReceived = filteredList.filter(r => r.status === 'recebido').reduce((acc, curr) => acc + curr.value, 0);
  const totalToReceive = filteredList.filter(r => r.status === 'a_receber').reduce((acc, curr) => acc + calculateUpdatedValues(curr).total, 0);

  // --- MANUTENÇÃO ---
  const handleOpenMaintenance = (item) => {
      setSelectedItem(item);
      setMaintenanceForm({ value: item.value, due_date: item.due_date, status: item.status });
      setIsMaintenanceOpen(true);
  };

  const handleSaveMaintenance = async () => {
      if (!selectedItem) return;
      try {
          await apiService.put(`/api/business/receivables/${selectedItem.id}/maintenance`, {
              value: parseFloat(maintenanceForm.value),
              due_date: maintenanceForm.due_date,
              status: maintenanceForm.status
          });
          await loadData();
          setIsMaintenanceOpen(false);
      } catch (error) { alert("Erro ao atualizar parcela."); }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contas a Receber</h1>
            <p className="text-slate-500 text-sm">Gerencie recebimentos e inadimplência.</p>
          </div>
        </div>

        {/* CARDS KPI */}
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-950 border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total Recebido</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">R$ {totalReceived.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <CheckCircle2 className="text-green-500 opacity-20" size={32}/>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-950 border-l-4 border-l-amber-500 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">A Receber (Atualizado)</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">R$ {totalToReceive.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <Wallet className="text-amber-500 opacity-20" size={32}/>
                </CardContent>
            </Card>
        </div>

        {/* FILTROS */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <Input 
                            placeholder="Buscar cliente, NF..." 
                            className="pl-10" 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-md border">
                            <span className="text-xs text-slate-500 pl-2">De:</span>
                            <Input type="date" className="h-8 border-0 bg-transparent w-32" value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})} />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-md border">
                            <span className="text-xs text-slate-500 pl-2">Até:</span>
                            <Input type="date" className="h-8 border-0 bg-transparent w-32" value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})} />
                        </div>
                        {(dateFilter.start || dateFilter.end) && (
                            <Button variant="ghost" size="icon" onClick={() => setDateFilter({start:'', end:''})} title="Limpar filtros"><X size={16}/></Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* TABELA DE RECEBÍVEIS */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                        <TableHead className="w-[80px]">Parc.</TableHead>
                        <TableHead>Cliente / Venda</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor Orig.</TableHead>
                        <TableHead>Valor Atual.</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2 text-cyan-600"/> Carregando...</TableCell></TableRow>
                    ) : filteredList.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="h-24 text-center text-slate-500 dark:text-slate-400">Nenhum registro encontrado.</TableCell></TableRow>
                    ) : (
                        filteredList.map((item) => {
                            const calc = calculateUpdatedValues(item);
                            const isPaid = item.status === 'recebido';
                            
                            // Estilo da linha baseada no status
                            const rowClass = isPaid 
                                ? 'bg-green-50/30 dark:bg-green-900/10' 
                                : calc.isLate 
                                    ? 'bg-red-50/30 dark:bg-red-900/10' 
                                    : '';

                            return (
                                <TableRow key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 ${rowClass}`}>
                                    
                                    {/* Parcela */}
                                    <TableCell>
                                        <div className="flex flex-col items-center">
                                            <span className="font-bold text-slate-600 dark:text-slate-300">
                                                {item.installment_number}/{item.total_installments}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400">#{item.sale_id}</span>
                                        </div>
                                    </TableCell>

                                    {/* Cliente */}
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{item.client_name}</span>
                                            <div className="flex gap-2">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">{item.company_name}</span>
                                                {item.doc_nf && <span className="text-xs bg-slate-100 px-1 rounded border">NF: {item.doc_nf}</span>}
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Vencimento (Editável) */}
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                type="date" 
                                                className={`h-8 text-xs w-[130px] bg-transparent ${calc.isLate && !isPaid ? 'text-red-600 font-bold border-red-200' : 'border-transparent hover:border-slate-200'}`}
                                                value={item.due_date}
                                                disabled={isPaid}
                                                onChange={(e) => handleQuickUpdate(item.id, 'due_date', e.target.value)}
                                            />
                                            {calc.isLate && !isPaid && <AlertCircle size={14} className="text-red-500" title={`Atraso de ${calc.daysLate} dias`} />}
                                        </div>
                                    </TableCell>

                                    {/* Valor Original */}
                                    <TableCell>
                                        <span className="text-slate-500 text-sm">R$ {item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                    </TableCell>

                                    {/* Valor Atualizado */}
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className={`font-bold text-sm ${isPaid ? 'text-green-600' : calc.isLate ? 'text-red-600' : 'text-slate-700'}`}>
                                                R$ {calc.total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                            </span>
                                            {calc.isLate && !isPaid && (
                                                <span className="text-[10px] text-red-500">
                                                    (+R$ {(calc.fine + calc.interest).toFixed(2)})
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        <Select value={item.status} onValueChange={(val) => handleQuickStatus(item.id, val)}>
                                            <SelectTrigger className={`h-8 text-xs font-bold border-0 ${isPaid ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="a_receber">A Receber</SelectItem>
                                                <SelectItem value="recebido">Recebido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>

                                    {/* Ações */}
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-cyan-600" onClick={() => handleOpenMaintenance(item)} title="Manutenção">
                                            <Settings size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* MODAL MANUTENÇÃO */}
      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>Manutenção da Parcela</DialogTitle>
                <DialogDescription>Ajustes manuais na parcela.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Valor Nominal (R$)</Label>
                    <Input type="number" value={maintenanceForm.value} onChange={e => setMaintenanceForm({...maintenanceForm, value: e.target.value})} />
                    <p className="text-xs text-slate-500">Altere o valor base para dar descontos ou acréscimos fixos.</p>
                </div>
                <div className="space-y-2">
                    <Label>Vencimento</Label>
                    <Input type="date" value={maintenanceForm.due_date} onChange={e => setMaintenanceForm({...maintenanceForm, due_date: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsMaintenanceOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveMaintenance} className="bg-cyan-600 text-white">Salvar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessReceivables;