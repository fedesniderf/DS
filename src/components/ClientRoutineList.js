import React, { useState, useEffect } from 'react';
import { generateUniqueId } from '../utils/helpers';

const ClientRoutineList = ({ client, routines, onSelectRoutine, onAddRoutine, isEditable, onDeleteRoutine, onUpdateRoutine }) => {
  const [newRoutineName, setNewRoutineName] = useState('');
  const [newRoutineStartDate, setNewRoutineStartDate] = useState('');
  const [newRoutineEndDate, setNewRoutineEndDate] = useState('');
  const [showAddRoutineForm, setShowAddRoutineForm] = useState(false);
  // Eliminamos expandedRoutineId y collapsedExercises de aquí, ya que el seguimiento se mueve a RoutineDetail
  // const [expandedRoutineId, setExpandedRoutineId] = useState(null); 
  // const [collapsedExercises, setCollapsedExercises] = useState({}); 

  const handleAddRoutine = () => {
    if (newRoutineName.trim() && newRoutineStartDate && newRoutineEndDate) {
      const newRoutine = {
        id: generateUniqueId(),
        clientId: client.id,
        name: newRoutineName,
        startDate: newRoutineStartDate,
        endDate: newRoutineEndDate,
        exercises: [],
        // Eliminamos weeklyData y generalNotes de aquí, ya que el seguimiento se mueve a RoutineDetail
        // weeklyData: {}, 
        // generalNotes: {}, 
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

  // Eliminamos handleDataChange y handleGeneralNoteChange de aquí
  // const handleDataChange = (routineId, weekIndex, exerciseName, field, value) => { ... };
  // const handleGeneralNoteChange = (routineId, weekIndex, value) => { ... };

  // Eliminamos toggleExerciseCollapse de aquí
  // const toggleExerciseCollapse = (exerciseId) => { ... };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Rutinas de {client.name}</h2>

      {routines.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No hay rutinas asignadas a este cliente aún.</p>
      ) : (
        <div className="space-y-4">
          {routines.map((routine) => {
            // Eliminamos numWeeks y weeksArray de aquí, ya que el seguimiento se mueve a RoutineDetail
            // const numWeeks = routine.startDate && routine.endDate ? calculateWeeks(routine.startDate, routine.endDate) : 0;
            // const weeksArray = Array.from({ length: numWeeks }, (_, i) => i + 1);

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
                  Periodo: {routine.startDate} - {routine.endDate}
                  {/* Eliminamos la visualización de semanas aquí */}
                  {/* ({numWeeks} semanas) */}
                </p>

                {/* Eliminamos la sección de Seguimiento de aquí */}
                {/* {numWeeks > 0 && ( ... )} */}
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