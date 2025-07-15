import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registro de usuario
  const handleRegister = async () => {
    const { error } = await supabase
      .from('usuarios')
      .insert([{ email, password, role: 'client' }]);
    if (error) {
      alert('Error al registrar usuario');
    } else {
      alert('Usuario registrado correctamente');
    }
  };

  // Inicio de sesión
  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('password', password);

    if (error) {
      alert('Error al iniciar sesión');
    } else if (data && data.length > 0) {
      alert('¡Bienvenido!');
      // Aquí puedes guardar el usuario en el estado global o redirigir
    } else {
      alert('Credenciales incorrectas');
    }
  };

  return (
    <div>
      <h2>Autenticación</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 border rounded-md mb-2"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-3 border rounded-md mb-2"
      />
      <button className="btn-primary mb-2" onClick={handleLogin}>
        Iniciar sesión
      </button>
      <button className="btn-primary" onClick={handleRegister}>
        Crear usuario
      </button>
    </div>
  );
}