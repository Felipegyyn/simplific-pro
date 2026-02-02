import React, { useState, useEffect } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target, Calendar, Check, Loader2, Edit, Trash2, ChevronRight, X } from 'lucide-react';
import apiService from '../../services/api';

const BusinessPlanning = ({ user, onLogout }) => {
  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Estados de Carregamento
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dados
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [selectedPlanning, setSelectedPlanning] = useState(null); // Para o detalhe

  // Edição de Item Específico (Mês)
  const [editingItem, setEditingItem] = useState(null); // { id: 123, value: 500 }

  // Formulário Principal
  const [editingId, setEditingId] = useState(null); // ID do orçamento sendo editado (cabeçalho)
  const [formData, setFormData] = useState({
    name: '', company_id: '', start_date: '', period_months: 12, 
    category_id: '', subcategory_id: '', base_value: '', replicate: true, manual_values: {} 
  });

  const loadDependencies = async () => {
    setIsLoading(true);
    try {
      const [companiesData, categoriesData, planningData] = await Promise.all([
        apiService.get('/api/business/companies'),
        apiService.get('/api/business/categories'),
        apiService.get('/api/business/planning')
      ]);
      setCompanies(companiesData);
      setCategories(categoriesData);
      setPlannings(planningData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDependencies(); }, []);

  const rootCategories = categories.filter(c => c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id === parseInt(formData.category_id));

  // --- FORMULÁRIO: NOVO/EDITAR CABEÇALHO ---
  const handleOpenNew = () => {
      setEditingId(null);
      setFormData({ name: '', company_id: '', start_date: '', period_months: 12, category_id: '', subcategory_id: '', base_value: '', replicate: true, manual_values: {} });
      setIsFormModalOpen(true);
  };

  const handleEditHeader = (e, plan) => {
      e.stopPropagation(); // Evita abrir o detalhe
      setEditingId(plan.id);
      setFormData({
          name: plan.name,
          company_id: plan.company_id.toString(),
          category_id: plan.category_id.toString(),
          subcategory_id: plan.subcategory_id ? plan.subcategory_id.toString() : '',
          // Campos desabilitados na edição
          start_date: plan.start_date,
          period_months: plan.items.length,
          base_value: 0, 
          replicate: true,
          manual_values: {}
      });
      setIsFormModalOpen(true);
  };

  const handleSaveForm = async () => {
      if (!formData.name) return alert("Nome é obrigatório.");
      setIsSaving(true);
      try {
          if (editingId) {
              // PUT (Apenas Cabeçalho)
              await apiService.put(`/api/business/planning/${editingId}`, {
                  name: formData.name,
                  company_id: parseInt(formData.company_id),
                  category_id: parseInt(formData.category_id),
                  subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null
              });
          } else {
              // POST (Novo Completo)
              await apiService.post('/api/business/planning', {
                  ...formData,
                  company_id: parseInt(formData.company_id),
                  category_id: parseInt(formData.category_id),
                  subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
                  period_months: parseInt(formData.period_months),
                  base_value: parseFloat(formData.base_value)
              });
          }
          await loadDependencies();
          setIsFormModalOpen(false);
      } catch (error) {
          alert("Erro ao salvar.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async (e, id) => {
      e.stopPropagation();
      if(confirm("Tem certeza que deseja excluir este orçamento e todos os seus meses?")) {
          try {
              await apiService.delete(`/api/business/planning/${id}`);
              setPlannings(prev => prev.filter(p => p.id !== id));
          } catch(error) { alert("Erro ao excluir."); }
      }
  };

  // --- DETALHE: DRILL-DOWN ---
  const handleCardClick = (plan) => {
      setSelectedPlanning(plan);
      setIsDetailModalOpen(true);
      setEditingItem(null);
  };

  const handleUpdateItemValue = async () => {
      if (!editingItem) return;
      try {
          await apiService.put(`/api/business/planning/item/${editingItem.id}`, { value: editingItem.value });
          
          // Atualiza localmente para ser instantâneo
          const updatedItems = selectedPlanning.items.map(item => 
              item.id === editingItem.id ? { ...item, value: parseFloat(editingItem.value) } : item
          );
          // Recalcula total
          const newTotal = updatedItems.reduce((acc, curr) => acc + curr.value, 0);
          
          setSelectedPlanning({ ...selectedPlanning, items: updatedItems, total_value: newTotal });
          setEditingItem(null); // Fecha modo edição
          
          // Atualiza lista principal em background
          loadDependencies(); 
      } catch (error) {
          alert("Erro ao atualizar valor.");
      }
  };

  // Helper de Meses
  const generateMonthLabels = () => {
    if (!formData.start_date || formData.period_months <= 0) return [];
    const labels = [];
    const [year, month] = formData.start_date.split('-').map(Number);
    for (let i = 0; i < formData.period_months; i++) {
        const date = new Date(year, (month - 1) + i, 1);
        labels.push({ index: i, label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }) });
    }
    return labels;
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Planejamento Orçamentário</h1>
            <p className="text-slate-500 text-sm">Crie projeções financeiras para suas empresas.</p>
          </div>
          <Button onClick={handleOpenNew} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
            <Plus size={18} /> Novo Planejamento
          </Button>
        </div>

        {/* LISTAGEM DOS CARDS */}
        {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-600"/></div>
        ) : plannings.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-slate-50 dark:bg-slate-900/50"><CardContent className="py-12 flex flex-col items-center justify-center text-slate-400"><Target size={48} className="mb-4 opacity-20" /><p>Nenhum orçamento criado ainda.</p></CardContent></Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plannings.map(plan => (
                    <Card 
                        key={plan.id} 
                        className="hover:border-cyan-400 transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => handleCardClick(plan)}
                    >
                        {/* Faixa lateral decorativa */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-500"></div>

                        <CardContent className="p-5 pl-7">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-tight">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1">Início: {plan.start_date}</p>
                                </div>
                                {/* Botões de Ação (Só aparecem no Hover ou sempre no mobile) */}
                                <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100" onClick={(e) => handleEditHeader(e, plan)}>
                                        <Edit size={14} className="text-slate-500"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50" onClick={(e) => handleDelete(e, plan.id)}>
                                        <Trash2 size={14} className="text-red-500"/>
                                    </Button>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end mt-4">
                                <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-1 rounded-md">
                                    {plan.items.length} meses
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400 uppercase font-bold">Total Planejado</p>
                                    <span className="font-bold text-xl text-cyan-700 dark:text-cyan-400">
                                        R$ {plan.total_value?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>

      {/* --- MODAL DE DETALHES (MÊS A MÊS) --- */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center gap-2">
                    <Target className="text-cyan-600"/>
                    {selectedPlanning?.name}
                </DialogTitle>
                <DialogDescription className="flex gap-4 pt-1">
                    <span>Início: {selectedPlanning?.start_date}</span>
                    <span>•</span>
                    <span className="font-bold text-cyan-600">Total: R$ {selectedPlanning?.total_value?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedPlanning?.items?.map(item => (
                        <div key={item.id} className={`border rounded-xl p-3 flex flex-col items-center justify-center transition-all ${editingItem?.id === item.id ? 'ring-2 ring-cyan-500 bg-cyan-50' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-white border-slate-200'}`}>
                            {/* Visualização Normal */}
                            {editingItem?.id !== item.id ? (
                                <>
                                    <span className="text-xs font-bold text-slate-500 uppercase mb-1">
                                        {/* Formatação simples do mês (YYYY-MM) para leitura */}
                                        {item.month}
                                    </span>
                                    <span className="text-lg font-bold text-slate-700 dark:text-white">
                                        R$ {item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                    </span>
                                    <button 
                                        onClick={() => setEditingItem({ id: item.id, value: item.value })}
                                        className="mt-2 text-[10px] text-cyan-600 hover:underline flex items-center gap-1"
                                    >
                                        <Edit size={10} /> Alterar
                                    </button>
                                </>
                            ) : (
                                /* Modo Edição do Item */
                                <>
                                    <span className="text-xs font-bold text-cyan-700 mb-1">{item.month}</span>
                                    <Input 
                                        autoFocus
                                        type="number" 
                                        className="h-8 text-center text-sm mb-2 bg-white"
                                        value={editingItem.value}
                                        onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                        onKeyDown={(e) => { if(e.key === 'Enter') handleUpdateItemValue() }}
                                    />
                                    <div className="flex gap-1 w-full">
                                        <Button size="sm" variant="outline" className="h-6 w-full text-[10px]" onClick={() => setEditingItem(null)}><X size={10}/></Button>
                                        <Button size="sm" className="h-6 w-full text-[10px] bg-cyan-600 text-white" onClick={handleUpdateItemValue}><Check size={10}/></Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            <DialogFooter className="border-t pt-4">
                <Button onClick={() => setIsDetailModalOpen(false)}>Fechar Detalhes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL FORMULÁRIO (NOVO/EDITAR HEADER) --- */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nome do Planejamento</Label>
                    <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select value={formData.company_id} onValueChange={v => setFormData({...formData, company_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v, subcategory_id: ''})}>
                        <SelectTrigger><SelectValue placeholder="Principal..." /></SelectTrigger>
                        <SelectContent>{rootCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Subcategoria</Label>
                    <Select value={formData.subcategory_id} disabled={!formData.category_id || subCategories.length === 0} onValueChange={v => setFormData({...formData, subcategory_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Específica..." /></SelectTrigger>
                        <SelectContent>{subCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            {!editingId && (
                <>
                <div className="grid sm:grid-cols-2 gap-4 border-t pt-4">
                    <div className="space-y-2"><Label>Início</Label><Input type="month" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})}/></div>
                    <div className="space-y-2"><Label>Duração (Meses)</Label><Input type="number" min="1" max="60" value={formData.period_months} onChange={e => setFormData({...formData, period_months: parseInt(e.target.value)})}/></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1 mr-4"><Label>Valor Base</Label><Input type="number" placeholder="0,00" value={formData.base_value} onChange={e => setFormData({...formData, base_value: e.target.value})}/></div>
                        <div className="flex items-center space-x-2 pt-6"><Switch id="replicate" checked={formData.replicate} onCheckedChange={c => setFormData({...formData, replicate: c})}/><Label htmlFor="replicate">Replicar?</Label></div>
                    </div>
                    {!formData.replicate && formData.start_date && (
                        <div className="grid grid-cols-3 gap-3 max-h-40 overflow-y-auto">
                            {generateMonthLabels().map((month) => (
                                <div key={month.index} className="space-y-1"><label className="text-xs">{month.label}</label><Input type="number" className="h-8 text-sm" value={formData.manual_values[month.index] || ''} onChange={e => handleManualValueChange(month.index, e.target.value)}/></div>
                            ))}
                        </div>
                    )}
                </div>
                </>
            )}
            {editingId && <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Nota: Não é possível alterar o período ou valores em massa na edição. Use o detalhe do card para editar mês a mês.</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleSaveForm} disabled={isSaving} className="bg-cyan-600 text-white">{isSaving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPlanning;