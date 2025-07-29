  // Estado para edición de ejercicio
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [editExercise, setEditExercise] = React.useState(null);
  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseSets, setExerciseSets] = React.useState("");
  const [exerciseReps, setExerciseReps] = React.useState("");
  const [exerciseWeight, setExerciseWeight] = React.useState("");
  const [exerciseTime, setExerciseTime] = React.useState("");
  const [exerciseRest, setExerciseRest] = React.useState("");

  // Handler para editar ejercicio
  const handleEditExerciseClick = (ex) => {
    setEditExercise(ex);
    setExerciseName(ex.name || "");
    setExerciseSets(ex.sets || "");
    setExerciseReps(ex.reps || "");
    setExerciseWeight(ex.weight || "");
    setExerciseTime(ex.time || "");
    setExerciseRest(ex.rest || "");
    setExerciseDay(ex.day || "");
    setShowExerciseModal(true);
  };
// ...existing code...
import React from "react";
import { supabase } from "../supabaseClient";

const RoutineDetail = ({
  routine,
  onUpdateRoutine = () => {},
  isEditable,
  onAddExerciseClick = () => {},
  canAddDailyTracking = false,
}) => {
  // Calcular semanas de la rutina
  const getWeekOptions = () => {
    if (!routine.startDate || !routine.endDate) return [];
    const start = new Date(routine.startDate);
    const end = new Date(routine.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numWeeks = Math.max(1, Math.ceil(diffDays / 7));
    return Array.from({ length: numWeeks }, (_, i) => ({ value: (i + 1).toString(), label: `Semana ${i + 1}` }));
  };
  // Definir exercises al inicio para evitar ReferenceError
  const exercises = Array.isArray(routine.exercises) ? routine.exercises : [];

  // Opciones para el desplegable de día
  const dayOptions = [
    { value: '', label: 'Selecciona un día' },
    { value: '1', label: 'Día 1' },
    { value: '2', label: 'Día 2' },
    { value: '3', label: 'Día 3' },
    { value: '4', label: 'Día 4' },
    { value: '5', label: 'Día 5' },
    { value: '6', label: 'Día 6' },
    { value: '7', label: 'Día 7' },
  ];
  const [exerciseDay, setExerciseDay] = React.useState("");

  // Estado para modales y formularios
  // Estado para seguimiento semanal
  const [showWeeklyModal, setShowWeeklyModal] = React.useState(false);
  const [weeklyExercise, setWeeklyExercise] = React.useState(null);
  const [weekNumber, setWeekNumber] = React.useState("");
  const [weekWeight, setWeekWeight] = React.useState("");
  const [weekNotes, setWeekNotes] = React.useState("");

  const handleOpenWeeklyModal = (exercise) => {
    setWeeklyExercise(exercise);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes("");
    setShowWeeklyModal(true);
  };

  // ...existing logic and handlers...

  // Agrupar y renderizar ejercicios por día
  let ejerciciosPorDia = null;
  if (exercises.length === 0) {
    ejerciciosPorDia = <p className="text-gray-600 text-center py-4">No hay ejercicios para seguimiento.</p>;
  } else {
    const grouped = exercises.reduce((acc, ex) => {
      const day = ex.day || 'Sin día';
      if (!acc[day]) acc[day] = [];
      acc[day].push(ex);
      return acc;
    }, {});
    const orderedDays = [
      '1','2','3','4','5','6','7'
    ].filter(d => grouped[d]).concat(Object.keys(grouped).filter(d => !['1','2','3','4','5','6','7'].includes(d)));
    ejerciciosPorDia = orderedDays.map(day => (
      <div key={day} className="mb-6">
        <h4 className="text-md font-bold text-blue-700 mb-2">{['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'Sin día asignado'}</h4>
        <div className="grid gap-4">
          {grouped[day].map((ex) => (
            <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-md font-semibold text-gray-800">{ex.name}</h5>
                {/* Ícono para agregar seguimiento semanal, solo para clientes */}
                {!isEditable && canAddDailyTracking && (
                  <button
                    className="ml-2 p-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                    title="Agregar seguimiento semanal"
                    onClick={() => handleOpenWeeklyModal(ex)}
                  >
                    {/* Ícono clipboard/plus */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2 text-sm text-gray-700">
                <div><span className="font-semibold">Series:</span> {ex.sets || '-'}</div>
                <div><span className="font-semibold">Repeticiones:</span> {ex.reps || '-'}</div>
                <div><span className="font-semibold">Peso (Kg):</span> {ex.weight || '-'}</div>
                <div><span className="font-semibold">Tiempo (seg):</span> {ex.time || '-'}</div>
                <div><span className="font-semibold">Descanso (seg):</span> {ex.rest || '-'}</div>
                <div><span className="font-semibold">Día:</span> {ex.day || '-'}</div>
              </div>
              {ex.weeklyData ? (
                <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden mb-2">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-2 py-1">Semana</th>
                      <th className="px-2 py-1">Peso</th>
                      <th className="px-2 py-1">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(ex.weeklyData).map(([week, data]) => (
                      <tr key={week} className="border-t">
                        <td className="px-2 py-1">{week}</td>
                        <td className="px-2 py-1">{data.weight}</td>
                        <td className="px-2 py-1">{data.generalNotes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500">Sin datos de seguimiento semanal.</p>
              )}
              {/* Botón para editar ejercicio si esEditable */}
              {isEditable && (
                <button
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleEditExerciseClick(ex)}
                >
                  Editar ejercicio
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  }

  // Función para guardar la rutina actual como plantilla
  const handleSaveAsTemplate = async () => {
    if (!routine.name || exercises.length === 0) {
      alert('La rutina debe tener un nombre y al menos un ejercicio para guardar como plantilla.');
      return;
    }

    const templateName = prompt(`Ingresa el nombre para la plantilla (actual: "${routine.name}"):`);
    if (!templateName || templateName.trim() === '') {
      return; // Usuario canceló
    }

    try {
      // Crear la plantilla sin datos específicos del cliente
      const templateData = {
        name: templateName.trim(),
        description: routine.description || '',
        exercises: exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          time: ex.time,
          rest: ex.rest,
          day: ex.day,
          round: ex.round
        })),
        // No incluir datos específicos del cliente como startDate, endDate, client_id
      };

      const { data, error } = await supabase
        .from('rutinas_templates')
        .insert([templateData])
        .select();

      if (error) {
        alert('Error al guardar la plantilla: ' + error.message);
      } else {
        alert('Plantilla guardada exitosamente. Ahora está disponible en la sección de plantillas.');
      }
    } catch (error) {
      alert('Error inesperado al guardar la plantilla: ' + error.message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700">Ejercicios por Día</h3>
          {isEditable && exercises.length > 0 && (
            <button
              onClick={handleSaveAsTemplate}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-sm flex items-center gap-2"
              title="Guardar esta rutina como plantilla"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Guardar como plantilla
            </button>
          )}
        </div>
        {ejerciciosPorDia}
      </div>
      {/* Modal para agregar seguimiento semanal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Agregar seguimiento semanal</h3>
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={weekNumber}
              onChange={e => setWeekNumber(e.target.value)}
            >
              <option value="">Selecciona la semana</option>
              {getWeekOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Peso (Kg)"
              value={weekWeight}
              onChange={e => setWeekWeight(e.target.value)}
            />
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Notas (máx 100 caracteres)"
              maxLength={100}
              value={weekNotes}
              onChange={e => setWeekNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCloseWeeklyModal}
              >Cancelar</button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                onClick={handleSaveWeekly}
                disabled={!weekNumber}
              >Guardar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal para editar ejercicio */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar ejercicio</h3>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Nombre del ejercicio"
              value={exerciseName}
              onChange={e => setExerciseName(e.target.value)}
            />
            <select
              className="w-full border rounded px-3 py-2 mb-2"
              value={exerciseDay}
              onChange={e => setExerciseDay(e.target.value)}
            >
              {dayOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Series"
              value={exerciseSets}
              onChange={e => setExerciseSets(e.target.value)}
            />
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Repeticiones"
              value={exerciseReps}
              onChange={e => setExerciseReps(e.target.value)}
            />
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Peso (Kg)"
              value={exerciseWeight}
              onChange={e => setExerciseWeight(e.target.value)}
            />
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-2"
              placeholder="Tiempo (segundos)"
              value={exerciseTime}
              onChange={e => setExerciseTime(e.target.value)}
            />
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Descanso (segundos)"
              value={exerciseRest}
              onChange={e => setExerciseRest(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowExerciseModal(false);
                  setEditExercise(null);
                }}
              >Cancelar</button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  // Guardar cambios (puedes personalizar la lógica)
                  if (routine.id) {
                    onUpdateRoutine({
                      id: routine.id,
                      action: 'editExercise',
                      data: {
                        ...editExercise,
                        name: exerciseName,
                        sets: exerciseSets,
                        reps: exerciseReps,
                        weight: exerciseWeight,
                        time: exerciseTime,
                        rest: exerciseRest,
                        day: exerciseDay,
                      }
                    });
                    setShowExerciseModal(false);
                    setEditExercise(null);
                  } else {
                    alert('No se encontró el ID de la rutina.');
                  }
                }}
                disabled={!exerciseName.trim()}
              >Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoutineDetail;
