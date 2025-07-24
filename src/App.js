import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import LayoutHeader from './components/LayoutHeader';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { supabase } from './supabaseClient';

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
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [clientRoutines, setClientRoutines] = useState([]);
  const [showUserLoading, setShowUserLoading] = useState(false);
  const [showLoginLoading, setShowLoginLoading] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

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

  // LOGIN
  const handleLogin = useCallback(async (email, password, method) => {
    setShowLoginLoading(true);
    if (method === 'email') {
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
        const user = users[0];
        setCurrentUser(user);
        localStorage.setItem('ds_user', JSON.stringify(user));
        if (user.role === 'client') {
          setSelectedClient(user);
          setCurrentPage('clientDashboard');
        } else if (user.role === 'admin') {
          setCurrentPage('userManagement');
        }
      } else {
        alert('Credenciales incorrectas.');
      }
    } else if (method === 'google') {
      setShowLoginLoading(false);
      alert('Login con Google no implementado.');
    }
  }, []);

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
        role: 'client'
      }]);

    if (error) {
      alert('Error guardando usuario en Supabase: ' + error.message);
      return;
    }

    alert('Registro exitoso. Por favor, inicia sesión.');
    setCurrentPage('auth');
  }, []);

  // LOGOUT
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSelectedClient(null);
    setSelectedRoutine(null);
    setCurrentPage('auth');
    localStorage.removeItem('ds_user');
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
          setCurrentPage('userManagement');
        }
      }
    }
  }, [currentUser, isRestored]);
  // ...existing code...
  // ...existing code...
  // ...existing code...
  // ...existing code...
  // ...existing code...
  // Loader mientras se restaura el estado (debe ir después de todos los hooks y callbacks, justo antes del return principal)
  // ...existing code...

  // SELECCIONAR CLIENTE Y RUTINA
  const handleSelectClient = useCallback((client) => {
    setSelectedClient(client);
    setCurrentPage('routines');
  }, []);

  const handleSelectRoutine = useCallback((routine) => {
    setSelectedRoutine(routine);
    setCurrentPage('routineDetail');
  }, []);

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
      setCurrentPage('adminClientDashboard');
    } else if (currentPage === 'adminClientDashboard') {
      handleLogout();
    }
  }, [currentPage, currentUser, handleLogout, selectedClient]);

  // Loader mientras se restaura el estado (debe ir después de todos los hooks y callbacks, justo antes del return principal)
  // ...existing code...

  // CARGAR USUARIOS DESDE SUPABASE
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*');
      if (!error) setUsers(data);
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
      if (currentUser?.role === 'admin' && !selectedClient) {
        // Admin: ver todas las rutinas
        const { data, error } = await supabase
          .from('rutinas')
          .select('*');
        console.log('fetchRoutines - rutinas (admin, todas):', data);
        if (!error) setClientRoutines(data);
      } else if (selectedClient && selectedClient.client_id) {
        // Rutinas del cliente seleccionado
        const { data, error } = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', selectedClient.client_id);
        console.log('fetchRoutines - rutinas (cliente seleccionado):', data, 'error:', error);
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
  }, [currentUser, selectedClient]);

  // HEADER
  const getHeaderTitle = useCallback(() => {
    return 'DS Entrenamiento';
  }, [currentPage, currentUser, selectedClient, selectedRoutine]);

  // AGREGAR RUTINA
  const handleAddRoutine = async (routine) => {
    const { error } = await supabase
      .from('rutinas')
      .insert([{
        client_id: routine.client_id,
        name: routine.name,
        startDate: routine.startDate,
        endDate: routine.endDate,
      }]);
    if (error) {
      alert('Error al crear la rutina: ' + error.message);
      return;
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

    // Manejador universal para acciones desde RoutineDetail
    const { id, action, data } = updatedRoutine;
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

  // Define la función aquí, antes del return
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
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <LayoutHeader
        title={getHeaderTitle()}
        onBackClick={handleBack}
        showBackButton={currentPage !== 'adminClientDashboard' && currentPage !== 'clientDashboard' && currentPage !== 'auth' && currentPage !== 'register' && currentPage !== 'userManagement' && currentPage !== undefined}
      />

      <main className="p-6 max-w-4xl mx-auto">
        <Suspense fallback={<div>Cargando contenido...</div>}>
          {/* Sección para el Coach (Administrador) */}
          {currentUser.role === 'admin' && (
            <>
              {currentPage === 'userManagement' && (
                <UserManagementScreen
                  users={users}
                  onRoleChange={handleRoleChange}
                  onResetPassword={handleResetPassword}
                  onViewProfile={user => {
                    setShowUserLoading(true);
                    setTimeout(() => {
                      setSelectedClient(user);
                      setCurrentPage('adminViewClientRoutines');
                      setShowUserLoading(false);
                    }, 0); // 1000ms delay
                  }}
                  onDeleteUser={handleDeleteUser}
                />
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
              {!showUserLoading && currentPage === 'adminViewClientRoutines' && selectedClient && (
                <ClientRoutineList
                  client={selectedClient}
                  routines={clientRoutines}
                  onSelectRoutine={handleSelectRoutine}
                  onAddRoutine={handleAddRoutine}
                  isEditable={true}
                  onDeleteRoutine={handleDeleteRoutine}
                  onBack={() => {
                    setCurrentPage('userManagement');
                    setSelectedClient(null);
                  }}
                />
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
          {currentUser.role === 'client' && (
            <>
              {currentPage === 'clientDashboard' && selectedClient && (
                <ClientRoutineList
                  client={selectedClient}
                  routines={clientRoutines}
                  onSelectRoutine={handleSelectRoutine}
                  isEditable={false}
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

        <button
          onClick={handleLogout}
          className="w-full mt-8 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md"
          style={{ backgroundColor: '#183E0C' }}
        >
          Cerrar Sesión
        </button>
      </main>

      <SpeedInsights />
    </div>
  );
};

export default App;