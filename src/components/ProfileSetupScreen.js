import React, { useState } from 'react';

const ProfileSetupScreen = ({ user, onSaveProfile }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [weight, setWeight] = useState('');
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [error, setError] = useState('');

  const handleAddGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const handleRemoveGoal = (goalToRemove) => {
    setGoals(goals.filter(goal => goal !== goalToRemove));
  };

  const handleSave = () => {
    if (!name || !dob || !weight || goals.length === 0) {
      setError('Por favor, completa todos los campos y agrega al menos un objetivo.');
      return;
    }
    setError('');
    onSaveProfile({ name, dob, weight: parseFloat(weight), goals });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg transform transition-all duration-300 hover:scale-105">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-6">¡Casi listo!</h2>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Cuéntanos un poco sobre ti para personalizar tu experiencia.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Nombre Completo
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-black transition-all duration-200 shadow-sm" // Botón negro
              placeholder="Tu nombre y apellido"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dob">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              id="dob"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-black transition-all duration-200 shadow-sm" // Botón negro
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weight">
              Peso (kg)
            </label>
            <input
              type="number"
              id="weight"
              className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-black transition-all duration-200 shadow-sm" // Botón negro
              placeholder="Ej: 70.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="goals">
            Tus Objetivos en el Gimnasio
          </label>
          <div className="flex mb-3">
            <input
              type="text"
              id="newGoal"
              className="flex-grow px-5 py-3 rounded-l-xl border border-gray-300 focus:outline-none focus:ring-3 focus:ring-black transition-all duration-200 shadow-sm" // Botón negro
              placeholder="Ej: Ganar masa muscular"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddGoal(); }}
            />
            <button
              onClick={handleAddGoal}
              className="bg-black text-white px-6 py-3 rounded-r-xl hover:bg-gray-800 transition-colors duration-200 shadow-md" // Botón negro
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {goals.map((goal, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm px-4 py-2 rounded-full flex items-center font-medium shadow-sm">
                {goal}
                <button onClick={() => handleRemoveGoal(goal)} className="ml-2 text-blue-600 hover:text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-6 text-center font-semibold">{error}</p>}

        <button
          onClick={handleSave}
          className="w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition-all duration-300 font-bold text-lg shadow-lg transform hover:-translate-y-1" // Botón negro
        >
          Guardar Perfil y Empezar
        </button>
      </div>
    </div>
  );
};

export default ProfileSetupScreen;