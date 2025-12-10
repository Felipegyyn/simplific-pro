import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, MessageCircle, BarChart3, CreditCard, Target, 
  Calendar, ArrowRight, ChevronDown, ChevronUp, ShieldCheck, 
  Smartphone, Map, PieChart, Scale, Zap, Star, Sparkles
} from 'lucide-react';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-800 py-4">
      <button className="flex justify-between items-center w-full text-left focus:outline-none group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-lg font-medium text-gray-200 group-hover:text-green-400 transition-colors">{question}</span>
        {isOpen ? <ChevronUp className="text-green-500" /> : <ChevronDown className="text-gray-600" />}
      </button>
      {isOpen && <p className="mt-2 text-gray-400 leading-relaxed">{answer}</p>}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleBuyClick = () => {
    if (billingCycle === 'monthly') {
        navigate('/checkout');
    } else {
        navigate('/checkout?plan=annual');      
    }
  };

  const pricing = {
    monthly: {
      oldPrice: "R$ 89,90",
      price: "24,90",
      period: "Por mês",
      description: "Preço de Black Friday garantido.",
      buttonText: "Garantir Desconto Mensal",
      savings: "60% OFF"
    },
    annual: {
        oldPrice: "R$ 298,80", 
        price: "198,90",
        period: "Por ano (à vista)",
        description: "Equivalente a R$ 16,57/mês. O menor valor da história.",
        buttonText: "GARANTIR OFERTA ANUAL",
        savings: "BLACK DECEMBER: R$ 100 OFF"
      }
  };

  const currentPlan = pricing[billingCycle];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-gray-100 selection:bg-green-500 selection:text-black">
      {/* Navbar com background escuro forçado */}
      <div className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
        <Navbar /> 
      </div>

      {/* --- HERO SECTION (BLACK EDITION) --- */}
      <header className="relative overflow-hidden pt-20 pb-32">
        {/* Efeitos de Fundo (Luzes) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/40 via-slate-950 to-black pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase animate-pulse">
               <Zap size={14} fill="currentColor" /> Black December Ativado
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
              O Caos Financeiro <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-600">
                Acaba Agora.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-lg border-l-4 border-green-600 pl-4">
              A oferta mais insana do ano para você ter um <strong>Assessor Financeiro com IA</strong> trabalhando 24h por você no WhatsApp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' })} 
                size="lg" 
                className="bg-green-500 text-black hover:bg-green-400 font-black text-lg h-16 px-10 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.7)] transition-all w-full sm:w-auto uppercase tracking-wide"
              >
                Pegar Oferta Black
              </Button>

              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="h-16 px-8 rounded-xl bg-transparent border border-gray-700 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white transition-colors"
              >
                Já sou cliente
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 flex items-center gap-2">
                <ShieldCheck size={16} className="text-green-500" /> Garantia de 7 dias ou seu dinheiro de volta.
            </p>
          </div>
          
          {/* Imagem com efeito Glass Dark */}
          <div className="relative hidden md:block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl transform rotate-1 group-hover:rotate-0 transition-all duration-500">
               <div className="absolute top-0 right-0 bg-green-500 text-black font-bold text-xs px-3 py-1 rounded-bl-xl rounded-tr-xl z-20">DASHBOARD PREMIUM</div>
               <img src="/assets/image_745581.png" alt="Dashboard Simplific Pro" className="rounded-xl w-full h-auto opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </header>

      {/* --- FAIXA DE URGÊNCIA --- */}
      <div className="bg-green-600 text-black py-3 overflow-hidden relative">
        <div className="container mx-auto px-4 flex justify-between items-center font-bold uppercase tracking-widest text-sm md:text-base">
            <span className="flex items-center gap-2"><Star size={16} fill="black"/> Oferta Black</span>
            <span className="hidden md:inline">O menor preço da história do Simplific</span>
            <span className="flex items-center gap-2">Dezembro <Star size={16} fill="black"/></span>
        </div>
      </div>

      {/* --- BENEFÍCIOS (DARK MODE) --- */}
      <section id="beneficios" className="py-24 bg-black relative">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Poder Total nas Suas Mãos</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Tecnologia de ponta para quem cansou de planilhas chatas.</p>
        </div>
        
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-6">
          {[
            { icon: BarChart3, title: "Dashboard Black", desc: "Visão raio-x completa das suas finanças." },
            { icon: MessageCircle, title: "IA no WhatsApp", desc: "Mande áudios, ele registra tudo. Mágica pura." },
            { icon: Target, title: "Metas Claras", desc: "Defina objetivos e o sistema te cobra." },
            { icon: CreditCard, title: "Gestão de Cartões", desc: "Nunca mais pague juros por esquecimento." },
            { icon: Smartphone, title: "100% Mobile", desc: "Funciona perfeito no celular e no computador." },
            { icon: ShieldCheck, title: "Segurança Bancária", desc: "Seus dados blindados com criptografia." },
          ].map((item, index) => (
            <div key={index} className="p-8 rounded-2xl bg-slate-900/50 hover:bg-slate-800 transition-all border border-white/5 hover:border-green-500/50 group">
                <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-green-400 mb-6 group-hover:bg-green-500 group-hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                    <item.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- OFERTA BLACK (O DESTAQUE) --- */}
      <section id="oferta" className="py-24 relative overflow-hidden">
        {/* Fundo Gradiente Sutil */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-green-950/20 pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          
          <div className="text-center mb-12">
            <span className="text-green-400 font-bold tracking-widest uppercase mb-2 block">Oportunidade Única</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Escolha seu Plano Black</h2>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-slate-900 border border-white/10 p-1 rounded-full flex items-center relative">
                <button onClick={() => setBillingCycle('monthly')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-green-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    Mensal
                </button>
                <button onClick={() => setBillingCycle('annual')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-green-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                    Anual
                    <span className="bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full uppercase font-black animate-pulse">🔥 -R$ 100</span>
                </button>
            </div>
          </div>

          {/* Card da Oferta */}
          <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-green-500/50 relative transform hover:scale-[1.01] transition-transform duration-300">
            
            {/* Faixa Superior */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-center">
              <p className="text-black font-black uppercase tracking-wider flex items-center justify-center gap-2">
                <Sparkles size={18} fill="black" /> Oferta Liberada • Vagas Limitadas
              </p>
            </div>
            
            <div className="p-8 md:p-14 text-center relative">
              {/* Efeito de luz atrás do preço */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-500/20 blur-[80px] rounded-full pointer-events-none"></div>

              <div className="inline-block bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg mb-6">
                <span className="text-gray-400 text-sm line-through mr-3">{currentPlan.oldPrice}</span>
                <span className="text-white font-bold">HOJE POR APENAS</span>
              </div>

              <div className="flex justify-center items-baseline gap-1 mb-4 relative z-10">
                <span className="text-3xl text-gray-400 font-medium">R$</span>
                <span className="text-7xl md:text-8xl font-black text-white tracking-tighter drop-shadow-lg">{currentPlan.price}</span>
              </div>
              <p className="text-green-400 mb-8 font-medium uppercase tracking-wide">{currentPlan.period}</p>

              <div className="grid gap-4 max-w-sm mx-auto mb-10 text-left">
                <div className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500 flex-shrink-0" /> Acesso total ao Dashboard</div>
                <div className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500 flex-shrink-0" /> Assessor IA Ilimitado (WhatsApp)</div>
                <div className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500 flex-shrink-0" /> Sincronização de Agenda</div>
                <div className="flex items-center gap-3 text-gray-300"><CheckCircle className="text-green-500 flex-shrink-0" /> Suporte Prioritário</div>
              </div>

              <Button 
                onClick={handleBuyClick} 
                className="w-full md:w-2/3 bg-green-500 hover:bg-green-400 text-black font-black text-xl py-8 rounded-xl shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.6)] transition-all animate-pulse"
              >
                {currentPlan.buttonText} <ArrowRight className="ml-2" strokeWidth={3} />
              </Button>
              
              <p className="mt-6 text-xs text-gray-500">
                Pagamento seguro via Mercado Pago • Cancele quando quiser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ DARK --- */}
      <section className="py-20 bg-slate-950 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Dúvidas Frequentes</h2>
          <div className="space-y-2">
            <FaqItem question="O desconto é vitalício?" answer="O valor da assinatura anual garante esse preço promocional pelos próximos 12 meses. Aproveite para travar esse valor agora." />
            <FaqItem question="Meus dados estão seguros?" answer="Absolutamente. Usamos a mesma tecnologia de criptografia dos grandes bancos. Seus dados são seus." />
            <FaqItem question="Funciona no iPhone e Android?" answer="Sim! O Simplific Pro é uma plataforma web responsiva (PWA) e a IA funciona nativamente no seu WhatsApp, independente do aparelho." />
            <FaqItem question="Como acesso a IA?" answer="Assim que assinar, você terá acesso ao painel onde poderá conectar seu número e começar a conversar com o Simplific imediatamente." />
          </div>
        </div>
      </section>

      {/* Footer adaptado para dark mode */}
      <div className="border-t border-white/10 bg-black">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;