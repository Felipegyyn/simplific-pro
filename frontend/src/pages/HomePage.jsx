import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const HomePage = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Define o tamanho do canvas para preencher a tela
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Caracteres que vão "chover" na tela. Adicionamos R$, $ e números.
    const characters = 'R$0123456789$';
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(1);

    const draw = () => {
      // Fundo semi-transparente para criar o efeito de "rastro"
      ctx.fillStyle = 'rgba(1, 2, 3, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cor dos caracteres
      ctx.fillStyle = '#315A43'; // Verde Matrix
      ctx.font = '15pt monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden flex items-center justify-center">
      {/* O Canvas para o efeito Matrix */}
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0"></canvas>

      {/* Botão "Área do Cliente" no canto superior direito */}
      <Button
        onClick={() => navigate('/login')}
        className="absolute top-6 right-6 z-20 bg-green-500 hover:bg-green-600 text-white font-bold"
      >
        Área do Cliente
      </Button>

      {/* Conteúdo Central */}
      <div className="relative z-10 text-center p-8">
        {/* Moldura Externa */}
        <div className="border-2 border-green-500 p-2 max-w-2xl mx-auto">
          {/* Moldura Interna */}
          <div className="border-2 border-green-500 p-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-wider" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              Simplific Pro
            </h1>
            <p className="text-xl md:text-2xl text-green-400" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              Um jeito inteligente de planejar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
