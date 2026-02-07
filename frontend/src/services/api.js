// Este é o conteúdo completo e corrigido para o seu arquivoo api.jsx

const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiService {
  constructor() {
    this.token = localStorage.getItem('simplific_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    this.isRefreshing = false;
    this.failedQueue = [];

    this.setupTokenRefresh();
  }

  setToken(token, refreshToken) {
    this.token = token;
    this.refreshToken = refreshToken;

    localStorage.setItem('simplific_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  setupTokenRefresh() {
    setInterval(() => {
      this.checkTokenValidity();
    }, 5 * 60 * 1000);
  }

  async checkTokenValidity() {
    if (!this.token) return;

    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      if (timeUntilExpiry < 600) {
        console.log('Token próximo do vencimento, renovando...');
        await this.silentRefreshToken();
      }
    } catch (error) {
      console.error('Erro ao verificar validade do token:', error);
    }
  }

  async silentRefreshToken() {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    if (!this.refreshToken) {
      this.logout();
      return Promise.reject(new Error('Refresh token não encontrado'));
    }

    this.isRefreshing = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.refreshToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Falha na renovação do token');
      }

      const data = await response.json();
      this.setToken(data.access_token, data.refresh_token || this.refreshToken);
      this.processQueue(null, this.token);
      console.log('Token renovado com sucesso');
      return this.token;

    } catch (error) {
      console.error('Erro na renovação do token:', error);
      this.processQueue(error, null);
      this.logout();
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // --- MUDANÇA 1: Tratamento explícito para 422 (Logout Imediato) ---
      if (response.status === 422) {
          console.warn('Sessão invalidada pelo servidor (422). Realizando logout.');
          this.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Tratamento para 401 (Tenta renovar)
      if (response.status === 401 && !options._retry) {
        try {
          await this.silentRefreshToken();
          const newConfig = { ...config, headers: this.getHeaders() };
          return this.request(endpoint, { ...newConfig, _retry: true });
        } catch (refreshError) {
          this.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro na requisição');
      }
      return data;

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Autenticação
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Credenciais inválidas' }));
      throw new Error(errorData.message);
    }

    const data = await response.json();
    this.setToken(data.access_token, data.refresh_token);
    localStorage.setItem('simplific_user', JSON.stringify(data.user));
    this.checkTokenValidity();
    return data;
  }

  logout() { // Removi o 'async' pois não precisa ser assíncrono
    // 1. Para qualquer renovação em andamento
    this.isRefreshing = false;
    this.failedQueue = [];
    
    // 2. Limpa variáveis de memória
    this.token = null;
    this.refreshToken = null;

    // 3. Limpa o armazenamento
    localStorage.removeItem('simplific_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('simplific_user');

    // 4. Redireciona apenas se não estiver na tela de login
    // Usamos window.location.href para forçar um recarregamento limpo
    if (!window.location.hash.includes('/login')) {
      console.log('Redirecionando para login...');
      window.location.href = '/#/login'; 
      // Se você não usar hash router (#), use: window.location.href = '/login';
    }
  }

  isAuthenticated() {
    return !!this.token;
  }

  async getCurrentUser() {
    return this.request('/api/profile');
  }

  // Planejamento
  async getPlannings() {
    return this.get('/api/planning');
  }

  async createPlanning(planningData) {
    return this.post('/api/planning', planningData);
  }

  async updatePlanning(planningId, planningData) {
    return this.put(`/api/planning/${planningId}`, planningData);
  }

  async deletePlanning(planningId) {
    return this.delete(`/api/planning/${planningId}`);
  }

  // Transações
  async getTransactions() {
    return this.get('/api/transactions');
  }

  async createTransaction(transactionData) {
    return this.post('/api/transactions', transactionData);
  }

  async updateTransaction(transactionId, transactionData) {
    return this.put(`/api/transactions/${transactionId}`, transactionData);
  }

  async deleteTransaction(transactionId) {
    return this.delete(`/api/transactions/${transactionId}`);
  }

  // Cartões de Crédito
  async getCreditCards() {
    return this.get('/api/credit-cards');
  }

  async createCreditCard(cardData) {
    return this.post('/api/credit-cards', cardData);
  }

  async updateCreditCard(cardId, cardData) {
    return this.put(`/api/credit-cards/${cardId}`, cardData);
  }

  async deleteCreditCard(cardId) {
    return this.delete(`/api/credit-cards/${cardId}`);
  }

  async getCreditCardTransactions(cardId) {
    return this.get(`/api/credit-cards/${cardId}/transactions`);
  }

  async createCreditCardTransaction(cardId, transactionData) {
    return this.post(`/api/credit-cards/${cardId}/transactions`, transactionData);
  }

  // Metas
  async getGoals() {
    return this.get('/api/goals');
  }

  async createGoal(goalData) {
    return this.post('/api/goals', goalData);
  }

  async updateGoal(goalId, goalData) {
    return this.put(`/api/goals/${goalId}`, goalData);
  }

  async deleteGoal(goalId) {
    return this.delete(`/api/goals/${goalId}`);
  }
  
  // Categorias
  async getCategories() {
      return this.get('/api/categories');
  }

  // Reports
  async getDashboardSummary(year, month) {
      return this.get(`/api/reports/dashboard_summary?year=${year}&month=${month}`);
  }

  async getPlannedVsRealized(year, type, categoryId = null) {
      let endpoint = `/api/reports/planned_vs_realized?year=${year}&type=${type}`;
      if (categoryId) {
          endpoint += `&category_id=${categoryId}`;
      }
      return this.get(endpoint);
  }


  // Investimentos
  async getInvestments() {
    return this.get('/api/investments');
  }

  async createInvestment(investmentData) {
    return this.post('/api/investments', investmentData);
  }

  async updateInvestment(investmentId, investmentData) {
    return this.put(`/api/investments/${investmentId}`, investmentData);
  }

  async deleteInvestment(investmentId) {
    return this.delete(`/api/investments/${investmentId}`);
  }

  // Agenda
  async getScheduleEvents() {
    return this.get('/api/schedule');
  }

  async createScheduleEvent(eventData) {
    return this.post('/api/schedule', eventData);
  }

  async updateScheduleEvent(eventId, eventData) {
    return this.put(`/api/schedule/${eventId}`, eventData);
  }

  async deleteScheduleEvent(eventId) {
    return this.delete(`/api/schedule/${eventId}`);
  }
}

export default new ApiService();
