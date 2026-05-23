import apiService from '../services/api';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConnectBankButton from '@/components/ConnectBankButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, DollarSign, AlertTriangle, Plus, Edit, Trash2, 
  Calendar, TrendingUp, LogOut, ArrowLeft, Eye,
  Search, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import logo from '../assets/LOGO.png';

const CreditCards = ({ user, onLogout }) => {
  const navigate = useNavigate();

  // ▼▼▼ ADICIONE ESTA FUNÇÃO AQUI ▼▼▼
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Data inválida';
    // Pega a parte da data antes do 'T' (ex: "2025-08-29")
    const datePart = dateString.split('T')[0];
    // Adiciona um horário para evitar que o JS interprete como UTC
    const localDate = new Date(`${datePart}T12:00:00`);
    // Formata para o padrão local (ex: "29/08/2025")
    return localDate.toLocaleDateString('pt-BR');
  };
  // ▲▲▲ FIM DA FUNÇÃO ▲▲▲
  
  // Estados para cartões e modal
  const [cartoes, setCartoes] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false);
  const [isFaturaModalOpen, setIsFaturaModalOpen] = useState(false);
  const [isPeriodoModalOpen, setIsPeriodoModalOpen] = useState(false);
  const [selectedCartao, setSelectedCartao] = useState(null);
  const [selectedFatura, setSelectedFatura] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    banco: '', // <--- ADICIONE ESTA LINHA
    name: '',
    card_number: '',
    limit_amount: '',
    brand: '',
    due_date: ''
  });
  const [gastoFormData, setGastoFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'a_vista', // <-- ADICIONE ESTA LINHA
    installments: 1              // <-- ADICIONE ESTA LINHA
  });

  const [filtroStatusFatura, setFiltroStatusFatura] = useState('aberta'); // 'aberta', 'paga', ou 'todas'

  // ▼▼▼ ADICIONE ESTES NOVOS ESTADOS ▼▼▼
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');
  // ▲▲▲ FIM DOS NOVOS ESTADOS ▲▲▲

  // ▼▼▼ NOVOS ESTADOS PARA LAYOUT ▼▼▼
  const [selectedCardFilter, setSelectedCardFilter] = useState('all');
  const [expandedCardId, setExpandedCardId] = useState(null);
  // ▲▲▲ FIM DOS NOVOS ESTADOS ▲▲▲

  const filteredCartoes = selectedCardFilter === 'all' 
    ? (Array.isArray(cartoes) ? cartoes : [])
    : (Array.isArray(cartoes) ? cartoes.filter(c => c.id.toString() === selectedCardFilter) : []);

  const getFaturasDoCartao = (cartaoId) => {
    return faturas
      .filter(f => f.cartao_id === cartaoId)
      .sort((a, b) => {
        const dateA = new Date(a.mes_ref);
        const dateB = new Date(b.mes_ref);
        return dateA - dateB;
      });
  };



const loadCartoes = async () => {
  try {
    setLoading(true);
    const rawCartoes = await apiService.get('/api/credit-cards');
    console.log('Resposta da API:', rawCartoes);

  const cartoesFormatados = Array.isArray(rawCartoes) ? rawCartoes.map((cartao) => ({
  id: cartao.id,
  nome: cartao.name,
  numero: '**** **** **** ' + (cartao.last_digits || '0000'),
  bandeira: cartao.brand,
  limite: cartao.limit,
  usado: cartao.limit - cartao.available_limit, // Cálculo correto
  disponivel: Number(cartao.available_limit) || 0,
  vencimento: new Date(new Date().getFullYear(), new Date().getMonth() + 1, cartao.due_day).toISOString(),
  due_day: cartao.due_day, // <-- ADICIONE ESTA LINHA
  status: 'ativo'
})) : [];


    await carregarFaturas(cartoesFormatados);
    setCartoes(cartoesFormatados);
  } catch (error) {
    console.error('Erro ao carregar cartões:', error);
    setCartoes([]);
  } finally {
    setLoading(false);
  }
};
  // Função para criar novo cartão
