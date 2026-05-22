import React from 'react';
import PageHeader from '@/components/PageHeader';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Wallet, TrendingUp, MessageCircle, CreditCard, Sparkles, Mic, BarChart3, Video,
  UserPlus, FileText, Target, Brain, Search, Receipt, Building2, Calculator,
  Trophy, Users, Package, Link2, Bell, Globe, PieChart, Award, ArrowUpDown,
  Shield, Calendar, Zap, LineChart, FileUp, Star, DollarSign, Smartphone, Bot
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Componente de preview de chat WhatsApp ──────────────────────────────────
const ChatBubble = ({ text, isBot = false }) => (
  <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-2`}>
    <div className={cn(
      "max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-lg backdrop-blur-md",
      isBot
        ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-white/5'
        : 'bg-emerald-600/90 text-white rounded-tr-none border border-emerald-500/20'
    )}>
      {text}
    </div>
  </div>
);

const ChatPreview = ({ messages }) => (
  <div className="glass-panel p-4 mt-6 border-white/5 bg-slate-900/40 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
        <Sparkles size={14} className="text-emerald-400" />
      </div>
      <div>
        <span className="text-white text-[10px] font-black uppercase tracking-widest block">Simplific Pro</span>
        <span className="text-[10px] text-emerald-400 font-bold">Online agora</span>
      </div>
    </div>
    <div className="space-y-1">
      {messages.map((msg, i) => (
        <ChatBubble key={i} text={msg.text} isBot={msg.isBot} />
      ))}
    </div>
  </div>
);

// ── Card de funcionalidade ──────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, commands, color, badge, preview }) => {
  return (
    <div className="glass-card group flex flex-col h-full overflow-hidden border-white/5 hover:border-white/10 transition-all duration-500">
      <div className="p-6 flex flex-col flex-grow relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/5 transition-all"></div>
        
        <div className="flex items-start justify-between mb-6">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg border border-white/10", color.replace('bg-', 'bg-opacity-20 text-'))}>
            <Icon size={24} className={color.replace('bg-', 'text-').replace('-500', '-400').replace('-600', '-400')} />
          </div>
          {badge && (
            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
              {badge}
            </Badge>
          )}
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">{title}</h3>
        <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">{description}</p>

        {preview && <ChatPreview messages={preview} />}

        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
            <MessageCircle size={12} className="text-cyan-400" />
            Comandos de exemplo
          </div>
          <div className="space-y-3">
            {commands.map((cmd, idx) => (
              <div key={idx} className="flex gap-3 items-start group/cmd">
                <div className="bg-white/5 p-1 rounded-lg mt-0.5 shrink-0 border border-white/5 group-hover/cmd:border-cyan-500/30 transition-colors">
                  <Zap size={10} className="text-cyan-400" />
                </div>
                <p className="text-xs text-slate-300 font-medium italic leading-relaxed group-hover/cmd:text-white transition-colors">"{cmd}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Separador de seção ──────────────────────────────────────────────────────
const SectionHeader = ({ color, icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-5 mb-10 group">
    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl border border-white/10 transition-transform group-hover:scale-110", color.replace('bg-', 'bg-opacity-20 '))}>
      <Icon size={24} className={color.replace('bg-', 'text-').replace('-500', '-400').replace('-600', '-400')} />
    </div>
    <div>
      <h2 className="text-2xl font-black text-white tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">{subtitle}</p>}
    </div>
  </div>
);

// ── Componente principal ────────────────────────────────────────────────────
const AdvisorFeatures = ({ user, onLogout }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-cyan-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 backdrop-blur-sm">
            <Sparkles size={14} className="animate-pulse" /> Inteligência Artificial Simplific
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
            Potencialize sua gestão <br/>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">pelo WhatsApp</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Um parceiro financeiro autônomo, analista de mercado e assistente executivo.
            Basta falar ou enviar uma foto — a IA cuida de toda a burocracia para você.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {[
              { icon: Mic, label: 'Aceita Áudios' },
              { icon: Receipt, label: 'Lê Comprovantes' },
              { icon: Brain, label: 'Memória Permanente' },
              { icon: Globe, label: 'Pesquisa Web' },
              { icon: Shield, label: '100% Seguro' },
            ].map(({ icon: I, label }) => (
              <span key={label} className="flex items-center gap-2 glass-panel border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 px-5 py-2.5 rounded-xl shadow-xl hover:border-cyan-500/30 transition-all cursor-default group">
                <I size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 1 — GESTÃO FINANCEIRA DIÁRIA                                */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-14">
          <SectionHeader
            color="bg-blue-500"
            icon={Wallet}
            title="Gestão Financeira do Dia a Dia"
            subtitle="Registre, controle e confirme cada centavo sem sair do WhatsApp."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FeatureCard
              icon={Wallet}
              color="bg-blue-500"
              title="Lançamentos e Transações"
              description="Registre receitas e despesas instantaneamente. A IA identifica categoria, valor e conta automaticamente. Suporta lançamentos à vista e parcelados com rastreamento de parcelas individuais."
              preview={[
                { text: 'Gastei 89 reais no mercado hoje no Nubank', isBot: false },
                { text: '✅ Lançamento registrado!\nR$ 89,00 em Alimentação no Nubank.\nDeseja confirmar?', isBot: true },
              ]}
              commands={[
                'Gastei 89 reais de supermercado no Nubank',
                'Recebi 3.500 de salário na conta Itaú',
                'Lança 450 de aluguel para amanhã, vai debitar na conta inter',
                'Quais são meus lançamentos pendentes de março?',
                'Confirma o lançamento de 89 reais',
              ]}
            />

            <FeatureCard
              icon={CreditCard}
              color="bg-orange-500"
              title="Cartões de Crédito e Faturas"
              description="Gerencie seus cartões com controle total de limite disponível. Registre compras (à vista ou parceladas), acompanhe faturas abertas por mês e quite com um único comando."
              preview={[
                { text: 'Comprei uma geladeira de 2800 em 12x no Nubank', isBot: false },
                { text: '🛒 Compra parcelada registrada!\nR$ 233,33/mês por 12 meses.\nLimite atual: R$ 6.500,00', isBot: true },
              ]}
              commands={[
                'Comprei uma TV de 2.000 em 10x no Itaú',
                'Qual meu limite disponível no cartão C6?',
                'Quanto está minha fatura do Nubank?',
                'Pagar a fatura aberta do Santander',
                'Registra 150 de farmácia no Bradesco à vista',
              ]}
            />

            <FeatureCard
              icon={Receipt}
              color="bg-rose-500"
              title="Leitura de Comprovantes (OCR)"
              description="Envie uma foto do comprovante de PIX, boleto ou nota fiscal e a IA extrai automaticamente o valor, data e destinatário para registrar o lançamento sem você digitar nada."
              badge="IA Visual"
              preview={[
                { text: '📸 [Foto do comprovante de PIX]', isBot: false },
                { text: '🔍 Comprovante lido!\nPIX de R$ 347,90 para Maria S.\nData: hoje. Deseja lançar?', isBot: true },
              ]}
              commands={[
                '📸 [Envie a foto do comprovante]',
                'Acabei de pagar isso aqui, pode registrar?',
                '📸 [Foto da nota fiscal do restaurante]',
                'Guardei o comprovante, lança lá no extrato',
              ]}
            />

            <FeatureCard
              icon={Building2}
              color="bg-cyan-600"
              title="Contas Bancárias"
              description="Cadastre todas as suas contas (Nubank, Itaú, Inter, etc.) e o saldo é atualizado automaticamente a cada lançamento confirmado. Consulte o extrato de qualquer conta pelo chat."
              commands={[
                'Qual o saldo da minha conta do Nubank?',
                'Me mostra o extrato da conta Inter desse mês',
                'Transferi 500 do Itaú para o Inter',
                'Quais contas eu tenho cadastradas?',
              ]}
            />

            <FeatureCard
              icon={FileUp}
              color="bg-indigo-500"
              title="Importação de Extrato PDF"
              description="Exporte o extrato do seu banco em PDF e envie pelo sistema. A IA processa automaticamente todas as transações, categorizando e registrando cada uma em segundos."
              badge="Novo"
              commands={[
                '📎 [Envie o PDF do extrato bancário]',
                'Importa o extrato do Bradesco que te mandei',
                'Pode processar o extrato de março?',
              ]}
            />

            <FeatureCard
              icon={ArrowUpDown}
              color="bg-violet-500"
              title="Planejamento Orçamentário"
              description="Crie um orçamento mensal por categoria (alimentação, lazer, saúde…). Programe contas recorrentes, compare o planejado vs realizado e receba alertas quando ultrapassar os limites."
              preview={[
                { text: 'Como está meu orçamento de lazer em março?', isBot: false },
                { text: '📊 Lazer - Março\nPlanejado: R$ 800\nGasto: R$ 1.120\nAcima do orçamento: R$ 320 🔴', isBot: true },
              ]}
              commands={[
                'Como está meu orçamento para Alimentação este mês?',
                'Cria um planejamento de 500 reais para lazer em abril',
                'Quais contas estão programadas para essa semana?',
                'Me manda o planejado vs realizado de março',
              ]}
            />

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 2 — PATRIMÔNIO E FUTURO                                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-14">
          <SectionHeader
            color="bg-purple-500"
            icon={TrendingUp}
            title="Patrimônio e Futuro"
            subtitle="Invista, sonhe e veja seu patrimônio crescer com dados em tempo real."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FeatureCard
              icon={Target}
              color="bg-purple-500"
              title="Metas Financeiras"
              description="Crie metas com nome, valor e prazo (viagem, carro, reserva de emergência). Deposite valores pelo chat e acompanhe o progresso em porcentagem. A IA calcula quanto guardar por mês."
              preview={[
                { text: 'Guarda 500 reais na meta da viagem para Europa', isBot: false },
                { text: '🎯 Meta "Viagem Europa" atualizada!\nAcumulado: R$ 3.200 / R$ 15.000\nProgresso: 21,3% — Continue assim! 💪', isBot: true },
              ]}
              commands={[
                'Quero criar uma meta chamada Viagem Europa de 15 mil até dezembro',
                'Guarda 300 reais na meta do Carro novo',
                'Falta quanto para bater a meta da Reserva de Emergência?',
                'Quanto preciso guardar por mês para atingir minha meta?',
                'Quais são minhas metas ativas?',
              ]}
            />

            <FeatureCard
              icon={TrendingUp}
              color="bg-emerald-600"
              title="Investimentos: Ações e FIIs"
              description="Registre compras de ações e fundos imobiliários. O sistema calcula automaticamente a quantidade de cotas com base no preço histórico da data da compra e atualiza a cotação em tempo real via B3."
              preview={[
                { text: 'Comprei 1000 reais de MXRF11 hoje', isBot: false },
                { text: '📈 Investimento registrado!\nMXRF11 — 89,7 cotas @ R$ 11,15\nCarteira atualizada: R$ 24.350', isBot: true },
              ]}
              commands={[
                'Comprei 1.000 reais de MXRF11 hoje',
                'Comprei 500 reais de PETR4 no dia 15',
                'Qual a rentabilidade da minha carteira de FIIs?',
                'Quanto valem minhas ações hoje?',
                'Resgata 800 reais do meu fundo de renda fixa',
              ]}
            />

            <FeatureCard
              icon={BarChart3}
              color="bg-sky-500"
              title="Mercado em Tempo Real"
              description="Home Broker integrado: Ibovespa, S&P 500, Nasdaq, Dow Jones e câmbio (Dólar/Euro) atualizados ao vivo. Veja as maiores altas e baixas do dia em ações da B3."
              preview={[
                { text: 'Como está o mercado hoje?', isBot: false },
                { text: '📊 Mercado agora:\nIbovespa: 128.450 pts (+0,8%)\nDólar: R$ 5,47 (-0,3%)\n🚀 Maiores altas: WEGE3 +2,1%, VALE3 +1,7%', isBot: true },
              ]}
              commands={[
                'Qual o preço atual da PETR4?',
                'Como está o Ibovespa hoje?',
                'Qual a cotação do dólar agora?',
                'Quais as maiores altas da bolsa hoje?',
                'Me mostra os dados do S&P 500',
              ]}
            />

            <FeatureCard
              icon={Calculator}
              color="bg-amber-500"
              title="Calculadora de Juros Compostos"
              description="Simule o crescimento de qualquer investimento: informe o valor inicial, aporte mensal e taxa de rendimento anual. O sistema projeta mês a mês por até 30 anos com gráfico visual."
              preview={[
                { text: 'Se eu investir 500 por mês a 12% ao ano por 10 anos, quanto terei?', isBot: false },
                { text: '💰 Projeção em 10 anos:\nTotal investido: R$ 60.000\nSaldo final: R$ 115.920\nRendimento: R$ 55.920 (93%) 🎉', isBot: true },
              ]}
              commands={[
                'Se eu investir 500 por mês a 12% ao ano por 10 anos, quanto terei?',
                'Se eu financiar 50 mil em 48x a 1.5% ao mês, qual a parcela?',
                'Simula: 10 mil iniciais, 300 por mês, 8% ao ano por 5 anos',
                'Qual o rendimento de 50 mil a 0,8% ao mês em 12 meses?',
              ]}
            />

            <FeatureCard
              icon={LineChart}
              color="bg-teal-500"
              title="Projeção Inteligente de Ativos"
              description="Para ações e FIIs, o Simplific calcula a Taxa de Crescimento Anual Composta (CAGR) histórica do ativo e projeta seu crescimento para os próximos 24 meses com base no desempenho real."
              badge="IA"
              commands={[
                'Qual a projecção de crescimento do meu MXRF11?',
                'Como deve se sair minha carteira nos próximos 2 anos?',
                'Me mostra a evolução histórica da carteira em 2024',
              ]}
            />

            <FeatureCard
              icon={DollarSign}
              color="bg-lime-600"
              title="Renda Fixa e Outros Ativos"
              description="Cadastre CDBs, LCIs, LCAs e outros investimentos com rentabilidade esperada mensal. O sistema aplica os juros compostos e exibe a curva de crescimento mês a mês."
              commands={[
                'Investi 10 mil num CDB a 1.1% ao mês',
                'Qual o rendimento do meu CDB do Nubank este mês?',
                'Adiciona 5000 no meu Tesouro Direto IPCA+',
                'Me mostra todos os meus investimentos em renda fixa',
              ]}
            />

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 3 — ANÁLISE E RELATÓRIOS                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-14">
          <SectionHeader
            color="bg-indigo-500"
            icon={PieChart}
            title="Análise e Relatórios"
            subtitle="Entenda sua saúde financeira com dados reais, gráficos e relatórios gerados por IA."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FeatureCard
              icon={BarChart3}
              color="bg-indigo-500"
              title="Visão Geral Financeira"
              description="Relatório completo com total de receitas, despesas e saldo líquido. Inclui evolução mensal dos últimos 6 meses, distribuição de gastos por categoria e uso dos cartões de crédito."
              commands={[
                'Como está minha saúde financeira?',
                'Me faz um resumo do mês de março',
                'Quanto gastei nos últimos 3 meses?',
                'Qual categoria eu mais gastei neste mês?',
                'Qual meu saldo líquido de fevereiro?',
              ]}
            />

            <FeatureCard
              icon={FileText}
              color="bg-blue-600"
              title="DRE — Demonstração de Resultado"
              description="Gera um relatório contábil completo com todas as receitas e despesas do mês separadas por categoria, calculando o resultado líquido (lucro ou prejuízo) do período."
              commands={[
                'Gera o DRE do mês de março',
                'Me manda o relatório financeiro de fevereiro',
                'Qual foi meu resultado líquido em janeiro?',
                'Quanto recebi de salário e freelance em março?',
              ]}
            />

            <FeatureCard
              icon={ArrowUpDown}
              color="bg-violet-600"
              title="Fluxo de Caixa: Planejado vs Realizado"
              description="Analisa mês a mês o quanto foi planejado e o quanto foi realmente gasto em cada categoria durante o ano. Ideal para identificar onde o orçamento está sendo ultrapassado."
              preview={[
                { text: 'Estou gastando muito com iFood?', isBot: false },
                { text: '🔍 Análise de Alimentação:\nMarço planejado: R$ 600\nMarço gasto: R$ 978\nMédia mensal gasta: R$ 847\nConselhos: Reduza pedidos em 3x/semana 💡', isBot: true },
              ]}
              commands={[
                'Compara meu planejado vs realizado em março',
                'Estou gastando mais do que devia em qual categoria?',
                'Me manda o fluxo de caixa de 2024 inteiro',
                'Qual categoria está mais acima do orçamento?',
              ]}
            />

            <FeatureCard
              icon={PieChart}
              color="bg-rose-500"
              title="Relatório Visual com Gráfico (Imagem)"
              description="Solicite um relatório visual do mês e a IA gera uma imagem profissional com gráfico de receitas, despesas, metas e saldo — ideal para salvar ou compartilhar com seu contador."
              badge="Gera Imagem"
              preview={[
                { text: 'Me envia o resumo visual de março', isBot: false },
                { text: '📊 Relatório de Março gerado!\n[Imagem: Gráfico com Receitas, Despesas e Saldo]\nClique para visualizar.', isBot: true },
              ]}
              commands={[
                'Me envia o resumo visual de março (Gera Gráfico)',
                'Quero o relatório em imagem de fevereiro',
                'Gera o relatório visual desse mês pra eu mostrar pro contador',
              ]}
            />

            <FeatureCard
              icon={TrendingUp}
              color="bg-emerald-500"
              title="Relatório de Investimentos"
              description="Painel completo da sua carteira de investimentos: rentabilidade mês a mês, evolução histórica do patrimônio investido, distribuição por tipo de ativo (ações, FIIs, renda fixa)."
              commands={[
                'Qual a rentabilidade da minha carteira em 2024?',
                'Como está a evolução do meu patrimônio investido?',
                'Quais investimentos estão com lucro?',
                'Me mostra a distribuição da minha carteira por tipo',
              ]}
            />

            <FeatureCard
              icon={Target}
              color="bg-amber-500"
              title="Relatório de Metas"
              description="Visão consolidada de todas as metas ativas: progresso médio, total acumulado vs total alvo, número de metas concluídas e estimativa de prazo para cada meta."
              commands={[
                'Como estão minhas metas?',
                'Quais metas vou bater esse ano?',
                'Me faz um resumo de todas as minhas metas',
                'Qual meta está mais próxima de ser concluída?',
              ]}
            />

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 4 — PRODUTIVIDADE E SUPERPODERES DE IA                      */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-14">
          <SectionHeader
            color="bg-yellow-500"
            icon={Zap}
            title="Produtividade e Superpoderes de IA"
            subtitle="Além das finanças: agenda, pesquisa, lembretes e a IA que te conhece de verdade."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FeatureCard
              icon={Calendar}
              color="bg-yellow-500"
              title="Agenda Inteligente"
              description="Crie eventos, compromissos e lembretes com data e hora. A agenda sincroniza com o Google Calendar em tempo real. Suporta eventos recorrentes (mensais, anuais) e exportação para Apple/Outlook."
              preview={[
                { text: 'Marca consulta médica para dia 25 às 10h e me lembra no dia anterior', isBot: false },
                { text: '📅 Compromisso criado!\nConsulta Médica — 25/04 às 10h\nLembrete: amanhã (24/04) ✅\nSinc. Google Calendar ✅', isBot: true },
              ]}
              commands={[
                'Marca reunião com o Felipe amanhã às 14h',
                'Me lembre de pagar o aluguel todo dia 5 do mês',
                'O que eu tenho na agenda para hoje?',
                'Cria um evento recorrente de academia toda segunda às 7h',
                'Me mostra minha agenda da próxima semana',
              ]}
            />

            <FeatureCard
              icon={Video}
              color="bg-red-500"
              title="Google Meet Automático"
              description="Ao agendar uma reunião, o Simplific pode criar automaticamente um link do Google Meet e disparar o convite por WhatsApp para o seu cliente ou colaborador cadastrado nos contatos."
              badge="Integração"
              preview={[
                { text: 'Agenda reunião com a Ana amanhã às 15h e cria o link do Meet', isBot: false },
                { text: '🎥 Reunião criada!\nAmanhã às 15h com Ana\n🔗 meet.google.com/xyz-abc-def\n📲 Convite enviado para Ana no WhatsApp ✅', isBot: true },
              ]}
              commands={[
                'Marca reunião com cliente João amanhã às 14h com link do Meet',
                'Agenda call com a equipe para sexta às 16h e envia o Meet para todos',
                'Cria uma reunião e manda o link do Meet para a Ana',
              ]}
            />

            <FeatureCard
              icon={Search}
              color="bg-teal-500"
              title="Pesquisa na Internet em Tempo Real"
              description="A IA sai do WhatsApp e pesquisa na web: passagens aéreas, preços de produtos, cotações, notícias econômicas e muito mais. Retorna os resultados com links diretos para você."
              preview={[
                { text: 'Busca passagem de SP para RJ para o dia 20 de maio', isBot: false },
                { text: '✈️ Passagens SP → RJ (20/mai):\n• LATAM — R$ 289 (mais barato)\n• GOL — R$ 320\n• Azul — R$ 310\n🔗 [Link para reservar]', isBot: true },
              ]}
              commands={[
                'Busca passagens baratas de SP para RJ no dia 20',
                'Qual o preço do iPhone 16 Pro no Mercado Livre?',
                'Quais as principais notícias de economia hoje?',
                'Pesquisa hotéis em Floripa para o feriado de novembro',
                'Qual o câmbio oficial do dólar hoje?',
              ]}
            />

            <FeatureCard
              icon={Brain}
              color="bg-slate-700"
              title="Memória Permanente"
              description='O Simplific lembra de tudo que você conta sobre si mesmo. Preferências, nomes de familiares, datas importantes, metas pessoais. A cada conversa, ele retoma o contexto de onde parou.'
              preview={[
                { text: 'Lembra que minha esposa se chama Ana e faz aniversário dia 12 de junho', isBot: false },
                { text: '💾 Guardado na sua memória!\nAna — aniversário: 12 de junho\nVou te lembrar na data! 🎂', isBot: true },
              ]}
              commands={[
                'Lembre que minha esposa se chama Ana e faz aniversário em junho',
                'Meu salário é de 5.000 por mês',
                'Prefiro receber respostas curtas',
                'Qual é o nome da minha esposa? (teste de memória)',
                'Guarda que tenho um financiamento até 2028',
              ]}
            />

            <FeatureCard
              icon={Mic}
              color="bg-pink-500"
              title="Áudio e Transcrição Inteligente"
              description="Mande áudios gigantes, cheios de pedidos, e o Simplific transcreve tudo com IA de ponta e processa cada solicitação. Também pode responder em áudio se preferir."
              preview={[
                { text: '🎤 [Áudio de 45s]: "Oi, tô no trânsito. Gastei 35 no almoço, marca uma reunião pra sexta de manhã e me lembra de ligar pro banco amanhã."', isBot: false },
                { text: '✅ 3 ações executadas!\n1. Almoço R$ 35 lançado\n2. Reunião sexta às 9h criada\n3. Lembrete: ligar pro banco amanhã ✅', isBot: true },
              ]}
              commands={[
                '🎤 [Áudio]: Gastei 45 no posto e 20 no café',
                '🎤 [Áudio]: Quanto gastei esse mês? Me manda em áudio',
                'Pode me responder em voz?',
                '🎤 [Áudio longo com vários pedidos ao mesmo tempo]',
              ]}
            />

            <FeatureCard
              icon={Bell}
              color="bg-orange-400"
              title="Notificações e Lembretes"
              description="Configure alertas automáticos: vencimento de faturas, das de pagamento, aniversários de metas, eventos da agenda e alertas de orçamento ultrapassado — tudo direto no WhatsApp."
              commands={[
                'Me lembre de cancelar a Netflix na sexta-feira',
                'Avisa quando minha fatura do Nubank vencer',
                'Quero ser avisado quando gastar mais de 500 em restaurantes',
                'Cria um lembrete para pagar o IPTU todo dia 10',
              ]}
            />

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 5 — CONEXÕES E INTEGRAÇÕES                                  */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-14">
          <SectionHeader
            color="bg-emerald-600"
            icon={Link2}
            title="Conexões e Integrações"
            subtitle="Conecte seus bancos, calendário e contatos para uma experiência totalmente automatizada."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FeatureCard
              icon={Link2}
              color="bg-emerald-600"
              title="Open Finance — Sincronização Bancária"
              description="Conecte seus cartões de crédito via Open Finance (Pluggy). O sistema importa automaticamente as transações, categoriza com IA e organiza por fatura — sem precisar lançar nada manualmente."
              badge="Em breve"
              commands={[
                'Conecta meu Nubank no sistema',
                'Sincroniza as transações do meu cartão Itaú',
                'Importa minha fatura do C6 automaticamente',
              ]}
            />

            <FeatureCard
              icon={Calendar}
              color="bg-blue-500"
              title="Google Calendar Sync"
              description="Conecte sua conta Google e todos os eventos criados no Simplific aparecem automaticamente no seu Google Calendar. Edições e exclusões são sincronizadas em tempo real."
              badge="Integração"
              commands={[
                'Conecta meu Google Calendar',
                'Sincroniza minha agenda com o Google',
                'Todos meus eventos já aparecem no Google Calendar?',
              ]}
            />

            <FeatureCard
              icon={UserPlus}
              color="bg-sky-600"
              title="Contatos do WhatsApp"
              description="Cadastre clientes, familiares e colaboradores com nome e WhatsApp. Use nos agendamentos para disparar convites automáticos, links do Meet e notificações personalizadas."
              commands={[
                'Cadastra o contato Felipe Silva, WhatsApp 11 99999-0000',
                'Quais são meus contatos cadastrados?',
                'Manda uma mensagem para a Ana sobre nossa reunião de amanhã',
                'Atualiza o WhatsApp do cliente João',
              ]}
            />

          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* SEÇÃO 7 — GAMIFICAÇÃO                                             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <div className="mb-14">
          <SectionHeader
            color="bg-amber-500"
            icon={Trophy}
            title="Gamificação e Conquistas"
            subtitle="Transforme sua jornada financeira em um jogo onde cada hábito vira recompensa."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            <FeatureCard
              icon={Award}
              color="bg-amber-500"
              title="Sistema de Conquistas"
              description="Desbloqueie medalhas e conquistas à medida que evolui financeiramente: primeiro lançamento, meta concluída, semana sem dívidas, investimento iniciado, mês positivo e muito mais."
              preview={[
                { text: '🏆 Conquista desbloqueada!\n"Primeiro Aporte" — Você fez seu primeiro investimento!\n+50 XP. Continue investindo para novos prêmios! 🚀', isBot: true },
              ]}
              commands={[
                'Quais conquistas eu já desbloqueei?',
                'Quais conquistas faltam para eu ganhar?',
                'Quanto XP eu tenho?',
                'Me mostra meu ranking de conquistas',
              ]}
            />

            <FeatureCard
              icon={Star}
              color="bg-yellow-500"
              title="Missões e Desafios"
              description="Receba missões personalizadas baseadas no seu comportamento financeiro: 'Registre 5 lançamentos esta semana', 'Economize 10% mais que o mês passado', 'Atinja 50% de uma meta'."
              commands={[
                'Quais missões tenho ativas?',
                'Quanto falta para completar minha missão atual?',
                'Me manda o resumo da minha jornada financeira',
              ]}
            />

            <FeatureCard
              icon={Smartphone}
              color="bg-slate-600"
              title="Tudo pelo WhatsApp"
              description="Nenhuma instalação necessária. Tudo que o Simplific oferece está disponível pelo seu WhatsApp 24h por dia, 7 dias por semana. Fale naturalmente, mande áudio ou foto."
              preview={[
                { text: '"Cara, comi um burguer de 50 conto no cartão black, lança aí. E pesquisa um hotel em SP pro dia 10."', isBot: false },
                { text: '✅ Feito!\n1. R$ 50 em Alimentação no cartão black ✅\n2. Hotéis em SP — dia 10:\n• Hotel X — R$ 280/noite ⭐4,5\n• Hotel Y — R$ 220/noite ⭐4,2\n🔗 Ver mais opções', isBot: true },
              ]}
              commands={[
                'Qualquer coisa — fale naturalmente!',
                '🎤 Mande um áudio com vários pedidos de uma vez',
                '📸 Envie foto de comprovante ou nota fiscal',
                'Pode usar gírias, abreviações — a IA entende tudo',
              ]}
            />

          </div>
        </div>

        {/* ── CTA / RODAPÉ ─────────────────────────────────────────────────── */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="flex justify-center mb-4">
              <span className="bg-emerald-900/50 border border-emerald-700 text-emerald-300 text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                <Sparkles size={14} /> Mais de 30 funcionalidades integradas
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-5">Apenas fale naturalmente 🗣️</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              Esqueça os bots de "Digite 1 para X". O Simplific entende o seu jeito de falar, gírias,
              áudios enormes e atende múltiplos pedidos de uma só vez.
            </p>

            <div className="grid md:grid-cols-2 gap-5 text-left mb-10">
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
                <p className="text-rose-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Evite ser robótico
                </p>
                <p className="text-slate-500 line-through text-sm">
                  "Comando: Lançar. Valor: 50. Categoria: Alimentação. Status: Pago."
                </p>
              </div>
              <div className="bg-emerald-950/40 p-5 rounded-2xl border border-emerald-800/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <p className="text-emerald-400 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Fale como quiser
                </p>
                <p className="text-white text-sm leading-relaxed">
                  "Cara, comi um burguer de 50 conto no cartão black, lança aí. E já pesquisa um hotel em SP pro dia 10."
                </p>
              </div>
            </div>

            {/* Grade de capacidades */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              {[
                { icon: Mic, label: 'Aceita Áudios' },
                { icon: Receipt, label: 'Lê Comprovantes' },
                { icon: Globe, label: 'Pesquisa Web' },
                { icon: Brain, label: 'Memória Permanente' },
                { icon: Calendar, label: 'Integra Google' },
                { icon: TrendingUp, label: 'Bolsa em Tempo Real' },
                { icon: Award, label: 'Gamificação' },
                { icon: Shield, label: 'Dados Seguros' },
              ].map(({ icon: I, label }) => (
                <div key={label} className="flex items-center gap-2 bg-slate-800/50 px-3 py-2.5 rounded-xl border border-slate-700/50">
                  <I size={15} className="text-emerald-400 shrink-0" />
                  <span className="text-xs font-medium text-slate-300">{label}</span>
                </div>
              ))}
            </div>
          </div>
    </div>
  );
};

export default AdvisorFeatures;
