import React, { useState, useEffect } from 'react';

const EditExerciseModal = ({ exercise, onSave, onClose }) => {
  const [editedExercise, setEditedExercise] = useState(exercise);

  const daysOfWeek = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];
  const sections = ['Warm Up', 'Trabajo de Fuerza', 'OUT'];

  useEffect(() => {
    setEditedExercise(exercise);
  }, [exercise]);

  const handleChange = (field, value) => {
    if (field === 'notes' && value.length > 250) {
      value = value.substring(0, 250); // Limitar a 250 caracteres
    }
    setEditedExercise((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = () => {
    onSave({
      ...editedExercise,
      sets: parseInt(editedExercise.sets) || '',
      reps: parseInt(editedExercise.reps) || '',
      weight: parseFloat(editedExercise.weight) || null,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-4 relative max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">Editar Ejercicio</h2>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre:</label>
              <input
                type="text"
                value={editedExercise.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                placeholder="Nombre del ejercicio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Día:</label>
              <select
                value={editedExercise.day}
                onChange={(e) => handleChange('day', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              >
                {daysOfWeek.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Sección:</label>
              <select
                value={editedExercise.section}
                onChange={(e) => handleChange('section', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              >
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Series:</label>
              <input
                type="number"
                value={editedExercise.sets}
                onChange={(e) => handleChange('sets', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                placeholder="Ej: 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Repeticiones:</label>
              <input
                type="number"
                value={editedExercise.reps}
                onChange={(e) => handleChange('reps', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                placeholder="Ej: 10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Peso (kg):</label>
              <input
                type="number"
                value={editedExercise.weight || ''}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                placeholder="Ej: 75"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notas:</label>
              <textarea
                value={editedExercise.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows="2"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition resize-none"
                placeholder="Notas adicionales sobre el ejercicio..."
                maxLength={250}
              ></textarea>
              <p className="text-xs text-gray-500 text-right">{editedExercise.notes.length}/250</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Video/Foto URL:</label>
            <input
              type="text"
              value={editedExercise.media}
              onChange={(e) => handleChange('media', e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              placeholder="Ej: https://www.youtube.com/embed/..."
            />
          </div>
        </div>

        {/* Footer fijo */}
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveClick}
              className="px-6 py-2 rounded-xl bg-black text-white hover:bg-gray-800 transition-colors font-semibold"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditExerciseModal;