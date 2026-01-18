import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Lock, Server, EyeOff, FileKey, 
  Globe, CheckCircle, Smartphone, Database, 
  Activity, Users, Fingerprint, AlertTriangle, Key
} from 'lucide-react';

const SecurityPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black font-sans text-gray-100 selection:bg-green-500 selection:text-black overflow-x-hidden">
      
      {/* Navbar Fixa */}
      <div className="bg-black/90 backdrop-blur-xl sticky top-0 z-50 border-b border-green-900/30">
        <Navbar /> 
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl bg-green-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          
          {/* Status Indicator */}
          <div className="inline-flex items-center gap-2 bg-green-900/20 border border-green-500/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-400 text-xs font-bold tracking-widest uppercase">Sistemas Operacionais & Seguros</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Sua confiança é a nossa <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
               linha de código mais importante.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Adotamos uma postura de defesa em profundidade. Proteção de nível bancário, transparência radical e privacidade por design.
          </p>
        </div>
      </section>

      {/* --- COMPLIANCE STRIP (Badges) --- */}
      <section className="py-10 border-y border-gray-900 bg-gray-950/50">
        <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-3">
                    <ShieldCheck size={32} className="text-green-500" />
                    <div className="text-left">
                        <div className="text-white font-bold text-sm">LGPD Compliant</div>
                        <div className="text-gray-500 text-[10px] uppercase">Lei 13.709/2018</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Lock size={32} className="text-green-500" />
                    <div className="text-left">
                        <div className="text-white font-bold text-sm">End-to-End</div>
                        <div className="text-gray-500 text-[10px] uppercase">Criptografia</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Server size={32} className="text-green-500" />
                    <div className="text-left">
                        <div className="text-white font-bold text-sm">Google Cloud</div>
                        <div className="text-gray-500 text-[10px] uppercase">Infraestrutura</div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Key size={32} className="text-green-500" />
                    <div className="text-left">
                        <div className="text-white font-bold text-sm">AES-256</div>
                        <div className="text-gray-500 text-[10px] uppercase">Padrão Militar</div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- ARQUITETURA DE DADOS (Jornada) --- */}
      <section className="py-24 bg-black relative">
        <div className="container mx-auto px-4">
            <div className="mb-16 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-4">A Jornada do Dado Seguro</h2>
                <p className="text-gray-400">Entenda como suas informações trafegam dentro do nosso ecossistema.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4 relative">
                {/* Linha conectora (Desktop) */}
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-green-900 via-green-500 to-green-900 z-0 opacity-30"></div>

                {/* Passo 1 */}
                <div className="relative z-10 bg-gray-950 border border-gray-800 p-6 rounded-xl hover:border-green-500 transition-colors group">
                    <div className="w-12 h-12 bg-black border border-gray-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-900/20 group-hover:text-green-500 transition-colors shadow-lg shadow-black">
                        <Smartphone size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">1. Coleta Segura</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        Você envia a mensagem pelo WhatsApp. A comunicação é protegida pela criptografia oficial da Meta (WhatsApp Business API).
                    </p>
                </div>

                {/* Passo 2 */}
                <div className="relative z-10 bg-gray-950 border border-gray-800 p-6 rounded-xl hover:border-green-500 transition-colors group">
                    <div className="w-12 h-12 bg-black border border-gray-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-900/20 group-hover:text-green-500 transition-colors shadow-lg shadow-black">
                        <Fingerprint size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">2. Anonimização</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        Ao chegar em nossos servidores, dados sensíveis (como número de telefone) são tratados e separados das informações financeiras.
                    </p>
                </div>

                {/* Passo 3 */}
                <div className="relative z-10 bg-gray-950 border border-gray-800 p-6 rounded-xl hover:border-green-500 transition-colors group">
                    <div className="w-12 h-12 bg-black border border-gray-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-900/20 group-hover:text-green-500 transition-colors shadow-lg shadow-black">
                        <Database size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">3. Armazenamento</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        Os dados são salvos em bancos de dados isolados no Google Cloud, criptografados em repouso (AES-256).
                    </p>
                </div>

                {/* Passo 4 */}
                <div className="relative z-10 bg-gray-950 border border-gray-800 p-6 rounded-xl hover:border-green-500 transition-colors group">
                    <div className="w-12 h-12 bg-black border border-gray-700 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-900/20 group-hover:text-green-500 transition-colors shadow-lg shadow-black">
                        <EyeOff size={24} />
                    </div>
                    <h3 className="text-white font-bold mb-2">4. Acesso Restrito</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">
                        Nenhum humano tem acesso aos seus dados brutos. Apenas você, através da sua autenticação, visualiza seu dashboard.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- GRID TÉCNICO (Bento Grid Style) --- */}
      <section className="py-20 bg-gray-950 border-t border-gray-900">
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                
                {/* Card Grande Esquerda */}
                <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldCheck size={200} />
                    </div>
                    <div>
                        <div className="inline-block bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded mb-4">PRIVACIDADE</div>
                        <h3 className="text-3xl font-bold text-white mb-4">Seus dados são <span className="text-green-500">SEUS</span>.</h3>
                        <p className="text-gray-400 leading-relaxed max-w-lg">
                            Diferente de apps "gratuitos" que vendem suas informações para bancos e anunciantes, o Simplific Pro é sustentado pela sua assinatura. 
                            <br/><br/>
                            <strong>Nosso modelo de negócio é simples:</strong> você nos paga para organizar sua vida, e nós protegemos seus segredos. Não existe "compartilhamento com parceiros" nas letras miúdas.
                        </p>
                    </div>
                    <div className="mt-8 flex gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle size={16} className="text-green-500" /> Sem venda de dados
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <CheckCircle size={16} className="text-green-500" /> Sem anúncios
                        </div>
                    </div>
                </div>

                {/* Card Superior Direita */}
                <div className="bg-black p-6 rounded-2xl border border-gray-800 flex flex-col justify-center hover:bg-gray-900 transition-colors">
                    <Activity className="text-green-500 mb-4" size={32} />
                    <h4 className="text-white font-bold text-lg mb-2">Monitoramento 24/7</h4>
                    <p className="text-gray-400 text-xs">
                        Sistemas automatizados vigiam qualquer anomalia de tráfego ou tentativa de acesso indevido em tempo real.
                    </p>
                </div>

                {/* Card Inferior Direita */}
                <div className="bg-black p-6 rounded-2xl border border-gray-800 flex flex-col justify-center hover:bg-gray-900 transition-colors">
                    <Users className="text-green-500 mb-4" size={32} />
                    <h4 className="text-white font-bold text-lg mb-2">Controle de Acesso</h4>
                    <p className="text-gray-400 text-xs">
                        Adotamos o princípio do "menor privilégio". Funcionários do Simplific não têm acesso ao banco de dados de produção.
                    </p>
                </div>

            </div>
        </div>
      </section>

      {/* --- WHITE HAT / VULNERABILITY --- */}
      <section className="py-16 bg-black border-t border-gray-900">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="text-yellow-500" size={24} />
                      Reporte de Vulnerabilidade
                  </h3>
                  <p className="text-gray-400 text-sm mt-2 max-w-xl">
                      Acreditamos na comunidade de segurança. Se você é um pesquisador ou desenvolvedor e encontrou uma falha, queremos saber.
                  </p>
              </div>
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800">
                  security@simplificpro.com
              </Button>
          </div>
      </section>

      {/* --- FAQ TÉCNICO --- */}
      <section className="py-24 bg-gray-950/50 border-t border-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-12 text-white">Perguntas Frequentes de Segurança</h2>
          <div className="space-y-6">
            
            <div className="bg-black border border-gray-800 p-6 rounded-xl">
                <h4 className="text-white font-bold mb-2">O Simplific pode movimentar meu dinheiro?</h4>
                <p className="text-gray-400 text-sm">
                    <strong>Absolutamente não.</strong> Nossa tecnologia é de "leitura apenas" (Read-Only). Nós organizamos as informações que você nos fornece ou que conectamos via Open Finance, mas não temos "permissão de escrita" para realizar TEDs, Pix ou pagamentos.
                </p>
            </div>

            <div className="bg-black border border-gray-800 p-6 rounded-xl">
                <h4 className="text-white font-bold mb-2">E se eu perder meu celular?</h4>
                <p className="text-gray-400 text-sm">
                    Seu acesso ao Simplific Pro é protegido por senha e, opcionalmente, biometria (no app). Mesmo que alguém acesse seu WhatsApp, não conseguirá acessar o painel administrativo completo sem suas credenciais de login.
                </p>
            </div>

            <div className="bg-black border border-gray-800 p-6 rounded-xl">
                <h4 className="text-white font-bold mb-2">Como excluo meus dados?</h4>
                <p className="text-gray-400 text-sm">
                    Em conformidade com a LGPD, você tem um botão "Deletar Conta" nas configurações. Ao clicar, seus dados são imediatamente removidos do painel e agendados para exclusão definitiva (Hard Delete) dos backups em até 30 dias.
                </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-20 border-t border-gray-900 bg-gradient-to-b from-gray-900 to-black text-center">
        <div className="container mx-auto px-4">
            <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Segurança para nós não é feature. É premissa.</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
               Junte-se a milhares de usuários que controlam suas finanças com a tranquilidade de quem está protegido.
            </p>
            <div className="flex justify-center gap-4">
                <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                >
                    Voltar para Home
                </Button>
                <Button 
                    onClick={() => navigate('/checkout')}
                    className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 shadow-lg shadow-green-900/20"
                >
                    Começar Agora
                </Button>
            </div>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-black border-t border-gray-900 pt-10">
        <Footer />
      </div>
    </div>
  );
};

export default SecurityPage;