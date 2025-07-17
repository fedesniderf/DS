// 🚀 Script para importar usuarios desde CSV
// Pega este código en la consola del navegador

async function importUsuariosFromCSV() {
  // Datos del CSV
  const csvData = [
    {
      fullName: "federico",
      age: 35,
      password: "123456",
      height: 170,
      phone: "545645665",
      goals: "ganar peso",
      role: "admin",
      weight: 54,
      client_id: "229c865a-1841-48a6-a424-9eab564312cf",
      email: "federico-sch@live.com"
    },
    {
      fullName: "Barbara Wisgnewsky",
      age: 33,
      password: "2411Cielo",
      height: 163,
      phone: "1159972658",
      goals: "Ser flaca y definida",
      role: "client",
      weight: 70,
      client_id: "925984dd-cc1b-400f-812c-8e335a94b61b",
      email: "barbaramw.18@gmail.com"
    },
    {
      fullName: "Prueba 01",
      age: 25,
      password: "1234",
      height: 170,
      phone: "1122223333",
      goals: "Ganar MM",
      role: "client",
      weight: 80,
      client_id: "95dab0b0-075a-4c2b-b5d6-27e3079bff8e",
      email: "prueba@01.com"
    },
    {
      fullName: "fede",
      age: 123,
      password: "test",
      height: 123,
      phone: "123",
      goals: "test",
      role: "client",
      weight: 123,
      client_id: "b899aa00-e37c-4cc0-ab3c-cfb871145b24",
      email: "fede@fede.com"
    },
    {
      fullName: "David Gastón Sierra",
      age: 37,
      password: "appbyfede",
      height: 160,
      phone: "1135732817",
      goals: "Fuerza",
      role: "admin",
      weight: 90,
      client_id: "d06e7769-cccd-4c6a-9eda-c4eb2dc63f5b",
      email: "entrenamiento.ds@gmail.com"
    }
  ];

  // Acceder al cliente de Supabase
  const { supabase } = window.supabase || await import('./supabaseClient.js');
  
  try {
    console.log('🔄 Importando usuarios...');
    
    // Convertir datos al formato correcto
    const usuarios = csvData.map(user => ({
      client_id: user.client_id,
      email: user.email,
      password: user.password,
      fullName: user.fullName,
      full_name: user.fullName,
      age: user.age,
      height: user.height,
      phone: user.phone,
      goals: user.goals,
      role: user.role,
      weight: user.weight
    }));
    
    // Importar usuarios uno por uno para evitar conflictos
    for (const usuario of usuarios) {
      const { data, error } = await supabase
        .from('usuarios')
        .upsert(usuario, { 
          onConflict: 'email',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Error importando ${usuario.email}:`, error);
      } else {
        console.log(`✅ Usuario importado: ${usuario.email}`);
      }
    }
    
    console.log('🎉 Importación completada!');
    
    // Verificar usuarios importados
    const { data: allUsers } = await supabase
      .from('usuarios')
      .select('email, fullName, role')
      .order('role', { ascending: false });
    
    console.log('👥 Usuarios en la base de datos:');
    console.table(allUsers);
    
  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar la función
importUsuariosFromCSV();
