const eventService = {
  events: {},
  
  // Método para se "inscrever" em um evento
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  },

  // Método para "publicar" um aviso
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  },

  // Método para "cancelar a inscrição" e evitar vazamentos de memória
  off(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        cb => cb !== callback
      );
    }
  }
};

export default eventService;