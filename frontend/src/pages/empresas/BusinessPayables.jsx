import React, { useState, useEffect } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Plus, Calendar, FileText, AlertCircle, 
    Loader2, Search, Edit, Trash2, Filter, X,
    ArrowUpCircle, ArrowDownCircle
} from 'lucide-react';
import apiService from '../../services/api';

const BusinessPayables = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Dados
  const [payables, setPayables] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stakeholders, setStakeholders] = useState([]); 
  const [categories, setCategories] = useState([]);
  const [plannings, setPlannings] = useState([]); 
  const [bankAccounts, setBankAccounts] = useState([]); 

  // Formulário
  const initialForm = {
      company_id: '', stakeholder_id: '', due_date: '',
      doc_type: 'outros', nf_type: 'municipal', doc_number: '',
      category_id: '', subcategory_id: '', value: '',
      status: 'a_pagar', notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null); // ID para edição completa
  const [budgetError, setBudgetError] = useState(null);

  // --- CARREGAMENTO ---
  const loadDependencies = async () => {
    setIsLoading(true);
    try {
      const [compData, stakeData, catData, planData, bankData, payData] = await Promise.all([
        apiService.get('/api/business/companies'),
        apiService.get('/api/business/stakeholders'),
        apiService.get('/api/business/categories'),
        apiService.get('/api/business/planning'),
        apiService.get('/api/business/bank-accounts'),
        apiService.get('/api/business/payables')
      ]);
      setCompanies(compData);
      setStakeholders(stakeData.filter(s => s.type === 'pj' || s.type === 'pf'));
      setCategories(catData);
      setPlannings(planData);
      setBankAccounts(bankData);
      setPayables(payData || []); 
    } catch (error) { console.error("Erro:", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadDependencies(); }, []);

  // Filtros de Categoria para o Modal
  const rootCategories = categories.filter(c => c.type === 'saida' && c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id === parseInt(formData.category_id));

  // --- FILTROS E TOTAIS ---
  const filteredPayables = payables.filter(p => {
      const matchesSearch = p.stakeholder_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateFilter.start) matchesDate = matchesDate && p.due_date >= dateFilter.start;
      if (dateFilter.end) matchesDate = matchesDate && p.due_date <= dateFilter.end;

      return matchesSearch && matchesDate;
  });

  const totalPaid = filteredPayables.filter(p => p.status === 'pago').reduce((acc, curr) => acc + curr.value, 0);
  const totalToPay = filteredPayables.filter(p => p.status === 'a_pagar').reduce((acc, curr) => acc + curr.value, 0);

  // --- VALIDAÇÃO ORÇAMENTO ---
  const checkBudgetAvailability = (currentData) => {
      if (!currentData.company_id || !currentData.category_id || !currentData.due_date || !currentData.value) {
          setBudgetError(null); return;
      }
      const val = parseFloat(currentData.value);
      const monthStr = new Date(currentData.due_date).toISOString().slice(0, 7); 

      const planning = plannings.find(p => p.company_id === parseInt(currentData.company_id) && p.start_date <= monthStr);
      if (!planning) { setBudgetError("Sem planejamento para o período."); return; }

      const line = planning.lines.find(l => l.category_id === parseInt(currentData.category_id) || l.subcategory_id === parseInt(currentData.subcategory_id));
      if (!line) { setBudgetError("Categoria não prevista."); return; }

      const item = line.items.find(i => i.month === monthStr);
      if (!item) { setBudgetError("Mês fora do planejamento."); return; }

      if (val > item.value) {
          setBudgetError(`Valor excede o orçado (Disp: R$ ${item.value.toLocaleString('pt-BR')})`);
          return;
      }
      setBudgetError(null);
  };

  const handleInputChange = (field, value) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      if (['company_id', 'category_id', 'subcategory_id', 'due_date', 'value'].includes(field)) {
          checkBudgetAvailability(newData);
      }
  };

  // --- AÇÕES CRUD ---
  const handleOpenNew = () => {
      setEditingId(null);
      setFormData(initialForm);
      setBudgetError(null);
      setIsModalOpen(true);
  };

  const handleEditFull = (pay) => {
      setEditingId(pay.id);
      setFormData({
          company_id: pay.company_id.toString(),
          stakeholder_id: pay.stakeholder_id.toString(),
          due_date: pay.due_date,
          doc_type: pay.doc_type || 'outros',
          nf_type: pay.nf_type || 'municipal',
          doc_number: pay.doc_number || '',
          category_id: pay.category_id.toString(),
          subcategory_id: pay.subcategory_id ? pay.subcategory_id.toString() : '',
          value: pay.value,
          status: pay.status,
          notes: pay.notes || ''
      });
      setBudgetError(null); // Ao editar, reseta erro visualmente por enquanto
      setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
      if(confirm("Tem certeza que deseja excluir esta conta?")) {
          try {
              await apiService.delete(`/api/business/payables/${id}`);
              setPayables(prev => prev.filter(p => p.id !== id));
          } catch(e) { alert("Erro ao excluir."); }
      }
  };

  const handleSave = async () => {
      const required = ['company_id', 'stakeholder_id', 'due_date', 'category_id', 'value'];
      if (!required.every(f => formData[f])) return alert("Preencha campos obrigatórios.");
      if (budgetError) return alert("Resolva o orçamento antes.");

      setIsSaving(true);
      try {
          const payload = {
              ...formData,
              extension_date: formData.due_date, 
              value: parseFloat(formData.value),
              company_id: parseInt(formData.company_id),
              stakeholder_id: parseInt(formData.stakeholder_id),
              category_id: parseInt(formData.category_id),
              subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null
          };

          if (editingId) {
              await apiService.put(`/api/business/payables/${editingId}`, payload);
          } else {
              await apiService.post('/api/business/payables', payload);
          }
          
          await loadDependencies();
          setIsModalOpen(false);
      } catch (error) { alert("Erro ao salvar."); } 
      finally { setIsSaving(false); }
  };

  const handleQuickUpdate = async (id, field, value) => {
      setPayables(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
      try { await apiService.put(`/api/business/payables/${id}`, { [field]: value }); } 
      catch (e) { alert("Erro ao atualizar."); }
  };

  // Helpers
  const getUniqueBanks = () => [...new Set(bankAccounts.map(b => b.bank_name))];
  const getAccountsForBank = (bankName, companyId) => bankAccounts.filter(b => b.bank_name === bankName && b.company_id === companyId);

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* HEADER E BOTÃO NOVO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contas a Pagar</h1>
            <p className="text-slate-500 text-sm">Controle de despesas e pagamentos.</p>
          </div>
          <Button onClick={handleOpenNew} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-sm">
            <Plus size={18} /> Assistente de Pagamento
          </Button>
        </div>

        {/* CARDS DE RESUMO (TOTAIS) */}
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white dark:bg-slate-950 border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total Pago</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">
                            R$ {totalPaid.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <ArrowDownCircle size={24} />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-white dark:bg-slate-950 border-l-4 border-l-amber-500 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Total A Pagar</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">
                            R$ {totalToPay.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </p>
                    </div>
                    <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                        <AlertCircle size={24} />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* BARRA DE FILTROS */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Buscar fornecedor ou categoria..." 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-md border">
                            <span className="text-xs text-slate-500 pl-2">De:</span>
                            <Input 
                                type="date" className="h-8 border-0 bg-transparent w-32"
                                value={dateFilter.start} onChange={e => setDateFilter({...dateFilter, start: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-md border">
                            <span className="text-xs text-slate-500 pl-2">Até:</span>
                            <Input 
                                type="date" className="h-8 border-0 bg-transparent w-32"
                                value={dateFilter.end} onChange={e => setDateFilter({...dateFilter, end: e.target.value})}
                            />
                        </div>
                        {(dateFilter.start || dateFilter.end) && (
                            <Button variant="ghost" size="icon" onClick={() => setDateFilter({start:'', end:''})} title="Limpar datas">
                                <X size={16} className="text-slate-500"/>
                            </Button>
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
                {filteredPayables.map((pay) => (
                    <Card key={pay.id} className={`border-l-4 ${pay.status === 'pago' ? 'border-l-green-500' : 'border-l-amber-500'} hover:shadow-md transition-all group`}>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            
                            {/* COLUNA 1: INFO */}
                            <div className="md:col-span-4 space-y-1 relative">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{pay.company_name}</span>
                                    
                                    {/* STATUS EDITÁVEL (SELECT) */}
                                    <Select 
                                        value={pay.status} 
                                        onValueChange={(val) => handleQuickUpdate(pay.id, 'status', val)}
                                    >
                                        <SelectTrigger className={`h-6 text-[10px] uppercase font-bold border-0 px-2 rounded-full w-auto gap-1 ${pay.status === 'pago' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="a_pagar">A Pagar</SelectItem>
                                            <SelectItem value="pago">Pago</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{pay.stakeholder_name}</h3>
                                <p className="text-sm text-slate-500">{pay.category_name} {pay.subcategory_name && `/ ${pay.subcategory_name}`}</p>
                                <div className="flex gap-2 text-xs text-slate-400 mt-1">
                                    {pay.doc_type !== 'outros' && <span className="flex items-center gap-1"><FileText size={10}/> {pay.doc_number || 'S/N'}</span>}
                                </div>
                            </div>

                            {/* COLUNA 2: VALORES */}
                            <div className="md:col-span-3">
                                <p className="text-xs text-slate-400">Valor</p>
                                <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
                                    R$ {pay.value?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    <Calendar size={14} className="text-slate-400"/>
                                    <span>Venc: {new Date(pay.due_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                                </div>
                            </div>

                            {/* COLUNA 3: EDIÇÃO RÁPIDA */}
                            <div className="md:col-span-5 flex gap-3">
                                <div className="flex-1 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Prorrogação</Label>
                                        <Input 
                                            type="date" className="h-8 text-xs bg-white dark:bg-slate-800"
                                            value={pay.extension_date}
                                            onChange={(e) => handleQuickUpdate(pay.id, 'extension_date', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Banco/Conta</Label>
                                        {!pay.bank_name ? (
                                            <Select onValueChange={(val) => handleQuickUpdate(pay.id, 'bank_name', val)}>
                                                <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800"><SelectValue placeholder="Selecione..."/></SelectTrigger>
                                                <SelectContent>{getUniqueBanks().map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                                            </Select>
                                        ) : (
                                            <Select 
                                                value={pay.bank_account_id ? pay.bank_account_id.toString() : ''} 
                                                onValueChange={(val) => handleQuickUpdate(pay.id, 'bank_account_id', parseInt(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800"><SelectValue placeholder={pay.bank_name}/></SelectTrigger>
                                                <SelectContent>
                                                    {getAccountsForBank(pay.bank_name, pay.company_id).map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id.toString()}>{acc.bank_name} - {acc.agency}/{acc.account_number}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>
                                
                                {/* BOTÕES DE AÇÃO (EDITAR / EXCLUIR) */}
                                <div className="flex flex-col gap-1 justify-center">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-cyan-600 hover:bg-slate-100" onClick={() => handleEditFull(pay)}>
                                        <Edit size={16}/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(pay.id)}>
                                        <Trash2 size={16}/>
                                    </Button>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>

      {/* --- MODAL DO ASSISTENTE (MANTIDO) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Conta a Pagar' : 'Assistente de Pagamento'}</DialogTitle>
            <DialogDescription>Lance suas contas com validação orçamentária.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Empresa</Label><Select value={formData.company_id} onValueChange={v => handleInputChange('company_id', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Fornecedor</Label><Select value={formData.stakeholder_id} onValueChange={v => handleInputChange('stakeholder_id', v)}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{stakeholders.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Vencimento</Label><Input type="date" value={formData.due_date} onChange={e => handleInputChange('due_date', e.target.value)} /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
                <div className="space-y-2"><Label>Tipo Doc</Label><Select value={formData.doc_type} onValueChange={v => handleInputChange('doc_type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="nota_fiscal">Nota Fiscal</SelectItem><SelectItem value="recibo">Recibo</SelectItem><SelectItem value="outros">Outros</SelectItem></SelectContent></Select></div>
                {formData.doc_type === 'nota_fiscal' && <div className="space-y-2"><Label>Esfera</Label><Select value={formData.nf_type} onValueChange={v => handleInputChange('nf_type', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="municipal">Municipal</SelectItem><SelectItem value="estadual">Estadual</SelectItem></SelectContent></Select></div>}
                {formData.doc_type === 'nota_fiscal' && <div className="space-y-2"><Label>{formData.nf_type === 'municipal' ? 'Número NF' : 'Chave Danfe'}</Label><Input value={formData.doc_number} onChange={e => handleInputChange('doc_number', e.target.value)} /></div>}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Categoria</Label><Select value={formData.category_id} onValueChange={v => handleInputChange('category_id', v)}><SelectTrigger><SelectValue placeholder="Principal..." /></SelectTrigger><SelectContent>{rootCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Subcategoria</Label><Select value={formData.subcategory_id} disabled={!formData.category_id} onValueChange={v => handleInputChange('subcategory_id', v)}><SelectTrigger><SelectValue placeholder="Específica..." /></SelectTrigger><SelectContent>{subCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2 relative"><Label>Valor</Label><div className="relative"><span className="absolute left-3 top-2.5 text-slate-500 text-sm">R$</span><Input type="number" className={`pl-8 ${budgetError ? 'border-red-500 ring-red-500' : ''}`} placeholder="0,00" value={formData.value} onChange={e => handleInputChange('value', e.target.value)} /></div></div>
            </div>
            {budgetError && <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-pulse"><AlertCircle size={20} /><span className="text-sm font-bold">{budgetError}</span></div>}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Status Inicial</Label><Select value={formData.status} onValueChange={v => handleInputChange('status', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="a_pagar">A Pagar</SelectItem><SelectItem value="pago">Pago</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>Observações</Label><Textarea className="h-10 min-h-[40px]" placeholder="Detalhes..." value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !!budgetError} className="bg-cyan-600 hover:bg-cyan-700 text-white">{isSaving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPayables;