import api from './api';

// Serviço para envio de mensagens via WhatsApp
export const sendWhatsApp = async (to, message_type, data) => {
  try {
    const response = await api.post('/send_whatsapp', { to, message_type, data });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    throw error;
  }
};
