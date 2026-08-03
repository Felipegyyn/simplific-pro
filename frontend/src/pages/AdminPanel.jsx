import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, Plus, Edit, Trash2, Eye,
  UserCheck, UserX, LogOut, ArrowLeft,
  Settings, Shield, Bell, Database, Activity, Calendar
} from 'lucide-react';
import apiService from '../services/api'; // Certifique-se que o apiService está correto
import logo from '../assets/LOGO.png';
import styles from './AdminPanel.module.css';

const AdminPanel = ({ user, onLogout }) => {
  const navigate = useNavigate();
  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [novoUsuario, setNovoUsuario] = useState({
    name: '',
    email: '',
    whatsapp: '',
    profile: '',
    password: ''
  });

// ▼▼▼ ADICIONE ESTE BLOCO DE CÓDIGO AQUI ▼▼▼
  const [configuracoes, setConfiguracoes] = useState({
    nome_sistema: 'Simplific Pro',
    versao: '1.0.0',
    manutencao: false,
    backup_automatico: true,
    notificacoes_email: true,
    limite_usuarios: 1000,
    sessao_timeout: 60,
    log_nivel: 'info'
  });
  // ▲▲▲ FIM DO BLOCO ▲▲▲

  const salvarConfiguracoes = () => {
    // No futuro, isso chamará a API. Por enquanto, só exibe um alerta.
    alert('Configurações salvas com sucesso!');
  };

  const alterarModoManutencao = () => {
    setConfiguracoes(prev => ({
      ...prev,
      manutencao: !prev.manutencao
    }));
  };

  const alterarBackupAutomatico = () => {
    setConfiguracoes(prev => ({
      ...prev,
      backup_automatico: !prev.backup_automatico
    }));
  };
  // ▲▲▲ FIM DO BLOCO ▲▲▲


  // Carrega os usuários do backend quando o componente monta
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/api/admin/users');
      setUsuarios(response || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      alert("Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNovoUsuario(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setNovoUsuario(prev => ({ ...prev, profile: value }));
  };

  // Função que chama a API para criar o usuário
  const criarUsuario = async () => {
    if (!novoUsuario.name || !novoUsuario.email || !novoUsuario.profile || !novoUsuario.password) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await apiService.post('/api/admin/users', novoUsuario);
      alert('Usuário criado com sucesso!');
      setIsModalOpen(false); // Fecha o modal
      setNovoUsuario({ name: '', email: '', whatsapp: '', profile: '', password: '' }); // Limpa o formulário
      fetchUsers(); // Atualiza a lista de usuários na tela
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      alert(`Erro ao criar usuário: ${error.response?.data?.error || 'Tente novamente.'}`);
    }
  };
  
 // Dentro do AdminPanel.jsx

  // ▼▼▼ COLE ESTA NOVA FUNÇÃO AQUI ▼▼▼
  const toggleUserStatus = async (usuario) => {
    // Determina qual será o novo status e a mensagem de confirmação
    const newStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
    const actionText = newStatus === 'ativo' ? 'reativar' : 'inativar';

    if (confirm(`Tem certeza que deseja ${actionText} o usuário ${usuario.name}?`)) {
      try {
        // Chama a nova rota da API que criamos no backend
        await apiService.put(`/api/admin/users/${usuario.id}/status`, {
          status: newStatus
        });
        alert(`Usuário ${actionText} com sucesso!`);
        fetchUsers(); // Atualiza a lista para refletir a mudança
      } catch (error) {
        console.error(`Erro ao ${actionText} usuário:`, error);
        alert(`Erro ao ${actionText} usuário: ${error.response?.data?.error || 'Tente novamente.'}`);
      }
    }
  };

  const getPerfilBadge = (perfil) => {
    const colors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      usuario: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
    };
    return <Badge className={colors[perfil] || 'bg-gray-100 text-gray-800'}>{perfil}</Badge>;
  };

