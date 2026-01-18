import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, Lock, Server, EyeOff, FileKey, 
  Globe, CheckCircle, Smartphone 
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
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-green-900/20 rounded-full mb-8">
            <ShieldCheck className="text-green-500 w-12 h-12" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Segurança não é <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
               opcional, é a base.
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Sua tranquilidade é nosso maior ativo. Construímos o Simplific Pro seguindo os mais rigorosos padrões internacionais de proteção de dados bancários.
          </p>
        </div>
      </section>

      {/* --- GRID DE PILARES (Estilo Jota.ai mas Dark) --- */}
      <section className="py-16 bg-gray-950 border-y border-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="p-8 bg-black border border-gray-800 rounded-2xl hover:border-green-500/50 transition-all group">
              <Lock className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Criptografia de Ponta</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Todos os dados trafegados entre seu WhatsApp e nossa inteligência são criptografados. Nem nós, nem o Facebook, temos acesso ao conteúdo sensível de forma aberta.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 bg-black border border-gray-800 rounded-2xl hover:border-green-500/50 transition-all group">
              <EyeOff className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Privacidade Absoluta</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nós <strong>apenas lemos</strong> os dados para organizar seu dashboard. O Simplific Pro <strong>não tem permissão</strong> para fazer transferências, pagamentos ou movimentações na sua conta.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 bg-black border border-gray-800 rounded-2xl hover:border-green-500/50 transition-all group">
              <Server className="w-10 h-10 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-3">Infraestrutura Google</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Nossos servidores estão hospedados no Google Cloud Platform (GCP), utilizando a mesma infraestrutura de segurança que protege o Gmail e o YouTube.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- DETALHES TÉCNICOS --- */}
      <section className="py-24 bg-black">
        <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-16">
                
                <div className="w-full md:w-1/2">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        Conformidade com a LGPD
                    </h2>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                        Respeitamos rigorosamente a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Seus dados pertencem a você, não a nós.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                            <span className="text-gray-300 text-sm">Você pode solicitar a exclusão total dos seus dados a qualquer momento com um clique.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                            <span className="text-gray-300 text-sm">Não vendemos, compartilhamos ou comercializamos suas informações com terceiros para fins publicitários.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle className="text-green-500 mt-1 shrink-0" size={20} />
                            <span className="text-gray-300 text-sm">Transparência total sobre quais dados coletamos (apenas os necessários para o seu controle financeiro).</span>
                        </li>
                    </ul>
                </div>

                <div className="w-full md:w-1/2 bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <FileKey className="text-green-500" /> Protocolos de Segurança
                    </h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <span className="text-gray-400 text-sm">Criptografia em Trânsito</span>
                            <span className="text-green-400 font-mono text-xs bg-green-900/20 px-2 py-1 rounded">TLS 1.3 / SSL</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <span className="text-gray-400 text-sm">Criptografia em Repouso</span>
                            <span className="text-green-400 font-mono text-xs bg-green-900/20 px-2 py-1 rounded">AES-256</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                            <span className="text-gray-400 text-sm">Autenticação</span>
                            <span className="text-green-400 font-mono text-xs bg-green-900/20 px-2 py-1 rounded">JWT + OAuth2</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-400 text-sm">Monitoramento</span>
                            <span className="text-green-400 font-mono text-xs bg-green-900/20 px-2 py-1 rounded">24/7 Realtime</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-20 border-t border-gray-900 bg-gradient-to-b from-gray-900 to-black text-center">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white mb-4">Sinta-se seguro para prosperar</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                A tecnologia existe para facilitar sua vida, não para tirar seu sono. 
                Teste o Simplific Pro com a certeza de que seus dados estão blindados.
            </p>
            <Button 
                onClick={() => navigate('/')}
                size="lg" 
                className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 rounded-lg transition-all"
            >
                Voltar para a Home
            </Button>
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