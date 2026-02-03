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
import { Plus, Landmark, Building2, Calendar, FileText, Edit, Trash2, Loader2, Wallet } from 'lucide-react';
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
    { code: '079', name: 'PicPay' }, // Adicionado exemplo
    { code: '212', name: 'Banco Original' }
];

const BankAccounts = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estado para controlar se é um banco fora da lista
  const [isCustomBank, setIsCustomBank] = useState(false);

  // Dados
  const [accounts, setAccounts] = useState([]);
  const [companies, setCompanies] = useState([]);
  
  // Formulário
  const initialForm = {
      company_id: '',
      bank_name: '',
      account_type: 'corrente', 
      agency: '', 
      account_number: '', 
      open_date: '',
      notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  // --- 1. CARREGAR DADOS ---
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

  // --- HANDLERS ---
  const handleOpenNew = () => {
      setEditingId(null);
      setFormData(initialForm);
      setIsCustomBank(false); // Reseta o modo custom
      setIsModalOpen(true);
  };

  const handleEdit = (acc) => {
      setEditingId(acc.id);
      
      // Verifica se o banco salvo está na lista padrão
      const isStandardBank = BANK_OPTIONS.some(b => b.name === acc.bank_name);
      
      setIsCustomBank(!isStandardBank); // Se não estiver na lista, ativa o modo custom

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
          setFormData(prev => ({ ...prev, bank_name: '' })); // Limpa para digitar
      } else {
          setIsCustomBank(false);
          setFormData(prev => ({ ...prev, bank_name: value }));
      }
  };

  const handleSave = async () => {
      if (!formData.company_id || !formData.bank_name) {
          alert("Empresa e Nome do Banco são obrigatórios.");
          return;
      }

      setIsSaving(true);
      try {
          const payload = {
              ...formData,
              company_id: parseInt(formData.company_id)
          };

          if (editingId) {
              await apiService.put(`/api/business/bank-accounts/${editingId}`, payload);
          } else {
              await apiService.post('/api/business/bank-accounts', payload);
          }
          
          await loadData();
          setIsModalOpen(false);
      } catch (error) {
          console.error("Erro ao salvar:", error);
          alert("Erro ao salvar conta bancária.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async (id) => {
      if (confirm("Tem certeza que deseja remover esta conta bancária?")) {
          try {
              await apiService.delete(`/api/business/bank-accounts/${id}`);
              setAccounts(prev => prev.filter(a => a.id !== id));
          } catch (error) {
              alert("Erro ao excluir.");
          }
      }
  };

  const getCompanyName = (id) => {
      const comp = companies.find(c => c.id === id);
      return comp ? comp.razao_social : 'Empresa Desconhecida';
  };

  const formatType = (type) => {
      const map = { 'corrente': 'Conta Corrente', 'controle': 'Conta Controle', 'aplicacao': 'Conta Aplicação' };
      return map[type] || type;
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

        {/* LOADING */}
        {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-cyan-600" /></div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* LISTAGEM */}
                {accounts.map((acc) => (
                    <Card key={acc.id} className="border-slate-200 dark:border-slate-800 hover:border-cyan-200 transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1.5 h-full ${
                            acc.account_type === 'aplicacao' ? 'bg-purple-500' : 
                            acc.account_type === 'controle' ? 'bg-amber-500' : 'bg-cyan-500'
                        }`}></div>

                        <CardHeader className="pb-2 pl-6">
                            <div className="flex justify-between items-start">
                                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                    <Landmark className="text-slate-600 dark:text-slate-400" size={24} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-cyan-600" onClick={() => handleEdit(acc)}>
                                        <Edit size={14} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(acc.id)}>
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                            <CardTitle className="text-lg mt-3 truncate">{acc.bank_name}</CardTitle>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                                {formatType(acc.account_type)}
                            </p>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 pl-6 text-sm text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <Building2 size={14} className="text-slate-400 shrink-0" />
                                <span className="truncate font-medium">{getCompanyName(acc.company_id)}</span>
                            </div>

                            {(acc.agency || acc.account_number) && (
                                <div className="flex items-center gap-2 font-mono text-xs bg-slate-50 dark:bg-slate-900 p-2 rounded">
                                    <Wallet size={12} className="text-slate-400" />
                                    <span>Ag: {acc.agency || '-'} / CC: {acc.account_number || '-'}</span>
                                </div>
                            )}

                            {acc.open_date && (
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-slate-400 shrink-0" />
                                    <span>Abertura: {new Date(acc.open_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                                </div>
                            )}

                            {acc.notes && (
                                <div className="flex items-start gap-2">
                                    <FileText size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                    <span className="line-clamp-2 text-xs italic">{acc.notes}</span>
                                </div>
                            )}
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

      {/* --- MODAL FORMULÁRIO --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle>
            <DialogDescription>Cadastre as contas bancárias da empresa.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            <div className="space-y-2">
                <Label>Empresa Titular</Label>
                <Select value={formData.company_id} onValueChange={v => setFormData({...formData, company_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione a empresa..." /></SelectTrigger>
                    <SelectContent>
                        {companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Banco</Label>
                    
                    {/* Se estiver no modo custom, mostra Input, senão Select */}
                    {isCustomBank ? (
                        <div className="flex gap-2">
                            <Input 
                                autoFocus
                                placeholder="Digite o nome do banco..." 
                                value={formData.bank_name} 
                                onChange={e => setFormData({...formData, bank_name: e.target.value})}
                            />
                            <Button 
                                variant="outline" 
                                onClick={() => setIsCustomBank(false)}
                                title="Voltar para a lista"
                            >
                                x
                            </Button>
                        </div>
                    ) : (
                        <Select 
                            value={isCustomBank ? 'OUTROS' : formData.bank_name} 
                            onValueChange={handleBankSelectChange}
                        >
                            <SelectTrigger><SelectValue placeholder="Selecione o banco..." /></SelectTrigger>
                            <SelectContent>
                                {BANK_OPTIONS.map(b => <SelectItem key={b.code} value={b.name}>{b.code} - {b.name}</SelectItem>)}
                                <SelectItem value="OUTROS" className="font-bold text-cyan-600">+ Outro Banco</SelectItem>
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
                            <SelectItem value="controle">Conta Controle (Caixinha)</SelectItem>
                            <SelectItem value="aplicacao">Conta Aplicação</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Agência (Opcional)</Label>
                    <Input placeholder="0000" value={formData.agency} onChange={e => setFormData({...formData, agency: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Número da Conta (Opcional)</Label>
                    <Input placeholder="00000-0" value={formData.account_number} onChange={e => setFormData({...formData, account_number: e.target.value})} />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Data de Abertura</Label>
                <Input type="date" value={formData.open_date} onChange={e => setFormData({...formData, open_date: e.target.value})} />
            </div>

            <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea 
                    placeholder="Ex: Conta principal para recebimento de clientes..." 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})} 
                />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {isSaving ? 'Salvando...' : 'Salvar Conta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankAccounts;