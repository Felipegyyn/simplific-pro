// Local: src/services/api.js (ou apiService.js)

import axios from 'axios';

// 1. Pega a URL base do backend a partir das variáveis de ambiente.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("ERRO CRÍTICO: A variável de ambiente VITE_API_BASE_URL não está definida!");
}

// 2. Cria uma instância do Axios com configurações padrão.
const apiService = axios.create({
  baseURL: API_BASE_URL,
});

// 3. Configura um "interceptor" para adicionar o token de autenticação em TODAS as requisições.
// Isso elimina a necessidade de adicionar o token manualmente em cada chamada.
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('simplific_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Para uploads de arquivo, o Axios/navegador define o Content-Type,
    // então não forçamos um 'application/json' aqui.
    if (!(config.data instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 4. Interceptor de resposta para simplificar o acesso aos dados
apiService.interceptors.response.use(
  (response) => {
    // Retorna diretamente os dados da resposta (response.data) para simplificar o código
    return response.data;
  },
  (error) => {
    // Aqui você pode adicionar lógica global de tratamento de erros (ex: logout em erro 401)
    console.error('Erro na chamada da API:', error.response);
    return Promise.reject(error);
  }
);

export default apiService;