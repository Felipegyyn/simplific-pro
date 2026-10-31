import React from 'react';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'Como o Simplific Pro funciona no meu WhatsApp?',
    answer: 'Assim que sua assinatura é confirmada, você recebe uma mensagem de boas-vindas do Pierre no seu WhatsApp oficial. A partir daí, basta conversar naturalmente enviando áudios, mensagens de texto ou fotos de comprovantes. O Pierre processa e organiza tudo instantaneamente.'
  },
  {
    question: 'Preciso instalar algum aplicativo no meu celular?',
    answer: 'Não. Tudo funciona diretamente no WhatsApp que você já utiliza todos os dias no seu celular e computador. Você também tem acesso opcional a um painel Web no navegador para visualizar relatórios, gráficos detalhados e fluxo de caixa.'
  },
  {
    question: 'Como registro meus gastos diários?',
    answer: 'Você pode registrar do jeito que for mais confortável: mandar um áudio no trânsito ("Pierre, gastei 45 no almoço"), digitar no chat ("Uber 28,50 débito") ou tirar a foto do cupom fiscal. O leitor OCR do Pierre extrai o valor, a data e a categoria na hora.'
  },
  {
    question: 'Meus dados financeiros estão seguros?',
    answer: 'Sim, segurança é nossa prioridade absoluta. Todas as mensagens e dados são protegidos por criptografia de ponta a ponta AES-256 e TLS 1.3, em conformidade com a LGPD. Nenhuma informação é compartilhada ou vendida para terceiros.'
  },
  {
    question: 'Como funciona o acompanhamento de investimentos da B3?',
    answer: 'O Simplific Pro é integrado às cotações oficiais do mercado financeiro brasileiro. Você pode consultar cotações de ações (como PETR4, VALE3, ITUB4) e fundos imobiliários em tempo real, além de cadastrar seus ativos para ver a variação patrimonial da sua carteira.'
  },
  {
    question: 'Posso usar a mesma conta com minha esposa ou parceiro(a)?',
    answer: 'Sim! Você pode cadastrar o número de telefone da sua parceira ou parceiro para que ambos alimentem o mesmo orçamento familiar pelo WhatsApp. Os gastos de ambos são unificados no mesmo painel.'
  },
  {
    question: 'Como funciona a garantia incondicional de 7 dias?',
    answer: 'Se durante os primeiros 7 dias de uso você achar que o Simplific Pro não é para você, basta pedir o cancelamento no chat ou por e-mail. Nós devolvemos 100% do valor pago, sem perguntas, sem ressentimentos e sem letras miúdas.'
  },
  {
    question: 'Posso cancelar minha assinatura a qualquer momento?',
    answer: 'Sim. Você tem total controle. No plano mensal não existe qualquer fidelidade, e você pode cancelar com apenas um clique diretamente no painel de usuário ou solicitando ao suporte.'
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-5xl mx-auto relative z-10" id="perguntas">

      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3 inline-block">
          Tire Suas Dúvidas
        </span>
        <h2 className="text-3xl md:text-5xl font-semibold text-white tracking-tight mb-3">
          Perguntas Frequentes
        </h2>
        <p className="text-zinc-400 text-sm md:text-base">
          Tem alguma dúvida que não está aqui? Fale diretamente com o nosso time de suporte via{' '}
          <a
            href="https://wa.me/5547992921005"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            WhatsApp oficial
          </a>.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="group rounded-2xl bg-zinc-950/80 border border-white/10 p-5 md:p-6 transition-all duration-200 hover:border-white/20 open:bg-zinc-900/60 open:border-emerald-500/30"
          >
            <summary className="flex items-center justify-between cursor-pointer list-none select-none text-base md:text-lg font-medium text-white">
              <span>{faq.question}</span>
              <span className="ml-4 flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-open:rotate-180 group-open:text-emerald-400 transition-transform duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-4 pt-4 border-t border-white/5 text-sm md:text-base text-zinc-400 leading-relaxed">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-12 text-center text-xs text-zinc-500">
        Para detalhes completos sobre privacidade e termos legais, consulte nossa{' '}
        <Link to="/privacidade" className="text-emerald-400 hover:underline">
          Política de Privacidade
        </Link>{' '}
        e{' '}
        <Link to="/seguranca" className="text-emerald-400 hover:underline">
          Central de Segurança
        </Link>.
      </div>

    </section>
  );
};

export default FAQSection;
