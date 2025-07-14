import React, { useState } from 'react';
import DatePicker from './DatePicker';

const RoutineDetail = ({ routine, onUpdateRoutine, isEditable, onAddExerciseClick }) => {
  const [editingExerciseId, setEditingExerciseId] = useState(null);
  const [editedSets, setEditedSets] = useState('');
  const [editedReps, setEditedReps] = useState('');
  const [editedWeight, setEditedWeight] = useState('');
  const [editedMedia, setEditedMedia] = useState('');
  const [editedNotes, setEditedNotes] = useState('');
  const [editedTime, setEditedTime] = useState(''); // Nuevo estado para el tiempo
  const [editedRest, setEditedRest] = useState(''); // Nuevo estado para el descanso

  // Estados para la edición de la rutina
  const [editingRoutineDetails, setEditingRoutineDetails] = useState(false);
  const [editedRoutineName, setEditedRoutineName] = useState(routine.name);
  const [editedStartDate, setEditedStartDate] = useState(routine.startDate);
  const [editedEndDate, setEditedEndDate] = useState(routine.endDate);
  const [editedDescription, setEditedDescription] = useState(routine.description || '');

  const handleEditClick = (exercise) => {
    setEditingExerciseId(exercise.id);
    setEditedSets(exercise.sets);
    setEditedReps(exercise.reps);
    setEditedWeight(exercise.weight);
    setEditedMedia(exercise.media || '');
    setEditedNotes(exercise.notes || '');
    setEditedTime(exercise.time || ''); // Cargar el valor de tiempo
    setEditedRest(exercise.rest || ''); // Cargar el valor de descanso
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
            time: editedTime, // Guardar el valor de tiempo
            rest: editedRest, // Guardar el valor de descanso
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th> {/* Nuevo encabezado */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descanso</th> {/* Nuevo encabezado */}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Media</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
                        {isEditable && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {groupedExercises[day][section].map((exercise) => (
                        <tr key={exercise.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{exercise.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* Campo de Tiempo */}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"> {/* Campo de Descanso */}
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
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