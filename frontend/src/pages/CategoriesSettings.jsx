import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Check, Tag, AlertCircle, ArrowUpCircle, ArrowDownCircle 
} from 'lucide-react';

const CategoriesSettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saida'); // 'entrada' ou 'saida'
  const [error, setError] = useState('');

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Dados do Formulário
  const [formData, setFormData] = useState({
    name: '',
    color: '#808080',
    type: 'saida'
  });

  // Paleta de cores sugerida (Cores do Simplific)
  const presetColors = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#64748B', // Slate
    '#000000', // Black
  ];

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('simplific_token');
      // Ajuste a rota '/api/financial/categories' se o seu blueprint for diferente
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Falha ao carregar categorias');
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar categorias.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    setError('');
    if (category) {
      // Modo Edição
      setEditingCategory(category);
      setFormData({
        name: category.name,
        color: category.color || '#808080',
        type: category.type
      });
    } else {
      // Modo Criação
      setEditingCategory(null);
      setFormData({
        name: '',
        color: presetColors[Math.floor(Math.random() * presetColors.length)],
        type: activeTab // Já abre com o tipo da aba atual
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('simplific_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      let response;
      if (editingCategory) {
        // EDITAR (PUT)
        response = await fetch(`${API_URL}/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            name: formData.name, 
            color: formData.color 
          })
        });
      } else {
        // CRIAR (POST)
        response = await fetch(`${API_URL}/api/categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar categoria');
      }

      await fetchCategories(); // Recarrega a lista
      setIsModalOpen(false);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      const token = localStorage.getItem('simplific_token');
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Erro ao excluir categoria');
      }

      setCategories(categories.filter(c => c.id !== id));

    } catch (err) {
      alert(err.message); // Alerta visual para o erro de vínculo (Transações existentes)
    }
  };

  // Filtra as categorias da aba ativa
  const filteredCategories = categories.filter(c => c.type === activeTab);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Categorias</h1>
          <p className="text-muted-foreground mt-1">Gerencie como você classifica suas finanças.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-all shadow-md font-medium"
        >
          <Plus size={20} /> Nova Categoria
        </button>
      </div>

      {/* Abas */}
      <div className="flex p-1 bg-muted/50 rounded-xl w-full md:w-fit">
        <button
          onClick={() => setActiveTab('entrada')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'entrada' 
              ? 'bg-background text-green-600 shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowUpCircle size={16} /> Entradas
        </button>
        <button
          onClick={() => setActiveTab('saida')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'saida' 
              ? 'bg-background text-red-600 shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ArrowDownCircle size={16} /> Saídas
        </button>
      </div>

      {/* Lista de Categorias */}
      {loading && categories.length === 0 ? (
        <div className="flex justify-center p-12">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="group flex items-center justify-between p-4 bg-card border border-border/50 rounded-xl hover:shadow-md transition-all duration-200 hover:border-border"
            >
              <div className="flex items-center gap-3">
                {/* Bolinha da cor */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{cat.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleOpenModal(cat)}
                  className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
              <p>Nenhuma categoria de {activeTab} encontrada.</p>
              <button onClick={() => handleOpenModal()} className="text-primary hover:underline mt-2 text-sm">
                Criar a primeira
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL (Dialog) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-border">
            
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              {/* Tipo (Apenas criação) */}
              {!editingCategory && (
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'entrada'})}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.type === 'entrada' ? 'bg-white shadow-sm text-green-600' : 'text-muted-foreground'}`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'saida'})}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.type === 'saida' ? 'bg-white shadow-sm text-red-600' : 'text-muted-foreground'}`}
                  >
                    Saída
                  </button>
                </div>
              )}

              {/* Nome */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Categoria</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Alimentação, Salário..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-background"
                />
              </div>

              {/* Cor Picker Customizado */}
              <div className="space-y-3">
                <label className="text-sm font-medium flex justify-between">
                  Cor de Identificação
                  <span className="text-xs text-muted-foreground">{formData.color}</span>
                </label>
                
                <div className="flex flex-wrap gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-8 h-8 rounded-full transition-transform hover:scale-110 border-2 ${formData.color === color ? 'border-primary ring-2 ring-offset-2 ring-primary/30' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  
                  {/* Input Color Nativo (Escondido mas acessível) */}
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer flex items-center justify-center">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Plus size={14} className="text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? 'Salvando...' : <><Check size={16} /> Salvar</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesSettings;