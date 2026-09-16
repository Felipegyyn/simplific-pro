import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import apiService from '../services/api';
import logo from '../assets/LOGO.png';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verificando sua conta...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Nenhum token de verificação foi fornecido.');
      return;
    }

    const verifyAccount = async () => {
      try {
        const response = await apiService.post('/api/auth/verify-email', { token });
        setStatus('success');
        setMessage(response.message || 'Sua conta foi verificada com sucesso!');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Não foi possível verificar sua conta. O link pode ter expirado.');
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans bg-slate-950 p-4">
      {/* Efeitos de Luz de Fundo (Glow) */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      
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
            Verificação de E-mail
          </CardTitle>
        </CardHeader>

        <CardContent className="px-8 pb-8 pt-4 text-center">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 text-emerald-500 animate-spin" />
              <p className="text-gray-600 font-medium">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
              <p className="text-gray-700 font-medium text-lg">{message}</p>
              <div className="pt-4 w-full">
                <Link to="/login">
                  <Button className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/30 rounded-xl transition-all">
                    Ir para o Login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-6">
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-gray-700 font-medium">{message}</p>
              <div className="pt-4 w-full">
                <Link to="/login">
                  <Button variant="outline" className="w-full h-12 text-base rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 transition-all">
                    Voltar
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
