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

  getHeaders(method = 'GET') {
    const headers = {};

    if (method !== 'DELETE') {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';
    const config = {
      headers: this.getHeaders(method),
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401 && !options._retry) {
        try {
          await this.silentRefreshToken();
          const newConfig = { ...config, headers: this.getHeaders(method) };
          return this.request(endpoint, { ...newConfig, _retry: true });
        } catch (refreshError) {
          this.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      if (response.status === 204) {
        return null;
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || data.error || 'Erro na requisição');
        }
        return data;
      } else {
        if (!response.ok) {
          const textError = await response.text();
          throw new Error(textError || 'Erro na requisição');
        }
        return null;
      }
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
      throw new Error('Falha no login');
    }

    const data = await response.json();
    this.setToken(data.access_token, data.refresh_token);
    localStorage.setItem('simplific_user', JSON.stringify(data.user));
    this.checkTokenValidity();
    return data;
  }

  async logout() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('simplific_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('simplific_user');

    if (window.location.hash !== '#/login' && window.location.hash !== '#/') {
      window.location.hash = '#/login';
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
