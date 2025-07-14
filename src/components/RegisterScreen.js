import React, { useState } from 'react';

const RegisterScreen = ({ onRegister, onGoToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goals, setGoals] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const registerButtonColor = '#183E0C'; // Color específico para el botón de registro

  const handleRegister = () => {
    if (!fullName || !age || !weight || !height || !goals || !phone || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setError('');
    onRegister({ fullName, age: parseInt(age), weight: parseFloat(weight), height: parseFloat(height), goals, phone, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105 relative"> {/* Agregado relative para posicionar la flecha */}
        <button
          onClick={onGoToLogin} // Vuelve a la pantalla de AuthScreen (principal)
          className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6 text-gray-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Regístrate</h2> {/* Título modificado */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="fullName">
              Nombre y Apellido
            </label>
            <input
              type="text"
              id="fullName"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
              placeholder="Tu nombre completo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="age">
              Edad
            </label>
            <input
              type="number"
              id="age"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
              placeholder="Ej: 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="weight">
              Peso (kg)
            </label>
            <input
              type="number"
              id="weight"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
              placeholder="Ej: 75.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="height">
              Altura (cm)
            </label>
            <input
              type="number"
              id="height"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
              placeholder="Ej: 170"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="goals">
            Objetivos (separados por coma)
          </label>
          <input
            type="text"
            id="goals"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
            placeholder="Ej: Ganar masa, Perder peso"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="phone">
            Teléfono Celular
          </label>
          <input
            type="tel"
            id="phone"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
            placeholder="Ej: 5512345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
              type="password"
              id="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="confirmPassword">
            Confirmar Contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition" // Botón negro
            placeholder=""
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4 text-center font-semibold">{error}</p>}

        <button
          onClick={handleRegister}
          className="w-full text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-bold text-lg shadow-md mb-4"
          style={{ backgroundColor: registerButtonColor }} // Botón de registro con color #183E0C
        >
          Registrarse
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={onGoToLogin} className="text-blue-600 hover:underline font-semibold">
            Inicia Sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;