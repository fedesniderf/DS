import React, { useState } from 'react';

const AuthScreen = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (method) => {
    onLogin(email, password, method);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        {/* Logo dentro del cuadro de iniciar sesión */}
        <div className="mb-8 flex justify-center">
          <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc0hyznI9uUK73FIu6QMZBiVNxCwz4OT8kREWfS" alt="DS Entrenamiento Logo" className="w-48 h-auto" /> {/* Ajusta w-48 para que quepa bien */}
        </div>

        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Iniciar Sesión</h2>

        <div className="mb-6">
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

        <div className="mb-6">
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

        <button
          onClick={() => handleLogin('email')}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md mb-4"
        >
          Iniciar Sesión
        </button>

        <p className="text-center text-gray-600 text-sm">
          ¿No tienes una cuenta?{' '}
          <button onClick={onGoToRegister} className="text-black font-semibold hover:underline">
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;