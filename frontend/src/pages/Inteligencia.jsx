import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle } from 'lucide-react';

const Inteligencia = () => {
  const navigate = useNavigate(); 
  
  const capabilities = [
    "Registrar receitas e despesas por texto ou áudio",
    "Consultar saldos e status do orçamento em tempo real",
    "Registrar despesas no cartão de crédito",
    "Consultar limites disponíveis e faturas do cartão",
    "Adicionar valores nas suas Metas Financeiras",
    "Consultar preços de ativos da Bolsa (B3) em tempo real",
    "Cadastrar novos investimentos na sua Carteira",
    "Fazer simulações de investimentos e financiamentos",
    "Adicionar lembretes e eventos na Agenda",
    "Atuar como seu parceiro financeiro no dia a dia"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black selection:bg-green-500 selection:text-black font-sans">
      
      {/* Navbar com fundo escuro */}
      <div className="bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-green-900/30">
        <Navbar /> 
      </div>
      
      {/* Hero Section */}
      <div className="relative pt-20 pb-20 overflow-hidden border-b border-gray-900">
        {/* Efeitos de Fundo (Glow) */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
                <div className="inline-block bg-green-900/30 border border-green-500/30 px-4 py-1.5 rounded-full text-sm font-bold text-green-400 mb-6 uppercase tracking-wide">
                    🤖 Inteligência Artificial Simplific
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
                    Mais que um App, um <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Assessor Financeiro</span> no seu WhatsApp
                </h1>
                
                <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                    Imagine ter um especialista financeiro disponível 24h por dia para organizar sua vida. Você manda um áudio, ele entende, registra e te aconselha.
                </p>
                
                <Button 
                    onClick={() => navigate('/planos')} 
                    className="bg-green-600 text-white hover:bg-green-500 font-bold px-8 py-6 h-auto rounded-xl shadow-lg shadow-green-900/20 transition-all"
                >
                    <MessageCircle className="mr-2" /> Falar com o Simplific
                </Button>
            </div>

            <div className="flex justify-center relative">
                 {/* Efeito de brilho atrás do celular */}
                 <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full transform scale-75"></div>
                 
                 <img 
                   src="/assets/image_74563a.png" 
                   alt="Chat WhatsApp" 
                   className="relative z-10 rounded-3xl shadow-2xl border border-gray-800 max-w-sm w-full transform hover:scale-[1.02] transition-transform duration-500"
                 />
            </div>
        </div>
      </div>

      {/* Lista de Capacidades */}
      <div className="py-24 bg-black">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    O que eu posso fazer por você?
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Basta enviar uma mensagem. Veja tudo que o Simplific IA é capaz de realizar:
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {capabilities.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-green-500/50 hover:bg-gray-800 transition-all group">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform" />
                        <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{item}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-black border-t border-gray-900 pt-10">
        <Footer />
      </div>
    </div>
  );
};

export default Inteligencia;