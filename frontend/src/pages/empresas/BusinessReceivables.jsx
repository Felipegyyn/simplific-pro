import React, { useState, useEffect } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
    AlertCircle, Loader2, Search, FileText, Calendar, Wallet, ArrowUpCircle
} from 'lucide-react';
import apiService from '../../services/api';

const BusinessReceivables = ({ user, onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [receivables, setReceivables] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');

  // --- CARREGAMENTO ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carrega a rota específica de recebíveis (parcelas)
      const data = await apiService.get('/api/business/receivables');
      setReceivables(data || []);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // --- LÓGICA DE CÁLCULO REAL-TIME (JUROS/MULTA) ---
  const calculateUpdatedValues = (item) => {
      // Se já recebeu, não calcula
      if (item.status === 'recebido') {
          return { total: item.value, fine: 0, interest: 0, isLate: false };
      }

      const today = new Date();
      today.setHours(0,0,0,0);
      const due = new Date(item.due_date);
      due.setHours(0,0,0,0);

      // Se não venceu ainda
      if (today <= due) {
          return { total: item.value, fine: 0, interest: 0, isLate: false };
      }

      // Vencido
      const diffTime = Math.abs(today - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      let fineVal = 0;
      let interestVal = 0;

      // Verifica se a venda original configurou multa
      if (item.apply_penalty) {
          // Multa Fixa
          fineVal = item.value * (item.fine_percent / 100);
          
          // Juros Mensais (pro-rata dia) -> Taxa / 30 * Dias
          const dailyInterestRate = (item.interest_percent / 100) / 30;
          interestVal = item.value * dailyInterestRate * diffDays;
      }

      return {
          total: item.value + fineVal + interestVal,
          fine: fineVal,
          interest: interestVal,
          isLate: true,
          daysLate: diffDays
      };
  };

  // --- ATUALIZAÇÃO DE STATUS E DATA ---
  const handleQuickUpdate = async (id, field, value) => {
      // Atualização Otimista
      setReceivables(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
      try {
          await apiService.put(`/api/business/receivables/${id}`, { [field]: value });
      } catch (e) { alert("Erro ao atualizar."); loadData(); }
  };

  const filteredList = receivables.filter(r => 
      r.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.doc_nf?.includes(searchTerm)
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contas a Receber</h1>
            <p className="text-slate-500 text-sm">Gerencie recebimentos, inadimplência e baixas.</p>
          </div>
        </div>

        {/* BUSCA */}
        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Buscar por cliente, NF..." 
                className="pl-10 bg-white" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

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
                                
                                {/* 1. Dados da Parcela */}
                                <div className="md:col-span-4 space-y-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                            #{item.id}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 uppercase">{item.company_name}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.client_name}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded font-bold">
                                            Parcela {item.installment_number}
                                        </span>
                                        {item.doc_nf && <span className="text-xs text-slate-400 flex items-center gap-1"><FileText size={10}/> NF: {item.doc_nf}</span>}
                                    </div>
                                </div>

                                {/* 2. Valores e Cálculos */}
                                <div className="md:col-span-4 border-l pl-4 border-slate-100">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-500">Valor Original:</span>
                                        <span className="font-medium">R$ {item.value.toFixed(2)}</span>
                                    </div>
                                    
                                    {calc.isLate ? (
                                        <div className="bg-red-50 p-2 rounded text-xs space-y-1">
                                            <div className="flex justify-between text-red-700 font-bold">
                                                <span>Atraso ({calc.daysLate} dias):</span>
                                                <AlertCircle size={14}/>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>+ Multa ({item.fine_percent}%):</span>
                                                <span>R$ {calc.fine.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-600">
                                                <span>+ Juros ({item.interest_percent}%/mês):</span>
                                                <span>R$ {calc.interest.toFixed(2)}</span>
                                            </div>
                                            <div className="border-t border-red-200 pt-1 mt-1 flex justify-between font-bold text-red-700 text-base">
                                                <span>Total Atualizado:</span>
                                                <span>R$ {calc.total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-sm font-bold text-slate-400">Total Atual:</span>
                                            <span className="text-xl font-bold text-green-600">R$ {calc.total.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* 3. Ações (Data e Status) */}
                                <div className="md:col-span-4 flex flex-col gap-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Vencimento</Label>
                                        <Input 
                                            type="date" 
                                            className={`h-8 text-xs ${calc.isLate ? 'text-red-600 font-bold border-red-300' : ''}`}
                                            value={item.due_date}
                                            disabled={item.status === 'recebido'}
                                            onChange={(e) => handleQuickUpdate(item.id, 'due_date', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Status</Label>
                                        <Select 
                                            value={item.status} 
                                            onValueChange={(val) => handleQuickUpdate(item.id, 'status', val)}
                                        >
                                            <SelectTrigger className={`h-8 text-xs font-bold ${item.status === 'recebido' ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white hover:bg-slate-50'}`}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="a_receber">A Receber</SelectItem>
                                                <SelectItem value="recebido">Recebido</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}

                {filteredList.length === 0 && (
                    <div className="text-center py-10 text-slate-400">Nenhuma conta a receber encontrada.</div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default BusinessReceivables;