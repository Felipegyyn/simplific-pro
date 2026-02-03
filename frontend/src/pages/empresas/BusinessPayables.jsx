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
    Plus, Calendar, DollarSign, Building2, FileText, AlertCircle, 
    ArrowRight, Wallet, Landmark, Loader2, CheckCircle2, Search
} from 'lucide-react';
import apiService from '../../services/api';

const BusinessPayables = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // --- DADOS CARREGADOS DA API ---
  const [payables, setPayables] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [stakeholders, setStakeholders] = useState([]); // Fornecedores
  const [categories, setCategories] = useState([]);
  const [plannings, setPlannings] = useState([]); // Para validar orçamento
  const [bankAccounts, setBankAccounts] = useState([]); // Para a lista suspensa

  // --- ESTADO DO FORMULÁRIO ---
  const initialForm = {
      company_id: '',
      stakeholder_id: '',
      due_date: '',
      doc_type: 'outros', // nota_fiscal, recibo, outros
      nf_type: 'municipal', // estadual, municipal (apenas se doc_type == nota_fiscal)
      doc_number: '', // NF ou Danfe
      category_id: '',
      subcategory_id: '',
      value: '',
      status: 'a_pagar', // pago, a_pagar
      notes: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [budgetError, setBudgetError] = useState(null); // Erro de validação

  // --- 1. CARREGAMENTO INICIAL ---
  const loadDependencies = async () => {
    setIsLoading(true);
    try {
      const [compData, stakeData, catData, planData, bankData, payData] = await Promise.all([
        apiService.get('/api/business/companies'),
        apiService.get('/api/business/stakeholders'),
        apiService.get('/api/business/categories'),
        apiService.get('/api/business/planning'),
        apiService.get('/api/business/bank-accounts'),
        apiService.get('/api/business/payables') // Vamos criar essa rota no backend depois
      ]);
      
      setCompanies(compData);
      setStakeholders(stakeData.filter(s => s.type === 'pj' || s.type === 'pf')); // Traz todos
      setCategories(catData);
      setPlannings(planData);
      setBankAccounts(bankData);
      setPayables(payData || []); 

    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDependencies(); }, []);

  // Filtros de Categoria
  const rootCategories = categories.filter(c => c.type === 'saida' && c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id === parseInt(formData.category_id));

  // --- 2. VALIDAÇÃO DE ORÇAMENTO (CORE LOGIC) ---
  const checkBudgetAvailability = (currentData) => {
      // Se faltar dados essenciais, reseta erro e retorna
      if (!currentData.company_id || !currentData.category_id || !currentData.due_date || !currentData.value) {
          setBudgetError(null);
          return;
      }

      const val = parseFloat(currentData.value);
      const dateObj = new Date(currentData.due_date);
      const monthStr = dateObj.toISOString().slice(0, 7); // "2026-02"

      // 1. Acha o planejamento da Empresa e que engloba a data
      const planning = plannings.find(p => 
          p.company_id === parseInt(currentData.company_id) && 
          p.start_date <= monthStr // Simplificação: idealmente checar range
      );

      if (!planning) {
          setBudgetError("Não há planejamento orçamentário criado para esta empresa/período.");
          return;
      }

      // 2. Acha a Linha (Categoria) dentro do planejamento
      // Verifica Categoria Principal OU Subcategoria
      const line = planning.lines.find(l => 
          l.category_id === parseInt(currentData.category_id) || 
          l.subcategory_id === parseInt(currentData.subcategory_id)
      );

      if (!line) {
          setBudgetError("Esta categoria não foi prevista no orçamento.");
          return;
      }

      // 3. Acha o Mês específico (Item)
      const item = line.items.find(i => i.month === monthStr);

      if (!item) {
          setBudgetError("Mês fora do período do planejamento.");
          return;
      }

      // 4. Valida Valor (Planejado vs Tentativa)
      // Nota: Idealmente validaríamos o SALDO (Planejado - Já Gasto), mas aqui validamos o teto.
      if (val > item.value) {
          setBudgetError(`Valor excede o orçado para ${monthStr} (Disponível: R$ ${item.value.toLocaleString('pt-BR')})`);
          return;
      }

      // Se passou por tudo
      setBudgetError(null);
  };

  // Handler unificado para inputs do form
  const handleInputChange = (field, value) => {
      const newData = { ...formData, [field]: value };
      setFormData(newData);
      
      // Aciona validação se alterar campos chave
      if (['company_id', 'category_id', 'subcategory_id', 'due_date', 'value'].includes(field)) {
          checkBudgetAvailability(newData);
      }
  };

  // --- 3. SALVAR (ASSISTENTE) ---
  const handleSave = async () => {
      // Validação Obrigatória
      const required = ['company_id', 'stakeholder_id', 'due_date', 'category_id', 'value'];
      if (!required.every(f => formData[f])) return alert("Preencha todos os campos obrigatórios.");
      
      if (budgetError) return alert("Resolva o problema de orçamento antes de salvar.");

      setIsSaving(true);
      try {
          const payload = {
              ...formData,
              // Ao salvar, prorrogação = vencimento inicialmente
              extension_date: formData.due_date, 
              value: parseFloat(formData.value),
              company_id: parseInt(formData.company_id),
              stakeholder_id: parseInt(formData.stakeholder_id),
              category_id: parseInt(formData.category_id),
              subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null
          };

          await apiService.post('/api/business/payables', payload);
          await loadDependencies(); // Atualiza a lista
          setIsModalOpen(false);
          setFormData(initialForm);
      } catch (error) {
          console.error(error);
          alert("Erro ao salvar conta a pagar.");
      } finally {
          setIsSaving(false);
      }
  };

  // --- 4. ATUALIZAÇÃO RÁPIDA NA LISTA (Prorrogação/Banco) ---
  const handleQuickUpdate = async (id, field, value) => {
      // Atualiza estado local primeiro (otimista)
      setPayables(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

      try {
          // Envia apenas o campo alterado para API
          await apiService.put(`/api/business/payables/${id}`, { [field]: value });
      } catch (error) {
          console.error("Erro ao atualizar:", error);
          alert("Erro ao atualizar registro. Recarregue a página.");
      }
  };

  // Helpers de Listas
  const getUniqueBanks = () => {
      const banks = [...new Set(bankAccounts.map(b => b.bank_name))];
      return banks;
  };
  
  const getAccountsForBank = (bankName, companyId) => {
      return bankAccounts.filter(b => b.bank_name === bankName && b.company_id === companyId);
  };

  const filteredPayables = payables.filter(p => 
      p.stakeholder_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contas a Pagar</h1>
            <p className="text-slate-500 text-sm">Controle de despesas e pagamentos.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all">
            <Plus size={18} /> Assistente de Pagamento
          </Button>
        </div>

        {/* BUSCA RAPIDA */}
        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Buscar por fornecedor ou categoria..." 
                className="pl-10 bg-white" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        {/* LISTA DE CARDS */}
        {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-600"/></div>
        ) : (
            <div className="space-y-4">
                {filteredPayables.map((pay) => (
                    <Card key={pay.id} className={`border-l-4 ${pay.status === 'pago' ? 'border-l-green-500' : 'border-l-amber-500'} hover:shadow-md transition-all`}>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            
                            {/* COLUNA 1: INFO PRINCIPAL */}
                            <div className="md:col-span-4 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{pay.company_name}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${pay.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {pay.status === 'pago' ? 'PAGO' : 'A PAGAR'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{pay.stakeholder_name}</h3>
                                <p className="text-sm text-slate-500">{pay.category_name} {pay.subcategory_name && `/ ${pay.subcategory_name}`}</p>
                                <div className="flex gap-2 text-xs text-slate-400 mt-1">
                                    {pay.doc_type !== 'outros' && <span className="flex items-center gap-1"><FileText size={10}/> {pay.doc_number || 'S/N'}</span>}
                                </div>
                            </div>

                            {/* COLUNA 2: VALORES E DATAS */}
                            <div className="md:col-span-3">
                                <p className="text-xs text-slate-400">Valor</p>
                                <p className="text-xl font-bold text-slate-700">R$ {pay.value?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                <div className="mt-2 flex items-center gap-2 text-sm">
                                    <Calendar size={14} className="text-slate-400"/>
                                    <span>Venc: {new Date(pay.due_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</span>
                                </div>
                            </div>

                            {/* COLUNA 3: EDIÇÃO RÁPIDA (PRORROGAÇÃO E BANCO) */}
                            <div className="md:col-span-5 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                                
                                {/* Prorrogação / Data Pagamento */}
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase text-slate-400">Prorrogação / Pagto</Label>
                                    <Input 
                                        type="date" 
                                        className="h-8 text-xs bg-white"
                                        value={pay.extension_date}
                                        onChange={(e) => handleQuickUpdate(pay.id, 'extension_date', e.target.value)}
                                    />
                                </div>

                                {/* Seleção de Banco e Conta */}
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    {/* Selecionar Banco */}
                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Banco</Label>
                                        <Select 
                                            value={pay.bank_name || ''} 
                                            onValueChange={(val) => handleQuickUpdate(pay.id, 'bank_name', val)}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="Banco..."/></SelectTrigger>
                                            <SelectContent>
                                                {getUniqueBanks().map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Selecionar Conta (Só aparece se tiver banco selecionado) */}
                                    {pay.bank_name && (
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Conta</Label>
                                            <Select 
                                                value={pay.bank_account_id ? pay.bank_account_id.toString() : ''} 
                                                onValueChange={(val) => handleQuickUpdate(pay.id, 'bank_account_id', parseInt(val))}
                                            >
                                                <SelectTrigger className="h-8 text-xs bg-white"><SelectValue placeholder="Conta..."/></SelectTrigger>
                                                <SelectContent>
                                                    {getAccountsForBank(pay.bank_name, pay.company_id).map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id.toString()}>
                                                            {acc.agency}/{acc.account_number} ({acc.account_type})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>

      {/* --- MODAL DO ASSISTENTE --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assistente de Pagamento</DialogTitle>
            <DialogDescription>Lance suas contas a pagar com validação orçamentária.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* LINHA 1 */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Empresa Pagadora</Label>
                    <Select value={formData.company_id} onValueChange={v => handleInputChange('company_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Select value={formData.stakeholder_id} onValueChange={v => handleInputChange('stakeholder_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{stakeholders.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Vencimento</Label>
                    <Input type="date" value={formData.due_date} onChange={e => handleInputChange('due_date', e.target.value)} />
                </div>
            </div>

            {/* LINHA 2: DOCUMENTO */}
            <div className="grid sm:grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg">
                <div className="space-y-2">
                    <Label>Tipo Documento</Label>
                    <Select value={formData.doc_type} onValueChange={v => handleInputChange('doc_type', v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="nota_fiscal">Nota Fiscal</SelectItem>
                            <SelectItem value="recibo">Recibo</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {formData.doc_type === 'nota_fiscal' && (
                    <div className="space-y-2">
                        <Label>Esfera</Label>
                        <Select value={formData.nf_type} onValueChange={v => handleInputChange('nf_type', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="municipal">Municipal (Serviço)</SelectItem>
                                <SelectItem value="estadual">Estadual (Produto)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {formData.doc_type === 'nota_fiscal' && (
                    <div className="space-y-2">
                        <Label>{formData.nf_type === 'municipal' ? 'Número da NF' : 'Chave da DANFE'}</Label>
                        <Input 
                            placeholder={formData.nf_type === 'municipal' ? 'Ex: 12345' : '44 dígitos...'} 
                            value={formData.doc_number} 
                            onChange={e => handleInputChange('doc_number', e.target.value)} 
                        />
                    </div>
                )}
            </div>

            {/* LINHA 3: CATEGORIA E VALOR (CRÍTICO) */}
            <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={formData.category_id} onValueChange={v => handleInputChange('category_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Principal..." /></SelectTrigger>
                        <SelectContent>{rootCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Subcategoria</Label>
                    <Select value={formData.subcategory_id} disabled={!formData.category_id} onValueChange={v => handleInputChange('subcategory_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Específica..." /></SelectTrigger>
                        <SelectContent>{subCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 relative">
                    <Label>Valor do Pagamento</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-slate-500 text-sm">R$</span>
                        <Input 
                            type="number" 
                            className={`pl-8 ${budgetError ? 'border-red-500 ring-red-500' : ''}`}
                            placeholder="0,00" 
                            value={formData.value} 
                            onChange={e => handleInputChange('value', e.target.value)} 
                        />
                    </div>
                </div>
            </div>

            {/* MENSAGEM DE ERRO DO ORÇAMENTO */}
            {budgetError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-pulse">
                    <AlertCircle size={20} />
                    <span className="text-sm font-bold">{budgetError}</span>
                </div>
            )}

            {/* STATUS E OBS */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Status Inicial</Label>
                    <Select value={formData.status} onValueChange={v => handleInputChange('status', v)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="a_pagar">A Pagar (Agendamento)</SelectItem>
                            <SelectItem value="pago">Pago (Baixado)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea 
                        className="h-10 min-h-[40px]" 
                        placeholder="Detalhes adicionais..." 
                        value={formData.notes} 
                        onChange={e => handleInputChange('notes', e.target.value)} 
                    />
                </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || !!budgetError} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                {isSaving ? 'Salvando...' : 'Salvar Pagamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPayables;