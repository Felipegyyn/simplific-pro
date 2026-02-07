import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Landmark, RefreshCw, MessageCircle, Filter, ArrowRight, CheckCircle2 } from 'lucide-react';

const VERSION_KEY = 'simplific_update_v2_banks'; // Chave única desta atualização

const WhatsNewModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já viu esta atualização
    const hasSeenUpdate = localStorage.getItem(VERSION_KEY);
    if (!hasSeenUpdate) {
        // Pequeno delay para não ser agressivo ao carregar a dashboard
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Marca como visto para não abrir de novo
    localStorage.setItem(VERSION_KEY, 'true');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Novo</span>
            <DialogTitle className="text-2xl font-bold">O Simplific Pro evoluiu! 🚀</DialogTitle>
          </div>
          <DialogDescription>
            Preparamos atualizações importantes para te dar controle total sobre seu dinheiro. Confira o que mudou:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
            {/* Feature 1 */}
            <div className="flex gap-4">
                <div className="bg-blue-100 p-3 rounded-xl h-fit">
                    <Landmark className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Contas Bancárias</h3>
                    <p className="text-sm text-gray-500">Agora você pode cadastrar seus bancos (Nubank, Itaú, etc) e controlar o saldo de cada um individualmente no menu "Configurações".</p>
                </div>
            </div>

            {/* Feature 2 */}
            <div className="flex gap-4">
                <div className="bg-green-100 p-3 rounded-xl h-fit">
                    <RefreshCw className="h-6 w-6 text-green-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Saldos Automáticos</h3>
                    <p className="text-sm text-gray-500">Ao criar uma Receita ou Despesa, você pode vincular a uma conta. O saldo é atualizado automaticamente na hora!</p>
                </div>
            </div>

            {/* Feature 3 */}
            <div className="flex gap-4">
                <div className="bg-purple-100 p-3 rounded-xl h-fit">
                    <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Simplific ainda mais Inteligente</h3>
                    <p className="text-sm text-gray-500">Se você não disser o banco no WhatsApp (ex: "Gastei 50"), o Simplific vai perguntar se você quer vincular a uma conta. Se disser "não", ela lança sem vínculo.</p>
                </div>
            </div>

             {/* Feature 4 */}
             <div className="flex gap-4">
                <div className="bg-orange-100 p-3 rounded-xl h-fit">
                    <Filter className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Filtros Poderosos</h3>
                    <p className="text-sm text-gray-500">Na tela de Lançamentos, agora você pode filtrar para ver apenas o extrato do Nubank, do Itaú ou de todos juntos.</p>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold">
            Entendi, vamos começar! <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNewModal;