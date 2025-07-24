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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 ease-in-out"
            placeholder=""
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={() => handleLogin('email')}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 ease-in-out font-semibold shadow-md mb-4 flex items-center justify-center"
          title="Iniciar Sesión"
        >
          Iniciar Sesión
        </button>

        <p className="text-center text-gray-600 text-sm">
          ¿No tienes una cuenta?{' '}
          <button onClick={onGoToRegister} className="text-black font-semibold hover:underline hover-text-effect flex items-center justify-center mx-auto" title="Regístrate aquí">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM4.5 19.5h15M4.5 15.75h15M4.5 12h15M4.5 8.25h15M4.5 4.5h15" />
            </svg>
            Regístrate
          </button>
        </p>
        {/* Sección de redes sociales */}
        <div className="mt-8 flex flex-col items-center">
          <span className="text-gray-500 text-sm mb-2">Síguenos o visita nuestro Linktree</span>
          <div className="flex gap-6">
            {/* Instagram */}
            <a href="https://www.instagram.com/ds.entrenamiento/" target="_blank" rel="noopener noreferrer" title="Instagram" className="hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-black">
                <rect width="18" height="18" x="3" y="3" rx="5" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="17" cy="7" r="1" fill="currentColor"/>
              </svg>
            </a>
            {/* Facebook */}
            <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" title="Facebook" className="hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-black">
                <rect width="18" height="18" x="3" y="3" rx="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M15 8.5h-1.25A1.25 1.25 0 0 0 12.5 9.75V11H15l-.25 2H12.5v6h-2.25v-6H8.5V11h1.75V9.25A3.25 3.25 0 0 1 13.5 6h1.5v2.5Z" fill="currentColor"/>
              </svg>
            </a>
            {/* Linktree / Mundo */}
            <a href="https://linktr.ee/ds.entrenamiento?fbclid=PAQ0xDSwLvOp9leHRuA2FlbQIxMQABp3PzSzoD5lsfg_Tqzw06xy8Rld9RnZojU_9Cun5_U6x_N0PlS6Iyp2c0EwVS_aem_gbPAbAm7WghEYde5FpOXUw " target="_blank" rel="noopener noreferrer" title="Linktree" className="hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-7 h-7 text-black">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path stroke="currentColor" strokeWidth="1.5" d="M3 12h18M12 3a15.3 15.3 0 0 1 0 18M12 3a15.3 15.3 0 0 0 0 18"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;