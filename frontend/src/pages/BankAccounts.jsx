import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Landmark, Plus, Trash2, Wallet } from 'lucide-react';
import apiService from '../services/api'; // <--- USANDO API REAL AGORA

const BANCOS_BRASIL = [
  { code: '260', name: 'Nubank' },
  { code: '341', name: 'Itaú' },
  { code: '237', name: 'Bradesco' },
  { code: '001', name: 'Banco do Brasil' },
  { code: '033', name: 'Santander' },
  { code: '104', name: 'Caixa Econômica' },
  { code: '077', name: 'Inter' },
  { code: '336', name: 'C6 Bank' },
  { code: '290', name: 'PagBank' },
  { code: '212', name: 'Banco Original' },
  { code: '655', name: 'Neon' },
  { code: '000', name: 'Outro / Carteira Física' }
];

const BankAccounts = ({ user, onLogout }) => {
  const [contas, setContas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    banco: '',
    agencia: '',
    conta: '',
    saldo_inicial: ''
  });

  // 1. Carregar contas do Backend
  const loadAccounts = async () => {
    try {
        const data = await apiService.get('/api/bank-accounts');
        setContas(data || []);
    } catch (error) {
        console.error("Erro ao carregar contas:", error);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 2. Salvar no Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Monta o payload para a API
      const payload = {
        bank_name: formData.banco,
        agency: formData.agencia,
        account_number: formData.conta,
        balance: parseFloat(formData.saldo_inicial || 0)
      };

      await apiService.post('/api/bank-accounts', payload);

      await loadAccounts(); // Recarrega a lista
      setFormData({ banco: '', agencia: '', conta: '', saldo_inicial: '' });
      setIsModalOpen(false);
      alert('Conta adicionada com sucesso!');

    } catch (error) {
      console.error(error);
      alert('Erro ao salvar conta.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Excluir no Backend
  const handleDelete = async (id) => {
      if (!confirm("Tem certeza que deseja excluir esta conta?")) return;
      
      try {
          await apiService.delete(`/api/bank-accounts/${id}`);
          await loadAccounts();
      } catch (error) {
          console.error(error);
          alert("Erro ao excluir conta.");
      }
  };

  const saldoTotal = contas.reduce((acc, conta) => acc + (Number(conta.balance) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8">
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Landmark className="h-8 w-8 text-blue-600" />
              Contas Bancárias
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seus saldos e contas correntes.</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Nova Conta
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Conta Bancária</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Instituição Financeira</Label>
                  <Select 
                    value={formData.banco} 
                    onValueChange={(val) => handleInputChange('banco', val)}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Selecione o banco" /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                      {BANCOS_BRASIL.map((banco) => (
                        <SelectItem key={banco.code} value={banco.name}>{banco.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agencia">Agência</Label>
                    <Input id="agencia" placeholder="0000" value={formData.agencia} onChange={(e) => handleInputChange('agencia', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conta">Conta Corrente</Label>
                    <Input id="conta" placeholder="12345-6" value={formData.conta} onChange={(e) => handleInputChange('conta', e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saldo">Saldo Inicial (R$)</Label>
                  <Input id="saldo" type="number" step="0.01" placeholder="0,00" value={formData.saldo_inicial} onChange={(e) => handleInputChange('saldo_inicial', e.target.value)} />
                  <p className="text-xs text-gray-500">Se não houver saldo, deixe em branco ou 0.</p>
                </div>
                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Conta'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Card de Resumo Total */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-900 to-slate-900 border-none text-white shadow-xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-blue-200 font-medium mb-1">Saldo Geral Acumulado</p>
                <h2 className="text-4xl font-bold">
                  R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Contas */}
        {contas.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            <p className="text-gray-500">Nenhuma conta bancária cadastrada.</p>
            <Button variant="link" onClick={() => setIsModalOpen(true)}>Cadastrar a primeira</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contas.map((conta) => (
              <Card key={conta.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 relative group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">
                    {conta.bank_name}
                  </CardTitle>
                  <Landmark className="h-5 w-5 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <p>Ag: {conta.agency || '---'}</p>
                    <p>CC: {conta.account_number}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Saldo Atual</p>
                      <p className={`text-2xl font-bold ${conta.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        R$ {(Number(conta.balance) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(conta.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccounts;