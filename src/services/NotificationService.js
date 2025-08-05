import { supabase } from '../supabaseClient';
import EmailService from './EmailService';

// 🚫 CONFIGURACIÓN DE EMAILS
const EMAIL_ENABLED = false; // Cambiar a true para reactivar emails

export const NotificationService = {
  // Crear una nueva notificación
  async createNotification({
    userId,
    adminId,
    type,
    title,
    message,
    routineId = null,
    sendEmail = true
  }) {
    try {
      console.log('📧 Creando notificación:', { userId, adminId, type, title, message, routineId });
      
      // Preparar el objeto de inserción base
      const insertData = {
        user_id: userId,
        type,
        title,
        message,
        routine_id: routineId
      };

      // Solo agregar admin_id si existe en la tabla
      if (adminId) {
        insertData.admin_id = adminId;
      }
      
      // Insertar notificación en la base de datos
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ Error creando notificación:', error);
        
        // Si el error es por admin_id, intentar sin esa columna
        if (error.message.includes('admin_id')) {
          console.log('🔄 Reintentando sin admin_id...');
          const fallbackData = {
            user_id: userId,
            type,
            title,
            message,
            routine_id: routineId
          };
          
          const { data: fallbackNotification, error: fallbackError } = await supabase
            .from('notifications')
            .insert([fallbackData])
            .select()
            .single();
            
          if (fallbackError) {
            throw fallbackError;
          }
          
          console.log('✅ Notificación creada (sin admin_id):', fallbackNotification);
          return { success: true, notification: fallbackNotification };
        }
        
        throw error;
      }

      console.log('✅ Notificación creada exitosamente:', notification);

      // Enviar email si está habilitado Y la configuración global permite emails
      if (sendEmail && EMAIL_ENABLED) {
        console.log('📧 Enviando email de notificación...');
        await this.sendEmailNotification(userId, title, message, routineId);
      } else if (sendEmail && !EMAIL_ENABLED) {
        console.log('🔇 Envío de email pausado (EMAIL_ENABLED = false)');
      }

      return { success: true, notification };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener notificaciones de un usuario
  async getUserNotifications(userId, limit = 20) {
    console.log('🔍 getUserNotifications llamado con userId:', userId, 'limit:', limit);
    try {
      // Consulta simple sin JOINs para evitar problemas de foreign keys
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      console.log('📊 Query resultado:', { data, error });

      if (error) {
        console.error('❌ Error en getUserNotifications:', error);
        throw error;
      }

      console.log('✅ Notificaciones obtenidas:', data?.length || 0, 'notificaciones');
      return { success: true, notifications: data };
    } catch (error) {
      console.error('💥 Exception en getUserNotifications:', error);
      return { success: false, error: error.message };
    }
  },

  // Marcar notificación como leída
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          read: true
        })
        .eq('id', notificationId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Marcar todas las notificaciones como leídas
  async markAllAsRead(userId) {
    console.log('📚 markAllAsRead llamado para userId:', userId);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          read: true
        })
        .eq('user_id', userId)
        .eq('read', false)
        .select(); // Agregamos select para ver qué se actualizó

      console.log('📊 markAllAsRead resultado:', { data, error });

      if (error) {
        console.error('❌ Error en markAllAsRead:', error);
        throw error;
      }

      console.log('✅ Notificaciones actualizadas:', data?.length || 0);
      return { success: true, updatedCount: data?.length || 0 };
    } catch (error) {
      console.error('💥 Exception en markAllAsRead:', error);
      return { success: false, error: error.message };
    }
  },

  // Obtener count de notificaciones no leídas
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { success: false, error: error.message };
    }
  },

  // Enviar notificación por email
  async sendEmailNotification(userId, title, message, routineId = null) {
    try {
      console.log('📧 Preparando envío de email...', { userId, title });

      // Obtener información del usuario desde la tabla usuarios (no users)
      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('email, full_name')
        .eq('client_id', userId)
        .single();

      if (userError) {
        console.error('❌ Error obteniendo usuario:', userError);
        // Intentar buscar por otros campos si no funciona client_id
        const { data: fallbackUser, error: fallbackError } = await supabase
          .from('usuarios')
          .select('email, full_name')
          .eq('id', userId)
          .single();
          
        if (fallbackError) {
          console.error('❌ Error obteniendo usuario (fallback):', fallbackError);
          return { success: false, error: 'Usuario no encontrado' };
        }
        
        if (!fallbackUser) {
          return { success: false, error: 'Usuario no encontrado' };
        }
        
        // Usar usuario de fallback
        user = fallbackUser;
      }

      if (!user?.email) {
        console.error('❌ Usuario sin email:', user);
        return { success: false, error: 'Usuario no tiene email configurado' };
      }

      // Enviar email usando EmailService
      const emailResult = await EmailService.sendNotificationEmail({
        to: user.email,
        subject: `DS Entrenamiento - ${title}`,
        title: title,
        message: message,
        userName: user.full_name || user.email.split('@')[0],
        routineId: routineId
      });

      if (!emailResult.success) {
        console.error('❌ Error enviando email:', emailResult.error);
        return emailResult;
      }

      // Marcar como enviado en la base de datos
      await supabase
        .from('notifications')
        .update({ 
          sent_email: true, 
          email_sent_at: new Date().toISOString() 
        })
        .eq('user_id', userId)
        .eq('sent_email', false);

      console.log('✅ Email enviado exitosamente a:', user.email);
      return { success: true, emailData: emailResult.data };

    } catch (error) {
      console.error('💥 Error inesperado enviando email:', error);
      return { success: false, error: error.message };
    }
  },

  // Notificaciones específicas para rutinas
  async notifyRoutineCreated(userId, adminId, routineName, routineId) {
    return await this.createNotification({
      userId,
      adminId,
      type: 'routine_created',
      title: '🎯 Nueva rutina creada',
      message: `Se ha creado una nueva rutina para ti: "${routineName}". ¡Revisa los ejercicios y comienza tu entrenamiento!`,
      routineId
    });
  },

  async notifyRoutineAssigned(userId, adminId, routineName, routineId) {
    return await this.createNotification({
      userId,
      adminId,
      type: 'routine_assigned',
      title: '📋 Rutina asignada',
      message: `Te han asignado la rutina: "${routineName}". ¡Prepárate para entrenar!`,
      routineId
    });
  },

  async notifyRoutineUpdated(userId, adminId, routineName, routineId) {
    return await this.createNotification({
      userId,
      adminId,
      type: 'routine_updated',
      title: '🔄 Rutina actualizada',
      message: `La rutina "${routineName}" ha sido actualizada. Revisa los cambios antes de tu próximo entrenamiento.`,
      routineId
    });
  },

  // Notificación para admins sobre rutinas próximas a vencer
  async notifyAdminRoutineExpiring(adminId, clientName, routineName, routineId, daysRemaining) {
    return await this.createNotification({
      userId: adminId,
      adminId,
      type: 'routine_expiring',
      title: '⏰ Rutina próxima a vencer',
      message: `La rutina "${routineName}" del cliente ${clientName} vence en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}. Es momento de planificar la siguiente rutina.`,
      routineId,
      sendEmail: false // Para admins, generalmente no enviamos email por este tipo de recordatorios
    });
  },

  // Verificar rutinas próximas a vencer y notificar a admins
  async checkExpiringRoutines() {
    try {
      console.log('🔍 Verificando rutinas próximas a vencer...');

      // Obtener todas las rutinas activas
      const { data: routines, error: routinesError } = await supabase
        .from('rutinas')
        .select(`
          id,
          name,
          endDate,
          client_id,
          usuarios!inner(email, full_name)
        `)
        .not('endDate', 'is', null);

      if (routinesError) {
        console.error('Error obteniendo rutinas:', routinesError);
        return { success: false, error: routinesError.message };
      }

      if (!routines || routines.length === 0) {
        console.log('No hay rutinas para verificar');
        return { success: true, checked: 0, notifications: 0 };
      }

      const today = new Date();
      const warningDays = [7, 3, 1]; // Avisar con 7, 3 y 1 día de anticipación
      let notificationsSent = 0;

      // Obtener todos los admins
      const { data: admins, error: adminsError } = await supabase
        .from('usuarios')
        .select('client_id, email, full_name')
        .eq('role', 'admin');

      if (adminsError || !admins || admins.length === 0) {
        console.error('Error obteniendo admins o no hay admins:', adminsError);
        return { success: false, error: 'No se encontraron administradores' };
      }

      for (const routine of routines) {
        const endDate = new Date(routine.endDate);
        const timeDiff = endDate.getTime() - today.getTime();
        const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // Solo notificar si está en los días de advertencia y no ha pasado la fecha
        if (warningDays.includes(daysRemaining) && daysRemaining >= 0) {
          console.log(`⚠️ Rutina "${routine.name}" vence en ${daysRemaining} días`);

          // Verificar si ya se envió notificación para esta rutina y este número de días
          const notificationKey = `routine_expiring_${routine.id}_${daysRemaining}days`;
          
          const { data: existingNotifications } = await supabase
            .from('notifications')
            .select('id')
            .eq('routine_id', routine.id)
            .eq('type', 'routine_expiring')
            .like('message', `%${daysRemaining} día%`)
            .gte('created_at', new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString()); // En las últimas 24 horas

          if (existingNotifications && existingNotifications.length > 0) {
            console.log(`Ya se notificó sobre esta rutina para ${daysRemaining} días`);
            continue;
          }

          // Enviar notificación a todos los admins
          for (const admin of admins) {
            try {
              const clientName = routine.usuarios?.full_name || routine.usuarios?.email || 'Cliente desconocido';
              
              // Crear notificación en la app
              await this.notifyAdminRoutineExpiring(
                admin.client_id,
                clientName,
                routine.name,
                routine.id,
                daysRemaining
              );

              // Enviar email al admin sobre rutina próxima a vencer (solo si está habilitado)
              if (admin.email && EMAIL_ENABLED) {
                console.log('📧 Enviando email sobre rutina próxima a vencer...');
                const emailResult = await EmailService.sendRoutineExpiringEmail({
                  to: admin.email,
                  adminName: admin.full_name || admin.email.split('@')[0],
                  clientName: clientName,
                  routineName: routine.name,
                  daysRemaining: daysRemaining
                });

                if (emailResult.success) {
                  console.log(`📧 Email enviado al admin ${admin.email}`);
                } else {
                  console.error(`❌ Error enviando email al admin ${admin.email}:`, emailResult.error);
                }
              } else if (admin.email && !EMAIL_ENABLED) {
                console.log('🔇 Envío de email de rutina próxima a vencer pausado (EMAIL_ENABLED = false)');
              }

              notificationsSent++;
              console.log(`✅ Notificación enviada al admin ${admin.email}`);
            } catch (notificationError) {
              console.error(`Error enviando notificación al admin ${admin.email}:`, notificationError);
            }
          }
        }
      }

      console.log(`✅ Verificación completada. ${notificationsSent} notificaciones enviadas`);
      return { 
        success: true, 
        checked: routines.length, 
        notifications: notificationsSent 
      };

    } catch (error) {
      console.error('Error en checkExpiringRoutines:', error);
      return { success: false, error: error.message };
    }
  },

  // Función para programar verificaciones automáticas
  async startRoutineExpirationChecker() {
    console.log('🚀 Iniciando verificador automático de rutinas próximas a vencer...');
    
    // Verificar inmediatamente
    await this.checkExpiringRoutines();
    
    // Programar verificaciones cada 6 horas
    const checkInterval = setInterval(async () => {
      await this.checkExpiringRoutines();
    }, 6 * 60 * 60 * 1000); // 6 horas en milisegundos

    console.log('⏰ Verificador programado para ejecutarse cada 6 horas');
    return checkInterval;
  },

  // Función para verificar el estado de los emails
  getEmailStatus() {
    return {
      enabled: EMAIL_ENABLED,
      message: EMAIL_ENABLED ? 'Emails habilitados' : 'Emails pausados - solo notificaciones en app'
    };
  },

  // Eliminar una notificación
  async deleteNotification(notificationId) {
    try {
      console.log('🗑️ Eliminando notificación:', notificationId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('❌ Error eliminando notificación:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Notificación eliminada exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
      return { success: false, error: error.message };
    }
  },

  // Eliminar todas las notificaciones de un usuario
  async deleteAllNotifications(userId) {
    try {
      console.log('🗑️ Eliminando todas las notificaciones del usuario:', userId);
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('❌ Error eliminando todas las notificaciones:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Todas las notificaciones eliminadas exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error eliminando todas las notificaciones:', error);
      return { success: false, error: error.message };
    }
  }
};

export default NotificationService;
