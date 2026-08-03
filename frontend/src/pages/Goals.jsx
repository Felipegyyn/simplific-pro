import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, DollarSign, TrendingUp, Plus, Edit, Trash2, 
  Calendar, CheckCircle, Clock, LogOut, ArrowLeft, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import apiService from '../services/api';
import logo from '../assets/LOGO.png';
import styles from './Goals.module.css';

const Goals = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  // Estados para metas e modal
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: '',
    priority: 'média',
    image_url: '' // <-- ADICIONE ESTA LINHA
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    category: '',
    priority: 'média',
  });

  // Carregar metas da API
  useEffect(() => {
    loadMetas();
  }, []);

  const loadMetas = async () => {
  try {
    setLoading(true);
    const response = await apiService.get('/api/goals');
    setMetas(response || []); // <-- CORREÇÃO AQUI
  } catch (error) {
    console.error('Erro ao carregar metas:', error);
    setMetas([]); // Limpa as metas em caso de erro
  } finally {
    setLoading(false);
  }
};

  // Função para criar nova meta
  const criarMeta = async (dadosMeta) => {
  try {
    // Não precisa mais checar response.success, pois o erro já cairá no catch.
    await apiService.post('/api/goals', dadosMeta);
    
    await loadMetas(); // Recarregar lista
    setIsModalOpen(false); // Fechar modal
    setFormData({ // Limpar formulário
      name: '',
      description: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
      category: '',
      priority: 'média',
      image_url: '' // <-- ADICIONE ESTA LINHA
    });
    alert('✅ Meta criada com sucesso!');

  } catch (error) {
    console.error('Erro ao criar meta:', error);
    // Extrai a mensagem de erro específica vinda do backend
    const errorMessage = error.response?.data?.error || 'Erro ao criar meta. Tente novamente.';
    alert(`❌ ${errorMessage}`);
  }
};
  // Função para excluir meta
  const excluirMeta = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await apiService.delete(`/api/goals/${id}`);
        await loadMetas(); // Recarregar lista
      } catch (error) {
        console.error('Erro ao excluir meta:', error);
        alert('Erro ao excluir meta. Tente novamente.');
      }
    }
  };

  // Função para adicionar valor à meta
  // Em goals.jsx
// Substitua a função inteira por esta versão

// Função para adicionar valor à meta
const adicionarValor = async (id, valor) => {
  try {
    // 1. Chama a nova rota POST específica para contribuições.
    // 2. Envia apenas o valor a ser adicionado no corpo da requisição.
    await apiService.post(`/api/goals/${id}/contribute`, { amount: parseFloat(valor) });
    
    // 3. Se a chamada for bem-sucedida, recarrega os dados e avisa o usuário.
    await loadMetas();
    alert('✅ Valor adicionado e despesa registrada com sucesso!');

  } catch (error) {
    console.error('Erro ao adicionar valor:', error);
    // Extrai a mensagem de erro específica vinda do backend para um alerta mais claro.
    const errorMessage = error.response?.data?.error || 'Erro ao adicionar valor. Tente novamente.';
    alert(`❌ ${errorMessage}`);
  }
};

  // Função para editar meta
  const editarMeta = async (id, dados) => {
  try {
    await apiService.put(`/api/goals/${id}`, dados);
    
    // Se a linha acima não deu erro, então teve sucesso.
    await loadMetas();
    setIsEditModalOpen(false);
    setSelectedMeta(null);
    alert('✅ Meta atualizada com sucesso!');

  } catch (error) {
    console.error('Erro ao editar meta:', error);
    const errorMessage = error.response?.data?.error || 'Erro ao editar meta. Tente novamente.';
    alert(`❌ ${errorMessage}`);
  }
};

  // Função para abrir modal de edição
  const abrirModalEdicao = (meta) => {
  setSelectedMeta(meta);
  setEditFormData({
    name: meta.name,
    description: meta.description,
    target_amount: meta.target_value.toString(),
    current_amount: meta.current_value.toString(),
    target_date: meta.target_date,
    category: meta.category,
    priority: meta.priority
  });
  setIsEditModalOpen(true);
};

  // Função para lidar com submit do formulário
