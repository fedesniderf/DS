import React, { useState } from 'react';
import DatePicker from './DatePicker';

const RoutineDetail = ({ routine, onUpdateRoutine, isEditable, onAddExerciseClick }) => {
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editedSets, setEditedSets] = useState('');
  const [editedReps, setEditedReps] = useState('');
  const [editedWeight, setEditedWeight] = useState('');
  const [editedMedia, setEditedMedia] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedTime, setEditedTime] = useState('');
  const [editedRest, setEditedRest] = useState('');

  // Estados para la edición de la rutina
  const [editingRoutineDetails, setEditingRoutineDetails] = useState(false);
  const [editedRoutineName, setEditedRoutineName] = useState(routine.name);
  const [editedStartDate, setEditedStartDate] = useState(routine.startDate);
  const [editedEndDate, setEditedEndDate] = useState(routine.endDate);
  const [editedDescription, setEditedDescription] = useState(routine.description || '');

  // Estado para colapsar/expandir el seguimiento de cada ejercicio
  const [expandedExerciseTracking, setExpandedExerciseTracking] = useState({});

  const handleEditClick = (exercise) => {
    setEditingExerciseId(exercise.id);
    setEditedSets(exercise.sets);
    setEditedReps(exercise.reps);
    setEditedWeight(exercise.weight);
    setEditedMedia(exercise.media || '');
    setEditedNotes(exercise.notes || '');
    setEditedTime(exercise.time || '');
    setEditedRest(exercise.rest || '');
  };

  const handleSaveClick = (exerciseId) => {
    const updatedExercises = routine.exercises.map((ex) =>
      ex.id === exerciseId
        ? {
            ...ex,
            sets: editedSets,
            reps: editedReps,
            weight: editedWeight,
            media: editedMedia,
            notes: editedNotes,
            time: editedTime,
            rest: editedRest,
          }
        : ex
    );
    onUpdateRoutine({ ...routine, exercises: updatedExercises });
    setEditingExerciseId(null);
  };

  const handleCancelEditExercise = () => {
    setEditingExerciseId(null);
  };

  const handleDeleteExercise = (exerciseId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      const updatedExercises = routine.exercises.filter((ex) => ex.id !== exerciseId);
      onUpdateRoutine({ ...routine, exercises: updatedExercises });
    }
  };

  const handleSaveRoutineDetails = () => {
    onUpdateRoutine({
      ...routine,
      name: editedRoutineName,
      startDate: editedStartDate,
      endDate: editedEndDate,
      description: editedDescription,
    });
    setEditingRoutineDetails(false);
  };

  const handleCancelEditRoutineDetails = () => {
    setEditedRoutineName(routine.name);
    setEditedStartDate(routine.startDate);
    setEditedEndDate(routine.endDate);
    setEditedDescription(routine.description || '');
    setEditingRoutineDetails(false);
  };

  // Agrupar ejercicios por día y luego por sección
  const groupedExercises = routine.exercises.reduce((acc, exercise) => {
    const day = exercise.day || 'Sin Día';
    const section = exercise.section || 'Sin Sección';

    if (!acc[day]) {
      acc[day] = {};
    }
    if (!acc[day][section]) {
      acc[day][section] = [];
    }
    acc[day][section].push(exercise);
    return acc;
  }, {});

  const sortedDays = Object.keys(groupedExercises).sort((a, b) => {
    if (a.startsWith('Día') && b.startsWith('Día')) {
      return parseInt(a.replace('Día ', '')) - parseInt(b.replace('Día ', ''));
    }
    return a.localeCompare(b);
  });

  const sectionOrder = ['Warm Up', 'Fuerza', 'Cardio', 'Estiramiento', 'Cool Down', 'Otros'];

  const calculateWeeks = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  };

  const handleTrackingDataChange = (exerciseId, weekIndex, field, value) => {
    const updatedExercises = routine.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const updatedWeeklyData = { ...ex.weeklyData || {} }; // Asegura que weeklyData exista
        if (!updatedWeeklyData[weekIndex]) {
          updatedWeeklyData[weekIndex] = { weight: '', generalNotes: '' };
        }
        updatedWeeklyData[weekIndex][field] = value;
        return { ...ex, weeklyData: updatedWeeklyData };
      }
      return ex;
    });
    onUpdateRoutine({ ...routine, exercises: updatedExercises });
  };

  const toggleExerciseTracking = (exerciseId) => {
    setExpandedExerciseTracking(prevState => ({
      ...prevState,
      [exerciseId]: !prevState[exerciseId]
    }));
  };

  const numWeeks = routine.startDate && routine.endDate ? calculateWeeks(routine.startDate, routine.endDate) : 0;
  const weeksArray = Array.from({ length: numWeeks }, (_, i) => i + 1);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {editingRoutineDetails ? (
        <div className="mb-6 p-4 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Editar Detalles de Rutina</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Título de la Rutina:</label>
            <input
              type="text"
              value={editedRoutineName}
              onChange={(e) => setEditedRoutineName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
            <DatePicker
              selectedDate={editedStartDate}
              onDateChange={setEditedStartDate}
              placeholder="Fecha de Inicio"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
            <DatePicker
              selectedDate={editedEndDate}
              onDateChange={setEditedEndDate}
              placeholder="Fecha de Fin"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (máx. 250 caracteres):</label>
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value.slice(0, 250))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-y"
              rows="3"
              placeholder="Agrega una descripción para la rutina"
            ></textarea>
            <p className="text-right text-xs text-gray-500">{editedDescription.length}/250</p>
          </div>
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={handleCancelEditRoutineDetails}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveRoutineDetails}
              className="px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{routine.name}</h2>
            {routine.startDate && routine.endDate && (
              <p className="text-md text-gray-600">
                Periodo: {routine.startDate} - {routine.endDate}
              </p>
            )}
            {routine.description && (
              <p className="text-sm text-gray-700 mt-2">{routine.description}</p>
            )}
          </div>
          {isEditable && (
            <button
              onClick={() => setEditingRoutineDetails(true)}
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 transition-colors font-semibold shadow-md"
            >
              Editar Rutina
            </button>
          )}
        </div>
      )}

      {routine.exercises.length === 0 ? (
        <p className="text-gray-600 text-center py-4">No hay ejercicios en esta rutina aún.</p>
      ) : (
        sortedDays.map((day) => (
          <div key={day} className="mb-8 p-4 bg-gray-100 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">{day}</h3>
            {Object.keys(groupedExercises[day]).sort((a, b) => {
              const indexA = sectionOrder.indexOf(a);
              const indexB = sectionOrder.indexOf(b);
              if (indexA === -1 && indexB === -1) return a.localeCompare(b);
              if (indexA === -1) return 1;
              if (indexB === -1) return -1;
              return indexA - indexB;
            }).map((section) => (
              <div key={section} className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">{section}</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ejercicio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Series</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repeticiones</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peso (kg)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descanso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                        {isEditable && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groupedExercises[day][section].map((exercise) => (
                        <React.Fragment key={exercise.id}>
                          <tr onClick={() => toggleExerciseTracking(exercise.id)} className="cursor-pointer hover:bg-gray-50">
                            <td data-label="Ejercicio" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercise.name}</td>
                            <td data-label="Series" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingExerciseId === exercise.id ? (
                                <input
                                  type="text"
                                  value={editedSets}
                                  onChange={(e) => setEditedSets(e.target.value)}
                                  className="w-20 px-2 py-1 border rounded-md"
                                />
                              ) : (
                                exercise.sets
                              )}
                            </td>
                            <td data-label="Repeticiones" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingExerciseId === exercise.id ? (
                                <input
                                  type="text"
                                  value={editedReps}
                                  onChange={(e) => setEditedReps(e.target.value)}
                                  className="w-20 px-2 py-1 border rounded-md"
                                />
                              ) : (
                                exercise.reps
                              )}
                            </td>
                            <td data-label="Peso (kg)" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingExerciseId === exercise.id ? (
                                <input
                                  type="text"
                                  value={editedWeight}
                                  onChange={(e) => setEditedWeight(e.target.value)}
                                  className="w-20 px-2 py-1 border rounded-md"
                                />
                              ) : (
                                exercise.weight
                              )}
                            </td>
                            <td data-label="Tiempo" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingExerciseId === exercise.id ? (
                                <input
                                  type="text"
                                  value={editedTime}
                                  onChange={(e) => setEditedTime(e.target.value)}
                                  className="w-20 px-2 py-1 border rounded-md"
                                />
                              ) : (
                                exercise.time || 'N/A'
                              )}
                            </td>
                            <td data-label="Descanso" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingExerciseId === exercise.id ? (
                                <input
                                  type="text"
                                  value={editedRest}
                                  onChange={(e) => setEditedRest(e.target.value)}
                                  className="w-20 px-2 py-1 border rounded-md"
                                />
                              ) : (
                                exercise.rest || 'N/A'
                              )}
                            </td>
                            <td data-label="Media" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingExerciseId === exercise.id ? (
                                <input
                                  type="text"
                                  value={editedMedia}
                                  onChange={(e) => setEditedMedia(e.target.value)}
                                  className="w-32 px-2 py-1 border rounded-md"
                                  placeholder="URL de media"
                                />
                              ) : (
                                exercise.media ? (
                                  <a href={exercise.media} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    Ver Media
                                  </a>
                                ) : 'N/A'
                              )}
                            </td>
                            <td data-label="Notas" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {editingExerciseId === exercise.id ? (
                                <textarea
                                  value={editedNotes}
                                  onChange={(e) => setEditedNotes(e.target.value)}
                                  className="w-40 px-2 py-1 border rounded-md resize-y"
                                  rows="2"
                                  placeholder="Notas del ejercicio"
                                ></textarea>
                              ) : (
                                exercise.notes || 'N/A'
                              )}
                            </td>
                            {isEditable && (
                              <td data-label="Acciones" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                {editingExerciseId === exercise.id ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveClick(exercise.id)}
                                      className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-semibold"
                                    >
                                      Guardar
                                    </button>
                                    <button
                                      onClick={handleCancelEditExercise}
                                      className="px-3 py-1 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-colors text-xs font-semibold"
                                    >
                                      Cancelar
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleEditClick(exercise)}
                                    className="px-3 py-1 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-xs font-semibold"
                                  >
                                    Editar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteExercise(exercise.id)}
                                  className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-semibold"
                                >
                                  Eliminar
                                </button>
                              </td>
                            )}
                          </tr>
                          {/* Sección de Seguimiento para cada ejercicio, se muestra/oculta al hacer clic en la fila */}
                          {expandedExerciseTracking[exercise.id] && (
                            <tr>
                              <td colSpan={isEditable ? 10 : 9} className="p-4 bg-gray-50 border-t border-gray-200">
                                <h5 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                  </svg>
                                  Seguimiento de {exercise.name}
                                </h5>
                                <div className="space-y-4">
                                  {weeksArray.map(week => (
                                    <div key={week} className="flex flex-col p-3 border border-gray-200 rounded-md bg-white">
                                      <span className="text-sm font-medium text-gray-700 mb-2">Semana {week}:</span>
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
                                        <input
                                          type="number"
                                          className="w-full sm:w-24 px-2 py-1 border border-gray-300 rounded-md text-center text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                          placeholder="Peso (kg)"
                                          value={exercise.weeklyData?.[week]?.weight || ''}
                                          onChange={(e) => handleTrackingDataChange(exercise.id, week, 'weight', e.target.value)}
                                          disabled={!isEditable} // Editable por admin y cliente
                                        />
                                        <input
                                          type="text"
                                          className="w-full flex-grow px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                                          placeholder="Notas (ej. cómo me sentí)"
                                          value={exercise.weeklyData?.[week]?.generalNotes || ''}
                                          onChange={(e) => handleTrackingDataChange(exercise.id, week, 'generalNotes', e.target.value)}
                                          disabled={!isEditable} // Editable por admin y cliente
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))
      )}

      {isEditable && (
        <button
          onClick={onAddExerciseClick}
          className="w-full mt-6 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md"
        >
          Agregar Ejercicio
        </button>
      )}
    </div>
  );
};

export default RoutineDetail;