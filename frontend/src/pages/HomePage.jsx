import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, MessageCircle, BarChart3, CreditCard, Target, 
  ChevronDown, ChevronUp, ShieldCheck, Smartphone, 
  ArrowRight, Linkedin, Users, Calendar, Video,
  Wallet, FileText, TrendingUp, Brain, Search, Mic // ÍCONES NOVOS
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
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative z-10 bg-black border border-gray-800 rounded-2xl p-6 h-full flex flex-col items-center text-center hover:bg-gray-900/50 transition-colors">
                <div className="relative w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-gray-800 group-hover:border-green-500 transition-all duration-500">
                    <img src={image} alt={name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase mb-1">{name}</h3>
                <span className="text-green-500 font-bold text-sm tracking-widest uppercase mb-4 block">{role}</span>
                <p className="text-gray-400 text-sm leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{description}</p>
                <div className="mt-6 pt-6 border-t border-gray-800 w-full flex justify-center">
                   <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-3 hover:bg-gray-800 rounded-full transition-all group-hover:scale-110">
                       <Linkedin size={24} className="text-gray-400 hover:text-white cursor-pointer" />
                   </a>
                </div>
            </div>
        </div>
    );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('annual');

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js";
    script.async = true;
    script.id = "ra-embed-verified-seal";
    script.setAttribute("data-id", "UWJISTEzOXlvV09HWFhuOTo0MS04NTEtMDI5LWZlbGlwZS12aWFuYS1kZS1vbGl2ZWlyYQ==");
    script.setAttribute("data-target", "ra-verified-seal");
    script.setAttribute("data-model", "compact_3");
    
    document.body.appendChild(script);

    return () => {
        const existingScript = document.getElementById("ra-embed-verified-seal");
        if (existingScript) {
            document.body.removeChild(existingScript);
        }
    };
  }, []);

  const handleBuyClick = () => {
    if (window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        content_name: billingCycle === 'monthly' ? 'Plano Mensal' : 'Plano Anual',
        value: billingCycle === 'monthly' ? 29.90 : 199.00,
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
    annual: {
        oldPrice: "R$ 358,80",
        priceDisplay: "16,58",
        priceSuffix: "/mês",
        subDetail: "No plano anual. Ou R$ 199,00 à vista",
        buttonText: "GARANTIR OFERTA ANUAL",
        badge: "💎 MELHOR ESCOLHA: 45% OFF"
      },
    monthly: {
      oldPrice: null,
      priceDisplay: "29,90",        
      priceSuffix: "/mês",  
      subDetail: "Sem fidelidade. Cancele quando quiser.",
      buttonText: "ASSINAR MENSAL",
      badge: "FLEXIBILIDADE TOTAL"
    }
  };

  const currentPlan = pricing[billingCycle];

  // ESTRUTURA DE FUNCIONALIDADES (O DOSSIÊ DO SIMPLIFIC)
  const featureCategories = [
    {
      title: "Gestão do Dia a Dia",
      color: "bg-blue-500",
      items: [
        { icon: Wallet, title: "Lançamentos Mágicos", desc: "Mande um áudio ou texto: 'Gastei 50 no iFood no Nubank'. O Simplific categoriza, deduz do limite e atualiza seu saldo na hora." },
        { icon: FileText, title: "Leitura de Comprovantes", desc: "Tirou foto da nota fiscal ou recebeu um comprovante de PIX? Envie a imagem para o WhatsApp e o Simplific anota tudo sozinho." },
        { icon: CreditCard, title: "Gestão de Cartões", desc: "Acompanhe limites disponíveis, pague faturas abertas e controle parcelamentos sem precisar abrir o aplicativo do banco." }
      ]
    },
    {
      title: "Patrimônio e Futuro",
      color: "bg-green-500",
      items: [
        { icon: Target, title: "Criação de Metas", desc: "Crie objetivos (ex: Viagem Europa) e injete valores diretamente pelo chat para ver seu patrimônio crescer a cada dia." },
        { icon: TrendingUp, title: "Mercado & Investimentos", desc: "Consulte cotações na bolsa (PETR4, MXRF11), veja notícias em tempo real e registre suas compras de ações e FIIs." },
        { icon: BarChart3, title: "Simulador Financeiro", desc: "Pergunte ao Simplific: 'Se eu financiar 50 mil em 48x a 1.5% ao mês, quanto pago?'. Ela faz cálculos matemáticos complexos para você." }
      ]
    },
    {
      title: "Produtividade Pessoal",
      color: "bg-purple-500",
      items: [
        { icon: Video, title: "Agendamento Automático", desc: "Peça: 'Marque reunião com o Carlos'. O Simplific cria o evento na agenda, gera o link do Google Meet e envia o convite via WhatsApp." },
        { icon: Calendar, title: "Lembretes Inteligentes", desc: "Agende lembretes rápidos para cancelar assinaturas, pagar boletos ou cobrar pessoas. O Simplific te avisa direto no chat." },
        { icon: Users, title: "Conta Casal/Sócios", desc: "Adicione um segundo número de celular na sua conta. O Simplific sabe com quem está falando e mantém as finanças unificadas." }
      ]
    },
    {
      title: "Superpoderes do Simplific",
      color: "bg-orange-500",
      items: [
        { icon: Mic, title: "Transcrição e Áudio", desc: "Esqueça botões e planilhas. Envie áudios enormes do trânsito. O Simplific transcreve, separa as tarefas e executa múltiplas ordens de uma vez." },
        { icon: Search, title: "Pesquisa na Internet", desc: "O Simplific sai do WhatsApp para pesquisar voos, hotéis, preços atualizados de produtos e notícias, trazendo os links de compra direto pra você." },
        { icon: Brain, title: "Memória Permanente", desc: "Conte fatos da sua vida. O Simplific guarda em sua memória de longo prazo o nome da sua esposa, filhos e bens, personalizando seu atendimento." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black font-sans text-gray-100 selection:bg-green-500 selection:text-black overflow-x-hidden">
      <div className="bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-green-900/30">
        <Navbar /> 
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-28 pb-32 md:pt-24 md:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-900/10 via-black to-black pointer-events-none" />
        
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
          
          {/* BLOCO DE TEXTO */}
          <div className="space-y-8 relative flex flex-col items-start text-left">
            
            <div className="inline-flex items-center gap-2 bg-gray-900 border border-gray-700 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Disponível para novos assinantes
            </div>
            
            <h1 className="text-4xl md:text-7xl font-bold leading-tight tracking-tight text-white">
              Sua vida financeira, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                totalmente autônoma.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed text-justify md:text-left">
              O Simplific Pro é o primeiro <strong>Assessor Financeiro e Pessoal movido a inteligência no seu WhatsApp</strong>. Mande áudios, fotos ou textos e deixe a tecnologia organizar seu dinheiro, sua agenda e seus investimentos sem você precisar abrir planilhas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full md:w-auto">
              <Button 
                onClick={() => document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' })} 
                size="lg" 
                className="bg-green-600 hover:bg-green-500 text-white font-bold text-lg h-16 px-10 rounded-lg shadow-lg shadow-green-900/20 transition-all w-full sm:w-auto"
              >
                Ver Oferta Especial <ArrowRight className="ml-2" />
              </Button>

              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="h-16 px-8 rounded-lg border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white font-medium w-full sm:w-auto"
              >
                Já sou cliente
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 flex items-center gap-2 mt-4">
                <ShieldCheck size={14} className="text-green-500" /> Cancelamento fácil a qualquer momento.
            </p>
          </div>
          
          {/* --- VISUAL 1: APENAS CELULAR (Exclusivo MOBILE) --- */}
          <div className="relative pt-8 flex justify-center items-center md:hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-green-500/20 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="relative border-gray-900 bg-gray-900 border-[10px] rounded-[2.5rem] h-[520px] w-[270px] shadow-2xl overflow-hidden ring-1 ring-gray-700/50 transform hover:scale-[1.02] transition-transform">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[20px] w-[70px] bg-black rounded-b-xl z-20"></div>
                <div className="rounded-[2rem] overflow-hidden h-full w-full bg-black">
                    <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="/assets/mobile_cover.png">
                        <source src="/assets/mobile_demo.mp4" type="video/mp4" />
                    </video>
                </div>
             </div>
          </div>

          {/* --- VISUAL 2: ECOSSISTEMA COMPLETO (Exclusivo DESKTOP) --- */}
          <div className="hidden md:flex relative justify-center items-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-green-500/10 blur-[100px] rounded-full pointer-events-none"></div>
             
             <div className="relative transform scale-100 lg:scale-108 transition-transform duration-700 origin-center">
                <div className="relative z-10 transform translate-x-[-15%]">
                    <div className="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-t-xl h-[294px] w-[512px] shadow-2xl">
                        <div className="rounded-lg overflow-hidden h-full w-full bg-black">
                            <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="/assets/dashboard_cover.png">
                                <source src="/assets/demo_video.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                    <div className="relative mx-auto bg-gray-800 rounded-b-xl rounded-t-sm h-[21px] w-[597px] shadow-xl">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-xl w-[96px] h-[8px] bg-gray-700"></div>
                    </div>
                </div>

                <div className="absolute bottom-0 right-0 z-20 transform translate-x-[5%] translate-y-[5%]">
                    <div className="relative border-gray-900 bg-gray-900 border-[10px] rounded-[2.5rem] h-[380px] w-[190px] shadow-2xl overflow-hidden ring-1 ring-gray-700/50">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[20px] w-[60px] bg-black rounded-b-xl z-20"></div>
                        <div className="rounded-[1.8rem] overflow-hidden h-full w-full bg-black">
                            <video className="w-full h-full object-cover" autoPlay muted loop playsInline poster="/assets/mobile_cover.png">
                                <source src="/assets/mobile_demo.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
             </div>
          </div>

        </div>
      </header>

      {/* --- FAIXA DE VALIDACAO --- */}
      <div className="border-y border-gray-900 bg-gray-950/50 py-12">
        <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-bold mb-8">Porque empreendedores e casais escolhem o Simplific</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">+15 Anos</span><span className="text-xs text-gray-500">De experiência dos fundadores</span></div>
                <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">24h/7</span><span className="text-xs text-gray-500">Disponibilidade do Simplific</span></div>
                <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">100%</span><span className="text-xs text-gray-500">Seguro e Criptografado</span></div>
                <div className="flex flex-col items-center"><span className="text-3xl font-black text-white">4.9/5</span><span className="text-xs text-gray-500">Satisfação dos usuários</span></div>
            </div>
        </div>
      </div>

      {/* --- FUNCIONALIDADES (O DOSSIÊ REFORMULADO) --- */}
      <section id="beneficios" className="py-32 bg-black relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Tudo o que você precisa. <span className="text-green-500">Direto no WhatsApp.</span></h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">Esqueça a obrigação de abrir aplicativos e categorizar gastos na mão. A nossa tecnologia trabalha para você, não o contrário.</p>
          </div>

          <div className="space-y-16">
            {featureCategories.map((category, index) => (
              <div key={index} className="relative">
                {/* Linha da Categoria */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={`h-10 w-2 rounded-full ${category.color}`}></div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white">{category.title}</h3>
                </div>
                
                {/* Grid de Cards da Categoria */}
                <div className="grid md:grid-cols-3 gap-6">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="p-8 bg-gray-900/30 rounded-2xl border border-gray-800 hover:border-gray-600 hover:bg-gray-900/80 transition-all group">
                        <div className="w-12 h-12 bg-gray-800 text-gray-300 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-green-400 group-hover:bg-green-900/20 transition-all">
                          <item.icon size={24} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-3">{item.title}</h4>
                        <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Destaque Plataforma Web */}
          <div className="mt-24 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-center border border-gray-700 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[80px] rounded-full pointer-events-none"></div>
             <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Acompanhe tudo na sua Sala de Comando 🖥️</h3>
             <p className="text-gray-300 max-w-2xl mx-auto mb-8">Enquanto o seu WhatsApp faz o trabalho sujo do dia a dia, a nossa Plataforma Web Premium gera gráficos profundos, fluxos de caixa e painéis lindíssimos para você analisar seu patrimônio na tela grande.</p>
             <MessageCircle className="mx-auto text-green-500 opacity-50" size={48} />
          </div>

        </div>
      </section>

      {/* --- OFERTA (ATUALIZADA) --- */}
      <section id="oferta" className="py-24 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-green-500 font-bold tracking-wider text-sm uppercase mb-2 block">Welcome Offer</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Comece sem compromisso</h2>
            <p className="text-gray-400">Preparamos uma condição especial para você ter seu próprio assessor.</p>
          </div>
          
          <div className="flex justify-center mb-10">
            <div className="bg-gray-900 p-1 rounded-lg inline-flex relative">
                <button onClick={() => setBillingCycle('annual')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                    Anual
                    <span className="bg-white text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-black">-45%</span>
                </button>
                <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                    Mensal
                </button>
            </div>
          </div>

          <div className="bg-black border border-gray-700 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-left space-y-4 flex-1">
                    <div className="inline-block bg-green-900/30 text-green-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {currentPlan.badge}
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm line-through font-medium mb-1">{currentPlan.oldPrice}</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-400">R$</span>
                            <span className="text-6xl font-bold text-white tracking-tighter">{currentPlan.priceDisplay}</span>
                            <span className="text-gray-500 font-medium text-lg">{currentPlan.priceSuffix}</span>
                        </div>
                    </div>
                    
                    <p className="text-gray-300 font-medium text-lg border-l-4 border-green-500 pl-4 py-1">
                        {currentPlan.subDetail}
                    </p>

                    <div className="flex gap-4 text-sm text-gray-500 pt-2">
                        <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-600" /> Acesso Imediato</span>
                        <span className="flex items-center gap-1"><CheckCircle size={16} className="text-green-600" /> Compra Segura</span>
                    </div>
                </div>
                <div className="w-full md:w-auto flex-shrink-0">
                      <Button onClick={handleBuyClick} className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-bold text-lg py-8 px-10 rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                          {currentPlan.buttonText} <ArrowRight className="ml-2" />
                      </Button>
                      <p className="text-center text-xs text-gray-600 mt-3">Pagamento seguro via Asaas</p>
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
                <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Não somos apenas um app. Somos especialistas em finanças e tecnologia dedicados a construir a ferramenta que nós mesmos queríamos usar.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                <FounderCard name="Felipe Viana" role="Co-Founder & Finanças" image="/assets/felipe_viana.jpg" linkedin="https://www.linkedin.com/in/felipe-viana-87017376/" description="Economista especialista em controladoria financeira com mais de 15 anos de mercado. Uniu sua experiência sólida em gestão de patrimônio com a paixão por tecnologia para criar uma solução que democratiza o controle financeiro de alto nível." />
                <FounderCard name="Michel Borges" role="Co-Founder & Tecnologia" image="/assets/michel_borges.jpg" linkedin="//www.linkedin.com/in/michel-borges-14218116a/" description="Publicitário e estrategista apaixonado por vendas e inovação. Acredita que a tecnologia só faz sentido quando simplifica a vida das pessoas. Responsável por transformar a complexidade financeira em uma experiência fluida e intuitiva." />
            </div>
        </div>
      </section>

      {/* --- SEÇÃO: TECH STACK --- */}
      <section className="py-16 bg-gray-950 border-t border-gray-900">
        <div className="container mx-auto px-4">
            <div className="text-center mb-10">
                <span className="text-green-500 font-bold tracking-widest text-xs uppercase mb-2 block">Segurança de Nível Global</span>
                <h3 className="text-2xl font-bold text-white">Powered by Big Tech</h3>
                <p className="text-gray-500 text-sm mt-2">Utilizamos a infraestrutura oficial das maiores empresas de tecnologia do mundo.</p>
            </div>
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-10 md:gap-16">
                <div className="group flex flex-col items-center space-y-4">
                    <div className="h-10 transition-all duration-500 hover:scale-105"><img src="/assets/logo_meta.png" alt="Tecnologia Meta" className="h-full object-contain" /></div>
                    <div className="text-center"><span className="block text-white font-bold text-sm">WhatsApp Business API</span><span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Integração Oficial</span></div>
                </div>
                <div className="group flex flex-col items-center space-y-4">
                    <div className="h-8 transition-all duration-500 hover:scale-105"><img src="/assets/logo_twilio.png" alt="Infraestrutura Twilio" className="h-full object-contain" /></div>
                    <div className="text-center"><span className="block text-white font-bold text-sm">Infraestrutura Global</span><span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Latência Zero</span></div>
                </div>
                <div className="group flex flex-col items-center space-y-4">
                    <div className="h-8 transition-all duration-500 hover:scale-105"><img src="/assets/logo_google.png" alt="Google Cloud AI" className="h-full object-contain" /></div>
                    <div className="text-center"><span className="block text-white font-bold text-sm">Artificial Intelligence</span><span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Processamento Seguro</span></div>
                </div>
                {/* Reclame Aqui Dinâmico */}
                <div className="group flex flex-col items-center justify-center">
                    <div id="ra-verified-seal" className="hover:scale-105 transition-transform duration-500"></div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FAQ ATUALIZADO --- */}
      <section className="py-24 bg-gray-950/50 border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Dúvidas Frequentes</h2>
          <div className="space-y-4">
            <FaqItem 
                question="O plano mensal tem fidelidade?" 
                answer="Não. O valor é de R$ 29,90 mensais e você tem total liberdade. Pode usar por um mês e cancelar no próximo se desejar, sem multas ou taxas surpresas." 
            />
            <FaqItem question="Posso parcelar o plano anual?" answer="Sim! O plano anual de R$ 199,00 oferece o maior desconto (apenas R$ 16,58/mês) e você pode parcelá-lo em até 12x no cartão de crédito." />
            <FaqItem question="Meus dados bancários ficam salvos?" answer="Nós não temos acesso às suas senhas bancárias e não realizamos movimentações. O Simplific apenas lê e organiza as informações para você. Usamos criptografia de ponta a ponta com segurança nível bancário." />
            <FaqItem question="Consigo usar apenas pelo WhatsApp?" answer="Sim! Essa é a mágica. Você pode registrar gastos, consultar saldo, marcar reuniões e pedir relatórios apenas mandando áudios ou textos no WhatsApp. O Dashboard Web serve para quando você quiser uma visão analítica mais profunda." />
            <FaqItem question="Como cancelo se não gostar?" answer="Diretamente pelo seu painel, com um clique. Sem ligar para ninguém, sem burocracia. Queremos que você fique pelos resultados, não por obrigação." />
          </div>
        </div>
      </section>

      <div className="bg-black border-t border-gray-900 pt-10">
        <Footer />
      </div>
    </div>
  );
};
 
export default HomePage;