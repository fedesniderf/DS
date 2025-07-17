import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const AuthScreen = lazy(() => import('./components/AuthScreen'));
const RegisterScreen = lazy(() => import('./components/RegisterScreen'));
const ClientRoutineList = lazy(() => import('./components/ClientRoutineList'));
const RoutineDetail = lazy(() => import('./components/RoutineDetail'));
const AddExerciseScreen = lazy(() => import('./components/AddExerciseScreen'));
const UserManagementScreen = lazy(() => import('./components/UserManagementScreen'));
const ClientDashboardAdmin = lazy(() => import('./components/ClientDashboardAdmin'));

let globalBackHandler = null;
export default function AppRouter({
  currentUser,
  users,
  clientRoutines,
  selectedClient,
  selectedRoutine,
  showUserLoading,
  handleLogin,
  handleRegister,
  handleRoleChange,
  handleResetPassword,
  handleDeleteUser,
  handleSelectRoutine,
  handleAddExerciseClick,
  handleUpdateRoutine,
  handleDeleteRoutine,
  handleDeleteExercise,
  setCurrentPage,
  setSelectedClient,
  setShowUserLoading,
  handleLogout
}) {
  const navigate = useNavigate();

  // Botón de atrás global para el header
  const handleBackHeader = () => {
    if (window.location.pathname === '/routineDetail') {
      if (currentUser && currentUser.role === 'client') {
        navigate('/clientDashboard');
      } else if (currentUser && currentUser.role === 'admin' && selectedClient) {
        navigate('/adminViewClientRoutines');
      } else {
        navigate('/userManagement');
      }
    } else if (window.location.pathname === '/adminViewClientRoutines') {
      navigate('/userManagement');
    } else if (window.location.pathname === '/addExercise') {
      navigate('/routineDetail');
    } else if (window.location.pathname === '/userManagement') {
      navigate('/');
    } else if (window.location.pathname === '/clientDashboard') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };
  // Exponer handler global para el header
  globalBackHandler = handleBackHeader;
  window._dsHandleBackHeader = handleBackHeader;
  
  // Eliminado: la navegación ahora la maneja App.js

  return (
    <Routes>
      <Route path="/" element={
        !currentUser ? (
          <Suspense fallback={<div>Cargando...</div>}>
            <AuthScreen 
              onLogin={handleLogin} 
              onGoToRegister={() => navigate('/register')} 
            />
          </Suspense>
        ) : (
          <Navigate to={currentUser.role === 'admin' ? '/userManagement' : '/clientDashboard'} />
        )
      } />
      <Route path="/register" element={
        <Suspense fallback={<div>Cargando...</div>}>
          <RegisterScreen 
            onRegister={handleRegister} 
            onGoToLogin={() => navigate('/')} 
          />
        </Suspense>
      } />
      <Route path="/userManagement" element={
        <Suspense fallback={<div>Cargando...</div>}>
          <UserManagementScreen
            users={users}
            onRoleChange={handleRoleChange}
            onResetPassword={handleResetPassword}
            onViewProfile={user => {
              setShowUserLoading(true);
              setTimeout(() => {
                setSelectedClient(user);
                navigate('/adminViewClientRoutines');
                setShowUserLoading(false);
              }, 1000);
            }}
            onDeleteUser={handleDeleteUser}
          />
        </Suspense>
      } />
      <Route path="/adminViewClientRoutines" element={
        <Suspense fallback={<div>Cargando...</div>}>
          <ClientRoutineList
            client={selectedClient}
            routines={clientRoutines}
            onSelectRoutine={handleSelectRoutine}
            isEditable={true}
            onBack={() => {
              setSelectedClient(null);
              navigate('/userManagement');
            }}
          />
        </Suspense>
      } />
      <Route path="/routineDetail" element={
        selectedRoutine ? (
          <Suspense fallback={<div>Cargando...</div>}>
            <RoutineDetail
              routine={selectedRoutine}
              onUpdateRoutine={handleUpdateRoutine}
              onDeleteRoutine={handleDeleteRoutine}
              isEditable={true}
              exercises={Array.isArray(selectedRoutine?.exercises) ? selectedRoutine.exercises : []}
              onAddExerciseClick={() => navigate('/addExercise')}
              onDeleteExercise={handleDeleteExercise}
              canAddDailyTracking={true}
            />
          </Suspense>
        ) : (
          <Navigate to={currentUser?.role === 'admin' ? '/adminViewClientRoutines' : '/clientDashboard'} />
        )
      } />
      <Route path="/addExercise" element={
        <Suspense fallback={<div>Cargando...</div>}>
          <AddExerciseScreen
            onAddExercise={handleAddExerciseClick}
            onBack={() => navigate('/routineDetail')}
          />
        </Suspense>
      } />
      <Route path="/clientDashboard" element={
        <Suspense fallback={<div>Cargando...</div>}>
          <ClientRoutineList
            client={selectedClient}
            routines={clientRoutines}
            onSelectRoutine={handleSelectRoutine}
            isEditable={false}
          />
        </Suspense>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
