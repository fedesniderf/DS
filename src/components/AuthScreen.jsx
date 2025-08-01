import React, { useState } from 'react';

const AuthScreen = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (method) => {
    onLogin(email, password, method);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 via-gray-100 to-blue-200">
      <div className="bg-white/90 px-4 py-6 sm:p-8 rounded-3xl shadow-2xl border border-gray-200 w-full max-w-xs sm:max-w-md flex flex-col items-center justify-center gap-6">
        {/* Logo */}
        <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc0hyznI9uUK73FIu6QMZBiVNxCwz4OT8kREWfS" alt="DS Entrenamiento Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} className="mx-auto drop-shadow-lg" />
        <h2 className="text-3xl font-extrabold text-center text-gray-900 tracking-tight w-full">Iniciar Sesión</h2>
        <form className="w-full flex flex-col gap-4 items-center justify-center">
          <div className="w-full flex flex-col items-center justify-center">
            <label className="block text-gray-700 text-base font-semibold mb-2 text-center w-full" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 text-base text-center bg-gray-50"
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="w-full flex flex-col items-center justify-center">
            <label className="block text-gray-700 text-base font-semibold mb-2 text-center w-full" htmlFor="password">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-green-500 text-base text-center bg-gray-50"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => handleLogin('email')}
            className="w-full bg-gradient-to-r from-green-700 to-blue-700 text-white py-3 rounded-xl hover:from-green-800 hover:to-blue-800 transition-all font-bold shadow-lg mt-2 text-center tracking-wide text-base"
            title="Iniciar Sesión"
          >
            Iniciar Sesión
          </button>
        </form>
        <p className="text-center text-gray-700 text-base w-full mt-2">
          ¿No tienes una cuenta?{' '}
          <button onClick={onGoToRegister} className="bg-gradient-to-r from-green-700 to-blue-700 text-white font-bold px-4 py-2 rounded-xl hover:from-green-800 hover:to-blue-800 flex items-center justify-center mx-auto transition-all text-center shadow-lg" title="Regístrate aquí">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM4.5 19.5h15M4.5 15.75h15M4.5 12h15M4.5 8.25h15M4.5 4.5h15" />
            </svg>
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;