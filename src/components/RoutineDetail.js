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

  // Estado para el seguimiento diario de PF y PE
  const [selectedDateForDailyTracking, setSelectedDateForDailyTracking] = useState(null);
  const [currentPF, setCurrentPF] = useState('');
  const [currentPE, setCurrentPE] = useState('');
  const [expandedDailyTracking, setExpandedDailyTracking] = useState(false); // Nuevo estado para expandir/colapsar seguimiento diario

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

  const sectionOrder = ['Warm Up', 'Trabajo DS', 'Out', 'Fuerza', 'Cardio', 'Estiramiento', 'Cool Down', 'Otros'];

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

  const handleAddDailyTracking = () => {
    if (selectedDateForDailyTracking && currentPF && currentPE) {
      const updatedRoutine = { ...routine };
      if (!updatedRoutine.dailyTracking) {
        updatedRoutine.dailyTracking = {};
      }
      const dateObject = new Date(selectedDateForDailyTracking);
      const formattedDate = dateObject.toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      if (!updatedRoutine.dailyTracking[formattedDate]) {
        updatedRoutine.dailyTracking[formattedDate] = [];
      }
      updatedRoutine.dailyTracking[formattedDate].push({
        PF: currentPF,
        PE: currentPE,
      });
      onUpdateRoutine(updatedRoutine);
      setCurrentPF('');
      setCurrentPE('');
      setSelectedDateForDailyTracking(null); // Limpiar la fecha seleccionada
    } else {
      alert('Por favor, selecciona una fecha e ingresa los valores de PF y PE.');
    }
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
          <div className="mb-4 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio:</label>
              <DatePicker
                selectedDate={editedStartDate}
                onDateChange={setEditedStartDate}
                placeholder="Fecha de Inicio"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin:</label>
              <DatePicker
                selectedDate={editedEndDate}
                onDateChange={setEditedEndDate}
                placeholder="Fecha de Fin"
              />
            </div>
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
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold flex items-center justify-center"
              title="Cancelar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={handleSaveRoutineDetails}
              className="px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold shadow-md flex items-center justify-center"
              title="Guardar Cambios"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
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
              className="px-4 py-2 rounded-xl bg-yellow-600 text-white hover:bg-yellow-700 transition-colors font-semibold shadow-md flex items-center justify-center"
              title="Editar Rutina"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
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
              <div 
                key={section} 
                className={`mb-6 p-4 bg-white rounded-xl shadow-sm`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-lg font-semibold text-gray-700">{section}</h4>
                </div>
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
                          <tr onClick={() => toggleExerciseTracking(exercise.id)} className="cursor-pointer hover:bg-gray-50 transition-colors">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 inline-block">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>
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
                              <td data-label="Acciones" className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2 flex flex-wrap justify-end">
                                {editingExerciseId === exercise.id ? (
                                  <>
                                    <button
                                      onClick={() => handleSaveClick(exercise.id)}
                                      className="px-3 py-1 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-xs font-semibold flex items-center justify-center mb-1 sm:mb-0"
                                      title="Guardar"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={handleCancelEditExercise}
                                      className="px-3 py-1 rounded-lg bg-gray-400 text-white hover:bg-gray-500 transition-colors text-xs font-semibold flex items-center justify-center mb-1 sm:mb-0"
                                      title="Cancelar"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleEditClick(exercise)}
                                    className="px-3 py-1 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors text-xs font-semibold flex items-center justify-center mb-1 sm:mb-0"
                                    title="Editar"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteExercise(exercise.id)}
                                  className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-xs font-semibold flex items-center justify-center mb-1 sm:mb-0"
                                  title="Eliminar"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.924a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165M12 2.25h.007v.008H12V2.25z" />
                                  </svg>
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
            {/* Sección de Seguimiento Diario de PF y PE */}
            <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => setExpandedDailyTracking(!expandedDailyTracking)}>
                <h4 className="text-lg font-semibold text-gray-700">Seguimiento Diario</h4>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 transform ${expandedDailyTracking ? 'rotate-180' : 'rotate-0'} transition-transform`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </div>
              {expandedDailyTracking && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Fecha:</label>
                      <DatePicker
                        selectedDate={selectedDateForDailyTracking}
                        onDateChange={setSelectedDateForDailyTracking}
                        placeholder="Selecciona una fecha"
                        disabled={!isEditable}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">PF (Percepción de Fatiga):</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
                        placeholder="Ej. 1-10"
                        value={currentPF}
                        onChange={(e) => setCurrentPF(e.target.value)}
                        disabled={!isEditable}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">PE (Percepción de Esfuerzo):</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
                        placeholder="Ej. 1-10"
                        value={currentPE}
                        onChange={(e) => setCurrentPE(e.target.value)}
                        disabled={!isEditable}
                      />
                    </div>
                    <button
                      onClick={handleAddDailyTracking}
                      className="mt-auto px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center"
                      title="Agregar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                  {/* Historial de PF y PE por día */}
                  {Object.keys(routine.dailyTracking || {}).length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-md font-semibold text-gray-700 mb-2">Historial de PF y PE:</h5>
                      <div className="space-y-2">
                        {Object.keys(routine.dailyTracking).sort().map(date => (
                          routine.dailyTracking[date].map((entry, index) => (
                            <div key={`${date}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded-md border border-gray-200">
                              <span className="text-sm text-gray-700">Fecha: {date}</span>
                              <span className="text-sm text-gray-700">PF: {entry.PF}</span>
                              <span className="text-sm text-gray-700">PE: {entry.PE}</span>
                            </div>
                          ))
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))
      )}

      {isEditable && (
        <button
          onClick={onAddExerciseClick}
          className="w-full mt-6 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md flex items-center justify-center"
          title="Agregar Ejercicio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default RoutineDetail;