const handleSubmit = (e) => {
  e.preventDefault();
  
  // Validação básica
  if (!formData.name || !formData.target_amount || !formData.target_date || !formData.category) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  // Cria um payload com os nomes corretos para a API
  const payload = {
    name: formData.name,
    description: formData.description,
    target_value: parseFloat(formData.target_amount), // <-- CORREÇÃO PRINCIPAL AQUI
    current_value: parseFloat(formData.current_amount) || 0,
    target_date: formData.target_date,
    category: formData.category,
    priority: formData.priority,
    image_url: formData.image_url
  };

  criarMeta(payload); // Envia o payload corrigido
};

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filtrar metas por status
  const metasAtivas = metas.filter(meta => meta.is_active && !meta.is_completed);
  const metasConcluidas = metas.filter(meta => meta.is_completed);
  const metasArquivadas = metas.filter(meta => !meta.is_active);

  // Calcular totais
  const valorTotalMetas = metasAtivas.reduce((sum, meta) => sum + meta.target_value, 0);
  const valorAtualTotal = metasAtivas.reduce((sum, meta) => sum + meta.current_value, 0);
  const progressoMedio = metasAtivas.length > 0 ? 
    metasAtivas.reduce((sum, meta) => sum + meta.progress_percentage, 0) / metasAtivas.length : 0;

  const getProgressColor = (progresso) => {
    if (progresso >= 100) return 'bg-green-500';
    if (progresso >= 75) return 'bg-blue-500';
    if (progresso >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPrioridadeBadge = (prioridade) => {
    const colors = {
      alta: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      média: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    };
    return <Badge className={colors[prioridade]}>{prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}</Badge>;
  };

  const getStatusBadge = (status) => {
    const colors = {
      ativa: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      concluida: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      arquivada: 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300'
    };
    const labels = {
      ativa: 'Ativa',
      concluida: 'Concluída',
      arquivada: 'Arquivada'
    };
    return <Badge className={colors[status]}>{labels[status]}</Badge>;
  };

  const diasRestantes = (prazo) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    const diffTime = dataPrazo - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  console.log("CONTEÚDO DE METAS ATIVAS:", JSON.stringify(metasAtivas, null, 2));

  const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    // A data vem como "YYYY-MM-DD" do backend.
    const [year, month, day] = dateString.split('T')[0].split('-');
    // Apenas remontamos a data na ordem correta, sem usar new Date().
    return `${day}/${month}/${year}`;
  };
  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className="glass-panel rounded-none border-x-0 border-t-0 border-white/5 sticky top-0 z-10 print:hidden">
        <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-500 hidden sm:block">
                Bem-vindo, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout} className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100%] mx-auto p-4 sm:p-6 lg:p-8">
        <div className={styles.header}>
          <div>
            <h2 className={styles.pageTitle}>
              Metas Financeiras
            </h2>
            <p className={styles.pageSubtitle}>Defina e acompanhe seus objetivos financeiros com precisão tecnológica</p>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className={styles.summaryGrid}>
          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxPrimary}>
                  <Target className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Total de Metas</p>
              <p className={styles.summaryValue}>{metasAtivas.length}</p>
              <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxPurple}>
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Valor Total</p>
              <p className={styles.summaryValue}>R$ {valorTotalMetas.toLocaleString()}</p>
              <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxSuccess}>
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Valor Atual</p>
              <p className={styles.summaryValue}>R$ {valorAtualTotal.toLocaleString()}</p>
              <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${valorTotalMetas > 0 ? (valorAtualTotal / valorTotalMetas) * 100 : 0}%` }} />
              </div>
            </div>
          </div>

          <div className={styles.premiumCard}>
            <div className={styles.cardContent}>
              <div className="flex items-center justify-between mb-4">
                <div className={styles.iconBox + ' ' + styles.iconBoxWarning}>
                  <Star className="h-6 w-6" />
                </div>
              </div>
              <p className={styles.summaryLabel}>Progresso Médio</p>
              <p className={styles.summaryValue}>{progressoMedio.toFixed(1)}%</p>
              <div className="mt-2 h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${progressoMedio}%` }} />
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="ativas" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 glass-panel p-4 border-white/5">
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="ativas" className={styles.tabsTrigger}>Ativas ({metasAtivas.length})</TabsTrigger>
              <TabsTrigger value="concluidas" className={styles.tabsTrigger}>Concluídas ({metasConcluidas.length})</TabsTrigger>
              <TabsTrigger value="arquivadas" className={styles.tabsTrigger}>Arquivadas ({metasArquivadas.length})</TabsTrigger>
            </TabsList>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-900/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-white">Nova Meta Financeira</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Nome da Meta *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Ex: Reserva de Emergência" required className="glass-panel border-white/10" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-slate-300">Descrição</Label>
                    <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="Descreva sua meta..." rows={3} className="glass-panel border-white/10 resize-none" />
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="image_url" className="text-slate-300">URL da Imagem (Opcional)</Label>
                    <Input id="image_url" value={formData.image_url} onChange={(e) => handleInputChange('image_url', e.target.value)} placeholder="Link de uma imagem..." className="glass-panel border-white/10" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_amount" className="text-slate-300">Valor Meta (R$) *</Label>
                      <Input id="target_amount" type="number" step="0.01" value={formData.target_amount} onChange={(e) => handleInputChange('target_amount', e.target.value)} placeholder="0,00" required className="glass-panel border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="current_amount" className="text-slate-300">Valor Atual (R$)</Label>
                      <Input id="current_amount" type="number" step="0.01" value={formData.current_amount} onChange={(e) => handleInputChange('current_amount', e.target.value)} placeholder="0,00" className="glass-panel border-white/10" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_date" className="text-slate-300">Data Meta *</Label>
                      <Input id="target_date" type="date" value={formData.target_date} onChange={(e) => handleInputChange('target_date', e.target.value)} required className="glass-panel border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-slate-300">Prioridade</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="glass-panel border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-white/10">
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="média">Média</SelectItem>
                          <SelectItem value="baixa">Baixa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-300">Categoria *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className="glass-panel border-white/10">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent className="glass-panel border-white/10 max-h-[200px]">
                        <SelectItem value="Segurança">Segurança</SelectItem>
                        <SelectItem value="Lazer">Lazer</SelectItem>
                        <SelectItem value="Transporte">Transporte</SelectItem>
                        <SelectItem value="Educação">Educação</SelectItem>
                        <SelectItem value="Saúde">Saúde</SelectItem>
                        <SelectItem value="Casa">Casa</SelectItem>
                        <SelectItem value="Investimentos">Investimentos</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">Cancelar</Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Criar Meta</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Metas Ativas */}
          <TabsContent value="ativas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {metasAtivas.map((meta) => {
                const dias = diasRestantes(meta.target_date);
                return (
                  <div key={meta.id} className={styles.goalCard + " group"}>
                    <div className="flex flex-col md:flex-row h-full">
                      {meta.image_url && (
                        <div className="md:w-1/3 flex-shrink-0 relative overflow-hidden">
                          <img
                            src={meta.image_url}
                            alt={meta.name}
                            className="w-full h-48 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/020617/94a3b8?text=Goal'; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/0 to-slate-900/20 md:to-transparent dark:from-slate-950/0 dark:to-slate-950/20" />
                        </div>
                      )}

                      <div className={`flex-1 p-6 flex flex-col justify-between z-10 ${!meta.image_url ? 'w-full' : ''}`}>
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{meta.name}</h3>
                                {getPrioridadeBadge(meta.priority)}
                              </div>
                              <p className="text-xs text-slate-500 mb-4 line-clamp-2 italic">"{meta.description}"</p>
                              
                              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[11px] uppercase tracking-wider">
                                <div>
                                  <p className="text-slate-500 mb-1">Categoria</p>
                                  <p className="font-bold text-slate-700 dark:text-slate-200">{meta.category}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 mb-1">Prazo</p>
                                  <p className={`font-bold ${dias < 30 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {formatLocalDate(meta.target_date)}
                                    {dias >= 0 && <span className="text-[9px] block opacity-70">({dias} dias)</span>}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500 mb-1">Valor Meta</p>
                                  <p className="font-bold text-cyan-600 dark:text-cyan-400">R$ {meta.target_value.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-slate-500 mb-1">Valor Atual</p>
                                  <p className="font-bold text-emerald-600 dark:text-emerald-400">R$ {meta.current_value.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 ml-4 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
                                onClick={() => {
                                  const valor = prompt('Quanto deseja adicionar à meta?');
                                  if (valor && !isNaN(valor)) adicionarValor(meta.id, valor);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5" onClick={() => abrirModalEdicao(meta)}><Edit className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-500/10" onClick={() => excluirMeta(meta.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mt-6">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Progresso</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{meta.progress_percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${getProgressColor(meta.progress_percentage)}`}
                              style={{ width: `${Math.min(meta.progress_percentage, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-tighter">
                            <span>R$ {meta.current_value.toLocaleString()}</span>
                            <span>R$ {Math.max(0, meta.target_value - meta.current_value).toLocaleString()} restantes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Metas Concluídas */}
          <TabsContent value="concluidas" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metasConcluidas.map((meta) => (
                <div key={meta.id} className={styles.goalCard + " border-emerald-500/20 bg-emerald-500/5 p-6 group"}>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-emerald-500/20 p-2 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{meta.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-1 italic">"{meta.description}"</p>
                      <div className="grid grid-cols-3 gap-4 text-[10px] uppercase tracking-wider">
                        <div>
                          <p className="text-slate-500 mb-1">Categoria</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{meta.category}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Concluída</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{formatLocalDate(meta.target_date)}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Total</p>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">R$ {meta.current_value.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-emerald-500/10 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full animate-pulse" />
                  </div>
                </div>
              ))}
              {metasConcluidas.length === 0 && (
                <div className={styles.emptyState + " col-span-2"}>
                  <div className="flex flex-col items-center">
                    <CheckCircle className="h-12 w-12 mb-4 opacity-20" />
                    <p>Nenhuma meta concluída ainda.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Metas Arquivadas */}
          <TabsContent value="arquivadas" className="space-y-6">
            <div className={styles.emptyState + " flex-col border border-dashed rounded-xl"}>
              <Target className="h-12 w-12 text-slate-400 mb-4" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Nenhuma meta arquivada</p>
              <p className="text-xs text-slate-500 mt-1">Metas canceladas ou pausadas aparecerão aqui</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Editar Meta */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editFormData.name || !editFormData.target_amount || !editFormData.target_date || !editFormData.category) {
                alert('Preencha os campos obrigatórios.'); return;
              }
              const payload = {
                name: editFormData.name,
                description: editFormData.description,
                target_value: parseFloat(editFormData.target_amount),
                current_value: parseFloat(editFormData.current_amount) || 0,
                target_date: editFormData.target_date,
                category: editFormData.category,
                priority: editFormData.priority
              };
              editarMeta(selectedMeta.id, payload);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name" className="text-slate-300">Nome da Meta *</Label>
                <Input id="edit_name" value={editFormData.name} onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))} required className="glass-panel border-white/10" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit_description" className="text-slate-300">Descrição</Label>
                <Textarea id="edit_description" value={editFormData.description} onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))} rows={3} className="glass-panel border-white/10 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_target_amount" className="text-slate-300">Valor Meta (R$) *</Label>
                  <Input id="edit_target_amount" type="number" step="0.01" value={editFormData.target_amount} onChange={(e) => setEditFormData(prev => ({...prev, target_amount: e.target.value}))} required className="glass-panel border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_current_amount" className="text-slate-300">Valor Atual (R$)</Label>
                  <Input id="edit_current_amount" type="number" step="0.01" value={editFormData.current_amount} onChange={(e) => setEditFormData(prev => ({...prev, current_amount: e.target.value}))} className="glass-panel border-white/10" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_target_date" className="text-slate-300">Data Meta *</Label>
                  <Input id="edit_target_date" type="date" value={editFormData.target_date} onChange={(e) => setEditFormData(prev => ({...prev, target_date: e.target.value}))} required className="glass-panel border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_priority" className="text-slate-300">Prioridade</Label>
                  <Select value={editFormData.priority} onValueChange={(value) => setEditFormData(prev => ({...prev, priority: value}))}>
                    <SelectTrigger className="glass-panel border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="média">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_category" className="text-slate-300">Categoria *</Label>
                <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger className="glass-panel border-white/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10 max-h-[200px]">
                    <SelectItem value="Segurança">Segurança</SelectItem>
                    <SelectItem value="Lazer">Lazer</SelectItem>
                    <SelectItem value="Transporte">Transporte</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Investimentos">Investimentos</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">Cancelar</Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar Alterações</Button>
              </div>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

export default Goals;
