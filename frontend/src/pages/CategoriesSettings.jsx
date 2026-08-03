import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Check, Tag, AlertCircle, ArrowUpCircle, ArrowDownCircle, Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmojiPicker from 'emoji-picker-react';
import styles from './CategoriesSettings.module.css';

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

  // --- NOVOS ESTADOS PARA O EMOJI PICKER ---
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('💰'); // Emoji Padrão

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
    setShowEmojiPicker(false); // Sempre fecha o picker ao abrir o modal
    
    if (category) {
      // MODO EDIÇÃO: Tentar separar o emoji do nome (Ex: "🍔 Lanche" -> Emoji: "🍔", Nome: "Lanche")
      // Usa uma Regex básica para detectar se o primeiro caractere é um emoji
      const emojiRegex = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic})/u;
      const match = category.name.match(emojiRegex);
      
      let initialEmoji = '💰';
      let initialName = category.name;

      if (match) {
        initialEmoji = match[0];
        initialName = category.name.substring(match[0].length).trim(); // Tira o emoji do nome para editar
      }

      setEditingCategory(category);
      setSelectedEmoji(initialEmoji);
      setFormData({
        name: initialName,
        color: category.color || '#808080',
        type: category.type
      });
    } else {
      // MODO CRIAÇÃO
      setEditingCategory(null);
      setSelectedEmoji('💰');
      setFormData({
        name: '',
        color: presetColors[Math.floor(Math.random() * presetColors.length)],
        type: activeTab
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

      // FUSÃO MÁGICA: Junta o Emoji selecionado com o nome digitado
      const nomeComEmoji = `${selectedEmoji} ${formData.name.trim()}`;

      let response;
      if (editingCategory) {
        // EDITAR (PUT)
        response = await fetch(`${API_URL}/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ 
            name: nomeComEmoji, 
            color: formData.color 
          })
        });
      } else {
        // CRIAR (POST)
        response = await fetch(`${API_URL}/api/categories`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...formData,
            name: nomeComEmoji // Sobrescreve o nome pelo formato com emoji
          })
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
    <div className={styles.pageContainer}>
      
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>
            Categorias
          </h1>
          <p className={styles.pageSubtitle}>Gerencie como você classifica suas finanças.</p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20"
        >
          <Plus size={20} className="mr-2" /> Nova Categoria
        </Button>
      </div>

      {/* Abas */}
      <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5 w-full md:w-fit">
        <button
          onClick={() => setActiveTab('entrada')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'entrada' 
              ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
          }`}
        >
          <ArrowUpCircle size={16} /> Entradas
        </button>
        <button
          onClick={() => setActiveTab('saida')}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'saida' 
              ? 'bg-white dark:bg-white/10 text-red-600 dark:text-red-400 shadow-sm' 
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
          }`}
        >
          <ArrowDownCircle size={16} /> Saídas
        </button>
      </div>

      {/* Lista de Categorias */}
      {loading && categories.length === 0 ? (
        <div className="flex justify-center p-12">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 dark:border-cyan-400"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div 
              key={cat.id} 
              className={`${styles.premiumCard} group flex flex-row items-center justify-between p-5 relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-12 -mt-12 blur-2xl opacity-10" style={{ backgroundColor: cat.color }}></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm dark:shadow-lg border transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${cat.color}33`, color: cat.color, borderColor: `${cat.color}55` }}
                >
                  <Tag size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{cat.name}</h3>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{cat.type}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform translate-x-0 md:translate-x-2 md:group-hover:translate-x-0">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleOpenModal(cat)}
                  className="h-8 w-8 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                >
                  <Edit2 size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDelete(cat.id)}
                  className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-300 dark:border-white/10 border-dashed">
              <p className="text-slate-500 italic">Nenhuma categoria de {activeTab} encontrada.</p>
              <button onClick={() => handleOpenModal()} className="text-cyan-600 dark:text-cyan-400 hover:underline mt-4 text-sm font-medium">
                Criar a primeira
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-300">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {error && (
                <div className="p-4 bg-red-500/10 text-red-400 text-sm rounded-xl border border-red-500/20 flex items-center gap-3">
                  <AlertCircle size={20} /> {error}
                </div>
              )}

              {/* Tipo */}
              {!editingCategory && (
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'entrada'})}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'entrada' ? 'bg-white dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-sm dark:shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-600 dark:text-slate-300'}`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, type: 'saida'})}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'saida' ? 'bg-white dark:bg-white/10 text-red-600 dark:text-red-400 shadow-sm dark:shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-600 dark:text-slate-300'}`}
                  >
                    Saída
                  </button>
                </div>
              )}

              {/* Nome com Emoji Picker */}
              <div className="space-y-3 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome e Ícone</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex items-center justify-center w-14 h-14 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-2xl shrink-0 shadow-sm dark:shadow-lg active:scale-95"
                  >
                    {selectedEmoji}
                  </button>
                  
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alimentação, Salário..."
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="flex-1 px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:border-cyan-500/50 focus:ring-0 outline-none text-slate-800 dark:text-white h-14"
                  />
                </div>

                {showEmojiPicker && (
                  <div className="absolute top-20 left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10 animate-in slide-in-from-top-4 duration-300">
                    <EmojiPicker 
                      onEmojiClick={(emojiObject) => {
                        setSelectedEmoji(emojiObject.emoji);
                        setShowEmojiPicker(false);
                      }}
                      autoFocusSearch={false}
                      theme="dark"
                      searchPlaceHolder="Buscar ícone..."
                      width={320}
                      height={400}
                    />
                  </div>
                )}
              </div>

              {/* Cor Picker */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cor de Identificação</label>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/5">{formData.color}</span>
                </div>
                
                <div className="grid grid-cols-6 gap-3">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-10 h-10 rounded-xl transition-all hover:scale-110 shadow-sm dark:shadow-lg border-2 ${formData.color === color ? 'border-slate-800 dark:border-white scale-110 ring-4 ring-slate-200 dark:ring-white/10' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 cursor-pointer flex items-center justify-center transition-all">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Plus size={16} className="text-slate-500 dark:text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <><Check size={20} className="mr-2" /> Salvar</>
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesSettings;