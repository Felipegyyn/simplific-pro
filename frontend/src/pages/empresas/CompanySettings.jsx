import React, { useState, useEffect } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Building2, MapPin, Phone, Briefcase, User, Edit, Trash2, Loader2 } from 'lucide-react';
import apiService from '../../services/api'; // <--- API Ativada

const CompanySettings = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    razao_social: '',
    cnpj: '',
    cnae: '',
    data_abertura: '',
    situacao: 'ativa',
    representante: '',
    telefone: '',
    endereco: '',
    numero: '',
    complemento: '',
    cep: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [companies, setCompanies] = useState([]);

  // --- FUNÇÕES DE CARREGAMENTO ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Chama a rota GET /api/business/companies (que definimos no routes unificado)
      const data = await apiService.get('/api/business/companies');
      setCompanies(data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- HANDLERS ---
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (company) => {
    setEditingId(company.id);
    setFormData({
      razao_social: company.razao_social,
      cnpj: company.cnpj,
      cnae: company.cnae || '',
      data_abertura: company.data_abertura || '',
      situacao: company.situacao || 'ativa',
      representante: company.representante || '',
      telefone: company.telefone || '',
      endereco: company.endereco || '',
      numero: company.numero || '',
      complemento: company.complemento || '',
      cep: company.cep || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.razao_social || !formData.cnpj || !formData.telefone || !formData.endereco) {
      alert("Por favor, preencha os campos obrigatórios: Razão Social, CNPJ, Telefone e Endereço.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        // PUT
        await apiService.put(`/api/business/companies/${editingId}`, formData);
      } else {
        // POST
        await apiService.post('/api/business/companies', formData);
      }
      
      await loadData();
      setIsModalOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar empresa.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja remover esta empresa do grupo?")) {
      try {
        await apiService.delete(`/api/business/companies/${id}`);
        setCompanies(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao remover empresa.");
      }
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dados da Empresa</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie as empresas do seu grupo econômico.</p>
          </div>
          <Button 
            onClick={handleOpenNew}
            className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-sm"
          >
            <Plus size={18} /> Adicionar Empresa
          </Button>
        </div>

        {/* Loading State */}
        {isLoading ? (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-cyan-600" size={32} />
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
                <Card key={company.id} className="border-slate-200 dark:border-slate-800 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all group">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                    <div className="bg-cyan-100 dark:bg-cyan-900/30 p-2.5 rounded-xl text-cyan-700 dark:text-cyan-400 mb-3">
                        <Building2 size={24} />
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium border ${
                        company.situacao === 'ativa' 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                        {company.situacao === 'ativa' ? 'Ativa' : 'Inativa/Baixada'}
                    </div>
                    </div>
                    <CardTitle className="text-lg leading-tight truncate">{company.razao_social}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">{company.cnpj}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    
                    {company.cnae && (
                    <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">CNAE: {company.cnae}</span>
                    </div>
                    )}
                    
                    {company.representante && (
                    <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">Rep: {company.representante}</span>
                    </div>
                    )}

                    <div className="flex items-center gap-2">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <span>{company.telefone}</span>
                    </div>

                    <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{company.endereco}, {company.numero}</span>
                    </div>

                    <div className="pt-4 flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(company)}>
                        <Edit size={14} className="mr-2" /> Editar
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(company.id)}>
                        <Trash2 size={14} />
                    </Button>
                    </div>

                </CardContent>
                </Card>
            ))}

            {/* Empty State */}
            {companies.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300">
                <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                <p>Nenhuma empresa cadastrada ainda.</p>
                </div>
            )}
            </div>
        )}

      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Empresa' : 'Adicionar Empresa'}</DialogTitle>
            <DialogDescription>
              Preencha os dados conforme o cartão CNPJ da empresa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* Bloco 1: Identificação */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-cyan-600 flex items-center gap-2">
                    <Building2 size={16} /> Identificação
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Razão Social *</Label>
                        <Input 
                            value={formData.razao_social} 
                            onChange={(e) => handleInputChange('razao_social', e.target.value)}
                            placeholder="Nome Oficial da Empresa" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">CNPJ *</Label>
                        <Input 
                            value={formData.cnpj} 
                            onChange={(e) => handleInputChange('cnpj', e.target.value)}
                            placeholder="00.000.000/0001-00" 
                        />
                    </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">CNAE Principal</Label>
                        <Input 
                            value={formData.cnae} 
                            onChange={(e) => handleInputChange('cnae', e.target.value)}
                            placeholder="0000-0/00" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Data Abertura</Label>
                        <Input 
                            type="date"
                            value={formData.data_abertura} 
                            onChange={(e) => handleInputChange('data_abertura', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Situação Cadastral</Label>
                        <Select 
                            value={formData.situacao} 
                            onValueChange={(val) => handleInputChange('situacao', val)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ativa">Ativa</SelectItem>
                                <SelectItem value="inapta">Inapta</SelectItem>
                                <SelectItem value="baixada">Baixada</SelectItem>
                                <SelectItem value="suspensa">Suspensa</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Bloco 2: Contato e Responsável */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-cyan-600 flex items-center gap-2">
                    <User size={16} /> Responsável e Contato
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Nome do Representante</Label>
                        <Input 
                            value={formData.representante} 
                            onChange={(e) => handleInputChange('representante', e.target.value)}
                            placeholder="Sócio Administrador" 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Telefone de Contato *</Label>
                        <Input 
                            value={formData.telefone} 
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            placeholder="(00) 00000-0000" 
                        />
                    </div>
                </div>
            </div>

            {/* Bloco 3: Endereço */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-cyan-600 flex items-center gap-2">
                    <MapPin size={16} /> Localização
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">CEP</Label>
                        <Input 
                            value={formData.cep} 
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                        />
                    </div>
                    <div className="col-span-3 space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Endereço (Rua, Av...) *</Label>
                        <Input 
                            value={formData.endereco} 
                            onChange={(e) => handleInputChange('endereco', e.target.value)}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Número</Label>
                        <Input 
                            value={formData.numero} 
                            onChange={(e) => handleInputChange('numero', e.target.value)}
                        />
                    </div>
                    <div className="col-span-3 space-y-2">
                        <Label className="text-xs font-bold text-slate-500 uppercase">Complemento</Label>
                        <Input 
                            value={formData.complemento} 
                            onChange={(e) => handleInputChange('complemento', e.target.value)}
                            placeholder="Sala, Bloco, Galpão..." 
                        />
                    </div>
                </div>
            </div>

          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              {isSaving ? 'Salvando...' : 'Salvar Empresa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanySettings;