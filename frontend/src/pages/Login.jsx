import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Lock, Mail, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react'; 
import logo from '../assets/LOGO.png';
import apiService from '../services/api';

const Login = ({ onLogin }) => {
  // Controle de Tabs (Login vs Register)
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Estados Form Login
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Estados Form Register
  const [registerData, setRegisterData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para troca de senha no 1º acesso
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  // Handlers Login
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiService.login(formData.email, formData.password);

      if (data.user && data.user.first_login) {
        setTempPassword(formData.password);
        setIsChangePasswordModalOpen(true);
      } else {
        onLogin(data.user);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error.response && error.response.status === 403) {
        setError(error.response.data.error);
      } else {
        setError('Acesso negado. Verifique suas credenciais ou contate o suporte: contato@simplificpro.com');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handlers Register
  const handleRegisterChange = (e) => {
    let value = e.target.value;
    // Máscara ultra simples para WhatsApp
    if (e.target.name === 'whatsapp') {
      value = value.replace(/\D/g, '');
    }
    setRegisterData({ ...registerData, [e.target.name]: value });
    setError('');
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiService.post('/api/auth/register', registerData);
      setRegisterSuccess(true);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setError(error.response?.data?.error || 'Erro ao realizar o cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setChangePasswordError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      setChangePasswordError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setChangePasswordError('');

    try {
      await apiService.post('/api/auth/change-password', {
        current_password: tempPassword,
        new_password: newPassword
      });
      alert('Senha alterada com sucesso! Faça login novamente.');
      apiService.logout();
      window.location.reload();
    } catch (err) {
      setChangePasswordError(err.response?.data?.error || 'Erro ao alterar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex font-sans bg-slate-950">
        
        {/* LADO ESQUERDO: Formulários */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden p-4 sm:p-8">
          
          {/* Efeitos de Luz de Fundo (Glow) */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          {/* Grid Sutil no Fundo */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

          <Card className="relative z-10 w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
          
            {/* Barra superior colorida */}
            <div className="h-2 w-full bg-gradient-to-r from-green-500 to-emerald-600"></div>

            <CardHeader className="text-center pb-2 pt-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-50 rounded-2xl shadow-inner">
                  <img src={logo} alt="Simplific Pro" className="h-10 w-auto" />
                </div>
              </div>
              
              {!registerSuccess && (
                <div className="flex bg-gray-100 p-1 rounded-xl mx-auto w-full max-w-[280px] mb-4">
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(false); setError(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isRegistering ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Entrar
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsRegistering(true); setError(''); }}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isRegistering ? 'bg-white shadow text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Cadastrar
                  </button>
                </div>
              )}

              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                {registerSuccess ? 'Quase lá!' : isRegistering ? 'Comece seus 7 Dias Grátis' : 'Bem-vindo de volta'}
              </CardTitle>
              <p className="text-gray-500 text-sm mt-2">
                {registerSuccess 
                  ? 'Verifique sua caixa de entrada' 
                  : isRegistering 
                    ? 'O Simplific IA fará o trabalho duro por você.' 
                    : 'Acesse seu painel financeiro inteligente'}
              </p>
            </CardHeader>
          
            <CardContent className="px-8 pb-8 pt-2">

              {registerSuccess ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-2" />
                  <p className="text-gray-700 font-medium">
                    Enviamos um link de confirmação para <strong className="text-green-700">{registerData.email}</strong>.
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Por favor, acesse seu e-mail e clique no link para ativar seus 7 dias gratuitos.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => { setRegisterSuccess(false); setIsRegistering(false); }}
                    className="w-full h-12 text-base rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Voltar para o Login
                  </Button>
                </div>
              ) : isRegistering ? (
                // FORMULÁRIO DE CADASTRO
                <form onSubmit={handleSubmitRegister} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name" className="text-gray-700 font-medium ml-1 text-xs">Nome Completo</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        id="reg-name"
                        name="name"
                        type="text"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        required
                        className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 transition-all text-sm"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-whatsapp" className="text-gray-700 font-medium ml-1 text-xs">WhatsApp (com DDD)</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        id="reg-whatsapp"
                        name="whatsapp"
                        type="text"
                        value={registerData.whatsapp}
                        onChange={handleRegisterChange}
                        required
                        className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 transition-all text-sm"
                        placeholder="Ex: 11999999999"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-gray-700 font-medium ml-1 text-xs">E-mail</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        id="reg-email"
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        required
                        className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 transition-all text-sm"
                        placeholder="exemplo@simplific.com"
                      />
                    </div>
                  </div>
                
                  <div className="space-y-1">
                    <Label htmlFor="reg-password" className="text-gray-700 font-medium ml-1 text-xs">Senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                        className="pl-9 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 transition-all text-sm"
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50/50 text-red-800 text-xs py-2 rounded-lg mt-2">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-11 mt-2 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    disabled={loading}
                  >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processando...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 font-semibold">
                            Garantir 7 Dias Grátis <ArrowRight size={16} />
                        </div>
                    )}
                  </Button>
                </form>
              ) : (
                // FORMULÁRIO DE LOGIN ORIGINAL
                <form onSubmit={handleSubmitLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium ml-1">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 transition-all"
                        placeholder="exemplo@simplific.com"
                      />
                    </div>
                  </div>
                
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="password" classname="text-gray-700 font-medium ml-1">Senha</Label>
                        <Link to="/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-semibold hover:underline">
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-green-600 transition-colors" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white text-gray-900 transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <Alert className="border-red-200 bg-red-50/50 text-red-800 text-sm py-2 rounded-xl animate-in slide-in-from-top-2">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
                    disabled={loading}
                  >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Acessando...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 font-semibold">
                            Entrar na Plataforma <ArrowRight size={18} />
                        </div>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
            
            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
              <p className="text-xs text-gray-500">
                  Protegido por criptografia de ponta a ponta.
              </p>
            </div>
          </Card>
        </div>

        {/* LADO DIREITO: Imagem */}
        <div 
          className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: "url('/novo simplific/Login.jpg')" }}
        >
          {/* Selo de 7 dias grátis (Novo!) */}
          <div className="absolute top-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl max-w-sm shadow-2xl shadow-black/50">
            <div className="inline-block bg-lime-300 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
              Oferta Especial
            </div>
            <h3 className="text-white text-3xl font-bold mb-2">7 Dias Grátis</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Crie sua conta agora e libere a Inteligência Artificial para organizar sua vida financeira. 
              Você só decide se quer continuar depois de ver os resultados.
            </p>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>
        </div>
      </div>

      {/* Modal de Primeiro Acesso (Mantido igual) */}
      <Dialog open={isChangePasswordModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-green-700">🔒 Segurança em Primeiro Lugar</DialogTitle>
            <DialogDescription>
              Detectamos que este é seu primeiro acesso. Por favor, defina uma nova senha segura.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a Senha</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="rounded-xl" />
            </div>
            {changePasswordError && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{changePasswordError}</p>}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 rounded-xl" disabled={loading}>
              {loading ? 'Salvando...' : 'Definir Senha e Entrar'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login;