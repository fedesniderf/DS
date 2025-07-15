import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import LayoutHeader from './components/LayoutHeader';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { supabase } from './supabaseClient';

const ClientRoutineList = lazy(() => import('./components/ClientRoutineList'));
const RoutineDetail = lazy(() => import('./components/RoutineDetail'));
const AuthScreen = lazy(() => import('./components/AuthScreen'));
const RegisterScreen = lazy(() => import('./components/RegisterScreen'));
const AddExerciseScreen = lazy(() => import('./components/AddExerciseScreen'));
const AssignRoutineModal = lazy(() => import('./components/AssignRoutineModal'));
const UserManagementScreen = lazy(() => import('./components/UserManagementScreen'));
const ClientDashboardAdmin = lazy(() => import('./components/ClientDashboardAdmin'));

const App = () => {
  const [currentPage, setCurrentPage] = useState('auth');
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showAssignRoutineModal, setShowAssignRoutineModal] = useState(false);
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
    // Recarga las rutinas del cliente
    if (selectedClient && selectedClient.client_id) {
      const { data } = await supabase
        .from('rutinas')
        .select('*')
        .eq('client_id', selectedClient.client_id);
      setClientRoutines(data || []);
    }
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
                />
              )}

              {currentPage === 'routineDetail' && selectedRoutine && (
                <RoutineDetail
                  routine={selectedRoutine}
                  isEditable={true}
                  onAddExerciseClick={() => setCurrentPage('addExercise')}
                />
              )}

              {currentPage === 'addExercise' && (
                <AddExerciseScreen
                  onBack={() => setCurrentPage('routineDetail')}
                />
              )}

              {currentPage === 'userManagement' && (
                <UserManagementScreen
                  users={users}
                  onRoleChange={handleRoleChange}
                />
              )}

              {/* Botones de acción para el admin */}
              {currentPage === 'adminClientDashboard' && (
                <>
                  <button
                    onClick={() => setCurrentPage('register')}
                    className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md mb-4"
                  >
                    Agregar Nuevo Cliente
                  </button>
                  <button
                    onClick={() => setCurrentPage('userManagement')}
                    className="w-full bg-gray-700 text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md"
                  >
                    Administrar Usuarios
                  </button>
                </>
              )}
              {currentPage === 'routineDetail' && selectedRoutine && (
                <button
                  onClick={() => setShowAssignRoutineModal(true)}
                  className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md"
                >
                  Asignar Rutina a Cliente
                </button>
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
                <RoutineDetail routine={selectedRoutine} isEditable={false} />
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

      {showAssignRoutineModal && (
        <Suspense fallback={<div>Cargando modal...</div>}>
          <AssignRoutineModal
            clients={users.filter(u => u.role && u.role.toLowerCase() === 'client')}
            onAssign={() => {}}
            onClose={() => setShowAssignRoutineModal(false)}
          />
        </Suspense>
      )}

      <SpeedInsights />
    </div>
  );
};

export default App;