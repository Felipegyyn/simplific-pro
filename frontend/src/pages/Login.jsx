import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Eye, EyeOff } from 'lucide-react';
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

  // ▼▼▼ ADICIONE ESTES NOVOS ESTADOS AQUI ▼▼▼
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState(''); // Para guardar a senha temporária
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  // ▲▲▲ FIM DO BLOCO ▲▲▲

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

// Em Login.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // A chamada de API foi trocada para usar o apiService, para consistência
      const data = await apiService.login(formData.email, formData.password);

      // --- LÓGICA PRINCIPAL: VERIFICA SE É O PRIMEIRO LOGIN ---
      if (data.user && data.user.first_login) {
        // Se for, salva a senha temporária e abre o modal
        setTempPassword(formData.password);
        setIsChangePasswordModalOpen(true);
      } else {
        // Se não for, procede com o login normal
        onLogin(data.user);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);

      // Lógica inteligente para tratar a mensagem de erro específica do backend
      if (error.response && error.response.status === 403) {
      // Se o erro for 403 (Proibido), usa a mensagem do servidor (ex: "Conta inativa")
        setError(error.response.data.error);
      } 
      else {
        // Para outros erros (ex: 401, senha errada), usa uma mensagem genérica
        setError('Email ou senha inválidos. Verifique suas credenciais.');
      }

     
    } finally {
      setLoading(false);
    }
  };

// Em Login.jsx, depois da função handleSubmit

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
      // Chama a rota do backend que já existe
      await apiService.post('/api/auth/change-password', {
        current_password: tempPassword,
        new_password: newPassword
      });

      alert('Senha alterada com sucesso! Por favor, faça o login novamente com sua nova senha.');
      
      // Limpa tudo e força o usuário a logar de novo
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="Simplific Pro" className="h-16 w-auto" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">
              $implific Pro
            </CardTitle>
            <p className="text-gray-600">
              Planeje, controle e $impific
            </p>
          </CardHeader>
        
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="seu@email.com"
                />
              </div>
            
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pr-10"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-green-700 hover:bg-green-800"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isChangePasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário identificado!</DialogTitle>
            <DialogDescription>
              Por segurança, você precisa criar uma nova senha para o seu primeiro acesso.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            {changePasswordError && <p className="text-sm text-red-600">{changePasswordError}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login;

