import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CheckCircle, BarChart3, CreditCard, Search, Calendar, FileText } from 'lucide-react';

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-800 py-6">
      <button className="flex justify-between items-center w-full text-left focus:outline-none group" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-xl font-medium text-gray-200 group-hover:text-white transition-colors tracking-tight">{question}</span>
        {isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-600" />}
      </button>
      {isOpen && <p className="mt-4 text-gray-400 text-lg leading-relaxed font-light">{answer}</p>}
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-gray-800 selection:text-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Glow de Fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-600/10 rounded-[100%] blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm text-gray-300 font-medium">Simplific IA já está disponível</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-medium tracking-tighter text-white mb-6 leading-[1.1]">
            Você pede uma vez.<br className="hidden md:block" />
            <span className="text-gray-500">Ele faz por você.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Escreva o que quer resolver, feche o app e vá viver. A IA cuida de tudo e volta com o trabalho feito.
          </p>
          
          <Button 
            onClick={() => navigate('/login')}
            className="h-14 px-8 rounded-full bg-white text-black hover:bg-gray-200 text-lg font-medium transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Entrar na lista de espera
          </Button>
        </div>
      </section>

      {/* INTEGRAÇÕES E BENTO GRID */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">
            Integre com seus apps favoritos
          </h2>
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">
            A IA tem a inteligência. Agora deixe-a executar. Conecte com outros aplicativos e facilite sua vida financeira.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Grande */}
          <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 md:p-12 hover:bg-[#111] transition-colors relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
              <Search size={120} className="text-emerald-500" />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-end min-h-[300px]">
              <div className="mb-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <FileText className="text-emerald-500" />
                </div>
              </div>
              <h3 className="text-3xl font-medium mb-3">Encontre boletos e faturas</h3>
              <p className="text-gray-400 text-lg font-light">A IA rastreia seus e-mails e apps em busca de contas a pagar antes do vencimento.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 md:p-10 hover:bg-[#111] transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
              <BarChart3 className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Gere planilha de gastos</h3>
            <p className="text-gray-400 text-lg font-light">Categorização automática e exportação em segundos.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 md:p-10 hover:bg-[#111] transition-colors">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
              <Calendar className="text-purple-500" />
            </div>
            <h3 className="text-2xl font-medium mb-3">Sua próxima conta</h3>
            <p className="text-gray-400 text-lg font-light">Lembretes inteligentes para você nunca mais pagar juros.</p>
          </div>

          {/* Card 4 - Grande Horizontal */}
          <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-8 md:p-12 hover:bg-[#111] transition-colors flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="h-12 w-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-6">
                <CreditCard className="text-orange-500" />
              </div>
              <h3 className="text-3xl font-medium mb-3">Crie orçamentos personalizados</h3>
              <p className="text-gray-400 text-lg font-light max-w-md">Diga à IA quanto quer gastar este mês, e ela ajusta a rota.</p>
            </div>
            <div className="flex-shrink-0">
               {/* Gráfico Fake / Visual */}
               <div className="w-48 h-48 rounded-full border-[16px] border-white/5 border-t-emerald-500 border-r-emerald-500 transform rotate-45 flex items-center justify-center">
                  <div className="transform -rotate-45 text-2xl font-medium">85%</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: NÃO É UMA CONVERSA */}
      <section className="py-32 px-4 md:px-8 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16 relative z-10">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-tight">
              Não é uma conversa.<br />
              <span className="text-gray-500">É uma tarefa feita.</span>
            </h2>
            <p className="text-xl text-gray-400 font-light mb-8 leading-relaxed">
              Você pede o que precisa e volta só quando houver uma decisão para tomar. A IA abre sites, faz pesquisas, simula cenários e entrega a tarefa completa por você.
            </p>
            <ul className="space-y-4">
              {['Comparar passagens', 'Cancelar assinaturas inúteis', 'Negociar dívidas bancárias'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg text-gray-300">
                  <CheckCircle className="text-emerald-500 flex-shrink-0" size={24} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full md:w-1/2">
            {/* Mockup Minimalista */}
            <div className="bg-[#111] rounded-3xl p-8 border border-white/10 shadow-2xl relative">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                <div className="w-3 h-3 rounded-full bg-gray-700"></div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0"></div>
                  <div className="bg-gray-800/50 p-4 rounded-2xl rounded-tl-sm w-3/4">
                    <p className="text-sm text-gray-300">Cancele minha assinatura da Netflix e encontre opções de planos de saúde até R$ 400.</p>
                  </div>
                </div>
                <div className="flex gap-4 flex-row-reverse">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center">
                    <span className="text-emerald-500 font-bold text-xs">IA</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl rounded-tr-sm w-3/4">
                    <p className="text-sm text-emerald-100">Assinatura cancelada com sucesso. Encontrei 3 opções de planos de saúde, clique aqui para escolher.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-4 md:px-8 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight mb-4">Dúvidas Frequentes</h2>
          </div>
          <div className="space-y-2">
            <FaqItem 
              question="A IA compra com meu dinheiro?" 
              answer="Não. A IA não tem permissão para realizar pagamentos, transferências ou transações. Ela prepara tudo e você dá o clique final para aprovar a decisão."
            />
            <FaqItem 
              question="Quanto tempo uma tarefa demora?" 
              answer="Depende da complexidade. Enquanto buscar uma fatura leva segundos, pesquisar voos e montar um roteiro comparativo pode levar minutos ou horas."
            />
            <FaqItem 
              question="Ela investe por mim?" 
              answer="A IA analisa seu perfil, simula carteiras de investimento e encontra as melhores taxas do mercado, mas a execução final na corretora continua sendo sua."
            />
            <FaqItem 
              question="Preciso conectar todos os meus bancos?" 
              answer="Para aproveitar o poder máximo da ferramenta, a conexão via Open Finance é ideal, garantindo uma leitura em tempo real e precisa da sua saúde financeira. O processo é 100% seguro."
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <div className="bg-black border-t border-white/5">
        <Footer />
      </div>

    </div>
  );
};

export default HomePage;
