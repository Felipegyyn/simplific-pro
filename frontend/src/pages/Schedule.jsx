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
  ChevronLeft, ChevronRight, ListTodo, StickyNote, Tag
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado useLocation
import { cn } from "@/lib/utils";
import  apiService  from '../services/api';
import logo from '../assets/LOGO.png';
import styles from './Schedule.module.css';

const Schedule = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const location = useLocation(); // Hook para ler a URL
  const [isSyncing, setIsSyncing] = useState(false); // Estado de loading do botão

  // Estados para o Bloco de Notas / Gestor de Tarefas
  const [localTasks, setLocalTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isTaskLoading, setIsTaskLoading] = useState(false);

  // Estados puramente de UI para o calendário visual
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedCalendarEvent, setSelectedCalendarEvent] = useState(null);
  
  // Estados para eventos e modal
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Lógica do Bloco de Notas (LocalStorage) ---
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`simplific_tasks_${user.id}`);
      if (saved) setLocalTasks(JSON.parse(saved));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`simplific_tasks_${user.id}`, JSON.stringify(localTasks));
    }
  }, [localTasks, user?.id]);

  const handleQuickAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    if (newTaskDate) {
      try {
        setIsTaskLoading(true);
        await apiService.post('/api/schedule', {
          title: newTaskText,
          event_date: newTaskDate,
          type: 'tarefa',
          priority: 'média',
          description: 'Tarefa criada via Bloco de Notas'
        });
        await loadEventos();
        setNewTaskText('');
        setNewTaskDate('');
      } catch (error) {
        console.error("Erro ao sincronizar tarefa:", error);
      } finally {
        setIsTaskLoading(false);
      }
    } else {
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        completed: false,
        created_at: new Date().toISOString()
      };
      setLocalTasks([newTask, ...localTasks]);
      setNewTaskText('');
    }
  };

  const toggleLocalTask = (id) => {
    setLocalTasks(localTasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteLocalTask = (id) => {
    setLocalTasks(localTasks.filter(t => t.id !== id));
  };

  // --- Função para unificar tarefas locais e da agenda ---
  const getUnifiedTasks = () => {
    // 1. Pegamos as tarefas locais (sem data)
    const local = localTasks.map(t => ({ ...t, source: 'local' }));
    
    // 2. Pegamos as tarefas da agenda (da API) que são do tipo 'tarefa'
    const fromAgenda = eventos
      .filter(e => e.type === 'tarefa')
      .map(e => ({
        id: e.id,
        text: e.title,
        completed: e.is_completed,
        date: e.date,
        source: 'api',
        priority: e.priority
      }));

    // Retorna tudo unificado, priorizando as não concluídas no topo
    return [...local, ...fromAgenda].sort((a, b) => {
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  };

  const promoteToAgenda = async (task) => {
    const date = prompt("Para qual data deseja agendar? (AAAA-MM-DD)", new Date().toISOString().split('T')[0]);
    if (date) {
      try {
        setIsTaskLoading(true);
        await apiService.post('/api/schedule', {
          title: task.text,
          event_date: date,
          type: 'tarefa',
          priority: 'média'
        });
        deleteLocalTask(task.id);
        await loadEventos();
      } catch (error) {
        alert("Erro ao agendar tarefa.");
      } finally {
        setIsTaskLoading(false);
      }
    }
  };
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
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>
            Agenda Financeira
          </h1>
          <p className={styles.pageSubtitle}>Organize seus compromissos e lembretes financeiros.</p>
        </div>
      </div>

      {/* Card de Resumo Agrupado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className={styles.premiumCard}>
          <div className={styles.cardContent + " relative"}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/20">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Próximos Eventos</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{eventosProximos.length}</h3>
          </div>
        </div>

        <div className={styles.premiumCard}>
          <div className={styles.cardContent + " relative"}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/20">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Hoje</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{eventosHoje.length}</h3>
          </div>
        </div>

        <div className={styles.premiumCard}>
          <div className={styles.cardContent + " relative"}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-red-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/20">
              <DollarSign className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Pagamentos Pendentes</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
            R$ {pagamentosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
          </div>
        </div>

        <div className={styles.premiumCard}>
          <div className={styles.cardContent + " relative"}>
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/20">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Atrasados</p>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{eventosAtrasados.length}</h3>
          </div>
        </div>
      </div>
      
      {/* Estrutura Principal: Agenda + Bloco de Notas Lateral */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* COLUNA ESQUERDA: Agenda Financeira Principal (3/4) */}
        <div className="xl:col-span-3 space-y-6">
          <Tabs defaultValue="calendario" className="space-y-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <TabsList className="grid w-full xl:w-auto grid-cols-5 glass-panel p-1 border-white/5">
            <TabsTrigger value="calendario" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Calendário</TabsTrigger>
            <TabsTrigger value="proximos" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Próximos</TabsTrigger>
            <TabsTrigger value="hoje" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Hoje</TabsTrigger>
            <TabsTrigger value="concluidos" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Concluídos</TabsTrigger>
            <TabsTrigger value="atrasados" className="data-[state=active]:bg-white/10 data-[state=active]:text-white">Atrasados</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-wrap gap-2 w-full xl:w-auto justify-end">
            <Button 
                variant="outline" 
                onClick={handleGoogleConnect} 
                disabled={isSyncing}
                className="glass-panel border-white/10 hover:bg-white/5 text-slate-300"
            >
                <Globe className="h-4 w-4 mr-2 text-cyan-400" />
                Google
            </Button>

            <Button 
                variant="outline" 
                onClick={handleAppleSync}
                className="glass-panel border-white/10 hover:bg-white/5 text-slate-300"
            >
                <Smartphone className="h-4 w-4 mr-2 text-cyan-400" />
                Apple
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Novo Evento da Agenda</DialogTitle></DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-300">Título do Evento *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: Pagamento Cartão, Reunião..."
                      className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-slate-300">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descreva o evento..."
                      className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date" className="text-slate-300">Data *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => handleInputChange('event_date', e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="event_time" className="text-slate-300">Horário</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={formData.event_time}
                        onChange={(e) => handleInputChange('event_time', e.target.value)}
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type" className="text-slate-300">Tipo *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 focus:border-cyan-500/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-white/10">
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
                      <Label htmlFor="priority" className="text-slate-300">Prioridade</Label>
                      <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 focus:border-cyan-500/50">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount" className="text-slate-300">Valor (R$)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => handleInputChange('amount', e.target.value)}
                        placeholder="Opcional"
                        className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-slate-300">Categoria</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 focus:border-cyan-500/50">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-white/10">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="is_recurring" className="text-slate-300">Evento Recorrente?</Label>
                      <Select value={formData.is_recurring} onValueChange={(value) => handleInputChange('is_recurring', value)}>
                        <SelectTrigger className="bg-white/5 border-white/10 focus:border-cyan-500/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-white/10">
                          <SelectItem value="nao">Não</SelectItem>
                          <SelectItem value="sim">Sim (Mensal)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.is_recurring === 'sim' && (
                      <div>
                        <Label htmlFor="recurrence_count" className="text-slate-300">Duração (Meses)</Label>
                        <Input
                          id="recurrence_count"
                          type="number"
                          min="2"
                          max="120"
                          value={formData.recurrence_count}
                          onChange={(e) => handleInputChange('recurrence_count', e.target.value)}
                          placeholder="Ex: 2"
                          className="bg-white/5 border-white/10 focus:border-cyan-500/50"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      Criar Evento
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── CALENDÁRIO MENSAL ─────────────────────────────────────────── */}
        <TabsContent value="calendario">
          <div className="glass-panel p-4 sm:p-6 border-white/5">
            {/* Navegação do mês */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navegarMes(-1)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-bold text-white">
                {mesesPtBR[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <button
                onClick={() => navegarMes(1)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 mb-2">
              {diasSemana.map(dia => (
                <div
                  key={dia}
                  className="text-center text-xs font-semibold text-slate-500 py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Grid dos dias */}
            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
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
                      'bg-slate-900/40 min-h-[80px] p-1.5 flex flex-col cursor-pointer backdrop-blur-sm',
                      'hover:bg-white/5 transition-colors',
                      isSelected ? 'ring-2 ring-inset ring-cyan-500/50 bg-cyan-500/5' : '',
                      !day ? 'bg-black/20 cursor-default pointer-events-none' : '',
                    ].join(' ')}
                  >
                    {day && (
                      <>
                        {/* Número do dia */}
                        <span className={[
                          'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 self-end',
                          isToday
                            ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-900/40'
                            : 'text-slate-300',
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
                                'text-[10px] leading-tight px-1.5 py-0.5 rounded text-white truncate cursor-pointer shadow-sm',
                                'hover:opacity-80 hover:scale-[1.02] transition-all',
                                evento.is_completed
                                  ? 'bg-slate-700/50 text-slate-500 line-through'
                                  : (tipoCorCalendario[evento.type] || 'bg-slate-500'),
                              ].join(' ')}
                              title={evento.title}
                            >
                              {evento.title}
                            </span>
                          ))}
                          {eventosNoDia.length > 3 && (
                            <span className="text-[10px] text-slate-500 pl-1 mt-0.5">
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
            <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-white/5">
              {Object.entries({ pagamento: 'Pagamento', recebimento: 'Recebimento', reuniao: 'Reunião', vencimento: 'Vencimento', tarefa: 'Tarefa' }).map(([tipo, label]) => (
                <div key={tipo} className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${tipoCorCalendario[tipo]}`} />
                  <span className="text-xs text-slate-400">{label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 shadow-sm" />
                <span className="text-xs text-slate-400">Concluído</span>
              </div>
            </div>
          </div>

          {/* Painel de detalhe do dia selecionado */}
          {selectedDay && (
            <div className="glass-panel p-6 border-white/5 mt-4 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {String(selectedDay.getDate()).padStart(2,'0')}/{String(selectedDay.getMonth()+1).padStart(2,'0')}/{selectedDay.getFullYear()}
                    </h3>
                    <p className="text-xs text-slate-400">{(eventosPorData[toDateKey(selectedDay)] || []).length} evento(s) programado(s)</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {(eventosPorData[toDateKey(selectedDay)] || []).length === 0 ? (
                  <div className="text-center py-8 bg-white/2 rounded-xl border border-dashed border-white/10">
                    <p className="text-sm text-slate-500 italic">
                      Nenhum evento neste dia.
                    </p>
                  </div>
                ) : (
                  (eventosPorData[toDateKey(selectedDay)] || []).map(evento => (
                    <div
                      key={evento.id}
                      className="group flex items-start justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {getStatusIcon(evento.is_completed)}
                          <span className={cn("font-medium text-sm text-white", evento.is_completed && "line-through text-slate-500")}>
                            {evento.title}
                          </span>
                          {getTipoBadge(evento.type)}
                          {getPrioridadeBadge(evento.priority)}
                        </div>
                        {evento.description && (
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{evento.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                          {evento.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{evento.time}</span>}
                          {evento.category && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{evento.category}</span>}
                          {evento.value && (
                            <span className={cn("font-bold text-xs", evento.type === 'recebimento' ? 'text-emerald-400' : 'text-red-400')}>
                              R$ {evento.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!evento.is_completed && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10" onClick={() => marcarConcluido(evento.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-400 hover:bg-cyan-500/10" onClick={() => abrirModalEdicao(evento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-500/10" onClick={() => excluirEvento(evento.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </TabsContent>
        {/* ── FIM CALENDÁRIO MENSAL ─────────────────────────────────────── */}

        {/* Listas de Eventos (Próximos, Hoje, etc) */}
        {['proximos', 'hoje', 'concluidos', 'atrasados'].map((tab) => {
          const tabEventos = {
            proximos: eventosProximos,
            hoje: eventosHoje,
            concluidos: eventosConcluidos,
            atrasados: eventosAtrasados
          }[tab];

          const tabConfig = {
            proximos: { icon: Calendar, label: 'Próximos', empty: 'Nenhum evento próximo', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            hoje: { icon: Clock, label: 'Hoje', empty: 'Nenhum evento para hoje', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            concluidos: { icon: CheckCircle, label: 'Concluídos', empty: 'Nenhum evento concluído', color: 'text-slate-400', bg: 'bg-slate-500/10' },
            atrasados: { icon: AlertTriangle, label: 'Atrasados', empty: 'Nenhum evento atrasado! 🎉', color: 'text-red-400', bg: 'bg-red-500/10' }
          }[tab];

          return (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {tabEventos.map((evento) => (
                <div key={evento.id} className="glass-card p-6 border-white/10 group relative overflow-hidden">
                  <div className={cn("absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-40", tabConfig.bg.replace('/10', '/30'))}></div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(evento.is_completed)}
                        <h3 className={cn("text-lg font-bold text-white", evento.is_completed && "line-through text-slate-500")}>
                          {evento.title}
                        </h3>
                        {getTipoBadge(evento.type)}
                        {getPrioridadeBadge(evento.priority)}
                        {tab === 'hoje' && <Badge className="bg-emerald-500 text-white border-none shadow-lg shadow-emerald-900/40">Hoje</Badge>}
                        {tab === 'atrasados' && <Badge className="bg-red-500 text-white border-none shadow-lg shadow-red-900/40">Atrasado</Badge>}
                      </div>
                      
                      {evento.description && (
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 max-w-2xl">{evento.description}</p>
                      )}
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data</p>
                          <p className={cn("text-sm font-semibold text-slate-200", tab === 'atrasados' && "text-red-400")}>{formatarData(evento.date)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Horário</p>
                          <p className="text-sm font-semibold text-slate-200">{evento.time || '—'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoria</p>
                          <p className="text-sm font-semibold text-slate-200">{evento.category || '—'}</p>
                        </div>
                        {evento.value && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor</p>
                            <p className={cn("text-sm font-bold", evento.type === 'recebimento' ? 'text-emerald-400' : 'text-red-400')}>
                              R$ {evento.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2 shrink-0">
                      {!evento.is_completed && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="glass-panel border-white/10 hover:bg-emerald-500/10 text-emerald-400"
                          onClick={() => marcarConcluido(evento.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Concluir
                        </Button>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="glass-panel border-white/10 hover:bg-cyan-500/10 text-cyan-400 flex-1" onClick={() => abrirModalEdicao(evento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="glass-panel border-white/10 hover:bg-red-500/10 text-red-400 flex-1"
                          onClick={() => excluirEvento(evento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {tabEventos.length === 0 && (
                <div className="glass-panel py-16 text-center border-white/5 border-dashed">
                  <tabConfig.icon className="h-12 w-12 text-slate-700 mx-auto mb-4 opacity-20" />
                  <p className="text-slate-500 italic">{tabConfig.empty}</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
        </div>

        {/* COLUNA DIREITA: Bloco de Notas / Gestor de Tarefas (1/4) */}
        <div className="xl:col-span-1 space-y-4">
          <Card className="glass-panel border-white/10 bg-slate-900/40 backdrop-blur-md sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                <ListTodo className="h-5 w-5 text-cyan-400" />
                Bloco de Notas
              </CardTitle>
              <p className="text-xs text-slate-400">Anote tarefas rápidas ou rascunhos.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Input Rápido */}
              <form onSubmit={handleQuickAddTask} className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder="Nova tarefa..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="bg-white/5 border-white/10 pr-10 focus:ring-cyan-500/50"
                  />
                  <button 
                    type="submit" 
                    disabled={isTaskLoading || !newTaskText.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-cyan-400 hover:text-cyan-300 disabled:opacity-50"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="bg-white/5 border-white/10 text-xs h-8"
                  />
                  <span className="text-[10px] text-slate-500 italic">Opcional</span>
                </div>
              </form>

              {/* Lista de Tarefas Unificada (Local + Agenda) */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                {getUnifiedTasks().length === 0 && (
                  <div className="text-center py-8 opacity-40">
                    <StickyNote className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs">Nenhuma nota ou tarefa.</p>
                  </div>
                )}
                
                {getUnifiedTasks().map(task => (
                  <div 
                    key={`${task.source}-${task.id}`} 
                    className={cn(
                      "group relative flex flex-col p-3 rounded-lg transition-all border-l-4 shadow-sm",
                      task.source === 'api' 
                        ? "bg-cyan-500/5 border-cyan-500/50 hover:bg-cyan-500/10" 
                        : "bg-yellow-500/5 border-yellow-500/50 hover:bg-yellow-500/10",
                      task.completed && "opacity-50 grayscale-[0.5]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <button 
                        onClick={() => task.source === 'local' ? toggleLocalTask(task.id) : marcarConcluido(task.id)}
                        className={cn(
                          "mt-0.5 rounded-full border border-white/20 p-0.5 transition-colors shrink-0",
                          task.completed ? "bg-emerald-500 border-emerald-500" : "hover:border-emerald-500/50"
                        )}
                      >
                        <CheckCircle className={cn("h-3 w-3", task.completed ? "text-white" : "text-transparent")} />
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium text-slate-100 leading-tight break-words",
                          task.completed && "line-through text-slate-400"
                        )}>
                          {task.text}
                        </p>
                        
                        {/* Tags de Contexto */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                            task.source === 'api' ? "bg-cyan-500/20 text-cyan-400" : "bg-yellow-500/20 text-yellow-400"
                          )}>
                            {task.source === 'api' ? 'Agenda' : 'Nota'}
                          </span>
                          
                          {task.date && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatarData(task.date)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações Rápidas (Hover) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.source === 'local' && (
                        <button 
                          onClick={() => promoteToAgenda(task)}
                          title="Transformar em Compromisso"
                          className="p-1 text-slate-400 hover:text-cyan-400"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button 
                        onClick={() => task.source === 'local' ? deleteLocalTask(task.id) : excluirEvento(task.id)}
                        className="p-1 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Evento da Agenda</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateEvent} className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-slate-300">Título do Evento *</Label>
              <Input id="edit-title" value={editFormData.title} onChange={(e) => handleEditInputChange('title', e.target.value)} className="bg-white/5 border-white/10" required />
            </div>
            <div>
              <Label htmlFor="edit-description" className="text-slate-300">Descrição</Label>
              <Textarea id="edit-description" value={editFormData.description} onChange={(e) => handleEditInputChange('description', e.target.value)} className="bg-white/5 border-white/10" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-event_date" className="text-slate-300">Data *</Label>
                <Input id="edit-event_date" type="date" value={editFormData.event_date} onChange={(e) => handleEditInputChange('event_date', e.target.value)} className="bg-white/5 border-white/10" required />
              </div>
              <div>
                <Label htmlFor="edit-event_time" className="text-slate-300">Horário</Label>
                <Input id="edit-event_time" type="time" value={editFormData.event_time} onChange={(e) => handleEditInputChange('event_time', e.target.value)} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-type" className="text-slate-300">Tipo *</Label>
                <Select value={editFormData.type} onValueChange={(value) => handleEditInputChange('type', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
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
                <Label htmlFor="edit-priority" className="text-slate-300">Prioridade</Label>
                <Select value={editFormData.priority} onValueChange={(value) => handleEditInputChange('priority', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="média">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-amount" className="text-slate-300">Valor (R$)</Label>
                <Input id="edit-amount" type="number" step="0.01" value={editFormData.amount} onChange={(e) => handleEditInputChange('amount', e.target.value)} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <Label htmlFor="edit-category" className="text-slate-300">Categoria</Label>
                <Select value={editFormData.category} onValueChange={(value) => handleEditInputChange('category', value)}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
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
              <Button type="button" variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
              <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Salvar Alterações</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DE DETALHE DO EVENTO (CALENDÁRIO) */}
      <Dialog open={!!selectedCalendarEvent} onOpenChange={(open) => { if (!open) setSelectedCalendarEvent(null); }}>
        <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              {selectedCalendarEvent && getTipoBadge(selectedCalendarEvent.type)}
              <span className="text-base font-bold text-white">
                {selectedCalendarEvent?.title}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedCalendarEvent && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {getStatusIcon(selectedCalendarEvent.is_completed)}
                <span className="text-sm font-medium text-slate-300">
                  {selectedCalendarEvent.is_completed ? 'Concluído' : 'Pendente'}
                </span>
                {getPrioridadeBadge(selectedCalendarEvent.priority)}
              </div>

              {selectedCalendarEvent.description && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <p className="text-sm text-slate-400 italic">
                    {selectedCalendarEvent.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Data</p>
                  <p className="font-semibold text-white">{formatarData(selectedCalendarEvent.date)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Horário</p>
                  <p className="font-semibold text-white">{selectedCalendarEvent.time || '—'}</p>
                </div>
                {selectedCalendarEvent.category && (
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Categoria</p>
                    <p className="font-semibold text-white">{selectedCalendarEvent.category}</p>
                  </div>
                )}
                {selectedCalendarEvent.value && (
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Valor</p>
                    <p className={cn("font-bold text-base", selectedCalendarEvent.type === 'recebimento' ? 'text-emerald-400' : 'text-red-400')}>
                      R$ {selectedCalendarEvent.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                {!selectedCalendarEvent.is_completed && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { marcarConcluido(selectedCalendarEvent.id); setSelectedCalendarEvent(null); }}
                    className="glass-panel border-white/10 hover:bg-emerald-500/10 text-emerald-400"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-panel border-white/10 hover:bg-cyan-500/10 text-cyan-400"
                  onClick={() => { abrirModalEdicao(selectedCalendarEvent); setSelectedCalendarEvent(null); }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { excluirEvento(selectedCalendarEvent.id); setSelectedCalendarEvent(null); }}
                  className="glass-panel border-white/10 hover:bg-red-500/10 text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;

