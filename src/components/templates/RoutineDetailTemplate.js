import React from "react";
import { supabase } from "../../supabaseClient";

// Componente para editar la estructura de una plantilla de rutina (idéntico a RoutineDetail pero sin fechas ni cliente)
const RoutineDetailTemplate = ({ template = {}, onSave, onCancel }) => {
  // Estado para colapso/expansión de rounds
  const [collapsedRounds, setCollapsedRounds] = React.useState({});

  // Función para alternar colapso/expansión de un round
  const toggleRound = (roundKey) => {
    setCollapsedRounds(prev => ({
      ...prev,
      [roundKey]: !prev[roundKey]
    }));
  } 
  // Estado para mostrar/ocultar el modal de edición de rutina
  const [showRoutineModal, setShowRoutineModal] = React.useState(false);
  // Estado para loading
  const [loading, setLoading] = React.useState(false);
  // Estados principales
  const [name, setName] = React.useState(template.name || "");
  const [description, setDescription] = React.useState(template.description || "");
  const [exercises, setExercises] = React.useState(Array.isArray(template.exercises) ? template.exercises : []);

  // Agrupar ejercicios por día y sección
  const groupedByDay = exercises.reduce((acc, ex) => {
    const day = ['1','2','3','4','5','6','7'].includes(ex.day) ? ex.day : (ex.day || 'Sin día');
    const section = ex.section || 'Sin sección';
    if (!acc[day]) acc[day] = {};
    if (!acc[day][section]) acc[day][section] = [];
    acc[day][section].push(ex);
    return acc;
  }, {});
  const orderedDays = [
    '1','2','3','4','5','6','7'
  ].filter(d => groupedByDay[d]).concat(Object.keys(groupedByDay).filter(d => !['1','2','3','4','5','6','7'].includes(d)));

  // Estados para colapso/expansión de días y secciones
  const [collapsedDays, setCollapsedDays] = React.useState(() => {
    const allDays = new Set();
    exercises.forEach(ex => {
      const day = ex.day || 'Sin día';
      allDays.add(day);
    });
    return allDays;
  });
  const [collapsedSections, setCollapsedSections] = React.useState(() => {
    const allSections = new Set();
    exercises.forEach(ex => {
      const day = ex.day || 'Sin día';
      const section = ex.section || 'Sin sección';
      allSections.add(`${day}-${section}`);
    });
    return allSections;
  });

  // Funciones para colapso/expansión
  const toggleDay = (day) => {
    const newCollapsedDays = new Set(collapsedDays);
    if (newCollapsedDays.has(day)) {
      newCollapsedDays.delete(day);
    } else {
      newCollapsedDays.add(day);
    }
    setCollapsedDays(newCollapsedDays);
  };
  const toggleSection = (daySection) => {
    const newCollapsedSections = new Set(collapsedSections);
    if (newCollapsedSections.has(daySection)) {
      newCollapsedSections.delete(daySection);
    } else {
      newCollapsedSections.add(daySection);
    }
    setCollapsedSections(newCollapsedSections);
  };

  // Función para mover secciones
  const moveSection = (direction, day, sectionName) => {
    setSectionOrderByDay(prev => {
      const currentOrder = prev[day] ? [...prev[day]] : ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'];
      const idx = currentOrder.indexOf(sectionName);
      if (direction === 'up' && idx > 0) {
        [currentOrder[idx - 1], currentOrder[idx]] = [currentOrder[idx], currentOrder[idx - 1]];
      } else if (direction === 'down' && idx < currentOrder.length - 1) {
        [currentOrder[idx], currentOrder[idx + 1]] = [currentOrder[idx + 1], currentOrder[idx]];
      }
      return { ...prev, [day]: currentOrder };
    });
  };
  // Elimina una sección completa de un día
  const handleDeleteSection = (day, section) => {
    // Elimina los ejercicios de esa sección y día
    setExercises(prev => prev.filter(ex => !(ex.day === day && ex.section === section)));
    // Actualiza el orden de secciones para ese día
    setSectionOrderByDay(prev => {
      const currentOrder = prev[day] ? [...prev[day]] : [];
      const newOrder = currentOrder.filter(s => s !== section);
      return { ...prev, [day]: newOrder };
    });
    // Opcional: colapsa la sección eliminada
    setCollapsedSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(`${day}-${section}`);
      return newSet;
    });
  };
  // Elimina todos los ejercicios de un día completo
  const handleDeleteDay = (day) => {
    // Elimina todos los ejercicios de ese día
    setExercises(prev => prev.filter(ex => ex.day !== day));
    // Elimina el orden de secciones para ese día
    setSectionOrderByDay(prev => {
      const newOrder = { ...prev };
      delete newOrder[day];
      return newOrder;
    });
    // Elimina el colapso de ese día y sus secciones
    setCollapsedDays(prev => {
      const newSet = new Set(prev);
      newSet.delete(day);
      return newSet;
    });
    setCollapsedSections(prev => {
      const newSet = new Set([...prev].filter(key => !key.startsWith(`${day}-`)));
      return newSet;
    });
  };
  // ...existing code...
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [editExercise, setEditExercise] = React.useState(null);
  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseSets, setExerciseSets] = React.useState("");
  const [exerciseDropset, setExerciseDropset] = React.useState("");
  const [exerciseReps, setExerciseReps] = React.useState("");
  const [exerciseWeight, setExerciseWeight] = React.useState("");
  const [exerciseTime, setExerciseTime] = React.useState("");
  const [exerciseRest, setExerciseRest] = React.useState("");
  const [exerciseDay, setExerciseDay] = React.useState("");
  const [exerciseSection, setExerciseSection] = React.useState("");
  const [exerciseMedia, setExerciseMedia] = React.useState("");
  const [exerciseRIR, setExerciseRIR] = React.useState("");
  const [exerciseCadencia, setExerciseCadencia] = React.useState("");
  const [exerciseRound, setExerciseRound] = React.useState("");
  const [exerciseCantidadRounds, setExerciseCantidadRounds] = React.useState("");
  const [exerciseNotes, setExerciseNotes] = React.useState("");
  // Estado para mostrar/ocultar el modal de asignación a cliente
  const [showAssignModal, setShowAssignModal] = React.useState(false);
  // Estado para el usuario seleccionado
  const [selectedUserId, setSelectedUserId] = React.useState("");
  // Estado para feedback de asignación
  const [assignStatus, setAssignStatus] = React.useState("");
  // Estado para la lista de usuarios (puedes cargarla desde Supabase o pasarla como prop)
  const [users, setUsers] = React.useState([]);
  const [usersLoading, setUsersLoading] = React.useState(false);
  const [usersError, setUsersError] = React.useState("");
  // Estados para el proceso de asignación
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [assignmentSuccess, setAssignmentSuccess] = React.useState(false);

  // Ejemplo: cargar usuarios desde Supabase al abrir el modal
  React.useEffect(() => {
    if (showAssignModal) {
      setUsersLoading(true);
      setUsersError("");
      const fetchUsers = async () => {
        const { data, error } = await supabase
          .from('usuarios')
          .select('client_id, email, full_name');
        if (!error && Array.isArray(data)) {
          setUsers(data);
        } else {
          setUsers([]);
          setUsersError("No se pudo cargar la lista de usuarios");
        }
        setUsersLoading(false);
      };
      fetchUsers();
    }
  }, [showAssignModal]);

  // Función para asignar rutina al usuario
  const handleAssignToUser = async () => {
    if (!selectedUserId || isAssigning) return;
    
    setIsAssigning(true);
    setAssignStatus('');
    setAssignmentSuccess(false);
    
    try {
      // Guardar la rutina en la tabla 'rutinas' y asignar el usuario
      const { error, data } = await supabase.from('rutinas').insert({
        name,
        description,
        exercises,
        client_id: selectedUserId,
      });
      
      if (!error) {
        setAssignmentSuccess(true);
        setAssignStatus('¡Rutina asignada correctamente!');
        // Buscar el nombre del usuario seleccionado para mostrar en el mensaje
        const selectedUser = users.find(u => u.client_id === selectedUserId);
        const userName = selectedUser ? selectedUser.full_name || selectedUser.email : 'el cliente';
        setAssignStatus(`¡Rutina asignada correctamente a ${userName}!`);
      } else {
        setAssignStatus('Error al asignar rutina: ' + (error.message || JSON.stringify(error)));
        console.error('Supabase error al asignar rutina:', error, data);
      }
    } catch (error) {
      setAssignStatus('Error al asignar rutina: ' + error.message);
      console.error('Catch error al asignar rutina:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  // Función para cerrar el modal de asignación y resetear estados
  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedUserId("");
    setAssignStatus("");
    setAssignmentSuccess(false);
    setIsAssigning(false);
  };
  const handleEditExerciseClick = (exercise) => {
    setEditExercise(exercise);
    setExerciseDay(exercise.day || "");
    setExerciseSection(exercise.section || "");
    setExerciseRound(exercise.round || "");
    setExerciseCantidadRounds(exercise.cantidadRounds || "");
    setExerciseName(exercise.name || "");
    setExerciseSets(exercise.sets || "");
    setExerciseDropset(exercise.dropset || "");
    setExerciseReps(exercise.reps || "");
    setExerciseWeight(exercise.weight || "");
    setExerciseTime(exercise.time || "");
    setExerciseRest(exercise.rest || "");
    setExerciseRIR(exercise.rir || "");
    setExerciseCadencia(exercise.cadencia || "");
    setExerciseMedia(exercise.media || "");
    setExerciseNotes(exercise.notes || "");
    setShowExerciseModal(true);
  };
  // Maneja la edición de un ejercicio
  // Estado para el orden de secciones por día
  const [sectionOrderByDay, setSectionOrderByDay] = React.useState(() => {
    const initialOrder = {};
    Object.keys(groupedByDay).forEach(day => {
      initialOrder[day] = ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'].filter(section => groupedByDay[day][section]).concat(
        Object.keys(groupedByDay[day]).filter(s => !['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'].includes(s))
      );
    });
    return initialOrder;
  });

  // Recalcula el orden de secciones por día cada vez que exercises cambia
  React.useEffect(() => {
    const newGroupedByDay = exercises.reduce((acc, ex) => {
      const day = ['1','2','3','4','5','6','7'].includes(ex.day) ? ex.day : (ex.day || 'Sin día');
      const section = ex.section || 'Sin sección';
      if (!acc[day]) acc[day] = {};
      if (!acc[day][section]) acc[day][section] = [];
      acc[day][section].push(ex);
      return acc;
    }, {});
    const newSectionOrderByDay = {};
    Object.keys(newGroupedByDay).forEach(day => {
      newSectionOrderByDay[day] = ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'].filter(section => newGroupedByDay[day][section]).concat(
        Object.keys(newGroupedByDay[day]).filter(s => !['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'].includes(s))
      );
    });
    setSectionOrderByDay(newSectionOrderByDay);
  }, [exercises]);
  // Función para guardar la plantilla editada
  // Guarda la plantilla editada en Supabase si tiene id, usando el valor más reciente de exercises
  const handleSaveTemplate = async () => {
    if (loading) return; // Prevenir múltiples clicks
    
    const currentExercises = Array.isArray(exercises) ? exercises : [];
    let updatedTemplate = { ...template, name, description, exercises: currentExercises };
    
    if (!template.id) {
      alert('No se puede guardar: la plantilla no tiene un ID válido.');
      return;
    }

    setLoading(true);
    try {
      // Actualiza la plantilla en la tabla rutinas_templates (sin client_id)
      const { error } = await supabase
        .from('rutinas_templates')
        .update({
          name,
          description,
          exercises: currentExercises,
        })
        .eq('id', template.id);
        
      if (error) {
        alert('Error al actualizar la plantilla: ' + (error.message || JSON.stringify(error)));
        return;
      }
      
      // Mostrar mensaje de éxito
      alert('¡Plantilla guardada exitosamente!');
      
      // Recarga el template actualizado desde Supabase
      const { data, error: fetchError } = await supabase
        .from('rutinas_templates')
        .select('*')
        .eq('id', template.id)
        .single();
        
      if (!fetchError && data) {
        updatedTemplate = data;
        // Actualiza los estados locales con los datos más recientes
        setName(data.name || "");
        setDescription(data.description || "");
        const newExercises = Array.isArray(data.exercises) ? data.exercises : [];
        setExercises(newExercises);
        // Recalcula el orden de secciones por día
        const newGroupedByDay = newExercises.reduce((acc, ex) => {
          const day = ['1','2','3','4','5','6','7'].includes(ex.day) ? ex.day : (ex.day || 'Sin día');
          const section = ex.section || 'Sin sección';
          if (!acc[day]) acc[day] = {};
          if (!acc[day][section]) acc[day][section] = [];
          acc[day][section].push(ex);
          return acc;
        }, {});
        const newSectionOrderByDay = {};
        Object.keys(newGroupedByDay).forEach(day => {
          newSectionOrderByDay[day] = ['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'].filter(section => newGroupedByDay[day][section]).concat(
            Object.keys(newGroupedByDay[day]).filter(s => !['Warm Up', 'Activación', 'Core', 'Trabajo DS', 'Out'].includes(s))
          );
        });
        setSectionOrderByDay(newSectionOrderByDay);
      }
    } catch (error) {
      alert('Error inesperado al guardar la plantilla: ' + error.message);
      console.error('Error en handleSaveTemplate:', error);
    } finally {
      setLoading(false);
    }
    
    if (onSave) {
      onSave(updatedTemplate);
    }
  };

  // Función para guardar solo la información básica (nombre y descripción) sin cerrar la vista
  const handleSaveRoutineInfo = async () => {
    if (template.id) {
      // Actualiza solo el nombre y la descripción en Supabase
      const { error } = await supabase
        .from('rutinas_templates')
        .update({
          name,
          description,
        })
        .eq('id', template.id);
      if (error) {
        alert('Error al actualizar la plantilla: ' + (error.message || JSON.stringify(error)));
        return;
      }
      // Actualiza el template local sin llamar a onSave
      template.name = name;
      template.description = description;
    }
    setShowRoutineModal(false);
  };

  // Renderiza los detalles de un ejercicio
  const renderExerciseDetails = (ex) => {
    const fields = [
      { key: 'name', label: 'Nombre', className: 'col-span-2' },
      { key: 'sets', label: 'Series' },
      { key: 'dropset', label: 'Dropset' },
      { key: 'reps', label: 'Repeticiones' },
      { key: 'weight', label: 'Peso (Kg)' },
      { key: 'time', label: 'Tiempo' },
      { key: 'rest', label: 'Descanso' },
      { key: 'day', label: 'Día' },
      { key: 'section', label: 'Sección' },
      { key: 'media', label: 'Media', className: 'col-span-2', isLink: true },
      { key: 'rir', label: 'RIR' },
      { key: 'cadencia', label: 'Cadencia' },
      { key: 'round', label: 'Round' },
      { key: 'cantidadRounds', label: 'Cantidad de Rounds' },
      { key: 'notes', label: 'Notas', className: 'col-span-2' },
    ];
    return (
      <div className="grid grid-cols-2 gap-2 mb-2 text-sm text-gray-700">
        {fields.map(({ key, label, className, isLink }) => {
          if (!ex[key]) return null;
          if (isLink) {
            return (
              <div key={key} className={className || ''}>
                <span className="font-semibold">{label}:</span> <a href={ex[key]} target="_blank" rel="noopener noreferrer">Ver</a>
              </div>
            );
          }
          return (
            <div key={key} className={className || ''}>
              <span className="font-semibold">{label}:</span> {ex[key]}
            </div>
          );
        })}
      </div>
    );
  };

  // Maneja el guardado o actualización de un ejercicio
  const handleSaveExercise = () => {
    const newExercise = {
      id: editExercise ? editExercise.id : Date.now(),
      name: exerciseName,
      sets: exerciseSets,
      dropset: exerciseDropset,
      reps: exerciseReps,
      weight: exerciseWeight,
      time: exerciseTime,
      rest: exerciseRest,
      day: exerciseDay,
      section: exerciseSection,
      media: exerciseMedia,
      rir: exerciseRIR,
      cadencia: exerciseCadencia,
      round: exerciseRound,
      cantidadRounds: exerciseCantidadRounds,
      notes: exerciseNotes,
    };
    setExercises(prev => {
      if (editExercise) {
        return prev.map(ex => ex.id === editExercise.id ? newExercise : ex);
      } else {
        return [...prev, newExercise];
      }
    });
    setShowExerciseModal(false);
    setEditExercise(null);
  };
  // Elimina un ejercicio por su id
  const handleDeleteExercise = (exerciseId) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  // Opciones para el desplegable de día
  const dayOptions = [
    { value: '', label: 'Selecciona un día' },
    { value: '1', label: 'Día 1' },
    { value: '2', label: 'Día 2' },
    { value: '3', label: 'Día 3' },
    { value: '4', label: 'Día 4' },
    { value: '5', label: 'Día 5' },
    { value: '6', label: 'Día 6' },
    { value: '7', label: 'Día 7' },
  ];
  const sectionOptions = [
    { value: '', label: 'Selecciona una sección' },
    { value: 'Warm Up', label: 'Warm Up' },
    { value: 'Activación', label: 'Activación' },
    { value: 'Core', label: 'Core' },
    { value: 'Trabajo DS', label: 'Trabajo DS' },
    { value: 'Out', label: 'Out' },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-md w-full max-w-none mx-auto p-4 sm:p-6 md:p-8">
      {/* ...existing code... */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {name || 'Plantilla sin nombre'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRoutineModal(true)}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
            title="Editar plantilla"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
            title="Asignar a cliente"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      {/* ...existing code... */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 gap-4 text-sm">
          <div>
            <span className="font-semibold">Descripción:</span> {description || 'Sin descripción'}
          </div>
        </div>
      </div>
      {/* ...existing code... */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Ejercicios</h3>
          <button
            onClick={() => {
              setEditExercise(null);
              setExerciseDay(dayOptions[0]?.value || '');
              setExerciseSection(sectionOptions[0]?.value || '');
              setExerciseRound('');
              setExerciseCantidadRounds('');
              setExerciseName('');
              setExerciseSets('');
              setExerciseDropset('');
              setExerciseReps('');
              setExerciseWeight('');
              setExerciseTime('');
              setExerciseRest('');
              setExerciseRIR('');
              setExerciseCadencia('');
              setExerciseMedia('');
              setExerciseNotes('');
              setShowExerciseModal(true);
            }}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
            title="Agregar nuevo ejercicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {/* ...existing code... */}
        {exercises.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No hay ejercicios para seguimiento.</p>
        ) : (
          orderedDays.map(day => (
            <div key={day} className="mb-6">
              <div className="flex items-center">
                <div className="flex w-full gap-2 items-center">
                  <div
                    className="flex items-center justify-between cursor-pointer p-1 sm:p-2 bg-black rounded-md hover:bg-gray-900 transition-colors flex-1 min-h-[36px]"
                    style={{ minHeight: '36px' }}
                    onClick={() => toggleDay(day)}
                  >
                    <h4 className="text-base font-bold text-white pl-1" style={{ fontSize: '15px' }}>{['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : day}</h4>
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 text-white transform transition-transform ${collapsedDays.has(day) ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <button className="ml-3 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors flex-shrink-0" title="Eliminar día completo" onClick={() => handleDeleteDay(day)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
              {!collapsedDays.has(day) && (
                sectionOrderByDay[day] && sectionOrderByDay[day].map((section, idx) => (
                  <div key={section} className={`mb-4${idx === 0 ? ' mt-4' : ''}`}>
                    <div className="flex items-center flex-1 gap-2">
                      <div
                        className={`flex items-center justify-between cursor-pointer px-2 py-1 rounded-md transition-colors flex-1 text-sm shadow ${[
                          'bg-gradient-to-r from-green-950 to-[#183E0C] text-white',
                          'bg-gradient-to-r from-[#183E0C] to-green-800 text-white',
                          'bg-gradient-to-r from-green-900 to-green-600 text-white',
                          'bg-gradient-to-r from-green-800 to-green-300 text-white',
                          'bg-gradient-to-r from-green-700 to-green-300 text-white',
                          'bg-gradient-to-r from-green-400 to-green-200 text-green-900',
                          'bg-gradient-to-r from-green-200 to-green-100 text-green-900',
                        ][idx % 7]}`}
                        style={{ minHeight: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                        onClick={() => toggleSection(`${day}-${section}`)}
                      >
                        <h5 className="font-semibold text-sm">{section}</h5>
                        <div className="flex items-center gap-2">
                          <svg className={`w-3 h-3 transform transition-transform ${collapsedSections.has(`${day}-${section}`) ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex-shrink-0" title="Mover arriba" onClick={() => moveSection('up', day, section)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex-shrink-0" title="Mover abajo" onClick={() => moveSection('down', day, section)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors flex-shrink-0" title="Eliminar sección completa" onClick={() => handleDeleteSection(day, section)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* Agrupación por round */}
                    {!collapsedSections.has(`${day}-${section}`) && (() => {
                      // Obtener ejercicios directamente del array original preservando el orden de inserción
                      const exercisesInOriginalOrder = exercises.filter(ex => {
                        const exDay = ex.day || 'Sin día';
                        const exSection = ex.section || 'Sin sección';
                        return exDay === day && exSection === section;
                      });

                      // Primero, agrupar ejercicios por round manteniendo el orden cronológico
                      const roundGroups = new Map();
                      const singleExercises = [];
                      
                      exercisesInOriginalOrder.forEach(exercise => {
                        const isRoundExercise = exercise.round && exercise.round !== '';
                        
                        if (isRoundExercise) {
                          const roundNumber = exercise.round;
                          if (!roundGroups.has(roundNumber)) {
                            roundGroups.set(roundNumber, []);
                          }
                          roundGroups.get(roundNumber).push(exercise);
                        } else {
                          singleExercises.push(exercise);
                        }
                      });

                      // Crear grupos de renderizado manteniendo el orden de aparición
                      const renderGroups = [];
                      const processedRounds = new Set();
                      
                      // Procesar ejercicios en orden original, pero agrupando rounds completos
                      exercisesInOriginalOrder.forEach(exercise => {
                        const isRoundExercise = exercise.round && exercise.round !== '';
                        
                        if (isRoundExercise) {
                          const roundNumber = exercise.round;
                          if (!processedRounds.has(roundNumber)) {
                            // Agregar todo el grupo de este round
                            renderGroups.push({
                              type: 'round',
                              roundName: `Round ${roundNumber}`,
                              exercises: roundGroups.get(roundNumber)
                            });
                            processedRounds.add(roundNumber);
                          }
                        } else {
                          // Ejercicio individual sin round
                          renderGroups.push({
                            type: 'single',
                            exercise: exercise
                          });
                        }
                      });

                      // Renderizar los grupos en orden original
                      return renderGroups.map((group, groupIndex) => {
                        if (group.type === 'round') {
                          // Renderizar grupo de round
                          const roundKey = `${day}-${section}-${group.roundName}`;
                          const isCollapsed = collapsedRounds[roundKey];
                          const firstExercise = group.exercises[0];
                          const cantidadRounds = firstExercise && firstExercise.cantidadRounds ? firstExercise.cantidadRounds : '';
                          const descansoRound = firstExercise && firstExercise.rest ? firstExercise.rest : '';
                          
                          return (
                            <div key={`${group.roundName}-${groupIndex}`} className="mb-4 mt-2">
                              <div
                                className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer bg-gray-200 hover:bg-gray-300 transition-colors mb-2 text-sm"
                                onClick={() => toggleRound(roundKey)}
                              >
                                <span className="font-semibold text-gray-700 text-sm flex gap-4 items-center">
                                  <span>{group.roundName}</span>
                                  {cantidadRounds && <span className="text-gray-700">x{cantidadRounds}</span>}
                                  {descansoRound && <span className="text-gray-700">Descanso: {descansoRound}</span>}
                                </span>
                                <svg
                                  className={`w-4 h-4 text-gray-700 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              {!isCollapsed && (
                                <div>
                                  {Array.isArray(group.exercises) && (
                                    <div className="p-4 bg-gray-50 rounded-xl shadow flex flex-col gap-4">
                                      {group.exercises.map((ex) => (
                                        <div key={ex.id} className="flex flex-col gap-2 border-b last:border-b-0 pb-2 last:pb-0">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2 w-full">
                                              <h6 className="text-md font-semibold text-gray-800">{ex.name}</h6>
                                              <div className="flex gap-2 items-center ml-auto">
                                                <button
                                                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                                  title="Editar ejercicio"
                                                  onClick={() => handleEditExerciseClick(ex)}
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                  </svg>
                                                </button>
                                                <button
                                                  className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                                                  title="Eliminar ejercicio"
                                                  onClick={() => handleDeleteExercise(ex.id)}
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                  </svg>
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                          {renderExerciseDetails(ex)}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        } else {
                          // Renderizar ejercicio individual sin round
                          const ex = group.exercise;
                          return (
                            <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow mb-4 mt-2">
                              <div className="flex items-center gap-2 w-full mb-2">
                                <h6 className="text-md font-semibold text-gray-800">{ex.name}</h6>
                                <div className="flex gap-2 items-center ml-auto">
                                  <button
                                    className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                    title="Editar ejercicio"
                                    onClick={() => handleEditExerciseClick(ex)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                    </svg>
                                  </button>
                                  <button
                                    className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700"
                                    title="Eliminar ejercicio"
                                    onClick={() => handleDeleteExercise(ex.id)}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              {renderExerciseDetails(ex)}
                            </div>
                          );
                        }
                      });
                    })()}
                  </div>
                ))
              )}
            </div>
          ))
        )}
      </div>
      <div className="w-full flex justify-center items-center mt-8">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Estás seguro de que quieres guardar los cambios en la plantilla?')) {
                handleSaveTemplate();
              }
            }}
            disabled={loading}
            className="bg-green-800 hover:bg-green-900 text-white px-5 py-2 rounded font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Modal para agregar/editar ejercicio */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto text-xs" style={{ fontSize: '12px' }}>
            <h3 className="text-base font-bold mb-4">
              {editExercise ? 'Editar Ejercicio' : 'Agregar Ejercicio'}
            </h3>
            {/* Sección 1: Día, Sección, Round, Cant. rounds */}
            <div className="mb-6 border-b pb-4 bg-blue-50 rounded-lg p-3">
              <div className="flex gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Día</label>
                  <select value={exerciseDay} onChange={e => setExerciseDay(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" style={{ fontSize: '12px' }}>
                    {dayOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Sección</label>
                  <select value={exerciseSection} onChange={e => setExerciseSection(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" style={{ fontSize: '12px' }}>
                    {sectionOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Round</label>
                  <input type="text" value={exerciseRound} onChange={e => setExerciseRound(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 1" style={{ fontSize: '12px' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cant. rounds</label>
                  <input type="number" value={exerciseCantidadRounds} onChange={e => setExerciseCantidadRounds(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 3" min="1" style={{ fontSize: '12px' }} />
                </div>
              </div>
            </div>
            {/* Sección 2: Resto de campos */}
            <div className="mb-6 bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del ejercicio</label>
                  <input type="text" value={exerciseName} onChange={e => setExerciseName(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: Sentadilla" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Series</label>
                  <input type="text" value={exerciseSets} onChange={e => setExerciseSets(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 3" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dropset</label>
                  <input type="text" value={exerciseDropset} onChange={e => setExerciseDropset(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 2" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Repeticiones</label>
                  <input type="text" value={exerciseReps} onChange={e => setExerciseReps(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 10-12" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input type="text" value={exerciseWeight} onChange={e => setExerciseWeight(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 80" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tiempo</label>
                  <input type="text" value={exerciseTime} onChange={e => setExerciseTime(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 30" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Descanso</label>
                  <input type="text" value={exerciseRest} onChange={e => setExerciseRest(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 90" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">RIR</label>
                  <input type="text" value={exerciseRIR} onChange={e => setExerciseRIR(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 2" style={{ fontSize: '12px' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cadencia</label>
                  <input type="text" value={exerciseCadencia} onChange={e => setExerciseCadencia(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: 3-1-2-1" style={{ fontSize: '12px' }} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">URL de Media (video/imagen)</label>
                  <input type="url" value={exerciseMedia} onChange={e => setExerciseMedia(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Ej: https://youtube.com/ejercicio" style={{ fontSize: '12px' }} />
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notas adicionales</label>
                  <textarea value={exerciseNotes} onChange={e => setExerciseNotes(e.target.value)} className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs" placeholder="Cualquier nota relevante sobre el ejercicio" rows={3} style={{ fontSize: '12px' }} />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSaveExercise}
                disabled={!exerciseName.trim()}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
              >Guardar</button>
              <button
                type="button"
                onClick={() => {
                  setShowExerciseModal(false);
                  setEditExercise(null);
                  setExerciseName("");
                  setExerciseSets("");
                  setExerciseReps("");
                  setExerciseDropset("");
                  setExerciseWeight("");
                  setExerciseTime("");
                  setExerciseRest("");
                  setExerciseDay("");
                  setExerciseSection("");
                  setExerciseMedia("");
                  setExerciseRIR("");
                  setExerciseCadencia("");
                  setExerciseRound("");
                  setExerciseCantidadRounds("");
                  setExerciseNotes("");
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar información de la plantilla */}
      {showRoutineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar Plantilla</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la plantilla</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Nombre de la plantilla"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="Descripción de la plantilla"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors" 
                onClick={handleSaveRoutineInfo}
              >
                Guardar
              </button>
              <button 
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors" 
                onClick={() => setShowRoutineModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para asignar a cliente */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Asignar rutina a cliente</h3>
            
            {/* Mostrar mensaje de éxito con icono si la asignación fue exitosa */}
            {assignmentSuccess ? (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-600 font-semibold mb-4">{assignStatus}</p>
                <button 
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
                  onClick={handleCloseAssignModal}
                >
                  Aceptar
                </button>
              </div>
            ) : (
              <>
                {/* Loading de usuarios */}
                {usersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                  </div>
                ) : usersError ? (
                  <p className="text-red-600 mb-4">{usersError}</p>
                ) : (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar cliente:
                    </label>
                    <select 
                      value={selectedUserId} 
                      onChange={e => setSelectedUserId(e.target.value)} 
                      className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isAssigning}
                    >
                      <option value="">Selecciona un cliente</option>
                      {users.map(u => (
                        <option key={u.client_id} value={u.client_id}>
                          {u.full_name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Mensaje de error si existe */}
                {assignStatus && !assignmentSuccess && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{assignStatus}</p>
                  </div>
                )}
                
                {/* Botones de acción */}
                <div className="flex gap-2 justify-end">
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAssignToUser} 
                    disabled={!selectedUserId || usersLoading || isAssigning}
                  >
                    {isAssigning && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {isAssigning ? 'Asignando...' : 'Asignar'}
                  </button>
                  <button 
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                    onClick={handleCloseAssignModal}
                    disabled={isAssigning}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetailTemplate;
