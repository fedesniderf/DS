import React, { useState } from 'react';

const AuthScreen = ({ onLogin, onGoToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // Default role

  const handleLogin = (method) => {
    onLogin(email, password, method, role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc03OCANFku0HlIPwSxAEOXk6nTjd9beaNftrh5" alt="DS Entrenamiento Logo" className="h-36 w-auto" /> {/* Tamaño ajustado a h-36 */}
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Iniciar Sesión</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder="tu@ejemplo.com"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-black transition"
            placeholder=""
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Iniciar sesión como:</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-black"
                name="role"
                value="client"
                checked={role === 'client'}
                onChange={() => setRole('client')}
              />
              <span className="ml-2 text-gray-700">Cliente</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-black"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
              />
              <span className="ml-2 text-gray-700">Administrador</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => handleLogin('email')}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-semibold shadow-md mb-4"
        >
          Iniciar Sesión
        </button>

        <button
          onClick={() => handleLogin('google')}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center space-x-2 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V11.69h4.735c-.207 1.176-.87 2.318-1.97 3.095l3.643 2.81c2.09-1.93 3.307-4.73 3.307-8.14C21.955 4.11 19.045 1.5 15.5 1.5c-3.545 0-6.455 2.61-6.455 6.02s2.91 6.02 6.455 6.02c2.09 0 3.89-1.01 4.99-2.61l-3.643-2.81c-.55.38-1.21.61-1.97.61-1.43 0-2.61-.98-3.04-2.315z" />
          </svg>
          <span>Iniciar Sesión con Google</span>
        </button>

        <p className="text-center text-gray-600 text-sm mt-6">
          ¿No tienes una cuenta?{' '}
          <button onClick={onGoToRegister} className="text-black hover:underline font-semibold">
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;