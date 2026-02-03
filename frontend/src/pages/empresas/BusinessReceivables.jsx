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
    AlertCircle, Loader2, Search, FileText, Calendar, 
    Wallet, ArrowUpCircle, Filter, X, Settings, CheckCircle2
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
      const due = new Date(item.due_date);
      due.setHours(0,0,0,0);

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

  // --- FILTRAGEM ---
  const filteredList = receivables.filter(r => {
      const matchesSearch = r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.doc_nf?.includes(searchTerm);
      let matchesDate = true;
      if (dateFilter.start) matchesDate = matchesDate && r.due_date >= dateFilter.start;
      if (dateFilter.end) matchesDate = matchesDate && r.due_date <= dateFilter.end;
      return matchesSearch && matchesDate;
  });

  // --- TOTAIS (KPIs) ---
  const totalReceived = filteredList.filter(r => r.status === 'recebido').reduce((acc, curr) => acc + curr.value, 0);
  const totalToReceive = filteredList.filter(r => r.status === 'a_receber').reduce((acc, curr) => {
      // Soma o valor atualizado (com juros se houver)
      return acc + calculateUpdatedValues(curr).total;
  }, 0);

  // --- MANUTENÇÃO ---
  const handleOpenMaintenance = (item) => {
      setSelectedItem(item);
      setMaintenanceForm({
          value: item.value,
          due_date: item.due_date,
          status: item.status
      });
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

  const handleQuickStatus = async (id, newStatus) => {
      try {
          await apiService.put(`/api/business/receivables/${id}/maintenance`, { status: newStatus });
          // Atualização otimista
          setReceivables(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      } catch(e) { alert("Erro."); }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
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
                        <p className="text-xs text-slate-400 font-bold uppercase">Total Recebido</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">R$ {totalReceived.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <CheckCircle2 className="text-green-500 opacity-20" size={32}/>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-950 border-l-4 border-l-amber-500 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">A Receber (Atualizado)</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">R$ {totalToReceive.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <Wallet className="text-amber-500 opacity-20" size={32}/>
                </CardContent>
            </Card>
        </div>

        {/* FILTROS E BUSCA */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
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

        {/* LISTAGEM */}
        {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-600"/></div>
        ) : (
            <div className="space-y-4">
                {filteredList.map((item) => {
                    const calc = calculateUpdatedValues(item);
                    return (
                        <Card key={item.id} className={`border-l-4 ${calc.isLate ? 'border-l-red-500 bg-red-50/20' : item.status === 'recebido' ? 'border-l-green-500 bg-green-50/10' : 'border-l-amber-500'} transition-all`}>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                
                                {/* 1. Info */}
                                <div className="md:col-span-4 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-400 uppercase">{item.company_name}</span>
                                        {item.doc_nf && <span className="text-xs bg-slate-100 px-2 rounded font-mono">NF: {item.doc_nf}</span>}
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.client_name}</h3>
                                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded font-bold">
                                        {item.installment_number}/{item.total_installments}
                                    </span>
                                </div>

                                {/* 2. Valores */}
                                <div className="md:col-span-4 border-l pl-4 border-slate-100">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Original:</span>
                                        <span className="font-medium">R$ {item.value.toFixed(2)}</span>
                                    </div>
                                    
                                    {calc.isLate ? (
                                        <div className="bg-red-50 p-2 rounded text-xs space-y-1">
                                            <div className="flex justify-between text-red-700 font-bold"><span>Atraso ({calc.daysLate} dias):</span><AlertCircle size={14}/></div>
                                            <div className="flex justify-between text-slate-600"><span>+ Multa/Juros:</span><span>R$ {(calc.fine + calc.interest).toFixed(2)}</span></div>
                                            <div className="border-t border-red-200 pt-1 mt-1 flex justify-between font-bold text-red-700 text-base">
                                                <span>Total:</span><span>R$ {calc.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm font-bold text-slate-400">Total:</span>
                                            <span className="text-xl font-bold text-green-600">R$ {calc.total.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Ações */}
                                <div className="md:col-span-4 flex flex-col gap-3 items-end">
                                    <div className="flex gap-2 w-full">
                                        <div className="flex-1 space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Status</Label>
                                            <Select value={item.status} onValueChange={(val) => handleQuickStatus(item.id, val)}>
                                                <SelectTrigger className={`h-8 text-xs font-bold ${item.status === 'recebido' ? 'bg-green-600 text-white' : 'bg-white'}`}><SelectValue/></SelectTrigger>
                                                <SelectContent><SelectItem value="a_receber">A Receber</SelectItem><SelectItem value="recebido">Recebido</SelectItem></SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end pb-0.5">
                                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenMaintenance(item)} title="Manutenção da Parcela">
                                                <Settings size={16} className="text-slate-600"/>
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1">
                                        <Calendar size={12}/> Vencimento: {new Date(item.due_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        )}
      </div>

      {/* MODAL MANUTENÇÃO */}
      <Dialog open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
        <DialogContent className="max-w-sm">
            <DialogHeader>
                <DialogTitle>Manutenção da Parcela</DialogTitle>
                <DialogDescription>Edite valores para dar descontos ou acréscimos manuais.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                <div className="space-y-2">
                    <Label>Valor Nominal (R$)</Label>
                    <Input type="number" value={maintenanceForm.value} onChange={e => setMaintenanceForm({...maintenanceForm, value: e.target.value})} />
                    <p className="text-xs text-slate-500">Altere este valor para aplicar desconto ou acréscimo definitivo.</p>
                </div>
                <div className="space-y-2">
                    <Label>Vencimento</Label>
                    <Input type="date" value={maintenanceForm.due_date} onChange={e => setMaintenanceForm({...maintenanceForm, due_date: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsMaintenanceOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveMaintenance} className="bg-cyan-600 text-white">Salvar Alterações</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessReceivables;