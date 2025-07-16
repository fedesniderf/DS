import React from "react";

const RoutineDetail = ({
  routine,
  onUpdateRoutine = () => {},
  isEditable,
  onAddExerciseClick = () => {},
  canAddDailyTracking = false,
}) => {
  // ✅ CORRECTO - Todos los hooks DENTRO de la función del componente
  const [showExerciseModal, setShowExerciseModal] = React.useState(false);
  const [editExercise, setEditExercise] = React.useState(null);
  const [exerciseName, setExerciseName] = React.useState("");
  const [exerciseSets, setExerciseSets] = React.useState("");
  const [exerciseReps, setExerciseReps] = React.useState("");
  const [exerciseWeight, setExerciseWeight] = React.useState("");
  const [exerciseTime, setExerciseTime] = React.useState("");
  const [exerciseRest, setExerciseRest] = React.useState("");
  const [exerciseDay, setExerciseDay] = React.useState("");
  const [exerciseSection, setExerciseSection] = React.useState("");

  // Handler para editar ejercicio
  const handleEditExerciseClick = (ex) => {
    setEditExercise(ex);
    setExerciseName(ex.name || "");
    setExerciseSets(ex.sets || "");
    setExerciseReps(ex.reps || "");
    setExerciseWeight(ex.weight || "");
    setExerciseTime(ex.time || "");
    setExerciseRest(ex.rest || "");
    setExerciseDay(ex.day || "");
    setExerciseSection(ex.section || "");
    setShowExerciseModal(true);
  };

  // Calcular semanas de la rutina
  const getWeekOptions = () => {
    if (!routine.startDate || !routine.endDate) return [];
    const start = new Date(routine.startDate);
    const end = new Date(routine.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numWeeks = Math.max(1, Math.ceil(diffDays / 7));
    return Array.from({ length: numWeeks }, (_, i) => ({ value: (i + 1).toString(), label: `Semana ${i + 1}` }));
  };
  // Definir exercises al inicio para evitar ReferenceError
  const exercises = Array.isArray(routine.exercises) ? routine.exercises : [];

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

  // Opciones para el desplegable de sección (igual que en AddExerciseScreen)
  const sectionOptions = [
    { value: '', label: 'Selecciona una sección' },
    { value: 'Warm Up', label: 'Warm Up' },
    { value: 'Trabajo DS', label: 'Trabajo DS' },
    { value: 'Out', label: 'Out' },
  ];

  // Estado para modales y formularios
  // Estado para seguimiento semanal
  const [showWeeklyModal, setShowWeeklyModal] = React.useState(false);
  const [weeklyExercise, setWeeklyExercise] = React.useState(null);
  const [weekNumber, setWeekNumber] = React.useState("");
  const [weekWeight, setWeekWeight] = React.useState("");
  const [weekNotes, setWeekNotes] = React.useState("");

  // Estado para seguimiento diario general de rutina
  const [showDailyModal, setShowDailyModal] = React.useState(false);
  const [dailyDate, setDailyDate] = React.useState("");
  const [dailyPF, setDailyPF] = React.useState("");
  const [dailyPE, setDailyPE] = React.useState("");

  // Estados para colapso/expansión
  const [collapsedDays, setCollapsedDays] = React.useState(new Set());
  const [collapsedSections, setCollapsedSections] = React.useState(new Set());

  // Funciones para manejar colapso/expansión
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

  const handleOpenWeeklyModal = (exercise) => {
    setWeeklyExercise(exercise);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes("");
    setShowWeeklyModal(true);
  };

  const handleCloseWeeklyModal = () => {
    setShowWeeklyModal(false);
    setWeeklyExercise(null);
    setWeekNumber("");
    setWeekWeight("");
    setWeekNotes("");
  };

  // Handlers para seguimiento diario general
  const handleOpenDailyModal = () => {
    setDailyDate(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
    setDailyPF("");
    setDailyPE("");
    setShowDailyModal(true);
  };

  const handleCloseDailyModal = () => {
    setShowDailyModal(false);
    setDailyDate("");
    setDailyPF("");
    setDailyPE("");
  };

  const handleSaveDaily = () => {
    if (!dailyDate || !dailyPF || !dailyPE) return;
    
    // Crear el objeto de datos diarios para la rutina
    const dailyData = {
      date: dailyDate,
      pf: parseInt(dailyPF),
      pe: parseInt(dailyPE),
      timestamp: new Date().toISOString()
    };

    // Llamar a la función para actualizar la rutina
    onUpdateRoutine({
      id: routine.id,
      action: 'addDailyRoutineTracking',
      data: dailyData
    });

    handleCloseDailyModal();
  };

  const handleSaveWeekly = () => {
    if (!weekNumber || !weeklyExercise) return;
    
    // Crear el objeto de datos semanales
    const weeklyData = {
      week: weekNumber,
      weight: weekWeight,
      generalNotes: weekNotes,
      date: new Date().toISOString().split('T')[0] // Fecha actual
    };

    // Llamar a la función para actualizar la rutina
    onUpdateRoutine({
      id: routine.id,
      action: 'addWeeklyTracking',
      data: {
        exerciseId: weeklyExercise.id,
        weeklyData: weeklyData
      }
    });

    handleCloseWeeklyModal();
  };

  // Agrupar y renderizar ejercicios por día y sección
  let ejerciciosPorDia = null;
  if (exercises.length === 0) {
    ejerciciosPorDia = <p className="text-gray-600 text-center py-4">No hay ejercicios para seguimiento.</p>;
  } else {
    // Agrupar por día y luego por sección
    const groupedByDay = exercises.reduce((acc, ex) => {
      const day = ex.day || 'Sin día';
      if (!acc[day]) acc[day] = {};
      
      const section = ex.section || 'Sin sección';
      if (!acc[day][section]) acc[day][section] = [];
      acc[day][section].push(ex);
      
      return acc;
    }, {});

    // Orden específico de las secciones
    const sectionOrder = ['Warm Up', 'Trabajo DS', 'Out'];
    
    // Ordenar días
    const orderedDays = [
      '1','2','3','4','5','6','7'
    ].filter(d => groupedByDay[d]).concat(Object.keys(groupedByDay).filter(d => !['1','2','3','4','5','6','7'].includes(d)));

    ejerciciosPorDia = orderedDays.map(day => (
      <div key={day} className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          onClick={() => toggleDay(day)}
        >
          <h4 className="text-lg font-bold text-blue-700">
            {['1','2','3','4','5','6','7'].includes(day) ? `Día ${day}` : 'Sin día asignado'}
          </h4>
          <svg 
            className={`w-5 h-5 text-blue-700 transform transition-transform ${collapsedDays.has(day) ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {!collapsedDays.has(day) && (
          <div className="mt-4">
            {/* Renderizar secciones en orden específico */}
            {sectionOrder.map(sectionName => {
              if (!groupedByDay[day][sectionName]) return null;
              
              const sectionKey = `${day}-${sectionName}`;
              
              return (
                <div key={sectionName} className="mb-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <h5 className="text-md font-semibold text-purple-700">{sectionName}</h5>
                    <svg 
                      className={`w-4 h-4 text-purple-700 transform transition-transform ${collapsedSections.has(sectionKey) ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {!collapsedSections.has(sectionKey) && (
                    <div className="grid gap-4 mt-3">
                      {groupedByDay[day][sectionName].map((ex) => (
                        <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="text-md font-semibold text-gray-800">{ex.name}</h6>
                            <div className="flex gap-2">
                              {/* Botón para seguimiento semanal */}
                              {canAddDailyTracking && (
                                <button
                                  className="p-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                                  title="Agregar seguimiento semanal"
                                  onClick={() => handleOpenWeeklyModal(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              )}
                              {/* Botón para editar ejercicio si esEditable */}
                              {isEditable && (
                                <button
                                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                  title="Editar ejercicio"
                                  onClick={() => handleEditExerciseClick(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2 text-sm text-gray-700">
                            <div><span className="font-semibold">Series:</span> {ex.sets || '-'}</div>
                            <div><span className="font-semibold">Repeticiones:</span> {ex.reps || '-'}</div>
                            <div><span className="font-semibold">Peso (Kg):</span> {ex.weight || '-'}</div>
                            <div><span className="font-semibold">Tiempo (seg):</span> {ex.time || '-'}</div>
                            <div><span className="font-semibold">Descanso (seg):</span> {ex.rest || '-'}</div>
                          </div>

                          {/* Mostrar seguimiento semanal */}
                          {ex.weeklyData ? (
                            <div className="mb-4">
                              <h6 className="text-sm font-semibold text-gray-700 mb-2">Seguimiento Semanal:</h6>
                              <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                                <thead className="bg-purple-100">
                                  <tr>
                                    <th className="px-2 py-1">Semana</th>
                                    <th className="px-2 py-1">Peso</th>
                                    <th className="px-2 py-1">Notas</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(ex.weeklyData).map(([week, data]) => (
                                    <tr key={week} className="border-t">
                                      <td className="px-2 py-1">{week}</td>
                                      <td className="px-2 py-1">{data.weight}</td>
                                      <td className="px-2 py-1">{data.generalNotes}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm mb-2">Sin datos de seguimiento semanal.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Mostrar ejercicios de secciones no estándar */}
            {Object.keys(groupedByDay[day]).filter(section => !sectionOrder.includes(section)).map(sectionName => {
              const sectionKey = `${day}-${sectionName}`;
              
              return (
                <div key={sectionName} className="mb-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => toggleSection(sectionKey)}
                  >
                    <h5 className="text-md font-semibold text-gray-700">{sectionName}</h5>
                    <svg 
                      className={`w-4 h-4 text-gray-700 transform transition-transform ${collapsedSections.has(sectionKey) ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {!collapsedSections.has(sectionKey) && (
                    <div className="grid gap-4 mt-3">
                      {groupedByDay[day][sectionName].map((ex) => (
                        <div key={ex.id} className="p-4 bg-gray-50 rounded-xl shadow">
                          <div className="flex items-center justify-between mb-2">
                            <h6 className="text-md font-semibold text-gray-800">{ex.name}</h6>
                            <div className="flex gap-2">
                              {/* Botón para seguimiento semanal */}
                              {canAddDailyTracking && (
                                <button
                                  className="p-1 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700"
                                  title="Agregar seguimiento semanal"
                                  onClick={() => handleOpenWeeklyModal(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                  </svg>
                                </button>
                              )}
                              {/* Botón para editar ejercicio si esEditable */}
                              {isEditable && (
                                <button
                                  className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                                  title="Editar ejercicio"
                                  onClick={() => handleEditExerciseClick(ex)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mb-2 text-sm text-gray-700">
                            <div><span className="font-semibold">Series:</span> {ex.sets || '-'}</div>
                            <div><span className="font-semibold">Repeticiones:</span> {ex.reps || '-'}</div>
                            <div><span className="font-semibold">Peso (Kg):</span> {ex.weight || '-'}</div>
                            <div><span className="font-semibold">Tiempo (seg):</span> {ex.time || '-'}</div>
                            <div><span className="font-semibold">Descanso (seg):</span> {ex.rest || '-'}</div>
                          </div>

                          {/* Mostrar seguimiento semanal */}
                          {ex.weeklyData ? (
                            <div className="mb-4">
                              <h6 className="text-sm font-semibold text-gray-700 mb-2">Seguimiento Semanal:</h6>
                              <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                                <thead className="bg-purple-100">
                                  <tr>
                                    <th className="px-2 py-1">Semana</th>
                                    <th className="px-2 py-1">Peso</th>
                                    <th className="px-2 py-1">Notas</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.entries(ex.weeklyData).map(([week, data]) => (
                                    <tr key={week} className="border-t">
                                      <td className="px-2 py-1">{week}</td>
                                      <td className="px-2 py-1">{data.weight}</td>
                                      <td className="px-2 py-1">{data.generalNotes}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm mb-2">Sin datos de seguimiento semanal.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    ));
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-700">Ejercicios por Día</h3>
          {/* Botón ícono para agregar ejercicio, solo para admin */}
          {isEditable && (
            <button
              onClick={() => onAddExerciseClick()}
              className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors shadow-md"
              title="Agregar Ejercicio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Botón para seguimiento diario general de rutina */}
        {canAddDailyTracking && (
          <button
            onClick={handleOpenDailyModal}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5a2.25 2.25 0 0 1 21 9v7.5m-9-13.5h.008v.008H12V8.25Z" />
            </svg>
            Seguimiento Diario
          </button>
        )}
        {ejerciciosPorDia}
        
        {/* Mostrar seguimiento diario general de la rutina */}
        {routine.dailyTracking && Object.keys(routine.dailyTracking).length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-lg font-bold text-blue-700 mb-4">Seguimiento Diario de la Rutina</h4>
            <div className="max-h-40 overflow-y-auto">
              <table className="w-full text-sm border border-blue-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="px-3 py-2">Fecha</th>
                    <th className="px-3 py-2">PF (0-5)</th>
                    <th className="px-3 py-2">PE (0-5)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(routine.dailyTracking)
                    .sort(([a], [b]) => new Date(b) - new Date(a))
                    .map(([date, data]) => (
                      <tr key={date} className="border-t">
                        <td className="px-3 py-2">{date}</td>
                        <td className="px-3 py-2">{data.pf}</td>
                        <td className="px-3 py-2">{data.pe}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal para seguimiento diario general */}
      {showDailyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Seguimiento Diario de la Rutina</h3>
            <p className="text-sm text-gray-600 mb-4">Registra tu percepción de fatiga y esfuerzo</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del entrenamiento
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={dailyDate}
                onChange={e => setDailyDate(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Fatiga (PF): {dailyPF}/5
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={dailyPF}
                onChange={e => setDailyPF(e.target.value)}
              >
                <option value="">Selecciona PF (0-5)</option>
                <option value="0">0 - Sin fatiga</option>
                <option value="1">1 - Muy poca fatiga</option>
                <option value="2">2 - Poca fatiga</option>
                <option value="3">3 - Fatiga moderada</option>
                <option value="4">4 - Mucha fatiga</option>
                <option value="5">5 - Fatiga extrema</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percepción de Esfuerzo (PE): {dailyPE}/5
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={dailyPE}
                onChange={e => setDailyPE(e.target.value)}
              >
                <option value="">Selecciona PE (0-5)</option>
                <option value="0">0 - Sin esfuerzo</option>
                <option value="1">1 - Muy poco esfuerzo</option>
                <option value="2">2 - Poco esfuerzo</option>
                <option value="3">3 - Esfuerzo moderado</option>
                <option value="4">4 - Mucho esfuerzo</option>
                <option value="5">5 - Esfuerzo extremo</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCloseDailyModal}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleSaveDaily}
                disabled={!dailyDate || !dailyPF || !dailyPE}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para agregar seguimiento semanal */}
      {showWeeklyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Agregar seguimiento semanal</h3>
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={weekNumber}
              onChange={e => setWeekNumber(e.target.value)}
            >
              <option value="">Selecciona la semana</option>
              {getWeekOptions().map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Peso (Kg)"
              value={weekWeight}
              onChange={e => setWeekWeight(e.target.value)}
            />
            <textarea
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Notas (máx 100 caracteres)"
              maxLength={100}
              value={weekNotes}
              onChange={e => setWeekNotes(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={handleCloseWeeklyModal}
              >Cancelar</button>
              <button
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                onClick={handleSaveWeekly}
                disabled={!weekNumber}
              >Guardar</button>
            </div>
          </div>
        </div>
      )}
      {/* Modal para editar ejercicio */}
      {showExerciseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Editar ejercicio</h3>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Nombre:</label>
                <input
                  type="text"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Nombre del ejercicio"
                  value={exerciseName}
                  onChange={e => setExerciseName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Sección:</label>
                <select
                  className="flex-1 border rounded px-3 py-2"
                  value={exerciseSection}
                  onChange={e => setExerciseSection(e.target.value)}
                >
                  {sectionOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Día:</label>
                <select
                  className="flex-1 border rounded px-3 py-2"
                  value={exerciseDay}
                  onChange={e => setExerciseDay(e.target.value)}
                >
                  {dayOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Series:</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Series"
                  value={exerciseSets}
                  onChange={e => setExerciseSets(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Repeticiones:</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Repeticiones"
                  value={exerciseReps}
                  onChange={e => setExerciseReps(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Peso (Kg):</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Peso (Kg)"
                  value={exerciseWeight}
                  onChange={e => setExerciseWeight(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Tiempo (seg):</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Tiempo (segundos)"
                  value={exerciseTime}
                  onChange={e => setExerciseTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700 w-24">Descanso (seg):</label>
                <input
                  type="number"
                  className="flex-1 border rounded px-3 py-2"
                  placeholder="Descanso (segundos)"
                  value={exerciseRest}
                  onChange={e => setExerciseRest(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => {
                  setShowExerciseModal(false);
                  setEditExercise(null);
                }}
              >Cancelar</button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => {
                  // Guardar cambios (puedes personalizar la lógica)
                  if (routine.id) {
                    onUpdateRoutine({
                      id: routine.id,
                      action: 'editExercise',
                      data: {
                        ...editExercise,
                        name: exerciseName,
                        sets: exerciseSets,
                        reps: exerciseReps,
                        weight: exerciseWeight,
                        time: exerciseTime,
                        rest: exerciseRest,
                        day: exerciseDay,
                        section: exerciseSection,
                      }
                    });
                    setShowExerciseModal(false);
                    setEditExercise(null);
                  } else {
                    alert('No se encontró el ID de la rutina.');
                  }
                }}
                disabled={!exerciseName.trim()}
              >Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetail;
