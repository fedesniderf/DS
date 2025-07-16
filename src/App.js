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
  const [currentPage, setCurrentPage] = useState('auth');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [clientRoutines, setClientRoutines] = useState([]);

  // LOGIN
  const handleLogin = useCallback(async (email, password, method) => {
    if (method === 'email') {
      const { data: users, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('password', password);

      if (error) {
        alert('Error consultando usuario en Supabase.');
        return;
      }
      if (users && users.length > 0) {
        const user = users[0];
        setCurrentUser(user);
        if (user.role === 'client') {
          setSelectedClient(user);
          setCurrentPage('clientDashboard');
        } else if (user.role === 'admin') {
          setCurrentPage('adminClientDashboard');
        }
      } else {
        alert('Credenciales incorrectas.');
      }
    } else if (method === 'google') {
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
  }, []);

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
      } else {
        setCurrentPage('routines');
      }
      setSelectedRoutine(null);
    } else if (currentPage === 'routines') {
      if (currentUser && currentUser.role === 'client') {
        setCurrentPage('clientDashboard');
      } else {
        setCurrentPage('adminClientDashboard');
        setSelectedClient(null);
      }
    } else if (currentPage === 'clientDashboard') {
      handleLogout();
    } else if (currentPage === 'addExercise') {
      setCurrentPage('routineDetail');
    } else if (currentPage === 'userManagement') {
      setCurrentPage('adminClientDashboard');
    } else if (currentPage === 'adminClientDashboard') {
      handleLogout();
    }
  }, [currentPage, currentUser, handleLogout]);

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
      if (currentUser?.role === 'admin' && !selectedClient) {
        // Admin: ver todas las rutinas
        const { data, error } = await supabase
          .from('rutinas')
          .select('*');
        if (!error) setClientRoutines(data);
      } else if (selectedClient && selectedClient.client_id) {
        // Rutinas del cliente seleccionado
        const { data, error } = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', selectedClient.client_id);
        if (!error) setClientRoutines(data);
      } else if (currentUser?.role === 'client') {
        // Cliente: ver solo sus rutinas
        const { data, error } = await supabase
          .from('rutinas')
          .select('*')
          .eq('client_id', currentUser.client_id);
        if (!error) setClientRoutines(data);
      } else {
        setClientRoutines([]);
      }
    }
    fetchRoutines();
  }, [currentUser, selectedClient]);

  // HEADER
  const getHeaderTitle = useCallback(() => {
    if (!currentUser) {
      if (currentPage === 'auth') return 'Iniciar Sesión';
      if (currentPage === 'register') return 'Registrarse';
    }
    if (currentUser && currentUser.role === 'admin' && currentPage === 'adminClientDashboard') return 'Administración de Clientes';
    if (currentUser && currentUser.role === 'admin' && currentPage === 'routines' && selectedClient) return `Rutinas de ${selectedClient.fullName || selectedClient.email}`;
    if (currentPage === 'routineDetail' && selectedRoutine) return selectedRoutine.name;
    if (currentUser && currentUser.role === 'client' && currentPage === 'clientDashboard') return `Mis Rutinas`;
    if (currentPage === 'addExercise') return 'Agregar Ejercicio';
    if (currentUser && currentUser.role === 'admin' && currentPage === 'userManagement') return 'Gestión de Usuarios';
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
      // No verificar deletedData, Supabase no retorna datos eliminados por defecto
      // Recargar rutinas y limpiar selección
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
      setSelectedRoutine(null);
      setCurrentPage('routines');
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
      dailyTracking[data.date] = {
        pf: data.pf,
        pe: data.pe,
        timestamp: data.timestamp
      };
      updateObj.dailyTracking = dailyTracking;
    } else {
      // Actualización general de rutina
      updateObj = { ...selectedRoutine, ...updatedRoutine };
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
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ds_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('ds_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('ds_page', currentPage);
  }, [currentPage]);

  useEffect(() => {
    const savedUser = localStorage.getItem('ds_user');
    const savedPage = localStorage.getItem('ds_page');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      if (savedPage) setCurrentPage(savedPage);
    }
  }, []);


  // RESTABLECER CONTRASEÑA


  // RENDER
  if (!currentUser) {
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
  const handleResetPassword = async (client_id, newPassword) => {
    console.log('Reset password for:', client_id, newPassword);
    const { error } = await supabase
      .from('usuarios')
      .update({ password: newPassword })
      .eq('client_id', client_id);
    if (error) {
      alert('Error al restablecer la contraseña: ' + error.message);
      return;
    }
    alert('Contraseña restablecida correctamente.');
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
        showBackButton={currentPage !== 'adminClientDashboard' && currentPage !== 'clientDashboard' && currentPage !== 'auth' && currentPage !== 'register'}
      />

      <main className="p-6 max-w-4xl mx-auto">
        <Suspense fallback={<div>Cargando contenido...</div>}>
          {/* Sección para el Coach (Administrador) */}
          {currentUser.role === 'admin' && (
            <>
              {currentPage === 'adminClientDashboard' && (
                <ClientDashboardAdmin
                  clients={users.filter(u => u.role && u.role.toLowerCase() === 'client')}
                  onSelectClient={handleSelectClient}
                />
              )}

              {/* Mostrar rutinas: para admin, mostrar todas si no hay cliente seleccionado */}
              {currentPage === 'routines' && (
                <ClientRoutineList
                  client={selectedClient} // será null si no hay cliente seleccionado
                  routines={clientRoutines}
                  users={users}
                  onSelectRoutine={handleSelectRoutine}
                  isEditable={true}
                  onAddRoutine={handleAddRoutine}
                  onDeleteRoutine={handleDeleteRoutine}
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


              {currentPage === 'userManagement' && (
                <UserManagementScreen
                  users={users}
                  onRoleChange={handleRoleChange}
                  onResetPassword={handleResetPassword}
                />
              )}

              {/* Botones de acción para el admin */}
              {currentPage === 'adminClientDashboard' && (
                <>
                  <button
                    onClick={() => setCurrentPage('userManagement')}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md"
                  >
                    Administrar Usuarios
                  </button>
                </>
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