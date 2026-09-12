import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Brain,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  CreditCard,
  FileText,
  LockKeyhole,
  MessageCircle,
  Mic,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react';

const featureCards = [
  {
    icon: MessageCircle,
    title: 'Conversa natural com IA',
    description: 'Mande um áudio ou escreva do seu jeito. O Simplific entende o contexto, registra e responde sem planilhas.',
  },
  {
    icon: Network,
    title: 'Tudo em um só lugar',
    description: 'Organize contas, cartões, investimentos e metas em uma visão simples da sua vida financeira.',
  },
  {
    icon: BellRing,
    title: 'Você sabe o que vem pela frente',
    description: 'Parcelas, assinaturas e vencimentos ficam visíveis para que nenhuma surpresa pegue você desprevenido.',
  },
  {
    icon: Target,
    title: 'Objetivos que saem do papel',
    description: 'Crie metas para viajar, quitar dívidas ou formar patrimônio e acompanhe o progresso automaticamente.',
  },
];

const capabilityCards = [
  { icon: WalletCards, title: 'Lançamentos inteligentes', text: 'Registre gastos por texto, áudio ou comprovante e deixe a categorização acontecer.' },
  { icon: CreditCard, title: 'Cartões sob controle', text: 'Acompanhe limites, faturas e parcelamentos com uma visão clara do seu mês.' },
  { icon: TrendingUp, title: 'Patrimônio em evolução', text: 'Visualize investimentos, cotações e decisões importantes em um só painel.' },
  { icon: CalendarDays, title: 'Agenda que ajuda', text: 'Crie lembretes e compromissos pelo chat para cuidar da vida financeira e pessoal.' },
  { icon: Mic, title: 'Áudio sem burocracia', text: 'Fale naturalmente. O Simplific transcreve, interpreta e transforma sua intenção em ação.' },
  { icon: Brain, title: 'Memória do seu contexto', text: 'Preferências e objetivos ficam organizados para uma assistência cada vez mais útil.' },
];

const faqs = [
  ['O plano mensal tem fidelidade?', 'Não. Você pode cancelar quando quiser, sem multas ou taxas surpresas.'],
  ['Meus dados bancários ficam salvos?', 'O Simplific não acessa suas senhas nem movimenta seu dinheiro. Ele organiza as informações que você autoriza e protege seus dados com segurança de nível bancário.'],
  ['Consigo usar apenas pelo WhatsApp?', 'Sim. Você pode registrar gastos, consultar informações e pedir relatórios por texto ou áudio. O dashboard complementa a experiência com uma visão mais analítica.'],
  ['Posso parcelar o plano anual?', 'Sim. O plano anual pode ser parcelado em até 12 vezes no cartão, conforme as condições apresentadas no checkout.'],
  ['Como cancelo se não gostar?', 'O cancelamento pode ser feito pelo seu painel, de forma simples e sem burocracia.'],
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-6 py-6 text-left text-base font-medium text-white transition-colors hover:text-lime-300 md:text-lg"
        aria-expanded={open}
      >
        <span>{question}</span>
        {open ? <ChevronUp className="shrink-0 text-lime-300" size={20} /> : <ChevronDown className="shrink-0 text-white/50" size={20} />}
      </button>
      {open && <p className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-white/55 md:text-base">{answer}</p>}
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto h-[590px] w-[300px] sm:h-[650px] sm:w-[330px]">
      <div className="absolute -inset-20 rounded-full bg-lime-300/10 blur-3xl" />
      <div className="absolute -right-10 top-24 z-20 hidden w-48 rounded-2xl border border-white/15 bg-[#171817]/95 p-3 shadow-2xl sm:block">
        <div className="mb-2 flex items-center justify-between text-[10px] text-white/45"><span>Gastos essa semana</span><TrendingUp size={13} className="text-lime-300" /></div>
        <div className="text-lg font-semibold text-white">R$ 842,40</div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[62%] rounded-full bg-lime-300" /></div>
      </div>
      <div className="absolute -left-20 bottom-28 z-20 hidden w-52 rounded-2xl border border-white/15 bg-[#171817]/95 p-3 shadow-2xl sm:block">
        <div className="mb-2 flex items-center gap-2 text-[10px] text-white/45"><CircleDollarSign size={14} className="text-lime-300" /> Últimas transações</div>
        <div className="flex items-center justify-between border-t border-white/10 py-2 text-xs"><span className="text-white/75">Delivery de comida</span><span className="text-white">R$ 42,00</span></div>
        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-xs"><span className="text-white/75">Hospedagem</span><span className="text-white">R$ 120,00</span></div>
      </div>
      <div className="relative z-10 h-full w-full rounded-[42px] border-[9px] border-[#2d302d] bg-[#090a09] p-2 shadow-[0_0_0_1px_rgba(255,255,255,.12),0_35px_80px_rgba(0,0,0,.7)]">
        <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#2d302d]" />
        <div className="relative h-full overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_50%_30%,rgba(181,255,59,.10),transparent_30%),#0b0d0b] px-5 pb-6 pt-14">
          <div className="flex items-center justify-between text-xs text-white/45"><span>9:41</span><span className="flex gap-1"><span className="h-2 w-2 rounded-full bg-white/60" /><span className="h-2 w-2 rounded-full bg-white/60" /><span className="h-2 w-2 rounded-full bg-lime-300" /></span></div>
          <div className="mt-12 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-lime-300/25 bg-lime-300/10 text-lime-300"><Sparkles size={30} /></div><p className="mt-4 text-sm text-white/40">Olá,</p><p className="text-sm text-white/65">Como eu posso ajudar hoje?</p></div>
          <div className="mt-14 space-y-3"><div className="ml-8 rounded-2xl rounded-br-sm bg-lime-300 px-4 py-3 text-xs font-medium text-[#10130d]">Quanto gastei com delivery este mês?</div><div className="mr-6 rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-xs leading-5 text-white/70">Você gastou <strong className="text-lime-300">R$ 286,40</strong> em delivery. Isso representa 12% dos seus gastos no período.</div><div className="ml-8 rounded-2xl rounded-br-sm bg-lime-300 px-4 py-3 text-xs font-medium text-[#10130d]">Criar meta: viagem em dezembro</div></div>
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/30"><span>Digite uma mensagem...</span><ArrowRight size={15} className="text-lime-300" /></div>
        </div>
      </div>
    </div>
  );
}

