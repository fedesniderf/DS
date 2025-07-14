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

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    if (!fullName || !email || !password || !age || !weight || !height || !goals || !phone) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    onRegister({ fullName, email, password, age, weight, height, goals, phone });
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="Ej. 5512345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          onClick={handleRegister}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md mb-4"
        >
          Registrarse
        </button>

        <p className="text-center text-gray-600 text-sm">
          ¿Ya tienes una cuenta?{' '}
          <button onClick={onGoToLogin} className="text-black font-semibold hover:underline">
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterScreen;