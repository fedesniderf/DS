import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';

import LayoutHeader from './components/LayoutHeader';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { supabase } from './supabaseClient';
import AdminHomeScreen from './components/AdminHomeScreen';
import RoutineTemplatesScreen from './components/RoutineTemplatesScreen';
import { NotificationService } from './services/NotificationService';
import { NotificationProvider } from './hooks/useNotifications';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { LoginSecurityService } from './services/LoginSecurityService';

const ClientRoutineList = lazy(() => import('./components/ClientRoutineList'));
const RoutineDetail = lazy(() => import('./components/RoutineDetail'));
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const RegisterScreen = lazy(() => import('./components/RegisterScreen'));
const AddExerciseScreen = lazy(() => import('./components/AddExerciseScreen'));
const UserManagementScreen = lazy(() => import('./components/UserManagementScreen'));
const ClientDashboardAdmin = lazy(() => import('./components/ClientDashboardAdmin'));

const App = () => {
  // Eliminar usuario
  const handleDeleteUser = useCallback(async (clientId) => {
    // Eliminar de Supabase
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('client_id', clientId);
    if (error) {
      alert('Error al eliminar el usuario: ' + error.message);
      return;
    }
    // Eliminar del estado local
    setUsers(prevUsers => prevUsers.filter(u => u.client_id !== clientId));
  }, []);

  // Restaurar usuario desde localStorage si existe
  const [currentPage, setCurrentPage] = useState('auth');
  const [showTemplatesScreen, setShowTemplatesScreen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Función wrapper para setCurrentUser con logs
  const updateCurrentUser = (newUser) => {
    console.log('🔄 App.js - updateCurrentUser: Usuario actualizado');
    console.log('📸 App.js - Foto actualizada:', newUser?.profilePhoto ? 'SÍ' : 'NO');
    setCurrentUser(newUser);
  };
  const [users, setUsers] = useState([]);
  const [clientRoutines, setClientRoutines] = useState([]);
  const [showUserLoading, setShowUserLoading] = useState(false);
  const [showLoginLoading, setShowLoginLoading] = useState(false);
  const [loadingClientRoutines, setLoadingClientRoutines] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isRestored, setIsRestored] = useState(true);

  // LOGOUT - Definido temprano para uso en hooks
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSelectedClient(null);
    setSelectedRoutine(null);
    setCurrentPage('auth');
    localStorage.removeItem('ds_user');
    localStorage.removeItem('ds_page');
    localStorage.removeItem('ds_selectedClient');
    localStorage.removeItem('ds_selectedRoutine');
  }, []);

  // Hook para manejo de inactividad (auto-logout después de 2 horas)
  const handleInactivityLogout = useCallback(() => {
    console.log('🔒 Sesión cerrada por inactividad');
    handleLogout();
  }, [handleLogout]);

  const { resetInactivityTimer } = useInactivityTimeout(
    2 * 60 * 60 * 1000, // 2 horas
    handleInactivityLogout,
    !!currentUser // Solo activo cuando hay usuario logueado
  );

  // Inicializar servicio de seguridad de login
  useEffect(() => {
    LoginSecurityService.initializeTable();
  }, []);

  // Restaurar todo el estado desde localStorage al inicio
  useEffect(() => {
    const savedUser = localStorage.getItem('ds_user');
    const savedPage = localStorage.getItem('ds_page');
    const savedClient = localStorage.getItem('ds_selectedClient');
    const savedRoutine = localStorage.getItem('ds_selectedRoutine');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      if (savedClient) {
        setSelectedClient(JSON.parse(savedClient));
      } else if (user.role === 'client') {
        setSelectedClient(user);
      }
      if (savedRoutine) {
        setSelectedRoutine(JSON.parse(savedRoutine));
      }
      if (savedPage) setCurrentPage(savedPage);
    }
    setIsRestored(true);
  }, []);

  // Inicializar verificador automático de rutinas próximas a vencer
  useEffect(() => {
    let checkInterval = null;

    if (currentUser?.role === 'admin') {
      console.log('🚀 Iniciando verificador automático de rutinas para admin...');
      
      // Verificar inmediatamente
      NotificationService.checkExpiringRoutines()
        .then(result => {
          if (result.success) {
            console.log(`✅ Verificación inicial completada: ${result.checked} rutinas revisadas, ${result.notifications} notificaciones enviadas`);
          } else {
            console.error('❌ Error en verificación inicial:', result.error);
          }
        })
        .catch(error => {
          console.error('💥 Error inesperado en verificación inicial:', error);
        });

      // Programar verificaciones cada 6 horas
      checkInterval = setInterval(async () => {
        try {
          console.log('🔄 Ejecutando verificación programada de rutinas...');
          const result = await NotificationService.checkExpiringRoutines();
          if (result.success) {
            console.log(`✅ Verificación programada completada: ${result.notifications} notificaciones enviadas`);
          }
        } catch (error) {
          console.error('💥 Error en verificación programada:', error);
        }
      }, 6 * 60 * 60 * 1000); // 6 horas

      console.log('⏰ Verificador programado para ejecutarse cada 6 horas');
    }

    // Cleanup: detener el intervalo cuando el componente se desmonte o el usuario cambie
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
        console.log('🛑 Verificador automático detenido');
      }
    };
  }, [currentUser?.role]); // Solo ejecutar cuando cambie el rol del usuario

  // LOGIN
  const handleLogin = useCallback(async (email, password, method) => {
    setShowLoginLoading(true);
    
    if (method === 'email') {
      try {
        // 1. Verificar si la cuenta está bloqueada
        const lockStatus = await LoginSecurityService.checkAccountLock(email);
        
        if (lockStatus.isLocked) {
          setShowLoginLoading(false);
          const message = lockStatus.isIndefinite 
            ? `🔒 Cuenta bloqueada por un administrador.\n\nEsta cuenta ha sido bloqueada indefinidamente.\n\nContacta al administrador para desbloquearla.`
            : `🔒 Cuenta bloqueada por múltiples intentos fallidos.\n\nTiempo restante: ${lockStatus.remainingTime} minutos.\n\nIntenta de nuevo más tarde.`;
          alert(message);
          return;
        }

        // 2. Intentar login
        const { data: users, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('email', email)
          .eq('password', password);

        setShowLoginLoading(false);
        
        if (error) {
          alert('Error consultando usuario en Supabase.');
          return;
        }

        if (users && users.length > 0) {
          // LOGIN EXITOSO
          const user = users[0];
          
          // Resetear intentos fallidos
          await LoginSecurityService.resetFailedAttempts(email);
          
          // Resetear timer de inactividad
          resetInactivityTimer();
          
          // Establecer usuario
          setCurrentUser(user);
          localStorage.setItem('ds_user', JSON.stringify(user));
          
          if (user.role === 'client') {
            setSelectedClient(user);
            setCurrentPage('clientDashboard');
          } else if (user.role === 'admin') {
            setCurrentPage('adminHome');
          }
        } else {
          // LOGIN FALLIDO
          const failureStatus = await LoginSecurityService.recordFailedAttempt(email);
          
          if (failureStatus.isLocked) {
            alert(`🔒 Demasiados intentos fallidos.\n\nCuenta bloqueada por ${failureStatus.remainingTime} minutos.\n\nIntenta de nuevo más tarde.`);
          } else {
            const remainingAttempts = failureStatus.remainingAttempts || 0;
            if (remainingAttempts <= 3) {
              alert(`❌ Credenciales incorrectas.\n\n⚠️ Te quedan ${remainingAttempts} intentos antes del bloqueo.`);
            } else {
              alert('❌ Credenciales incorrectas.');
            }
          }
        }
        
      } catch (error) {
        setShowLoginLoading(false);
        console.error('Error durante el login:', error);
        alert('Error durante el proceso de login.');
      }
    } else if (method === 'google') {
      setShowLoginLoading(false);
      alert('Login con Google no implementado.');
    }
  }, [resetInactivityTimer]);

  // REGISTRO
  const handleRegister = useCallback(async (userData) => {
    const { data: existingUsers, error: fetchError } = await supabase
      .from('usuarios')
      .select('email')
      .eq('email', userData.email);

    if (fetchError) {
      alert('Error consultando usuarios en Supabase.');
      return;
    }

    if (existingUsers && existingUsers.length > 0) {
      alert('Este email ya está registrado.');
      return;
    }

    // Procesar foto de perfil si existe
    let profilePhotoBase64 = null;
    if (userData.profilePhoto) {
      try {
        profilePhotoBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(userData.profilePhoto);
        });
      } catch (error) {
        console.error('Error procesando la foto:', error);
        alert('Error procesando la foto de perfil.');
        return;
      }
    }

    const { error } = await supabase
      .from('usuarios')
      .insert([{
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        goals: userData.goals,
        phone: userData.phone,
        medicalConditions: userData.medicalConditions,
        profilePhoto: profilePhotoBase64,
        role: 'client'
      }]);

    if (error) {
      alert('Error guardando usuario en Supabase: ' + error.message);
      return;
    }

    alert('Registro exitoso. Por favor, inicia sesión.');
    setCurrentPage('auth');
  }, []);

  // Solo cambiar la pantalla si no hay una restaurada
  useEffect(() => {
    if (!isRestored) return;
    if (currentUser) {
      if (!localStorage.getItem('ds_page')) {
        if (currentUser.role === 'client') {
          setSelectedClient(currentUser);
          setCurrentPage('clientDashboard');
        } else if (currentUser.role === 'admin') {
          setCurrentPage('adminHome');
        }
      }
    }
  }, [currentUser, isRestored]);

  // Efecto para sincronizar selectedClient con currentUser cuando este se actualiza
  useEffect(() => {
    console.log('🔄 App.js - useEffect: currentUser cambió');
    
    if (currentUser?.role === 'client') {
      console.log('📱 App.js - Actualizando selectedClient (cliente)');
      // Para clientes, selectedClient debe ser siempre igual a currentUser
      const newSelectedClient = { ...currentUser };
      setSelectedClient(newSelectedClient);
    } else if (currentUser?.role === 'admin' && selectedClient?.client_id === currentUser?.client_id) {
      console.log('👔 App.js - Actualizando selectedClient (admin viendo su propio perfil)');
      // Si el admin está viendo su propio perfil y se actualiza, sincronizar
      const newSelectedClient = { ...currentUser };
      setSelectedClient(newSelectedClient);
    } else {
      console.log('⏭️ App.js - No actualizando selectedClient');
    }
  }, [currentUser]);

  // ...existing code...

  // Handlers para navegación desde AdminHomeScreen
  const handleGoToClientes = () => {
    setLoadingUsers(false); // Resetear estado de loading
    setCurrentPage('userManagement');
  };
  const handleGoToTemplates = () => setCurrentPage('routineTemplates');
  // ...existing code...
  // ...existing code...
  // ...existing code...
  // ...existing code...
  // Loader mientras se restaura el estado (debe ir después de todos los hooks y callbacks, justo antes del return principal)
  // ...existing code...

  // SELECCIONAR CLIENTE Y RUTINA
  const handleSelectClient = useCallback((client) => {
    resetInactivityTimer(); // Usuario está navegando activamente
    setSelectedClient(client);
    setCurrentPage('routines');
  }, [resetInactivityTimer]);

  const handleSelectRoutine = useCallback((routine) => {
    resetInactivityTimer(); // Usuario está navegando activamente
    setSelectedRoutine(routine);
    setCurrentPage('routineDetail');
  }, [resetInactivityTimer]);

  // ATRÁS
  const handleBack = useCallback(() => {
    if (currentPage === 'routineDetail') {
      if (currentUser && currentUser.role === 'client') {
        setCurrentPage('clientDashboard');
      } else if (currentUser && currentUser.role === 'admin' && selectedClient) {
        setCurrentPage('adminViewClientRoutines');
      } else {
        setCurrentPage('routines');
      }
      setSelectedRoutine(null);
    } else if (currentPage === 'routines') {
      if (currentUser && currentUser.role === 'client') {
        setCurrentPage('clientDashboard');
      } else {
        setCurrentPage('userManagement');
        setSelectedClient(null);
      }
    } else if (currentPage === 'adminViewClientRoutines') {
      setCurrentPage('userManagement');
      setSelectedClient(null);
    } else if (currentPage === 'clientDashboard') {
      handleLogout();
    } else if (currentPage === 'addExercise') {
      setCurrentPage('routineDetail');
    } else if (currentPage === 'userManagement') {
      setCurrentPage('adminHome');
    } else if (currentPage === 'routineTemplates') {
      setCurrentPage('adminHome');
    } else if (currentPage === 'adminClientDashboard') {
      handleLogout();
    }
  }, [currentPage, currentUser, handleLogout, selectedClient]);

  // Loader mientras se restaura el estado (debe ir después de todos los hooks y callbacks, justo antes del return principal)
  // ...existing code...

  // CARGAR USUARIOS DESDE SUPABASE
  useEffect(() => {
    async function fetchUsers() {
      if (currentPage === 'userManagement') {
        setLoadingUsers(true);
        setUsers([]); // Limpiar usuarios anteriores inmediatamente
      }
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      if (!error) {
        setUsers(data);
      }
      
      if (currentPage === 'userManagement') {
        setLoadingUsers(false);
      }
    }
    if (
      currentUser &&
      currentUser.role === 'admin' &&
      (currentPage === 'adminClientDashboard' || currentPage === 'userManagement')
    ) {
      fetchUsers();
    }
  }, [currentUser, currentPage]);

  // CARGAR RUTINAS DEL CLIENTE SELECCIONADO DESDE SUPABASE
  useEffect(() => {
    async function fetchRoutines() {
      console.log('fetchRoutines - currentUser:', currentUser);
      console.log('fetchRoutines - selectedClient:', selectedClient);
      
      // Solo cargar si estamos en la página de rutinas del cliente
      if (currentPage === 'adminViewClientRoutines' && selectedClient) {
        setLoadingClientRoutines(true);
        setClientRoutines([]); // Limpiar rutinas anteriores inmediatamente
        
        // Rutinas del cliente seleccionado
        const { data, error } = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', selectedClient.client_id);
        console.log('fetchRoutines - rutinas (cliente seleccionado):', data, 'error:', error);
        if (!error) {
          setClientRoutines(data);
        }
        setLoadingClientRoutines(false);
      } else if (currentUser?.role === 'admin' && !selectedClient) {
        // Admin: ver todas las rutinas
        const { data, error } = await supabase
          .from('rutinas')
          .select('*');
        console.log('fetchRoutines - rutinas (admin, todas):', data);
        if (!error) setClientRoutines(data);
      } else if (currentUser?.role === 'client') {
        // Cliente: ver solo sus rutinas
        const { data, error } = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', currentUser.client_id);
        console.log('fetchRoutines - rutinas (cliente):', data);
        if (!error) setClientRoutines(data);
      } else {
        setClientRoutines([]);
      }
    }
    fetchRoutines();
  }, [currentUser, selectedClient, currentPage]);

  // HEADER
  const getHeaderTitle = useCallback(() => {
    return 'DS Entrenamiento';
  }, [currentPage, currentUser, selectedClient, selectedRoutine]);

  // AGREGAR RUTINA
  const handleAddRoutine = async (routine) => {
    const { data: newRoutine, error } = await supabase
      .from('rutinas')
      .insert([{
        client_id: routine.client_id,
        name: routine.name,
        startDate: routine.startDate,
        endDate: routine.endDate,
      }])
      .select()
      .single();
      
    if (error) {
      alert('Error al crear la rutina: ' + error.message);
      return;
    }

    // Enviar notificación al cliente
    if (newRoutine && routine.client_id) {
      try {
        console.log('🔔 Enviando notificación de rutina creada...');
        await NotificationService.notifyRoutineCreated(
          routine.client_id,
          currentUser?.id || currentUser?.client_id,
          newRoutine.name,
          newRoutine.id
        );
      } catch (notifError) {
        console.error('Error enviando notificación:', notifError);
        // No bloqueamos la creación de rutina por error de notificación
      }
    }

    // Recarga las rutinas según el contexto
    if (currentUser?.role === 'admin' && !selectedClient) {
      // Admin viendo todas las rutinas
      const { data } = await supabase.from('rutinas').select('*');
      setClientRoutines(data || []);
    } else if (selectedClient && selectedClient.client_id) {
      // Admin o cliente viendo un cliente específico
      const { data } = await supabase
        .from('rutinas')
        .select('*')
        .eq('client_id', selectedClient.client_id);
      setClientRoutines(data || []);
    } else if (currentUser?.role === 'client') {
      // Cliente viendo sus propias rutinas
      const { data } = await supabase
        .from('rutinas')
        .select('*')
        .eq('client_id', currentUser.client_id);
      setClientRoutines(data || []);
    }
  };

  // ASIGNAR RUTINA DESDE TEMPLATE
  const handleAssignRoutineFromTemplate = async (templateId, clientId) => {
    console.log('🚀 handleAssignRoutineFromTemplate iniciado con:', { 
      templateId, 
      clientId,
      'currentUser completo': currentUser,
      'currentUser.id': currentUser?.id,
      'currentUser.client_id': currentUser?.client_id,
      'adminId que se usará': currentUser?.id || currentUser?.client_id
    });
    
    try {
      // Obtener el template
      const { data: template, error: templateError } = await supabase
        .from('rutinas_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError || !template) {
        alert('Error al obtener el template: ' + (templateError?.message || 'Template no encontrado'));
        return;
      }

      // Crear nueva rutina basada en el template
      const newRoutine = {
        client_id: clientId,
        name: template.name,
        description: template.description,
        startDate: template.startDate,
        endDate: template.endDate,
        exercises: template.exercises || []
      };

      const { data: createdRoutine, error: routineError } = await supabase
        .from('rutinas')
        .insert([newRoutine])
        .select()
        .single();

      if (routineError) {
        alert('Error al crear la rutina: ' + routineError.message);
        return;
      }

      // Enviar notificación al cliente
      if (createdRoutine && clientId) {
        try {
          console.log('🔔 Enviando notificación de rutina asignada...');
          console.log('📊 Datos para notificación:', {
            clientId,
            adminId: currentUser?.id || currentUser?.client_id,
            routineName: createdRoutine.name,
            routineId: createdRoutine.id,
            currentUser
          });
          
          const notificationResult = await NotificationService.notifyRoutineAssigned(
            clientId,
            currentUser?.id || currentUser?.client_id,
            createdRoutine.name,
            createdRoutine.id
          );
          
          console.log('📧 Resultado de notificación:', notificationResult);
        } catch (notifError) {
          console.error('❌ Error enviando notificación:', notifError);
          // No bloqueamos la asignación por error de notificación
        }
      } else {
        console.log('⚠️ No se envió notificación:', { 
          createdRoutine: !!createdRoutine, 
          clientId: !!clientId 
        });
      }

      alert('Rutina asignada exitosamente al cliente');
      
      // Recargar rutinas si es necesario
      if (currentUser?.role === 'admin' && selectedClient && selectedClient.client_id === clientId) {
        const { data } = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', clientId);
        setClientRoutines(data || []);
      }

    } catch (error) {
      console.error('Error en handleAssignRoutineFromTemplate:', error);
      alert('Error inesperado al asignar la rutina');
    }
  };

  // ELIMINAR RUTINA
  const handleDeleteRoutine = async (routine) => {
    await handleUpdateRoutine({
      id: routine.id,
      action: 'deleteRoutine'
    });
  };

  // CAMBIO DE ROL
  const handleRoleChange = async (user, newRole) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ role: newRole })
      .eq('client_id', user.client_id);
    if (error) {
      alert('Error actualizando rol: ' + error.message);
      return;
    }
    // Recarga usuarios
    const { data } = await supabase.from('usuarios').select('*');
    setUsers(data);
  };

  // ACTUALIZAR RUTINA
  const handleUpdateRoutine = async (updatedRoutine) => {
    // Resetear timer de inactividad para operaciones importantes
    resetInactivityTimer();
    
    // Manejador universal para acciones desde RoutineDetail
    const { id, action, data } = updatedRoutine;

    // Soporte para actualizar el orden de secciones globalmente
    if (action === 'updateSectionOrder') {
      if (!data || typeof data.sectionOrderByDay !== 'object') {
        alert('No se recibió el objeto sectionOrderByDay.');
        return;
      }
      const { error: updateError } = await supabase
        .from('rutinas')
        .update({ sectionOrderByDay: data.sectionOrderByDay })
        .eq('id', id);
      if (updateError) {
        alert('Error al actualizar el orden de secciones: ' + updateError.message);
        return;
      }
      // Refresca la rutina seleccionada desde la base de datos
      const { data: refreshedRoutine, error: fetchRoutineError } = await supabase
        .from('rutinas')
        .select('*')
        .eq('id', id)
        .single();
      if (!fetchRoutineError && refreshedRoutine) {
        setSelectedRoutine(refreshedRoutine);
      }
      return;
    }
    if (!id) {
      alert('No se encontró el ID de la rutina.');
      return;
    }

    if (action === 'updateDailyTracking') {
      // Actualizar el campo dailyTracking directamente
      let updateObj = { dailyTracking: data.dailyTracking };
      const { error: updateError } = await supabase
        .from('rutinas')
        .update(updateObj)
        .eq('id', id);
      if (updateError) {
        alert('Error al actualizar la rutina: ' + updateError.message);
        return;
      }
      // Refresca la rutina seleccionada desde la base de datos
      const { data: refreshedRoutine, error: fetchRoutineError } = await supabase
        .from('rutinas')
        .select('*')
        .eq('id', id)
        .single();
      if (!fetchRoutineError && refreshedRoutine) {
        setSelectedRoutine(refreshedRoutine);
      }
      return;
    }

    if (action === 'deleteRoutine') {
      // Eliminar rutina
      const { data: deletedData, error: deleteError } = await supabase
        .from('rutinas')
        .delete()
        .eq('id', id);
      if (deleteError) {
        alert('Error al eliminar la rutina: ' + deleteError.message);
        return;
      }
      // Recargar rutinas y limpiar selección
      let routinesData = [];
      if (currentUser?.role === 'admin' && selectedClient && selectedClient.client_id) {
        // Admin viendo rutinas de un usuario específico
        const res = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', selectedClient.client_id);
        routinesData = res.data || [];
        setClientRoutines(routinesData);
        setSelectedRoutine(null);
        setCurrentPage('adminViewClientRoutines');
      } else if (currentUser?.role === 'admin' && !selectedClient) {
        // Admin viendo todas las rutinas
        const res = await supabase.from('rutinas').select('*');
        routinesData = res.data || [];
        setClientRoutines(routinesData);
        setSelectedRoutine(null);
        setCurrentPage('routines');
      } else if (currentUser?.role === 'client') {
        // Cliente viendo sus propias rutinas
        const res = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', currentUser.client_id);
        routinesData = res.data || [];
        setClientRoutines(routinesData);
        setSelectedRoutine(null);
        setCurrentPage('clientDashboard');
      } else {
        setClientRoutines([]);
        setSelectedRoutine(null);
        setCurrentPage('routines');
      }
      return;
    }

    let updateObj = {};
    // Si viene una acción específica
    if (action === 'editExercise') {
      // Editar ejercicio en el array
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      const idx = exercises.findIndex(e => e.id === data.id);
      if (idx !== -1) {
        exercises[idx] = data;
      }
      updateObj.exercises = exercises;
    } else if (action === 'addDailyTracking') {
      // Agregar seguimiento diario de ejercicios (datos antiguos)
      const dailyTracking = { ...selectedRoutine.dailyTracking };
      const { date, PF, PE } = data;
      if (!dailyTracking[date]) dailyTracking[date] = [];
      dailyTracking[date].push({ PF, PE });
      updateObj.dailyTracking = dailyTracking;
    } else if (action === 'addWeeklyTracking') {
      // Agregar seguimiento semanal
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      const exerciseIndex = exercises.findIndex(ex => ex.id === data.exerciseId);
      
      if (exerciseIndex !== -1) {
        const exercise = exercises[exerciseIndex];
        const weeklyData = exercise.weeklyData || {};
        weeklyData[data.weeklyData.week] = data.weeklyData;
        exercises[exerciseIndex] = { ...exercise, weeklyData };
        updateObj.exercises = exercises;
      }
    } else if (action === 'updateWeeklyTracking') {
      // Actualizar seguimiento semanal existente
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      const exerciseIndex = exercises.findIndex(ex => ex.id === data.exerciseId);
      
      if (exerciseIndex !== -1) {
        const exercise = exercises[exerciseIndex];
        const weeklyData = exercise.weeklyData || {};
        weeklyData[data.weeklyData.week] = data.weeklyData;
        exercises[exerciseIndex] = { ...exercise, weeklyData };
        updateObj.exercises = exercises;
      }
    } else if (action === 'deleteWeeklyTracking') {
      // Eliminar seguimiento semanal
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      const exerciseIndex = exercises.findIndex(ex => ex.id === data.exerciseId);
      
      if (exerciseIndex !== -1) {
        const exercise = exercises[exerciseIndex];
        const weeklyData = exercise.weeklyData || {};
        delete weeklyData[data.week];
        exercises[exerciseIndex] = { ...exercise, weeklyData };
        updateObj.exercises = exercises;
      }
    } else if (action === 'updateRoutineInfo') {
      // Actualizar información básica de la rutina
      updateObj = {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description
      };
    } else if (action === 'addDailyRoutineTracking') {
      // Agregar seguimiento diario de rutina
      const dailyTracking = { ...selectedRoutine.dailyTracking };
      // Guardar bajo la fecha
      dailyTracking[data.date] = {
        pf: data.pf,
        pe: data.pe,
        timestamp: data.timestamp
      };
      // Guardar bajo el nombre de día si viene extraDayKey
      if (data.extraDayKey) {
        dailyTracking[data.extraDayKey] = {
          pf: data.pf,
          pe: data.pe,
          timestamp: data.timestamp
        };
      }
      updateObj.dailyTracking = dailyTracking;
    } else if (action === 'updateDailyRoutineTracking') {
      // Actualizar seguimiento diario de rutina
      const dailyTracking = { ...selectedRoutine.dailyTracking };
      if (data.originalDate && data.originalDate !== data.date) {
        // Si la fecha cambió, eliminar el registro anterior
        delete dailyTracking[data.originalDate];
      }
      dailyTracking[data.date] = {
        pf: data.pf,
        pe: data.pe,
        timestamp: data.timestamp
      };
      // Guardar bajo el nombre de día si viene extraDayKey
      if (data.extraDayKey) {
        dailyTracking[data.extraDayKey] = {
          pf: data.pf,
          pe: data.pe,
          timestamp: data.timestamp
        };
      }
      updateObj.dailyTracking = dailyTracking;
    } else if (action === 'deleteDailyRoutineTracking') {
      // Eliminar seguimiento diario de rutina
      const dailyTracking = { ...selectedRoutine.dailyTracking };
      delete dailyTracking[data.date];
      updateObj.dailyTracking = dailyTracking;
    } else if (action === 'deleteExercise') {
      // Eliminar ejercicio individual
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      const filteredExercises = exercises.filter(ex => ex.id !== data.exerciseId);
      updateObj.exercises = filteredExercises;
    } else if (action === 'deleteDay') {
      // Eliminar todos los ejercicios de un día específico
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      const filteredExercises = exercises.filter(ex => ex.day !== data.day);
      updateObj = { exercises: filteredExercises };
    } else if (action === 'deleteSection') {
      // Eliminar todos los ejercicios de una sección específica de un día
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      const filteredExercises = exercises.filter(ex => !(ex.day === data.day && ex.section === data.section));
      updateObj = { exercises: filteredExercises };
    } else {
      // Actualización general de rutina
      // Si viene dailyTracking y es un objeto, permite múltiples registros por día diferenciados por semana
      if (updatedRoutine.dailyTracking) {
        const newTracking = { ...selectedRoutine.dailyTracking };
        Object.entries(updatedRoutine.dailyTracking).forEach(([dayKey, value]) => {
          // Si el valor es un array, lo dejamos igual
          if (Array.isArray(value)) {
            newTracking[dayKey] = value;
          } else if (value && value.PFPE) {
            // Si ya hay registros previos para ese día, agregamos solo si la semana es diferente
            const prev = newTracking[dayKey];
            if (Array.isArray(prev)) {
              // Filtrar para no duplicar semana
              const exists = prev.some(r => r.PFPE?.week === value.PFPE.week);
              if (!exists) {
                newTracking[dayKey] = [...prev, value];
              } else {
                // Reemplazar el registro de esa semana
                newTracking[dayKey] = prev.map(r => r.PFPE?.week === value.PFPE.week ? value : r);
              }
            } else if (prev && prev.PFPE) {
              // Si hay un solo registro previo
              if (prev.PFPE.week === value.PFPE.week) {
                newTracking[dayKey] = value;
              } else {
                newTracking[dayKey] = [prev, value];
              }
            } else {
              newTracking[dayKey] = value;
            }
          } else {
            newTracking[dayKey] = value;
          }
        });
        updateObj.dailyTracking = newTracking;
        // Copiar el resto de los datos
        Object.entries(updatedRoutine).forEach(([k, v]) => {
          if (k !== 'dailyTracking') updateObj[k] = v;
        });
      } else {
        updateObj = { ...selectedRoutine, ...updatedRoutine };
      }
    }

    const { error: updateError } = await supabase
      .from('rutinas')
      .update(updateObj)
      .eq('id', id);

    if (updateError) {
      alert('Error al actualizar la rutina: ' + updateError.message);
      return;
    }

    // Recarga las rutinas después de actualizar
    let routinesData = [];
    if (currentUser?.role === 'admin' && !selectedClient) {
      const res = await supabase.from('rutinas').select('*');
      routinesData = res.data || [];
      setClientRoutines(routinesData);
    } else if (selectedClient && selectedClient.client_id) {
      const res = await supabase
        .from('rutinas')
        .select('*')
        .eq('client_id', selectedClient.client_id);
      routinesData = res.data || [];
      setClientRoutines(routinesData);
    } else if (currentUser?.role === 'client') {
      const res = await supabase
        .from('rutinas')
        .select('*')
        .eq('client_id', currentUser.client_id);
      routinesData = res.data || [];
      setClientRoutines(routinesData);
    }

    // Refresca la rutina seleccionada desde la base de datos
    const { data: refreshedRoutine, error: fetchRoutineError } = await supabase
      .from('rutinas')
      .select('*')
      .eq('id', id)
      .single();
    if (!fetchRoutineError && refreshedRoutine) {
      setSelectedRoutine(refreshedRoutine);
    }
  }

  // Efectos para sincronizar con localStorage

  // Sincronizar currentUser con localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ds_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ds_user');
    }
  }, [currentUser]);

  // Sincronizar currentPage con localStorage
  useEffect(() => {
    localStorage.setItem('ds_page', currentPage);
  }, [currentPage]);

  // Sincronizar selectedClient con localStorage
  useEffect(() => {
    if (selectedClient) {
      localStorage.setItem('ds_selectedClient', JSON.stringify(selectedClient));
    } else {
      localStorage.removeItem('ds_selectedClient');
    }
  }, [selectedClient]);

  // Sincronizar selectedRoutine con localStorage
  useEffect(() => {
    if (selectedRoutine) {
      localStorage.setItem('ds_selectedRoutine', JSON.stringify(selectedRoutine));
    } else {
      localStorage.removeItem('ds_selectedRoutine');
    }
  }, [selectedRoutine]);

  // ...existing code...


  // RESTABLECER CONTRASEÑA


  // RENDER
  // Loader mientras se restaura el estado (debe ir después de todos los hooks y callbacks, justo antes del return principal)
  if (!isRestored) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <svg className="animate-spin h-10 w-10 text-green-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-gray-700 text-lg font-medium">Cargando...</span>
      </div>
    );
  }
  if (!currentUser) {
    if (showLoginLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <svg className="animate-spin h-10 w-10 text-green-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-gray-700 text-lg font-medium">Iniciando sesión...</span>
        </div>
      );
    }
    if (currentPage === 'register') {
      return (
        <Suspense fallback={<div>Cargando...</div>}>
          <RegisterScreen onRegister={handleRegister} onGoToLogin={() => setCurrentPage('auth')} />
        </Suspense>
      );
    }
    return (
      <Suspense fallback={<div>Cargando...</div>}>
        <AuthScreen onLogin={handleLogin} onGoToRegister={() => setCurrentPage('register')} />
      </Suspense>
    );
  }

  // RESTABLECER CONTRASEÑA
  const handleResetPassword = async (client_id, newPassword, newRole) => {
    console.log('Reset password for:', client_id, newPassword, newRole);
    const updateObj = { password: newPassword };
    if (newRole) updateObj.role = newRole;
    const { error } = await supabase
      .from('usuarios')
      .update(updateObj)
      .eq('client_id', client_id);
    if (error) {
      alert('Error al restablecer la contraseña: ' + error.message);
      return;
    }
    alert('Contraseña y rol actualizados correctamente.');
    // Refrescar usuarios si es admin
    if (currentUser?.role === 'admin') {
      const { data } = await supabase.from('usuarios').select('*');
      setUsers(data);
    }
  };

  // CAMBIAR CONTRASEÑA DEL USUARIO ACTUAL
  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      // Resetear timer de inactividad para esta operación importante
      resetInactivityTimer();
      
      // Verificar la contraseña actual
      const { data: userData, error: verifyError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('client_id', currentUser.client_id)
        .eq('password', currentPassword);

      if (verifyError) {
        throw new Error('Error verificando la contraseña actual.');
      }

      if (!userData || userData.length === 0) {
        throw new Error('La contraseña actual es incorrecta.');
      }

      // Actualizar con la nueva contraseña
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ password: newPassword })
        .eq('client_id', currentUser.client_id);

      if (updateError) {
        throw new Error('Error al actualizar la contraseña: ' + updateError.message);
      }

      // Actualizar el estado del usuario actual si es necesario
      const updatedUser = { ...currentUser, password: newPassword };
      setCurrentUser(updatedUser);
      localStorage.setItem('ds_user', JSON.stringify(updatedUser));

      console.log('✅ Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('❌ Error cambiando contraseña:', error);
      throw error;
    }
  };

  // Agregar ejercicio directamente desde el modal
  const handleAddExerciseClick = (exerciseData) => {
    if (!selectedRoutine) return;
    
    // Si se recibe exerciseData, agregarlo a la rutina
    if (exerciseData) {
      const exercises = Array.isArray(selectedRoutine.exercises) ? [...selectedRoutine.exercises] : [];
      // Generar un id único si no existe
      if (!exerciseData.id) {
        exerciseData.id = '_' + Math.random().toString(36).substr(2, 9);
      }
      exercises.push(exerciseData);
      handleUpdateRoutine({
        id: selectedRoutine.id,
        exercises,
      });
      // Regresar a la vista de rutina
      setCurrentPage('routineDetail');
    }
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100 font-sans antialiased">
        <LayoutHeader
          title={getHeaderTitle()}
          onBackClick={handleBack}
          showBackButton={currentPage !== 'adminClientDashboard' && currentPage !== 'clientDashboard' && currentPage !== 'auth' && currentPage !== 'register' && currentPage !== undefined}
          onLogout={handleLogout}
          showLogoutButton={currentPage !== 'auth' && currentPage !== 'register' && currentUser}
          userId={currentUser?.id || currentUser?.client_id}
          currentUser={currentUser}
          isAdmin={currentUser?.role === 'admin'}
          showNotifications={currentUser && currentPage !== 'auth' && currentPage !== 'register'}
          onChangePassword={handleChangePassword}
          onUserUpdate={updateCurrentUser}
        />

        <main className="p-6 max-w-4xl mx-auto">
          <Suspense fallback={<div>Cargando contenido...</div>}>
            {/* Sección para el Coach (Administrador) */}
            {currentUser && currentUser.role === 'admin' && (
              <>
                {currentPage === 'userManagement' && !loadingUsers && (
                <UserManagementScreen
                  users={users}
                  onRoleChange={handleRoleChange}
                  onResetPassword={handleResetPassword}
                  onViewProfile={user => {
                    setShowUserLoading(true);
                    setLoadingClientRoutines(false); // Resetear estado de loading de rutinas
                    setTimeout(() => {
                      setSelectedClient(user);
                      setCurrentPage('adminViewClientRoutines');
                      setShowUserLoading(false);
                    }, 0);
                  }}
                  onDeleteUser={handleDeleteUser}
                  onBack={() => {
                    setCurrentPage('adminHome');
                    setLoadingUsers(false); // Resetear estado de loading
                  }}
                  isAdmin={true}
                />
              )}
              {currentPage === 'userManagement' && loadingUsers && (
                <div className="flex justify-center items-center h-64">
                  <span className="text-gray-700 text-lg font-medium">Cargando clientes...</span>
                </div>
              )}
              {showUserLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-green-700 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  <span className="text-gray-700 text-lg font-medium">Cargando rutinas del usuario...</span>
                </div>
              )}
              {currentUser.role === 'admin' && currentPage === 'adminHome' && (
                <AdminHomeScreen
                  onNavigateClientes={handleGoToClientes}
                  onNavigateTemplates={handleGoToTemplates}
                />
              )}
              {currentUser.role === 'admin' && currentPage === 'routineTemplates' && (
                <RoutineTemplatesScreen
                  // Pasa aquí los props necesarios: clients, etc.
                  clients={users.filter(user => user.role === 'client')}
                  onGoBack={() => setCurrentPage('adminHome')}
                  onAssignRoutine={handleAssignRoutineFromTemplate}
                />
              )}
              {!showUserLoading && currentPage === 'adminViewClientRoutines' && selectedClient && !loadingClientRoutines && (
                <ClientRoutineList
                  client={selectedClient}
                  routines={clientRoutines}
                  onSelectRoutine={handleSelectRoutine}
                  onAddRoutine={handleAddRoutine}
                  isEditable={true}
                  onDeleteRoutine={handleDeleteRoutine}
                  currentUser={currentUser}
                  onBack={() => {
                    setCurrentPage('userManagement');
                    setSelectedClient(null);
                    setLoadingClientRoutines(false); // Resetear estado de loading
                    setLoadingUsers(false); // Resetear estado de loading de usuarios también
                  }}
                />
              )}
              {currentPage === 'adminViewClientRoutines' && selectedClient && loadingClientRoutines && (
                <div className="flex justify-center items-center h-64">
                  <span className="text-gray-700 text-lg font-medium">Cargando rutinas del cliente...</span>
                </div>
              )}
              {currentPage === 'routineDetail' && selectedRoutine && (
                <RoutineDetail
                  routine={selectedRoutine}
                  onUpdateRoutine={handleUpdateRoutine}
                  isEditable={true}
                  onAddExerciseClick={() => setCurrentPage('addExercise')}
                  canAddDailyTracking={true}
                />
              )}
              {currentPage === 'addExercise' && (
                <AddExerciseScreen
                  onAddExercise={handleAddExerciseClick}
                  onBack={() => setCurrentPage('routineDetail')}
                />
              )}
            </>
          )}

                    {/* Sección para el Cliente */}
          {currentUser && currentUser.role === 'client' && (
            <>
              {currentPage === 'clientDashboard' && selectedClient && (
                <ClientRoutineList
                  key={`client-dashboard-${selectedClient.client_id}-${selectedClient?.profilePhoto?.slice(-20) || 'no-photo'}`}
                  client={selectedClient}
                  routines={clientRoutines}
                  onSelectRoutine={handleSelectRoutine}
                  isEditable={false}
                  currentUser={currentUser}
                />
              )}

              {currentPage === 'routineDetail' && selectedRoutine && (
                <RoutineDetail 
                  routine={selectedRoutine} 
                  isEditable={false} 
                  canAddDailyTracking={true}
                  onUpdateRoutine={handleUpdateRoutine}
                />
              )}
            </>
          )}
        </Suspense>
      </main>

      <SpeedInsights />
    </div>
    </NotificationProvider>
  );
};

export default App;