const HomePage = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('annual');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.amazonaws.com/raichu-beta/ra-verified/bundle.js';
    script.async = true;
    script.id = 'ra-embed-verified-seal';
    script.setAttribute('data-id', 'UWJISTEzOXlvV09HWFhuOTo0MS04NTEtMDI5LWZlbGlwZS12aWFuYS1kZS1vbGl2ZWlyYQ==');
    script.setAttribute('data-target', 'ra-verified-seal');
    script.setAttribute('data-model', 'compact_3');
    document.body.appendChild(script);
    return () => document.getElementById('ra-embed-verified-seal')?.remove();
  }, []);

  const pricing = billingCycle === 'annual'
    ? { old: 'R$ 358,80', price: '16,58', suffix: '/mês', detail: 'No plano anual. Ou R$ 199,00 à vista', badge: 'Melhor escolha · 45% OFF', button: 'Garantir oferta anual' }
    : { old: null, price: '29,90', suffix: '/mês', detail: 'Sem fidelidade. Cancele quando quiser.', badge: 'Flexibilidade total', button: 'Assinar mensal' };

  const handleBuyClick = () => {
    if (window.fbq) window.fbq('track', 'InitiateCheckout', { content_name: billingCycle === 'monthly' ? 'Plano Mensal' : 'Plano Anual', value: billingCycle === 'monthly' ? 29.9 : 199, currency: 'BRL' });
    navigate(billingCycle === 'monthly' ? '/checkout' : '/checkout?plan=annual');
  };

  return (
    <div className="simplific-landing min-h-screen overflow-x-hidden bg-[#080908] font-sans text-white selection:bg-lime-300 selection:text-black">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(192,255,72,.11),transparent_31%),radial-gradient(circle_at_90%_50%,rgba(192,255,72,.06),transparent_27%)]" />
          <div className="container relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-20 md:grid-cols-[.9fr_1.1fr] md:px-10 md:pb-28 md:pt-28">
            <div className="max-w-xl">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-lime-300/25 bg-lime-300/10 px-3 py-1.5 text-xs font-medium text-lime-200"><span className="h-1.5 w-1.5 rounded-full bg-lime-300" /> Assistente financeiro pessoal</div>
              <h1 className="max-w-2xl text-5xl font-semibold leading-[.98] tracking-[-.055em] text-white sm:text-6xl md:text-7xl">Sua vida financeira, <span className="text-lime-300">mais simples.</span></h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-white/55 md:text-lg">O Simplific entende sua rotina, organiza seu dinheiro e mostra o que está acontecendo antes de você precisar perguntar.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button onClick={() => navigate('/planos')} className="h-14 rounded-full bg-lime-300 px-7 text-base font-semibold text-[#10130d] shadow-[0_0_35px_rgba(192,255,72,.16)] hover:bg-lime-200">Começar agora <ArrowRight className="ml-2" size={18} /></Button><Button onClick={() => navigate('/login')} variant="outline" className="h-14 rounded-full border-white/15 bg-white/[.03] px-7 text-base text-white hover:bg-white/10">Já sou cliente</Button></div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40"><span className="flex items-center gap-2"><ShieldCheck size={14} className="text-lime-300" /> Segurança de nível bancário</span><span className="flex items-center gap-2"><LockKeyhole size={14} className="text-lime-300" /> Só leitura</span></div>
            </div>
            <PhoneMockup />
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#0b0c0b] py-8"><div className="container mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 text-center md:grid-cols-4 md:px-10"><div><strong className="block text-2xl font-semibold text-white">+15 anos</strong><span className="text-xs text-white/40">de experiência</span></div><div><strong className="block text-2xl font-semibold text-white">24h/7</strong><span className="text-xs text-white/40">assistência disponível</span></div><div><strong className="block text-2xl font-semibold text-white">100%</strong><span className="text-xs text-white/40">dados protegidos</span></div><div><strong className="block text-2xl font-semibold text-white">1 lugar</strong><span className="text-xs text-white/40">para sua vida financeira</span></div></div></section>

        <section id="beneficios" className="py-24 md:py-32"><div className="container mx-auto max-w-7xl px-5 md:px-10"><div className="mb-14 max-w-2xl"><span className="text-xs font-semibold uppercase tracking-[.22em] text-lime-300">O que o Simplific faz</span><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] md:text-5xl">Conecte sua rotina. <span className="text-white/45">Deixe o resto com a inteligência.</span></h2></div><div className="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">{featureCards.map(({ icon: Icon, title, description }) => <div key={title} className="group bg-[#0d0f0d] p-7 transition-colors hover:bg-[#141814]"><div className="mb-16 flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-300/20 bg-lime-300/10 text-lime-300"><Icon size={21} /></div><h3 className="text-lg font-medium text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{description}</p></div>)}</div></div></section>

        <section className="border-y border-white/10 bg-[#0c0e0c] py-24 md:py-32"><div className="container mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-[.85fr_1.15fr] md:items-center md:px-10"><div><span className="text-xs font-semibold uppercase tracking-[.22em] text-lime-300">Sem sustos no fim do mês</span><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] md:text-6xl">Veja para onde seu <span className="text-lime-300">dinheiro está indo.</span></h2><p className="mt-6 max-w-lg text-base leading-7 text-white/50">O Simplific categoriza cada gasto, encontra padrões e mostra onde dá para economizar. Tudo em uma leitura clara, sem transformar sua vida em uma planilha.</p><Button onClick={() => navigate('/planos')} className="mt-8 rounded-full bg-lime-300 px-6 font-semibold text-[#10130d] hover:bg-lime-200">Começar grátis <ArrowRight className="ml-2" size={17} /></Button></div><div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/10 bg-[#080908] p-6 shadow-2xl"><div className="absolute right-[-15%] top-[-35%] h-80 w-80 rounded-full bg-lime-300/10 blur-3xl" /><div className="relative"><div className="flex items-center justify-between"><div><p className="text-xs text-white/40">Visão geral · Julho</p><p className="mt-2 text-3xl font-semibold">R$ 4.280,00</p></div><div className="rounded-full bg-lime-300/10 px-3 py-1 text-xs text-lime-300">+12,4%</div></div><div className="mt-10 flex h-44 items-end gap-3 border-b border-l border-white/10 px-3">{[38, 55, 42, 70, 64, 84, 72, 96, 78, 88, 100, 92].map((height, index) => <div key={index} className="group relative flex-1 rounded-t-md bg-lime-300/20 transition-colors hover:bg-lime-300" style={{ height: `${height}%` }}><span className="absolute -top-6 left-1/2 hidden -translate-x-1/2 text-[9px] text-white/50 group-hover:block">{index + 1}</span></div>)}</div><div className="mt-6 grid grid-cols-3 gap-3">{[['Essenciais', 'R$ 1.820'], ['Lazer', 'R$ 680'], ['Investimentos', 'R$ 1.240']].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.03] p-3"><p className="text-[10px] text-white/40">{label}</p><p className="mt-1 text-sm font-medium text-white">{value}</p></div>)}</div></div></div></div></section>

        <section className="py-24 md:py-32"><div className="container mx-auto max-w-7xl px-5 md:px-10"><div className="mb-14 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="text-xs font-semibold uppercase tracking-[.22em] text-lime-300">Tudo conectado</span><h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-.04em] md:text-5xl">Uma inteligência que acompanha o seu ritmo.</h2></div><p className="max-w-sm text-sm leading-6 text-white/45">Do gasto no mercado ao investimento de longo prazo, você sempre sabe qual é o próximo passo.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{capabilityCards.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border border-white/10 bg-white/[.025] p-6 transition-all hover:-translate-y-1 hover:border-lime-300/35 hover:bg-lime-300/[.04]"><Icon size={22} className="text-lime-300" /><h3 className="mt-10 text-lg font-medium">{title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{text}</p></div>)}</div></div></section>

        <section className="border-y border-white/10 bg-[#0c0e0c] py-24 md:py-32"><div className="container mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-[1.1fr_.9fr] md:items-center md:px-10"><div className="order-2 md:order-1"><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-[#090a09] p-6"><LockKeyhole className="text-lime-300" size={24} /><h3 className="mt-12 text-lg font-medium">Só leitura, zero transações</h3><p className="mt-3 text-sm leading-6 text-white/45">O Simplific não pode fazer transferências ou pagamentos. Ele lê e organiza para ajudar você.</p></div><div className="rounded-3xl border border-white/10 bg-[#090a09] p-6"><ShieldCheck className="text-lime-300" size={24} /><h3 className="mt-12 text-lg font-medium">Criptografia bancária</h3><p className="mt-3 text-sm leading-6 text-white/45">Seus dados são tratados com a mesma seriedade que suas transações bancárias.</p></div><div className="rounded-3xl border border-white/10 bg-[#090a09] p-6"><FileText className="text-lime-300" size={24} /><h3 className="mt-12 text-lg font-medium">Senha é só sua</h3><p className="mt-3 text-sm leading-6 text-white/45">A conexão acontece no ambiente do seu banco. Nós nunca pedimos sua senha.</p></div><div className="rounded-3xl border border-white/10 bg-[#090a09] p-6"><Search className="text-lime-300" size={24} /><h3 className="mt-12 text-lg font-medium">Open Finance oficial</h3><p className="mt-3 text-sm leading-6 text-white/45">Conexões regulamentadas para você ter clareza sem abrir mão do controle.</p></div></div></div><div className="order-1 md:order-2"><span className="text-xs font-semibold uppercase tracking-[.22em] text-lime-300">Segurança primeiro</span><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.04em] md:text-6xl">O Simplific nunca mexe <span className="text-white/45">no seu dinheiro.</span></h2><p className="mt-6 text-base leading-7 text-white/50">Ele só lê. Como um extrato, só que inteligente. Você decide o que conectar e continua no controle de tudo.</p><Button onClick={() => navigate('/seguranca')} variant="outline" className="mt-8 rounded-full border-white/15 text-white hover:bg-white/10">Conhecer nossa segurança <ArrowRight className="ml-2" size={17} /></Button></div></div></section>

        <section id="oferta" className="py-24 md:py-32"><div className="container mx-auto max-w-4xl px-5 md:px-10"><div className="mb-12 text-center"><span className="text-xs font-semibold uppercase tracking-[.22em] text-lime-300">Planos simples</span><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] md:text-5xl">Comece sem complicação.</h2><p className="mx-auto mt-5 max-w-xl text-white/45">Escolha a forma que faz sentido para você e tenha seu próprio assessor financeiro.</p></div><div className="mx-auto mb-8 flex w-fit rounded-full border border-white/10 bg-white/[.03] p-1"><button type="button" onClick={() => setBillingCycle('monthly')} className={`rounded-full px-5 py-2 text-sm transition-colors ${billingCycle === 'monthly' ? 'bg-white text-black' : 'text-white/50 hover:text-white'}`}>Mensal</button><button type="button" onClick={() => setBillingCycle('annual')} className={`rounded-full px-5 py-2 text-sm transition-colors ${billingCycle === 'annual' ? 'bg-lime-300 font-semibold text-black' : 'text-white/50 hover:text-white'}`}>Anual <span className="ml-1 text-[10px]">-45%</span></button></div><div className="relative overflow-hidden rounded-[32px] border border-lime-300/25 bg-[linear-gradient(120deg,rgba(192,255,72,.10),rgba(255,255,255,.02)_45%)] p-7 md:p-10"><div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl" /><div className="relative flex flex-col justify-between gap-10 md:flex-row md:items-end"><div><span className="inline-flex rounded-full bg-lime-300/15 px-3 py-1 text-xs font-medium text-lime-200">{pricing.badge}</span>{pricing.old && <p className="mt-8 text-sm text-white/35 line-through">{pricing.old}</p>}<div className="mt-1 flex items-end gap-2"><span className="mb-2 text-sm text-white/50">R$</span><strong className="text-6xl font-semibold tracking-[-.06em]">{pricing.price}</strong><span className="mb-2 text-white/45">{pricing.suffix}</span></div><p className="mt-4 border-l-2 border-lime-300 pl-3 text-sm text-white/65">{pricing.detail}</p><div className="mt-5 flex flex-wrap gap-4 text-xs text-white/45"><span className="flex items-center gap-1.5"><Check size={14} className="text-lime-300" /> Acesso imediato</span><span className="flex items-center gap-1.5"><Check size={14} className="text-lime-300" /> Compra segura</span></div></div><div className="w-full md:w-auto"><Button onClick={handleBuyClick} className="h-14 w-full rounded-full bg-lime-300 px-8 font-semibold text-[#10130d] hover:bg-lime-200 md:w-auto">{pricing.button} <ArrowRight className="ml-2" size={17} /></Button><p className="mt-3 text-center text-xs text-white/30">Pagamento seguro via Asaas</p></div></div></div></div></section>

        <section className="border-t border-white/10 bg-[#0b0c0b] py-24"><div className="container mx-auto max-w-3xl px-5 md:px-10"><div className="mb-10 text-center"><span className="text-xs font-semibold uppercase tracking-[.22em] text-lime-300">Perguntas frequentes</span><h2 className="mt-4 text-4xl font-semibold tracking-[-.04em]">Ainda ficou alguma dúvida?</h2></div><div>{faqs.map(([question, answer]) => <FaqItem key={question} question={question} answer={answer} />)}</div></div></section>

        <section className="relative overflow-hidden py-24"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(192,255,72,.14),transparent_48%)]" /><div className="relative mx-auto max-w-3xl px-5 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-[#10130d]"><Sparkles size={26} /></div><h2 className="mt-7 text-4xl font-semibold tracking-[-.04em] md:text-6xl">Mais clareza. Menos preocupação.</h2><p className="mx-auto mt-5 max-w-xl text-white/45">Sua vida financeira não precisa ocupar a sua cabeça o tempo todo. Comece a organizar tudo com o Simplific.</p><Button onClick={() => navigate('/planos')} className="mt-8 h-14 rounded-full bg-lime-300 px-8 font-semibold text-[#10130d] hover:bg-lime-200">Começar agora <ArrowRight className="ml-2" size={18} /></Button></div></section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

// Mantido para compatibilidade futura com integrações que importavam o ícone em páginas externas.
export { X };