const criarCartao = async (dadosCartao) => {
  try {
    const response = await apiService.post('/api/credit-cards', dadosCartao);
    if (response.status === 201 && response.data) {
  await loadCartoes();
  setIsModalOpen(false);
  setFormData({
    name: '',
    card_number: '',
    limit_amount: '',
    brand: '',
    due_date: ''
  });
  alert('Cartão cadastrado com sucesso!');
}

  } catch (error) {
    console.error('Erro ao criar cartão:', error);
    alert('Erro ao criar cartão. Tente novamente.');
  }
};

  const abrirModalGasto = (cartao) => {
  setSelectedCartao(cartao); // Salva o cartão selecionado
  setIsGastoModalOpen(true); // Abre o modal de gasto
};


  // Função para lançar gasto no cartão
const lancarGastoCartao = async (cartaoId, dadosGasto) => {
try {

const response = await apiService.post(`/api/credit-cards/${cartaoId}/transactions`, dadosGasto);

// Se a API retorna direto o objeto da transação, então isso já é sucesso
if (response && response.category_id && response.value) {
  return true;
}

console.warn("Resposta inesperada:", response);
return false;


    console.warn("Resposta inesperada:", response);
    return false;
  } 
    catch (error) {
    console.error('Erro ao lançar gasto no cartão:', error);
    alert('Erro ao lançar gasto. Verifique o Limite');
    return false;
  }
};

// Função para pagar fatura
  const pagarFatura = async (fatura) => {
    // 1. Confirmação do usuário
    if (!confirm(`Deseja realmente confirmar a fatura a fatura de R$ ${fatura.valor_total.toFixed(2)}? Uma transação será criada no módulo "Lançamentos"`)) {
      return; // Cancela a operação se o usuário clicar em "Cancelar"
    }

    try {
      // 2. Criar a transação de despesa (APENAS UMA VEZ)
      console.log('Criando transação de pagamento...');
      await apiService.post('/api/transactions', {
        description: `Pagamento da fatura - ${fatura.cartao_nome} final ${fatura.last_digits}`,
        type: 'saida',
        category_id: 5, // Use um ID de categoria que exista, como "Pagamento de Fatura"
        value: fatura.valor_total,
        status: 'pendente', // A transação é gerada como "Pendente em transactions"
        date: new Date().toISOString().split('T')[0]
      });
      console.log('Transação de pagamento criada com sucesso.');

      // 3. Chamar o endpoint para atualizar o status da fatura no backend
      console.log(`Atualizando status da fatura para o cartão ID: ${fatura.cartao_id}`);
      // ATENÇÃO: Verifique se a rota no seu backend é realmente '/credit-cards/${fatura.cartao_id}/pay-bill'
      // Se for diferente, ajuste a linha abaixo.
      await apiService.put(`/api/credit-cards/${fatura.cartao_id}/pay-bill`);
      console.log('Status da fatura atualizado com sucesso.');

      // 4. Recarregar os dados para refletir as mudanças na tela
      await loadCartoes(); // loadCartoes já chama carregarFaturas

      alert('✅ Fatura paga e lançamento registrado com sucesso!');

    } catch (error) {
      console.error('Erro no processo de pagamento da fatura:', error.response ? error.response.data : error.message);
      alert('❌ Ocorreu um erro ao pagar a fatura. Verifique o console para mais detalhes.');
    }
  };

  const excluirFatura = async (fatura) => {
    const isPaga = fatura.status === 'paga';
    const msg = isPaga 
      ? "Essa fatura está paga, deseja realmente excluir? (Isso não reverterá o saldo da sua conta bancária)"
      : "Tem certeza que deseja excluir esta fatura? O limite utilizado será reestabelecido no cartão.";

    if (window.confirm(msg)) {
      try {
        await apiService.delete(`/api/faturas/${fatura.id}`);
        loadCartoes(); // Recarrega cartões e faturas
        alert('✅ Fatura excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir fatura:', error);
        alert('❌ Erro ao excluir fatura.');
      }
    }
  };

  // Função para visualizar fatura completa
  const visualizarFatura = (fatura) => {
    setSelectedFatura(fatura);
    setIsFaturaModalOpen(true);
  };


  const excluirTransacao = async (transacaoId) => {
    if (!confirm('Tem certeza? Isso restaurará o limite do cartão e reduzirá o valor da fatura.')) return;

    try {
      await apiService.delete(`/api/credit-cards/transactions/${transacaoId}`);
      alert('✅ Transação excluída com sucesso!');
      
      // Fecha o modal da fatura para evitar dados desatualizados
      setIsFaturaModalOpen(false);
      
      // Recarrega tudo para atualizar os valores na tela principal
      await loadCartoes();
      
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert('Erro ao excluir. Tente novamente.');
    }
  };

// ...

  // Função para excluir cartão
const excluirCartao = async (cardId) => {
  if (!confirm('Tem certeza que deseja excluir este cartão?')) return;

  try {
  await apiService.delete(`/api/credit-cards/${cardId}`);
  alert('Cartão excluído!');
  loadCartoes(); // ou recarregar os cartões
} catch (error) {
  alert(error.message); // mostra a mensagem real
}
};

const abrirModalEdicao = (cartao) => {
  setEditingCard(cartao);
  setIsEditModalOpen(true);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.card_number || !formData.limit_amount || !formData.brand) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  try {

    await criarCartao({
      // Se o usuário selecionou o banco, salva como "Nubank - Meu Roxinho". Se não, salva só o nome.
      name: formData.banco ? `${formData.banco} - ${formData.name}` : formData.name, 
      brand: formData.brand,
      limit: parseFloat(formData.limit_amount),
      due_day: parseInt(formData.due_date),
      card_number: formData.card_number
    });

    // Exibir alerta
    alert('Cartão cadastrado com sucesso!');

    // Fechar modal
    setIsModalOpen(false);

    // Resetar formulário
    setFormData({
      name: '',
      card_number: '',
      limit_amount: '',
      brand: '',
      due_date: ''
    });

    // Recarregar cartões
    await loadCartoes();

  } catch (error) {
    console.error('Erro ao criar cartão:', error);
    alert('Erro ao criar cartão. Tente novamente.');
  }
};

  // Função para lidar com mudanças no formulário
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field, value) => {
    setEditingCard(prev => ({
      ...prev,
      [field]: value
    }));
  };

const handleUpdateCard = async (e) => {
  e.preventDefault();
  if (!editingCard) return;

  try {
    // 1. Prepara o payload com os dados do formulário
    const payload = {
      nome: editingCard.nome,
      limite: parseFloat(editingCard.limite),
      bandeira: editingCard.bandeira,
      due_day: parseInt(editingCard.due_day)
    };
    
    // 2. Chama a API com o método PUT para o endpoint que criamos
    await apiService.put(`/api/credit-cards/${editingCard.id}`, payload);

    // 3. Se a chamada for bem-sucedida, continua o fluxo
    alert('✅ Cartão atualizado com sucesso!');
    setIsEditModalOpen(false); // Fecha o modal
    await loadCartoes(); // Recarrega a lista para mostrar os dados atualizados

  } catch (error) {
    console.error('Erro ao atualizar cartão:', error);
    // Tenta extrair uma mensagem de erro mais específica da resposta da API
    const errorMessage = error.response?.data?.error || 'Erro ao atualizar o cartão. Tente novamente.';
    alert(`❌ ${errorMessage}`);
  }
};

 // Carregar cartões e faturas quando os filtros mudarem
  useEffect(() => {
    loadCartoes();
  }, [filtroStatusFatura, dataInicioFiltro, dataFimFiltro]); // <--- Adicione as datas aqui


const carregarFaturas = async (listaDeCartoes) => { 
    try {
      // Constrói a URL da API dinamicamente com base no filtro selecionado
      let url = '/api/faturas';
      const queryParams = [];

      if (filtroStatusFatura !== 'todas') {
        queryParams.push(`status=${filtroStatusFatura}`);
      }
      
      // ▼▼▼ CÓDIGO DE QUERY PARAMS CORRIGIDO ▼▼▼
      if (dataInicioFiltro && dataInicioFiltro.trim() !== '') {
        queryParams.push(`start_date=${dataInicioFiltro.split('T')[0]}`);
      }
      if (dataFimFiltro && dataFimFiltro.trim() !== '') {
        queryParams.push(`end_date=${dataFimFiltro.split('T')[0]}`);
      }

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      console.log("Chamando URL:", url); // <--- Adicione isso para você ver no inspecionar elemento
      // ▲▲▲ FIM DO CÓDIGO DE QUERY PARAMS CORRIGIDO ▲▲▲

      const respostaFaturas = await apiService.get(url);
      

    // Usamos Promise.all para buscar as transações de todas as faturas em paralelo, o que é mais rápido.
    const faturasComTransacoes = await Promise.all(
      respostaFaturas.map(async (fatura) => {
        // Para cada fatura, busca apenas as transações que pertencem a ela
        const transacoesDaFatura = await apiService.get(`/api/faturas/${fatura.id}/transactions`);
        
        // Em CreditCards.jsx, dentro de carregarFaturas()

// ...
        // Encontra o cartão correspondente para pegar os dados de nome/número
        const cartao = listaDeCartoes.find(c => c.id === fatura.cartao_id);
        
        return {
          id: fatura.id,
          cartao_id: fatura.cartao_id,
          status: fatura.status,
          cartao_nome: cartao?.nome || 'Cartão',
          last_digits: cartao?.numero?.slice(-4) || '0000',
          // O mês de referência é criado a partir dos dados da fatura
          mes_ref: new Date(fatura.ano, fatura.mes - 1, 1), 
          valor_total: parseFloat(fatura.valor_total),
          valor_minimo: parseFloat(fatura.valor_total) * 0.15,
          // A data de vencimento agora vem PRONTA do backend. Sem cálculos!
          data_vencimento: fatura.data_vencimento, 
          transacoes: transacoesDaFatura
        };
// ...
      })
    );

    setFaturas(faturasComTransacoes);
  } catch (error) {
    console.error('Erro ao carregar faturas:', error);
    setFaturas([]);
  }
};

  // Calcular totais (baseado nos cartões filtrados)
  const limiteTotal = filteredCartoes.reduce((sum, cartao) => sum + cartao.limite, 0);
  const usadoTotal = filteredCartoes.reduce((sum, cartao) => sum + cartao.usado, 0);
  const disponivelTotal = filteredCartoes.reduce((sum, cartao) => sum + cartao.disponivel, 0);

  const getUtilizacaoColor = (percentual) => {
    if (percentual <= 30) return 'text-green-600';
    if (percentual <= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (percentual) => {
    if (percentual <= 30) return 'bg-green-500';
    if (percentual <= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-200">
      {/* Header */}
      <header className="glass-panel rounded-none border-x-0 border-t-0 border-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4 text-slate-400 hover:text-white hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3 brightness-0 invert" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400 hidden sm:block">
                Bem-vindo, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout} className="border-white/10 hover:bg-white/5 text-slate-300">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[100%] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Cartões de Crédito
          </h2>
          <p className="text-slate-400">Gerencie seus cartões e faturas com precisão tecnológica</p>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard className="h-12 w-12 text-cyan-400" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">Limite Total</p>
            <p className="text-2xl font-bold text-white">R$ {limiteTotal.toLocaleString()}</p>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="h-12 w-12 text-rose-400" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">Limite Usado</p>
            <p className="text-2xl font-bold text-white">R$ {usadoTotal.toLocaleString()}</p>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(usadoTotal / limiteTotal) * 100}%` }} />
            </div>
          </div>

          <div className="glass-card p-6 border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp className="h-12 w-12 text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-400 mb-1">Limite Disponível</p>
            <p className="text-2xl font-bold text-white">R$ {disponivelTotal.toLocaleString()}</p>
            <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(disponivelTotal / limiteTotal) * 100}%` }} />
            </div>
          </div>
        </div>

        <Tabs defaultValue="cartoes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-panel p-1 border-white/5">
            <TabsTrigger value="cartoes" className="data-[state=active]:active-gradient">Meus Cartões</TabsTrigger>
            <TabsTrigger value="faturas" className="data-[state=active]:active-gradient">Faturas</TabsTrigger>
          </TabsList>

          {/* Meus Cartões */}
          <TabsContent value="cartoes" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-4 border-white/5">
              <h3 className="text-lg font-semibold text-white">Meus Cartões</h3>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Select value={selectedCardFilter} onValueChange={setSelectedCardFilter}>
                  <SelectTrigger className="w-full sm:w-64 glass-panel border-white/10 text-xs h-9">
                    <SelectValue placeholder="Filtrar por cartão..." />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    <SelectItem value="all">Todos os Cartões</SelectItem>
                    {cartoes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-cyan-600 hover:bg-cyan-700 text-white border-none shadow-lg shadow-cyan-900/20 h-9">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Manual
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-white">Adicionar Novo Cartão</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-300">Nome do Cartão *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ex: Meu Cartão"
                            required
                            className="glass-panel border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="brand" className="text-slate-300">Bandeira *</Label>
                          <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                            <SelectTrigger className="glass-panel border-white/10">
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent className="glass-panel border-white/10">
                              <SelectItem value="Visa">Visa</SelectItem>
                              <SelectItem value="Mastercard">Mastercard</SelectItem>
                              <SelectItem value="Elo">Elo</SelectItem>
                              <SelectItem value="American Express">American Express</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="card_number" className="text-slate-300">Número (Final 4 dígitos) *</Label>
                          <Input
                            id="card_number"
                            value={formData.card_number}
                            onChange={(e) => handleInputChange('card_number', e.target.value)}
                            placeholder="**** **** **** 1234"
                            maxLength="19"
                            required
                            className="glass-panel border-white/10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="limit_amount" className="text-slate-300">Limite (R$) *</Label>
                          <Input
                            id="limit_amount"
                            type="number"
                            step="0.01"
                            value={formData.limit_amount}
                            onChange={(e) => handleInputChange('limit_amount', e.target.value)}
                            placeholder="0,00"
                            required
                            className="glass-panel border-white/10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="due_date" className="text-slate-300">Dia do Vencimento</Label>
                        <Select value={formData.due_date} onValueChange={(value) => handleInputChange('due_date', value)}>
                          <SelectTrigger className="glass-panel border-white/10">
                            <SelectValue placeholder="Selecione o dia..." />
                          </SelectTrigger>
                          <SelectContent className="glass-panel border-white/10 max-h-[250px]">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                Dia {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                          Adicionar Cartão
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-white">Editar Cartão</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateCard} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name" className="text-slate-300">Nome do Cartão *</Label>
                      <Input
                        id="edit-name"
                        value={editingCard?.nome || ''}
                        onChange={(e) => handleEditInputChange('nome', e.target.value)}
                        placeholder="Ex: Meu Cartão"
                        required
                        className="glass-panel border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-brand" className="text-slate-300">Bandeira *</Label>
                      <Select value={editingCard?.bandeira || ''} onValueChange={(value) => handleEditInputChange('bandeira', value)}>
                        <SelectTrigger className="glass-panel border-white/10">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent className="glass-panel border-white/10">
                          <SelectItem value="Visa">Visa</SelectItem>
                          <SelectItem value="Mastercard">Mastercard</SelectItem>
                          <SelectItem value="Elo">Elo</SelectItem>
                          <SelectItem value="American Express">American Express</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-card_number" className="text-slate-300">Número do Cartão *</Label>
                      <Input
                        id="edit-card_number"
                        value={editingCard?.numero || ''}
                        onChange={(e) => handleEditInputChange('numero', e.target.value)}
                        placeholder="**** **** **** 1234"
                        maxLength="19"
                        required
                        readOnly
                        className="glass-panel border-white/10 opacity-50 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-limit_amount" className="text-slate-300">Limite (R$) *</Label>
                      <Input
                        id="edit-limit_amount"
                        type="number"
                        step="0.01"
                        value={editingCard?.limite || ''}
                        onChange={(e) => handleEditInputChange('limite', e.target.value)}
                        placeholder="0,00"
                        required
                        className="glass-panel border-white/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-due_date" className="text-slate-300">Dia do Vencimento</Label>
                    <Select value={editingCard?.due_day?.toString() || ''} onValueChange={(value) => handleEditInputChange('due_day', value)}>
                      <SelectTrigger className="glass-panel border-white/10">
                        <SelectValue placeholder="Selecione o dia..." />
                      </SelectTrigger>
                      <SelectContent className="glass-panel border-white/10 max-h-[250px]">
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            Dia {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      Salvar alterações
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCartoes.length === 0 ? (
                <div className="col-span-2 py-12 glass-card border-dashed flex flex-col items-center justify-center text-slate-500">
                  <CreditCard className="h-12 w-12 mb-4 opacity-20" />
                  <p>Nenhum cartão encontrado.</p>
                </div>
              ) : (
                filteredCartoes.map((cartao) => (
                  <div key={cartao.id} className="flex flex-col">
                    <div className="glass-card p-6 border-white/10 hover:bg-white/5 transition-all group relative overflow-hidden">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center">
                          <div className="bg-cyan-500/20 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                            <CreditCard className="h-6 w-6 text-cyan-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{cartao.nome}</h3>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">{cartao.bandeira} • {cartao.numero}</p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => abrirModalGasto(cartao)} className="h-8 w-8 text-cyan-400 hover:bg-cyan-400/10"><Plus className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => abrirModalEdicao(cartao)} className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/5"><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => excluirCartao(cartao.id)} className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Limite Disponível</p>
                          <p className="text-lg font-bold text-emerald-400">R$ {cartao.disponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Dia Vencimento</p>
                          <p className="text-lg font-bold text-white flex items-center justify-end">
                            <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                            {cartao.due_day}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] uppercase tracking-tighter">
                          <span className="text-slate-500">Utilização do Limite</span>
                          <span className={getUtilizacaoColor((cartao.usado / cartao.limite) * 100)}>
                            {((cartao.usado / cartao.limite) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${getProgressColor((cartao.usado / cartao.limite) * 100)}`} style={{ width: `${(cartao.usado / cartao.limite) * 100}%` }} />
                        </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-6 text-xs text-slate-400 hover:text-white hover:bg-white/5 h-8 border border-white/5"
                        onClick={() => setExpandedCardId(expandedCardId === cartao.id ? null : cartao.id)}
                      >
                        {expandedCardId === cartao.id ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                        {expandedCardId === cartao.id ? 'Ocultar Histórico' : 'Ver Histórico de Faturas'}
                      </Button>

                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {expandedCardId === cartao.id && (
                      <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        {getFaturasDoCartao(cartao.id).length === 0 ? (
                          <div className="glass-panel p-4 text-center text-xs text-slate-500 italic border-dashed">
                            Nenhuma fatura encontrada.
                          </div>
                        ) : (
                          getFaturasDoCartao(cartao.id).map((fatura) => (
                            <div key={fatura.id} className="glass-panel p-4 flex justify-between items-center border-white/5 hover:bg-white/5 transition-all">
                              <div>
                                <p className="text-xs font-bold text-white">
                                  {new Date(fatura.mes_ref).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Vence em: {formatDateForDisplay(fatura.data_vencimento)}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm font-bold text-rose-400">R$ {fatura.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                  <Badge className={`border-none text-[8px] uppercase font-bold px-1 py-0 ${fatura.status === 'aberta' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    {fatura.status === 'aberta' ? 'Aberta' : 'Paga'}
                                  </Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-cyan-400" onClick={() => visualizarFatura(fatura)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Faturas */}
          <TabsContent value="faturas" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-4 border-white/5">
              <h3 className="text-lg font-semibold text-white">Controle de Faturas</h3>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <Select value={selectedCardFilter} onValueChange={setSelectedCardFilter}>
                  <SelectTrigger className="w-[180px] glass-panel border-white/10 text-xs h-9">
                    <SelectValue placeholder="Todos os cartões" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    <SelectItem value="all">Todos os Cartões</SelectItem>
                    {cartoes.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filtroStatusFatura} onValueChange={setFiltroStatusFatura}>
                  <SelectTrigger className="w-[180px] glass-panel border-white/10 text-xs h-9">
                    <SelectValue placeholder="Status..." />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    <SelectItem value="todas">Todas as Faturas</SelectItem>
                    <SelectItem value="aberta">Em Aberto</SelectItem>
                    <SelectItem value="paga">Pagas</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => setIsPeriodoModalOpen(true)} className="border-white/10 hover:bg-white/5 text-slate-300 h-9">
                  <Calendar className="h-4 w-4 mr-2" />
                  Período
                </Button>
              </div>
            </div>

            <div className="glass-panel border-white/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-500 uppercase tracking-widest bg-white/5 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Cartão</th>
                      <th className="px-6 py-4">Referência</th>
                      <th className="px-6 py-4">Vencimento</th>
                      <th className="px-6 py-4">Valor Total</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {faturas.filter(f => selectedCardFilter === 'all' || f.cartao_id.toString() === selectedCardFilter).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">
                          Nenhuma fatura encontrada.
                        </td>
                      </tr>
                    ) : (
                      faturas
                        .filter(f => selectedCardFilter === 'all' || f.cartao_id.toString() === selectedCardFilter)
                        .map((fatura) => (
                        <tr key={fatura.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-bold text-white">
                            {fatura.cartao_nome}
                          </td>
                          <td className="px-6 py-4 text-slate-400 capitalize">
                            {new Date(fatura.mes_ref).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 text-purple-400 font-medium">
                            {formatDateForDisplay(fatura.data_vencimento)}
                          </td>
                          <td className="px-6 py-4 font-bold text-rose-400">
                            R$ {(Number(fatura.valor_total) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge className={`border-none text-[8px] uppercase font-bold px-1.5 py-0 ${fatura.status === 'aberta' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {fatura.status === 'aberta' ? 'Aberta' : 'Paga'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => visualizarFatura(fatura)}
                                className="h-8 text-cyan-400 hover:bg-cyan-400/10"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Detalhes
                              </Button>
                              {fatura.status === 'aberta' && (
                                <Button 
                                  size="sm"
                                  onClick={() => pagarFatura(fatura)}
                                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  Confirmar
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="h-8 text-rose-400 hover:bg-rose-400/10"
                                onClick={() => excluirFatura(fatura)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Lançar Gasto */}
        <Dialog open={isGastoModalOpen} onOpenChange={setIsGastoModalOpen}>
          <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-white">Lançar Gasto no Cartão</DialogTitle>
              <p className="text-xs text-slate-500 uppercase tracking-widest">{selectedCartao?.nome}</p>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!gastoFormData.description || !gastoFormData.amount || !gastoFormData.category) {
                alert('Preencha os campos obrigatórios.'); return;
              }
              const payload = {
                description: gastoFormData.description,
                value: parseFloat(gastoFormData.amount),
                date: gastoFormData.date,
                category_id: parseInt(gastoFormData.category),
                payment_method: gastoFormData.payment_method,
                installments: gastoFormData.installments
              };
              const sucesso = await lancarGastoCartao(selectedCartao.id, payload);
              if (sucesso) {
                alert('✅ Gasto lançado com sucesso!');
                setIsGastoModalOpen(false);
                setGastoFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], payment_method: 'a_vista', installments: 1 });
                await loadCartoes();
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gasto-description" className="text-slate-300">Descrição *</Label>
                <Input id="gasto-description" value={gastoFormData.description} onChange={(e) => setGastoFormData(prev => ({...prev, description: e.target.value}))} placeholder="Ex: Restaurante..." required className="glass-panel border-white/10" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gasto-amount" className="text-slate-300">Valor *</Label>
                  <Input id="gasto-amount" type="number" step="0.01" value={gastoFormData.amount} onChange={(e) => setGastoFormData(prev => ({...prev, amount: e.target.value}))} placeholder="0,00" required className="glass-panel border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gasto-date" className="text-slate-300">Data</Label>
                  <Input id="gasto-date" type="date" value={gastoFormData.date} onChange={(e) => setGastoFormData(prev => ({...prev, date: e.target.value}))} className="glass-panel border-white/10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gasto-category" className="text-slate-300">Categoria *</Label>
                <Select value={gastoFormData.category} onValueChange={(value) => setGastoFormData(prev => ({...prev, category: value}))}>
                  <SelectTrigger className="glass-panel border-white/10">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    <SelectItem value="1">🍽️ Alimentação</SelectItem>
                    <SelectItem value="2">🚌 Transporte</SelectItem>
                    <SelectItem value="3">🎉 Lazer</SelectItem>
                    <SelectItem value="4">💊 Saúde</SelectItem>
                    <SelectItem value="5">📚 Educação</SelectItem>
                    <SelectItem value="6">🛍️ Compras</SelectItem>
                    <SelectItem value="7">🛠️ Serviços</SelectItem>
                    <SelectItem value="8">📦 Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method" className="text-slate-300">Forma Pagamento</Label>
                  <Select value={gastoFormData.payment_method} onValueChange={(value) => setGastoFormData(prev => ({...prev, payment_method: value, installments: 1}))}>
                    <SelectTrigger className="glass-panel border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-white/10">
                      <SelectItem value="a_vista">À Vista</SelectItem>
                      <SelectItem value="parcelado">Parcelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {gastoFormData.payment_method === 'parcelado' && (
                  <div className="space-y-2">
                    <Label htmlFor="installments" className="text-slate-300">Parcelas</Label>
                    <Input id="installments" type="number" min="2" max="24" value={gastoFormData.installments} onChange={(e) => setGastoFormData(prev => ({...prev, installments: parseInt(e.target.value) || 1}))} className="glass-panel border-white/10" />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsGastoModalOpen(false)} className="text-slate-400 hover:text-white">Cancelar</Button>
                <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white">Lançar Gasto</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal Fatura Completa */}
        <Dialog open={isFaturaModalOpen} onOpenChange={setIsFaturaModalOpen}>
          <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Detalhamento da Fatura</DialogTitle>
              {selectedFatura && (
                <p className="text-xs text-slate-500 uppercase tracking-widest">{selectedFatura.cartao_nome} • {new Date(selectedFatura.mes_ref).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
              )}
            </DialogHeader>
            
            {selectedFatura && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="glass-panel p-4 border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Valor Total</p>
                    <p className="text-lg font-bold text-rose-400">R$ {Number(selectedFatura.valor_total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="glass-panel p-4 border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Pag. Mínimo</p>
                    <p className="text-lg font-bold text-amber-400">R$ {Number(selectedFatura.valor_minimo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="glass-panel p-4 border-white/5 text-center">
                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1">Vencimento</p>
                    <p className="text-lg font-bold text-purple-400">{formatDateForDisplay(selectedFatura.data_vencimento)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Transações</h4>
                  <div className="space-y-2">
                    {selectedFatura.transacoes.map((transacao, index) => (
                      <div key={index} className="glass-panel p-3 flex justify-between items-center border-white/5 group hover:bg-white/5">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white">{transacao.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-slate-500">{formatDateForDisplay(transacao.date)}</span>
                            {transacao.installments > 1 && (
                              <Badge className="bg-white/5 text-slate-400 border-none text-[8px] px-1.5 py-0">
                                Parcela {transacao.current_installment}/{transacao.installments}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-sm font-bold text-rose-400">R$ {Number(transacao.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          {selectedFatura.status === 'aberta' && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => excluirTransacao(transacao.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-white/5">
                  <Button variant="ghost" onClick={() => setIsFaturaModalOpen(false)} className="text-slate-400">Fechar</Button>
                  {selectedFatura.status === 'aberta' && (
                    <Button onClick={() => { pagarFatura(selectedFatura); setIsFaturaModalOpen(false); }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <DollarSign className="h-4 w-4 mr-2" /> Confirmar Pagamento
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Período */}
        <Dialog open={isPeriodoModalOpen} onOpenChange={setIsPeriodoModalOpen}>
          <DialogContent className="glass-panel border-white/10 text-slate-200 sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-white">Filtrar por Período</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio" className="text-slate-300 text-xs">Início</Label>
                  <Input id="data_inicio" type="date" value={dataInicioFiltro} onChange={(e) => setDataInicioFiltro(e.target.value)} className="glass-panel border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim" className="text-slate-300 text-xs">Fim</Label>
                  <Input id="data_fim" type="date" value={dataFimFiltro} onChange={(e) => setDataFimFiltro(e.target.value)} className="glass-panel border-white/10" />
                </div>
              </div>
              <div className="flex justify-between items-center pt-4">
                <Button variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 h-9" onClick={() => { setDataInicioFiltro(''); setDataFimFiltro(''); setIsPeriodoModalOpen(false); }}>
                  Limpar
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsPeriodoModalOpen(false)} className="text-slate-400 h-9">Cancelar</Button>
                  <Button onClick={() => setIsPeriodoModalOpen(false)} className="bg-cyan-600 hover:bg-cyan-700 text-white h-9 px-4">Aplicar</Button>
                </div>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  };

export default CreditCards;
