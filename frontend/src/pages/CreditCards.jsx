import apiService from '../services/api';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  CreditCard, DollarSign, AlertTriangle, Plus, Edit, Trash2, 
  Calendar, TrendingUp, LogOut, ArrowLeft, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  // Carregar cartões da API
  useEffect(() => {
    loadCartoes();
  }, []);

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
    if (!confirm(`Deseja realmente pagar a fatura de R$ ${fatura.valor_total.toFixed(2)}?`)) {
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
        status: 'confirmada', // A transação já nasce confirmada
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



  // Função para visualizar fatura completa
  const visualizarFatura = (fatura) => {
    setSelectedFatura(fatura);
    setIsFaturaModalOpen(true);
  };

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
      name: formData.name,
      brand: formData.brand,
      limit: parseFloat(formData.limit_amount),
      // Não enviamos mais o closing_day
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

  // Carregar faturas (dados mock por enquanto)
  useEffect(() => {
  loadCartoes();
}, []);


const carregarFaturas = async (listaDeCartoes) => { 
  try {
    const respostaFaturas = await apiService.get('/api/faturas');

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

  // Calcular totais
  const limiteTotal = cartoes.reduce((sum, cartao) => sum + cartao.limite, 0);
  const usadoTotal = cartoes.reduce((sum, cartao) => sum + cartao.usado, 0);
  const disponivelTotal = cartoes.reduce((sum, cartao) => sum + cartao.disponivel, 0);

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 dark:text-gray-100 p-4 sm:p-0">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 dark:border-slate-700 shadow-sm border-b">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <img src={logo} alt="Simplific Pro" className="h-8 w-auto mr-3" />
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Bem-vindo, {user.name}
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        
      </header>

      {/* Main Content */}
      
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Cartões de Crédito</h2>
            <p className="text-gray-600 dark:text-gray-400">Gerencie seus cartões e faturas</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Limite Total</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">R$ {limiteTotal.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Limite Usado</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">R$ {usadoTotal.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Limite Disponível</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">R$ {disponivelTotal.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="cartoes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="cartoes">Meus Cartões</TabsTrigger>
              <TabsTrigger value="faturas">Faturas</TabsTrigger>
            </TabsList>

            {/* Meus Cartões */}
            <TabsContent value="cartoes" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-slate-100">Meus Cartões</h3>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Cartão
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome do Cartão *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Ex: Nubank Roxinho"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="brand">Bandeira *</Label>
                          <Select value={formData.brand} onValueChange={(value) => handleInputChange('brand', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visa">Visa</SelectItem>
                              <SelectItem value="Mastercard">Mastercard</SelectItem>
                              <SelectItem value="Elo">Elo</SelectItem>
                              <SelectItem value="American Express">American Express</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="card_number">Número do Cartão *</Label>
                          <Input
                            id="card_number"
                            value={formData.card_number}
                            onChange={(e) => handleInputChange('card_number', e.target.value)}
                            placeholder="**** **** **** 1234"
                            maxLength="19"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="limit_amount">Limite (R$) *</Label>
                          <Input
                            id="limit_amount"
                            type="number"
                            step="0.01"
                            value={formData.limit_amount}
                            onChange={(e) => handleInputChange('limit_amount', e.target.value)}
                            placeholder="5000.00"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="due_date">Dia do Vencimento</Label>
                        <Select value={formData.due_date} onValueChange={(value) => handleInputChange('due_date', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[250px] overflow-y-auto">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                Dia {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Adicionar Cartão
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>


                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Editar Cartão</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateCard} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome do Cartão *</Label>
                          <Input
                            id="name"
                            value={editingCard?.nome || ''}
                            onChange={(e) => handleEditInputChange('nome', e.target.value)}
                            placeholder="Ex: Nubank Roxinho"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-brand">Bandeira *</Label>
                          <Select value={editingCard?.bandeira || ''} onValueChange={(value) => handleEditInputChange('bandeira', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Visa">Visa</SelectItem>
                              <SelectItem value="Mastercard">Mastercard</SelectItem>
                              <SelectItem value="Elo">Elo</SelectItem>
                              <SelectItem value="American Express">American Express</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-card_number">Número do Cartão *</Label>
                          <Input
                            id="edit-card_number"
                            value={editingCard?.numero || ''} // A propriedade no seu objeto cartao é 'numero'
                            onChange={(e) => handleEditInputChange('numero', e.target.value)}
                            placeholder="**** **** **** 1234"
                            maxLength="19"
                            required
                            readOnly // <-- ADICIONE ESTA LINHA
                            className="bg-gray-100 dark:bg-slate-800 cursor-not-allowed" // Opcional: melhora o visual
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-limit_amount">Limite (R$) *</Label>
                          <Input
                            id="edit-limit_amount"
                            type="number"
                            step="0.01"
                            value={editingCard?.limite || ''} // A propriedade no seu objeto cartao é 'limite'
                            onChange={(e) => handleEditInputChange('limite', e.target.value)}
                            placeholder="5000.00"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="edit-due_date">Dia do Vencimento</Label>
                        <Select value={editingCard?.due_day || ''} onValueChange={(value) => handleEditInputChange('due_day', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o dia..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[250px] overflow-y-auto">
                            {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                              <SelectItem key={day} value={day.toString()}>
                                Dia {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Salvar alterações
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.isArray(cartoes) && cartoes.map((cartao) => (
  <Card key={cartao.id} className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold dark:text-slate-200">{cartao.nome}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">{cartao.numero}</p>
          <p className="text-sm text-gray-600 dark:text-slate-400">{cartao.bandeira}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Badge variant="outline">{cartao.status}</Badge>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => abrirModalGasto(cartao)}
              title="Lançar Gasto no Cartão"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => abrirModalEdicao(cartao)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => excluirCartao(cartao.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-center sm:text-left">
        <div>
          <p className="text-sm text-gray-600  dark:text-slate-400">Limite Total</p>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">R$ {cartao.limite.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400">Usado</p>
          <p className="text-lg font-bold text-red-600 dark:text-red-400">R$ {cartao.usado.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400">Disponível</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
  R$ {(Number(cartao.disponivel) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-400">Vencimento</p>
          <p className="text-lg font-bold text-purple-600">
            {new Date(cartao.vencimento).toLocaleDateString()}
          </p>
        </div>
      </div>

      {(() => {
        const utilizacao = (cartao.usado / cartao.limite) * 100;
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Utilização do Limite</span>
              <span className={`font-medium ${getUtilizacaoColor(utilizacao)}`}>
                {utilizacao.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${getProgressColor(utilizacao)}`}
                style={{ width: `${Math.min(utilizacao, 100)}%` }}
              ></div>
            </div>
            {utilizacao > 80 && (
              <div className="flex items-center text-red-600 text-sm mt-2">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Atenção: Limite quase esgotado
              </div>
            )}
          </div>
        );
      })()}
    </CardContent>
  </Card>
))}
              </div>
            </TabsContent>

            {/* Faturas */}
            <TabsContent value="faturas" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold dark:text-slate-100">Faturas dos Cartões</h3>
                <Button variant="outline" onClick={() => setIsPeriodoModalOpen(true)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Filtrar por Período
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faturas.map((fatura) => (
                  <Card key={fatura.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{fatura.cartao_nome}</CardTitle>
                        <Badge className={fatura.status === 'aberta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}>
                          {fatura.status === 'aberta' ? 'Em Aberto' : 'Paga'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        Referência: {new Date(fatura.mes_ref).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-slate-400">Valor Total</p>
                          <p className="text-xl font-bold text-red-600 dark:text-red-400">
  R$ {(Number(fatura.valor_total) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-slate-400">Pagamento Mínimo</p>
                          <p className="text-xl font-bold text-yellow-600">
  R$ {(Number(fatura.valor_minimo) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</p>

                        </div>
                        <div>
                          <p className="text-sm text-gray-600 dark:text-slate-400">Vencimento</p>
                          <p className="text-xl font-bold text-purple-600">
                            {formatDateForDisplay(fatura.data_vencimento)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Principais Transações</h4>
                        {fatura.transacoes.slice(0, 4).map((transacao, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-slate-800 last:border-b-0">
                            <div>
                              <p className="font-medium">{transacao.description}</p>
                              <p className="text-sm text-gray-600 dark:text-slate-400">{formatDateForDisplay(transacao.date)}</p>
                            </div>
                            <p className="font-bold text-red-600 dark:text-red-400">
  R$ {(Number(transacao.value) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</p>

                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t dark:border-slate-800">
                        <Button 
                          variant="outline"
                          onClick={() => visualizarFatura(fatura)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Fatura Completa
                        </Button>
                        {fatura.status === 'aberta' && (
                          <Button onClick={() => pagarFatura(fatura)}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pagar Fatura
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Modal para Lançar Gasto no Cartão */}
          <Dialog open={isGastoModalOpen} onOpenChange={setIsGastoModalOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Lançar Gasto no Cartão</DialogTitle>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {selectedCartao?.nome}
                </p>
              </DialogHeader>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                if (!gastoFormData.description || !gastoFormData.amount) {
                  alert('Por favor, preencha todos os campos obrigatórios.');
                  return;
                }
  const categoriaId = gastoFormData.category ? parseInt(gastoFormData.category) : null;

if (!categoriaId || isNaN(categoriaId)) {
  alert("Você precisa selecionar uma categoria válida.");
  return;
}

const payload = {
  description: gastoFormData.description,
  value: parseFloat(gastoFormData.amount),
  date: gastoFormData.date,
  category_id: parseInt(gastoFormData.category),
  payment_method: gastoFormData.payment_method, // <-- ADICIONE ESTA LINHA
  installments: gastoFormData.installments      // <-- ADICIONE ESTA LINHA
};

console.log("Enviando gasto:", payload);

const sucesso = await lancarGastoCartao(selectedCartao.id, payload);

if (sucesso) {
  alert('✅ Gasto lançado no cartão com sucesso!');

  // Fechar modal
  setIsGastoModalOpen(false);

  // Resetar campos
  setGastoFormData({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Recarregar cartões e faturas
  await loadCartoes();
} else {
  alert('❌ Erro ao lançar o gasto. Tente novamente. ');
}



              }} className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={gastoFormData.description}
                    onChange={(e) => setGastoFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Ex: Supermercado, Restaurante..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={gastoFormData.amount}
                      onChange={(e) => setGastoFormData(prev => ({...prev, amount: e.target.value}))}
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={gastoFormData.date}
                      onChange={(e) => setGastoFormData(prev => ({...prev, date: e.target.value}))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={gastoFormData.category} onValueChange={(value) => setGastoFormData(prev => ({...prev, category: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria..." />
                    </SelectTrigger>
                    <SelectContent>
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

                {/* ▼▼▼ ADICIONE ESTE BLOCO INTEIRO ▼▼▼ */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <Label htmlFor="payment_method">Forma de Pagamento</Label>
    <Select 
      value={gastoFormData.payment_method} 
      onValueChange={(value) => setGastoFormData(prev => ({...prev, payment_method: value, installments: 1}))}
    >
      <SelectTrigger id="payment_method">
        <SelectValue placeholder="Selecione..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a_vista">Crédito à Vista</SelectItem>
        <SelectItem value="parcelado">Parcelado</SelectItem>
      </SelectContent>
    </Select>
  </div>

  {/* Este campo só aparece se a forma de pagamento for "parcelado" */}
  {gastoFormData.payment_method === 'parcelado' && (
    <div>
      <Label htmlFor="installments">Nº de Parcelas</Label>
      <Input
        id="installments"
        type="number"
        min="2"
        max="24"
        value={gastoFormData.installments}
        onChange={(e) => setGastoFormData(prev => ({...prev, installments: parseInt(e.target.value) || 1}))}
      />
    </div>
  )}
</div>
{/* ▲▲▲ FIM DO BLOCO ▲▲▲ */}

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsGastoModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Lançar Gasto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal para Visualizar Fatura Completa */}
          <Dialog open={isFaturaModalOpen} onOpenChange={setIsFaturaModalOpen}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Fatura Completa</DialogTitle>
                {selectedFatura && (
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {selectedFatura.cartao_nome} - {new Date(selectedFatura.mes_ref).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </DialogHeader>
              
              {selectedFatura && (
                <div className="space-y-6">
                  {/* Resumo da Fatura */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Valor Total</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
  R$ {(Number(selectedFatura.valor_total) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</p>

                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Pagamento Mínimo</p>
                      <p className="text-xl font-bold text-yellow-600">
  R$ {(Number(selectedFatura.valor_minimo) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</p>

                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Vencimento</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatDateForDisplay(selectedFatura.data_vencimento)}
                      </p>
                    </div>
                  </div>

                  {/* Lista Completa de Transações */}
                  <div>
                    <h4 className="font-semibold mb-4">Todas as Transações</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedFatura.transacoes.map((transacao, index) => (
                        <div key={index} className="flex justify-between items-center py-3 px-4 border border-gray-200 dark:border-slate-700 rounded-lg">
                          <div>
                            <p className="font-medium">{transacao.description}</p>
                            <p className="text-sm text-gray-600 dark:text-slate-400">{formatDateForDisplay(transacao.date)}</p>
                          </div>
                          <p className="font-bold text-red-600 dark:text-red-400">
                      R$ {(Number(transacao.value) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })}
</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsFaturaModalOpen(false)}>
                      Fechar
                    </Button>
                    {selectedFatura.status === 'aberta' && (
                      <Button onClick={() => {
                        pagarFatura(selectedFatura);
                        setIsFaturaModalOpen(false);
                      }}>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Pagar Fatura
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Modal para Filtrar por Período */}
          <Dialog open={isPeriodoModalOpen} onOpenChange={setIsPeriodoModalOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Filtrar Faturas por Período</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="data_inicio">Data Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    defaultValue="2024-01-01"
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    defaultValue="2024-12-31"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsPeriodoModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    alert('Filtro aplicado com sucesso!');
                    setIsPeriodoModalOpen(false);
                  }}>
                    Aplicar Filtro
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      
    </div>
  );
};

export default CreditCards;

