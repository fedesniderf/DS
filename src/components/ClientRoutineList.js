import React, { useState, useEffect } from 'react';
import { generateUniqueId } from '../utils/helpers';

const ClientRoutineList = ({ client, routines, onSelectRoutine, onAddRoutine, isEditable, onDeleteRoutine, onUpdateRoutine }) => {
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineStartDate, setNewRoutineStartDate] = useState('');
  const [newRoutineEndDate, setNewRoutineEndDate] = useState('');
  const [showAddRoutineForm, setShowAddRoutineForm] = useState(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState(null); // Para expandir/colapsar la sección de seguimiento
  const [collapsedExercises, setCollapsedExercises] = useState({}); // Para colapsar/expandir ejercicios individuales

  const handleAddRoutine = () => {
    if (newRoutineName.trim() && newRoutineStartDate && newRoutineEndDate) {
      const newRoutine = {
        id: generateUniqueId(),
        clientId: client.id,
        name: newRoutineName,
        startDate: newRoutineStartDate,
        endDate: newRoutineEndDate,
        exercises: [],
        weeklyData: {}, // Cambiado a weeklyData para incluir peso y observaciones
      };
      onAddRoutine(newRoutine);
      setNewRoutineName('');
      setNewRoutineStartDate('');
      setNewRoutineEndDate('');
      setShowAddRoutineForm(false);
    } else {
      alert('Por favor, completa todos los campos para la nueva rutina.');
    }
  };

  const calculateWeeks = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  };

  const handleDataChange = (routineId, weekIndex, exerciseName, field, value) => {
    const updatedRoutines = routines.map(r => {
      if (r.id === routineId) {
        const updatedWeeklyData = { ...r.weeklyData };
        if (!updatedWeeklyData[weekIndex]) {
          updatedWeeklyData[weekIndex] = {};
        }
        if (!updatedWeeklyData[weekIndex][exerciseName]) {
          updatedWeeklyData[weekIndex][exerciseName] = { weight: '', observations: [] }; // observations ahora es un array
        }

        if (field === 'observations') {
          // Para el historial, agregamos la nueva observación con un timestamp
          const currentObservations = updatedWeeklyData[weekIndex][exerciseName].observations || [];
          const newObservationEntry = {
            timestamp: new Date().toISOString(),
            text: value
          };
          updatedWeeklyData[weekIndex][exerciseName].observations = [...currentObservations, newObservationEntry];
        } else {
          updatedWeeklyData[weekIndex][exerciseName][field] = value;
        }
        
        return { ...r, weeklyData: updatedWeeklyData };
      }
      return r;
    });
    const routineToUpdate = updatedRoutines.find(r => r.id === routineId);
    if (routineToUpdate) {
      onUpdateRoutine(routineToUpdate);
    }
  };

  const toggleExerciseCollapse = (exerciseId) => {
    setCollapsedExercises(prevState => ({
      ...prevState,
      [exerciseId]: !prevState[exerciseId]
    }));
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Rutinas de {client.name}</h2>

      {routines.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No hay rutinas asignadas a este cliente aún.</p>
      ) : (
        <div className="space-y-4">
          {routines.map((routine) => {
            const numWeeks = routine.startDate && routine.endDate ? calculateWeeks(routine.startDate, routine.endDate) : 0;
            const weeksArray = Array.from({ length: numWeeks }, (_, i) => i + 1);

            return (
              <div key={routine.id} className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold text-gray-700">{routine.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onSelectRoutine(routine)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold shadow-md"
                    >
                      Ver Detalles
                    </button>
                    {isEditable && (
                      <button
                        onClick={() => onDeleteRoutine(routine.id)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold shadow-md"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Periodo: {routine.startDate} - {routine.endDate} ({numWeeks} semanas)
                </p>

                {/* Sección de Seguimiento */}
                {numWeeks > 0 && (
                  <div className="mt-4 border-t pt-4 border-gray-200">
                    <button
                      onClick={() => setExpandedRoutineId(expandedRoutineId === routine.id ? null : routine.id)}
                      className="flex items-center text-gray-700 font-semibold hover:text-black transition-colors"
                    >
                      Seguimiento
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ml-2 transform ${expandedRoutineId === routine.id ? 'rotate-90' : ''} transition-transform`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {expandedRoutineId === routine.id && (
                      <div className="mt-4 space-y-4">
                        {routine.exercises.map(exercise => (
                          <div key={exercise.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-md font-semibold text-gray-800">{exercise.name}:</h4>
                              <button
                                onClick={() => toggleExerciseCollapse(exercise.id)}
                                className="text-gray-500 hover:text-gray-700 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-5 w-5 transform ${collapsedExercises[exercise.id] ? 'rotate-0' : 'rotate-180'} transition-transform`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                            
                            {!collapsedExercises[exercise.id] && (
                              <div className="space-y-4"> {/* Contenedor para las semanas apiladas */}
                                {weeksArray.map(week => (
                                  <div key={week} className="flex flex-col p-3 border border-gray-200 rounded-md bg-gray-50">
                                    <span className="text-sm font-medium text-gray-700 mb-2">Semana {week}:</span>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                                      <input
                                        type="number"
                                        className="w-full sm:w-24 px-2 py-1 border border-gray-300 rounded-md text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="Peso (kg)"
                                        value={routine.weeklyData?.[week]?.[exercise.name]?.weight || ''}
                                        onChange={(e) => handleDataChange(routine.id, week, exercise.name, 'weight', e.target.value)}
                                        disabled={!isEditable && client.id !== client.id}
                                      />
                                      <input
                                        type="text"
                                        className="w-full flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                        placeholder="Observaciones"
                                        value={''} // El campo de entrada siempre está vacío para nuevas observaciones
                                        onBlur={(e) => { // Al perder el foco, se guarda la observación
                                          if (e.target.value.trim()) {
                                            handleDataChange(routine.id, week, exercise.name, 'observations', e.target.value.trim());
                                            e.target.value = ''; // Limpiar el campo después de guardar
                                          }
                                        }}
                                        onKeyPress={(e) => { // También al presionar Enter
                                          if (e.key === 'Enter' && e.target.value.trim()) {
                                            handleDataChange(routine.id, week, exercise.name, 'observations', e.target.value.trim());
                                            e.target.value = ''; // Limpiar el campo después de guardar
                                          }
                                        }}
                                        disabled={!isEditable && client.id !== client.id}
                                      />
                                    </div>
                                    {/* Historial de Observaciones */}
                                    {routine.weeklyData?.[week]?.[exercise.name]?.observations && routine.weeklyData[week][exercise.name].observations.length > 0 && (
                                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                                        <p className="font-semibold">Historial:</p>
                                        {routine.weeklyData[week][exercise.name].observations.map((obs, obsIndex) => (
                                          <p key={obsIndex} className="break-words">
                                            {new Date(obs.timestamp).toLocaleDateString()}: {obs.text}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isEditable && (
        <div className="mt-6">
          <button
            onClick={() => setShowAddRoutineForm(!showAddRoutineForm)}
            className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md"
          >
            {showAddRoutineForm ? 'Cancelar' : 'Agregar Nueva Rutina'}
          </button>

          {showAddRoutineForm && (
            <div className="mt-4 p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-700 mb-4">Nueva Rutina</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Rutina:</label>
                <input
                  type="text"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                  placeholder="Ej. Rutina de Fuerza - Mes 1"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
                <input
                  type="date"
                  value={newRoutineStartDate}
                  onChange={(e) => setNewRoutineStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
                <input
                  type="date"
                  value={newRoutineEndDate}
                  onChange={(e) => setNewRoutineEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                />
              </div>
              <button
                onClick={handleAddRoutine}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md"
              >
                Crear Rutina
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientRoutineList;