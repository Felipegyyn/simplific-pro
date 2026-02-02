import React, { useState } from 'react';
import PageHeaderBusiness from '@/components/PageHeaderBusiness';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Tags, Edit, Trash2, FolderTree } from 'lucide-react';

const BusinessCategories = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock de Categorias
  const [categories, setCategories] = useState([
    { id: 1, name: 'Receita Operacional', type: 'entrada', parent: null },
    { id: 2, name: 'Venda de Serviços', type: 'entrada', parent: 1 },
    { id: 3, name: 'Despesas Administrativas', type: 'saida', parent: null },
    { id: 4, name: 'Aluguel', type: 'saida', parent: 3 },
    { id: 5, name: 'Energia Elétrica', type: 'saida', parent: 3 },
  ]);

  const [formData, setFormData] = useState({ name: '', type: 'saida', parent_id: 'root' });

  // Pais disponíveis (Categorias Raiz)
  const rootCategories = categories.filter(c => c.parent === null);

  const handleSave = () => {
    if (!formData.name) return alert('Nome é obrigatório');
    
    const newCat = {
      id: Date.now(),
      name: formData.name,
      type: formData.type,
      parent: formData.parent_id === 'root' ? null : parseInt(formData.parent_id)
    };
    
    setCategories([...categories, newCat]);
    setIsModalOpen(false);
    setFormData({ name: '', type: 'saida', parent_id: 'root' });
  };

  const filteredList = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Plano de Contas</h1>
            <p className="text-slate-500 text-sm">Categorias e Subcategorias.</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
            <Plus size={18} /> Nova Categoria
          </Button>
        </div>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar categoria..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Hierarquia</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredList.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        {cat.parent ? <FolderTree size={16} className="text-slate-400 ml-4" /> : <Tags size={16} className="text-cyan-600" />}
                        {cat.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${cat.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cat.type === 'entrada' ? 'Receita' : 'Despesa'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {cat.parent ? 'Subcategoria' : 'Categoria Principal'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Categoria</DialogTitle><DialogDescription>Adicione ao plano de contas.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="entrada">Receita</SelectItem>
                            <SelectItem value="saida">Despesa</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Categoria Pai (Opcional)</Label>
                    <Select value={formData.parent_id} onValueChange={v => setFormData({...formData, parent_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Nenhuma (Raiz)" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="root">Nenhuma (É Principal)</SelectItem>
                            {rootCategories.filter(c => c.type === formData.type).map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="bg-cyan-600 text-white">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessCategories;