import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShieldCheck, Zap, ArrowRight, Star, Flame } from 'lucide-react';

const Planos = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleSubscribe = () => {
    // Rastreamento do Pixel
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: billingCycle === 'monthly' ? 'Plano Mensal' : 'Plano Anual',
        value: billingCycle === 'monthly' ? 4.90 : 198.90,
        currency: 'BRL'
      });
    }

    if (billingCycle === 'monthly') {
        navigate('/checkout');
    } else {
        navigate('/checkout?plan=annual');
    }
  };

  const isAnnual = billingCycle === 'annual';

  return (
    <div className="min-h-screen flex flex-col bg-black font-sans text-gray-100">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-20 text-center relative">
        {/* Luz de fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-600/20 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 uppercase tracking-tight">
                Escolha seu Plano <span className="text-green-500">Black</span>
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                A oportunidade de ter um Assessor Financeiro com IA pelo menor preço da história.
            </p>

            {/* Toggle Black */}
            <div className="flex justify-center mb-12">
                <div className="bg-slate-900 border border-gray-800 p-1 rounded-full flex items-center relative shadow-lg">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-green-500 text-black shadow-lg shadow-green-500/30' : 'text-gray-400 hover:text-white'}`}
                    >
                        MENSAL
                    </button>
                    <button 
                        onClick={() => setBillingCycle('annual')}
                        className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center ${isAnnual ? 'bg-green-500 text-black shadow-lg shadow-green-500/30' : 'text-gray-400 hover:text-white'}`}
                    >
                        ANUAL
                        {isAnnual && <span className="ml-2 text-[10px] bg-black text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400 font-black animate-pulse">R$ 100 OFF</span>}
                    </button>
                </div>
            </div>

            {/* Card de Preço Black Edition */}
            <div className="bg-slate-900 max-w-lg mx-auto rounded-3xl shadow-2xl overflow-hidden border-2 border-green-500 relative transform hover:scale-[1.01] transition-transform duration-300">
                
                {/* Faixa Superior */}
                <div className={`p-4 text-center font-black tracking-widest text-sm uppercase flex items-center justify-center gap-2 ${isAnnual ? 'bg-yellow-400 text-black' : 'bg-green-600 text-black'}`}>
                    <Flame size={18} fill="black" />
                    {isAnnual ? 'MELHOR CUSTO-BENEFÍCIO' : 'OFERTA BLACK: 1º MÊS PROMOCIONAL'}
                </div>

                <div className="p-10 relative">
                    {/* Preço Antigo Riscado */}
                    <div className="mb-2">
                        <span className="text-gray-500 line-through text-lg font-bold">
                            {isAnnual ? 'R$ 298,80' : 'R$ 89,90'}
                        </span>
                    </div>

                    <div className="flex justify-center items-baseline gap-1 mb-2">
                        <span className="text-3xl text-gray-500 font-bold">R$</span>
                        {/* ▼▼▼ AQUI ESTÁ A LÓGICA DO PREÇO 4,90 ▼▼▼ */}
                        <span className="text-7xl md:text-8xl font-black text-white tracking-tighter">
                            {isAnnual ? '198,90' : '4,90'}
                        </span>
                    </div>
                    
                    <p className="text-green-400 font-bold mb-8 uppercase tracking-wider">
                        {isAnnual ? 'POR ANO (À VISTA)' : 'NO 1º MÊS (DEPOIS R$ 24,90)'}
                    </p>

                    {isAnnual && (
                        <div className="bg-black/50 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-8 text-sm font-bold inline-block">
                            <Star size={14} className="inline mr-1 fill-green-400"/> Economia de R$ 100,00 no ano
                        </div>
                    )}

                    <Button 
                        onClick={handleSubscribe}
                        className="w-full bg-green-500 hover:bg-green-400 text-black font-black text-xl py-8 h-auto rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.4)] mb-8 uppercase tracking-wide"
                    >
                        {isAnnual ? 'QUERO O PLANO ANUAL' : 'TESTAR POR R$ 4,90'}
                        <ArrowRight className="ml-2" strokeWidth={3} />
                    </Button>

                    <div className="space-y-4 text-left border-t border-gray-800 pt-8">
                        <div className="flex items-center gap-3 text-gray-300 font-medium"><CheckCircle size={20} className="text-green-500 flex-shrink-0"/> <span>Acesso ilimitado a Plataforma</span></div>
                        <div className="flex items-center gap-3 text-gray-300 font-medium"><CheckCircle size={20} className="text-green-500 flex-shrink-0"/> <span>Assessor IA no WhatsApp (Ilimitado)</span></div>
                        <div className="flex items-center gap-3 text-gray-300 font-medium"><CheckCircle size={20} className="text-green-500 flex-shrink-0"/> <span>Sincronização de Agenda</span></div>
                        <div className="flex items-center gap-3 text-gray-300 font-medium"><ShieldCheck size={20} className="text-green-500 flex-shrink-0"/> <span>Garantia total de 7 dias</span></div>
                        <div className="flex items-center gap-3 text-gray-300 font-medium"><Zap size={20} className="text-green-500 flex-shrink-0"/> <span>Cancele quando quiser</span></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      <div className="border-t border-gray-900">
        <Footer />
      </div>
    </div>
  );
};

export default Planos;