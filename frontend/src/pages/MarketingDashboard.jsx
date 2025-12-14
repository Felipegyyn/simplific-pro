import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Sua instância do Axios configurada
import { 
  Container, Card, Table, Button, Form, Badge, Spinner, Alert, InputGroup 
} from 'react-bootstrap'; // Ajuste conforme sua biblioteca de UI (MUI, Bootstrap, etc)
// Se não usar Bootstrap, me avise que ajusto para HTML puro ou Styled Components

const MarketingDashboard = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null); // ID da campanha sendo atualizada

  // 1. Busca as campanhas ao carregar
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/marketing/campaigns');
      setCampaigns(response.data);
      setError('');
    } catch (err) {
      console.error("Erro ao buscar campanhas:", err);
      setError('Falha ao carregar campanhas. Verifique se você é Admin.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Função para Ligar/Desligar
  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    setUpdating(id);
    try {
      await api.post(`/marketing/campaigns/${id}/toggle`, { status: newStatus });
      // Atualiza localmente para parecer instantâneo
      setCampaigns(campaigns.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      alert("Erro ao alterar status no Facebook.");
    } finally {
      setUpdating(null);
    }
  };

  // 3. Função para Atualizar Orçamento
  const handleUpdateBudget = async (id, newBudget) => {
    if (!newBudget || newBudget < 5) return alert("Mínimo R$ 5,00");
    
    setUpdating(id);
    try {
      await api.post(`/marketing/campaigns/${id}/budget`, { budget: parseFloat(newBudget) });
      alert("Orçamento atualizado com sucesso!");
    } catch (err) {
      alert("Erro ao atualizar orçamento. Verifique o console.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🚀 Gestão de Tráfego (Meta Ads)</h2>
        <Button variant="outline-primary" onClick={fetchCampaigns}>Atualizar Dados</Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Table hover responsive>
          <thead className="bg-light">
            <tr>
              <th>Status</th>
              <th>Campanha</th>
              <th>Gasto Total</th>
              <th style={{width: '200px'}}>Orçamento Diário (R$)</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr key={camp.id} style={{opacity: updating === camp.id ? 0.5 : 1}}>
                <td>
                  <Badge bg={camp.status === 'ACTIVE' ? 'success' : 'secondary'}>
                    {camp.status === 'ACTIVE' ? 'ATIVO' : 'PAUSADO'}
                  </Badge>
                </td>
                <td className="fw-bold">{camp.name}</td>
                <td>R$ {camp.total_spend.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td>
                  <Form.Control 
                    type="number" 
                    defaultValue={camp.daily_budget} 
                    onBlur={(e) => {
                        // Só atualiza se o valor mudou
                        if (parseFloat(e.target.value) !== camp.daily_budget) {
                            if(window.confirm(`Alterar orçamento para R$ ${e.target.value}?`)) {
                                handleUpdateBudget(camp.id, e.target.value);
                            }
                        }
                    }}
                  />
                </td>
                <td>
                  <Button 
                    size="sm" 
                    variant={camp.status === 'ACTIVE' ? 'outline-danger' : 'outline-success'}
                    onClick={() => handleToggle(camp.id, camp.status)}
                    disabled={updating === camp.id}
                  >
                    {camp.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                  </Button>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && !error && (
              <tr>
                <td colSpan="5" className="text-center py-4">
                    Nenhuma campanha encontrada no Facebook.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
      <small className="text-muted mt-2 d-block">* Alterações de orçamento podem levar 15min para refletir no Facebook.</small>
    </Container>
  );
};

export default MarketingDashboard;