import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, MessageCircle, BarChart3, CreditCard, Target, 
  ChevronDown, ChevronUp, ShieldCheck, Smartphone, 
  Zap, Star, Sparkles, Flame, Timer, ArrowRight, Users, Linkedin, BadgeCheck
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

const FounderCard = ({ name, role, description, image, linkedin }) => {
    return (
        <div className="group relative w-full max-w-sm mx-auto">
            {/* Moldura Neon */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            
            <div className="relative z-10 bg-black border border-gray-800 rounded-2xl p-6 h-full flex flex-col items-center text-center hover:bg-gray-900/50 transition-colors">
                
                {/* Imagem */}
                <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-gray-800 group-hover:border-green-500 transition-all duration-500">
                    <img 
                        src={image} 
                        alt={name} 
                        className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                    />
                </div>

                <h3 className="text-2xl font-black text-white uppercase mb-1">{name}</h3>
                <span className="text-green-500 font-bold text-sm tracking-widest uppercase mb-4 block">{role}</span>
                
                <p className="text-gray-400 text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                    {description}
                </p>

                <div className="mt-6 pt-6 border-t border-gray-800 w-full flex justify-center">
                   <a 
                     href={linkedin} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="p-3 hover:bg-gray-800 rounded-full transition-all group-hover:scale-110" 
                   >
                       <Linkedin size={24} className="text-gray-400 hover:text-white cursor-pointer" />
                   </a>
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const handleBuyClick = () => {
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

  const pricing = {
    monthly: {
      oldPrice: "R$ 89,90",
      price: "4,90",        
      period: "NO 1º MÊS",  
      description: "Condição exclusiva para novos membros. Depois R$ 24,90/mês.",
      buttonText: "ATIVAR ACESSO POR R$ 4,90",
      badge: "💎 WELCOME OFFER: INICIE QUASE GRÁTIS"
    },
    annual: {
        oldPrice: "R$ 298,80", 
        price: "198,90",
        period: "ANO (À VISTA)",
        description: "Equivalente a R$ 16,57/mês. O menor valor histórico.",
        buttonText: "GARANTIR OFERTA ANUAL",
        badge: "💎 SMART CHOICE: R$ 100 OFF"
      }
  };

  const currentPlan = pricing[billingCycle];

  return (
    <div className="min-h-screen bg-black font-sans text-gray-100 selection:bg-green-500 selection:text-black overflow-x-hidden">
      {/* Navbar Deep Black */}
      <div className="bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-green-900/30">
        <Navbar /> 
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-24 pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black pointer-events-none" />
        
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10 relative">
            
            <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Disponível para novos assinantes
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white">
              Sua vida financeira, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                finalmente organizada.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
              O Simplific Pro une a inteligência de um <strong>Assessor Financeiro via IA no WhatsApp</strong> com a clareza de um Dashboard profissional. Tenha controle total sem perder tempo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' })} 
                size="lg" 
                className="bg-green-600 hover:bg-green-500 text-white font-bold text-lg h-16 px-10 rounded-lg shadow-lg shadow-green-900/20 transition-all w-full sm:w-auto"
              >
                Começar Teste (R$ 4,90) <ArrowRight className="ml-2" />
              </Button>

              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="h-16 px-8 rounded-lg border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white font-medium"
              >
                Já sou cliente
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-2 mt-4">
                <ShieldCheck size={14} className="text-green-500" /> Cancelamento fácil a qualquer momento. Sem letras miúdas.
            </p>
          </div>
          
          {/* MOCKUP DO NOTEBOOK COM VÍDEO (CSS PURO) */}
          <div className="relative hidden md:block pt-10">
             {/* Efeito Glow atrás do notebook */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-500/20 blur-[100px] rounded-full"></div>
             
             {/* Estrutura do Notebook */}
             <div className="relative z-10 transform hover:scale-[1.02] transition-transform duration-700">
                {/* Tampa do Notebook (Tela) */}
                <div className="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-t-xl h-[172px] max-w-[301px] md:h-[294px] md:max-w-[512px] shadow-2xl">
                    <div className="rounded-lg overflow-hidden h-full w-full bg-black">
                        {/* O VÍDEO ENTRA AQUI */}
                        <video 
                            className="w-full h-full object-cover" 
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                            poster="/assets/dashboard_cover.png" 
                        >
                            {/* Salve o vídeo como demo_video.mp4 na pasta public/assets */}
                            <source src="/assets/demo_video.mp4" type="video/mp4" />
                            Seu navegador não suporta vídeos.
                        </video>
                    </div>
                </div>
                
                {/* Base do Notebook (Teclado/Trackpad) */}
                <div className="relative mx-auto bg-gray-800 rounded-b-xl rounded-t-sm h-[17px] max-w-[351px] md:h-[21px] md:max-w-[597px] shadow-xl">
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[56px] h-[5px] md:w-[96px] md:h-[8px] bg-gray-700"></div>
                </div>
             </div>
          </div>

        </div>
      </header>

      {/* --- FAIXA DE VALIDACAO --- */}
      <div className="border-y border-gray-900 bg-gray-950/50 py-12">
        <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-8">Porque mais de 1.000 pessoas escolheram o Simplific</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white">+15 Anos</span>
                    <span className="text-xs text-gray-500">De experiência dos fundadores</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white">24h/7</span>
                    <span className="text-xs text-gray-500">Disponibilidade da IA</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white">100%</span>
                    <span className="text-xs text-gray-500">Seguro e Criptografado</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-white">4.9/5</span>
                    <span className="text-xs text-gray-500">Satisfação dos usuários</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- FUNCIONALIDADES --- */}
      <section id="beneficios" className="py-32 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Tudo o que você precisa. <span className="text-green-500">Nada do que sobra.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Desenvolvemos uma ferramenta focada em resultado prático. Sem gráficos complexos que ninguém entende.
            </p>
          </div>
        
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: "Visão 360º", desc: "Seu patrimônio, gastos e receitas em uma única tela limpa e intuitiva." },
              { icon: MessageCircle, title: "IA no WhatsApp", desc: "Converse com suas finanças. Mande áudios, textos ou fotos e a IA registra tudo." },
              { icon: Target, title: "Metas Reais", desc: "Defina objetivos e o sistema te diz exatamente quanto economizar por dia para chegar lá." },
              { icon: CreditCard, title: "Gestão de Cartões", desc: "Controle datas de vencimento e limites para nunca mais pagar juros." },
              { icon: Smartphone, title: "Zero Digitação", desc: "Esqueça planilhas manuais. A tecnologia trabalha para você, não o contrário." },
              { icon: ShieldCheck, title: "Investimentos", desc: "Integração inteligente para você acompanhar a evolução do seu patrimônio." },
            ].map((item, index) => (
              <div key={index} className="p-8 bg-gray-900/30 rounded-xl border border-gray-800 hover:border-green-500/50 hover:bg-gray-900 transition-all group">
                  <div className="w-12 h-12 bg-green-900/20 text-green-500 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <item.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- OFERTA --- */}
      <section id="oferta" className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="text-center mb-12">
            <span className="text-green-500 font-bold tracking-wider text-sm uppercase mb-2 block">Welcome Offer</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Comece sem compromisso
            </h2>
            <p className="text-gray-400">
                Preparamos uma condição especial para você conhecer a plataforma.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <div className="bg-gray-900 p-1 rounded-lg inline-flex relative">
                <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                    Mensal
                </button>
                <button onClick={() => setBillingCycle('annual')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                    Anual
                    <span className="bg-white text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-black">-30%</span>
                </button>
            </div>
          </div>

          <div className="bg-black border border-gray-700 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left space-y-4 flex-1">
                    <div className="inline-block bg-green-900/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {billingCycle === 'monthly' ? 'Trial Estendido' : 'Melhor Escolha'}
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm line-through font-medium">{currentPlan.oldPrice}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-white">R$ {currentPlan.price}</span>
                            <span className="text-gray-500 font-medium">/{billingCycle === 'monthly' ? '1º mês' : 'ano'}</span>
                        </div>
                    </div>
                    <p className="text-gray-300 font-medium text-lg border-l-4 border-green-500 pl-4">
                        {currentPlan.description}
                    </p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-600" /> Acesso Imediato</span>
                        <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-600" /> Cancelamento Online</span>
                    </div>
                </div>

                <div className="w-full md:w-auto flex-shrink-0">
                      <Button 
                        onClick={handleBuyClick} 
                        className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-bold text-lg py-8 px-10 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                      >
                        {currentPlan.buttonText} <ArrowRight className="ml-2" />
                      </Button>
                      <p className="text-center text-xs text-gray-600 mt-3">Pagamento seguro via Mercado Pago</p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO DOS FUNDADORES --- */}
      <section className="py-24 bg-black border-t border-gray-900 relative">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <span className="text-green-500 font-bold tracking-widest text-sm uppercase mb-2 block">Quem Somos</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white">Mentes por trás do Simplific</h2>
                <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                    Não somos apenas um app. Somos especialistas em finanças e tecnologia dedicados a construir a ferramenta que nós mesmos queríamos usar.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                {/* Fundador 1 */}
                <FounderCard 
                    name="Felipe Viana"
                    role="Co-Founder & Finanças"
                    image="/assets/felipe_viana.jpg"
                    linkedin="https://www.linkedin.com/in/felipe-viana-87017376/" 
                    description="Economista especialista em controladoria financeira com mais de 15 anos de mercado. Uniu sua experiência sólida em gestão de patrimônio com a paixão por tecnologia para criar uma solução que democratiza o controle financeiro de alto nível."
                />

                {/* Fundador 2 */}
                <FounderCard 
                    name="Michel Borges"
                    role="Co-Founder & Tecnologia"
                    image="/assets/michel_borges.jpg"
                    linkedin="//www.linkedin.com/in/michel-borges-14218116a/"
                    description="Publicitário e estrategista apaixonado por vendas e inovação. Acredita que a tecnologia só faz sentido quando simplifica a vida das pessoas. Responsável por transformar a complexidade financeira em uma experiência fluida e intuitiva."
                />
            </div>
        </div>
      </section>

      {/* --- SEÇÃO: TECH STACK (Versão Segura "Powered By" & Full Color + RA) --- */}
      <section className="py-16 bg-gray-950 border-t border-gray-900">
        <div className="container mx-auto px-4">
            <div className="text-center mb-10">
                <span className="text-green-500 font-bold tracking-widest text-xs uppercase mb-2 block">
                    Segurança de Nível Global
                </span>
                <h3 className="text-2xl font-bold text-white">
                    Powered by Big Tech
                </h3>
                <p className="text-gray-500 text-sm mt-2">
                    Utilizamos a infraestrutura oficial das maiores empresas de tecnologia do mundo.
                </p>
            </div>
            
            {/* Ajustado gap e flex-wrap para 4 itens */}
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-10 md:gap-16">
                
                {/* Meta / WhatsApp */}
                <div className="group flex flex-col items-center space-y-4">
                    <div className="h-10 transition-all duration-500 hover:scale-105">
                        <img src="/assets/logo_meta.png" alt="Tecnologia Meta" className="h-full object-contain" />
                    </div>
                    <div className="text-center">
                        <span className="block text-white font-bold text-sm">WhatsApp Business API</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Integração Oficial</span>
                    </div>
                </div>

                {/* Twilio */}
                <div className="group flex flex-col items-center space-y-4">
                    <div className="h-8 transition-all duration-500 hover:scale-105">
                        <img src="/assets/logo_twilio.png" alt="Infraestrutura Twilio" className="h-full object-contain" />
                    </div>
                    <div className="text-center">
                        <span className="block text-white font-bold text-sm">Infraestrutura Global</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Latência Zero</span>
                    </div>
                </div>

                {/* Google */}
                <div className="group flex flex-col items-center space-y-4">
                    <div className="h-8 transition-all duration-500 hover:scale-105">
                        <img src="/assets/logo_google.png" alt="Google Cloud AI" className="h-full object-contain" />
                    </div>
                    <div className="text-center">
                        <span className="block text-white font-bold text-sm">Artificial Intelligence</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Processamento Seguro</span>
                    </div>
                </div>

                {/* Reclame Aqui (NOVO) */}
                <div className="group flex flex-col items-center space-y-4">
                    <div className="h-9 transition-all duration-500 hover:scale-105">
                        <img src="/assets/logo_reclameaqui.png" alt="Reclame Aqui" className="h-full object-contain" />
                    </div>
                    <div className="text-center">
                        <span className="block text-white font-bold text-sm">Reclame Aqui</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">RA Verificada</span>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-24 bg-gray-950/50 border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            <FaqItem question="O valor de R$ 4,90 é recorrente?" answer="Não. Este é um valor especial para o seu primeiro mês de uso, para que você possa testar a plataforma sem barreiras. Após 30 dias, a assinatura renova pelo valor padrão de R$ 24,90 mensais (menos de R$ 1 por dia)." />
            <FaqItem question="Meus dados bancários ficam salvos?" answer="Nós não temos acesso às suas senhas bancárias e não realizamos movimentações. O Simplific apenas lê e organiza as informações para você. Usamos criptografia de ponta a ponta com segurança nível bancário." />
            <FaqItem question="Consigo usar apenas pelo WhatsApp?" answer="Sim! Essa é a mágica. Você pode registrar gastos, consultar saldo e pedir relatórios apenas mandando áudios ou textos para nossa IA no WhatsApp. O Dashboard serve para quando você quiser uma visão mais profunda." />
            <FaqItem question="Como cancelo se não gostar?" answer="Diretamente pelo seu painel, com um clique. Sem ligar para ninguém, sem burocracia. Queremos que você fique pelos resultados, não por obrigação." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-black border-t border-gray-900 pt-10">
        <Footer />
      </div>
    </div>
  );
};
 
export default HomePage;