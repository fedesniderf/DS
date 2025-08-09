// Servicio temporal simplificado de seguridad de login
export const LoginSecurityService = {
  MAX_FAILED_ATTEMPTS: 10,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutos en milisegundos

  // Almacenamiento temporal en memoria (se perderá al recargar)
  failedAttempts: new Map(),

  async initializeTable() {
    console.log('LoginSecurityService: Tabla inicializada (modo simple)');
    return { success: true };
  },

  async ensureTableExists() {
    console.log('LoginSecurityService: Verificando tabla (modo simple)');
    return { success: true };
  },

  async recordFailedAttempt(email) {
    console.log('Registrando intento fallido para:', email);
    
    const currentAttempts = this.failedAttempts.get(email) || 0;
    const newAttempts = currentAttempts + 1;
    this.failedAttempts.set(email, newAttempts);

    return {
      isBlocked: newAttempts >= this.MAX_FAILED_ATTEMPTS,
      attempts: newAttempts,
      maxAttempts: this.MAX_FAILED_ATTEMPTS
    };
  },

  async checkAccountLock(email) {
    const attempts = this.failedAttempts.get(email) || 0;
    return {
      isLocked: attempts >= this.MAX_FAILED_ATTEMPTS,
      attempts,
      maxAttempts: this.MAX_FAILED_ATTEMPTS
    };
  },

  async resetFailedAttempts(email) {
    console.log('Reseteando intentos fallidos para:', email);
    this.failedAttempts.delete(email);
    return { success: true };
  },

  async getSecurityReport() {
    return {
      totalFailedAttempts: Array.from(this.failedAttempts.values()).reduce((a, b) => a + b, 0),
      blockedAccounts: Array.from(this.failedAttempts.entries()).filter(([_, attempts]) => attempts >= this.MAX_FAILED_ATTEMPTS).length,
      recentActivity: []
    };
  },

  async getFailedAttempts(email) {
    return this.failedAttempts.get(email) || 0;
  },

  async getAllFailedAttempts() {
    return Array.from(this.failedAttempts.entries()).map(([email, attempts]) => ({
      email,
      attempts,
      isLocked: attempts >= this.MAX_FAILED_ATTEMPTS
    }));
  },

  async cleanupOldRecords() {
    console.log('LoginSecurityService: Limpieza completada (modo simple)');
    return { success: true };
  }
};
