// src/pages/ForgotPassword.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import logo from '../assets/LOGO.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      // Chama a nossa nova API para solicitar a recuperação
      await apiService.post('/api/auth/forgot-password', { email });

      // Exibe uma mensagem genérica por segurança, como configuramos no backend
      setMessage('Se existir uma conta com este e-mail, um link de recuperação foi enviado. Por favor, verifique sua caixa de entrada e spam.');

    } catch (error) {
      // Mesmo em caso de erro, exibimos a mesma mensagem genérica
      setMessage('Se existir uma conta com este e-mail, um link de recuperação foi enviado. Por favor, verifique sua caixa de entrada e spam.');
      console.error("Erro ao solicitar recuperação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <img src={logo} alt="Simplific Pro" className="w-32 mx-auto mb-4" />
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>Digite seu e-mail para receber as instruções.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {message && <p className="text-sm text-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-md">{message}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Link de Recuperação
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

export default ForgotPassword;