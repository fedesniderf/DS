import { supabase } from '../supabaseClient';

/**
 * Servicio para manejar intentos de login fallidos y bloqueos de cuenta
 */
export const LoginSecurityService = {
  // Configuración
  MAX_FAILED_ATTEMPTS: 10,
  LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutos en milisegundos

  /**
   * Registrar un intento de login fallido
   * @param {string} email - Email del usuario
   * @returns {Object} - Información sobre el estado del bloqueo
   */
  async recordFailedAttempt(email) {
    try {
      // Verificar si ya existe un registro de intentos fallidos
      const { data: existingRecord, error: fetchError } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .single();

      // Si hay un error 406 o problema de permisos, intentar crear la tabla
      if (fetchError && (fetchError.code === 'PGRST406' || fetchError.message?.includes('406'))) {
        console.warn('Tabla login_attempts no disponible, creando...', fetchError);
        await this.ensureTableExists();
        // Intentar de nuevo después de crear la tabla
        return this.recordFailedAttempt(email);
      }

      const now = new Date().toISOString();

      if (fetchError && fetchError.code === 'PGRST116') {
        // No existe registro, crear uno nuevo
        const { data, error } = await supabase
          .from('login_attempts')
          .insert([{
            email: email,
            failed_attempts: 1,
            last_attempt: now,
            is_locked: false,
            locked_until: null
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creando registro de intentos:', error);
          return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS - 1 };
        }

        return { 
          isLocked: false, 
          remainingAttempts: this.MAX_FAILED_ATTEMPTS - 1,
          failedAttempts: 1
        };
      }

      if (fetchError) {
        console.error('Error consultando intentos:', fetchError);
        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      // Verificar si la cuenta está bloqueada y si el bloqueo ha expirado
      if (existingRecord.is_locked && existingRecord.locked_until) {
        const lockExpiry = new Date(existingRecord.locked_until);
        const currentTime = new Date();
        
        if (currentTime < lockExpiry) {
          // Aún está bloqueado
          const remainingTime = Math.ceil((lockExpiry - currentTime) / (1000 * 60)); // minutos
          return { 
            isLocked: true, 
            remainingTime: remainingTime,
            failedAttempts: existingRecord.failed_attempts
          };
        } else {
          // El bloqueo ha expirado, resetear
          await this.resetFailedAttempts(email);
          return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
        }
      }

      // Incrementar intentos fallidos
      const newFailedAttempts = existingRecord.failed_attempts + 1;
      const shouldLock = newFailedAttempts >= this.MAX_FAILED_ATTEMPTS;

      const updateData = {
        failed_attempts: newFailedAttempts,
        last_attempt: now,
        is_locked: shouldLock,
        locked_until: shouldLock ? new Date(Date.now() + this.LOCKOUT_DURATION).toISOString() : null
      };

      const { error: updateError } = await supabase
        .from('login_attempts')
        .update(updateData)
        .eq('email', email);

      if (updateError) {
        console.error('Error actualizando intentos:', updateError);
      }

      if (shouldLock) {
        return { 
          isLocked: true, 
          remainingTime: Math.ceil(this.LOCKOUT_DURATION / (1000 * 60)), // minutos
          failedAttempts: newFailedAttempts
        };
      }

      return { 
        isLocked: false, 
        remainingAttempts: this.MAX_FAILED_ATTEMPTS - newFailedAttempts,
        failedAttempts: newFailedAttempts
      };

    } catch (error) {
      console.error('Error en recordFailedAttempt:', error);
      return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
    }
  },

  /**
   * Verificar si una cuenta está bloqueada
   * @param {string} email - Email del usuario
   * @returns {Object} - Estado del bloqueo
   */
  async checkAccountLock(email) {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code === 'PGRST116') {
        // No hay registro, cuenta no bloqueada
        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      // Si hay un error 406 o problema de permisos, intentar crear la tabla
      if (error && (error.code === 'PGRST406' || error.message?.includes('406'))) {
        console.warn('Tabla login_attempts no disponible en checkAccountLock, creando...', error);
        await this.ensureTableExists();
        // Retornar cuenta no bloqueada por defecto si la tabla no existe
        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      if (error) {
        console.error('Error verificando bloqueo:', error);
        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      if (!data.is_locked) {
        return { 
          isLocked: false, 
          remainingAttempts: this.MAX_FAILED_ATTEMPTS - data.failed_attempts 
        };
      }

      // Verificar si es un bloqueo indefinido (manual por admin)
      if (data.locked_until === null) {
        return { 
          isLocked: true, 
          remainingTime: null, // Indefinido
          isIndefinite: true,
          failedAttempts: data.failed_attempts 
        };
      }

      // Verificar si el bloqueo temporal ha expirado
      const lockExpiry = new Date(data.locked_until);
      const currentTime = new Date();

      if (currentTime >= lockExpiry) {
        // Bloqueo expirado, resetear
        await this.resetFailedAttempts(email);
        return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
      }

      // Aún bloqueado temporalmente
      const remainingTime = Math.ceil((lockExpiry - currentTime) / (1000 * 60)); // minutos
      return { 
        isLocked: true, 
        remainingTime: remainingTime,
        isIndefinite: false,
        failedAttempts: data.failed_attempts 
      };

    } catch (error) {
      console.error('Error en checkAccountLock:', error);
      return { isLocked: false, remainingAttempts: this.MAX_FAILED_ATTEMPTS };
    }
  },

  /**
   * Resetear intentos fallidos después de login exitoso
   * @param {string} email - Email del usuario
   */
  async resetFailedAttempts(email) {
    try {
      const { error } = await supabase
        .from('login_attempts')
        .update({
          failed_attempts: 0,
          is_locked: false,
          locked_until: null,
          last_successful_login: new Date().toISOString()
        })
        .eq('email', email);

      if (error) {
        // Si hay un error 406 o problema de permisos, intentar crear la tabla
        if (error.code === 'PGRST406' || error.message?.includes('406')) {
          console.warn('Tabla login_attempts no disponible en resetFailedAttempts, creando...', error);
          await this.ensureTableExists();
          return; // No es crítico si no se puede resetear
        }
        console.error('Error reseteando intentos:', error);
      }
    } catch (error) {
      console.error('Error en resetFailedAttempts:', error);
    }
  },

  /**
   * Crear la tabla de intentos de login si no existe
   */
  async initializeTable() {
    try {
      // Intentar crear la tabla (esto fallará si ya existe, pero es OK)
      const { error } = await supabase.rpc('create_login_attempts_table');
      
      if (error && !error.message.includes('already exists')) {
        console.error('Error creando tabla login_attempts:', error);
      }
    } catch (error) {
      console.log('Tabla login_attempts probablemente ya existe:', error.message);
    }
  },

  /**
   * FUNCIONES PARA ADMINISTRADORES
   */

  /**
   * Obtener información de bloqueo de un usuario específico (para admin)
   * @param {string} email - Email del usuario
   * @returns {Object} - Información detallada del bloqueo
   */
  async getAdminUserLockInfo(email) {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code === 'PGRST116') {
        // No hay registro, usuario sin intentos fallidos
        return { 
          hasRecord: false,
          isLocked: false, 
          failedAttempts: 0,
          remainingAttempts: this.MAX_FAILED_ATTEMPTS 
        };
      }

      if (error) {
        console.error('Error obteniendo info de bloqueo:', error);
        return { hasRecord: false, isLocked: false, failedAttempts: 0 };
      }

      if (!data.is_locked) {
        return { 
          hasRecord: true,
          isLocked: false, 
          failedAttempts: data.failed_attempts,
          remainingAttempts: this.MAX_FAILED_ATTEMPTS - data.failed_attempts,
          lastAttempt: data.last_attempt,
          lastSuccessfulLogin: data.last_successful_login
        };
      }

      // Verificar si el bloqueo ha expirado (solo si tiene fecha de expiración)
      if (data.locked_until) {
        const lockExpiry = new Date(data.locked_until);
        const currentTime = new Date();

        if (currentTime >= lockExpiry) {
          // Bloqueo expirado, actualizar automáticamente
          await this.resetFailedAttempts(email);
          return { 
            hasRecord: true,
            isLocked: false, 
            failedAttempts: 0,
            remainingAttempts: this.MAX_FAILED_ATTEMPTS,
            wasExpired: true
          };
        }

        // Aún bloqueado con tiempo restante
        const remainingTime = Math.ceil((lockExpiry - currentTime) / (1000 * 60)); // minutos
        return { 
          hasRecord: true,
          isLocked: true, 
          remainingTime: remainingTime,
          failedAttempts: data.failed_attempts,
          lockedSince: data.last_attempt,
          lockedUntil: data.locked_until,
          isIndefinite: false
        };
      } else {
        // Bloqueo indefinido (locked_until es null)
        return { 
          hasRecord: true,
          isLocked: true, 
          remainingTime: null,
          failedAttempts: data.failed_attempts,
          lockedSince: data.last_attempt,
          lockedUntil: null,
          isIndefinite: true
        };
      }

    } catch (error) {
      console.error('Error en getAdminUserLockInfo:', error);
      return { hasRecord: false, isLocked: false, failedAttempts: 0 };
    }
  },

  /**
   * Desbloquear una cuenta manualmente (solo admin)
   * @param {string} email - Email del usuario a desbloquear
   * @returns {boolean} - Éxito de la operación
   */
  async adminUnlockAccount(email) {
    try {
      const { error } = await supabase
        .from('login_attempts')
        .update({
          failed_attempts: 0,
          is_locked: false,
          locked_until: null,
          last_successful_login: new Date().toISOString(),
          admin_unlocked: true,
          admin_unlock_timestamp: new Date().toISOString()
        })
        .eq('email', email);

      if (error) {
        console.error('Error desbloqueando cuenta:', error);
        return false;
      }

      console.log(`✅ Cuenta ${email} desbloqueada por administrador`);
      return true;

    } catch (error) {
      console.error('Error en adminUnlockAccount:', error);
      return false;
    }
  },

  /**
   * Bloquear una cuenta manualmente (solo admin)
   * @param {string} email - Email del usuario a bloquear
   * @returns {boolean} - Éxito de la operación
   */
  async adminLockAccount(email) {
    try {
      // Primero intentar actualizar si existe
      const { data: existing } = await supabase
        .from('login_attempts')
        .select('email')
        .eq('email', email)
        .single();

      if (existing) {
        // Actualizar registro existente - sin locked_until para bloqueo indefinido
        const { error } = await supabase
          .from('login_attempts')
          .update({
            failed_attempts: this.MAX_FAILED_ATTEMPTS,
            is_locked: true,
            locked_until: null, // NULL = bloqueo indefinido
            last_attempt: new Date().toISOString(),
            admin_unlocked: false,
            admin_unlock_timestamp: null
          })
          .eq('email', email);

        if (error) {
          console.error('Error bloqueando cuenta (update):', error);
          return false;
        }
      } else {
        // Crear nuevo registro - sin locked_until para bloqueo indefinido
        const { error } = await supabase
          .from('login_attempts')
          .insert({
            email: email,
            failed_attempts: this.MAX_FAILED_ATTEMPTS,
            is_locked: true,
            locked_until: null, // NULL = bloqueo indefinido
            last_attempt: new Date().toISOString(),
            admin_unlocked: false,
            admin_unlock_timestamp: null
          });

        if (error) {
          console.error('Error bloqueando cuenta (insert):', error);
          return false;
        }
      }

      console.log(`🔒 Cuenta ${email} bloqueada indefinidamente por administrador`);
      return true;

    } catch (error) {
      console.error('Error en adminLockAccount:', error);
      return false;
    }
  },

  /**
   * Obtener lista de todos los usuarios con intentos fallidos (para admin)
   * @returns {Array} - Lista de usuarios con información de bloqueo
   */
  async getAdminAllBlockedUsers() {
    try {
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .or('is_locked.eq.true,failed_attempts.gt.0')
        .order('last_attempt', { ascending: false });

      if (error) {
        console.error('Error obteniendo usuarios bloqueados:', error);
        return [];
      }

      return data.map(record => {
        const currentTime = new Date();
        let isCurrentlyLocked = record.is_locked;
        let remainingTime = 0;
        let isIndefinite = false;

        // Verificar si el bloqueo ha expirado (solo si tiene fecha de expiración)
        if (record.is_locked && record.locked_until) {
          const lockExpiry = new Date(record.locked_until);
          if (currentTime >= lockExpiry) {
            isCurrentlyLocked = false;
          } else {
            remainingTime = Math.ceil((lockExpiry - currentTime) / (1000 * 60));
          }
        } else if (record.is_locked && !record.locked_until) {
          // Bloqueo indefinido
          isIndefinite = true;
        }

        return {
          email: record.email,
          failedAttempts: record.failed_attempts,
          isLocked: isCurrentlyLocked,
          remainingTime: remainingTime,
          isIndefinite: isIndefinite,
          lastAttempt: record.last_attempt,
          lastSuccessfulLogin: record.last_successful_login,
          lockedUntil: record.locked_until,
          adminUnlocked: record.admin_unlocked || false
        };
      });

    } catch (error) {
      console.error('Error en getAdminAllBlockedUsers:', error);
      return [];
    }
  }
};
