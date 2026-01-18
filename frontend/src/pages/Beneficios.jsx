import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  BarChart3, Target, Map, Scale, PieChart, 
  Smartphone, Monitor, Sliders, ShieldCheck 
} from 'lucide-react';

const Beneficios = () => {
  const features = [
    {
      icon: <Smartphone size={32} />,
      title: "Praticidade no Dia a Dia",
      description: "Esqueça planilhas complexas. Com o Simplific Pro, você registra seus gastos em segundos pelo celular, onde estiver."
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Liberdade Financeira",
      description: "Saia do vermelho e construa patrimônio. Nossas ferramentas te mostram exatamente onde cortar gastos e onde investir."
    },
    {
      icon: <PieChart size={32} />,
      title: "Investimentos Controlados",
      description: "Tenha uma visão 360º da sua carteira. Ações, FIIs, Renda Fixa e Cripto em um único lugar, com atualização automática."
    },
    {
      icon: <Monitor size={32} />,
      title: "Home Broker Integrado",
      description: "Integração inteligente para leitura de notas de corretagem e acompanhamento de cotações em tempo real."
    },
    {
      icon: <Target size={32} />,
      title: "Metas Claras",
      description: "Defina objetivos (viagem, carro, casa) e o sistema calcula quanto você precisa poupar por mês para chegar lá."
    },
    {
      icon: <Map size={32} />,
      title: "Planejamento Inteligente",
      description: "Crie orçamentos para cada categoria (ex: R$ 500 para Lazer) e seja avisado quando estiver perto do limite."
    },
    {
      icon: <Scale size={32} />,
      title: "Balanço Geral Mensal",
      description: "Relatórios automáticos que fecham o seu mês, mostrando sua evolução patrimonial, fluxo de caixa e pendências."
    },
    {
      icon: <Sliders size={32} />,
      title: "Categorias Personalizadas",
      description: "O sistema se adapta a você. Crie, edite e exclua categorias de despesas e receitas conforme a sua realidade."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black selection:bg-green-500 selection:text-black">
      
      {/* Navbar com fundo escuro para consistência */}
      <div className="bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-green-900/30">
        <Navbar /> 
      </div>
      
      {/* Header Section */}
      <div className="relative pt-24 pb-20 overflow-hidden">
        {/* Efeito de brilho no fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-black to-black pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Funcionalidades que <span className="text-green-500">Transformam</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Descubra como cada detalhe do Simplific Pro foi desenhado para te dar controle total.
            </p>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="container mx-auto px-4 pb-24 grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {features.map((item, index) => (
            <div key={index} className="p-6 border border-gray-800 bg-gray-950 rounded-2xl hover:border-green-500/50 hover:bg-gray-900 transition-all group">
                <div className="text-green-500 mb-4 bg-green-900/20 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black">
                    {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{item.description}</p>
            </div>
        ))}
      </div>

      {/* Footer com borda superior */}
      <div className="bg-black border-t border-gray-900 pt-10">
        <Footer />
      </div>
    </div>
  );
};

export default Beneficios;