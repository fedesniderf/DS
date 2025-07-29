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
    </div>
  );
};

export default TemplateRoutineDetail;
