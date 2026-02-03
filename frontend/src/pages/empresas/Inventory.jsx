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
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { 
    Plus, Search, Edit, Trash2, Package, ArrowUpCircle, 
    ArrowDownCircle, AlertTriangle, Barcode, DollarSign, Loader2, History
} from 'lucide-react';
import apiService from '../../services/api';

const Inventory = ({ user, onLogout }) => {
  // --- ESTADOS ---
  const [isLoading, setIsLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Edição/Criação
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({
      name: '', sku: '', category_id: '', 
      unit: 'UN', // UN, KG, L, M
      min_stock: 5, // Ponto de alerta
      cost_price: '', sale_price: '', 
      description: ''
  });

  // Estado de Movimentação (Entrada/Saída Rápida)
  const [movementForm, setMovementForm] = useState({
      product_id: '',
      type: 'entrada', // entrada, saida
      quantity: 1,
      reason: 'compra' // compra, venda, ajuste, perda
  });
  const [selectedProductForMovement, setSelectedProductForMovement] = useState(null);

  // --- CARREGAMENTO ---
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carrega categorias e produtos (vamos criar essas rotas no backend)
      const [catData, prodData] = await Promise.all([
        apiService.get('/api/business/categories'),
        apiService.get('/api/business/inventory') 
      ]);
      setCategories(catData || []);
      setProducts(prodData || []);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- LÓGICA DE PRODUTO (CRUD) ---
  const handleOpenProductModal = (prod = null) => {
      if (prod) {
          setEditingId(prod.id);
          setProductForm({
              name: prod.name, sku: prod.sku, category_id: prod.category_id?.toString(),
              unit: prod.unit, min_stock: prod.min_stock,
              cost_price: prod.cost_price, sale_price: prod.sale_price,
              description: prod.description || ''
          });
      } else {
          setEditingId(null);
          setProductForm({ name: '', sku: '', category_id: '', unit: 'UN', min_stock: 5, cost_price: '', sale_price: '', description: '' });
      }
      setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
      if (!productForm.name || !productForm.sku) return alert("Nome e SKU são obrigatórios.");
      
      setIsSaving(true);
      try {
          const payload = {
              ...productForm,
              category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
              min_stock: parseInt(productForm.min_stock),
              cost_price: parseFloat(productForm.cost_price),
              sale_price: parseFloat(productForm.sale_price)
          };

          if (editingId) {
              await apiService.put(`/api/business/inventory/${editingId}`, payload);
          } else {
              await apiService.post('/api/business/inventory', payload);
          }
          await loadData();
          setIsProductModalOpen(false);
      } catch (error) { alert("Erro ao salvar produto."); }
      finally { setIsSaving(false); }
  };

  const handleDeleteProduct = async (id) => {
      if(confirm("Excluir este produto apagará todo o histórico de movimentação. Continuar?")) {
          try {
              await apiService.delete(`/api/business/inventory/${id}`);
              setProducts(prev => prev.filter(p => p.id !== id));
          } catch(e) { alert("Erro ao excluir."); }
      }
  };

  // --- LÓGICA DE MOVIMENTAÇÃO (ENTRADA/SAÍDA) ---
  const handleOpenMovement = (prod) => {
      setSelectedProductForMovement(prod);
      setMovementForm({ product_id: prod.id, type: 'entrada', quantity: 1, reason: 'compra' });
      setIsMovementModalOpen(true);
  };

  const handleSaveMovement = async () => {
      setIsSaving(true);
      try {
          await apiService.post('/api/business/inventory/movement', {
              ...movementForm,
              quantity: parseFloat(movementForm.quantity)
          });
          await loadData(); // Recarrega para atualizar o saldo
          setIsMovementModalOpen(false);
      } catch (error) { alert("Erro na movimentação."); }
      finally { setIsSaving(false); }
  };

  // --- CÁLCULOS E FILTROS ---
  const filteredProducts = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // KPIs
  const totalItems = products.length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.current_stock * p.cost_price), 0);
  const lowStockItems = products.filter(p => p.current_stock <= p.min_stock).length;

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen pb-20">
      <PageHeaderBusiness user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Controle de Estoque</h1>
            <p className="text-slate-500 text-sm">Gerencie produtos, SKUs e movimentações.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleOpenProductModal()} className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2 shadow-sm">
                <Plus size={18} /> Novo Produto
            </Button>
          </div>
        </div>

        {/* KPIs (Indicadores Rápidos) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-cyan-500 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Itens Cadastrados</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">{totalItems}</p>
                    </div>
                    <Package className="text-cyan-500 opacity-20" size={32} />
                </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Valor em Estoque (Custo)</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-white">R$ {totalStockValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                    <DollarSign className="text-green-500 opacity-20" size={32} />
                </CardContent>
            </Card>
            <Card className={`border-l-4 shadow-sm ${lowStockItems > 0 ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' : 'border-l-slate-300'}`}>
                <CardContent className="p-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Alerta de Reposição</p>
                        <p className={`text-2xl font-bold ${lowStockItems > 0 ? 'text-red-600' : 'text-slate-700'}`}>{lowStockItems} itens</p>
                    </div>
                    <AlertTriangle className={`${lowStockItems > 0 ? 'text-red-500' : 'text-slate-300'} opacity-20`} size={32} />
                </CardContent>
            </Card>
        </div>

        {/* BARRA DE BUSCA */}
        <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Buscar por Nome, SKU ou Categoria..." 
                className="pl-10 bg-white" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        {/* LISTAGEM DE PRODUTOS */}
        <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900">
                    <TableRow>
                        <TableHead>Produto / SKU</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-center">Saldo Atual</TableHead>
                        <TableHead className="text-right">Preço Venda</TableHead>
                        <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2 text-cyan-600"/> Carregando...</TableCell></TableRow>
                    ) : filteredProducts.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center text-slate-400">Nenhum produto encontrado.</TableCell></TableRow>
                    ) : (
                        filteredProducts.map((prod) => (
                            <TableRow key={prod.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-slate-700 dark:text-slate-200">{prod.name}</span>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Barcode size={10} /> {prod.sku}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600">
                                        {prod.category_name || 'Geral'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`font-bold text-lg ${prod.current_stock <= prod.min_stock ? 'text-red-600' : 'text-cyan-700'}`}>
                                            {prod.current_stock} <span className="text-xs text-slate-400 font-normal">{prod.unit}</span>
                                        </span>
                                        {prod.current_stock <= prod.min_stock && (
                                            <span className="text-[10px] text-red-500 flex items-center gap-1 bg-red-50 px-1 rounded">
                                                <AlertTriangle size={8} /> Repor
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    R$ {prod.sale_price?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        {/* Botão de Movimentação Rápida */}
                                        <Button 
                                            variant="outline" size="sm" 
                                            className="h-8 gap-1 text-slate-600 border-slate-300 hover:border-cyan-500 hover:text-cyan-600"
                                            onClick={() => handleOpenMovement(prod)}
                                            title="Registrar Entrada/Saída"
                                        >
                                            <History size={14} /> Ajustar
                                        </Button>
                                        
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-cyan-600" onClick={() => handleOpenProductModal(prod)}>
                                            <Edit size={16}/>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDeleteProduct(prod.id)}>
                                            <Trash2 size={16}/>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
      </div>

      {/* --- MODAL CADASTRO DE PRODUTO --- */}
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
                <DialogDescription>Preencha a ficha técnica do item.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                {/* Linha 1 */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-2">
                        <Label>Nome do Produto *</Label>
                        <Input placeholder="Ex: Cadeira de Escritório" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>SKU (Código) *</Label>
                        <Input placeholder="COD-001" value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} />
                    </div>
                </div>
                
                {/* Linha 2 */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select value={productForm.category_id} onValueChange={v => setProductForm({...productForm, category_id: v})}>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                            <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Unidade</Label>
                        <Select value={productForm.unit} onValueChange={v => setProductForm({...productForm, unit: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="UN">Unidade (UN)</SelectItem>
                                <SelectItem value="KG">Quilo (KG)</SelectItem>
                                <SelectItem value="L">Litro (L)</SelectItem>
                                <SelectItem value="M">Metro (M)</SelectItem>
                                <SelectItem value="CX">Caixa (CX)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label title="Quantidade mínima para alerta">Estoque Mínimo</Label>
                        <Input type="number" value={productForm.min_stock} onChange={e => setProductForm({...productForm, min_stock: e.target.value})} />
                    </div>
                </div>

                {/* Linha 3 - Financeiro */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded border">
                    <div className="space-y-2">
                        <Label>Preço de Custo (R$)</Label>
                        <Input type="number" placeholder="0.00" value={productForm.cost_price} onChange={e => setProductForm({...productForm, cost_price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Preço de Venda (R$)</Label>
                        <Input type="number" placeholder="0.00" value={productForm.sale_price} onChange={e => setProductForm({...productForm, sale_price: e.target.value})} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Descrição / Detalhes</Label>
                    <Textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} />
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveProduct} disabled={isSaving} className="bg-cyan-600 text-white">{isSaving ? 'Salvando...' : 'Salvar Produto'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL DE MOVIMENTAÇÃO (AJUSTE DE SALDO) --- */}
      <Dialog open={isMovementModalOpen} onOpenChange={setIsMovementModalOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Movimentação de Estoque</DialogTitle>
                <DialogDescription>
                    Registrar entrada ou saída para: <span className="font-bold text-slate-800">{selectedProductForMovement?.name}</span>
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        type="button"
                        variant={movementForm.type === 'entrada' ? 'default' : 'outline'}
                        className={movementForm.type === 'entrada' ? 'bg-green-600 hover:bg-green-700' : ''}
                        onClick={() => setMovementForm({...movementForm, type: 'entrada', reason: 'compra'})}
                    >
                        <ArrowUpCircle className="mr-2" size={18}/> Entrada
                    </Button>
                    <Button 
                        type="button"
                        variant={movementForm.type === 'saida' ? 'default' : 'outline'}
                        className={movementForm.type === 'saida' ? 'bg-red-600 hover:bg-red-700' : ''}
                        onClick={() => setMovementForm({...movementForm, type: 'saida', reason: 'venda'})}
                    >
                        <ArrowDownCircle className="mr-2" size={18}/> Saída
                    </Button>
                </div>

                <div className="space-y-2">
                    <Label>Quantidade ({selectedProductForMovement?.unit})</Label>
                    <Input 
                        type="number" 
                        min="0.01" step="0.01" 
                        className="text-lg font-bold text-center"
                        value={movementForm.quantity} 
                        onChange={e => setMovementForm({...movementForm, quantity: e.target.value})} 
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <Label>Motivo</Label>
                    <Select value={movementForm.reason} onValueChange={v => setMovementForm({...movementForm, reason: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {movementForm.type === 'entrada' ? (
                                <>
                                    <SelectItem value="compra">Compra de Fornecedor</SelectItem>
                                    <SelectItem value="devolucao">Devolução de Cliente</SelectItem>
                                    <SelectItem value="ajuste_positivo">Ajuste de Inventário (+)</SelectItem>
                                </>
                            ) : (
                                <>
                                    <SelectItem value="venda">Venda</SelectItem>
                                    <SelectItem value="consumo">Consumo Interno</SelectItem>
                                    <SelectItem value="perda">Perda / Avaria</SelectItem>
                                    <SelectItem value="ajuste_negativo">Ajuste de Inventário (-)</SelectItem>
                                </>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={() => setIsMovementModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleSaveMovement} disabled={isSaving} className="bg-slate-800 text-white">Confirmar</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Inventory;