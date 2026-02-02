import React, { useState } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness'; // <--- Import novo
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Building2, User, MapPin, Phone, Mail, Trash2, Edit } from 'lucide-react';

const Stakeholders = ({ user, onLogout }) => {
  // --- ESTADOS ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado do Formulário
  const initialFormState = {
    type: 'pj', // pj ou pf
    name: '',
    tax_id: '', // CPF ou CNPJ
    phone: '',
    email: '',
    zip: '',
    address: '',
    number: '',
    complement: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  // Dados Mockados (Simulando Banco de Dados)
  const [stakeholders, setStakeholders] = useState([
    { id: 1, type: 'pj', name: 'Tech Solutions LTDA', tax_id: '12.345.678/0001-90', phone: '(11) 98888-7777', email: 'contato@tech.com', city: 'São Paulo' },
    { id: 2, type: 'pf', name: 'Carlos Consultor', tax_id: '123.456.789-00', phone: '(62) 99999-8888', email: 'carlos@gmail.com', city: 'Goiânia' },
  ]);

  // --- MÁSCARAS E HANDLERS ---
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatTaxId = (value) => {
    // Apenas visual simples, ideal usar lib de mask no futuro
    return value.replace(/\D/g, ''); 
  };

  const handleSave = () => {
    if (!formData.name || !formData.tax_id) {
      alert("Por favor, preencha pelo menos Nome e Documento.");
      return;
    }

    const newStakeholder = {
      id: Date.now(),
      ...formData,
      city: 'Local' // Simplificação para o exemplo
    };

    setStakeholders([...stakeholders, newStakeholder]);
    setFormData(initialFormState);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Tem certeza que deseja remover este cadastro?")) {
      setStakeholders(stakeholders.filter(s => s.id !== id));
    }
  };

  // Filtro de Busca
  const filteredList = stakeholders.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tax_id.includes(searchTerm)
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* CABEÇALHO DA PÁGINA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Fornecedores e Clientes</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Gerencie seus parceiros de negócios.</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2"
          >
            <Plus size={18} /> Novo Cadastro
          </Button>
        </div>

        {/* FILTRO E BUSCA */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Buscar por nome ou documento..." 
                className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* TABELA DE DADOS */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead>Nome / Razão Social</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.length > 0 ? (
                filteredList.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.type === 'pj' ? 'bg-cyan-100 text-cyan-700' : 'bg-green-100 text-green-700'}`}>
                          {item.type === 'pj' ? <Building2 size={16} /> : <User size={16} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500 uppercase">{item.type === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-300 font-mono text-sm">
                      {item.tax_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1"><Phone size={12} /> {item.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={12} /> {item.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-cyan-600">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                    Nenhum cadastro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* --- MODAL DE CADASTRO --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Novo Cadastro</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            
            {/* TIPO DE PESSOA */}
            <div className="grid grid-cols-2 gap-4">
               <div 
                 onClick={() => handleInputChange('type', 'pj')}
                 className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.type === 'pj' ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 ring-1 ring-cyan-500' : 'hover:bg-slate-50'}`}
               >
                 <Building2 className={formData.type === 'pj' ? 'text-cyan-600' : 'text-slate-400'} />
                 <span className="font-medium">Pessoa Jurídica</span>
               </div>
               <div 
                 onClick={() => handleInputChange('type', 'pf')}
                 className={`cursor-pointer border rounded-xl p-4 flex items-center gap-3 transition-all ${formData.type === 'pf' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500' : 'hover:bg-slate-50'}`}
               >
                 <User className={formData.type === 'pf' ? 'text-green-600' : 'text-slate-400'} />
                 <span className="font-medium">Pessoa Física</span>
               </div>
            </div>

            {/* DADOS PRINCIPAIS */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{formData.type === 'pj' ? 'Razão Social' : 'Nome Completo'}</Label>
                <Input 
                  value={formData.name} 
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={formData.type === 'pj' ? 'Ex: Minha Empresa LTDA' : 'Ex: João da Silva'} 
                />
              </div>
              <div className="space-y-2">
                <Label>{formData.type === 'pj' ? 'CNPJ' : 'CPF'}</Label>
                <Input 
                  value={formData.tax_id} 
                  onChange={(e) => handleInputChange('tax_id', e.target.value)}
                  placeholder={formData.type === 'pj' ? '00.000.000/0001-00' : '000.000.000-00'} 
                />
              </div>
            </div>

            {/* CONTATO */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000" 
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input 
                  value={formData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@exemplo.com" 
                />
              </div>
            </div>

            {/* ENDEREÇO */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                <MapPin size={16} /> Endereço
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label>CEP</Label>
                  <Input 
                    value={formData.zip} 
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Endereço</Label>
                  <Input 
                    value={formData.address} 
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Rua, Avenida..." 
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1 space-y-2">
                  <Label>Número</Label>
                  <Input 
                    value={formData.number} 
                    onChange={(e) => handleInputChange('number', e.target.value)}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Complemento</Label>
                  <Input 
                    value={formData.complement} 
                    onChange={(e) => handleInputChange('complement', e.target.value)}
                    placeholder="Apto, Sala, Bloco..." 
                  />
                </div>
              </div>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar Cadastro</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stakeholders;