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
      
      {/* 1. HEADER EXECUTIVO */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Contas Bancárias</h1>
          <p className={styles.pageSubtitle}>Gestão de saldos correntes e conciliação por instituição bancária.</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button className={styles.btnOutline}>
                <Filter size={13} />
                Filtrar Bancos
                {selectedBanks.length > 0 && (
                  <Badge className="ml-1.5 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-none h-4 px-1 text-[10px]">
                    {selectedBanks.length}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="bg-popover border-border w-56 p-3 shadow-lg" align="end">
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Instituições</h4>
                {availableBanks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum banco cadastrado.</p>
                ) : (
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                    {availableBanks.map(bank => (
                      <div key={bank} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded cursor-pointer" onClick={() => toggleBankFilter(bank)}>
                        <Checkbox 
                          id={`filter-${bank}`} 
                          checked={selectedBanks.includes(bank)}
                          onCheckedChange={() => toggleBankFilter(bank)}
                        />
                        <label htmlFor={`filter-${bank}`} className="text-xs text-foreground cursor-pointer flex-1">
                          {bank}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
                {selectedBanks.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-xs h-7 text-rose-500" onClick={() => setSelectedBanks([])}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <button className={styles.btnPrimaryDark} onClick={handleOpenModal}>
                <Plus size={14} /> Nova Conta
              </button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Editar Conta' : 'Nova Conta Bancária'}</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Atualize os dados da sua conta.' : 'Preencha os dados da sua conta para controle de saldo.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 py-6">
                  <div className="space-y-2">
                  <Label htmlFor="banco" className="text-slate-600 dark:text-slate-300">Instituição Financeira</Label>
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
                      <Label htmlFor="agencia" className="text-slate-600 dark:text-slate-300">Agência</Label>
                      <Input id="agencia" placeholder="0000" value={formData.agencia} onChange={(e) => handleInputChange('agencia', e.target.value)} className="bg-white/5 border-white/10 focus:border-cyan-500/50" />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="conta" className="text-slate-600 dark:text-slate-300">Conta Corrente</Label>
                      <Input id="conta" placeholder="12345-6" value={formData.conta} onChange={(e) => handleInputChange('conta', e.target.value)} className="bg-white/5 border-white/10 focus:border-cyan-500/50" required />
                  </div>
                  </div>
                  
                  <div className="space-y-2">
                  <Label htmlFor="saldo" className="text-slate-600 dark:text-slate-300">Saldo Inicial (R$)</Label>
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
                      <Label htmlFor="observacoes" className="text-slate-600 dark:text-slate-300">Observações (Opcional)</Label>
                      <Textarea 
                          id="observacoes" 
                          placeholder="Ex: Conta usada apenas para investimentos..." 
                          value={formData.observacoes} 
                          onChange={(e) => handleInputChange('observacoes', e.target.value)}
                          className="bg-white/5 border-white/10 focus:border-cyan-500/50 min-h-[80px]"
                      />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" className="text-slate-500 dark:text-slate-400 hover:text-white hover:bg-white/5" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-white min-w-[120px]">
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : (editingId ? 'Atualizar' : 'Salvar Conta')}
                  </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </header>

      {/* 2. KPI STRIP (Taste Skill §5: One container split by 1px hairlines) */}
      <section className={styles.summaryStrip}>
        <div className={styles.kpiCard}>
          <p className={styles.summaryLabel}>
            Saldo Consolidado em Contas
            <Wallet size={14} className="text-muted-foreground" />
          </p>
          <p className={cn(styles.summaryValue, saldoTotal < 0 && 'text-rose-600 dark:text-rose-400')}>
            R$ {saldoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className={styles.kpiCard}>
          <p className={styles.summaryLabel}>
            Instituições Filtradas
            <Landmark size={14} className="text-muted-foreground" />
          </p>
          <p className={styles.summaryValue}>
            {filteredAccounts.length} de {contas.length} contas
          </p>
        </div>
      </section>

      {/* 3. ACCOUNTS GRID */}
      {loading && !isModalOpen && contas.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-500"></div>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className={styles.emptyState}>
          <Landmark size={24} className="text-muted-foreground opacity-30 mb-2" />
          <p className="text-sm text-muted-foreground">
            {contas.length === 0 ? 'Nenhuma conta bancária cadastrada.' : 'Nenhuma conta encontrada com o filtro atual.'}
          </p>
          {contas.length === 0 && (
            <button className={cn(styles.btnOutline, 'mt-3')} onClick={handleOpenModal}>
              Cadastrar primeira conta
            </button>
          )}
        </div>
      ) : (
        <div className={styles.accountsGrid}>
          {filteredAccounts.map((conta) => (
            <div key={conta.id} className={styles.premiumCard}>
              <div className={styles.cardTop}>
                <div className={styles.bankBrand}>
                  <div className={styles.bankLogoBox}>
                    <Landmark size={16} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className={styles.bankName}>{conta.bank_name}</h3>
                    <span className={styles.accountDigits}>
                      Ag: {conta.agency || '---'} • CC: {conta.account_number}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    className={styles.btnIcon} 
                    title="Editar conta"
                    onClick={() => handleEdit(conta)}
                  >
                    <Edit size={13} />
                  </button>
                  <button 
                    className={styles.btnIcon} 
                    title="Excluir conta"
                    onClick={() => handleDelete(conta.id)}
                  >
                    <Trash2 size={13} className="text-rose-500" />
                  </button>
                </div>
              </div>

              {conta.observations && (
                <p className="text-xs text-muted-foreground italic line-clamp-2 m-0">
                  "{conta.observations}"
                </p>
              )}

              <div className={styles.balanceBlock}>
                <span className={styles.balanceLabel}>Saldo Atual</span>
                <span className={cn(styles.balanceValue, conta.balance < 0 && 'text-rose-600 dark:text-rose-400')}>
                  R$ {Number(conta.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BankAccounts;