import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShieldCheck, Zap, ArrowRight, Star, Flame } from 'lucide-react';

const Planos = () => {
  const navigate = useNavigate();
  // Mantemos 'annual' como padrão para focar na venda de maior valor
  const [billingCycle, setBillingCycle] = useState('annual');

  const handleSubscribe = () => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: billingCycle === 'monthly' ? 'Plano Mensal' : 'Plano Anual',
        value: billingCycle === 'monthly' ? 13.45 : 199.00,
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

  // --- CONFIGURAÇÃO DE PREÇOS ATUALIZADA ---
  const pricing = {
    annual: {
        oldPrice: "R$ 29,90", // Comparativo mensal padrão
        priceDisplay: "16,58", // Foco no valor mensal equivalente
        priceSuffix: "/mês",
        headerText: "MELHOR CUSTO-BENEFÍCIO",
        headerColor: "bg-yellow-400 text-black",
        // Texto secundário explicando o total
        subDetail: "No plano anual de R$ 199,00 (parcele em até 12x)", 
        buttonText: "QUERO O PLANO ANUAL"
      },
    monthly: {
      oldPrice: "R$ 29,90",
      priceDisplay: "13,45",        
      priceSuffix: " no 1º mês",  
      headerText: "OFERTA BLACK: 1º MÊS PROMOCIONAL",
      headerColor: "bg-green-600 text-black",
      subDetail: "A partir do 2º mês R$ 29,90 mensais.",
      buttonText: "TESTAR POR R$ 13,45"
    }
  };

  const currentPlan = pricing[billingCycle];

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

            {/* Toggle Black (Botões de Alternância) */}
            <div className="flex justify-center mb-12">
                <div className="bg-gray-900 border border-gray-800 p-1 rounded-lg inline-flex relative shadow-lg">
                    {/* Botão ANUAL (Esquerda - Invertido para destaque) */}
                    <button 
                        onClick={() => setBillingCycle('annual')}
                        className={`px-8 py-3 rounded-md text-sm font-bold transition-all flex items-center ${isAnnual ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        ANUAL
                        <span className="ml-2 text-[10px] bg-white text-green-700 px-2 py-0.5 rounded-full font-black border border-green-600">-45%</span>
                    </button>
                    
                    {/* Botão MENSAL (Direita) */}
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-8 py-3 rounded-md text-sm font-bold transition-all ${!isAnnual ? 'bg-gray-700 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                    >
                        MENSAL
                    </button>
                </div>
            </div>

            {/* Card de Preço Black Edition */}
            <div className="bg-slate-900 max-w-lg mx-auto rounded-3xl shadow-2xl overflow-hidden border-2 border-gray-800 relative transform hover:scale-[1.01] transition-transform duration-300">
                {/* Borda Gradient no topo */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>

                {/* Faixa Superior Dinâmica */}
                <div className={`p-4 text-center font-black tracking-widest text-sm uppercase flex items-center justify-center gap-2 ${currentPlan.headerColor}`}>
                    <Flame size={18} fill="black" />
                    {currentPlan.headerText}
                </div>

                <div className="p-10 relative">
                    {/* Preço Antigo Riscado */}
                    <div className="mb-2">
                        <span className="text-gray-500 line-through text-lg font-bold">
                            {currentPlan.oldPrice}
                        </span>
                    </div>

                    {/* Preço Principal */}
                    <div className="flex justify-center items-baseline gap-1 mb-2">
                        <span className="text-3xl text-gray-500 font-bold">R$</span>
                        <span className="text-8xl font-black text-white tracking-tighter">
                            {currentPlan.priceDisplay}
                        </span>
                        <span className="text-gray-400 font-bold text-xl self-end mb-4">
                            {currentPlan.priceSuffix}
                        </span>
                    </div>
                    
                    {/* Detalhe Extra (ex: Valor da parcela ou valor futuro) */}
                    <div className="bg-black/40 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-8 text-sm font-bold inline-block w-full">
                        {isAnnual && <Star size={14} className="inline mr-1 fill-green-400 mb-0.5"/>} 
                        {currentPlan.subDetail}
                    </div>

                    <Button 
                        onClick={handleSubscribe}
                        className="w-full bg-white hover:bg-gray-200 text-black font-black text-xl py-8 h-auto rounded-xl shadow-xl mb-8 uppercase tracking-wide transition-all hover:-translate-y-1"
                    >
                        {currentPlan.buttonText}
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