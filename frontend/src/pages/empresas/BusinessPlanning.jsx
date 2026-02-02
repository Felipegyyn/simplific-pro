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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Target, Calendar, Calculator, Check } from 'lucide-react';

const BusinessPlanning = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dados do Formulário
  const [formData, setFormData] = useState({
    name: '',
    company_id: '',
    start_date: '', // Mês de início (YYYY-MM)
    period_months: 12, // Padrão 12 meses
    category_id: '',
    subcategory_id: '',
    base_value: '',
    replicate: true, // Lógica de Replicação
    manual_values: {} // Objeto para guardar valores manuais { "0": 100, "1": 150 }
  });

  // Mock de Dados (Vindo das outras telas)
  const companies = [{ id: 1, name: 'Simplific Tech' }, { id: 2, name: 'Holding Viana' }];
  const categories = [
    { id: 1, name: 'Despesas Administrativas' },
    { id: 2, name: 'Custos Operacionais' }
  ];
  const subcategories = [
    { id: 10, parent: 1, name: 'Aluguel' },
    { id: 11, parent: 1, name: 'Energia' },
    { id: 20, parent: 2, name: 'Matéria Prima' }
  ];

  // Helper para gerar os labels dos meses (ex: "Mês 1 - Jan/2026")
  const generateMonthLabels = () => {
    if (!formData.start_date || formData.period_months <= 0) return [];
    
    const labels = [];
    const [year, month] = formData.start_date.split('-').map(Number);
    
    for (let i = 0; i < formData.period_months; i++) {
        const date = new Date(year, (month - 1) + i, 1);
        const label = date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
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

  const handleSave = () => {
    console.log("Dados salvos:", formData);
    setIsModalOpen(false);
    // Aqui vai a lógica de enviar para a API depois
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

        {/* Placeholder de Lista Vazia */}
        <Card className="border-dashed border-slate-300 bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Target size={48} className="mb-4 opacity-20" />
                <p>Nenhum orçamento criado ainda.</p>
            </CardContent>
        </Card>
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
                            {companies.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 2. CATEGORIZAÇÃO */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select onValueChange={v => setFormData({...formData, category_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Principal..." /></SelectTrigger>
                        <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Subcategoria</Label>
                    <Select onValueChange={v => setFormData({...formData, subcategory_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Específica..." /></SelectTrigger>
                        <SelectContent>
                            {subcategories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
            <Button onClick={handleSave} className="bg-cyan-600 text-white">Salvar Orçamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessPlanning;