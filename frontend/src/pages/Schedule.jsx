import { sendWhatsApp } from '@/services/whatsapp';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar, Clock, CheckCircle, AlertTriangle, Plus, Edit, Trash2,
  DollarSign, Bell, LogOut, ArrowLeft, Filter, Globe, Smartphone,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado useLocation
import  apiService  from '../services/api';
import logo from '../assets/LOGO.png';

const Schedule = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const location = useLocation(); // Hook para ler a URL
  const [isSyncing, setIsSyncing] = useState(false); // Estado de loading do botão

  // Estados puramente de UI para o calendário visual
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  
  // Estados para eventos e modal
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    type: '',
    amount: '',
    priority: '',
    category: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '09:00',
    type: 'pagamento',
    amount: '',
    priority: 'média',
    category: '',
    is_recurring: 'nao', // <--- NOVO
    recurrence_count: '' // <--- NOVO
  });

  // ▼▼▼ LÓGICA DE SINCRONIZAÇÃO ▼▼▼
  
  // 1. Detectar retorno do Google (Sucesso)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('google_connected') === 'success') {
        alert("✅ Google Agenda conectado com sucesso! Novos eventos serão sincronizados.");
        navigate('/schedule', { replace: true }); // Limpa a URL
    }
  }, [location]);

  // 2. Função Conectar Google
  const handleGoogleConnect = async () => {
    try {
        setIsSyncing(true);
        const response = await apiService.get('/api/schedule/google/auth');
        if (response.auth_url) window.location.href = response.auth_url;
        else alert("Erro ao iniciar conexão com Google.");
    } catch (error) {
        console.error("Erro Google Auth:", error);
        alert("Erro ao conectar com Google Agenda.");
    } finally {
        setIsSyncing(false);
    }
  };

  // 3. Função Sincronizar Apple/Outlook
  const handleAppleSync = () => {
    if (!user?.id) return alert("Erro: ID de usuário não encontrado.");
    const icsUrl = `${import.meta.env.VITE_API_URL}/api/schedule/feed/${user.id}/calendar.ics`;
    window.open(icsUrl, '_blank');
    alert("Arquivo de calendário gerado! Abra-o no seu iPhone ou Outlook para se inscrever.");
  };
  // ▲▲▲ FIM LÓGICA DE SINCRONIZAÇÃO ▲▲▲

  // Carregar eventos da API
  useEffect(() => {
    loadEventos();
  }, []);

  const loadEventos = async () => {
    try {
      setLoading(true);
      // ▼▼▼ CORREÇÃO 1: LER A RESPOSTA DIRETAMENTE ▼▼▼
      const eventosCarregados = await apiService.get('/api/schedule') || [];
      setEventos(eventosCarregados);

      // 🔔 WhatsApp automático para eventos de pagamento próximos
      const hoje = new Date();
      eventosCarregados.forEach(async (evento) => {
        // ▼▼▼ CORREÇÃO 2: USAR 'evento.date' ▼▼▼
        const dataEvento = new Date(evento.date);
        const diffDias = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));

        if (evento.type === 'pagamento' && evento.is_completed === false && diffDias <= 3 && diffDias >= 0) {
          // A lógica do WhatsApp pode ser reativada quando o campo de telefone estiver disponível no user
          /*
          await sendWhatsApp(`whatsapp:${user.telefone_whatsapp}`, 'fatura_vencimento', {
            cartao: evento.title,
            valor: evento.value,
            vencimento: evento.date
          });
          */
        }
      });
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar novo evento
  const criarEvento = async (dadosEvento) => {
    try {
      // Usamos a resposta da API diretamente, sem checar 'response.success'
      await apiService.post('/api/schedule', dadosEvento);
      await loadEventos(); // Recarregar lista
      setIsModalOpen(false); // Fechar modal
      setFormData({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        event_time: '09:00',
        type: 'pagamento',
        amount: '',
        priority: 'média',
        category: ''
      }); // Limpar formulário
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert('Erro ao criar evento. Tente novamente.');
    }
  };

  // ▼▼▼ SUBSTITUA A FUNÇÃO marcarConcluido POR ESTA ▼▼▼
  const marcarConcluido = async (id) => {
    try {
      // Ativa a chamada para a nova rota PUT que criamos no backend
      await apiService.put(`/api/schedule/${id}`, { status: 'concluido' });
      // Recarrega a lista de eventos para atualizar a tela
      await loadEventos();
    } catch (error) {
      console.error('Erro ao marcar evento como concluído:', error);
      alert('Erro ao marcar evento como concluído. Tente novamente.');
    }
  };

  // Função para excluir evento
  const excluirEvento = async (id) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await apiService.delete(`/api/schedule/${id}`);
        await loadEventos();
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Erro ao excluir evento. Tente novamente.');
      }
    }
  };

  // ▼▼▼ ADICIONE AS 3 NOVAS FUNÇÕES DE EDIÇÃO AQUI ▼▼▼

  // Abre o modal de edição e preenche com os dados do evento
  const abrirModalEdicao = (evento) => {
    setEditingEvent(evento);
    setEditFormData({
      title: evento.title,
      description: evento.description || '',
      event_date: evento.date.split('T')[0],
      event_time: evento.time || '',
      type: evento.type,
      amount: evento.value || '',
      priority: evento.priority,
      category: evento.category || ''
    });
    setIsEditModalOpen(true);
  };

  // Lida com mudanças nos inputs do formulário de edição
  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  // Envia as atualizações para a API ao salvar
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;
    
    try {
      const payload = {
        ...editFormData,
        amount: editFormData.amount ? parseFloat(editFormData.amount) : null
      };
      await apiService.put(`/api/schedule/${editingEvent.id}`, payload);
      setIsEditModalOpen(false);
      await loadEventos();
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      alert('Erro ao atualizar evento. Tente novamente.');
    }
  };

  // ▲▲▲ FIM DO BLOCO DE FUNÇÕES DE EDIÇÃO ▲▲▲

  // Função para lidar com submit do formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.event_date || !formData.type) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Se marcou como recorrente, exige a quantidade
    if (formData.is_recurring === 'sim' && (!formData.recurrence_count || formData.recurrence_count < 2)) {
        alert('Por favor, informe uma quantidade válida de meses (mínimo 2).');
        return;
    }

    criarEvento({
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : null,
      is_recurring: formData.is_recurring === 'sim',
      recurrence_count: formData.is_recurring === 'sim' ? parseInt(formData.recurrence_count) : 1
    });
  };

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Filtrar eventos
  const hoje = new Date().toISOString().split('T')[0];
  // ▼▼▼ CORREÇÃO 2: USAR 'evento.date' E 'evento.is_completed' EM TODOS OS FILTROS ▼▼▼
  const eventosProximos = eventos.filter(evento => evento.date >= hoje && evento.is_completed === false);
  const eventosHoje = eventos.filter(evento => evento.date === hoje && evento.is_completed === false);
  const eventosConcluidos = eventos.filter(evento => evento.is_completed === true);
  const eventosAtrasados = eventos.filter(evento => evento.date < hoje && evento.is_completed === false);

  // Calcular totais
  const pagamentosPendentes = eventos.filter(e => e.type === 'pagamento' && e.is_completed === false)
                                      .reduce((sum, e) => sum + (e.value || 0), 0);

  const getTipoBadge = (tipo) => {
    const configs = {
      pagamento: { color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', label: 'Pagamento' },
      recebimento: { color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300', label: 'Recebimento' },
      reuniao: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300', label: 'Reunião' },
      vencimento: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300', label: 'Vencimento' },
      tarefa: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', label: 'Tarefa' },
      lembrete: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300', label: 'Lembrete' }
    };
    const config = configs[tipo] || configs.tarefa;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPrioridadeBadge = (prioridade) => {
    const colors = {
      alta: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      média: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    };
    const prio = prioridade?.toLowerCase() || 'média';
    return <Badge className={colors[prio]}>{prio.charAt(0).toUpperCase() + prio.slice(1)}</Badge>;
  };

  const getStatusIcon = (status) => {
    return status === true ? 
      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" /> :
      <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
  };

  const formatarData = (data) => {
    if (!data) return '';
    const [year, month, day] = data.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  // ── Helpers puramente visuais para o calendário ──────────────────────────
  const mesesPtBR = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                     'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  const getCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const startDow = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startDow; i++) days.push(null);
    for (let d = 1; d <= totalDays; d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };

  const eventosPorData = eventos.reduce((acc, evento) => {
    const key = evento.date?.split('T')[0];
    if (!key) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(evento);
    return acc;
  }, {});

  const tipoCorCalendario = {
    pagamento:   'bg-red-500',
    recebimento: 'bg-green-500',
    reuniao:     'bg-blue-500',
    vencimento:  'bg-yellow-500',
    tarefa:      'bg-purple-500',
    lembrete:    'bg-purple-400',
  };

  const navegarMes = (direcao) => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + direcao);
      return d;
    });
    setSelectedDay(null);
  };

  const toDateKey = (d) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100 p-4 sm:p-0">
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
        <div className="py-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold dark:text-slate-200">Agenda Financeira</h2>
            <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400">Organize seus compromissos e lembretes financeiros</p>
          </div>


          {/* Card de Resumo Agrupado */}
          <Card className="mb-8 border-orange-500 border-2">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Próximos Eventos */}
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Próximos Eventos</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{eventosProximos.length}</p>
                  </div>
                </div>

                {/* Hoje */}
                <div className="flex items-center">
                  <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Hoje</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{eventosHoje.length}</p>
                  </div>
                </div>

                {/* Pagamentos Pendentes */}
                <div className="flex items-center">
                  <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Pagamentos Pendentes</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      R$ {pagamentosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Atrasados */}
                <div className="flex items-center">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Atrasados</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{eventosAtrasados.length}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="calendario" className="space-y-6">
<div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
  <TabsList className="grid w-full xl:w-auto grid-cols-5">
    <TabsTrigger value="calendario">Calendário</TabsTrigger>
    <TabsTrigger value="proximos">Próximos</TabsTrigger>
    <TabsTrigger value="hoje">Hoje</TabsTrigger>
    <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
    <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
  </TabsList>
  
  {/* GRUPO DE BOTÕES ALINHADOS NA DIREITA - botão do google comentado até resolver a verificação */}
  <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
    <Button 
        variant="outline" 
        onClick={handleGoogleConnect} 
        disabled={isSyncing}
        className="border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400"
    >
        <Globe className="h-4 w-4 mr-2" />
        Google
    </Button>

    <Button 
        variant="outline" 
        onClick={handleAppleSync}
        className="border-green-600 text-green-700 hover:bg-green-50 dark:border-green-500 dark:text-green-400"
    >
        <Smartphone className="h-4 w-4 mr-2" />
        Apple
    </Button>

    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
        </Button>
      </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader><DialogTitle>Novo Evento da Agenda</DialogTitle></DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <Label htmlFor="title">Título do Evento *</Label>
    <Input
      id="title"
      value={formData.title}
      onChange={(e) => handleInputChange('title', e.target.value)}
      placeholder="Ex: Pagamento Cartão, Reunião..."
      required
    />
  </div>
  
  <div>
    <Label htmlFor="description">Descrição</Label>
    <Textarea
      id="description"
      value={formData.description}
      onChange={(e) => handleInputChange('description', e.target.value)}
      placeholder="Descreva o evento..."
      rows={3}
    />
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="event_date">Data *</Label>
      <Input
        id="event_date"
        type="date"
        value={formData.event_date}
        onChange={(e) => handleInputChange('event_date', e.target.value)}
        required
      />
    </div>
    <div>
      <Label htmlFor="event_time">Horário</Label>
      <Input
        id="event_time"
        type="time"
        value={formData.event_time}
        onChange={(e) => handleInputChange('event_time', e.target.value)}
      />
    </div>
  </div>
  
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="type">Tipo *</Label>
      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pagamento">Pagamento</SelectItem>
          <SelectItem value="recebimento">Recebimento</SelectItem>
          <SelectItem value="vencimento">Vencimento</SelectItem>
          <SelectItem value="reuniao">Reunião</SelectItem>
          <SelectItem value="tarefa">Tarefa</SelectItem>
          <SelectItem value="lembrete">Lembrete</SelectItem>
        </SelectContent>
      </Select>
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

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="amount">Valor (R$)</Label>
      <Input
        id="amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={(e) => handleInputChange('amount', e.target.value)}
        placeholder="Opcional"
      />
    </div>
    <div>
      <Label htmlFor="category">Categoria</Label>
      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
          <SelectItem value="Moradia">Moradia</SelectItem>
          <SelectItem value="Investimentos">Investimentos</SelectItem>
          <SelectItem value="Consultoria">Consultoria</SelectItem>
          <SelectItem value="Planejamento">Planejamento</SelectItem>
          <SelectItem value="Saúde">Saúde</SelectItem>
          <SelectItem value="Educação">Educação</SelectItem>
          <SelectItem value="Outros">Outros</SelectItem>
        </SelectContent>
        
      </Select>
    </div>
  </div>

    {/* ▼▼▼ BLOCO DE RECORRÊNCIA ADICIONADO AQUI ▼▼▼ */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="is_recurring">Evento Recorrente?</Label>
      <Select value={formData.is_recurring} onValueChange={(value) => handleInputChange('is_recurring', value)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="nao">Não</SelectItem>
          <SelectItem value="sim">Sim (Mensal)</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    {formData.is_recurring === 'sim' && (
      <div>
        <Label htmlFor="recurrence_count">Duração (Meses)</Label>
        <Input
          id="recurrence_count"
          type="number"
          min="2"
          max="120"
          value={formData.recurrence_count}
          onChange={(e) => handleInputChange('recurrence_count', e.target.value)}
          placeholder="Ex: 2"
          required
        />
      </div>
    )}
  </div>
  {/* ▲▲▲ FIM DO BLOCO DE RECORRÊNCIA ▲▲▲ */}

  <div className="flex justify-end space-x-2 pt-4">
    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
      Cancelar
    </Button>
    <Button type="submit">
      Criar Evento
    </Button>
  </div>
</form>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* ... seu código do formulário ... */}
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* ── CALENDÁRIO MENSAL ─────────────────────────────────────────── */}
            <TabsContent value="calendario">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  {/* Navegação do mês */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => navegarMes(-1)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">
                      {mesesPtBR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </h3>
                    <button
                      onClick={() => navegarMes(1)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Cabeçalho dos dias da semana */}
                  <div className="grid grid-cols-7 mb-2">
                    {diasSemana.map(dia => (
                      <div
                        key={dia}
                        className="text-center text-xs font-semibold text-gray-500 dark:text-slate-400 py-2"
                      >
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Grid dos dias */}
                  <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                    {getCalendarDays(currentMonth).map((day, idx) => {
                      const key = toDateKey(day);
                      const isToday = key === hoje;
                      const isSelected = selectedDay && toDateKey(selectedDay) === key;
                      const eventosNoDia = key ? (eventosPorData[key] || []) : [];

                      return (
                        <div
                          key={idx}
                          onClick={() => day && setSelectedDay(isSelected ? null : day)}
                          className={[
                            'bg-white dark:bg-slate-800 min-h-[80px] p-1.5 flex flex-col cursor-pointer',
                            'hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors',
                            isSelected ? 'ring-2 ring-inset ring-blue-500' : '',
                            !day ? 'bg-gray-50 dark:bg-slate-900 cursor-default pointer-events-none' : '',
                          ].join(' ')}
                        >
                          {day && (
                            <>
                              {/* Número do dia */}
                              <span className={[
                                'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 self-end',
                                isToday
                                  ? 'bg-green-600 text-white font-bold'
                                  : 'text-gray-700 dark:text-slate-200',
                              ].join(' ')}>
                                {day.getDate()}
                              </span>

                              {/* Pills dos eventos */}
                              <div className="flex flex-col gap-0.5 overflow-hidden">
                                {eventosNoDia.slice(0, 3).map(evento => (
                                  <span
                                    key={evento.id}
                                    onClick={(e) => { e.stopPropagation(); setSelectedCalendarEvent(evento); }}
                                    className={[
                                      'text-[10px] leading-tight px-1 py-0.5 rounded text-white truncate cursor-pointer',
                                      'hover:opacity-80 hover:scale-[1.02] transition-all',
                                      evento.is_completed
                                        ? 'bg-gray-400 line-through'
                                        : (tipoCorCalendario[evento.type] || 'bg-gray-500'),
                                    ].join(' ')}
                                    title={evento.title}
                                  >
                                    {evento.title}
                                  </span>
                                ))}
                                {eventosNoDia.length > 3 && (
                                  <span className="text-[10px] text-gray-500 dark:text-slate-400 pl-1">
                                    +{eventosNoDia.length - 3} mais
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legenda de tipos */}
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    {Object.entries({ pagamento: 'Pagamento', recebimento: 'Recebimento', reuniao: 'Reunião', vencimento: 'Vencimento', tarefa: 'Tarefa' }).map(([tipo, label]) => (
                      <div key={tipo} className="flex items-center gap-1.5">
                        <span className={`w-3 h-3 rounded-full ${tipoCorCalendario[tipo]}`} />
                        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-slate-400">Concluído</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Painel de detalhe do dia selecionado */}
              {selectedDay && (
                <Card className="mt-4 border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      {String(selectedDay.getDate()).padStart(2,'0')}/{String(selectedDay.getMonth()+1).padStart(2,'0')}/{selectedDay.getFullYear()}
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 ml-1">
                        {(eventosPorData[toDateKey(selectedDay)] || []).length} evento(s)
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(eventosPorData[toDateKey(selectedDay)] || []).length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">
                        Nenhum evento neste dia.
                      </p>
                    ) : (
                      (eventosPorData[toDateKey(selectedDay)] || []).map(evento => (
                        <div
                          key={evento.id}
                          className="flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {getStatusIcon(evento.is_completed)}
                              <span className={`font-medium text-sm dark:text-slate-100 ${evento.is_completed ? 'line-through text-gray-400' : ''}`}>
                                {evento.title}
                              </span>
                              {getTipoBadge(evento.type)}
                              {getPrioridadeBadge(evento.priority)}
                            </div>
                            {evento.description && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{evento.description}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-slate-400">
                              {evento.time && <span><Clock className="h-3 w-3 inline mr-1" />{evento.time}</span>}
                              {evento.category && <span>{evento.category}</span>}
                              {evento.value && (
                                <span className={`font-bold ${evento.type === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                                  R$ {evento.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-3 shrink-0">
                            {!evento.is_completed && (
                              <Button variant="outline" size="sm" onClick={() => marcarConcluido(evento.id)}>
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(evento)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => excluirEvento(evento.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            {/* ── FIM CALENDÁRIO MENSAL ─────────────────────────────────────── */}

            {/* Próximos Eventos */}
            <TabsContent value="proximos" className="space-y-4">
              {eventosProximos.map((evento) => (
                <Card key={evento.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {/* ▼▼▼ CORREÇÃO 2: USAR 'evento.is_completed' ▼▼▼ */}
                          {getStatusIcon(evento.is_completed)}
                          <h3 className="text-lg font-semibold dark:text-slate-100">{evento.title}</h3>
                          {getTipoBadge(evento.type)}
                          {getPrioridadeBadge(evento.priority)}
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 mb-3">{evento.description}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600 dark:text-slate-400">Data</p>
                            {/* ▼▼▼ CORREÇÃO 2: USAR 'evento.date' ▼▼▼ */}
                            <p>{formatarData(evento.date)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600 dark:text-slate-400">Horário</p>
                            {/* ▼▼▼ CORREÇÃO 2: USAR 'evento.time' ▼▼▼ */}
                            <p>{evento.time}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600 dark:text-slate-400">Categoria</p>
                            <p>{evento.category}</p>
                          </div>
                          {/* ▼▼▼ CORREÇÃO 2: USAR 'evento.value' ▼▼▼ */}
                          {evento.value && (
                            <div>
                              <p className="font-medium text-gray-600 dark:text-slate-400">Valor</p>
                              <p className={`font-bold dark:text-slate-200 ${evento.type === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {evento.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
   <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => marcarConcluido(evento.id)}
  >
    <CheckCircle className="h-4 w-4 mr-1" />
    Concluir
  </Button>
  {/* ▼▼▼ ADICIONE O ONCLICK AQUI ▼▼▼ */}
  <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(evento)}>
    <Edit className="h-4 w-4" />
  </Button>
  <Button 
    variant="outline" 
    size="sm"
    onClick={() => excluirEvento(evento.id)}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {eventosProximos.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-500">Nenhum evento próximo</p>
                </div>
              )}
            </TabsContent>

            {/* Eventos de Hoje */}
<TabsContent value="hoje" className="space-y-4">
  {eventosHoje.map((evento) => (
    <Card key={evento.id} className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusIcon(evento.is_completed)}
              <h3 className="text-lg font-semibold dark:text-slate-100">{evento.title}</h3>
              {getTipoBadge(evento.type)}
              <Badge className="bg-blue-100 text-blue-800">Hoje</Badge>
            </div>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{evento.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Horário</p>
                <p className="font-bold dark:text-slate-200">{evento.time}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Categoria</p>
                <p>{evento.category}</p>
              </div>
              {evento.value && (
                <div>
                  <p className="font-medium text-gray-600 dark:text-slate-400">Valor</p>
                  <p className={`font-bold dark:text-slate-200 ${evento.type === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {evento.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <Button variant="outline" size="sm" onClick={() => marcarConcluido(evento.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />Concluir
            </Button>
            <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(evento)}><Edit className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => excluirEvento(evento.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
  {eventosHoje.length === 0 && (
    <div className="text-center py-8">
      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-500">Nenhum evento para hoje</p>
    </div>
  )}
</TabsContent>

            {/* Eventos Concluídos */}
<TabsContent value="concluidos" className="space-y-4">
  {eventosConcluidos.map((evento) => (
    <Card key={evento.id} className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold line-through text-gray-500 dark:text-gray-500">{evento.title}</h3>
              {getTipoBadge(evento.type)}
              <Badge className="bg-green-100 text-green-800">Concluído</Badge>
            </div>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{evento.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Data</p>
                <p>{formatarData(evento.date)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Horário</p>
                <p>{evento.time}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Categoria</p>
                <p>{evento.category}</p>
              </div>
              {evento.value && (
                <div>
                  <p className="font-medium text-gray-600 dark:text-slate-400">Valor</p>
                  <p className={`font-bold dark:text-slate-200 ${evento.type === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {evento.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
             <Button variant="outline" size="sm" onClick={() => excluirEvento(evento.id)}>
                <Trash2 className="h-4 w-4" />
             </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
  {eventosConcluidos.length === 0 && (
    <div className="text-center py-8">
      <p className="text-gray-500 dark:text-gray-500">Nenhum evento concluído</p>
    </div>
  )}
</TabsContent>

            {/* Eventos Atrasados */}
<TabsContent value="atrasados" className="space-y-4">
  {eventosAtrasados.map((evento) => (
    <Card key={evento.id} className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold dark:text-slate-100">{evento.title}</h3>
              {getTipoBadge(evento.type)}
              <Badge className="bg-red-100 text-red-800">Atrasado</Badge>
            </div>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{evento.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Data</p>
                <p className="text-red-600 font-medium">{formatarData(evento.date)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Horário</p>
                <p>{evento.time}</p>
              </div>
              <div>
                <p className="font-medium text-gray-600 dark:text-slate-400">Categoria</p>
                <p>{evento.category}</p>
              </div>
              {evento.value && (
                <div>
                  <p className="font-medium text-gray-600 dark:text-slate-400">Valor</p>
                  <p className={`font-bold dark:text-slate-200 ${evento.type === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {evento.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
            <Button variant="outline" size="sm" onClick={() => marcarConcluido(evento.id)}>
              <CheckCircle className="h-4 w-4 mr-1" />Concluir
            </Button>
            <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(evento)}><Edit className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => excluirEvento(evento.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
  {eventosAtrasados.length === 0 && (
    <div className="text-center py-8">
      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-500">Nenhum evento atrasado! 🎉</p>
    </div>
  )}
</TabsContent>
          </Tabs>
          {/* ▼▼▼ ADICIONE O NOVO MODAL DE EDIÇÃO AQUI ▼▼▼ */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Evento da Agenda</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateEvent} className="space-y-4">
                {/* O formulário é praticamente idêntico ao de criação, mas usa 'editFormData' */}
                <div>
                  <Label htmlFor="edit-title">Título do Evento *</Label>
                  <Input id="edit-title" value={editFormData.title} onChange={(e) => handleEditInputChange('title', e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea id="edit-description" value={editFormData.description} onChange={(e) => handleEditInputChange('description', e.target.value)} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-event_date">Data *</Label>
                    <Input id="edit-event_date" type="date" value={editFormData.event_date} onChange={(e) => handleEditInputChange('event_date', e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="edit-event_time">Horário</Label>
                    <Input id="edit-event_time" type="time" value={editFormData.event_time} onChange={(e) => handleEditInputChange('event_time', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-type">Tipo *</Label>
                    <Select value={editFormData.type} onValueChange={(value) => handleEditInputChange('type', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pagamento">Pagamento</SelectItem>
                        <SelectItem value="recebimento">Recebimento</SelectItem>
                        <SelectItem value="vencimento">Vencimento</SelectItem>
                        <SelectItem value="reuniao">Reunião</SelectItem>
                        <SelectItem value="tarefa">Tarefa</SelectItem>
                        <SelectItem value="lembrete">Lembrete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-priority">Prioridade</Label>
                    <Select value={editFormData.priority} onValueChange={(value) => handleEditInputChange('priority', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="média">Média</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-amount">Valor (R$)</Label>
                    <Input id="edit-amount" type="number" step="0.01" value={editFormData.amount} onChange={(e) => handleEditInputChange('amount', e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select value={editFormData.category} onValueChange={(value) => handleEditInputChange('category', value)}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="Moradia">Moradia</SelectItem>
                        <SelectItem value="Investimentos">Investimentos</SelectItem>
                        <SelectItem value="Consultoria">Consultoria</SelectItem>
                        <SelectItem value="Planejamento">Planejamento</SelectItem>
                        <SelectItem value="Saúde">Saúde</SelectItem>
                        <SelectItem value="Educação">Educação</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          {/* ▲▲▲ FIM DO NOVO MODAL DE EDIÇÃO ▲▲▲ */}

          {/* ── MODAL DE DETALHE DO EVENTO (CALENDÁRIO) ─────────────────── */}
          <Dialog open={!!selectedCalendarEvent} onOpenChange={(open) => { if (!open) setSelectedCalendarEvent(null); }}>
            <DialogContent className="sm:max-w-[460px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  {selectedCalendarEvent && getTipoBadge(selectedCalendarEvent.type)}
                  <span className="text-base font-bold dark:text-slate-100">
                    {selectedCalendarEvent?.title}
                  </span>
                </DialogTitle>
              </DialogHeader>

              {selectedCalendarEvent && (
                <div className="space-y-4">
                  {/* Status + Prioridade */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusIcon(selectedCalendarEvent.is_completed)}
                    <span className="text-sm text-gray-600 dark:text-slate-400">
                      {selectedCalendarEvent.is_completed ? 'Concluído' : 'Pendente'}
                    </span>
                    {getPrioridadeBadge(selectedCalendarEvent.priority)}
                  </div>

                  {/* Descrição */}
                  {selectedCalendarEvent.description && (
                    <p className="text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                      {selectedCalendarEvent.description}
                    </p>
                  )}

                  {/* Grid de informações */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Data</p>
                      <p className="font-semibold dark:text-slate-200">{formatarData(selectedCalendarEvent.date)}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Horário</p>
                      <p className="font-semibold dark:text-slate-200">{selectedCalendarEvent.time || '—'}</p>
                    </div>
                    {selectedCalendarEvent.category && (
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Categoria</p>
                        <p className="font-semibold dark:text-slate-200">{selectedCalendarEvent.category}</p>
                      </div>
                    )}
                    {selectedCalendarEvent.value && (
                      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Valor</p>
                        <p className={`font-bold text-base ${selectedCalendarEvent.type === 'recebimento' ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {selectedCalendarEvent.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                    {!selectedCalendarEvent.is_completed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { marcarConcluido(selectedCalendarEvent.id); setSelectedCalendarEvent(null); }}
                        className="text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Concluir
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { abrirModalEdicao(selectedCalendarEvent); setSelectedCalendarEvent(null); }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { excluirEvento(selectedCalendarEvent.id); setSelectedCalendarEvent(null); }}
                      className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          {/* ── FIM MODAL DE DETALHE DO EVENTO ───────────────────────────── */}
        </div>
    </div>
  );
};

export default Schedule;

