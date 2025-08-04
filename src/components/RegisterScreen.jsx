import React, { useState } from 'react';

const RegisterScreen = ({ onRegister, onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goals, setGoals] = useState('');
  const [phone, setPhone] = useState('');
  const [medicalConditions, setMedicalConditions] = useState('');

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    if (!fullName || !email || !password || !age || !weight || !height || !goals || !phone || !medicalConditions) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    onRegister({ fullName, email, password, age, weight, height, goals, phone, medicalConditions });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Regístrate</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="fullName">
            Nombre Completo
          </label>
          <input
            type="text"
            id="fullName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Tu nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder=""
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="age">
            Edad
          </label>
          <input
            type="number"
            id="age"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 30"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="weight">
            Peso (kg)
          </label>
          <input
            type="number"
            id="weight"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 75"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="height">
            Altura (cm)
          </label>
          <input
            type="number"
            id="height"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 170"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="goals">
            Objetivos (separados por coma)
          </label>
          <input
            type="text"
            id="goals"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. Ganar masa muscular, Perder peso"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder="Ej. 5512345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="medicalConditions">
            Dolencias o Indicaciones médicas
          </label>
          <textarea
            id="medicalConditions"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out resize-vertical"
            placeholder="Describe cualquier dolencia, lesión previa, indicación médica o condición de salud que deba considerar tu entrenador (ej. problemas de espalda, restricciones alimentarias, medicación, etc.)"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 ease-in-out font-semibold shadow-md mb-4 flex items-center justify-center"
          title="Registrarse"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM4.5 19.5h15M4.5 15.75h15M4.5 12h15M4.5 8.25h15M4.5 4.5h15" />
          </svg>
        </button>

        <p className="text-center text-gray-600 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={onGoToLogin} className="text-black font-semibold hover:underline hover-text-effect flex items-center justify-center mx-auto" title="Iniciar sesión aquí">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;