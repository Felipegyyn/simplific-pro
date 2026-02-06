import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Settings } from 'lucide-react';
import logo from '../assets/LOGO.png'; // Certifique-se que o caminho do logo está correto

const Maintenance = () => {
  // Tempo inicial em segundos: 2 horas e 30 minutos
  // (2 * 3600) + (30 * 60) = 7200 + 1800 = 9000 segundos
  const [timeLeft, setTimeLeft] = useState(9000);

  useEffect(() => {
    // Cria o intervalo que roda a cada 1 segundo
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Limpa o intervalo se o componente for desmontado
    return () => clearInterval(timer);
  }, []);

  // Função para formatar segundos em HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      
      {/* Container Principal */}
      <div className="max-w-md w-full bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        
        {/* Barra de Progresso Animada no Topo (Efeito visual) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
            <div className="h-full bg-cyan-500 animate-pulse w-full"></div>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Simplific Pro" className="h-12 w-auto" />
        </div>

        {/* Ícone e Título */}
        <div className="mb-6 flex flex-col items-center">
            <div className="bg-amber-100 p-4 rounded-full mb-4">
                <Settings className="h-10 w-10 text-amber-600 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Sistema em Atualização
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
                Estamos implementando melhorias importantes no Simplific Pro. O acesso está temporariamente suspenso para garantir a segurança dos seus dados.
            </p>
        </div>

        {/* Cronômetro */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-800">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2 flex items-center justify-center gap-2">
                <Clock size={14} /> Tempo estimado de retorno
            </p>
            <div className="text-4xl font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {formatTime(timeLeft)}
            </div>
        </div>

        {/* Aviso Final */}
        <div className="flex items-center justify-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
            <AlertTriangle size={16} />
            <span>Por favor, não tente realizar transações agora.</span>
        </div>

      </div>
      
      {/* Footer */}
      <p className="mt-8 text-slate-400 text-sm">
        Agradecemos a paciência. Voltaremos em breve! 🚀
      </p>
    </div>
  );
};

export default Maintenance;