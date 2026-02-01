import React from 'react';
import PageHeader from '@/components/PageHeader'; // <--- IMPORTAR
import { 
  Wallet, TrendingUp, MessageCircle, 
  CreditCard, Sparkles, Mic, BarChart3, Video, UserPlus 
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, commands, color }) => (
  // ... (código do card continua igual)
   <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-6 min-h-[40px]">{description}</p>
    
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Exemplos de Comandos:</p>
      <div className="space-y-3">
        {commands.map((cmd, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className="bg-green-100 p-1.5 rounded-full mt-0.5">
              <MessageCircle size={12} className="text-green-700" />
            </div>
            <p className="text-sm text-gray-700 font-medium italic">"{cmd}"</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ADICIONE AS PROPS user E onLogout
const AdvisorFeatures = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans">
      
      {/* ▼▼▼ NOVO CABEÇALHO ▼▼▼ */}
      <PageHeader user={user} onLogout={onLogout} />
      {/* ▲▲▲ FIM DO CABEÇALHO ▲▲▲ */}

      <div className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* ... (O RESTO DO CONTEÚDO CONTINUA IGUAL) ... */}
         <div className="text-center mb-12 mt-4">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
          <Sparkles size={16} /> Inteligência Artificial Simplific
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Seu Assessor Pessoal <span className="text-green-600">no WhatsApp</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
          Muito mais que um bot. O Simplific é seu parceiro financeiro, secretária executiva e analista de investimentos. 
          Tudo isso conversando naturalmente.
        </p>
      </div>

      {/* Grid de Funcionalidades */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        
        {/* 1. Gestão Financeira */}
        <FeatureCard 
          icon={Wallet}
          color="bg-blue-500"
          title="Controle Financeiro"
          description="Registre gastos e receitas em tempo real sem abrir o app. A IA categoriza tudo automaticamente."
          commands={[
            "Gastei 50 reais no almoço",
            "Recebi 1500 de um freela",
            "Como está meu saldo esse mês?",
            "Gastei 100 reais com Uber no Nubank"
          ]}
        />

        {/* 2. Agenda e Reuniões */}
        <FeatureCard 
          icon={Video}
          color="bg-purple-500"
          title="Agenda & Reuniões"
          description="Agende compromissos e reuniões. O robô cria o evento, gera link do Meet e envia o convite."
          commands={[
            "Agende uma reunião com o Carlos amanhã às 15h",
            "Me lembre de pagar a luz hoje às 18h",
            "O que tenho na agenda hoje?",
            "Tenho algum compromisso atrasado?"
          ]}
        />

        {/* 3. Investimentos */}
        <FeatureCard 
          icon={TrendingUp}
          color="bg-green-500"
          title="Investimentos & Mercado"
          description="Acompanhe sua carteira e consulte cotações em tempo real."
          commands={[
            "Comprei 10 ações de PETR4",
            "Qual o preço do Dólar agora?",
            "Como está minha carteira?",
            "Comprei 1000 reais em CDB do Inter"
          ]}
        />

        {/* 4. Cartões e Metas */}
        <FeatureCard 
          icon={CreditCard}
          color="bg-orange-500"
          title="Cartões & Metas"
          description="Gerencie limites, pague faturas e acompanhe seus objetivos de vida."
          commands={[
            "Qual o limite do meu cartão Nubank?",
            "Quero pagar a fatura do Inter",
            "Guardar 200 reais na meta Viagem",
            "Como estão minhas metas?"
          ]}
        />

        {/* 5. Relatórios Visuais */}
        <FeatureCard 
          icon={BarChart3}
          color="bg-pink-500"
          title="Relatórios Visuais"
          description="Peça gráficos e resumos completos para entender para onde seu dinheiro vai."
          commands={[
            "Me manda um resumo visual desse mês",
            "Gera um gráfico dos meus gastos de janeiro",
            "Quais são minhas maiores despesas?",
            "Resumo das pendências"
          ]}
        />

        {/* 6. Consultoria e Dicas */}
        <FeatureCard 
          icon={Sparkles}
          color="bg-indigo-500"
          title="Dicas & Conselhos"
          description="Receba orientações personalizadas baseadas no seu comportamento financeiro."
          commands={[
            "Estou gastando muito com iFood?",
            "Me dê uma dica para economizar esse mês",
            "Analise minha saúde financeira",
            "O que acha de eu financiar um carro agora?"
          ]}
        />
      </div>

      {/* Seção de Dica Extra */}
      <div className="bg-gray-900 rounded-2xl p-8 md:p-10 text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-900/40 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Fale naturalmente 🗣️</h2>
          <p className="text-gray-300 text-base mb-8">
            Você não precisa decorar comandos robóticos. O Simplific entende sua linguagem natural, gírias e até áudios longos.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
              <p className="text-red-400 text-xs font-bold uppercase mb-2">Evite ser robótico</p>
              <p className="text-gray-400 line-through text-sm">"Cadastrar despesa valor 50 categoria alimentação"</p>
            </div>
            <div className="bg-green-900/30 p-4 rounded-xl border border-green-500/30">
              <p className="text-green-400 text-xs font-bold uppercase mb-2">Fale como quiser</p>
              <p className="text-white text-sm">"Cara, acabei de comer um burguer de 50 reais. Anota aí pra mim!"</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-6 text-sm text-gray-400">
             <span className="flex items-center gap-2"><Mic size={16} /> Aceita Áudios</span>
             <span className="flex items-center gap-2"><UserPlus size={16} /> Reconhece seu Sócio/Cônjuge</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdvisorFeatures;