import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Termos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-700">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Termos de Uso</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-sm leading-relaxed text-justify">
            <p><strong>Última atualização: 28 de Novembro de 2025.</strong></p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta ou utilizar o <strong>Simplific Pro</strong> ("Plataforma"), você concorda expressamente com estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">2. Descrição do Serviço</h2>
            <p>O Simplific Pro é uma ferramenta de gestão financeira pessoal e empresarial que oferece funcionalidades de controle de fluxo de caixa, dashboards, integração com WhatsApp via Inteligência Artificial e sincronização de agendas. <strong>O Simplific Pro não é uma instituição financeira</strong>, não realiza empréstimos e não oferece consultoria de investimentos.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">3. Assinaturas e Pagamentos</h2>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Planos:</strong> O serviço é oferecido mediante assinatura (mensal ou anual).</li>
                <li><strong>Processamento:</strong> Os pagamentos são processados de forma segura pelo <strong>Mercado Pago</strong>. Nós não armazenamos os dados completos do seu cartão de crédito.</li>
                <li><strong>Renovação Automática:</strong> Sua assinatura será renovada automaticamente ao final de cada período, a menos que você a cancele antes da data de renovação.</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-4">4. Cancelamento e Reembolso</h2>
            <p>Você pode cancelar sua assinatura a qualquer momento através do painel do usuário. O acesso permanecerá ativo até o fim do ciclo de cobrança vigente. Conforme o Art. 49 do Código de Defesa do Consumidor, oferecemos uma garantia incondicional de 7 dias para reembolso total na primeira assinatura.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">5. Responsabilidades do Usuário</h2>
            <p>Você é responsável por manter a confidencialidade de sua senha e por todas as atividades que ocorram em sua conta. Você concorda em fornecer informações verdadeiras e em não utilizar a plataforma para fins ilícitos.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">6. Integrações de Terceiros (Google e WhatsApp)</h2>
            <p>Nossa plataforma integra-se com serviços como Google Calendar e WhatsApp. Ao utilizar essas funcionalidades, você nos autoriza a enviar e receber dados necessários para a prestação do serviço (como criar eventos na sua agenda ou responder mensagens), conforme detalhado em nossa Política de Privacidade.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">7. Integração Bancária e Open Finance</h2>
            <p>Para oferecer funcionalidades de agregação de contas e categorização automática, o Simplific Pro utiliza APIs de <strong>provedores de Open Finance regulamentados pelo Banco Central</strong>. Ao conectar sua conta bancária, você autoriza expressamente a leitura dos seus dados transacionais (extrato e saldo) de forma automática. <strong>Suas credenciais bancárias (senhas) não são armazenadas pelo Simplific Pro</strong>, e o consentimento de acesso pode ser revogado por você a qualquer momento.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">8. Limitação de Responsabilidade</h2>
            <p>O Simplific Pro fornece ferramentas para auxiliar na organização financeira, mas as decisões econômicas são de inteira responsabilidade do usuário. Não nos responsabilizamos por prejuízos financeiros decorrentes de decisões tomadas com base nas informações da plataforma.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">9. Alterações nos Termos</h2>
            <p>Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alterações significativas através do e-mail cadastrado ou aviso na plataforma.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">10. Foro</h2>
            <p>Fica eleito o foro da comarca de Goiânia/GO para dirimir quaisquer dúvidas oriundas deste contrato, com renúncia a qualquer outro.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Termos;