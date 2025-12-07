import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'; // Adicionei ícones extras
import logo from '../assets/LOGO.png';
import apiService from '../services/api';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para troca de senha (Mantidos)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
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
        setError('E-mail ou senha inválidos. Verifique suas credenciais.');
      }
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
      {/* --- FUNDO TECNOLÓGICO --- */}
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans">
        
        {/* Efeitos de Luz de Fundo (Glow) */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px]" />
        
        {/* Grid Sutil no Fundo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <Card className="relative z-10 w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
          
          {/* Barra superior colorida */}
          <div className="h-2 w-full bg-gradient-to-r from-green-500 to-emerald-600"></div>

          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-green-50 rounded-2xl shadow-inner">
                <img src={logo} alt="Simplific Pro" className="h-12 w-auto" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              Bem-vindo de volta ao Simplific
            </CardTitle>
            <p className="text-gray-500 text-sm mt-2">
              Acesse seu painel financeiro inteligente
            </p>
          </CardHeader>
        
          <CardContent className="px-8 pb-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              
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
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
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
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
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
                    <div className="flex items-center gap-2">
                        Entrar na Plataforma <ArrowRight size={18} />
                    </div>
                )}
              </Button>
            </form>
          </CardContent>
          
          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
                Protegido por criptografia de ponta a ponta.
            </p>
          </div>
        </Card>
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