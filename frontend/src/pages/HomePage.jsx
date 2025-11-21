import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar'; // <--- Importamos o componente
import Footer from '@/components/Footer'; // <--- Importamos o componente
import { 
  CheckCircle, 
  MessageCircle, 
  BarChart3, 
  CreditCard, 
  Target, 
  Calendar, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Smartphone,
  Map,
  PieChart,
  Scale
} from 'lucide-react';

// --- FAQ Component ---
const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 py-4">
      <button 
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-800">{question}</span>
        {isOpen ? <ChevronUp className="text-green-600" /> : <ChevronDown className="text-gray-500" />}
      </button>
      {isOpen && (
        <p className="mt-2 text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  // LINKS DE CHECKOUT
  const MONTHLY_CHECKOUT_LINK = "SEU_LINK_MENSAL_AQUI"; // Cole seu link aqui novamente
  const ANNUAL_CHECKOUT_LINK = "#"; // Cole seu link anual aqui quando tiver

  const handleBuyClick = () => {
    if (billingCycle === 'monthly') {
        window.location.href = MONTHLY_CHECKOUT_LINK;
    } else {
        if (ANNUAL_CHECKOUT_LINK !== "#") {
             window.location.href = ANNUAL_CHECKOUT_LINK;
        } else {
            alert("Link anual em breve!");
        }
    }
  };

  // Dados dos Planos
  const pricing = {
    monthly: {
      oldPrice: "R$ 89,90",
      price: "24,90",
      period: "Por mês",
      description: "Menos de um cafézinho por dia.",
      buttonText: "Quero assinar mensal",
      savings: null
    },
    annual: {
        oldPrice: "R$ 298,80", 
        price: "198,90",
        period: "Por ano (à vista)",
        description: "Equivalente a R$ 16,57 por mês.",
        buttonText: "Quero assinar anual",
        savings: "Economize R$ 100,00 no ano"
      }
  };

  const currentPlan = pricing[billingCycle];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- NAVBAR --- */}
      {/* Substituímos aquele monte de código por apenas uma linha: */}
      <Navbar />

      {/* --- HERO SECTION (Dobra Principal) --- */}
      <header className="relative overflow-hidden bg-gradient-to-br from-green-900 to-green-700 text-white pt-20 pb-32">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block bg-green-500/20 text-green-100 px-3 py-1 rounded-full text-sm font-semibold">
              🚀 Lançamento Especial
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Cansado da desordem financeira?
            </h1>
            <p className="text-lg md:text-xl text-green-100 opacity-90 max-w-lg">
              Assuma o controle e alcance a tão sonhada liberdade. O aplicativo completo que organiza suas finanças, planeja metas e te acompanha até no WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#oferta">
                <Button size="lg" className="bg-green-400 text-green-900 hover:bg-green-300 font-bold text-lg h-14 px-8 rounded-xl shadow-lg hover:shadow-green-400/50 transition-all w-full sm:w-auto">
                    Quero meu Simplific Pro
                </Button>
              </a>
              <Button onClick={() => navigate('/login')} variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8 rounded-xl">
                Já sou cliente
              </Button>
            </div>
            <p className="text-sm text-green-200 flex items-center gap-2">
              <ShieldCheck size={16} /> 7 dias de garantia incondicional
            </p>
          </div>
          
          {/* IMAGEM HERO */}
          <div className="relative hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500">
               <img 
                 src="/assets/image_745581.png"
                 alt="Dashboard Simplific Pro" 
                 className="rounded-xl w-full h-auto shadow-inner"
               />
            </div>
          </div>
        </div>
        
        {/* Onda SVG */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-white"></path>
          </svg>
        </div>
      </header>

      {/* --- SEÇÃO DE FUNCIONALIDADES (Benefícios) --- */}
      <section id="beneficios" className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como o Simplific Pro te Ajuda</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Cada módulo foi pensado para simplificar sua vida financeira e te dar o controle total que você sempre quis.</p>
        </div>

        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          {/* Cards de Funcionalidades */}
          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform"><BarChart3 size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Dashboard Inteligente</h3>
            <p className="text-gray-600 leading-relaxed">Visualize toda sua situação financeira em uma tela. Receitas, despesas, investimentos e metas.</p>
          </div>

           <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform"><Target size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Lançamentos Inteligentes</h3>
            <p className="text-gray-600 leading-relaxed">Registre receitas e despesas em segundos, na plataforma ou pelo whatsapp.</p>
          </div>

           <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform"><Map size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Planeje seus gastos</h3>
            <p className="text-gray-600 leading-relaxed">O módulo planejamento te ajuda a adquirir a tão sonhada liberdade financeira.</p>
          </div>

           <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform"><Scale size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Balanço Geral</h3>
            <p className="text-gray-600 leading-relaxed">Acompanhe fluxo de caixa, investimentos e cartões de crédito em relatórios inteligentes.</p>
          </div>

           <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform"><PieChart size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Carteira de Investimentos</h3>
            <p className="text-gray-600 leading-relaxed">Acompanhe sua carteira integrada com as principais corretoras.</p>
          </div>

           <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform"><Calendar size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Agenda de compromissos</h3>
            <p className="text-gray-600 leading-relaxed">Nunca mais esqueça um vencimento. Seja lembrado diretamente no Whatsapp.</p>
          </div>

          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform"><CreditCard size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Controle de Cartões</h3>
            <p className="text-gray-600 leading-relaxed">Gerencie todos seus cartões em um só lugar. Acompanhe limites e faturas.</p>
          </div>

           <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 mb-6 group-hover:scale-110 transition-transform"><Target size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Metas Ambiciosas</h3>
            <p className="text-gray-600 leading-relaxed">Transforme seus maiores sonhos em planos concretos e visualize suas conquistas.</p>
          </div>

          <div className="p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200 group">
            <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6 group-hover:scale-110 transition-transform"><Smartphone size={32} /></div>
            <h3 className="text-xl font-bold mb-3">Simplific IA</h3>
            <p className="text-gray-600 leading-relaxed">Tenha acesso ao chat inteligência Simplific na própria plataforma e faça tudo por lá.</p>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO DESTAQUE IA (WhatsApp) --- */}
      <section id="ia" className="py-20 bg-green-600 text-white overflow-hidden">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <img 
              src="/assets/image_74563a.png"
              alt="Chat WhatsApp Simplific" 
              className="rounded-2xl shadow-2xl border-4 border-green-400/30 mx-auto"
            />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-block bg-green-800/50 px-3 py-1 rounded-full text-sm font-semibold text-green-200">
              🤖 Tecnologia Exclusiva
            </div>
            <h2 className="text-3xl md:text-5xl font-bold">Seu Assessor Financeiro no WhatsApp</h2>
            <p className="text-green-100 text-lg leading-relaxed">
              Registre gastos, consulte seu orçamento, agende compromissos, receba lembretes e tire dúvidas diretamente do seu WhatsApp, por texto ou por áudio você escolhe.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3"><CheckCircle className="text-green-300" /> Acesso fácil e didático</li>
              <li className="flex items-center gap-3"><CheckCircle className="text-green-300" /> Integrado com principais corretoras</li>
              <li className="flex items-center gap-3"><CheckCircle className="text-green-300" /> Comandos por voz ou texto</li>
              <li className="flex items-center gap-3"><CheckCircle className="text-green-300" /> Sua plataforma direto no whatsapp</li>
            </ul>
            <a href="#oferta">
                <Button className="bg-white text-green-700 hover:bg-gray-100 font-bold text-lg mt-4 px-8 py-6 h-auto rounded-xl shadow-lg w-full sm:w-auto">
                Quero meu Assessor Agora
                </Button>
            </a>
          </div>
        </div>
      </section>

      {/* --- SEÇÃO DE OFERTA (Planos Mensal/Anual) --- */}
      <section id="oferta" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          
          {/* Toggle Mensal/Anual */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-200 p-1 rounded-full flex items-center relative">
                <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all relative z-10 ${billingCycle === 'monthly' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    Mensal
                </button>
                <button 
                    onClick={() => setBillingCycle('annual')}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all relative z-10 flex items-center ${billingCycle === 'annual' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    Anual
                    {billingCycle === 'annual' && (
                         <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase">Economize</span>
                    )}
                </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 relative">
            {/* Faixa de Economia (só aparece no anual) */}
            {currentPlan.savings && (
                <div className="bg-green-500 text-white text-center text-sm font-bold py-2 absolute top-0 w-full z-10">
                    🎉 {currentPlan.savings}
                </div>
            )}
            
            <div className={`bg-green-600 p-6 text-center ${currentPlan.savings ? 'mt-8' : ''}`}>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Sua Oportunidade</h2>
              <p className="text-green-100">Acesso ilimitado a todas as funcionalidades</p>
            </div>
            
            <div className="p-8 md:p-12 text-center">
              <div className="inline-block bg-yellow-100 border border-yellow-200 px-4 py-2 rounded-lg mb-6">
                <span className="text-yellow-800 font-medium text-sm line-through mr-2">{currentPlan.oldPrice}</span>
                <span className="text-yellow-800 font-bold">por apenas</span>
              </div>

              <div className="flex justify-center items-baseline gap-1 mb-2">
                <span className="text-2xl text-gray-500 font-medium">R$</span>
                <span className="text-6xl md:text-7xl font-extrabold text-green-600">{currentPlan.price}</span>
              </div>
              <p className="text-gray-500 mb-8 font-medium">{currentPlan.period}</p>

              <p className="text-sm text-gray-500 mb-8">
                ☕ {currentPlan.description}
              </p>

              <Button 
                onClick={handleBuyClick} 
                className="w-full md:w-2/3 bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-8 rounded-xl shadow-xl hover:shadow-green-600/30 transition-all animate-pulse"
              >
                {currentPlan.buttonText}
                <ArrowRight className="ml-2" />
              </Button>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                <div className="flex items-center justify-center gap-1"><ShieldCheck size={16} className="text-green-600"/> Dados Seguros</div>
                <div className="flex items-center justify-center gap-1"><Target size={16} className="text-green-600"/> Cancele quando quiser</div>
                <div className="flex items-center justify-center gap-1"><MessageCircle size={16} className="text-green-600"/> Suporte Premium</div>
                <div className="flex items-center justify-center gap-1"><CheckCircle size={16} className="text-green-600"/> Acesso Imediato</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          
          <div className="space-y-2">
            <FaqItem 
              question="Meus dados financeiros estão seguros?" 
              answer="Sim! Utilizamos criptografia de ponta a ponta e seguimos rigorosamente as leis de proteção de dados. Suas informações são suas e de mais ninguém." 
            />
            <FaqItem 
              question="Posso cancelar a assinatura quando quiser?" 
              answer="Com certeza. Sem contratos de fidelidade longos ou letras miúdas. Você pode cancelar a renovação automática a qualquer momento pelo painel." 
            />
             <FaqItem 
              question="O Simplific Pro funciona no celular?" 
              answer="Sim, nossa plataforma é 100% responsiva e funciona perfeitamente no navegador do seu celular. Além disso, você tem o Assessor via WhatsApp que é nativo mobile." 
            />
            <FaqItem 
              question="Como funciona a integração com corretoras?" 
              answer="Utilizamos parceiros homologados pelo Banco Central para conectar sua conta de investimento de forma segura, permitindo a leitura automática do seu saldo e ativos." 
            />
            <FaqItem 
              question="Preciso de conhecimento técnico para usar?" 
              answer="Zero! O Simplific Pro foi desenhado para ser intuitivo. Se você sabe mandar mensagem no WhatsApp, você sabe usar nossa plataforma." 
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      {/* Substituímos aquele monte de código por apenas uma linha: */}
      <Footer />
    </div>
  );
};

export default HomePage;