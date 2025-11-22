import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importamos o hook aqui
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShieldCheck, Target, Zap, ArrowRight } from 'lucide-react';

const Planos = () => {
  const navigate = useNavigate(); // 2. Iniciamos a função de navegação aqui
  const [billingCycle, setBillingCycle] = useState('monthly');

  // LINKS
  const ANNUAL_LINK = "#"; // Cole seu link anual aqui quando tiver

  const handleSubscribe = () => {
    if (billingCycle === 'monthly') {
        // 3. Se for mensal, vai para a nossa página interna de Checkout
        navigate('/checkout');
    } else {
        navigate('/checkout?plan=annual'); // Envia o parâmetro na URL
    }
  };

  const isAnnual = billingCycle === 'annual';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Escolha seu Plano</h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Invista na sua tranquilidade financeira por menos do que você gasta com lanches.
        </p>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
            <div className="bg-gray-200 p-1 rounded-full flex items-center relative">
                <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}
                >
                    Mensal
                </button>
                <button 
                    onClick={() => setBillingCycle('annual')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center ${isAnnual ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600'}`}
                >
                    Anual
                    {isAnnual && <span className="ml-2 text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full">ECONOMIZE</span>}
                </button>
            </div>
        </div>

        {/* Card de Preço */}
        <div className="bg-white max-w-lg mx-auto rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-green-600 p-4 text-white font-bold tracking-widest text-sm uppercase">
                {isAnnual ? '⚡ Melhor Custo-Benefício' : '🚀 Mais Popular'}
            </div>
            <div className="p-10">
                <div className="flex justify-center items-baseline gap-1 mb-2">
                    <span className="text-2xl text-gray-400 font-medium">R$</span>
                    <span className="text-7xl font-extrabold text-green-600">
                        {isAnnual ? '198,90' : '24,90'}
                    </span>
                </div>
                <p className="text-gray-500 font-medium mb-8">
                    {isAnnual ? 'Por ano (à vista)' : 'Por mês'}
                </p>

                {isAnnual && (
                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-8 text-sm font-bold inline-block">
                        Economize R$ 100,00/ano comparado ao mensal
                    </div>
                )}

                <Button 
                    onClick={handleSubscribe}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-8 rounded-xl shadow-lg mb-8"
                >
                    {isAnnual ? 'Quero o Plano Anual' : 'Quero o Plano Mensal'}
                    <ArrowRight className="ml-2" />
                </Button>

                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-3 text-gray-600"><CheckCircle size={20} className="text-green-500"/> <span>Acesso ilimitado a todos os módulos</span></div>
                    <div className="flex items-center gap-3 text-gray-600"><CheckCircle size={20} className="text-green-500"/> <span>Assessor Financeiro no WhatsApp</span></div>
                    <div className="flex items-center gap-3 text-gray-600"><CheckCircle size={20} className="text-green-500"/> <span>Integração com Corretoras</span></div>
                    <div className="flex items-center gap-3 text-gray-600"><ShieldCheck size={20} className="text-green-500"/> <span>Garantia de 7 dias</span></div>
                    <div className="flex items-center gap-3 text-gray-600"><Zap size={20} className="text-green-500"/> <span>Cancele quando quiser</span></div>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Planos;