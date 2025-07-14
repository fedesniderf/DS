import React, { useState } from 'react';
import { generateUniqueId } from '../utils/helpers';

const AddExerciseScreen = ({ onAddExercise, onBack }) => {
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [media, setMedia] = useState('');
  const [notes, setNotes] = useState('');
  const [day, setDay] = useState('');
  const [section, setSection] = useState(''); // Nuevo campo: Sección
  const [time, setTime] = useState('');     // Nuevo campo: Tiempo
  const [rest, setRest] = useState('');     // Nuevo campo: Descanso

  const handleAddExercise = () => {
    if (!exerciseName.trim() || !day.trim()) {
      alert('El nombre del ejercicio y el día son obligatorios.');
      return;
    }

    const newExercise = {
      id: generateUniqueId(),
      name: exerciseName,
      sets: sets,
      reps: reps,
      weight: weight,
      media: media,
      notes: notes,
      day: day,
      section: section, // Incluir nuevo campo
      time: time,       // Incluir nuevo campo
      rest: rest,       // Incluir nuevo campo
    };

    onAddExercise(newExercise);
    onBack(); // Regresar a la vista de detalle de rutina
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar Nuevo Ejercicio</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Ejercicio:</label>
          <input
            type="text"
            value={exerciseName}
            onChange={(e) => setExerciseName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. Sentadilla"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Día:</label>
          <input
            type="text"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. Día 1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sección:</label>
          <input
            type="text"
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. Fuerza, Cardio"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Series:</label>
          <input
            type="text"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. 3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Repeticiones:</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. 10-12"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg):</label>
          <input
            type="text"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. 50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo (min/seg):</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. 30s, 1min"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descanso (seg):</label>
          <input
            type="text"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. 60"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Media (URL):</label>
          <input
            type="text"
            value={media}
            onChange={(e) => setMedia(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. https://youtube.com/video"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas:</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-y"
          rows="3"
          placeholder="Cualquier nota adicional sobre el ejercicio"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddExercise}
          className="px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
        >
          Agregar Ejercicio
        </button>
      </div>
    </div>
  );
};

export default AddExerciseScreen;