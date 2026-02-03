import React, { useState, useEffect } from 'react';
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
import { Plus, Search, Tags, Edit, Trash2, FolderTree, Loader2, CornerDownRight } from 'lucide-react';
import apiService from '../../services/api';

const BusinessCategories = ({ user, onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', type: 'saida', parent_id: 'root' });
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get('/api/business/categories');
      setCategories(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const rootCategories = categories.filter(c => c.parent_id === null);

  // --- LÓGICA DE ORGANIZAÇÃO VISUAL (PAI > FILHO) ---
  const getOrganizedList = () => {
    // 1. Separa Pais e Filhos
    const parents = categories.filter(c => !c.parent_id).sort((a, b) => a.name.localeCompare(b.name));
    const children = categories.filter(c => c.parent_id).sort((a, b) => a.name.localeCompare(b.name));

    let organized = [];

    // 2. Itera sobre os pais e insere os filhos logo abaixo
    parents.forEach(parent => {
        organized.push(parent); // Adiciona o Pai
        
        // Encontra os filhos deste pai específico
        const myChildren = children.filter(c => c.parent_id === parent.id);
        
        // Adiciona os filhos na sequência
        organized.push(...myChildren);
    });

    // (Opcional) Adiciona órfãos ou categorias sem pai encontrado no final, se houver erro de integridade
    const parentsIds = parents.map(p => p.id);
    const orphans = children.filter(c => !parentsIds.includes(c.parent_id));
    if (orphans.length > 0) organized.push(...orphans);

    return organized;
  };

  // Se tiver busca, filtra a lista bruta. Se não, usa a lista organizada hierarquicamente.
  const displayList = searchTerm 
    ? categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : getOrganizedList();


  // --- HANDLERS ---
  const handleOpenNew = () => {
      setEditingId(null);
      setFormData({ name: '', type: 'saida', parent_id: 'root' });
      setIsModalOpen(true);
  }

  const handleEdit = (cat) => {
      setEditingId(cat.id);
      setFormData({
          name: cat.name,
          type: cat.type,
          parent_id: cat.parent_id ? cat.parent_id.toString() : 'root'
      });
      setIsModalOpen(true);
  }

  const handleSave = async () => {
    if (!formData.name) return alert('Nome é obrigatório');
    
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        parent_id: formData.parent_id === 'root' ? null : parseInt(formData.parent_id)
      };
      
      if (editingId) {
          await apiService.put(`/api/business/categories/${editingId}`, payload);
      } else {
          await apiService.post('/api/business/categories', payload);
      }
      
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Tem certeza que deseja excluir esta categoria?")) {
        try {
            await apiService.delete(`/api/business/categories/${id}`);
            // Atualiza localmente removendo o item
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            alert("Erro ao excluir. Verifique se não há orçamentos vinculados.");
        }
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Plano de Contas</h1>
            <p className="text-slate-500 text-sm">Categorias e Subcategorias.</p>
          </div>
          <Button onClick={handleOpenNew} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
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

        <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Hierarquia</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Carregando...</TableCell></TableRow>
              ) : displayList.map((cat) => (
                <TableRow key={cat.id} className={cat.parent_id ? "bg-slate-50/50 dark:bg-slate-900/30" : ""}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                        {/* Identação visual para subcategorias */}
                        {cat.parent_id ? (
                            <>
                                <div className="w-6"></div> {/* Espaço vazio para indentar */}
                                <CornerDownRight size={16} className="text-slate-400" />
                            </>
                        ) : (
                            <Tags size={16} className="text-cyan-600" />
                        )}
                        <span className={cat.parent_id ? "text-slate-600 dark:text-slate-300" : "font-bold text-slate-800 dark:text-slate-100"}>
                            {cat.name}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full ${cat.type === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {cat.type === 'entrada' ? 'Receita' : 'Despesa'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {cat.parent_name ? `Sub de: ${cat.parent_name}` : 'Principal'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                            <Edit size={16} className="text-slate-500 hover:text-cyan-600"/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
                            <Trash2 size={16} className="text-slate-500 hover:text-red-600"/>
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MODAL MANTIDO IGUAL AO ANTERIOR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          </DialogHeader>
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
                    <Label>Categoria Pai</Label>
                    <Select value={formData.parent_id} onValueChange={v => setFormData({...formData, parent_id: v})}>
                        <SelectTrigger><SelectValue placeholder="Nenhuma (Raiz)" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="root">Nenhuma (É Principal)</SelectItem>
                            {/* Filtra para não deixar selecionar a própria categoria como pai na edição */}
                            {rootCategories.filter(c => c.type === formData.type && c.id !== editingId).map(c => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={isSaving} className="bg-cyan-600 text-white">
                {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessCategories;