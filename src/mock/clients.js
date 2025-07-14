export const defaultClients = [
  {
    id: 'client1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    lastRoutine: 'Rutina de Fuerza',
    progress: 75,
    age: 30,
    weight: 75.5,
    height: 175,
    goals: ['Ganar masa muscular', 'Mejorar resistencia'],
    phone: '5512345678',
  },
  {
    id: 'client2',
    name: 'María García',
    email: 'maria@example.com',
    lastRoutine: 'Rutina de Cardio',
    progress: 90,
    age: 25,
    weight: 60.2,
    height: 165,
    goals: ['Perder peso', 'Tonificar'],
    phone: '5587654321',
  },
  {
    id: 'client3',
    name: 'Carlos Sánchez',
    email: 'carlos@example.com',
    lastRoutine: 'Sin rutinas',
    progress: 0,
    age: 35,
    weight: 85.0,
    height: 180,
    goals: ['Aumentar fuerza', 'Definición'],
    phone: '5511223344',
  },
];

export const defaultRoutines = [
  {
    id: 'routine1',
    clientId: 'client1',
    name: 'Rutina de Fuerza',
    exercises: [
      { id: 'ex1', name: 'Press de Banca', sets: 4, reps: 8, weight: 60, notes: 'Controlar la bajada', media: 'https://www.youtube.com/embed/Eh0-x_E_d_E', day: 'Día 1' },
      { id: 'ex2', name: 'Sentadilla', sets: 3, reps: 10, weight: 80, notes: 'Profundidad completa', media: 'https://www.youtube.com/embed/ultWtk6_y_Y', day: 'Día 1' },
      { id: 'ex3', name: 'Remo con Barra', sets: 4, reps: 8, weight: 50, notes: 'Espalda recta', media: 'https://www.youtube.com/embed/GZ_J0X_y_Y0', day: 'Día 2' },
      { id: 'ex4', name: 'Press Militar', sets: 3, reps: 10, weight: 30, notes: 'Evitar balanceo', media: 'https://www.youtube.com/embed/2y_y_y_y_y0', day: 'Día 2' },
      { id: 'ex5', name: 'Peso Muerto', sets: 3, reps: 5, weight: 100, notes: 'Técnica perfecta', media: 'https://www.youtube.com/embed/3z_J0X_y_y0', day: 'Día 3' },
    ],
  },
  {
    id: 'routine2',
    clientId: 'client2',
    name: 'Rutina de Cardio',
    exercises: [
      { id: 'ex6', name: 'Correr en Cinta', sets: 1, reps: 30, weight: null, notes: 'Ritmo constante', media: '', day: 'Día 1' },
      { id: 'ex7', name: 'Elíptica', sets: 1, reps: 20, weight: null, notes: 'Resistencia media', media: '', day: 'Día 2' },
      { id: 'ex8', name: 'Saltar la Cuerda', sets: 3, reps: 100, weight: null, notes: 'Calentamiento', media: '', day: 'Día 1' },
    ],
  },
];