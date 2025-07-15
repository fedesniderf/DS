import React, { useState } from 'react';

const ExerciseTrackingModal = ({
  exercise,
  weeks,
  tracking = {},
  onSave,
  onClose
}) => {
  // Estado local para edición
  const [localTracking, setLocalTracking] = useState(() => {
    // Copia profunda para evitar mutaciones
    return JSON.parse(JSON.stringify(tracking));
  });

  const handleChange = (week, field, value) => {
    setLocalTracking(prev => ({
      ...prev,
      [week]: {
        ...prev[week],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(localTracking);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Seguimiento: {exercise.name}</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {weeks.map((week, idx) => (
            <div key={week} className="flex flex-col sm:flex-row sm:items-center gap-2 border-b pb-2">
              <div className="font-semibold w-24">Semana {week}</div>
              <input
                type="text"
                placeholder="Notas"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
                value={localTracking[week]?.notes || ''}
                onChange={e => handleChange(week, 'notes', e.target.value)}
                style={{ minWidth: 0 }}
              />
              <button
                className="ml-2 px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors font-semibold flex items-center justify-center"
                title="Guardar semana"
                onClick={() => handleSave()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseTrackingModal;
