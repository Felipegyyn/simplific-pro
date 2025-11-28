import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldCheck, Lock, Eye, Server } from 'lucide-react';

const Privacidade = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-700">
      <Navbar />
      <div className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <ShieldCheck className="text-green-600"/> Política de Privacidade
        </h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-6 text-sm leading-relaxed text-justify">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3 mb-6">
                <Lock className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-green-800">Compromisso com a LGPD</h3>
                    <p className="text-green-700 text-sm">O Simplific Pro está comprometido com a proteção dos seus dados, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
                </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900">1. Coleta de Dados</h2>
            <p>Coletamos as seguintes informações para o funcionamento do serviço:</p>
            <ul className="list-disc pl-5">
                <li><strong>Dados de Cadastro:</strong> Nome, e-mail e número de telefone (WhatsApp).</li>
                <li><strong>Dados Financeiros:</strong> Informações sobre receitas, despesas, cartões e investimentos inseridos por você manualmente ou via mensagens.</li>
                <li><strong>Dados de Integração:</strong> Tokens de acesso para sincronização com Google Calendar (quando autorizado).</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-4">2. Uso das Informações</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul className="list-disc pl-5">
                <li>Fornecer os serviços contratados (gestão financeira e relatórios).</li>
                <li>Processar pagamentos e assinaturas.</li>
                <li>Enviar notificações importantes (vencimentos, alertas de orçamento).</li>
                <li>Melhorar a experiência do usuário e suporte técnico.</li>
            </ul>

            {/* SEÇÃO OBRIGATÓRIA PARA O GOOGLE - NÃO REMOVA */}
            <div className="border-l-4 border-blue-500 pl-4 py-2 my-6 bg-blue-50 rounded-r-lg">
                <h2 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                    <Eye size={20}/> 3. Uso de Dados do Google (Google User Data)
                </h2>
                <p className="text-blue-800 mt-2">
                    O uso e a transferência de informações recebidas das APIs do Google pelo Simplific Pro para qualquer outro aplicativo aderirão à 
                    <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer" className="underline ml-1 font-bold">
                        Política de Dados do Usuário dos Serviços de API do Google
                    </a>, incluindo os requisitos de Uso Limitado.
                </p>
                <p className="text-blue-800 mt-2">Specifically:</p>
                <ul className="list-disc pl-5 text-blue-800 mt-1">
                    <li>Utilizamos o acesso ao <strong>Google Calendar</strong> apenas para <strong>escrever</strong> lembretes financeiros e <strong>ler</strong> eventos para evitar conflitos.</li>
                    <li><strong>Não compartilhamos</strong> seus dados do Google com ferramentas de IA de terceiros para treinamento.</li>
                    <li><strong>Não vendemos</strong> seus dados do Google para anunciantes ou terceiros.</li>
                </ul>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mt-4">4. Armazenamento e Segurança</h2>
            <p>Utilizamos criptografia de ponta a ponta e armazenamos seus dados em servidores seguros (nuvem) com protocolos rígidos de segurança. As senhas são armazenadas com hash criptográfico e não são acessíveis por nossa equipe.</p>

            <h2 className="text-lg font-bold text-gray-900 mt-4">5. Compartilhamento de Dados</h2>
            <p>Não vendemos seus dados pessoais. Compartilhamos informações apenas com:</p>
            <ul className="list-disc pl-5">
                <li><strong>Mercado Pago:</strong> Apenas os dados necessários para processar o pagamento da assinatura.</li>
                <li><strong>Twilio/OpenAI:</strong> Para processamento das mensagens do Assessor Inteligente (os dados são anonimizados quando possível).</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-4">6. Seus Direitos (LGPD)</h2>
            <p>Você tem o direito de solicitar, a qualquer momento:</p>
            <ul className="list-disc pl-5">
                <li>A confirmação da existência de tratamento de dados.</li>
                <li>O acesso aos seus dados.</li>
                <li>A correção de dados incompletos ou desatualizados.</li>
                <li>A exclusão definitiva dos seus dados de nossos servidores.</li>
            </ul>

            <h2 className="text-lg font-bold text-gray-900 mt-4">7. Contato</h2>
            <p>Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: <a href="mailto:contato@simplificpro.com" className="text-green-600 font-bold hover:underline">contato@simplificpro.com</a></p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacidade;