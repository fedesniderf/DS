import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import LayoutHeader from './components/LayoutHeader';
import { defaultClients, defaultRoutines } from './mock/clients';
import { defaultUsers } from './mock/users';
import { generateUniqueId } from './utils/helpers';
import { SpeedInsights } from "@vercel/speed-insights/react";

// Implementación de Lazy Loading para componentes grandes o que no se cargan al inicio
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
  const [clients, setClients] = useState(defaultClients);
  const [routines, setRoutines] = useState(defaultRoutines);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(defaultUsers);
  const [showAssignRoutineModal, setShowAssignRoutineModal] = useState(false);

  // Memoizar los datos de clientes y usuarios si no cambian con frecuencia
  const memoizedClients = useMemo(() => clients, [clients]);
  const memoizedUsers = useMemo(() => users, [users]);
  const memoizedRoutines = useMemo(() => routines, [routines]);

  // Usar useCallback para funciones que se pasan como props para evitar re-renders innecesarios
  const handleLogin = useCallback((email, password, method, roleAttempt) => {
    if (method === 'email') {
      const user = memoizedUsers.find(u => u.email === email && u.password === password);
      if (user) {
        // Aquí se modifica la lógica para que el rol del usuario determine la página de inicio
        setCurrentUser(user);
        if (user.role === 'client') {
          const clientData = memoizedClients.find(c => c.email === user.email);
          if (clientData) {
            setSelectedClient(clientData);
            setCurrentPage('clientDashboard');
          } else {
            alert('No se encontraron datos de cliente para este usuario. Por favor, contacta a tu entrenador.');
            setCurrentUser(null); // Si no hay datos de cliente, no se loguea
          }
        } else if (user.role === 'admin') {
          setCurrentPage('adminClientDashboard');
        }
      } else {
        alert('Credenciales incorrectas.');
      }
    } else if (method === 'google') {
      // Lógica para Google, asumiendo que siempre es admin para este ejemplo
      const googleUser = memoizedUsers.find(u => u.email === 'trainer@example.com'); // Asumiendo un usuario admin para Google
      if (googleUser) {
        setCurrentUser(googleUser);
        setCurrentPage('adminClientDashboard');
      } else {
        alert('Error al iniciar sesión con Google.');
      }
    }
  }, [memoizedUsers, memoizedClients]);

  const handleRegister = useCallback((userData) => {
    if (memoizedUsers.some(u => u.email === userData.email)) {
      alert('Este email ya está registrado.');
      return;
    }

    const newUser = {
      id: generateUniqueId(),
      email: userData.email,
      password: userData.password,
      role: 'client',
    };
    setUsers((prevUsers) => [...prevUsers, newUser]);

    const newClient = {
      id: newUser.id,
      name: userData.fullName,
      email: userData.email,
      lastRoutine: 'Sin rutinas',
      progress: 0,
      age: userData.age,
      weight: userData.weight,
      height: userData.height,
      goals: userData.goals.split(',').map(goal => goal.trim()),
      phone: userData.phone,
    };
    setClients((prevClients) => [...prevClients, newClient]);

    alert('Registro exitoso. Por favor, inicia sesión.');
    setCurrentPage('auth');
  }, [memoizedUsers]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSelectedClient(null);
    setSelectedRoutine(null);
    setCurrentPage('auth');
  }, []);

  const handleSelectClient = useCallback((client) => {
    setSelectedClient(client);
    setCurrentPage('routines');
  }, []);

  const handleSelectRoutine = useCallback((routine) => {
    setSelectedRoutine(routine);
    setCurrentPage('routineDetail');
  }, []);

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

  const handleAddRoutine = useCallback((newRoutine) => {
    setRoutines((prevRoutines) => [...prevRoutines, newRoutine]);
    if (selectedClient && selectedClient.lastRoutine === 'Sin rutinas') {
      setClients((prevClients) =>
        prevClients.map((c) =>
          c.id === selectedClient.id ? { ...c, lastRoutine: newRoutine.name } : c
        )
      );
    }
  }, [selectedClient]);

  const handleUpdateRoutine = useCallback((updatedRoutine) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r))
    );
    // Actualizar selectedRoutine si es la rutina que se está viendo
    if (selectedRoutine && selectedRoutine.id === updatedRoutine.id) {
      setSelectedRoutine(updatedRoutine);
    }
    if (selectedClient && selectedRoutine && selectedRoutine.id === updatedRoutine.id) {
      setClients((prevClients) =>
        prevClients.map((c) =>
          c.id === selectedClient.id ? { ...c, lastRoutine: updatedRoutine.name } : c
        )
      );
    }
  }, [selectedClient, selectedRoutine]);

  const handleAddExerciseToRoutine = useCallback((newExerciseData) => {
    if (selectedRoutine) {
      const updatedRoutine = {
        ...selectedRoutine,
        exercises: [...selectedRoutine.exercises, newExerciseData],
      };
      handleUpdateRoutine(updatedRoutine);
      // setSelectedRoutine(updatedRoutine); // Esto ya lo hace handleUpdateRoutine si es la rutina seleccionada
    }
  }, [selectedRoutine, handleUpdateRoutine]);

  const handleDeleteClient = useCallback((clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este cliente y todas sus rutinas?')) {
      setClients((prevClients) => prevClients.filter(client => client.id !== clientId));
      setUsers((prevUsers) => prevUsers.filter(user => user.id !== clientId));
      setRoutines((prevRoutines) => prevRoutines.filter(routine => routine.clientId !== clientId));
      setSelectedClient(null);
      setSelectedRoutine(null);
      setCurrentPage('adminClientDashboard');
      alert('Cliente eliminado exitosamente.');
    }
  }, []);

  const handleDeleteRoutine = useCallback((routineId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta rutina?')) {
      setRoutines((prevRoutines) => prevRoutines.filter(routine => routine.id !== routineId));
      if (selectedClient) {
        const clientRoutines = routines.filter(r => r.clientId === selectedClient.id && r.id !== routineId);
        const newLastRoutineName = clientRoutines.length > 0 ? clientRoutines[clientRoutines.length - 1].name : 'Sin rutinas';
        setClients((prevClients) =>
          prevClients.map((c) =>
            c.id === selectedClient.id ? { ...c, lastRoutine: newLastRoutineName } : c
          )
        );
      }
      setSelectedRoutine(null);
      setCurrentPage('routines');
      alert('Rutina eliminada exitosamente.');
    }
  }, [selectedClient, routines]);

  const handleDeleteUser = useCallback((userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este usuario? Esto también eliminará sus datos de cliente y rutinas asociadas.')) {
      setUsers((prevUsers) => prevUsers.filter(user => user.id !== userId));
      setClients((prevClients) => prevClients.filter(client => client.id !== userId));
      setRoutines((prevRoutines) => prevRoutines.filter(routine => routine.clientId !== userId));
      alert('Usuario eliminado exitosamente.');
    }
  }, []);

  const handleResetUserPassword = useCallback((userId, newPassword) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, password: newPassword } : user
      )
    );
    alert('Contraseña restablecida exitosamente.');
  }, []);

  const handleAddClient = useCallback(() => {
    const newClientName = prompt('Ingresa el nombre del nuevo cliente:');
    if (newClientName) {
      const newClientEmail = prompt('Ingresa el email del nuevo cliente:');
      if (newClientEmail) {
        const newClient = {
          id: generateUniqueId(),
          name: newClientName,
          email: newClientEmail,
          lastRoutine: 'Sin rutinas',
          progress: 0,
          age: null,
          weight: null,
          height: null,
          goals: [],
          phone: '',
        };
        setClients((prevClients) => [...prevClients, newClient]);
        setUsers((prevUsers) => [...prevUsers, { id: newClient.id, email: newClient.email, password: 'password123', role: 'client' }]);
      }
    }
  }, []);

  const handleAssignRoutine = useCallback((clientId) => {
    if (selectedRoutine) {
      const updatedRoutine = { ...selectedRoutine, clientId: clientId };
      handleUpdateRoutine(updatedRoutine);
      alert(`Rutina "${selectedRoutine.name}" asignada a ${memoizedClients.find(c => c.id === clientId)?.name || 'un cliente'}.`);
      setShowAssignRoutineModal(false);
    }
  }, [selectedRoutine, handleUpdateRoutine, memoizedClients]);

  // Nueva función para actualizar una rutina desde ClientRoutineList
  const handleUpdateRoutineFromList = useCallback((updatedRoutine) => {
    setRoutines((prevRoutines) =>
      prevRoutines.map((r) => (r.id === updatedRoutine.id ? updatedRoutine : r))
    );
  }, []);

  const getHeaderTitle = useCallback(() => {
    if (!currentUser) {
      if (currentPage === 'auth') return 'Iniciar Sesión';
      if (currentPage === 'register') return 'Registrarse';
    }
    if (currentUser && currentUser.role === 'admin' && currentPage === 'adminClientDashboard') return 'Administración de Clientes';
    if (currentUser && currentUser.role === 'admin' && currentPage === 'routines' && selectedClient) return `Rutinas de ${selectedClient.name}`;
    if (currentPage === 'routineDetail' && selectedRoutine) return selectedRoutine.name;
    if (currentUser && currentUser.role === 'client' && currentPage === 'clientDashboard') return `Mis Rutinas`;
    if (currentPage === 'addExercise') return 'Agregar Ejercicio';
    if (currentUser && currentUser.role === 'admin' && currentPage === 'userManagement') return 'Gestión de Usuarios';
    return 'DS Entrenamiento';
  }, [currentPage, currentUser, selectedClient, selectedRoutine]);

  const isRoutineEditable = currentUser && currentUser.role === 'admin';

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
                  clients={memoizedClients}
                  onSelectClient={handleSelectClient}
                />
              )}

              {currentPage === 'routines' && selectedClient && (
                <ClientRoutineList
                  client={selectedClient}
                  routines={memoizedRoutines.filter(r => r.clientId === selectedClient.id)}
                  onSelectRoutine={handleSelectRoutine}
                  onAddRoutine={handleAddRoutine}
                  isEditable={true}
                  onDeleteRoutine={handleDeleteRoutine}
                  onUpdateRoutine={handleUpdateRoutineFromList}
                />
              )}

              {currentPage === 'routineDetail' && selectedRoutine && (
                <RoutineDetail
                  routine={selectedRoutine}
                  onUpdateRoutine={handleUpdateRoutine}
                  isEditable={true}
                  onAddExerciseClick={() => setCurrentPage('addExercise')}
                />
              )}

              {currentPage === 'addExercise' && (
                <AddExerciseScreen
                  onAddExercise={handleAddExerciseToRoutine}
                  onBack={() => setCurrentPage('routineDetail')}
                />
              )}

              {currentPage === 'userManagement' && (
                <UserManagementScreen
                  users={memoizedUsers}
                  onDeleteUser={handleDeleteUser}
                  onResetPassword={handleResetUserPassword}
                />
              )}

              {/* Botones de acción para el admin, visibles solo en el dashboard principal del admin */}
              {currentPage === 'adminClientDashboard' && (
                <>
                  <button
                    onClick={handleAddClient}
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
                  routines={memoizedRoutines.filter(r => r.clientId === selectedClient.id)}
                  onSelectRoutine={handleSelectRoutine}
                  onAddRoutine={() => {}}
                  isEditable={false}
                  onUpdateRoutine={handleUpdateRoutineFromList}
                />
              )}

              {currentPage === 'routineDetail' && selectedRoutine && (
                <RoutineDetail routine={selectedRoutine} onUpdateRoutine={handleUpdateRoutine} isEditable={false} />
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
            clients={memoizedClients}
            onAssign={handleAssignRoutine}
            onClose={() => setShowAssignRoutineModal(false)}
          />
        </Suspense>
      )}

      <SpeedInsights />
    </div>
  );
};

export default App;