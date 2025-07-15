import { supabase } from '../supabaseClient';

export const defaultUsers = [
  {
    id: 'user1',
    email: 'cliente1@example.com',
    password: 'password123',
    role: 'client',
  },
  {
    id: 'user2',
    email: 'cliente2@example.com',
    password: 'password123',
    role: 'client',
  },
  {
    id: 'admin1',
    email: 'coach@example.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: 'user3',
    email: 'cliente3@example.com',
    password: 'password123',
    role: 'client',
  },
];

const handleRegister = async (formData) => {
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{
      email: formData.email,
      password: formData.password,
      role: 'client'
    }]);

  if (error) {
    alert('Error al registrar usuario');
    return;
  }
  alert('Usuario registrado correctamente');
};

<button onClick={() => handleRegister(formData)}>
  Crear usuario
</button>