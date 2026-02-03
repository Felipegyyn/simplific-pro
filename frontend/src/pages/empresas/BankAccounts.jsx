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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Landmark, Building2, Calendar, FileText, Edit, Trash2, Loader2, Wallet, MoreVertical } from 'lucide-react';
import apiService from '../../services/api';

// Lista básica de Bancos
const BANK_OPTIONS = [
    { code: '001', name: 'Banco do Brasil' },
    { code: '033', name: 'Santander' },
    { code: '104', name: 'Caixa Econômica' },
    { code: '237', name: 'Bradesco' },
    { code: '341', name: 'Itaú' },
    { code: '077', name: 'Inter' },
    { code: '260', name: 'Nubank' },
    { code: '290', name: 'PagSeguro' },
    { code: '336', name: 'C6 Bank' },
    { code: '079', name: 'PicPay' },
    { code: '212', name: 'Banco Original' }
];

const BankAccounts = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCustomBank, setIsCustomBank] = useState(false);

  const [accounts, setAccounts] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  const initialForm = {
      company_id: '', bank_name: '', account_type: 'corrente', 
      agency: '', account_number: '', open_date: '', notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [companiesData, accountsData] = await Promise.all([
        apiService.get('/api/business/companies'),
        apiService.get('/api/business/bank-accounts')
      ]);
      setCompanies(companiesData);
      setAccounts(accountsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- LÓGICA DE AGRUPAMENTO POR BANCO ---
  const groupedAccounts = accounts.reduce((acc, curr) => {
      const key = curr.bank_name;
      if (!acc[key]) acc[key] = [];
      acc[key].push(curr);
      return acc;
  }, {});

  // --- HANDLERS ---
  const handleOpenNew = () => {
      setEditingId(null);
      setFormData(initialForm);
      setIsCustomBank(false);
      setIsModalOpen(true);
  };

  const handleEdit = (acc) => {
      setEditingId(acc.id);
      const isStandardBank = BANK_OPTIONS.some(b => b.name === acc.bank_name);
      setIsCustomBank(!isStandardBank);
      setFormData({
          company_id: acc.company_id.toString(),
          bank_name: acc.bank_name,
          account_type: acc.account_type,
          agency: acc.agency || '',
          account_number: acc.account_number || '',
          open_date: acc.open_date || '',
          notes: acc.notes || ''
      });
      setIsModalOpen(true);
  };

  const handleBankSelectChange = (value) => {
      if (value === 'OUTROS') {
          setIsCustomBank(true);
          setFormData(prev => ({ ...prev, bank_name: '' }));
      } else {
          setIsCustomBank(false);
          setFormData(prev => ({ ...prev, bank_name: value }));
      }
  };

  const handleSave = async () => {
      if (!formData.company_id || !formData.bank_name) return alert("Empresa e Banco são obrigatórios.");
      setIsSaving(true);
      try {
          const payload = { ...formData, company_id: parseInt(formData.company_id) };
          if (editingId) await apiService.put(`/api/business/bank-accounts/${editingId}`, payload);
          else await apiService.post('/api/business/bank-accounts', payload);
          await loadData();
          setIsModalOpen(false);
      } catch (error) { alert("Erro ao salvar."); } finally { setIsSaving(false); }
  };

  const handleDelete = async (id) => {
      if (confirm("Tem certeza que deseja remover esta conta bancária?")) {
          try {
              await apiService.delete(`/api/business/bank-accounts/${id}`);
              setAccounts(prev => prev.filter(a => a.id !== id));
          } catch (error) { alert("Erro ao excluir."); }
      }
  };

  const getCompanyName = (id) => companies.find(c => c.id === id)?.razao_social || 'Empresa Desconhecida';
  const formatType = (type) => ({ 'corrente': 'Conta Corrente', 'controle': 'Conta Controle', 'aplicacao': 'Conta Aplicação' }[type] || type);

  // Helper para cor da faixa lateral baseada no tipo
  const getTypeColor = (type) => {
      if (type === 'aplicacao') return 'bg-purple-500 border-purple-500';
      if (type === 'controle') return 'bg-amber-500 border-amber-500';
      return 'bg-cyan-500 border-cyan-500';
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contas Correntes</h1>
            <p className="text-slate-500 text-sm">Gerencie as contas bancárias das suas empresas.</p>
          </div>
          <Button onClick={handleOpenNew} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-sm">
            <Plus size={18} /> Adicionar Conta
          </Button>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-cyan-600" /></div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Iteramos sobre os GRUPOS (Bancos) */}
                {Object.entries(groupedAccounts).map(([bankName, items]) => (
                    <Card key={bankName} className="border-slate-200 dark:border-slate-800 hover:border-cyan-200 transition-all overflow-hidden">
                        <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm">
                                    <Landmark className="text-slate-600 dark:text-slate-400" size={20} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{bankName}</CardTitle>
                                    <p className="text-xs text-slate-400 font-medium">{items.length} conta{items.length > 1 ? 's' : ''} cadastrada{items.length > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="p-0">
                            {/* Lista de Contas deste Banco */}
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {items.map((acc) => (
                                    <div key={acc.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors relative group">
                                        {/* Faixa lateral indicativa do tipo */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getTypeColor(acc.account_type)}`}></div>
                                        
                                        <div className="pl-3">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold uppercase text-slate-500 tracking-wide">
                                                    {formatType(acc.account_type)}
                                                </span>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(acc)} className="text-slate-400 hover:text-cyan-600"><Edit size={14}/></button>
                                                    <button onClick={() => handleDelete(acc.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-2">
                                                <Building2 size={14} className="text-slate-400 shrink-0" />
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                                    {getCompanyName(acc.company_id)}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400 font-mono">
                                                {(acc.agency || acc.account_number) ? (
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                        Ag: {acc.agency || '-'} / CC: {acc.account_number || '-'}
                                                    </span>
                                                ) : (
                                                    <span className="italic text-slate-400">Sem dados de agência/conta</span>
                                                )}
                                            </div>
                                            
                                            {acc.notes && <p className="text-xs text-slate-400 mt-2 line-clamp-1 italic">{acc.notes}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {accounts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300">
                        <Landmark size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Nenhuma conta bancária cadastrada.</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editingId ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
                <Label>Empresa Titular</Label>
                <Select value={formData.company_id} onValueChange={v => setFormData({...formData, company_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Banco</Label>
                    {isCustomBank ? (
                        <div className="flex gap-2">
                            <Input autoFocus placeholder="Nome do banco..." value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})}/>
                            <Button variant="outline" onClick={() => setIsCustomBank(false)}>x</Button>
                        </div>
                    ) : (
                        <Select value={isCustomBank ? 'OUTROS' : formData.bank_name} onValueChange={handleBankSelectChange}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>
                                {BANK_OPTIONS.map(b => <SelectItem key={b.code} value={b.name}>{b.code} - {b.name}</SelectItem>)}
                                <SelectItem value="OUTROS" className="font-bold text-cyan-600">+ Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="space-y-2">
                    <Label>Tipo de Conta</Label>
                    <Select value={formData.account_type} onValueChange={v => setFormData({...formData, account_type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="corrente">Conta Corrente</SelectItem>
                            <SelectItem value="controle">Conta Controle</SelectItem>
                            <SelectItem value="aplicacao">Conta Aplicação</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Agência</Label><Input placeholder="0000" value={formData.agency} onChange={e => setFormData({...formData, agency: e.target.value})} /></div>
                <div className="space-y-2"><Label>Conta</Label><Input placeholder="00000-0" value={formData.account_number} onChange={e => setFormData({...formData, account_number: e.target.value})} /></div>
            </div>
            <div className="space-y-2"><Label>Abertura</Label><Input type="date" value={formData.open_date} onChange={e => setFormData({...formData, open_date: e.target.value})} /></div>
            <div className="space-y-2"><Label>Obs</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 text-white">Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankAccounts;