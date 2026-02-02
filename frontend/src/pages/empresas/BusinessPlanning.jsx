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
import { Plus, Target, Calendar, Check, Loader2 } from 'lucide-react';
import apiService from '../../services/api'; // <--- Import do API Service

const BusinessPlanning = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Dados carregados da API
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [plannings, setPlannings] = useState([]);

  // Dados do Formulário
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    start_date: '', 
    period_months: 12, 
    category_id: '',
    subcategory_id: '',
    base_value: '',
    replicate: true, 
    manual_values: {} 
  });

  // --- 1. CARREGAR DEPENDÊNCIAS ---
  const loadDependencies = async () => {
    setIsLoading(true);
    try {
      // Faz as chamadas em paralelo para ser mais rápido
      const [companiesData, categoriesData, planningData] = await Promise.all([
        apiService.get('/api/business/companies'),
        apiService.get('/api/business/categories'),
        apiService.get('/api/business/planning')
      ]);

      setCompanies(companiesData);
      setCategories(categoriesData);
      setPlannings(planningData);

    } catch (error) {
      console.error("Erro ao carregar dependências:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  // Filtros Inteligentes para os Dropdowns
  const rootCategories = categories.filter(c => c.parent_id === null); // Apenas Categorias Pai
  const subCategories = categories.filter(c => c.parent_id === parseInt(formData.category_id)); // Apenas filhos da selecionada

  // Helper para gerar os labels dos meses
  const generateMonthLabels = () => {
    if (!formData.start_date || formData.period_months <= 0) return [];
    
    const labels = [];
    const [year, month] = formData.start_date.split('-').map(Number);
    
    for (let i = 0; i < formData.period_months; i++) {
        const date = new Date(year, (month - 1) + i, 1);
        // Ajuste de fuso horário simples para visualização correta
        const label = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' });
        labels.push({ index: i, label: label });
    }
    return labels;
  };

  const handleManualValueChange = (index, value) => {
    setFormData(prev => ({
        ...prev,
        manual_values: { ...prev.manual_values, [index]: value }
    }));
  };

  // --- 2. SALVAR PLANEJAMENTO ---
  const handleSave = async () => {
    // Validações
    if (!formData.name || !formData.company_id || !formData.category_id || !formData.start_date || !formData.base_value) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    setIsSaving(true);
    try {
        const payload = {
            ...formData,
            // Garante que números vão como números
            company_id: parseInt(formData.company_id),
            category_id: parseInt(formData.category_id),
            subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id) : null,
            period_months: parseInt(formData.period_months),
            base_value: parseFloat(formData.base_value),
            // manual_values já é um objeto, o backend Python vai ler como Dict
        };

        await apiService.post('/api/business/planning', payload);
        
        await loadDependencies(); // Recarrega a lista
        setIsModalOpen(false);
        // Reset do form
        setFormData({
            name: '', company_id: '', start_date: '', period_months: 12, 
            category_id: '', subcategory_id: '', base_value: '', replicate: true, manual_values: {} 
        });

    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao salvar planejamento.");
    } finally {
        setIsSaving(false);
    }
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
          <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
            <Plus size={18} /> Novo Planejamento
          </Button>
        </div>

        {/* LISTA DE PLANEJAMENTOS */}
        {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-cyan-600"/></div>
        ) : plannings.length === 0 ? (
            <Card className="border-dashed border-slate-300 bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="py-12 flex flex-col items-center justify-center text-slate-400">
                    <Target size={48} className="mb-4 opacity-20" />
                    <p>Nenhum orçamento criado ainda.</p>
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {plannings.map(plan => (
                    <Card key={plan.id} className="hover:border-cyan-300 transition-all">
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg">{plan.name}</h3>
                            <p className="text-sm text-slate-500 mb-2">Início: {plan.start_date}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">
                                    {plan.items.length} meses
                                </span>
                                <span className="font-bold text-slate-700">
                                    Total: R$ {plan.total_value?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </div>

      {/* --- MODAL DE NOVO PLANEJAMENTO --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
            <DialogDescription>Defina as premissas do seu planejamento.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* 1. DADOS GERAIS */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Nome do Planejamento</Label>
                    <Input 
                        placeholder="Ex: Orçamento 2026 - Opex" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Empresa</Label>
                    <Select onValueChange={v => setFormData({...formData, company_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>
                            {companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.razao_social}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 2. CATEGORIZAÇÃO (DINÂMICA) */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select onValueChange={v => setFormData({...formData, category_id: v, subcategory_id: ''})}>
                        <SelectTrigger><SelectValue placeholder="Principal..." /></SelectTrigger>
                        <SelectContent>
                            {rootCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Subcategoria</Label>
                    <Select 
                        disabled={!formData.category_id || subCategories.length === 0}
                        onValueChange={v => setFormData({...formData, subcategory_id: v})}
                    >
                        <SelectTrigger><SelectValue placeholder="Específica..." /></SelectTrigger>
                        <SelectContent>
                            {subCategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 3. PERÍODO */}
            <div className="grid sm:grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-2">
                    <Label>Início do Planejamento</Label>
                    <Input 
                        type="month" 
                        value={formData.start_date}
                        onChange={e => setFormData({...formData, start_date: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Duração (Meses)</Label>
                    <Input 
                        type="number" 
                        min="1" max="60"
                        value={formData.period_months}
                        onChange={e => setFormData({...formData, period_months: parseInt(e.target.value)})}
                    />
                </div>
            </div>

            {/* 4. VALORES E LÓGICA DE REPLICAÇÃO */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1 mr-4">
                        <Label>Valor Base Mensal (R$)</Label>
                        <Input 
                            type="number"
                            placeholder="0,00"
                            value={formData.base_value}
                            onChange={e => setFormData({...formData, base_value: e.target.value})}
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                        <Switch 
                            id="replicate" 
                            checked={formData.replicate}
                            onCheckedChange={c => setFormData({...formData, replicate: c})}
                        />
                        <Label htmlFor="replicate">Replicar valor?</Label>
                    </div>
                </div>

                {/* VISUALIZAÇÃO DOS VALORES */}
                {!formData.replicate && formData.start_date && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                            <Calendar size={14} /> Detalhamento Mensal
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
                            {generateMonthLabels().map((month) => (
                                <div key={month.index} className="space-y-1">
                                    <label className="text-xs text-slate-500">{month.label}</label>
                                    <Input 
                                        type="number"
                                        className="h-8 text-sm"
                                        placeholder={formData.base_value || "0"}
                                        value={formData.manual_values[month.index] || ''}
                                        onChange={e => handleManualValueChange(month.index, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {formData.replicate && formData.base_value && (
                    <div className="text-sm text-cyan-600 flex items-center gap-2 bg-cyan-50 p-2 rounded-lg border border-cyan-100">
                        <Check size={16} /> 
                        O valor de R$ {formData.base_value} será repetido por {formData.period_months} meses.
                    </div>
                )}
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 text-white">
                {isSaving ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPlanning;