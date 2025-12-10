import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, MessageCircle, BarChart3, CreditCard, Target, 
  ChevronDown, ChevronUp, ShieldCheck, Smartphone, 
  Zap, Star, Sparkles, Flame, Timer, ArrowRight
} from 'lucide-react';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-900 py-5">
      <button className="flex justify-between items-center w-full text-left focus:outline-none group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-lg font-bold text-gray-100 group-hover:text-green-400 transition-colors uppercase tracking-tight">{question}</span>
        {isOpen ? <ChevronUp className="text-green-500" /> : <ChevronDown className="text-gray-600" />}
      </button>
      {isOpen && <p className="mt-3 text-gray-400 leading-relaxed font-medium">{answer}</p>}
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
      oldPrice: "R$ 89,90", // Mostra o preço original riscado
      price: "4,90",        // O valor que vai aparecer gigante
      period: "NO 1º MÊS",  // Deixa claro a condição
      description: "Depois R$ 24,90/mês. Cancele quando quiser.",
      buttonText: "TESTAR POR R$ 4,90",
      badge: "🔥 OFERTA: 1º MÊS QUASE GRÁTIS"
    },
    annual: {
        oldPrice: "R$ 298,80", 
        price: "198,90",
        period: "ANO (À VISTA)",
        description: "Apenas R$ 16,57/mês. O menor valor JÁ FEITO.",
        buttonText: "QUERO A OFERTA ÉPICA ANUAL",
        badge: "🔥 ECONOMIA MÁXIMA: R$ 100 OFF"
      }
  };

  const currentPlan = pricing[billingCycle];

  return (
    <div className="min-h-screen bg-black font-sans text-gray-100 selection:bg-green-500 selection:text-black overflow-x-hidden">
      {/* Navbar Deep Black */}
      <div className="bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-green-900/30">
        <Navbar /> 
      </div>

      {/* --- HERO SECTION (INSANE BLACK) --- */}
      <header className="relative pt-24 pb-40 overflow-hidden">
        {/* Efeitos de Fundo Cyberpunk */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black pointer-events-none" />
        {/* Grid Neon sutil */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00ff000a_1px,transparent_1px),linear-gradient(to_bottom,#00ff000a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        
        {/* Luzes de palco superiores */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-green-600/30 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px] pointer-events-none mix-blend-screen" />

        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10 relative">
            
            {/* Badge de Urgência Piscante */}
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-6 py-2 transform -skew-x-12 font-black tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse">
               <Timer size={18} fill="black" /> Oferta Black Dezembro Ativada
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter text-white uppercase drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
              O Fim do <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-300 to-emerald-500 filter drop-shadow-[0_0_25px_rgba(74,222,128,0.6)]">
                Caos Financeiro.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-xl border-l-8 border-green-500 pl-6 font-medium leading-relaxed">
              A oferta mais agressiva do ano: tenha seu <strong>uma plataforma para chamar de SUA e um Assessor Financeiro com IA 24 horas por dia</strong> no WhatsApp pelo preço de um café.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-6">
              <Button 
                onClick={() => document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' })} 
                size="lg" 
                className="bg-green-500 text-black hover:bg-green-400 font-black text-xl h-20 px-12 rounded-none transform -skew-x-6 shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:shadow-[0_0_60px_rgba(34,197,94,0.9)] hover:-translate-y-1 transition-all w-full sm:w-auto uppercase tracking-widest border-2 border-green-400"
              >
                PEGAR OFERTA BLACK <Zap fill="black" className="ml-2 animate-bounce" />
              </Button>

              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="h-20 px-10 rounded-none transform -skew-x-6 bg-transparent border-2 border-gray-800 text-gray-300 hover:bg-white hover:text-black hover:border-white transition-all font-bold uppercase tracking-wider"
              >
                Área do Cliente
              </Button>
            </div>
            
            <p className="text-sm text-green-400/80 flex items-center gap-2 font-bold uppercase tracking-wider">
                <ShieldCheck size={18} /> Risco Zero: 7 dias de garantia total.
            </p>
          </div>
          
          {/* Imagem Hero "Monolito" */}
          <div className="relative hidden md:block group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-600/40 to-emerald-500/40 blur-2xl opacity-50 group-hover:opacity-100 transition duration-500 rounded-[30px]"></div>
            <div className="relative bg-black border-2 border-green-500/50 rounded-[30px] p-3 shadow-[0_0_50px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_100px_rgba(34,197,94,0.5)] transform transition-all duration-500 group-hover:scale-[1.02] overflow-hidden">
               {/* Faixa de Destaque na Imagem */}
               <div className="absolute top-5 right-0 bg-yellow-400 text-black font-black text-sm px-6 py-2 transform skew-x-12 z-20 shadow-lg uppercase">
                   Módulo IA Liberado
               </div>
               <img src="/assets/image_745581.png" alt="Dashboard Simplific Pro" className="rounded-2xl w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity filter contrast-125" />
               {/* Reflexo de luz na tela */}
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>
            </div>
          </div>
        </div>
      </header>

    {/* --- FAIXA DE URGÊNCIA (Hazard Style - VERSÃO FINAL À PROVA DE FALHAS) --- */}
      <div className="relative z-20 py-10 overflow-visible"> {/* Container reto com MUITO padding vertical */}
        
        {/* CAMADA DE FUNDO INCLINADA (O visual amarelo) */}
        <div className="absolute inset-0 bg-yellow-400 transform -skew-y-2 border-y-4 border-black shadow-[0_0_40px_rgba(234,179,8,0.6)]"></div>

        {/* CAMADA DE CONTEÚDO (O texto reto por cima) */}
        <div className="container mx-auto px-4 relative z-10 flex justify-between items-center font-black uppercase tracking-[0.2em] text-sm md:text-lg animate-pulse text-black">
            <span className="flex items-center gap-3 min-w-fit">
              <Flame size={26} fill="black"/> BLACK DECEMBER
            </span>
            
            {/* Bloco Central Preto */}
            <div className="hidden md:block relative mx-4">
              <div className="absolute inset-0 bg-black transform -skew-x-12 shadow-2xl"></div>
              <span className="relative z-10 text-yellow-400 px-10 py-3 block"> {/* Mais padding no bloco preto também */}
                  PREÇO NUNCA VISTO ANTES
              </span>
            </div>
            
            <span className="flex items-center gap-3 min-w-fit">
              SOMENTE ESTE MÊS <Flame size={26} fill="black"/>
            </span>
        </div>
      </div>






      {/* --- BENEFÍCIOS (Black Ops Style) --- */}
      <section id="beneficios" className="py-32 bg-black relative z-20 -mt-10">
        <div className="container mx-auto px-4 text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 uppercase tracking-tight leading-none">
            Arsenal Financeiro <span className="text-green-500">Completo</span>
          </h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto font-medium">
            Chega de ferramentas amadoras. Esse é o poder que faltava no seu bolso.
          </p>
        </div>
        
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: BarChart3, title: "Dashboard Inteligente", desc: "Visualize toda sua situação financiera em tempo real, em uma única tela." },
            { icon: MessageCircle, title: "Simplific IA", desc: "Seu mordomo financeiro disponível 24 horas. No whatsapp e na plataforma." },
            { icon: Target, title: "Metas ambiciosas", desc: "Tramsforme seus maiores sonhos em planos concretos. O Simplific te ajuda e te lembra." },
            { icon: CreditCard, title: "Controle de cartões", desc: "Gerencie todos os seus cartões em um só lugar." },
            { icon: Smartphone, title: "Lançamentos inteligentes", desc: "Registre receitas e despesas em segundos. No whatsapp ou na plataforma." },
            { icon: ShieldCheck, title: "Carteira de investimentos", desc: "Acompanhe sua carteira de investimentos. O Simplific integra com as principais corretoras" },
          ].map((item, index) => (
            <div key={index} className="p-8 rounded-none bg-gradient-to-b from-gray-900 to-black hover:from-green-950 hover:to-black transition-all border-2 border-gray-800 hover:border-green-500 group relative overflow-hidden">
                {/* Efeito de Scanline ao passar o mouse */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(34,197,94,0.1),transparent)] translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none"></div>
                
                <div className="w-16 h-16 bg-black border-2 border-green-500/30 flex items-center justify-center text-green-500 mb-8 group-hover:bg-green-500 group-hover:text-black group-hover:border-green-500 transition-all duration-300 shadow-[0_0_20px_rgba(34,197,94,0.2)] group-hover:shadow-[0_0_40px_rgba(34,197,94,0.8)] rounded-lg transform rotate-3 group-hover:rotate-0">
                    <item.icon size={36} strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-black mb-4 text-white uppercase">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- OFERTA BLACK (O Monolito Central) --- */}
      <section id="oferta" className="py-32 relative overflow-hidden bg-black">
        {/* Spotlights focados na oferta */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600/20 blur-[200px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          
          <div className="text-center mb-16">
            <span className="inline-block bg-red-600 text-white font-black tracking-widest uppercase px-4 py-1 mb-4 text-sm transform -skew-x-12 animate-pulse">
                ⚠️ Última Chamada Black December
            </span>
            <h2 className="text-5xl md:text-7xl font-black text-white uppercase leading-none drop-shadow-2xl">
              Escolha Seu Plano <span className="text-green-500">Épico</span>
            </h2>
          </div>

          {/* Toggle Agressivo */}
          <div className="flex justify-center mb-16">
            <div className="bg-black border-2 border-gray-800 p-2 flex items-center relative rounded-none shadow-[0_0_30px_rgba(0,0,0,1)]">
                <button onClick={() => setBillingCycle('monthly')} className={`px-10 py-4 text-lg font-black uppercase transition-all ${billingCycle === 'monthly' ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}>
                    Mensal
                </button>
                <button onClick={() => setBillingCycle('annual')} className={`px-10 py-4 text-lg font-black uppercase transition-all flex items-center gap-3 relative ${billingCycle === 'annual' ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.5)] z-10' : 'text-gray-500 hover:text-white hover:bg-gray-900'}`}>
                    Anual
                    {/* Badge de Desconto Explosivo */}
                    <span className="absolute -top-6 -right-10 bg-yellow-400 text-black text-xs px-3 py-1 font-black uppercase transform rotate-12 border-2 border-black shadow-lg">
                        🔥 R$ 100 OFF
                    </span>
                </button>
            </div>
          </div>

          {/* Card da Oferta (O Cofre) */}
          <div className="bg-black rounded-none shadow-2xl overflow-hidden border-[3px] border-green-500 relative transform hover:scale-[1.01] transition-transform duration-300 md:mx-auto max-w-3xl">
            
            {/* Faixa Superior Piscante */}
            <div className={`p-4 text-center ${billingCycle === 'annual' ? 'bg-yellow-400 text-black' : 'bg-green-600 text-black'}`}>
              <p className="font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 text-lg animate-pulse">
                <Sparkles size={20} fill="currentColor" /> {currentPlan.badge} <Sparkles size={20} fill="currentColor" />
              </p>
            </div>
            
            <div className="p-10 md:p-16 text-center relative bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-900/20 to-black">
              
              <div className="inline-flex items-center relative mb-8">
                 <span className="text-red-500 text-2xl line-through font-bold mr-4 opacity-70">{currentPlan.oldPrice}</span>
                 <div className="bg-green-500 text-black font-black text-sm px-3 py-1 uppercase transform -skew-x-12">
                     Valor Congelado Hoje
                 </div>
              </div>

              <div className="flex justify-center items-baseline gap-1 mb-6 relative z-10">
                <span className="text-4xl text-green-500 font-black">R$</span>
                <span className="text-8xl md:text-[10rem] font-black text-white tracking-tighter leading-none filter drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">{currentPlan.price.split(',')[0]}</span>
                <span className="text-4xl font-black text-white">,{currentPlan.price.split(',')[1]}</span>
              </div>
              <p className="text-green-400 mb-12 font-black uppercase tracking-[0.2em] text-xl">{currentPlan.period}</p>

              {/* Lista de Benefícios com Ícones Neon */}
              <div className="grid gap-5 max-w-md mx-auto mb-14 text-left bg-black/50 p-6 border border-green-500/30">
                <div className="flex items-center gap-4 text-white font-bold text-lg"><Zap className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] flex-shrink-0" size={24} fill="currentColor" /> Acesso TOTAL ao Dashboard Black</div>
                <div className="flex items-center gap-4 text-white font-bold text-lg"><Zap className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] flex-shrink-0" size={24} fill="currentColor" /> Assessor IA Ilimitado (WhatsApp)</div>
                <div className="flex items-center gap-4 text-white font-bold text-lg"><Zap className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] flex-shrink-0" size={24} fill="currentColor" /> Sincronização de Agenda Premium</div>
                <div className="flex items-center gap-4 text-white font-bold text-lg"><Zap className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] flex-shrink-0" size={24} fill="currentColor" /> Atualizações Vitalícias do Plano</div>
              </div>

              <Button 
                onClick={handleBuyClick} 
                className="w-full bg-green-500 hover:bg-green-400 text-black font-black text-2xl py-10 h-auto rounded-none shadow-[0_0_50px_rgba(34,197,94,0.6)] hover:shadow-[0_0_80px_rgba(34,197,94,0.8)] transition-all uppercase tracking-widest border-2 border-white/20 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                    {currentPlan.buttonText} <ArrowRight className="group-hover:translate-x-2 transition-transform" size={28} strokeWidth={3} />
                </span>
                {/* Efeito de brilho passando no botão */}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
              </Button>
              
              <p className="mt-8 text-sm text-gray-500 uppercase font-bold tracking-wider flex items-center justify-center gap-2 opacity-80">
                <ShieldCheck size={16} /> Compra Blindada via Mercado Pago • Acesso Imediato
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ DARK MODE EXTREME --- */}
      <section className="py-32 bg-black relative z-10 border-t-2 border-green-900/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-4xl font-black text-center mb-16 text-white uppercase tracking-tight">Perguntas de Quem Vai Mudar de Vida</h2>
          <div className="space-y-4 bg-gray-900/50 p-8 border border-gray-800">
            <FaqItem question="O PREÇO DE BLACK FRIDAY É VITALÍCIO?" answer="Ao garantir o plano ANUAL hoje, você trava pelos próximos 12 meses. É a melhor decisão financeira que você pode tomar agora." />
            <FaqItem question="MEUS DADOS ESTÃO REALMENTE SEGUROS?" answer="Sim. Nível bancário. Usamos criptografia de ponta a ponta. Nem nós temos acesso às suas senhas ou dados bancários brutos.Você pode solicitar a exclusão dos seus dados quando quiser." />
            <FaqItem question="FUNCIONA NO MEU CELULAR?" answer="Perfeitamente. O painel é um Web App responsivo e a IA do Assessor vive nativamente dentro do seu WhatsApp." />
            <FaqItem question="COMO ATIVO O ASSESSOR IA?" answer="Imediatamente após a compra, você acessa seu painel e conecta seu número de WhatsApp em segundos. É instantâneo." />
          </div>
        </div>
      </section>

      {/* Footer Deep Black */}
      <div className="bg-black border-t border-gray-900/50 pt-10">
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;