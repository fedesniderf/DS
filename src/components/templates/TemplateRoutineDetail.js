import React, { useState } from 'react';

// Componente para crear o editar una plantilla de rutina
const TemplateRoutineDetail = ({ initialTemplate = {}, onSave, onCancel }) => {
  const [name, setName] = useState(initialTemplate.name || '');
  const [description, setDescription] = useState(initialTemplate.description || '');
  // Aquí puedes agregar más estados para ejercicios, secciones, etc.

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, description });
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Crear/Editar Plantilla de Rutina</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          className="border rounded px-3 py-2"
          placeholder="Nombre de la plantilla"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <textarea
          className="border rounded px-3 py-2"
          placeholder="Descripción"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        {/* Aquí puedes agregar campos para ejercicios, secciones, etc. */}
        <div className="w-full flex justify-center items-center mt-4">
          <div className="flex gap-4">
            <button 
              type="submit" 
              className="bg-green-800 hover:bg-green-900 text-white px-5 py-2 rounded font-semibold shadow"
            >
              Guardar
            </button>
            <button 
              type="button" 
              className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded font-semibold shadow" 
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>

      {/* Footer Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-center gap-6">
          {/* Logo DS Entrenamiento */}
          <div className="flex items-center gap-2">
            <img 
              src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" 
              alt="DS Entrenamiento Logo" 
              className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
            />
            <span className="text-gray-500 text-sm font-medium">DS Entrenamiento</span>
          </div>

          {/* WhatsApp */}
          <a 
            href="https://wa.me/5491135732817" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-300 shadow-lg hover:shadow-xl"
            title="Contactar por WhatsApp"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.886 3.488"/>
            </svg>
            <span className="hidden md:inline">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TemplateRoutineDetail;
