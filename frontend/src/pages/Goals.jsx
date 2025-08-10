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
import apiService from '../services/api';
import logo from '../assets/LOGO.png';

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100 p-4 sm:p-6">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm border-b">
        
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Bem-vindo, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        
      </header>

      {/* Main Content */}
      
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Metas Financeiras</h2>
            <p className="text-gray-600 dark:text-gray-400">Defina e acompanhe seus objetivos financeiros</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total de Metas</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{metasAtivas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Valor Total</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">R$ {valorTotalMetas.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Valor Atual</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {valorAtualTotal.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Progresso Médio</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{progressoMedio.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="ativas" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <TabsList className="grid w-full sm:w-auto grid-cols-3">
                <TabsTrigger value="ativas">Ativas ({metasAtivas.length})</TabsTrigger>
                <TabsTrigger value="concluidas">Concluídas ({metasConcluidas.length})</TabsTrigger>
                <TabsTrigger value="arquivadas">Arquivadas ({metasArquivadas.length})</TabsTrigger>
              </TabsList>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Meta
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Nova Meta Financeira</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome da Meta *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Reserva de Emergência"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Descreva sua meta..."
                        rows={3}
                      />
                    </div>
                  
                <div>
                  <Label htmlFor="image_url">URL da Imagem (Opcional)</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    placeholder="Cole o link de uma imagem aqui..."
                  />
                </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target_amount">Valor Meta (R$) *</Label>
                        <Input
                          id="target_amount"
                          type="number"
                          step="0.01"
                          value={formData.target_amount}
                          onChange={(e) => handleInputChange('target_amount', e.target.value)}
                          placeholder="30000.00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="current_amount">Valor Atual (R$)</Label>
                        <Input
                          id="current_amount"
                          type="number"
                          step="0.01"
                          value={formData.current_amount}
                          onChange={(e) => handleInputChange('current_amount', e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target_date">Data Meta *</Label>
                        <Input
                          id="target_date"
                          type="date"
                          value={formData.target_date}
                          onChange={(e) => handleInputChange('target_date', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="média">Média</SelectItem>
                            <SelectItem value="baixa">Baixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Criar Meta
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Metas Ativas */}
            <TabsContent value="ativas" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {metasAtivas.map((meta, index) => {
                  const dias = diasRestantes(meta.target_date);
                  return (
                    <Card key={meta.id} className="overflow-hidden">
  <div className="flex flex-col md:flex-row">
    
    {/* Coluna da Imagem (só aparece se a URL existir) */}
    {meta.image_url && (
      <div className="md:w-1/5 flex-shrink-0 bg-slate-800">
        <img
          src={meta.image_url}
          alt={meta.name}
          className="w-full h-48 md:h-full object-cover"
          // Fallback para uma imagem padrão se a URL falhar
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400/1e293b/94a3b8?text=Imagem%0AInv%C3%A1lida'; }}
        />
      </div>
    )}

    {/* Coluna dos Detalhes */}
    <div className={`flex-1 ${meta.image_url ? 'md:w-4/5' : 'w-full'}`}>
      <CardContent className="p-6 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold dark:text-slate-100">{meta.name}</h3>
                {getPrioridadeBadge(meta.priority)}
                {getStatusBadge('ativa')}
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{meta.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                
                {/* Detalhe: Categoria */}
                <div>
                  <p className="font-medium text-gray-600 dark:text-slate-400">Categoria</p>
                  <p>{meta.category}</p>
                </div>
                
                {/* Detalhe: Prazo */}
                <div>
                  <p className="font-medium text-gray-600 dark:text-slate-400">Prazo</p>
                  <p className={dias < 30 ? 'text-red-600 font-medium' : ''}>
                    {formatLocalDate(meta.target_date)}
                    {dias >= 0 && (
                      <span className="block text-xs">
                        {dias === 0 ? 'Hoje!' : `${dias} dias`}
                      </span>
                    )}
                  </p>
                </div>
                
                {/* Detalhe: Valor Meta */}
                <div>
                  <p className="font-medium text-gray-600 dark:text-slate-400">Valor Meta</p>
                  <p className="text-blue-600 font-bold">R$ {(meta.target_value ?? 0).toLocaleString()}</p>
                </div>
                
                {/* Detalhe: Valor Atual */}
                <div>
                  <p className="font-medium text-gray-600 dark:text-slate-400">Valor Atual</p>
                  <p className="text-green-600 font-bold">R$ {(meta.current_value ?? 0).toLocaleString()}</p>
                </div>

              </div>
            </div>
            <div className="flex flex-col space-y-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const valor = prompt('Quanto deseja adicionar à meta?');
                  if (valor && !isNaN(valor)) {
                    adicionarValor(meta.id, valor);
                  }
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => abrirModalEdicao(meta)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => excluirMeta(meta.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <div className="flex justify-between text-sm">
            <span>Progresso da Meta</span>
            <span className="font-medium">{meta.progress_percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${getProgressColor(meta.progress_percentage)}`}
              style={{ width: `${Math.min(meta.progress_percentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-600 dark:text-slate-400">
            <span>R$ {(meta.current_value ?? 0).toLocaleString()}</span>
            <span>R$ {((meta.target_value ?? 0) - (meta.current_value ?? 0)).toLocaleString()} restantes</span>
          </div>
        </div>
      </CardContent>
    </div>
  </div>
</Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Metas Concluídas */}
            <TabsContent value="concluidas" className="space-y-6">
              <div className="grid gap-6">
              {metasConcluidas.map((meta) => (
              <Card key={meta.id} className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
              <CardContent className="p-6">
              <div className="flex justify-between items-start">
            <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              {/* CORREÇÃO DE PROPRIEDADES */}
              <h3 className="text-lg font-semibold">{meta.name}</h3>
              {getStatusBadge('concluida')}
          </div>
              <p className="text-gray-600 mb-3">{meta.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-600 dark:text-slate-400">Categoria</p>
              <p>{meta.category}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600 dark:text-slate-400">Concluída em</p>
              {/* CORREÇÃO DE PROPRIEDADES */}
              <p>{formatLocalDate(meta.target_date)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600 dark:text-slate-400">Valor Alcançado</p>
              {/* CORREÇÃO DE PROPRIEDADES COM PROTEÇÃO */}
              <p className="text-green-600 font-bold">R$ {(meta.current_value ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Progress value={100} className="h-3 bg-green-200" />
      </div>
    </CardContent>
  </Card>
))}
              </div>
            </TabsContent>

            {/* Metas Arquivadas */}
            <TabsContent value="arquivadas" className="space-y-6">
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Nenhuma meta arquivada</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">Metas canceladas ou pausadas aparecerão aqui</p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal para Editar Meta */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Meta</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
  e.preventDefault();
  if (!editFormData.name || !editFormData.target_amount || !editFormData.target_date || !editFormData.category) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }
  
  // Cria um payload com os nomes corretos que o backend espera
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
                <div>
                  <Label htmlFor="edit_name">Nome da Meta *</Label>
                  <Input
                    id="edit_name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Ex: Reserva de Emergência"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit_description">Descrição</Label>
                  <Textarea
                    id="edit_description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Descreva sua meta..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_target_amount">Valor Meta (R$) *</Label>
                    <Input
                      id="edit_target_amount"
                      type="number"
                      step="0.01"
                      value={editFormData.target_amount}
                      onChange={(e) => setEditFormData(prev => ({...prev, target_amount: e.target.value}))}
                      placeholder="30000.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_current_amount">Valor Atual (R$)</Label>
                    <Input
                      id="edit_current_amount"
                      type="number"
                      step="0.01"
                      value={editFormData.current_amount}
                      onChange={(e) => setEditFormData(prev => ({...prev, current_amount: e.target.value}))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit_target_date">Data Meta *</Label>
                    <Input
                      id="edit_target_date"
                      type="date"
                      value={editFormData.target_date}
                      onChange={(e) => setEditFormData(prev => ({...prev, target_date: e.target.value}))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_priority">Prioridade</Label>
                    <Select value={editFormData.priority} onValueChange={(value) => setEditFormData(prev => ({...prev, priority: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="média">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit_category">Categoria *</Label>
                  <Select value={editFormData.category} onValueChange={(value) => setEditFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      
    </div>
  );
};

export default Goals;

