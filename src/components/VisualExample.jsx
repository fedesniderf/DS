import React from 'react';

// Componente para mostrar ejemplos visuales simples usando SVG
const VisualExample = ({ type, title, description }) => {
  const renderExample = () => {
    switch (type) {
      case 'timer':
        return (
          <div className="bg-gray-800 rounded-lg p-4 text-white relative">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-green-400">02:34</div>
              <div className="text-sm text-gray-300">Serie 2 de 3</div>
            </div>
            <div className="flex gap-2 justify-center">
              <div className="bg-yellow-500 rounded px-3 py-1 text-xs">⏸️ Pausar</div>
              <div className="bg-red-500 rounded px-3 py-1 text-xs">⏹️ Terminar</div>
            </div>
            <div className="absolute top-2 right-2 text-xs">🔄</div>
          </div>
        );
      
      case 'exercise-card':
        return (
          <div className="bg-gray-50 rounded-xl p-3 border">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-semibold text-gray-800">Press de banca</h5>
              <div className="flex gap-1">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">+</span>
                </div>
                <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs">⏱️</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs text-gray-700">
              <div><span className="font-semibold">Series:</span> 3</div>
              <div><span className="font-semibold">Repeticiones:</span> 10</div>
              <div><span className="font-semibold">Peso:</span> 80kg</div>
              <div><span className="font-semibold">Descanso:</span> 90s</div>
            </div>
          </div>
        );
      
      case 'tracking-table':
        return (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <div className="bg-gray-200 p-2 grid grid-cols-4 gap-2 text-xs font-semibold">
              <div>Semana</div>
              <div>Peso</div>
              <div>Tiempo</div>
              <div>Notas</div>
            </div>
            <div className="p-2 grid grid-cols-4 gap-2 text-xs hover:bg-gray-50 cursor-pointer">
              <div>S1</div>
              <div>80 kg</div>
              <div className="text-green-600 font-semibold">05:23</div>
              <div>Buen ritmo</div>
            </div>
            <div className="p-2 grid grid-cols-4 gap-2 text-xs hover:bg-gray-50 cursor-pointer">
              <div>S2</div>
              <div>75-85 kg</div>
              <div className="text-green-600 font-semibold">06:12</div>
              <div>Dropsets finales</div>
            </div>
          </div>
        );
      
      case 'settings-menu':
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-48">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Configuración</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Cambiar contraseña</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Centro de Ayuda</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded text-sm">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Reiniciar Guía</span>
              </div>
            </div>
          </div>
        );
      
      case 'dropset-timer':
        return (
          <div className="bg-purple-800 rounded-lg p-4 text-white relative">
            <div className="text-center mb-3">
              <div className="text-2xl font-bold text-purple-300">01:45</div>
              <div className="text-sm text-purple-200">Dropset 1 de 4</div>
            </div>
            <div className="flex gap-2 justify-center">
              <div className="bg-purple-500 rounded px-3 py-1 text-xs">⏸️ Pausar</div>
              <div className="bg-red-500 rounded px-3 py-1 text-xs">⏹️ Terminar</div>
            </div>
            <div className="absolute top-2 left-2 bg-purple-600 rounded px-2 py-1 text-xs">DROPSET</div>
          </div>
        );

      case 'modal-form':
        return (
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
            <h3 className="font-bold mb-3">Agregar seguimiento semanal</h3>
            <div className="space-y-3">
              <select className="w-full border rounded p-2 text-sm">
                <option>Semana 2</option>
              </select>
              <div className="space-y-2">
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs font-medium mb-1">Serie 1</div>
                  <input type="number" placeholder="Peso (kg)" className="w-full border rounded p-1 text-xs" />
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-xs font-medium mb-1">Serie 2</div>
                  <input type="number" placeholder="Peso (kg)" className="w-full border rounded p-1 text-xs" />
                </div>
              </div>
              <textarea 
                placeholder="Notas opcionales..." 
                className="w-full border rounded p-2 text-sm resize-none" 
                rows="2"
              />
              <div className="flex gap-2 justify-end">
                <button className="bg-gray-300 rounded px-3 py-1 text-sm">Cancelar</button>
                <button className="bg-purple-500 text-white rounded px-3 py-1 text-sm">Guardar</button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
            <span className="text-gray-500">Ejemplo visual</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h5 className="font-semibold text-gray-800 mb-2">{title}</h5>
      <div className="mb-3">
        {renderExample()}
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
};

export default VisualExample;
