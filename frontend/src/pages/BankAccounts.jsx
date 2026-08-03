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
import { cn } from "@/lib/utils";
import apiService from '../services/api';
import styles from './BankAccounts.module.css';

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
  { code: '756', name: 'Sicoob' },
  { code: '748', name: 'Sicredi' },
  { code: '380', name: 'PicPay' },
  { code: '208', name: 'BTG Pactual' },
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
    <div className={styles.pageContainer}>
      
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle + " flex items-center gap-3"}>
            Contas Bancárias
          </h1>
          <p className={styles.pageSubtitle}>Gerencie seus saldos e contas correntes.</p>
        </div>

        <div className="flex items-center gap-3">
          <Popover>
              <PopoverTrigger asChild>
                  <Button variant="outline" className="glass-panel border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300">
                      <Filter className="h-4 w-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                      Filtrar Bancos
                      {selectedBanks.length > 0 && (
                          <Badge className="ml-2 bg-cyan-600 dark:bg-cyan-500 text-white border-none h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                              {selectedBanks.length}
                          </Badge>
                      )}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 w-56 p-4 shadow-2xl" align="end">
                  <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Instituições</h4>
                      {availableBanks.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Nenhum banco cadastrado.</p>
                      ) : (
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-none">
                            {availableBanks.map(bank => (
                                <div key={bank} className="flex items-center space-x-3 group cursor-pointer" onClick={() => toggleBankFilter(bank)}>
                                    <Checkbox 
                                        id={`filter-${bank}`} 
                                        checked={selectedBanks.includes(bank)}
                                        onCheckedChange={() => toggleBankFilter(bank)}
                                        className="border-slate-300 dark:border-white/20 data-[state=checked]:bg-cyan-600 dark:data-[state=checked]:bg-cyan-500"
                                    />
                                    <label htmlFor={`filter-${bank}`} className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors cursor-pointer">
                                        {bank}
                                    </label>
                                </div>
                            ))}
                          </div>
                      )}
                      {selectedBanks.length > 0 && (
                          <Button variant="ghost" size="sm" className="w-full mt-2 text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-500/10 h-8" onClick={() => setSelectedBanks([])}>
                              Limpar Filtros
                          </Button>
                      )}
                  </div>
              </PopoverContent>
          </Popover>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-900/20" onClick={handleOpenModal}>
                    <Plus className="h-4 w-4 mr-2" /> Nova Conta
                </Button>
              </DialogTrigger>
              
              <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle>{editingId ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle>
                  <DialogDescription className="text-slate-400">
                      {editingId ? 'Atualize os dados da sua conta.' : 'Preencha os dados da sua conta para controle de saldo.'}
                  </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-6">
                  <div className="space-y-2">
                  <Label htmlFor="banco" className="text-slate-300">Instituição Financeira</Label>
                  <Select 
                      value={formData.banco} 
                      onValueChange={(val) => handleInputChange('banco', val)}
                      required
                  >
                      <SelectTrigger className="bg-white/5 border-white/10 focus:border-cyan-500/50"><SelectValue placeholder="Selecione o banco" /></SelectTrigger>
                      <SelectContent className="glass-panel border-white/10 max-h-[200px]">
                      {BANCOS_BRASIL.map((banco) => (
                          <SelectItem key={banco.code} value={banco.name}>{banco.name}</SelectItem>
                      ))}
                      </SelectContent>
                  </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="agencia" className="text-slate-300">Agência</Label>
                      <Input id="agencia" placeholder="0000" value={formData.agencia} onChange={(e) => handleInputChange('agencia', e.target.value)} className="bg-white/5 border-white/10 focus:border-cyan-500/50" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="conta" className="text-slate-300">Conta Corrente</Label>
                      <Input id="conta" placeholder="12345-6" value={formData.conta} onChange={(e) => handleInputChange('conta', e.target.value)} className="bg-white/5 border-white/10 focus:border-cyan-500/50" required />
                  </div>
                  </div>
                  
                  <div className="space-y-2">
                  <Label htmlFor="saldo" className="text-slate-300">Saldo Inicial (R$)</Label>
                  <Input 
                      id="saldo" 
                      type="number" 
                      step="0.01" 
                      placeholder="0,00" 
                      value={formData.saldo_inicial} 
                      onChange={(e) => handleInputChange('saldo_inicial', e.target.value)}
                      disabled={!!editingId}
                      className="bg-white/5 border-white/10 focus:border-cyan-500/50 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-slate-500 italic">
                      {editingId ? "O saldo só pode ser alterado via lançamentos." : "Se não houver saldo, deixe em branco ou 0."}
                  </p>
                  </div>

                  <div className="space-y-2">
                      <Label htmlFor="observacoes" className="text-slate-300">Observações (Opcional)</Label>
                      <Textarea 
                          id="observacoes" 
                          placeholder="Ex: Conta usada apenas para investimentos..." 
                          value={formData.observacoes} 
                          onChange={(e) => handleInputChange('observacoes', e.target.value)}
                          className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[80px]"
                      />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[120px]">
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : (editingId ? 'Atualizar' : 'Salvar Conta')}
                  </Button>
                  </div>
              </form>
              </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-8">
      <div className="mb-8">
        <div className={styles.premiumCard + " p-8 relative overflow-hidden group border-none bg-gradient-to-br from-cyan-600/10 to-blue-600/10 dark:from-cyan-900/20 dark:to-blue-900/20"}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/10 dark:bg-cyan-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-cyan-600/20 dark:group-hover:bg-cyan-500/20 transition-all duration-700"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Saldo Geral {selectedBanks.length > 0 ? '(Filtrado)' : ''}</p>
              <h2 className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                {saldoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h2>
            </div>
            <div className="h-16 w-16 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl">
              <Wallet className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>
      </div>

      {loading && !isModalOpen && contas.length === 0 ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-600 dark:border-cyan-400"></div></div>
      ) : filteredAccounts.length === 0 ? (
        <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-300 dark:border-white/10">
          <Landmark className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-6 dark:opacity-20" />
          <p className="text-slate-500 italic mb-6">
              {contas.length === 0 ? "Nenhuma conta bancária cadastrada." : "Nenhuma conta encontrada com o filtro atual."}
          </p>
          {contas.length === 0 && (
              <Button variant="outline" className="border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-cyan-600 dark:text-cyan-400 font-bold" onClick={handleOpenModal}>Cadastrar a primeira</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAccounts.map((conta) => (
            <div key={conta.id} className={`${styles.premiumCard} group flex flex-col justify-between p-6 relative overflow-hidden`}>
              
              <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 shadow-inner">
                         <Landmark className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all transform md:translate-y-1 group-hover:translate-y-0">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                            onClick={() => handleEdit(conta)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10"
                            onClick={() => handleDelete(conta.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {conta.bank_name}
                  </h3>

                  <div className="space-y-2 mb-8">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Agência</span>
                        <span className="text-slate-700 dark:text-slate-300">{conta.agency || '---'}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Conta</span>
                        <span className="text-slate-700 dark:text-slate-300">{conta.account_number}</span>
                    </div>
                    {conta.observations && (
                        <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                            <p className="text-[10px] italic text-slate-500 leading-relaxed">"{conta.observations}"</p>
                        </div>
                    )}
                  </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Saldo Atual</p>
                <p className={cn("text-2xl font-black tracking-tight", conta.balance >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                  {Number(conta.balance).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankAccounts;