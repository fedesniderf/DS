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

        {/* Se elimina el botón de Iniciar Sesión con Google */}
        {/*
        <button
          onClick={() => handleLogin('google')}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center space-x-2 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V11.99h4.84c-.09 1.17-1.09 3.47-4.84 3.47-2.91 0-5.29-2.4-5.29-5.35 0-2.96 2.38-5.35 5.29-5.35 1.62 0 2.86.7 3.51 1.32l1.3-1.27c-.94-.92-2.19-1.87-4.81-1.87-3.97 0-7.2 3.28-7.2 7.32s3.23 7.32 7.2 7.32c4.28 0 6.9-3.04 6.9-7.18 0-.49-.05-.88-.13-1.27h-6.77zm0-6.6c-2.04 0-3.72 1.68-3.72 3.72s1.68 3.72 3.72 3.72 3.72-1.68 3.72-3.72-1.68-3.72-3.72-3.72z" />
          </svg>
          <span>Iniciar Sesión con Google</span>
        </button>
        */}

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