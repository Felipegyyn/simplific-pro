import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  CheckCircle, MessageCircle, BarChart3, CreditCard, Target, 
  ChevronDown, ChevronUp, ShieldCheck, Smartphone, 
  ArrowRight, Linkedin, Users, Calendar, Video,
  Wallet, FileText, TrendingUp, Brain, Search, Mic,
  XCircle, Minus,
  Heart, Send, Bookmark
} from 'lucide-react';

const fadeInVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-white/5 py-6">
      <button className="flex justify-between items-center w-full text-left focus:outline-none group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-sm md:text-base font-medium text-zinc-300 group-hover:text-white transition-colors tracking-wide">{question}</span>
        {isOpen ? <ChevronUp className="text-zinc-400" /> : <ChevronDown className="text-zinc-600" />}
      </button>
      {isOpen && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="mt-4 text-sm text-zinc-500 font-light leading-relaxed"
        >
          {answer}
        </motion.p>
      )}
    </div>
  );
};

const FounderCard = ({ name, role, description, image, linkedin }) => {
    return (
        <motion.div 
            whileHover={{ y: -10 }}
            className="group relative w-full max-w-sm mx-auto"
        >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-600 to-zinc-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition duration-700"></div>
            <div className="relative z-10 bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-2xl p-10 h-full flex flex-col items-center text-center transition-colors">
                <div className="relative w-32 h-32 mb-8 rounded-full overflow-hidden border border-white/10 group-hover:border-zinc-500 transition-all duration-700">
                    <img src={image} alt={name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">{name}</h3>
                <span className="text-zinc-500 font-light text-[10px] tracking-[0.2em] uppercase mb-6 block">{role}</span>
                <p className="text-zinc-400 text-sm font-light leading-relaxed">{description}</p>
                <div className="mt-8 pt-8 border-t border-white/5 w-full flex justify-center">
                   <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-3 hover:bg-white/5 rounded-full transition-all">
                       <Linkedin size={20} className="text-zinc-600 hover:text-white transition-colors" />
                   </a>
                </div>
            </div>
        </motion.div>
    );
};

const instagramPosts = [
  {
    id: 1,
    image: '/assets/insta_placeholder1.png', 
    link: 'https://www.instagram.com/reel/DbmQlVxO1np/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==',
    caption: 'Simplificando sua vida financeira com IA. #financas #ia #organizacao',
  },
  {
    id: 2,
    image: '/assets/insta_placeholder2.png', 
    link: 'https://www.instagram.com/reel/DUReZ1RDUjT/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==',
    caption: 'Inteligência artificial a favor do seu bolso. #investimentos #futuro',
  },
  {
    id: 3,
    image: '/assets/insta_placeholder3.png', 
    link: 'https://www.instagram.com/p/DSbExK6jdBO/?utm_source=ig_web_copy_link&igsi=MzRlODBiNWFlZA==',
    caption: 'Controle total, na palma da sua mão. #app #controlefinanceiro',
  },
  {
    id: 4,
    image: '/assets/insta_placeholder4.png', 
    link: 'https://www.instagram.com/p/DSXyoOdDvlc/?utm_source=ig_web_copy_link&igsi=NTc4MTIwNjQ2YQ==',
    caption: 'Planeje hoje para viver melhor amanhã. #planejamento #educacaofinanceira',
  }
];

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
        badge: "MELHOR ESCOLHA"
      },
    monthly: {
      oldPrice: null,
      priceDisplay: "29,90",        
      priceSuffix: "/mês",  
      subDetail: "Sem fidelidade. Cancele quando quiser.",
      buttonText: "ASSINAR MENSAL",
      badge: "FLEXIBILIDADE"
    }
  };

  const currentPlan = pricing[billingCycle];

  const featureCategories = [
    {
      title: "Gestão do Dia a Dia",
      items: [
        { icon: Wallet, title: "Lançamentos Mágicos", desc: "Mande um áudio ou texto: 'Gastei 50 no iFood no Nubank'. O Simplific categoriza, deduz do limite e atualiza seu saldo na hora." },
        { icon: FileText, title: "Leitura de Comprovantes", desc: "Tirou foto da nota fiscal ou recebeu um comprovante de PIX? Envie a imagem para o WhatsApp e o Simplific anota tudo sozinho." },
        { icon: CreditCard, title: "Gestão de Cartões", desc: "Acompanhe limites disponíveis, pague faturas abertas e controle parcelamentos sem precisar abrir o aplicativo do banco." }
      ]
    },
    {
      title: "Patrimônio e Futuro",
      items: [
        { icon: Target, title: "Criação de Metas", desc: "Crie objetivos (ex: Viagem Europa) e injete valores diretamente pelo chat para ver seu patrimônio crescer a cada dia." },
        { icon: TrendingUp, title: "Mercado & Investimentos", desc: "Consulte cotações na bolsa (PETR4, MXRF11), veja notícias em tempo real e registre suas compras de ações e FIIs." },
        { icon: BarChart3, title: "Simulador Financeiro", desc: "Pergunte ao Simplific: 'Se eu financiar 50 mil em 48x a 1.5% ao mês, quanto pago?'. Ele faz cálculos matemáticos complexos para você." }
      ]
    },
    {
      title: "Produtividade Pessoal",
      items: [
        { icon: Video, title: "Agendamento Automático", desc: "Peça: 'Marque reunião com o Carlos'. O Simplific cria o evento na agenda, gera o link do Google Meet e envia o convite via WhatsApp." },
        { icon: Calendar, title: "Lembretes Inteligentes", desc: "Agende lembretes rápidos para cancelar assinaturas, pagar boletos ou cobrar pessoas. O Simplific te avisa direto no chat." },
        { icon: Users, title: "Conta Casal/Sócios", desc: "Adicione um segundo número de celular na sua conta. O Simplific sabe com quem está falando e mantém as finanças unificadas." }
      ]
    },
    {
      title: "Superpoderes do Simplific",
      items: [
        { icon: Mic, title: "Transcrição e Áudio", desc: "Esqueça botões e planilhas. Envie áudios enormes do trânsito. O Simplific transcreve, separa as tarefas e executa múltiplas ordens de uma vez." },
        { icon: Search, title: "Pesquisa na Internet", desc: "O Simplific sai do WhatsApp para pesquisar voos, hotéis, preços atualizados de produtos e notícias, trazendo os links de compra direto pra você." },
        { icon: Brain, title: "Memória Permanente", desc: "Conte fatos da sua vida. O Simplific guarda em sua memória de longo prazo o nome da sua esposa, filhos e bens, personalizando seu atendimento." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-black font-sans text-zinc-300 selection:bg-white/20 selection:text-white overflow-x-hidden">
      <div className="bg-black/50 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/[0.02]">
        <Navbar /> 
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-32 pb-40 md:pt-40 md:pb-56 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/[0.03] via-black to-black pointer-events-none" />
        
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">
          
          {/* BLOCO DE TEXTO */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInVariant}
            className="space-y-10 relative flex flex-col items-start text-left"
          >
            <div className="inline-flex items-center gap-3 bg-white/[0.02] border border-white/5 text-zinc-400 px-5 py-2 rounded-full text-[10px] font-light tracking-[0.2em] uppercase">
               <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse"></span> Disponível para novos assinantes
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter text-white">
              Sua vida financeira, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
                totalmente autônoma.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-500 font-light max-w-xl leading-relaxed text-justify md:text-left">
              O Simplific Pro é o primeiro <strong>Assessor Financeiro e Pessoal movido a inteligência no seu WhatsApp</strong>. Mande áudios, fotos ou textos e deixe a tecnologia organizar seu dinheiro e seus investimentos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-4 w-full md:w-auto">
              <Button 
                onClick={() => document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' })} 
                size="lg" 
                className="bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-widest uppercase h-16 px-10 rounded-none shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all w-full sm:w-auto"
              >
                Ver Oferta Especial
              </Button>

              <Button 
                onClick={() => navigate('/login')} 
                variant="outline" 
                className="h-16 px-10 rounded-none border-white/10 text-zinc-400 hover:bg-white/5 hover:text-white font-medium tracking-wide w-full sm:w-auto transition-all"
              >
                Já sou cliente
              </Button>
            </div>
            
            <p className="text-xs text-zinc-600 font-light tracking-wide flex items-center gap-2 mt-4">
                <ShieldCheck size={14} className="text-zinc-500" /> Cancelamento fácil a qualquer momento.
            </p>
          </motion.div>
          
          {/* --- VISUAL 1: APENAS CELULAR (Exclusivo MOBILE) --- */}
          <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative pt-12 flex justify-center items-center md:hidden"
          >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-white/[0.02] blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="relative border-zinc-900 bg-black border-[8px] rounded-[2.5rem] h-[520px] w-[270px] shadow-2xl overflow-hidden ring-1 ring-white/10">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[20px] w-[70px] bg-zinc-900 rounded-b-xl z-20"></div>
                <div className="rounded-[2rem] overflow-hidden h-full w-full bg-black">
                    <video className="w-full h-full object-cover opacity-80 mix-blend-screen" autoPlay muted loop playsInline poster="/assets/mobile_cover.png">
                        <source src="/assets/mobile_demo.mp4" type="video/mp4" />
                    </video>
                </div>
             </div>
          </motion.div>

          {/* --- VISUAL 2: ECOSSISTEMA COMPLETO (Exclusivo DESKTOP) --- */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1.2, ease: "easeOut" }}
             className="hidden md:flex relative justify-center items-center"
          >
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none"></div>
             
             <div className="relative transform scale-100 lg:scale-105 transition-transform duration-1000 origin-center">
                <motion.div 
                    animate={{ y: [0, -10, 0] }} 
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 transform translate-x-[-15%]"
                >
                    <div className="relative mx-auto border-zinc-900 bg-black border-[6px] rounded-t-2xl h-[294px] w-[512px] shadow-2xl ring-1 ring-white/5">
                        <div className="rounded-xl overflow-hidden h-full w-full bg-black">
                            <video className="w-full h-full object-cover opacity-80" autoPlay muted loop playsInline poster="/assets/dashboard_cover.png">
                                <source src="/assets/demo_video.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                    <div className="relative mx-auto bg-zinc-900 rounded-b-2xl h-[16px] w-[597px] shadow-xl border-t border-white/10">
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-b-lg w-[80px] h-[6px] bg-black"></div>
                    </div>
                </motion.div>

                <motion.div 
                    animate={{ y: [0, 10, 0] }} 
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-0 right-0 z-20 transform translate-x-[5%] translate-y-[10%]"
                >
                    <div className="relative border-zinc-900 bg-black border-[8px] rounded-[2.5rem] h-[380px] w-[190px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/10">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[20px] w-[60px] bg-zinc-900 rounded-b-xl z-20"></div>
                        <div className="rounded-[1.8rem] overflow-hidden h-full w-full bg-black">
                            <video className="w-full h-full object-cover opacity-80" autoPlay muted loop playsInline poster="/assets/mobile_cover.png">
                                <source src="/assets/mobile_demo.mp4" type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </motion.div>
             </div>
          </motion.div>
        </div>
      </header>

      {/* --- FAIXA DE VALIDACAO --- */}
      <div className="border-y border-white/[0.02] bg-zinc-950 py-20">
        <div className="container mx-auto px-6 text-center">
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-light mb-16">Porque visionários escolhem o Simplific</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 opacity-80">
                <div className="flex flex-col items-center"><span className="text-4xl font-black text-white tracking-tighter">+15 Anos</span><span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-3">Experiência Financeira</span></div>
                <div className="flex flex-col items-center"><span className="text-4xl font-black text-white tracking-tighter">24h/7</span><span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-3">Disponibilidade</span></div>
                <div className="flex flex-col items-center"><span className="text-4xl font-black text-white tracking-tighter">100%</span><span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-3">Criptografado</span></div>
                <div className="flex flex-col items-center"><span className="text-4xl font-black text-white tracking-tighter">4.9/5</span><span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-3">Satisfação C-Level</span></div>
            </div>
        </div>
      </div>

      {/* --- FUNCIONALIDADES --- */}
      <section id="beneficios" className="py-32 md:py-48 bg-black relative">
        <div className="container mx-auto px-6">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={fadeInVariant}
             className="text-center mb-32"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Tudo o que você precisa. <br className="hidden md:block"/><span className="text-zinc-500 font-light tracking-tight">Direto no WhatsApp.</span></h2>
            <p className="text-lg md:text-xl text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed">Esqueça a obrigação de abrir aplicativos complexos e categorizar gastos na mão. A nossa tecnologia trabalha para você.</p>
          </motion.div>

          <div className="space-y-32">
            {featureCategories.map((category, index) => (
              <motion.div 
                 key={index} 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, margin: "-100px" }}
                 variants={fadeInVariant}
                 className="relative"
              >
                <div className="flex flex-col items-center md:items-start mb-16">
                  <span className="text-[10px] text-zinc-600 tracking-[0.2em] uppercase font-light mb-4">{`0${index + 1} // Categoria`}</span>
                  <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{category.title}</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {category.items.map((item, idx) => (
                    <motion.div 
                       key={idx} 
                       whileHover={{ y: -8 }}
                       transition={{ duration: 0.4, ease: "easeOut" }}
                       className="p-10 bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-colors group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                        <div className="w-12 h-12 border border-white/10 text-zinc-400 flex items-center justify-center mb-10 group-hover:text-white transition-colors rounded-none">
                          <item.icon size={20} strokeWidth={1.5} />
                        </div>
                        <h4 className="text-lg font-bold text-white tracking-wide mb-4">{item.title}</h4>
                        <p className="text-zinc-500 font-light leading-relaxed text-sm">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="mt-40 bg-zinc-950 p-12 md:p-20 text-center border border-white/5 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none"></div>
             <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-8">Sua Sala de Comando <br className="hidden md:block"/><span className="text-zinc-600">Premium</span></h3>
             <p className="text-zinc-400 font-light max-w-2xl mx-auto mb-16 text-lg leading-relaxed">Enquanto o seu WhatsApp faz o trabalho sujo do dia a dia, a nossa Plataforma Web Premium gera gráficos profundos, fluxos de caixa e painéis belíssimos para você analisar seu patrimônio na tela grande.</p>
             <MessageCircle className="mx-auto text-zinc-700" size={48} strokeWidth={1} />
          </motion.div>
        </div>
      </section>

      {/* --- NOVA SEÇÃO: COMPARAÇÃO (US VS THEM) --- */}
      <section className="py-32 bg-zinc-950 border-t border-white/[0.02] relative">
        <div className="container mx-auto px-6 max-w-6xl">
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="text-center mb-24"
            >
                <span className="text-zinc-500 font-light tracking-[0.2em] text-[10px] uppercase mb-6 block">Evolução Natural</span>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">A armadilha da configuração <br className="hidden md:block"/>infinita acabou.</h2>
                <p className="text-zinc-400 font-light mt-8 max-w-2xl mx-auto text-lg leading-relaxed">Veja por que o Simplific Pro substitui ferramentas financeiras antigas que exigem trabalho manual e tempo precioso.</p>
            </motion.div>

            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="overflow-x-auto pb-8"
            >
                <div className="min-w-[800px] grid grid-cols-4 gap-0 items-center border border-white/5 bg-black">
                    
                    {/* Cabeçalho da Tabela */}
                    <div className="col-span-1 p-8 border-b border-white/5 border-r"></div>
                    <div className="text-center p-8 text-zinc-600 font-light uppercase tracking-widest text-[10px] border-b border-white/5 border-r">Planilhas</div>
                    <div className="text-center p-8 text-zinc-600 font-light uppercase tracking-widest text-[10px] border-b border-white/5 border-r">Apps Tradicionais</div>
                    <div className="text-center p-8 bg-white/[0.02] border-b border-white/5 text-white font-bold uppercase tracking-widest text-xs relative">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-white"></div>
                        Simplific Pro
                    </div>

                    {/* Linha 1 */}
                    <div className="col-span-1 p-8 text-zinc-400 font-light text-sm border-b border-white/5 border-r">Preenchimento Manual</div>
                    <div className="flex justify-center p-8 border-b border-white/5 border-r"><XCircle className="text-zinc-700" strokeWidth={1.5} /></div>
                    <div className="flex justify-center p-8 border-b border-white/5 border-r"><XCircle className="text-zinc-700" strokeWidth={1.5} /></div>
                    <div className="flex justify-center p-8 bg-white/[0.02] border-b border-white/5">
                        <span className="text-zinc-200 text-xs font-bold flex items-center gap-2"><CheckCircle size={16} strokeWidth={1.5}/> Automático via IA</span>
                    </div>

                    {/* Linha 2 */}
                    <div className="col-span-1 p-8 text-zinc-400 font-light text-sm border-b border-white/5 border-r">Interface Principal</div>
                    <div className="text-center p-8 text-zinc-600 text-xs tracking-widest uppercase border-b border-white/5 border-r">Computador</div>
                    <div className="text-center p-8 text-zinc-600 text-xs tracking-widest uppercase border-b border-white/5 border-r">App Pesado</div>
                    <div className="text-center p-8 bg-white/[0.02] border-b border-white/5 text-zinc-200 text-xs tracking-widest uppercase font-bold">
                        WhatsApp + Web
                    </div>

                    {/* Linha 3 */}
                    <div className="col-span-1 p-8 text-zinc-400 font-light text-sm border-b border-white/5 border-r">Lê Notas Fiscais e Áudio</div>
                    <div className="flex justify-center p-8 border-b border-white/5 border-r"><Minus className="text-zinc-800" strokeWidth={1} /></div>
                    <div className="flex justify-center p-8 border-b border-white/5 border-r"><Minus className="text-zinc-800" strokeWidth={1} /></div>
                    <div className="flex justify-center p-8 bg-white/[0.02] border-b border-white/5"><CheckCircle className="text-white" strokeWidth={1.5} /></div>

                    {/* Linha 4 */}
                    <div className="col-span-1 p-8 text-zinc-400 font-light text-sm border-b border-white/5 border-r">Agenda e Reuniões Automáticas</div>
                    <div className="flex justify-center p-8 border-b border-white/5 border-r"><Minus className="text-zinc-800" strokeWidth={1} /></div>
                    <div className="flex justify-center p-8 border-b border-white/5 border-r"><Minus className="text-zinc-800" strokeWidth={1} /></div>
                    <div className="flex justify-center p-8 bg-white/[0.02] border-b border-white/5"><CheckCircle className="text-white" strokeWidth={1.5} /></div>

                    {/* Linha 5 */}
                    <div className="col-span-1 p-8 text-zinc-400 font-light text-sm border-r border-white/5">Tempo gasto por dia</div>
                    <div className="text-center p-8 text-zinc-600 text-xs font-bold tracking-widest uppercase border-r border-white/5">20 Minutos</div>
                    <div className="text-center p-8 text-zinc-500 text-xs font-bold tracking-widest uppercase border-r border-white/5">10 Minutos</div>
                    <div className="text-center p-8 bg-white/[0.02]">
                        <span className="text-white font-black tracking-tighter text-2xl">10 Seg</span>
                    </div>

                </div>
            </motion.div>
        </div>
      </section>

      {/* --- OFERTA --- */}
      <section id="oferta" className="py-32 md:py-48 bg-black">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="text-center mb-16"
          >
            <span className="text-zinc-600 font-light tracking-[0.3em] text-[10px] uppercase mb-6 block">Welcome Offer</span>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">Sua autonomia <br className="hidden md:block"/>começa aqui.</h2>
            <p className="text-zinc-400 font-light text-lg">Selecione o plano ideal para as suas necessidades financeiras.</p>
          </motion.div>
          
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="flex justify-center mb-16"
          >
            <div className="bg-zinc-950 border border-white/5 p-1 flex relative rounded-none">
                <button onClick={() => setBillingCycle('annual')} className={`px-10 py-4 text-[10px] tracking-[0.2em] font-bold uppercase transition-all flex items-center gap-3 ${billingCycle === 'annual' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                    Anual
                    <span className={`text-[9px] px-2 py-1 font-black ${billingCycle === 'annual' ? 'bg-black text-white' : 'bg-zinc-800 text-zinc-300'}`}>-45%</span>
                </button>
                <button onClick={() => setBillingCycle('monthly')} className={`px-10 py-4 text-[10px] tracking-[0.2em] font-bold uppercase transition-all ${billingCycle === 'monthly' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}>
                    Mensal
                </button>
            </div>
          </motion.div>

          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="bg-zinc-950 border border-white/5 p-10 md:p-16 relative overflow-hidden transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="text-left space-y-6 flex-1">
                    <div className="inline-block border border-white/10 text-zinc-300 text-[10px] tracking-[0.2em] font-bold px-4 py-2 uppercase">
                        {currentPlan.badge}
                    </div>
                    <div>
                        {currentPlan.oldPrice && <p className="text-zinc-600 text-sm line-through font-light mb-2">{currentPlan.oldPrice}</p>}
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-light text-zinc-500">R$</span>
                            <span className="text-7xl md:text-8xl font-black text-white tracking-tighter">{currentPlan.priceDisplay}</span>
                            <span className="text-zinc-600 font-light text-xl tracking-wide">{currentPlan.priceSuffix}</span>
                        </div>
                    </div>
                    
                    <p className="text-zinc-400 font-light text-base border-l border-zinc-700 pl-6 py-2 leading-relaxed">
                        {currentPlan.subDetail}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 text-xs text-zinc-500 pt-4 uppercase tracking-widest">
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-zinc-300" strokeWidth={1.5} /> Acesso Imediato</span>
                        <span className="flex items-center gap-2"><CheckCircle size={14} className="text-zinc-300" strokeWidth={1.5} /> Compra Segura</span>
                    </div>
                </div>
                <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center md:items-end">
                      <Button onClick={handleBuyClick} className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 font-bold text-xs tracking-[0.2em] uppercase py-8 px-12 rounded-none transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                          {currentPlan.buttonText}
                      </Button>
                      <p className="text-center text-[10px] tracking-widest text-zinc-600 uppercase mt-6">Pagamento seguro via Asaas</p>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SEÇÃO DICAS NO INSTAGRAM --- */}
      <section className="py-32 bg-zinc-950 border-t border-white/[0.02]">
        <div className="container mx-auto px-6">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">Lifestyle Financeiro</h2>
            <p className="text-zinc-500 font-light text-lg">
              Insights diários para sua jornada. <a href="https://instagram.com/simplificpro.ia" target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-white font-medium transition-colors border-b border-zinc-700 hover:border-white pb-1">@simplificpro.ia</a>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {instagramPosts.map((post, index) => (
              <motion.div 
                 key={post.id} 
                 initial={{ opacity: 0, y: 40 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: index * 0.1 }}
                 viewport={{ once: true }}
                 whileHover={{ y: -8 }}
                 className="bg-black border border-white/5 flex flex-col group transition-all duration-500 hover:border-white/20"
              >
                {/* Header do Insta */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 border border-white/10 flex items-center justify-center">
                      <span className="text-zinc-400 text-[10px] font-bold tracking-widest">SP</span>
                    </div>
                    <span className="text-zinc-300 font-bold text-xs tracking-wide">simplificpro.ia</span>
                    <CheckCircle size={12} className="text-zinc-500" strokeWidth={2} />
                  </div>
                  <a href={post.link} target="_blank" rel="noreferrer" className="text-white text-[10px] uppercase tracking-widest font-bold hover:text-zinc-400 transition-colors">
                    Seguir
                  </a>
                </div>

                {/* Imagem do Post */}
                <a href={post.link} target="_blank" rel="noreferrer" className="relative aspect-square w-full bg-zinc-950 block overflow-hidden">
                  <img src={post.image} alt="Instagram post" className="w-full h-full object-cover filter grayscale opacity-70 transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x400/111/444?text=Post+Instagram'; }} />
                </a>

                {/* Rodapé de Ações */}
                <div className="p-6 bg-black">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-5">
                      <Heart size={20} strokeWidth={1.5} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
                      <MessageCircle size={20} strokeWidth={1.5} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
                      <Send size={20} strokeWidth={1.5} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
                    </div>
                    <Bookmark size={20} strokeWidth={1.5} className="text-zinc-400 hover:text-white cursor-pointer transition-colors" />
                  </div>
                  
                  {/* Legenda */}
                  <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-2">
                    <span className="text-zinc-300 font-bold mr-2">simplificpro.ia</span>
                    {post.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEÇÃO DOS FUNDADORES --- */}
      <section className="py-32 bg-black border-t border-white/[0.02] relative">
        <div className="container mx-auto px-6">
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="text-center mb-24"
            >
                <span className="text-zinc-600 font-light tracking-[0.3em] text-[10px] uppercase mb-6 block">Arquitetos</span>
                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">As mentes por trás <br className="hidden md:block"/>do Simplific</h2>
                <p className="text-zinc-500 font-light mt-8 max-w-2xl mx-auto text-lg leading-relaxed">Especialistas em finanças e tecnologia dedicados a construir a ferramenta que nós mesmos queríamos usar.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
                <FounderCard name="Felipe Viana" role="Finanças & Estratégia" image="/assets/felipe_viana.jpg" linkedin="https://www.linkedin.com/in/felipe-viana-87017376/" description="Economista especialista em controladoria com mais de 15 anos de mercado. Uniu gestão de patrimônio e tecnologia para democratizar o controle financeiro." />
                <FounderCard name="Michel Borges" role="Tecnologia & Inovação" image="/assets/michel_borges.jpg" linkedin="//www.linkedin.com/in/michel-borges-14218116a/" description="Estrategista apaixonado por arquitetura de software. Acredita que a tecnologia só faz sentido quando simplifica a vida humana de forma invisível." />
            </div>
        </div>
      </section>

      {/* --- SEÇÃO: TECH STACK --- */}
      <section className="py-24 bg-zinc-950 border-t border-white/[0.02]">
        <div className="container mx-auto px-6">
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="text-center mb-16"
            >
                <span className="text-zinc-600 font-light tracking-[0.3em] text-[10px] uppercase mb-4 block">Segurança Nível Global</span>
                <h3 className="text-2xl font-black text-white tracking-tighter">Powered by Big Tech</h3>
            </motion.div>
            <div className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
                <div className="group flex flex-col items-center space-y-5">
                    <div className="h-8 transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-105"><img src="/assets/logo_meta.png" alt="Tecnologia Meta" className="h-full object-contain" /></div>
                    <div className="text-center"><span className="block text-zinc-300 font-bold text-xs uppercase tracking-widest">WhatsApp API</span><span className="text-[9px] text-zinc-600 uppercase tracking-widest font-light mt-1 block">Oficial</span></div>
                </div>
                <div className="group flex flex-col items-center space-y-5">
                    <div className="h-6 transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-105"><img src="/assets/logo_twilio.png" alt="Infraestrutura Twilio" className="h-full object-contain" /></div>
                    <div className="text-center"><span className="block text-zinc-300 font-bold text-xs uppercase tracking-widest">Global Infra</span><span className="text-[9px] text-zinc-600 uppercase tracking-widest font-light mt-1 block">Latência Zero</span></div>
                </div>
                <div className="group flex flex-col items-center space-y-5">
                    <div className="h-6 transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-105"><img src="/assets/logo_google.png" alt="Google Cloud AI" className="h-full object-contain" /></div>
                    <div className="text-center"><span className="block text-zinc-300 font-bold text-xs uppercase tracking-widest">Artificial Intel</span><span className="text-[9px] text-zinc-600 uppercase tracking-widest font-light mt-1 block">Seguro</span></div>
                </div>
                {/* Integração Bancária - Open Finance */}
                <div className="group flex flex-col items-center space-y-5">
                    <div className="h-8 flex items-center justify-center transition-all duration-700 group-hover:scale-105">
                        <ShieldCheck size={28} strokeWidth={1.5} className="text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                    <div className="text-center"><span className="block text-zinc-300 font-bold text-xs uppercase tracking-widest">Open Finance</span><span className="text-[9px] text-zinc-600 uppercase tracking-widest font-light mt-1 block">100% Seguro</span></div>
                </div>
                {/* Reclame Aqui Dinâmico */}
                <div className="group flex flex-col items-center justify-center filter grayscale hover:grayscale-0 transition-all duration-700 opacity-80 hover:opacity-100">
                    <div id="ra-verified-seal" className="hover:scale-105 transition-transform duration-700"></div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FAQ ATUALIZADO --- */}
      <section className="py-32 bg-black border-t border-white/[0.02]">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.h2 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="text-4xl md:text-5xl font-black text-center mb-20 text-white tracking-tighter"
          >
            Dúvidas Frequentes
          </motion.h2>
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="space-y-2 border-t border-white/5"
          >
            <FaqItem 
                question="O plano mensal tem fidelidade?" 
                answer="Não. O valor é de R$ 29,90 mensais e você tem total liberdade. Pode usar por um mês e cancelar no próximo se desejar, sem multas ou taxas surpresas." 
            />
            <FaqItem question="Posso parcelar o plano anual?" answer="Sim! O plano anual de R$ 199,00 oferece o maior desconto e você pode parcelá-lo em até 12x no cartão de crédito." />
            <FaqItem question="Meus dados bancários ficam salvos?" answer="Nós não temos acesso às suas senhas bancárias e não realizamos movimentações. Usamos provedores de Open Finance certificados pelo Banco Central." />
            <FaqItem question="Consigo usar apenas pelo WhatsApp?" answer="Sim! Essa é a essência do design. Você pode registrar gastos, consultar saldo e marcar reuniões apenas pelo WhatsApp. O Dashboard Web é opcional para visões mais profundas." />
            <FaqItem question="Como cancelo se não gostar?" answer="Diretamente pelo seu painel, com um clique. Sem ligar para ninguém, sem burocracia. Queremos que você fique pelos resultados, não por obrigação." />
          </motion.div>
        </div>
      </section>

      <div className="bg-zinc-950 border-t border-white/[0.02] pt-12">
        <Footer />
      </div>
    </div>
  );
};
 
export default HomePage;