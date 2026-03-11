import React from 'react';
import PageHeader from '@/components/PageHeader';
import { 
  Wallet, TrendingUp, MessageCircle, 
  CreditCard, Sparkles, Mic, BarChart3, Video, UserPlus, FileText, Target, Brain, Search, Receipt
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, commands, color }) => (
   <div className="bg-white p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all hover:-translate-y-1 flex flex-col h-full">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm mb-6 flex-grow">{description}</p>
    
    <div className="bg-muted/50 rounded-xl p-4 border border-border/50 mt-auto">
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Exemplos de Comandos:</p>
      <div className="space-y-3">
        {commands.map((cmd, idx) => (
          <div key={idx} className="flex gap-3 items-start">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full mt-0.5 shrink-0">
              <MessageCircle size={12} className="text-emerald-700 dark:text-emerald-400" />
            </div>
            <p className="text-sm text-foreground font-medium italic">"{cmd}"</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdvisorFeatures = ({ user, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col font-sans">
      
      <PageHeader user={user} onLogout={onLogout} />

      <div className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        
         <div className="text-center mb-12 mt-4">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              <Sparkles size={16} /> Inteligência Artificial Simplific
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 tracking-tight">
              O seu Super App de bolso <span className="text-emerald-600 dark:text-emerald-400">no WhatsApp</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Mais que um bot. O Simplific é seu parceiro financeiro, analista de mercado e secretária executiva. Explore todos os poderes da IA enviando mensagens ou áudios naturais.
            </p>
        </div>

        {/* --- SESSÃO 1: DIA A DIA --- */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
             <h2 className="text-2xl font-bold text-foreground">Gestão do Dia a Dia</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Wallet} color="bg-blue-500"
              title="Lançamentos & Contas"
              description="Registre gastos e receitas na hora. A IA entende a categoria e pode vincular direto ao saldo da sua conta."
              commands={[
                "Gastei 50 reais de Ifood no Nubank",
                "Recebi 1500 do freela de design",
                "Como está meu extrato de receitas este mês?"
              ]}
            />
            <FeatureCard 
              icon={CreditCard} color="bg-orange-500"
              title="Cartões e Faturas"
              description="Gerencie limites, registre compras (à vista ou parceladas) e pague faturas abertas sem abrir o aplicativo."
              commands={[
                "Comprei uma TV de 2000 em 10x no Itaú",
                "Qual o meu limite disponível no C6?",
                "Pagar a fatura aberta do Nubank"
              ]}
            />
             <FeatureCard 
              icon={Receipt} color="bg-rose-500"
              title="Leitura de Comprovantes"
              description="Tirou foto da nota fiscal ou recebeu um comprovante de pix? Basta enviar a imagem para o WhatsApp!"
              commands={[
                "📸 [Enviar a foto do comprovante]",
                "Acabei de pagar isso aqui, pode registrar?",
                "📸 [Foto da nota do supermercado]"
              ]}
            />
          </div>
        </div>

        {/* --- SESSÃO 2: PATRIMÔNIO --- */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-8 w-1.5 bg-purple-500 rounded-full"></div>
             <h2 className="text-2xl font-bold text-foreground">Patrimônio e Futuro</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Target} color="bg-purple-500"
              title="Criação de Metas"
              description="Crie novas metas do zero e injete valores diretamente pelo chat para ver seu patrimônio crescer."
              commands={[
                "Quero criar uma meta chamada Viagem Europa de 15 mil",
                "Guarda 300 reais na meta do Carro",
                "Falta quanto pra eu bater a meta da Viagem?"
              ]}
            />
            <FeatureCard 
              icon={TrendingUp} color="bg-emerald-600"
              title="Mercado & Investimentos"
              description="Consulte cotações na bolsa (B3/EUA), veja notícias do ativo e registre suas compras de ações."
              commands={[
                "Qual o preço atual da PETR4?",
                "Comprei 100 cotas de MXRF11 hoje",
                "Como está a rentabilidade da minha carteira?"
              ]}
            />
             <FeatureCard 
              icon={BarChart3} color="bg-indigo-500"
              title="Simulador & Planejamento"
              description="A IA faz cálculos matemáticos complexos para você projetar rendimentos ou simular financiamentos."
              commands={[
                "Se eu financiar 50 mil em 48x a 1.5% ao mês, quanto pago?",
                "Como está meu orçamento para Lazer este mês?",
                "Me envie o resumo visual de março (Gera Gráfico)"
              ]}
            />
          </div>
        </div>

        {/* --- SESSÃO 3: PRODUTIVIDADE E IA --- */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
             <div className="h-8 w-1.5 bg-yellow-500 rounded-full"></div>
             <h2 className="text-2xl font-bold text-foreground">Produtividade e Superpoderes</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Video} color="bg-red-500"
              title="Agenda e Google Meet"
              description="Agende reuniões, crie lembretes e deixe a IA gerar o link do Meet e disparar o WhatsApp pro seu cliente."
              commands={[
                "Me lembre de cancelar a Netflix sexta-feira",
                "Marque uma reunião com o Felipe amanhã às 14h",
                "O que eu tenho na agenda para hoje?"
              ]}
            />
            <FeatureCard 
              icon={Search} color="bg-teal-500"
              title="Pesquisas na Internet"
              description="A IA sai do WhatsApp e pesquisa voos, hotéis, preços e notícias em tempo real, trazendo os links para você."
              commands={[
                "Busque passagens baratas de SP para RJ no dia 15",
                "Pesquisa pra mim o preço do iPhone 15",
                "Quais as principais notícias de economia hoje?"
              ]}
            />
            <FeatureCard 
              icon={Brain} color="bg-slate-700"
              title="Memória e Transcrição"
              description="Mande áudios gigantes ou conte fatos da sua vida. O Simplific transcreve e grava tudo na Memória Permanente."
              commands={[
                "🎤 [Áudio]: Gastei 20 no pão e marca reunião amanhã",
                "Lembre que minha esposa se chama Rayany",
                "Estou gastando muito com iFood? Analise minha saúde."
              ]}
            />
          </div>
        </div>

        {/* Seção de Dica Extra */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Apenas fale naturalmente 🗣️</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              Esqueça os robôs de "Digite 1 para X". O Simplific entende o seu jeito de falar, gírias, áudios enormes e atende a pedidos múltiplos de uma vez só!
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
                <p className="text-rose-400 text-xs font-bold uppercase mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Evite ser robótico</p>
                <p className="text-slate-500 line-through text-base">"Comando: Lançar. Valor: 50. Categoria: Alimentação. Status: Pago."</p>
              </div>
              <div className="bg-emerald-950/40 p-6 rounded-2xl border border-emerald-800/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <p className="text-emerald-400 text-xs font-bold uppercase mb-3 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Fale como quiser</p>
                <p className="text-white text-base leading-relaxed">"Cara, comi um burguer de 50 conto no cartão black, lança aí. E já pesquisa um hotel em SP pro dia 10."</p>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm font-medium text-slate-400">
               <span className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50"><Mic size={16} className="text-emerald-400"/> Aceita Áudios</span>
               <span className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50"><UserPlus size={16} className="text-emerald-400"/> Identifica Sócio/Cônjuge</span>
               <span className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50"><FileText size={16} className="text-emerald-400"/> Lê Imagens e Comprovantes</span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdvisorFeatures;