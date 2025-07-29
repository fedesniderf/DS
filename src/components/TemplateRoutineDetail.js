
import React, { useState } from 'react';
import RoutineDetail from './RoutineDetail';

// Pantalla para crear o editar una plantilla de rutina (idéntica a RoutineDetail pero sin usuario asignado)

import { generateUniqueId } from '../utils/helpers';

const TemplateRoutineDetail = ({ initialTemplate = {}, onSave, onCancel }) => {
  // Si no hay id, generar uno temporal para la edición local
  const [template, setTemplate] = useState(() => {
    if (!initialTemplate.id) {
      return { ...initialTemplate, id: generateUniqueId() };
    }
    return initialTemplate;
  });

  // Handler para guardar cambios
  const handleUpdateTemplate = (updated) => {
    setTemplate((prev) => ({ ...prev, ...updated }));
  };

  // Siempre asegurar estructura válida
  const safeTemplate = {
    ...(template || {}),
    exercises: Array.isArray(template?.exercises) ? template.exercises : [],
    dailyTracking:
      template?.dailyTracking && typeof template.dailyTracking === 'object' && !Array.isArray(template.dailyTracking)
        ? template.dailyTracking
        : {},
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-3xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Crear Plantilla de Rutina</h2>

      {/* Campos editables para nombre, fecha de inicio y fin */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la rutina</label>
          <input
            type="text"
            value={safeTemplate.name || ''}
            onChange={e => setTemplate(t => ({ ...t, name: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. Plantilla Fuerza - Mes 1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de inicio</label>
          <input
            type="date"
            value={safeTemplate.startDate || ''}
            onChange={e => setTemplate(t => ({ ...t, startDate: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de fin</label>
          <input
            type="date"
            value={safeTemplate.endDate || ''}
            onChange={e => setTemplate(t => ({ ...t, endDate: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />
        </div>
      </div>

      <RoutineDetail
        routine={safeTemplate}
        onUpdateRoutine={handleUpdateTemplate}
        isEditable={true}
        canAddDailyTracking={false}
      />
      <div className="flex justify-end gap-2 mt-6">
        <button
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          onClick={onCancel}
        >Cancelar</button>
        <button
          className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800 font-semibold"
          onClick={() => {
            // Al guardar, quitar el id temporal antes de enviar a la base de datos
            const { id, ...rest } = safeTemplate;
            onSave(rest);
          }}
        >Guardar Plantilla</button>
      </div>
    </div>
  );
};

export default TemplateRoutineDetail;
