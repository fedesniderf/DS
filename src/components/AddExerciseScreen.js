import React, { useState } from 'react';
import { generateUniqueId } from '../utils/helpers';

const AddExerciseScreen = ({ onAddExercise = () => {}, onBack = () => {} }) => {
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
  const [rir, setRir] = useState(''); // Nuevo campo para RIR
  const [cadencia, setCadencia] = useState(''); // Nuevo campo para Cadencia
  const [round, setRound] = useState(''); // Nuevo campo para Round
  const [cantidadRounds, setCantidadRounds] = useState(''); // Nuevo campo para cantidad de rounds

  const sectionOptions = [
    { value: '', label: 'Selecciona una sección' },
    { value: 'Warm Up', label: 'Warm Up' },
    { value: 'Activación', label: 'Activación' },
    { value: 'Core', label: 'Core' },
    { value: 'Trabajo DS', label: 'Trabajo DS' },
    { value: 'Out', label: 'Out' },
  ];

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

  const handleAddExercise = () => {
    const newExercise = {
      id: generateUniqueId(),
      name: name || '',
      sets: sets || '',
      reps: reps || '',
      weight: weight || '',
      media: media || '',
      notes: notes || '',
      time: time || '',
      rest: rest || '',
      day: day || '',
      section: section || '',
      rir: rir || '', // Incluir RIR
      cadencia: cadencia || '', // Incluir Cadencia
      round: round || '', // Incluir Round
      cantidadRounds: cantidadRounds || '', // Nueva cantidad de rounds
      weeklyData: {}, // Inicializar weeklyData para el seguimiento
    };
    onAddExercise(newExercise);
    onBack(); // Regresar a la vista de detalles de la rutina
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
            Tiempo (seg):
          </label>
          <input
            type="text"
            id="time"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 30"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rest">
            Descanso (seg):
          </label>
          <input
            type="text"
            id="rest"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 90"
            value={rest}
            onChange={(e) => setRest(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="rir">
            RIR (Reps in Reserve):
          </label>
          <input
            type="text"
            id="rir"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 2"
            value={rir}
            onChange={(e) => setRir(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cadencia">
            Cadencia:
          </label>
          <input
            type="text"
            id="cadencia"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 3-1-2-1"
            value={cadencia}
            onChange={(e) => setCadencia(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="media">
            URL de Media (video/imagen):
          </label>
          <input
            type="url"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="round">
            Round:
          </label>
          <input
            type="text"
            id="round"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 1"
            value={round}
            onChange={(e) => setRound(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cantidadRounds">
            Cantidad de Rounds:
          </label>
          <input
            type="number"
            id="cantidadRounds"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 3"
            value={cantidadRounds}
            onChange={(e) => setCantidadRounds(e.target.value)}
            min="1"
          />
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

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleAddExercise}
          className="flex-1 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
          title="Agregar Ejercicio"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar Ejercicio
        </button>

        <button
          onClick={onBack}
          className="flex-1 bg-gray-500 text-white py-3 rounded-xl hover:bg-gray-600 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
          title="Cancelar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default AddExerciseScreen;