import React, { useState } from 'react';
import { generateUniqueId } from '../utils/helpers';

const AddExerciseScreen = ({ onAddExercise, onBack }) => {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [media, setMedia] = useState('');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState('');
  const [rest, setRest] = useState('');
  const [day, setDay] = useState(''); // Cambiado a string para el valor seleccionado
  const [section, setSection] = useState(''); // Cambiado a string para el valor seleccionado

  const sectionOptions = [
    { value: '', label: 'Selecciona una sección' },
    { value: 'Warm Up', label: '1 - Warm Up' },
    { value: 'Trabajo DS', label: '2 - Trabajo DS' },
    { value: 'Out', label: '3 - Out' },
  ];

  const dayOptions = [
    { value: '', label: 'Selecciona un día' },
    { value: 'Día 1', label: 'Día 1' },
    { value: 'Día 2', label: 'Día 2' },
    { value: 'Día 3', label: 'Día 3' },
    { value: 'Día 4', label: 'Día 4' },
    { value: 'Día 5', label: 'Día 5' },
    { value: 'Día 6', label: 'Día 6' },
    { value: 'Día 7', label: 'Día 7' },
  ];

  const handleAddExercise = () => {
    if (name && sets && reps && weight && day && section) {
      const newExercise = {
        id: generateUniqueId(),
        name,
        sets,
        reps,
        weight,
        media,
        notes,
        time,
        rest,
        day,
        section,
        weeklyData: {}, // Inicializar weeklyData para el seguimiento
      };
      onAddExercise(newExercise);
      onBack(); // Regresar a la vista de detalles de la rutina
    } else {
      alert('Por favor, completa todos los campos obligatorios (Nombre, Series, Repeticiones, Peso, Día, Sección).');
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Agregar Nuevo Ejercicio</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
          Nombre del Ejercicio:
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
          placeholder="Ej. Sentadilla"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="sets">
            Series:
          </label>
          <input
            type="text"
            id="sets"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 3"
            value={sets}
            onChange={(e) => setSets(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reps">
            Repeticiones:
          </label>
          <input
            type="text"
            id="reps"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 10-12"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="weight">
            Peso (kg):
          </label>
          <input
            type="text"
            id="weight"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 60"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time">
            Tiempo (segundos/minutos):
          </label>
          <input
            type="text"
            id="time"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 30s o 5min"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rest">
            Descanso (segundos/minutos):
          </label>
          <input
            type="text"
            id="rest"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 60s o 2min"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="media">
            URL de Media (video/imagen):
          </label>
          <input
            type="text"
            id="media"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. https://youtube.com/ejercicio"
            value={media}
            onChange={(e) => setMedia(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="day">
            Día:
          </label>
          <select
            id="day"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          >
            {dayOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="section">
            Sección:
          </label>
          <select
            id="section"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            {sectionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
          Notas Adicionales:
        </label>
        <textarea
          id="notes"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out resize-y"
          rows="3"
          placeholder="Cualquier nota relevante sobre el ejercicio"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      <button
        onClick={handleAddExercise}
        className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md mb-4 flex items-center justify-center"
        title="Agregar Ejercicio"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      <button
        onClick={onBack}
        className="w-full bg-gray-300 text-gray-800 py-3 rounded-xl hover:bg-gray-400 transition-colors font-semibold shadow-md flex items-center justify-center"
        title="Cancelar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default AddExerciseScreen;