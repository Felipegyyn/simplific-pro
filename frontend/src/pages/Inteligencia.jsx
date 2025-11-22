import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { CheckCircle, MessageCircle } from 'lucide-react';

// REMOVEMOS O IMPORT DA IMAGEM AQUI

const Inteligencia = () => {
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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-green-700 text-white py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div>
                <div className="inline-block bg-green-900/30 px-3 py-1 rounded-full text-sm font-semibold mb-6">
                    🤖 Inteligência Artificial Simplific
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Mais que um App, um Assessor Financeiro no seu WhatsApp
                </h1>
                <p className="text-lg text-green-100 mb-8 leading-relaxed">
                    Imagine ter um especialista financeiro disponível 24h por dia para organizar sua vida. Você manda um áudio, ele entende, registra e te aconselha.
                </p>
                <a href="/planos">
                    <Button 
                      onClick={() => navigate('/checkout')} 
                      className="bg-white text-green-700 hover:bg-green-50 font-bold px-8 py-6 h-auto rounded-xl">
                        <MessageCircle className="mr-2" /> Falar com o Simplific
                    </Button>
                </a>
            </div>
            <div className="flex justify-center">
                 {/* AQUI ESTÁ A CORREÇÃO: Caminho direto para a pasta pública */}
                 <img 
                  src="/assets/image_74563a.png" 
                  alt="Chat WhatsApp" 
                  className="rounded-2xl shadow-2xl border-4 border-green-500/50 max-w-sm w-full"
                />
            </div>
        </div>
      </div>

      {/* Lista de Capacidades */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que eu posso fazer por você?</h2>
            <p className="text-gray-600">Basta enviar uma mensagem. Veja tudo que o Simplific IA é capaz de realizar:</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {capabilities.map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-colors">
                    <CheckCircle className="text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-800 font-medium">{item}</span>
                </div>
            ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Inteligencia;