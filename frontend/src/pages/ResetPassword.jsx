// src/pages/ResetPassword.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { KeyRound, Loader2 } from 'lucide-react';
import logo from '../assets/LOGO.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Este useEffect executa assim que a página carrega para pegar o token da URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Token de recuperação não encontrado. Por favor, tente novamente a partir do link em seu e-mail.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      // Chama nossa API final para redefinir a senha
      await apiService.post('/api/auth/reset-password', {
        token: token,
        new_password: password
      });

      setMessage('Senha redefinida com sucesso! Você será redirecionado para o login em 5 segundos.');

      // Redireciona para o login após um breve intervalo
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (err) {
      setError(err.response?.data?.error || 'Ocorreu um erro. O token pode ser inválido ou ter expirado.');
      console.error("Erro ao redefinir senha:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <img src={logo} alt="Simplific Pro" className="w-32 mx-auto mb-4" />
          <CardTitle className="text-2xl">Crie sua Nova Senha</CardTitle>
          <CardDescription>Escolha uma senha segura para sua conta.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md mb-4">{error}</p>}
          {message && <p className="text-sm text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirme a Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !token || message}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Redefinir Senha
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            <Link to="/login" className="underline">
              Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;