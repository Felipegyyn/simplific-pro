import React, { useState, useEffect } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Plus, Loader2, Search, Box, FileText, Calendar, DollarSign
} from 'lucide-react';
import apiService from '../../services/api';

const BusinessSales = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dados para seleção
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]); 
  const [products, setProducts] = useState([]); 
  const [salesHistory, setSalesHistory] = useState([]); // Histórico resumido

  const [searchTerm, setSearchTerm] = useState('');

  // Formulário
  const initialForm = {
      company_id: '',
      client_id: '',
      
      // Estoque
      use_inventory: false,
      product_id: '',
      product_sku: '',
      quantity: 1,
      
      // Financeiro
      total_value: '',
      payment_terms: 'vista', // vista, parcelado
      installment_count: 2,
      periodicity: 'mensal', // mensal, quinzenal, semestral, anual
      
      first_due_date: '',
      payment_method: 'pix',
      doc_nf: '',
      
      // Configuração de Atraso
      apply_penalty: false,
      fine_percent: 2.00,
      interest_percent: 1.00, // % Mensal
      
      notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  // --- CARREGAMENTO ---
  const loadDependencies = async () => {
    setIsLoading(true);
    try {
      const [compData, clientData, prodData, salesData] = await Promise.all([
        apiService.get('/api/business/companies'),
        apiService.get('/api/business/stakeholders'), 
        apiService.get('/api/business/inventory'),
        apiService.get('/api/business/sales') // Histórico de vendas
      ]);
      setCompanies(compData);
      setClients(clientData.filter(c => c.type === 'pf' || c.type === 'pj'));
      setProducts(prodData);
      setSalesHistory(salesData || []);
    } catch (error) { console.error(error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { loadDependencies(); }, []);

  // --- HANDLERS ---
  const handleInputChange = (field, value) => {
      let updates = { [field]: value };
      
      // Autopreencher dados do produto se selecionado do estoque
      if (field === 'product_id') {
          const prod = products.find(p => p.id.toString() === value);
          if (prod) {
              updates.total_value = prod.sale_price; 
              updates.product_sku = prod.sku;
          }
      }
      setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
      if (!formData.company_id || !formData.client_id || !formData.total_value || !formData.first_due_date) {
          alert("Preencha os campos obrigatórios.");
          return;
      }

      setIsSaving(true);
      try {
          const payload = {
              ...formData,
              company_id: parseInt(formData.company_id),
              client_id: parseInt(formData.client_id),
              product_id: formData.use_inventory && formData.product_id ? parseInt(formData.product_id) : null,
              total_value: parseFloat(formData.total_value),
              quantity: parseFloat(formData.quantity),
              
              // Se for a vista, força 1 parcela
              installment_count: formData.payment_terms === 'vista' ? 1 : parseInt(formData.installment_count),
              
              fine_percent: formData.apply_penalty ? parseFloat(formData.fine_percent) : 0,
              interest_percent: formData.apply_penalty ? parseFloat(formData.interest_percent) : 0
          };

          await apiService.post('/api/business/sales', payload);
          await loadDependencies();
          setIsModalOpen(false);
          setFormData(initialForm);
          alert("Venda registrada! As parcelas foram geradas em 'Contas a Receber'.");
      } catch (error) {
          alert("Erro ao salvar venda.");
      } finally {
          setIsSaving(false);
      }
  };

  const filteredHistory = salesHistory.filter(s => s.client_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Vendas</h1>
            <p className="text-slate-500 text-sm">Registro de vendas e saídas de estoque.</p>
          </div>
          <Button onClick={() => { setFormData(initialForm); setIsModalOpen(true); }} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-lg">
            <Plus size={18} /> Nova Venda
          </Button>
        </div>

        {/* LISTAGEM SIMPLES DE HISTÓRICO (APENAS CABEÇALHO) */}
        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input placeholder="Buscar vendas por cliente..." className="pl-10 bg-white" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
        </div>

        {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-600"/></div>
        ) : (
            <div className="grid gap-4">
                {filteredHistory.map(sale => (
                    <Card key={sale.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-cyan-50 p-3 rounded-full text-cyan-600 font-bold text-xs">#{sale.id}</div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{sale.client_name}</h3>
                                    <p className="text-sm text-slate-500">{sale.product_name ? `${sale.product_name} (x${sale.quantity})` : 'Venda Avulsa'} - {sale.payment_terms}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-slate-700">R$ {sale.total_value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                                <p className="text-xs text-slate-400">Data: {new Date(sale.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>

      {/* --- MODAL NOVA VENDA (FORMULÁRIO VERTICAL) --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Venda</DialogTitle><DialogDescription>Preencha os dados da venda abaixo.</DialogDescription></DialogHeader>
          
          <div className="space-y-5 py-4">
            
            {/* EMPRESA/CLIENTE */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Empresa Vendedora</Label>
                    <Select value={formData.company_id} onValueChange={v => handleInputChange('company_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Nome do Cliente</Label>
                    <Select value={formData.client_id} onValueChange={v => handleInputChange('client_id', v)}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            {/* ESTOQUE */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 font-bold text-slate-700"><Box size={16} /> Baixar Estoque?</Label>
                    <Switch checked={formData.use_inventory} onCheckedChange={c => handleInputChange('use_inventory', c)} />
                </div>
                {formData.use_inventory && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <Label>Produto</Label>
                            <Select value={formData.product_id} onValueChange={v => handleInputChange('product_id', v)}>
                                <SelectTrigger><SelectValue placeholder="Selecione do estoque..." /></SelectTrigger>
                                <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name} (Saldo: {p.current_stock})</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Código (SKU)</Label>
                                <Input value={formData.product_sku} onChange={e => handleInputChange('product_sku', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Quantidade</Label>
                                <Input type="number" value={formData.quantity} onChange={e => handleInputChange('quantity', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FINANCEIRO */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Valor Total (R$)</Label>
                    <Input type="number" className="font-bold text-lg" value={formData.total_value} onChange={e => handleInputChange('total_value', e.target.value)} placeholder="0.00" />
                </div>

                <div className="space-y-2">
                    <Label>Forma de Recebimento</Label>
                    <Select value={formData.payment_terms} onValueChange={v => handleInputChange('payment_terms', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="vista">À Vista</SelectItem><SelectItem value="parcelado">Parcelado</SelectItem></SelectContent>
                    </Select>
                </div>

                {formData.payment_terms === 'parcelado' && (
                    <div className="grid grid-cols-2 gap-4 bg-cyan-50 p-3 rounded border border-cyan-100">
                        <div className="space-y-2">
                            <Label>Qtd. Parcelas</Label>
                            <Input type="number" min="2" value={formData.installment_count} onChange={e => handleInputChange('installment_count', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Periodicidade</Label>
                            <Select value={formData.periodicity} onValueChange={v => handleInputChange('periodicity', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mensal">Mensal</SelectItem>
                                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                                    <SelectItem value="semestral">Semestral</SelectItem>
                                    <SelectItem value="anual">Anual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label>{formData.payment_terms === 'parcelado' ? '1ª Data de Vencimento' : 'Data de Recebimento'}</Label>
                    <Input type="date" value={formData.first_due_date} onChange={e => handleInputChange('first_due_date', e.target.value)} />
                </div>

                <div className="space-y-2">
                    <Label>Meio de Pagamento</Label>
                    <Select value={formData.payment_method} onValueChange={v => handleInputChange('payment_method', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pix">PIX</SelectItem><SelectItem value="boleto">Boleto</SelectItem><SelectItem value="cartao_credito">Cartão Crédito</SelectItem><SelectItem value="cartao_debito">Cartão Débito</SelectItem><SelectItem value="dinheiro">Dinheiro</SelectItem><SelectItem value="ted">TED/DOC</SelectItem><SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>NF de Saída (Opcional)</Label>
                    <Input value={formData.doc_nf} onChange={e => handleInputChange('doc_nf', e.target.value)} placeholder="Número da Nota" />
                </div>
            </div>

            {/* JUROS E MULTA */}
            <div className="space-y-4 bg-red-50 p-4 rounded-lg border border-red-100">
                <div className="flex items-center justify-between">
                    <Label className="font-bold text-red-800">Cobrar Juros e Multa em atraso?</Label>
                    <Switch checked={formData.apply_penalty} onCheckedChange={c => handleInputChange('apply_penalty', c)} />
                </div>
                {formData.apply_penalty && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                        <div className="space-y-2">
                            <Label>Juros (% ao Mês)</Label>
                            <Input type="number" step="0.01" value={formData.interest_percent} onChange={e => handleInputChange('interest_percent', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Multa (% Fixa)</Label>
                            <Input type="number" step="0.01" value={formData.fine_percent} onChange={e => handleInputChange('fine_percent', e.target.value)} />
                        </div>
                        <p className="text-[10px] text-red-600 col-span-2">* O cálculo será feito por dia de atraso automaticamente.</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={formData.notes} onChange={e => handleInputChange('notes', e.target.value)} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700 text-white">{isSaving ? 'Salvando...' : 'Salvar Venda'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessSales;