import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  CheckCircle, MessageCircle, BarChart3, CreditCard, Target, 
  ChevronDown, ChevronUp, ShieldCheck, Smartphone, 
  ArrowRight, Linkedin, Users, Calendar, Video,
  Wallet, FileText, TrendingUp, Brain, Search, Mic,
  Minus, Heart, Send, Bookmark, Image as ImageIcon, ArrowUpCircle,
  MessageSquare
} from 'lucide-react';

const fadeInVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#1a1a1a] py-6">
      <button className="flex justify-between items-center w-full text-left focus:outline-none group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-base md:text-lg font-medium text-white group-hover:text-white transition-colors">{question}</span>
        {isOpen ? <ChevronUp size={20} className="text-[#a3a3a3]" /> : <ChevronDown size={20} className="text-[#a3a3a3]" />}
      </button>
      {isOpen && (
        <motion.p 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="mt-4 text-[15px] text-[#a3a3a3] font-light leading-relaxed max-w-3xl"
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
            whileHover={{ y: -6 }}
            className="group relative w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-8 md:p-10 flex flex-col items-center text-center transition-all hover:border-[#222]"
        >
            <div className="relative w-40 h-40 mb-8 rounded-full overflow-hidden border border-[#1a1a1a]">
                <img src={image} alt={name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{name}</h3>
            <span className="text-[#4ade80] text-[11px] tracking-[0.2em] uppercase mb-6 font-medium">{role}</span>
            <p className="text-[#a3a3a3] text-[15px] font-light leading-relaxed mb-8">{description}</p>
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#111] border border-[#1a1a1a] rounded-full hover:bg-[#1a1a1a] transition-all">
                <Linkedin size={18} className="text-white" />
            </a>
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
        buttonText: "Garantir oferta anual",
        badge: "Melhor escolha"
      },
    monthly: {
      oldPrice: null,
      priceDisplay: "29,90",        
      priceSuffix: "/mês",  
      subDetail: "Sem fidelidade. Cancele quando quiser.",
      buttonText: "Assinar mensal",
      badge: "Flexibilidade"
    }
  };

  const currentPlan = pricing[billingCycle];

  const featureCategories = [
    {
      title: "Gestão do Dia a Dia",
      image: "/assets/insta_placeholder1.png",
      items: [
        { icon: Wallet, title: "Lançamentos Mágicos", desc: "Mande um áudio ou texto: 'Gastei 50 no iFood no Nubank'. O Simplific categoriza, deduz do limite e atualiza seu saldo na hora." },
        { icon: FileText, title: "Leitura de Comprovantes", desc: "Tirou foto da nota fiscal ou recebeu um comprovante de PIX? Envie a imagem para o WhatsApp e o Simplific anota tudo sozinho." },
        { icon: CreditCard, title: "Gestão de Cartões", desc: "Acompanhe limites disponíveis, pague faturas abertas e controle parcelamentos sem precisar abrir o aplicativo do banco." }
      ]
    },
    {
      title: "Patrimônio e Futuro",
      image: "/assets/insta_placeholder2.png",
      items: [
        { icon: Target, title: "Criação de Metas", desc: "Crie objetivos (ex: Viagem Europa) e injete valores diretamente pelo chat para ver seu patrimônio crescer a cada dia." },
        { icon: TrendingUp, title: "Mercado & Investimentos", desc: "Consulte cotações na bolsa (PETR4, MXRF11), veja notícias em tempo real e registre suas compras de ações e FIIs." },
        { icon: BarChart3, title: "Simulador Financeiro", desc: "Pergunte ao Simplific: 'Se eu financiar 50 mil em 48x a 1.5% ao mês, quanto pago?'. Ele faz cálculos matemáticos complexos para você." }
      ]
    },
    {
      title: "Produtividade Pessoal",
      image: "/assets/insta_placeholder3.png",
      items: [
        { icon: Video, title: "Agendamento Automático", desc: "Peça: 'Marque reunião com o Carlos'. O Simplific cria o evento na agenda, gera o link do Google Meet e envia o convite via WhatsApp." },
        { icon: Calendar, title: "Lembretes Inteligentes", desc: "Agende lembretes rápidos para cancelar assinaturas, pagar boletos ou cobrar pessoas. O Simplific te avisa direto no chat." },
        { icon: Users, title: "Conta Casal/Sócios", desc: "Adicione um segundo número de celular na sua conta. O Simplific sabe com quem está falando e mantém as finanças unificadas." }
      ]
    },
    {
      title: "Superpoderes do Simplific",
      image: "/assets/insta_placeholder4.png",
      items: [
        { icon: Mic, title: "Transcrição e Áudio", desc: "Esqueça botões e planilhas. Envie áudios enormes do trânsito. O Simplific transcreve, separa as tarefas e executa múltiplas ordens de uma vez." },
        { icon: Search, title: "Pesquisa na Internet", desc: "O Simplific sai do WhatsApp para pesquisar voos, hotéis, preços atualizados de produtos e notícias, trazendo os links de compra direto pra você." },
        { icon: Brain, title: "Memória Permanente", desc: "Conte fatos da sua vida. O Simplific guarda em sua memória de longo prazo o nome da sua esposa, filhos e bens, personalizando seu atendimento." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-white selection:bg-[#4ade80]/30 selection:text-white overflow-x-hidden">
      
      {/* NAVBAR PILL FLUTUANTE */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="w-full max-w-5xl bg-[#0a0a0a]/80 backdrop-blur-md border border-[#1a1a1a] rounded-full overflow-hidden pointer-events-auto shadow-2xl">
           <Navbar />
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-40 pb-48 md:pt-56 md:pb-64 overflow-hidden bg-[#050505]">
        <div className="container mx-auto px-6 relative z-10 flex flex-col items-center text-center">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInVariant}
            className="flex flex-col items-center w-full max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-[#0d0d0d] border border-[#1a1a1a] text-[#a3a3a3] px-4 py-1.5 rounded-full text-[10px] font-medium tracking-[0.2em] uppercase mb-8">
               <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> Disponível para novos assinantes
            </div>
            
            <h1 className="text-5xl md:text-[80px] font-black leading-[1.05] tracking-tighter text-white mb-8">
              Sua vida financeira,<br className="hidden md:block" /> totalmente autônoma.
            </h1>
            
            <p className="text-lg md:text-[20px] text-[#a3a3a3] font-light max-w-2xl leading-relaxed mb-10">
              O Simplific Pro é o primeiro Assessor Financeiro e Pessoal movido a inteligência no seu WhatsApp. Mande áudios, fotos ou textos e deixe a tecnologia organizar seu dinheiro e seus investimentos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto mb-10">
              <Button 
                onClick={() => document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' })} 
                className="bg-white hover:bg-gray-200 text-black font-medium text-base h-14 px-8 rounded-full transition-all w-full sm:w-auto"
              >
                Começar agora
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-[11px] text-[#a3a3a3] uppercase tracking-widest font-medium">
                <span>Segurança Open Finance</span>
                <span className="w-1 h-1 rounded-full bg-[#333]"></span>
                <span>Chat Oficial WhatsApp</span>
                <span className="w-1 h-1 rounded-full bg-[#333]"></span>
                <span>Cancele quando quiser</span>
            </div>
          </motion.div>
          
          {/* VISUAL MOCKUP HERO */}
          <motion.div 
             initial={{ opacity: 0, y: 50 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative mt-24 flex justify-center w-full max-w-4xl"
          >
              <div className="relative border-[#1a1a1a] bg-[#0d0d0d] border-[8px] rounded-[2.5rem] h-[600px] w-[300px] md:h-[680px] md:w-[340px] shadow-2xl overflow-hidden ring-1 ring-white/5 z-10">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-[24px] w-[90px] bg-[#1a1a1a] rounded-b-xl z-20"></div>
                <div className="rounded-[2rem] overflow-hidden h-full w-full bg-[#050505] relative">
                    {/* Chat simulation UI inside mockup */}
                    <div className="pt-16 px-6 flex flex-col items-center">
                        <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mb-4 border border-[#222]">
                            <MessageSquare size={24} className="text-white" />
                        </div>
                        <p className="text-white font-medium text-lg">Olá,</p>
                        <p className="text-[#a3a3a3] text-sm">Como eu posso te ajudar hoje?</p>
                    </div>
                    
                    {/* Input pattern */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%]">
                      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                        <div className="bg-[#1a1a1a] rounded-full px-3 py-1.5 text-[10px] text-white flex items-center gap-1.5 whitespace-nowrap"><CreditCard size={12}/> Gastos com cartão</div>
                        <div className="bg-[#1a1a1a] rounded-full px-3 py-1.5 text-[10px] text-white flex items-center gap-1.5 whitespace-nowrap"><Users size={12}/> Contas conectadas</div>
                      </div>
                      <div className="bg-[#111] border border-[#222] rounded-full flex items-center p-1 pl-4 w-full h-12">
                         <input type="text" placeholder="Converse com o Simplific" className="bg-transparent border-none outline-none text-xs text-white w-full placeholder-[#666]" readOnly />
                         <div className="flex gap-2 items-center pr-1 flex-shrink-0">
                           <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center"><ArrowUpCircle size={18} className="text-black" /></div>
                         </div>
                      </div>
                    </div>
                </div>
             </div>

             {/* FLOATING ELEMENTS - DESKTOP ONLY */}
             <div className="hidden lg:block">
                 {/* Left Floating Card: Transactions */}
                 <motion.div
                   animate={{ y: [0, -15, 0] }}
                   transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                   className="absolute -left-10 top-32 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-5 w-[300px] shadow-2xl z-20"
                 >
                   <div className="flex items-center gap-4 mb-5">
                     <div className="w-10 h-10 rounded-full bg-[#EA1D2C] flex items-center justify-center text-white font-black text-sm">iF</div>
                     <div>
                       <p className="text-white text-sm font-medium">Delivery de comida</p>
                       <p className="text-[#a3a3a3] text-[11px]">Alimentação • 28 de Jun</p>
                     </div>
                     <div className="ml-auto text-white font-bold text-sm">R$ 42,00</div>
                   </div>
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-[#FF5A5F] flex items-center justify-center text-white font-black text-sm">ab</div>
                     <div>
                       <p className="text-white text-sm font-medium">Hospedagem</p>
                       <p className="text-[#a3a3a3] text-[11px]">Viagens • 24 de Jun</p>
                     </div>
                     <div className="ml-auto text-white font-bold text-sm">R$ 120,00</div>
                   </div>
                 </motion.div>

                 {/* Right Floating Card: Chart */}
                 <motion.div
                   animate={{ y: [0, 15, 0] }}
                   transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                   className="absolute -right-4 bottom-32 bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 w-[260px] shadow-2xl z-20"
                 >
                   <p className="text-white text-sm font-medium mb-4">Gastos essa semana</p>
                   <div className="flex items-end justify-between gap-2 h-24 mb-3">
                     <div className="w-full bg-[#4ade80] rounded-sm h-[40%]"></div>
                     <div className="w-full bg-[#1a1a1a] rounded-sm h-[70%]"></div>
                     <div className="w-full bg-[#1a1a1a] rounded-sm h-[30%]"></div>
                     <div className="w-full bg-[#4ade80] rounded-sm h-[90%]"></div>
                     <div className="w-full bg-[#1a1a1a] rounded-sm h-[50%]"></div>
                     <div className="w-full bg-[#1a1a1a] rounded-sm h-[80%]"></div>
                   </div>
                   <div className="flex justify-between text-[#666] text-[10px] uppercase font-bold tracking-wider px-1">
                     <span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                   </div>
                 </motion.div>
                 
                 {/* Floating Avatars */}
                 <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute right-12 top-20 flex items-center gap-2 bg-[#0d0d0d] border border-[#1a1a1a] rounded-full p-1.5 pr-4 shadow-xl z-0">
                     <img src="/assets/felipe_viana.jpg" alt="Felipe" className="w-8 h-8 rounded-full" />
                     <span className="text-white text-xs font-medium">Felipe</span>
                 </motion.div>
                 <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute left-12 bottom-48 flex items-center gap-2 bg-[#0d0d0d] border border-[#1a1a1a] rounded-full p-1.5 pr-4 shadow-xl z-0">
                     <img src="/assets/michel_borges.jpg" alt="Michel" className="w-8 h-8 rounded-full" />
                     <span className="text-white text-xs font-medium">Michel</span>
                 </motion.div>
             </div>
          </motion.div>
        </div>
      </header>

      {/* --- FAIXA DE VALIDAÇÃO (STATS) --- */}
      <div className="border-y border-[#1a1a1a] bg-[#050505] py-12">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#1a1a1a]">
                <div className="flex flex-col items-center pt-4 md:pt-0">
                    <span className="text-4xl font-black text-white tracking-tighter mb-2">15+ Anos</span>
                    <span className="text-[10px] text-[#a3a3a3] uppercase tracking-[0.2em]">Experiência Financeira</span>
                </div>
                <div className="flex flex-col items-center pt-8 md:pt-0">
                    <span className="text-4xl font-black text-white tracking-tighter mb-2">24h/7</span>
                    <span className="text-[10px] text-[#a3a3a3] uppercase tracking-[0.2em]">Disponibilidade</span>
                </div>
                <div className="flex flex-col items-center pt-8 md:pt-0">
                    <span className="text-4xl font-black text-white tracking-tighter mb-2">100% Seguro</span>
                    <span className="text-[10px] text-[#a3a3a3] uppercase tracking-[0.2em]">Criptografia e Open Finance</span>
                </div>
            </div>
        </div>
      </div>

      {/* --- FUNCIONALIDADES (LAYOUT PIERRE ZIG-ZAG) --- */}
      <section id="beneficios" className="py-32 md:py-48 bg-[#050505]">
        <div className="container mx-auto px-6 max-w-6xl space-y-40">
          
          {featureCategories.map((category, index) => {
            const isReverse = index % 2 !== 0;
            return (
              <motion.div 
                 key={index} 
                 initial="hidden"
                 whileInView="visible"
                 viewport={{ once: true, margin: "-100px" }}
                 variants={fadeInVariant}
                 className={`flex flex-col ${isReverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24`}
              >
                {/* Imagem / Artwork */}
                <div className="w-full lg:w-1/2">
                    <div className="aspect-[4/3] md:aspect-square w-full rounded-[2rem] bg-[#0d0d0d] border border-[#1a1a1a] overflow-hidden relative shadow-2xl">
                        <img src={category.image} alt={category.title} className="w-full h-full object-cover opacity-70" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/800x800/0d0d0d/1a1a1a?text=Ilustração'; }} />
                    </div>
                </div>

                {/* Texto */}
                <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
                  <span className="text-[11px] text-[#a3a3a3] tracking-[0.2em] uppercase mb-4">{`0${index + 1} // ${category.title}`}</span>
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-8">
                     {category.items[0].title}.<br />
                     <span className="text-[#a3a3a3] font-light">E muito mais.</span>
                  </h2>
                  
                  <div className="space-y-6 mb-10 w-full">
                     {category.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-4">
                            <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#111] border border-[#222] flex items-center justify-center">
                                <item.icon size={14} className="text-[#a3a3a3]" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium mb-1">{item.title}</h4>
                                <p className="text-[#a3a3a3] text-[15px] font-light leading-relaxed">{item.desc}</p>
                            </div>
                        </div>
                     ))}
                  </div>

                  <Button 
                    onClick={() => document.getElementById('oferta').scrollIntoView({ behavior: 'smooth' })} 
                    className="bg-white hover:bg-gray-200 text-black font-medium px-8 h-12 rounded-full transition-all"
                  >
                    Começar agora
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* --- SEÇÃO DE COMPARAÇÃO (VS THEM) --- */}
      <section className="py-32 md:py-48 bg-[#050505] border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6 max-w-5xl">
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="text-center mb-20"
            >
                <h2 className="text-4xl md:text-[56px] font-black text-white tracking-tighter leading-tight mb-6">A armadilha da configuração <br className="hidden md:block"/>infinita acabou.</h2>
                <p className="text-[#a3a3a3] text-lg font-light max-w-2xl mx-auto">Veja por que o Simplific Pro substitui ferramentas financeiras antigas que exigem trabalho manual e tempo precioso.</p>
            </motion.div>

            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="overflow-x-auto pb-4"
            >
                <div className="min-w-[800px] border border-[#1a1a1a] rounded-[2rem] bg-[#050505] overflow-hidden">
                    <div className="grid grid-cols-4 items-center">
                        {/* Header */}
                        <div className="p-8 border-b border-r border-[#1a1a1a]"></div>
                        <div className="text-center p-8 text-[#a3a3a3] font-medium uppercase tracking-[0.2em] text-[10px] border-b border-r border-[#1a1a1a]">Planilhas</div>
                        <div className="text-center p-8 text-[#a3a3a3] font-medium uppercase tracking-[0.2em] text-[10px] border-b border-r border-[#1a1a1a]">Apps Antigos</div>
                        <div className="text-center p-8 bg-[#0d0d0d] border-b border-[#1a1a1a] text-white font-bold uppercase tracking-[0.2em] text-xs relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-[#4ade80]"></div>
                            Simplific Pro
                        </div>

                        {/* Linhas */}
                        {[
                          { label: "Preenchimento Manual", p: <Minus size={20} className="text-[#333] mx-auto"/>, a: <Minus size={20} className="text-[#333] mx-auto"/>, s: <CheckCircle size={20} className="text-[#4ade80] mx-auto" /> },
                          { label: "Interface Principal", p: <span className="text-[#666] text-[11px] uppercase tracking-widest font-medium">Computador</span>, a: <span className="text-[#666] text-[11px] uppercase tracking-widest font-medium">App Pesado</span>, s: <span className="text-white text-[11px] uppercase tracking-widest font-bold">WhatsApp</span> },
                          { label: "Lê Notas Fiscais e Áudio", p: <Minus size={20} className="text-[#333] mx-auto"/>, a: <Minus size={20} className="text-[#333] mx-auto"/>, s: <CheckCircle size={20} className="text-[#4ade80] mx-auto" /> },
                          { label: "Agenda e Reuniões", p: <Minus size={20} className="text-[#333] mx-auto"/>, a: <Minus size={20} className="text-[#333] mx-auto"/>, s: <CheckCircle size={20} className="text-[#4ade80] mx-auto" /> },
                          { label: "Tempo gasto por dia", p: <span className="text-[#666] text-[11px] uppercase tracking-widest font-medium">20 Minutos</span>, a: <span className="text-[#666] text-[11px] uppercase tracking-widest font-medium">10 Minutos</span>, s: <span className="text-white font-black text-xl">10 Seg</span> },
                        ].map((row, i, arr) => {
                          const isLast = i === arr.length - 1;
                          return (
                            <React.Fragment key={i}>
                              <div className={`p-6 md:p-8 text-[#a3a3a3] font-light text-[15px] border-r border-[#1a1a1a] ${!isLast ? 'border-b' : ''}`}>{row.label}</div>
                              <div className={`text-center p-6 md:p-8 border-r border-[#1a1a1a] ${!isLast ? 'border-b' : ''}`}>{row.p}</div>
                              <div className={`text-center p-6 md:p-8 border-r border-[#1a1a1a] ${!isLast ? 'border-b' : ''}`}>{row.a}</div>
                              <div className={`text-center p-6 md:p-8 bg-[#0d0d0d] ${!isLast ? 'border-b border-[#1a1a1a]' : ''}`}>{row.s}</div>
                            </React.Fragment>
                          );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* --- OFERTA / PREÇOS --- */}
      <section id="oferta" className="py-32 md:py-48 bg-[#050505] border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-[72px] font-black text-white tracking-tighter mb-6 leading-none">Escolha seu plano</h2>
            <p className="text-[#a3a3a3] font-light text-lg">Comece grátis. Evolua quando quiser. Economize 45% no plano anual.</p>
          </motion.div>
          
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="flex justify-center mb-16"
          >
            <div className="bg-[#0d0d0d] border border-[#1a1a1a] p-1.5 flex relative rounded-full">
                <button onClick={() => setBillingCycle('annual')} className={`px-8 py-3 text-[12px] font-medium rounded-full transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-white text-black' : 'text-[#a3a3a3] hover:text-white'}`}>
                    Anual
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${billingCycle === 'annual' ? 'bg-[#e5e5e5] text-black' : 'bg-[#1a1a1a] text-white'}`}>-45%</span>
                </button>
                <button onClick={() => setBillingCycle('monthly')} className={`px-8 py-3 text-[12px] font-medium rounded-full transition-all ${billingCycle === 'monthly' ? 'bg-white text-black' : 'text-[#a3a3a3] hover:text-white'}`}>
                    Mensal
                </button>
            </div>
          </motion.div>

          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-[2rem] p-10 md:p-14 relative shadow-2xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                <div className="text-left flex-1">
                    <div className="inline-block bg-[#1a1a1a] text-white rounded-full text-[10px] tracking-[0.2em] font-medium px-4 py-1.5 uppercase mb-6">
                        {currentPlan.badge}
                    </div>
                    <div>
                        {currentPlan.oldPrice && <p className="text-[#666] text-sm line-through font-light mb-1">{currentPlan.oldPrice}</p>}
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-light text-[#a3a3a3]">R$</span>
                            <span className="text-7xl md:text-[96px] font-black text-white tracking-tighter leading-none">{currentPlan.priceDisplay}</span>
                            <span className="text-[#666] font-light text-xl">/mês</span>
                        </div>
                    </div>
                    
                    <p className="text-[#a3a3a3] text-base mt-4 mb-8">
                        {currentPlan.subDetail}
                    </p>

                    <div className="flex flex-col gap-3 text-[14px] text-[#a3a3a3] font-light">
                        <span className="flex items-center gap-3"><CheckCircle size={16} className="text-[#4ade80]" /> Acesso Imediato à IA e Automações</span>
                        <span className="flex items-center gap-3"><CheckCircle size={16} className="text-[#4ade80]" /> Compra Segura e Criptografada</span>
                    </div>
                </div>
                <div className="w-full md:w-auto flex-shrink-0 flex flex-col items-center">
                      <Button onClick={handleBuyClick} className="w-full md:w-[240px] bg-white text-black hover:bg-gray-200 font-medium text-[15px] h-14 rounded-full transition-all">
                          {currentPlan.buttonText}
                      </Button>
                      <p className="text-center text-[10px] text-[#666] uppercase tracking-widest mt-4 font-medium">Pagamento via Asaas</p>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SEÇÃO DICAS NO INSTAGRAM --- */}
      <section className="py-32 md:py-48 bg-[#050505] border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Lifestyle Financeiro</h2>
            <p className="text-[#a3a3a3] font-light text-lg">
              Insights diários para sua jornada. <a href="https://instagram.com/simplificpro.ia" target="_blank" rel="noreferrer" className="text-white border-b border-[#333] hover:border-white transition-colors pb-0.5">@simplificpro.ia</a>
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {instagramPosts.map((post, index) => (
              <motion.div 
                 key={post.id} 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: index * 0.1 }}
                 viewport={{ once: true }}
                 whileHover={{ y: -4 }}
                 className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl flex flex-col overflow-hidden transition-transform"
              >
                {/* Header do Insta */}
                <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#111] border border-[#222] flex items-center justify-center">
                      <span className="text-[#a3a3a3] text-[9px] font-bold tracking-widest">SP</span>
                    </div>
                    <span className="text-white font-medium text-xs">simplificpro.ia</span>
                  </div>
                  <a href={post.link} target="_blank" rel="noreferrer" className="text-white text-[11px] font-medium hover:text-[#a3a3a3] transition-colors">
                    Seguir
                  </a>
                </div>

                {/* Imagem do Post */}
                <a href={post.link} target="_blank" rel="noreferrer" className="relative aspect-square w-full bg-[#111] block overflow-hidden">
                  <img src={post.image} alt="Instagram post" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x400/111/222?text=Post'; }} />
                </a>

                {/* Rodapé de Ações */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Heart size={20} className="text-[#a3a3a3] hover:text-white cursor-pointer transition-colors" />
                      <MessageCircle size={20} className="text-[#a3a3a3] hover:text-white cursor-pointer transition-colors" />
                      <Send size={20} className="text-[#a3a3a3] hover:text-white cursor-pointer transition-colors" />
                    </div>
                    <Bookmark size={20} className="text-[#a3a3a3] hover:text-white cursor-pointer transition-colors" />
                  </div>
                  
                  {/* Legenda */}
                  <p className="text-[13px] text-[#a3a3a3] font-light leading-relaxed line-clamp-2">
                    <span className="text-white font-medium mr-2">simplificpro.ia</span>
                    {post.caption}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SEÇÃO DOS FUNDADORES --- */}
      <section className="py-32 bg-[#050505] border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6">
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="text-center mb-20"
            >
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">Arquitetos do Simplific</h2>
                <p className="text-[#a3a3a3] font-light max-w-2xl mx-auto text-lg">Especialistas em finanças e tecnologia dedicados a construir a ferramenta que nós mesmos queríamos usar.</p>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <FounderCard name="Felipe Viana" role="Finanças & Estratégia" image="/assets/felipe_viana.jpg" linkedin="https://www.linkedin.com/in/felipe-viana-87017376/" description="Economista especialista em controladoria com mais de 15 anos de mercado. Uniu gestão de patrimônio e tecnologia para democratizar o controle financeiro." />
                <FounderCard name="Michel Borges" role="Tecnologia & Inovação" image="/assets/michel_borges.jpg" linkedin="//www.linkedin.com/in/michel-borges-14218116a/" description="Estrategista apaixonado por arquitetura de software. Acredita que a tecnologia só faz sentido quando simplifica a vida humana de forma invisível." />
            </div>
        </div>
      </section>

      {/* --- SEÇÃO: TECH STACK --- */}
      <section className="py-24 bg-[#050505] border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6">
            <motion.div 
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true }}
               variants={fadeInVariant}
               className="flex flex-col md:flex-row justify-between items-center gap-16 max-w-6xl mx-auto opacity-70"
            >
                <div className="group flex flex-col items-center gap-4">
                    <div className="h-6 filter grayscale group-hover:grayscale-0 transition-all duration-300"><img src="/assets/logo_meta.png" alt="Tecnologia Meta" className="h-full object-contain" /></div>
                    <span className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-medium">WhatsApp API</span>
                </div>
                <div className="group flex flex-col items-center gap-4">
                    <div className="h-5 filter grayscale group-hover:grayscale-0 transition-all duration-300"><img src="/assets/logo_twilio.png" alt="Infraestrutura Twilio" className="h-full object-contain" /></div>
                    <span className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-medium">Infra Global</span>
                </div>
                <div className="group flex flex-col items-center gap-4">
                    <div className="h-5 filter grayscale group-hover:grayscale-0 transition-all duration-300"><img src="/assets/logo_google.png" alt="Google Cloud AI" className="h-full object-contain" /></div>
                    <span className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-medium">Cloud AI</span>
                </div>
                <div className="group flex flex-col items-center gap-4">
                    <ShieldCheck size={24} className="text-[#666] group-hover:text-white transition-colors" />
                    <span className="text-[10px] text-[#666] uppercase tracking-[0.2em] font-medium">Open Finance</span>
                </div>
                <div className="group flex flex-col items-center justify-center filter grayscale hover:grayscale-0 transition-all duration-300">
                    <div id="ra-verified-seal" className="scale-90"></div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-32 md:py-48 bg-[#050505] border-t border-[#1a1a1a]">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.h2 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="text-4xl md:text-6xl font-black text-center mb-16 text-white tracking-tighter"
          >
            Dúvidas Frequentes
          </motion.h2>
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={fadeInVariant}
             className="border-t border-[#1a1a1a]"
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

      {/* --- FOOTER INLINE MINIMALISTA --- */}
      <footer className="bg-[#050505] border-t border-[#1a1a1a] pt-16 pb-8">
        <div className="container mx-auto px-6 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 tracking-tighter">Simplific Pro</h3>
                    <p className="text-[#666] text-sm">Seu assistente financeiro de IA direto no WhatsApp.</p>
                </div>
                <div className="flex gap-4">
                    <a href="https://instagram.com/simplificpro.ia" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                    </a>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-[#1a1a1a]">
                <p className="text-[11px] text-[#666]">Nosso atendimento técnico e operacional é realizado exclusivamente de segunda a sexta, das 10h às 16h.</p>
                <div className="flex gap-6">
                    <a href="/termos" className="text-[10px] uppercase tracking-widest text-[#666] hover:text-white transition-colors">Termos de Uso</a>
                    <a href="/privacidade" className="text-[10px] uppercase tracking-widest text-[#666] hover:text-white transition-colors">Privacidade</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};
 
export default HomePage;