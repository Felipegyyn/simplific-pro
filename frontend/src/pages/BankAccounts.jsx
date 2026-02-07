import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea'; // <--- IMPORT NOVO
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Landmark, Plus, Trash2, Wallet, Filter, Edit } from 'lucide-react'; // <--- IMPORT Edit
import apiService from '../services/api';

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
  
  // --- ESTADO PARA CONTROLE DE EDIÇÃO ---
  const [editingId, setEditingId] = useState(null); 

  const [selectedBanks, setSelectedBanks] = useState([]); 

  const [formData, setFormData] = useState({
    banco: '',
    agencia: '',
    conta: '',
    saldo_inicial: '',
    observacoes: '' // <--- NOVO CAMPO
  });

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

  // --- FUNÇÃO PARA ABRIR O MODAL EM MODO DE EDIÇÃO ---
  const handleEdit = (conta) => {
      setEditingId(conta.id);
      setFormData({
          banco: conta.bank_name,
          agencia: conta.agency || '',
          conta: conta.account_number,
          saldo_inicial: conta.balance, // Apenas para exibição, não editaremos o saldo no update para manter consistência
          observacoes: conta.observations || ''
      });
      setIsModalOpen(true);
  };

  const handleOpenModal = () => {
      setEditingId(null); // Reseta para modo criação
      setFormData({ banco: '', agencia: '', conta: '', saldo_inicial: '', observacoes: '' });
      setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        bank_name: formData.banco,
        agency: formData.agencia,
        account_number: formData.conta,
        observations: formData.observacoes
      };

      if (editingId) {
          // --- MODO EDIÇÃO (PUT) ---
          await apiService.put(`/api/bank-accounts/${editingId}`, payload);
          alert('Conta atualizada com sucesso!');
      } else {
          // --- MODO CRIAÇÃO (POST) ---
          // Apenas na criação enviamos o saldo inicial
          payload.balance = parseFloat(formData.saldo_inicial || 0);
          await apiService.post('/api/bank-accounts', payload);
          alert('Conta adicionada com sucesso!');
      }

      await loadAccounts();
      setIsModalOpen(false);
      setFormData({ banco: '', agencia: '', conta: '', saldo_inicial: '', observacoes: '' });
      setEditingId(null);

    } catch (error) {
      console.error(error);
      alert('Erro ao salvar conta.');
    } finally {
      setLoading(false);
    }
  };

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

  const availableBanks = useMemo(() => {
      const banks = contas.map(c => c.bank_name);
      return [...new Set(banks)];
  }, [contas]);

  const filteredAccounts = useMemo(() => {
      if (selectedBanks.length === 0) return contas;
      return contas.filter(conta => selectedBanks.includes(conta.bank_name));
  }, [contas, selectedBanks]);

  const toggleBankFilter = (bankName) => {
      setSelectedBanks(prev => 
          prev.includes(bankName) 
              ? prev.filter(b => b !== bankName) 
              : [...prev, bankName]
      );
  };

  const saldoTotal = filteredAccounts.reduce((acc, conta) => acc + (Number(conta.balance) || 0), 0);

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

          <div className="flex items-center gap-3">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="border-dashed">
                        <Filter className="h-4 w-4 mr-2" />
                        Filtrar Bancos
                        {selectedBanks.length > 0 && (
                            <span className="ml-2 rounded bg-blue-100 text-blue-700 px-1.5 py-0.5 text-xs font-bold">
                                {selectedBanks.length}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-3" align="end">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-500 mb-2">Selecione os bancos:</h4>
                        {availableBanks.length === 0 ? (
                            <p className="text-xs text-gray-400">Nenhum banco cadastrado.</p>
                        ) : (
                            availableBanks.map(bank => (
                                <div key={bank} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`filter-${bank}`} 
                                        checked={selectedBanks.includes(bank)}
                                        onCheckedChange={() => toggleBankFilter(bank)}
                                    />
                                    <label htmlFor={`filter-${bank}`} className="text-sm cursor-pointer">
                                        {bank}
                                    </label>
                                </div>
                            ))
                        )}
                        {selectedBanks.length > 0 && (
                            <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-8" onClick={() => setSelectedBanks([])}>
                                Limpar Filtros
                            </Button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleOpenModal}>
                    <Plus className="h-4 w-4 mr-2" /> Nova Conta
                </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingId ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle>
                    <DialogDescription>
                        {editingId ? 'Atualize os dados da sua conta.' : 'Preencha os dados da sua conta para controle de saldo.'}
                    </DialogDescription>
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
                    <Input 
                        id="saldo" 
                        type="number" 
                        step="0.01" 
                        placeholder="0,00" 
                        value={formData.saldo_inicial} 
                        onChange={(e) => handleInputChange('saldo_inicial', e.target.value)}
                        disabled={!!editingId} // Desabilita edição de saldo no modo Editar
                        title={editingId ? "O saldo deve ser ajustado via transações" : ""}
                    />
                    <p className="text-xs text-gray-500">
                        {editingId ? "O saldo só pode ser alterado via lançamentos." : "Se não houver saldo, deixe em branco ou 0."}
                    </p>
                    </div>

                    {/* ▼▼▼ CAMPO OBSERVAÇÕES ▼▼▼ */}
                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações (Opcional)</Label>
                        <Textarea 
                            id="observacoes" 
                            placeholder="Ex: Conta usada apenas para investimentos..." 
                            value={formData.observacoes} 
                            onChange={(e) => handleInputChange('observacoes', e.target.value)}
                        />
                    </div>
                    {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

                    <div className="pt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : (editingId ? 'Atualizar' : 'Salvar Conta')}</Button>
                    </div>
                </form>
                </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-900 to-slate-900 border-none text-white shadow-xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-blue-200 font-medium mb-1">Saldo Geral {selectedBanks.length > 0 ? '(Filtrado)' : ''}</p>
                <h2 className="text-4xl font-bold">
                  {saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </h2>
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {loading && !isModalOpen && contas.length === 0 ? (
            <div className="text-center py-12"><p>Carregando contas...</p></div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            <p className="text-gray-500">
                {contas.length === 0 ? "Nenhuma conta bancária cadastrada." : "Nenhuma conta encontrada com o filtro atual."}
            </p>
            {contas.length === 0 && (
                <Button variant="link" onClick={handleOpenModal}>Cadastrar a primeira</Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((conta) => (
              <Card key={conta.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500 relative group flex flex-col justify-between">
                <div>
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
                        {conta.observations && (
                            <p className="mt-2 text-xs italic text-gray-400 border-t pt-2">"{conta.observations}"</p>
                        )}
                    </div>
                    </CardContent>
                </div>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Saldo Atual</p>
                      <p className={`text-2xl font-bold ${conta.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(conta.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* ▼▼▼ BOTÃO DE EDITAR ▼▼▼ */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-blue-500"
                            onClick={() => handleEdit(conta)}
                        >
                        <Edit className="h-4 w-4" />
                        </Button>
                        {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleDelete(conta.id)}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
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