// ▼▼▼ ADICIONE ESTA FUNÇÃO AQUI ▼▼▼
  const getStatusBadge = (status) => {
    const isActive = status === 'ativo';
    const colors = isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    return <Badge className={colors}>{isActive ? 'Ativo' : 'Inativo'}</Badge>;
  };
  // ▲▲▲ FIM DA FUNÇÃO ▲▲▲

  const formatarData = (dataString) => {
    if (!dataString) return 'Nunca';
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

// ▼▼▼ COLE O BLOCO DE CÓDIGO EXATAMENTE AQUI ▼▼▼
  const totalUsuarios = usuarios.length;
  const usuariosAtivos = usuarios.filter(u => u.status === 'ativo').length;
  
  const loginsHoje = usuarios.filter(u => {
    if (!u.last_login) return false;
    const hoje = new Date().toISOString().split('T')[0];
    return u.last_login.startsWith(hoje);
  }).length;

  const novosUsuariosMes = usuarios.filter(u => {
    if (!u.created_at) return false;
    const mesAtual = new Date().toISOString().slice(0, 7);
    return u.created_at.startsWith(mesAtual);
  }).length;
// ▲▲▲ FIM DO BLOCO ▲▲▲


  return (
    <div className={styles.pageContainer + " p-4 sm:p-6"}>
      {/* Cabeçalho */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.pageTitle}>Visão Geral</h2>
          <p className={styles.pageSubtitle}>Estatísticas principais do sistema</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-4 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <span className="text-sm text-slate-500 dark:text-slate-400">Bem-vindo, {user.name}</span>
          <Button variant="outline" size="sm" onClick={onLogout} className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className={styles.premiumCard}>
          <div className={styles.cardContent}>
            <div className="flex items-center">
              <div className="flex-shrink-0"><Users className="h-8 w-8 text-cyan-600 dark:text-cyan-400" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{totalUsuarios}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.premiumCard}>
          <div className={styles.cardContent}>
            <div className="flex items-center">
              <div className="flex-shrink-0"><UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Usuários Ativos</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{usuariosAtivos}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.premiumCard}>
          <div className={styles.cardContent}>
            <div className="flex items-center">
              <div className="flex-shrink-0"><Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Logins Hoje</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{loginsHoje}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.premiumCard}>
          <div className={styles.cardContent}>
            <div className="flex items-center">
              <div className="flex-shrink-0"><Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Novos no Mês</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{novosUsuariosMes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1">
        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10 p-0 h-auto rounded-none w-full justify-start overflow-x-auto">
            <TabsTrigger value="usuarios" className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400">Gerenciar Usuários</TabsTrigger>
            <TabsTrigger value="configuracoes" className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-600 dark:data-[state=active]:text-cyan-400">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold dark:text-slate-100">Usuários do Sistema</h3>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20">
                    <Plus className="h-4 w-4 mr-2" /> Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                  <DialogHeader>
                    <DialogTitle className="text-slate-800 dark:text-white">Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input id="name" placeholder="Digite o nome completo" value={novoUsuario.name} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="usuario@email.com" value={novoUsuario.email} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">Nº do WhatsApp (Obrigatório)</Label>
                      <Input id="whatsapp" placeholder="Ex: 5562999998888" value={novoUsuario.whatsapp} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile">Perfil</Label>
                      <Select value={novoUsuario.profile} onValueChange={handleSelectChange}>
                        <SelectTrigger className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10"><SelectValue placeholder="Selecione o perfil" /></SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="usuario">Usuário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Senha Temporária</Label>
                      <Input id="password" type="password" placeholder="Senha de primeiro acesso" value={novoUsuario.password} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button onClick={criarUsuario} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20">Salvar Usuário</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? <p>Carregando usuários...</p> : usuarios.map((u) => (
                <div key={u.id} className={styles.premiumCard}>
                  <div className={styles.cardContent}>
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100">{u.name}</h3>
                          {getPerfilBadge(u.profile)}
                          {getStatusBadge(u.status)}
                        </div>
                         <p className="text-slate-600 dark:text-slate-400 mb-3">{u.email}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-slate-500">Último Login</p>
                            <p className="text-slate-700 dark:text-slate-300">{formatarData(u.last_login)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-500">Data Criação</p>
                            <p className="text-slate-700 dark:text-slate-300">{formatarData(u.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 self-start sm:self-center mt-4 sm:mt-0 sm:ml-4">
                        {/* Botão inteligente para Ativar ou Inativar */}
                        {u.id !== user.id && ( // Impede que o admin se auto-inactive
                          u.status === 'ativo' ? (
                            <Button variant="outline" size="sm" title="Inativar Usuário" onClick={() => toggleUserStatus(u)} className="border-slate-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-900/20">
                              <UserX className="h-4 w-4 text-red-500" />
                          </Button>
                          ) : (
                            <Button variant="outline" size="sm" title="Ativar Usuário" onClick={() => toggleUserStatus(u)} className="border-slate-200 dark:border-white/10 hover:bg-green-50 dark:hover:bg-green-900/20">
                          <UserCheck className="h-4 w-4 text-green-500" />
                          </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
            {/* Configurações do Sistema */}
            <TabsContent value="configuracoes" className="space-y-6">
              <h3 className="text-lg font-semibold dark:text-slate-100">Configurações do Sistema</h3>

              <div className="grid gap-6">
                {/* Informações Gerais */}
                <div className={styles.premiumCard}>
                  <div className={styles.cardContent}>
                    <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-4">
                      <Settings className="h-5 w-5 mr-2 text-cyan-600 dark:text-cyan-400" />
                      Geral
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome_sistema" className="text-slate-600 dark:text-slate-400">Nome do Sistema</Label>
                        <Input id="nome_sistema" value={configuracoes.nome_sistema} readOnly className="bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10" />
                      </div>
                      <div>
                        <Label htmlFor="versao">Versão</Label>
                        <Input id="versao" value={configuracoes.versao} readOnly />
                      </div>
                      <div>
                        <Label htmlFor="limite_usuarios">Limite de Usuários</Label>
                        <Input id="limite_usuarios" type="number" value={configuracoes.limite_usuarios} />
                      </div>
                      <div>
                        <Label htmlFor="sessao_timeout">Timeout da Sessão (min)</Label>
                        <Input id="sessao_timeout" type="number" value={configuracoes.sessao_timeout} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Segurança */}
                <div className={styles.premiumCard}>
                  <div className={styles.cardContent}>
                    <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-4">
                      <Shield className="h-5 w-5 mr-2 text-red-500" />
                      Segurança
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">Modo Manutenção</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Bloqueia acesso de usuários não-admin</p>
                        </div>
                        <Button 
                          variant={configuracoes.manutencao ? "destructive" : "outline"}
                          onClick={alterarModoManutencao}
                          className={!configuracoes.manutencao ? "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5" : ""}
                        >
                          {configuracoes.manutencao ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">Backup Automático</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Backup diário dos dados</p>
                        </div>
                        <Button 
                          variant={configuracoes.backup_automatico ? "default" : "outline"}
                          onClick={alterarBackupAutomatico}
                          className={configuracoes.backup_automatico ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"}
                        >
                          {configuracoes.backup_automatico ? "Ativo" : "Inativo"}
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="log_nivel" className="text-slate-600 dark:text-slate-400">Nível de Log</Label>
                        <Select value={configuracoes.log_nivel}>
                          <SelectTrigger className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200">
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notificações */}
                <div className={styles.premiumCard}>
                  <div className={styles.cardContent}>
                    <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-4">
                      <Bell className="h-5 w-5 mr-2 text-yellow-500" />
                      Notificações
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">Notificações por Email</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">Enviar alertas importantes por email</p>
                        </div>
                        <Button variant={configuracoes.notificacoes_email ? "default" : "outline"} className={configuracoes.notificacoes_email ? "bg-cyan-600 hover:bg-cyan-700 text-white" : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"}>
                          {configuracoes.notificacoes_email ? "Ativo" : "Inativo"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Banco de Dados */}
                <div className={styles.premiumCard}>
                  <div className={styles.cardContent}>
                    <h4 className="flex items-center text-lg font-bold text-slate-800 dark:text-white mb-4">
                      <Database className="h-5 w-5 mr-2 text-indigo-500" />
                      Banco de Dados
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-emerald-50 rounded-xl dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-500/20">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">Conectado</p>
                      </div>
                     <div className="text-center p-4 bg-blue-50 rounded-xl dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/20">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tamanho</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">2.4 MB</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-xl dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/20">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Último Backup</p>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">Hoje</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-6">
                      <Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                        <Database className="h-4 w-4 mr-2" />
                        Fazer Backup
                      </Button>
                      <Button variant="outline" className="border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5">
                        <Activity className="h-4 w-4 mr-2" />
                        Ver Logs
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-white/10 mt-6">
                  <Button onClick={salvarConfiguracoes} className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20">Salvar Configurações</Button>
                </div>
              </div>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
