import { supabase } from '../supabaseClient';

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