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
  
  // Funções de exclusão e edição (ajustar para chamar API no futuro)
  const excluirUsuario = async (usuario) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${usuario.name}?`)) {
      try {
        await apiService.delete(`/api/admin/users/${usuario.id}`);
        alert('Usuário excluído com sucesso!');
        fetchUsers();
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        alert(`Erro ao excluir usuário: ${error.response?.data?.error || 'Tente novamente.'}`);
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm border-b">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
            <h1 className="bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm border-b">Painel Administrativo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-300">Bem-vindo, {user.name}</span>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6">
        {/* ▼▼▼ ADICIONE O TÍTULO E OS CARDS AQUI ▼▼▼ */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Visão Geral</h2>
        <p className="text-gray-600 dark:text-gray-300">Estatísticas principais do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0"><Users className="h-8 w-8 text-blue-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Usuários</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalUsuarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0"><UserCheck className="h-8 w-8 text-green-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">{usuariosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0"><Activity className="h-8 w-8 text-purple-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Logins Hoje</p>
                <p className="text-2xl font-bold text-purple-600">{loginsHoje}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0"><Calendar className="h-8 w-8 text-orange-600" /></div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Novos no Mês</p>
                <p className="text-2xl font-bold text-orange-600">{novosUsuariosMes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        <Tabs defaultValue="usuarios" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usuarios">Gestão de Usuários</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Usuários do Sistema</h3>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
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
                        <SelectTrigger><SelectValue placeholder="Selecione o perfil" /></SelectTrigger>
                        <SelectContent>
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
                    <Button onClick={criarUsuario}>Salvar Usuário</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {loading ? <p>Carregando usuários...</p> : usuarios.map((u) => (
                <Card key={u.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold dark:text-gray-100">{u.name}</h3>
                          {getPerfilBadge(u.profile)}
                        </div>
                         <p className="text-gray-600 dark:text-gray-400 mb-3">{u.email}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-600">Último Login</p>
                            <p>{formatarData(u.last_login)}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-600">Data Criação</p>
                            <p>{formatarData(u.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        {/* Botões de editar e status podem ser implementados no futuro */}
                        <Button variant="outline" size="sm" onClick={() => excluirUsuario(u)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
         
            {/* Configurações do Sistema */}
            <TabsContent value="configuracoes" className="space-y-6">
              <h3 className="text-lg font-semibold dark:text-slate-100">Configurações do Sistema</h3>

              <div className="grid gap-6">
                {/* Informações Gerais */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Informações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome_sistema">Nome do Sistema</Label>
                        <Input id="nome_sistema" value={configuracoes.nome_sistema} readOnly />
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
                  </CardContent>
                </Card>

                {/* Segurança */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Segurança
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium dark:text-slate-200">Modo Manutenção</p>
                          <p className="text-sm text-gray-600">Bloqueia acesso de usuários não-admin</p>
                        </div>
                        <Button 
                          variant={configuracoes.manutencao ? "destructive" : "outline"}
                          onClick={alterarModoManutencao}
                        >
                          {configuracoes.manutencao ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium dark:text-slate-200">Backup Automático</p>
                          <p className="text-sm text-gray-600">Backup diário dos dados</p>
                        </div>
                        <Button 
                          variant={configuracoes.backup_automatico ? "default" : "outline"}
                          onClick={alterarBackupAutomatico}
                        >
                          {configuracoes.backup_automatico ? "Ativo" : "Inativo"}
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="log_nivel">Nível de Log</Label>
                        <Select value={configuracoes.log_nivel}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debug">Debug</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notificações */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bell className="h-5 w-5 mr-2" />
                      Notificações
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium dark:text-slate-200">Notificações por Email</p>
                          <p className="text-sm text-gray-600">Enviar alertas importantes por email</p>
                        </div>
                        <Button variant={configuracoes.notificacoes_email ? "default" : "outline"}>
                          {configuracoes.notificacoes_email ? "Ativo" : "Inativo"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Banco de Dados */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Banco de Dados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg dark:bg-green-900/50">
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="text-lg font-bold text-green-600">Conectado</p>
                      </div>
                     <div className="text-center p-4 bg-blue-50 rounded-lg dark:bg-blue-900/50">
                        <p className="text-sm text-gray-600">Tamanho</p>
                        <p className="text-lg font-bold text-blue-600">2.4 MB</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg dark:bg-purple-900/50">
                        <p className="text-sm text-gray-600">Último Backup</p>
                        <p className="text-lg font-bold text-purple-600">Hoje</p>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Fazer Backup
                      </Button>
                      <Button variant="outline">
                        <Activity className="h-4 w-4 mr-2" />
                        Ver Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={salvarConfiguracoes}>Salvar Configurações</Button>
                </div>
              </div>
            </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;