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
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <div className="bg-green-50 py-20">
        <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Funcionalidades que Transformam</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Descubra como cada detalhe do Simplific Pro foi desenhado para te dar controle total.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((item, index) => (
            <div key={index} className="p-6 border border-gray-100 rounded-2xl hover:shadow-lg hover:border-green-200 transition-all bg-white group">
                <div className="text-green-600 mb-4 bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
            </div>
        ))}
      </div>

      <Footer />
    </div>
  );
};

export default Beneficios;