import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import apiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InvestmentDetailModal = ({ isOpen, onClose, investmentId, onUpdate }) => {
  const [investment, setInvestment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellFormData, setSellFormData] = useState({ value: '', observations: '' });

  // PASSO 1: NOVO ESTADO PARA OS DADOS DO GRÁFICO
  const [projectionData, setProjectionData] = useState([]);

  // ▼▼▼ SUBSTITUA O SEU useEffect POR ESTE ▼▼▼
  useEffect(() => {
    const loadDetails = async () => {
      if (!investmentId) return;
      setLoading(true);
      try {
        const investmentData = await apiService.get(`/api/investments/${investmentId}`);
        setInvestment(investmentData);
        
        const historyData = await apiService.get(`/api/investments/${investmentId}/transactions`);
        setHistory(historyData || []);

        // Pega os dados da projeção diretamente da API
        setProjectionData(investmentData.projection_data || []);

      } catch (error) {
        console.error("Erro ao carregar detalhes do investimento:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) {
      loadDetails();
    }
  }, [isOpen, investmentId]);

  const handleSellSubmit = async (e) => {
    e.preventDefault();
    const sellValue = parseFloat(sellFormData.value);
    if (!sellValue || sellValue <= 0) {
      alert("Por favor, insira um valor de venda válido.");
      return;
    }
    if (investment && sellValue > investment.current_value) {
      alert("O valor do resgate não pode ser maior que o valor atual do investimento.");
      return;
    }
    try {
      await apiService.post(`/api/investments/${investmentId}/sell`, {
        value: sellValue,
        observations: sellFormData.observations
      });
      alert('✅ Resgate/Venda realizado com sucesso!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao realizar venda:", error);
      const errorMessage = error.response?.data?.error || 'Erro ao processar o resgate.';
      alert(`❌ ${errorMessage}`);
    }
  };

  if (!isOpen) return null;

  // ▼▼▼ SUBSTITUA TODO O CONTEÚDO DO 'return' POR ESTE BLOCO ▼▼▼

return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/*         PASSO 1: Adicionar classes ao DialogContent.
        - h-[90vh]: Limita a altura do modal a 90% da altura da tela.
        - flex flex-col: Transforma o modal em um container flexível vertical.
      */}
      <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalhes do Investimento: {loading ? "Carregando..." : investment?.name}</DialogTitle>
        </DialogHeader>
        
        {/*           PASSO 2: Criar uma área de conteúdo principal que será rolável.
          - flex-1: Faz esta área ocupar todo o espaço vertical disponível.
          - overflow-y-auto: Adiciona uma barra de rolagem vertical APENAS se o conteúdo for maior que a área.
        */}
        <div className="flex-1 overflow-y-auto pr-4"> {/* pr-4 para dar espaço para a barra de rolagem */}
          {loading ? (
            <p>Carregando detalhes...</p>
          ) : (
            <div className="space-y-6">
              {/* Histórico de Movimentações */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Histórico de Movimentações</h4>
                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                  {history.length > 0 ? (
                    history.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p> {/* Ajustado para tx.type */}
                          <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        </div>
                        <p className={`font-semibold ${tx.type === 'aporte' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'aporte' ? '+' : '-'} R$ {(tx.value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhuma movimentação encontrada.</p>
                  )}
                </div>
              </div>

              {/* Projeção de Crescimento */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Projeção de Crescimento</h4>
                <div className="border rounded-lg p-3 text-center h-80">
                  {projectionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={projectionData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid stroke="hsl(var(--border))" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, "Valor Projetado"]} />
                        <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Projeção de crescimento não disponível para este ativo.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Ações (botão de venda) */}
              <div>
                <h4 className="font-semibold mb-2 text-lg">Ações</h4>
                <div className="border rounded-lg p-3">
                  <Button onClick={() => setIsSellModalOpen(true)}>Vender/Resgatar</Button>
                  
                  {/* O seu modal aninhado para a venda continua aqui, sem alterações... */}
                  <Dialog open={isSellModalOpen} onOpenChange={setIsSellModalOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Vender/Resgatar {investment?.name}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSellSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="sell-value">Valor do Resgate (R$)</Label>
                          <Input
                            id="sell-value"
                            type="number"
                            step="0.01"
                            placeholder="Ex: 1000.00"
                            value={sellFormData.value}
                            onChange={(e) => setSellFormData(prev => ({ ...prev, value: e.target.value }))}
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Valor atual disponível: R$ {(investment?.current_value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="sell-observations">Observações (Opcional)</Label>
                          <Input
                            id="sell-observations"
                            placeholder="Ex: Resgate parcial para viagem"
                            value={sellFormData.observations}
                            onChange={(e) => setSellFormData(prev => ({ ...prev, observations: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsSellModalOpen(false)}>Cancelar</Button>
                          <Button type="submit">Confirmar Resgate</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </div>

        {/*           PASSO 3: Mover o botão "Fechar" para fora da área de rolagem.
          - Ele agora é um irmão do DialogHeader e da div de conteúdo, não um filho.
          - flex-shrink-0 garante que ele não será espremido.
        */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
    

export default InvestmentDetailModal;