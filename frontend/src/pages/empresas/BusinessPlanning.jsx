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
import { 
    Plus, Target, Calendar, Check, Loader2, Edit, Trash2, 
    ChevronDown, ChevronRight, X 
} from 'lucide-react';
import apiService from '../../services/api';

const BusinessPlanning = ({ user, onLogout }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [plannings, setPlannings] = useState([]);
  const [selectedPlanning, setSelectedPlanning] = useState(null);
  
  // Controle de Expansão no Detalhe (Accordion)
  const [expandedLines, setExpandedLines] = useState({});

  // Edição de Item
  const [editingItem, setEditingItem] = useState(null);

  // Formulário
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
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDependencies(); }, []);

  const rootCategories = categories.filter(c => c.parent_id === null);
  const subCategories = categories.filter(c => c.parent_id === parseInt(formData.category_id));

  // --- HANDLERS ---
  const handleOpenNew = () => {
      setFormData({ name: '', company_id: '', start_date: '', period_months: 12, category_id: '', subcategory_id: '', base_value: '', replicate: true, manual_values: {} });
      setIsFormModalOpen(true);
  };

  const handleSaveForm = async () => {
      if (!formData.name) return alert("Nome é obrigatório.");
      setIsSaving(true);
      try {
          await apiService.post('/api/business/planning', {
              ...formData,
              company_id: parseInt(formData.company_id),
              category_id: parseInt(formData.category_id),
              subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
              period_months: parseInt(formData.period_months),
              base_value: parseFloat(formData.base_value)
          });
          await loadDependencies();
          setIsFormModalOpen(false);
      } catch (error) {
          alert("Erro ao salvar.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDeleteBudget = async (e, id) => {
      e.stopPropagation();
      if(confirm("Excluir este orçamento APAGARÁ TODAS as categorias dentro dele. Confirmar?")) {
          await apiService.delete(`/api/business/planning/${id}`);
          loadDependencies();
      }
  };

  const handleDeleteLine = async (lineId) => {
      if(confirm("Remover esta categoria do orçamento?")) {
          await apiService.delete(`/api/business/planning/line/${lineId}`);
          // Atualiza localmente o modal de detalhes
          const updatedLines = selectedPlanning.lines.filter(l => l.id !== lineId);
          setSelectedPlanning({ ...selectedPlanning, lines: updatedLines });
          loadDependencies(); // Atualiza fundo
      }
  };

  const toggleLine = (lineId) => {
      setExpandedLines(prev => ({ ...prev, [lineId]: !prev[lineId] }));
  };

  const handleCardClick = (plan) => {
      setSelectedPlanning(plan);
      setExpandedLines({}); // Reseta expansão
      setIsDetailModalOpen(true);
  };

  // Helper Meses (Gerar labels visualmente)
  const generateMonthLabels = () => {
    if (!formData.start_date) return [];
    const labels = [];
    const [year, month] = formData.start_date.split('-').map(Number);
    for (let i = 0; i < formData.period_months; i++) {
        const date = new Date(year, (month - 1) + i, 1);
        labels.push({ index: i, label: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }) });
    }
    return labels;
  };

  // Helper para atualizar valor no manual
  const handleManualValueChange = (index, value) => {
    setFormData(prev => ({ ...prev, manual_values: { ...prev.manual_values, [index]: value } }));
  };

  const handleUpdateItemValue = async () => {
      if (!editingItem) return;
      try {
          await apiService.put(`/api/business/planning/item/${editingItem.id}`, { value: editingItem.value });
          // Atualização local complexa (dentro de lines -> items)
          const updatedLines = selectedPlanning.lines.map(line => ({
              ...line,
              items: line.items.map(item => item.id === editingItem.id ? { ...item, value: parseFloat(editingItem.value) } : item)
          }));
          
          // Recalcula totais (opcional, mas bom pra UX)
          const newTotal = updatedLines.reduce((acc, line) => acc + line.items.reduce((a, b) => a + b.value, 0), 0);
          
          setSelectedPlanning({ ...selectedPlanning, lines: updatedLines, total_value: newTotal });
          setEditingItem(null);
          loadDependencies();
      } catch(e) { alert("Erro ao salvar valor."); }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Planejamento Orçamentário</h1>
            <p className="text-slate-500 text-sm">Gerencie os orçamentos anuais ou por projeto.</p>
          </div>
          <Button onClick={handleOpenNew} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
            <Plus size={18} /> Adicionar Linha / Orçamento
          </Button>
        </div>

        {/* LISTAGEM AGRUPADA */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plannings.map(plan => (
                <Card 
                    key={plan.id} 
                    className="hover:border-cyan-400 transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => handleCardClick(plan)}
                >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-cyan-600"></div>
                    <CardContent className="p-5 pl-7">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{plan.name}</h3>
                                <p className="text-xs text-slate-500">Início: {plan.start_date}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => handleDeleteBudget(e, plan.id)}>
                                <Trash2 size={14} className="text-red-500"/>
                            </Button>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-1">
                            {/* Tags das categorias contidas neste orçamento */}
                            {plan.lines.slice(0, 3).map(line => (
                                <span key={line.id} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600">
                                    {line.category_name}
                                </span>
                            ))}
                            {plan.lines.length > 3 && <span className="text-[10px] text-slate-400 px-1">+{plan.lines.length - 3}</span>}
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-end">
                            <span className="text-xs text-slate-400">Total Previsto</span>
                            <span className="font-bold text-xl text-cyan-700">
                                R$ {plan.total_value?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

      {/* --- MODAL DE DETALHES (HIERÁRQUICO) --- */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="border-b pb-4 shrink-0">
                <DialogTitle>{selectedPlanning?.name}</DialogTitle>
                <DialogDescription>Detalhamento por categoria e mês.</DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-2">
                {selectedPlanning?.lines.map(line => (
                    <div key={line.id} className="border rounded-lg bg-white dark:bg-slate-950 overflow-hidden">
                        {/* Cabeçalho da Linha (Categoria) */}
                        <div 
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 cursor-pointer hover:bg-slate-100"
                            onClick={() => toggleLine(line.id)}
                        >
                            <div className="flex items-center gap-2">
                                {expandedLines[line.id] ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                                <span className="font-medium text-sm">
                                    {line.category_name} {line.subcategory_name && <span className="text-slate-400 font-normal">/ {line.subcategory_name}</span>}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-sm">R$ {line.total_value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={(e) => { e.stopPropagation(); handleDeleteLine(line.id); }}>
                                    <Trash2 size={12}/>
                                </Button>
                            </div>
                        </div>

                        {/* Corpo (Meses) - Só aparece se expandido */}
                        {expandedLines[line.id] && (
                            <div className="p-3 bg-white dark:bg-slate-950 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                {line.items.map(item => (
                                    <div key={item.id} className="border rounded p-2 flex flex-col items-center justify-center text-center">
                                        <span className="text-[10px] text-slate-400 uppercase font-bold mb-1">{item.month.split('-')[1]}/{item.month.split('-')[0].slice(2)}</span>
                                        
                                        {editingItem?.id === item.id ? (
                                            <Input 
                                                autoFocus
                                                type="number" 
                                                className="h-6 text-xs text-center p-0"
                                                value={editingItem.value}
                                                onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                                onKeyDown={(e) => { if(e.key === 'Enter') handleUpdateItemValue() }}
                                                onBlur={handleUpdateItemValue}
                                            />
                                        ) : (
                                            <span 
                                                className="text-xs font-bold cursor-pointer hover:text-cyan-600 hover:underline"
                                                onClick={() => setEditingItem({ id: item.id, value: item.value })}
                                            >
                                                {item.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                
                {selectedPlanning?.lines.length === 0 && (
                    <div className="text-center py-8 text-slate-400">Nenhuma categoria neste orçamento.</div>
                )}
            </div>
            
            <DialogFooter className="border-t pt-4 shrink-0">
                <Button onClick={() => setIsDetailModalOpen(false)}>Fechar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL FORMULÁRIO (MANTIDO SIMILAR) --- */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Linha ao Orçamento</DialogTitle>
            <DialogDescription>
                Se o nome do orçamento já existir, esta categoria será adicionada a ele.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nome do Orçamento</Label><Input placeholder="Ex: Orçamento 2026" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
                <div className="space-y-2"><Label>Empresa</Label><Select value={formData.company_id} onValueChange={v => setFormData({...formData, company_id: v})}><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger><SelectContent>{companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}</SelectContent></Select></div>
            </div>
            {/* ... Resto do formulário de categoria/valores igual ao anterior ... */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Categoria</Label><Select value={formData.category_id} onValueChange={v => setFormData({...formData, category_id: v, subcategory_id: ''})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{rootCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Subcategoria</Label><Select value={formData.subcategory_id} disabled={!formData.category_id} onValueChange={v => setFormData({...formData, subcategory_id: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{subCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            
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
          </div>
          <DialogFooter><Button onClick={handleSaveForm} disabled={isSaving} className="bg-cyan-600 text-white">Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPlanning;