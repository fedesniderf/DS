import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { supabase } from '../supabaseClient';

const PerformanceDashboard = ({ 
  onClose, 
  currentUser, 
  clientId = null, 
  showClientSelector = true, 
  compactView = false 
}) => {
  const [availableRoutines, setAvailableRoutines] = useState([]);
  const [selectedRoutines, setSelectedRoutines] = useState(['ALL']); // Por defecto "Todas las rutinas"
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('ALL');
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('ALL');
  const [chartData, setChartData] = useState([]);
  const [pfpeData, setPfpeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('weights'); // 'weights' o 'pfpe'
  const [selectedRoutineForPfpe, setSelectedRoutineForPfpe] = useState('');
  const [selectedDayForPfpe, setSelectedDayForPfpe] = useState('ALL'); // Por defecto "Todos los días"
  const [availableDays, setAvailableDays] = useState([]);
  const [allExercisesData, setAllExercisesData] = useState([]); // Para almacenar datos de todos los ejercicios
  const [allDaysData, setAllDaysData] = useState([]); // Para almacenar datos de todos los días

  // Función para truncar nombres largos de ejercicios para mobile
  const truncateExerciseName = (name, maxLength = 25) => {
    if (name.length <= maxLength) return name;
    return name.substring(0, maxLength) + '...';
  };

  // Función para obtener nombre de ejercicio considerando el modo compacto
  const getExerciseDisplayName = (routineName, exerciseName) => {
    // Solo mostrar el nombre del ejercicio, sin la rutina
    if (compactView) {
      // En modo compacto, permitir nombres más largos del ejercicio solamente
      return window.innerWidth <= 640 ? 
        truncateExerciseName(exerciseName, 30) : 
        exerciseName; // Sin truncar en desktop
    } else {
      // En modo modal, usar la lógica original con rutina
      const fullName = `${routineName} - ${exerciseName}`;
      return truncateExerciseName(fullName);
    }
  };

  // Función para encontrar la rutina activa
  const findActiveRoutine = (routines) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche para comparación exacta
    console.log('🔍 === DETECTANDO RUTINA ACTIVA ===');
    console.log('🔍 Fecha actual (normalizada):', today.toISOString().split('T')[0]);
    console.log('🔍 Total rutinas a evaluar:', routines.length);
    
    // Primero buscar rutina activa
    const activeRoutine = routines.find(routine => {
      if (!routine.startDate || !routine.endDate) {
        console.log(`📋 ❌ Rutina "${routine.name}": Sin fechas válidas`);
        return false;
      }
      
      const startDate = new Date(routine.startDate);
      const endDate = new Date(routine.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999); // Final del día
      
      const isActive = today >= startDate && today <= endDate;
      console.log(`📋 Rutina "${routine.name}": ${routine.startDate} - ${routine.endDate}, activa: ${isActive ? '✅ SÍ' : '❌ NO'}`);
      console.log(`    - Start: ${startDate.toISOString().split('T')[0]} (${today >= startDate ? 'pasado' : 'futuro'})`);
      console.log(`    - End: ${endDate.toISOString().split('T')[0]} (${today <= endDate ? 'vigente' : 'expirado'})`);
      
      return isActive;
    });

    if (activeRoutine) {
      console.log(`✅ RUTINA ACTIVA ENCONTRADA: "${activeRoutine.name}" (ID: ${activeRoutine.id})`);
      return activeRoutine;
    }

    // Si no hay rutina activa, buscar la más reciente que no haya expirado hace mucho
    console.log('⚠️ No hay rutina activa, buscando la más apropiada...');
    
    // Filtrar rutinas con fechas válidas
    const validRoutines = routines.filter(r => r.startDate && r.endDate);
    
    if (validRoutines.length === 0) {
      console.log('❌ No hay rutinas con fechas válidas');
      return null;
    }
    
    // Ordenar por fecha de finalización más reciente
    const sortedRoutines = validRoutines.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
    const recentRoutine = sortedRoutines[0];
    
    console.log(`📋 Usando rutina más reciente: "${recentRoutine.name}" (ID: ${recentRoutine.id})`);
    console.log(`    - Fechas: ${recentRoutine.startDate} - ${recentRoutine.endDate}`);
    
    return recentRoutine;
  };

  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 === CARGANDO RUTINAS ===');
        console.log('🔍 currentUser:', currentUser);
        console.log('🔍 clientId prop:', clientId);
        
        const userId = clientId || currentUser?.id || currentUser?.client_id;
        console.log('🔍 userId extraído:', userId);
        
        if (!userId) return;
        const { data, error } = await supabase
          .from('rutinas')
          .select('id,name,exercises,dailyTracking,startDate,endDate')
          .eq('client_id', userId)
          .order('name');
          
        console.log('🔍 Query result - data:', data);
        console.log('🔍 Query result - error:', error);
        
        if (data && data.length > 0) {
          console.log('🔍 Primer elemento de availableRoutines:', data[0]);
          console.log('🔍 Tipo de ID del primer elemento:', typeof data[0].id, data[0].id);
        }
        
        if (error) throw error;
        setAvailableRoutines(data || []);
        
        // Configurar rutina activa por defecto para PF/PE
        if (data && data.length > 0) {
          console.log('🔍 === CONFIGURANDO RUTINA POR DEFECTO ===');
          console.log('🔍 Rutinas recibidas:', data.map(r => ({
            id: r.id,
            name: r.name,
            startDate: r.startDate,
            endDate: r.endDate
          })));
          
          const activeRoutine = findActiveRoutine(data);
          if (activeRoutine) {
            setSelectedRoutineForPfpe(String(activeRoutine.id));
            console.log(`🎯 ✅ Rutina por defecto configurada: "${activeRoutine.name}" (ID: ${activeRoutine.id})`);
          } else {
            console.log('❌ No se pudo determinar rutina por defecto');
          }
        } else {
          console.log('❌ No hay rutinas disponibles para configurar por defecto');
        }
      } catch (e) {
        console.error('❌ Error cargando rutinas:', e);
        setErrorMsg('Error cargando rutinas');
      }
    })();
  }, [currentUser]);

  // Re-evaluar rutina activa cuando cambien las rutinas disponibles
  useEffect(() => {
    console.log('🔄 === RE-EVALUANDO RUTINA ACTIVA ===');
    console.log('🔄 availableRoutines.length:', availableRoutines.length);
    console.log('🔄 selectedRoutineForPfpe actual:', selectedRoutineForPfpe);
    
    if (availableRoutines.length > 0 && !selectedRoutineForPfpe) {
      console.log('🔄 No hay rutina seleccionada, buscando rutina activa...');
      const activeRoutine = findActiveRoutine(availableRoutines);
      if (activeRoutine) {
        setSelectedRoutineForPfpe(String(activeRoutine.id));
        console.log(`🔄 ✅ Rutina activa configurada: "${activeRoutine.name}" (ID: ${activeRoutine.id})`);
      }
    }
  }, [availableRoutines]);

  useEffect(() => {
    console.log('🔍 === CARGANDO EJERCICIOS CON DATOS ===');
    console.log('🔍 selectedRoutines:', selectedRoutines);
    console.log('🔍 availableRoutines:', availableRoutines);
    
    const exerciseDataMap = new Map(); // Map<exerciseName, hasData>
    
    const filteredRoutines = availableRoutines.filter(r => {
      const isIncluded = selectedRoutines.includes(r.id) || selectedRoutines.includes(String(r.id));
      return isIncluded;
    });
    
    console.log('🔍 filteredRoutines:', filteredRoutines);
    
    // Recorrer todas las rutinas seleccionadas para buscar ejercicios con datos
    filteredRoutines.forEach(r => {
      console.log('🔍 Procesando rutina:', r.name, 'exercises:', r.exercises);
      (r.exercises || []).forEach(ex => {
        if (ex.name) {
          console.log('🔍 Evaluando ejercicio:', ex.name, 'en rutina:', r.name);
          
          // Verificar si este ejercicio tiene datos de peso
          let hasWeightData = false;
          
          // Buscar en weeklyData
          if (ex.weeklyData) {
            Object.values(ex.weeklyData).forEach(weekRecord => {
              if (weekRecord && weekRecord.seriesWeights && weekRecord.seriesWeights.length > 0) {
                const validWeights = weekRecord.seriesWeights.filter(w => {
                  const val = parseFloat(w);
                  return !isNaN(val) && val > 0;
                });
                if (validWeights.length > 0) {
                  hasWeightData = true;
                  console.log('🔍 ✅ Datos encontrados en weeklyData para:', ex.name, 'en rutina:', r.name);
                }
              }
            });
          }
          
          // Buscar en seriesWeights directos
          if (!hasWeightData && ex.seriesWeights && ex.seriesWeights.length > 0) {
            const validWeights = ex.seriesWeights.filter(w => {
              const val = parseFloat(w);
              return !isNaN(val) && val > 0;
            });
            if (validWeights.length > 0) {
              hasWeightData = true;
              console.log('🔍 ✅ Datos encontrados en seriesWeights para:', ex.name, 'en rutina:', r.name);
            }
          }
          
          // Actualizar el mapa: si ya existe y tiene datos, o si es nuevo y tiene datos
          if (hasWeightData || !exerciseDataMap.has(ex.name)) {
            exerciseDataMap.set(ex.name, hasWeightData || exerciseDataMap.get(ex.name) || false);
          }
        }
      });
    });
    
    // Crear lista solo con ejercicios que tienen datos
    const list = [];
    exerciseDataMap.forEach((hasData, exerciseName) => {
      if (hasData) {
        list.push({ id: exerciseName, name: exerciseName });
        console.log('🔍 ✅ Ejercicio con datos agregado a lista final:', exerciseName);
      } else {
        console.log('🔍 ❌ Ejercicio sin datos omitido:', exerciseName);
      }
    });
    
    console.log('🔍 Lista final de ejercicios con datos:', list);
    list.sort((a,b)=>a.name.localeCompare(b.name));
    setAvailableExercises(list);
    
    // Solo resetear el ejercicio seleccionado si no existe en la nueva lista
    if (selectedExercise && selectedExercise !== 'ALL' && !list.find(ex => ex.id === selectedExercise)) {
      console.log('� Ejercicio seleccionado no está en la nueva lista, reseteando:', selectedExercise);
      setSelectedExercise('ALL');
    } else if (!selectedExercise) {
      // Solo establecer el primer ejercicio si no hay ninguno seleccionado
      console.log('� No hay ejercicio seleccionado, estableciendo el primero');
      setSelectedExercise('ALL');
    } else {
      console.log('✅ Manteniendo ejercicio seleccionado:', selectedExercise);
    }
  }, [selectedRoutines, availableRoutines]);

  useEffect(() => {
    (async () => {
      setChartData([]);
      if (selectedRoutines.length === 0) return;
      
      // Si no hay ejercicio seleccionado o es "ALL", crear datos combinados
      if (!selectedExercise || selectedExercise === 'ALL') {
        if (selectedExercise === 'ALL') {
          // Mostrar datos de todos los ejercicios combinados
          setLoading(true);
          try {
            const allData = [];
            
            // Determinar qué rutinas procesar
            const routinesToProcess = selectedRoutines.includes('ALL') 
              ? availableRoutines.map(r => String(r.id))
              : selectedRoutines;
            
            console.log('🔍 Rutinas a procesar:', routinesToProcess);
            console.log('🔍 Rutinas disponibles:', availableRoutines);
            
            // Para cada rutina seleccionada
            for (const rid of routinesToProcess) {
              const routine = availableRoutines.find(r => String(r.id) === rid);
              if (!routine) {
                console.log('🔍 ❌ Rutina no encontrada:', rid);
                continue;
              }
              
              console.log('🔍 ✅ Procesando rutina:', routine.name, 'ID:', rid);
              
              // Agrupar por ejercicio y semana cuando se seleccionan todos los ejercicios
              const exerciseData = {};
              const exercises = routine.exercises || [];
              
              // Recopilar pesos de todos los ejercicios agrupados por ejercicio y semana
              exercises.forEach(ex => {
                const exerciseName = ex.name || 'Ejercicio sin nombre';
                
                if (!exerciseData[exerciseName]) {
                  exerciseData[exerciseName] = {};
                }
                
                // Procesar weeklyData si existe
                if (ex.weeklyData) {
                  Object.entries(ex.weeklyData).forEach(([weekKey, weekRecord]) => {
                    // NO filtrar por semana aquí - queremos mostrar todas las semanas disponibles
                    // para que el gráfico pueda mostrar barras de múltiples colores
                    
                    if (weekRecord && weekRecord.seriesWeights) {
                      const weights = [];
                      weekRecord.seriesWeights.forEach(w => {
                        const val = parseFloat(w);
                        if (!isNaN(val) && val > 0) {
                          weights.push(val);
                        }
                      });
                      
                      if (weights.length > 0) {
                        const avgWeight = Math.round((weights.reduce((a,b)=>a+b,0)/weights.length)*10)/10;
                        // Asegurarse de que weekKey ya tiene el formato correcto
                        const finalWeekKey = weekKey.startsWith('S') ? weekKey : `S${weekKey}`;
                        exerciseData[exerciseName][finalWeekKey] = avgWeight;
                        console.log(`🔍 Agregando datos para ${exerciseName} ${finalWeekKey}: ${avgWeight}kg (weekKey original: ${weekKey})`);
                      }
                    }
                  });
                }
                
                // Si no hay weeklyData, usar seriesWeights como semana 1
                if (ex.seriesWeights && (!ex.weeklyData || Object.keys(ex.weeklyData).length === 0)) {
                  // NO filtrar por semana aquí - siempre incluir S1 si hay datos básicos
                  
                  const weights = [];
                  ex.seriesWeights.forEach(w => {
                    const val = parseFloat(w);
                    if (!isNaN(val) && val > 0) {
                      weights.push(val);
                    }
                  });
                  
                  if (weights.length > 0) {
                    const avgWeight = Math.round((weights.reduce((a,b)=>a+b,0)/weights.length)*10)/10;
                    exerciseData[exerciseName]['S1'] = avgWeight;
                    console.log(`🔍 Agregando datos S1 para ${exerciseName}: ${avgWeight}kg`);
                  }
                }
              });
              
              // Convertir a formato para el gráfico
              Object.entries(exerciseData).forEach(([exerciseName, weeks]) => {
                if (Object.keys(weeks).length > 0) {
                  const routineName = routine.name || rid;
                  const displayName = getExerciseDisplayName(routineName, exerciseName);
                  allData.push({ 
                    ejercicio: displayName,
                    ...weeks, // S1: valor, S2: valor, etc.
                    rutina: routineName,
                    ejercicioOriginal: exerciseName
                  });
                }
              });
            }
            
            allData.sort((a,b)=> a.ejercicio.localeCompare(b.ejercicio));
            console.log('🔍 Datos combinados finales (antes del filtro):', allData);
            console.log('🔍 Estructura del primer elemento combinado:', allData[0]);
            console.log('🔍 Estado del filtro de semana combinado:', { selectedWeek, tipo: typeof selectedWeek });
            
            // Solo aplicar filtro de semana si se seleccionó una semana específica (no "ALL" ni vacío)
            let finalAllData = allData;
            if (selectedWeek && selectedWeek !== 'ALL' && selectedWeek !== '' && selectedWeek !== 'all') {
              console.log('🔍 Aplicando filtro de semana para "todos":', selectedWeek);
              // selectedWeek puede ser "1", "2", etc. o "S1", "S2", etc.
              const weekKey = selectedWeek.startsWith('S') ? selectedWeek : `S${selectedWeek}`;
              console.log('🔍 Buscando clave de semana combinada:', weekKey);
              
              finalAllData = allData.map(row => {
                const filteredRow = { 
                  ejercicio: row.ejercicio, 
                  rutina: row.rutina, 
                  ejercicioOriginal: row.ejercicioOriginal 
                };
                
                // Solo mantener la semana seleccionada
                if (row[weekKey] !== undefined) {
                  filteredRow[weekKey] = row[weekKey];
                  console.log(`🔍 Manteniendo ${weekKey} para ${row.ejercicio}:`, row[weekKey]);
                }
                return filteredRow;
              }).filter(row => {
                // Solo mantener filas que tengan datos para la semana seleccionada
                const hasData = row[weekKey] !== undefined;
                if (!hasData) {
                  console.log(`🔍 Filtrando ${row.ejercicio} - no tiene datos para ${weekKey}`);
                }
                return hasData;
              });
              console.log('🔍 Datos combinados después del filtro de semana:', finalAllData);
            } else {
              console.log('🔍 NO aplicando filtro de semana combinado - mostrando todas las semanas disponibles');
            }
            
            // Ordenar por el peso máximo de cada ejercicio (descendente) y limitar a 10
            finalAllData.sort((a, b) => {
              // Obtener el peso máximo de todas las semanas para cada ejercicio
              const aMaxWeight = Math.max(...Object.keys(a).filter(key => key.startsWith('S')).map(key => a[key] || 0));
              const bMaxWeight = Math.max(...Object.keys(b).filter(key => key.startsWith('S')).map(key => b[key] || 0));
              return bMaxWeight - aMaxWeight; // Orden descendente
            });
            
            // Limitar a los primeros 10 ejercicios con más peso
            finalAllData = finalAllData.slice(0, 10);
            
            console.log('🔍 Top 10 ejercicios combinados por peso máximo:', finalAllData.map(r => ({
              ejercicio: r.ejercicio,
              pesoMaximo: Math.max(...Object.keys(r).filter(key => key.startsWith('S')).map(key => r[key] || 0))
            })));
            
            console.log('🔍 Datos combinados finales que se envían al gráfico:', finalAllData);
            setChartData(finalAllData);
          } catch (e) {
            console.error('❌ Error generando datos combinados:', e);
            setErrorMsg('Error generando datos');
          } finally {
            setLoading(false);
          }
        }
        return;
      }
      
      setLoading(true);
      try {
        console.log('🔍 === CARGANDO DATOS DEL GRÁFICO ===');
        console.log('🔍 selectedRoutines:', selectedRoutines);
        console.log('🔍 selectedExercise:', selectedExercise);
        
        // Determinar qué rutinas procesar
        const routinesToProcess = selectedRoutines.includes('ALL') 
          ? availableRoutines.map(r => String(r.id))
          : selectedRoutines;
        
        console.log('🔍 Rutinas a procesar para ejercicio individual:', routinesToProcess);
        
        const rows = [];
        for (const rid of routinesToProcess) {
          console.log('🔍 Procesando rutina ID:', rid);
          
          // Obtener la rutina completa con sus ejercicios
          const { data: routine, error } = await supabase
            .from('rutinas')
            .select('*')
            .eq('id', rid)
            .single();
            
          console.log('🔍 Rutina obtenida:', routine);
          
          if (error) {
            console.error('❌ Error obteniendo rutina:', error);
            continue;
          }
          
          // Agrupar pesos por ejercicio y semana
          const exerciseData = {};
          const exercises = routine.exercises || [];
          
          console.log('🔍 Ejercicios en rutina:', exercises);
          
          // Buscar ejercicios que coincidan con el nombre seleccionado
          exercises.forEach(ex => {
            console.log('🔍 Evaluando ejercicio:', ex.name, 'vs', selectedExercise);
            
            if (ex.name === selectedExercise) {
              console.log('🔍 ✅ Ejercicio coincide, buscando datos de peso');
              
              const exerciseName = ex.name || 'Ejercicio sin nombre';
              
              if (!exerciseData[exerciseName]) {
                exerciseData[exerciseName] = {};
              }
              
              // Procesar weeklyData si existe
              if (ex.weeklyData) {
                console.log('🔍 WeeklyData encontrado:', ex.weeklyData);
                Object.entries(ex.weeklyData).forEach(([weekKey, weekRecord]) => {
                  // NO filtrar por semana aquí - queremos mostrar todas las semanas disponibles
                  
                  if (weekRecord && weekRecord.seriesWeights) {
                    const weights = [];
                    weekRecord.seriesWeights.forEach(w => {
                      const val = parseFloat(w);
                      if (!isNaN(val) && val > 0) {
                        weights.push(val);
                        console.log('🔍 Peso agregado desde weeklyData para S' + weekKey, ':', val);
                      }
                    });
                    
                    if (weights.length > 0) {
                      const avgWeight = Math.round((weights.reduce((a,b)=>a+b,0)/weights.length)*10)/10;
                      // Asegurarse de que weekKey ya tiene el formato correcto
                      const finalWeekKey = weekKey.startsWith('S') ? weekKey : `S${weekKey}`;
                      exerciseData[exerciseName][finalWeekKey] = avgWeight;
                      console.log(`🔍 [Individual] Agregando datos para ${exerciseName} ${finalWeekKey}: ${avgWeight}kg (weekKey original: ${weekKey})`);
                    }
                  }
                });
              }
              
              // Si no hay weeklyData, usar seriesWeights como semana 1
              if (ex.seriesWeights && (!ex.weeklyData || Object.keys(ex.weeklyData).length === 0)) {
                console.log('🔍 SeriesWeights encontrado:', ex.seriesWeights);
                
                // NO filtrar por semana aquí - siempre incluir S1 si hay datos básicos
                
                const weights = [];
                ex.seriesWeights.forEach(w => {
                  const val = parseFloat(w);
                  if (!isNaN(val) && val > 0) {
                    weights.push(val);
                    console.log('🔍 Peso agregado desde seriesWeights para S1:', val);
                  }
                });
                
                if (weights.length > 0) {
                  const avgWeight = Math.round((weights.reduce((a,b)=>a+b,0)/weights.length)*10)/10;
                  exerciseData[exerciseName]['S1'] = avgWeight;
                  console.log(`🔍 [Individual] Agregando datos S1 para ${exerciseName}: ${avgWeight}kg`);
                }
              }
            } // Cierre del if (ex.name === selectedExercise)
          });
          
          // Crear entradas del gráfico por ejercicio
          Object.entries(exerciseData).forEach(([exerciseName, weeks]) => {
            if (Object.keys(weeks).length > 0) {
              const routineName = routine.name || rid;
              
              console.log('🔍 Datos de semanas para', exerciseName, ':', weeks);
              
              rows.push({ 
                ejercicio: getExerciseDisplayName(routineName, exerciseName),
                ...weeks, // S1: valor, S2: valor, etc.
                rutina: routineName,
                ejercicioOriginal: exerciseName
              });
            }
          });
        }
        
        console.log('🔍 Datos finales para el gráfico (antes del filtro):', rows);
        console.log('🔍 Estructura del primer elemento:', rows[0]);
        console.log('🔍 Estado del filtro de semana:', { selectedWeek, tipo: typeof selectedWeek });
        
        // Solo aplicar filtro de semana si se seleccionó una semana específica (no "ALL" ni vacío)
        let finalRows = rows;
        if (selectedWeek && selectedWeek !== 'ALL' && selectedWeek !== '' && selectedWeek !== 'all') {
          console.log('🔍 Aplicando filtro de semana:', selectedWeek);
          // selectedWeek puede ser "1", "2", etc. o "S1", "S2", etc.
          const weekKey = selectedWeek.startsWith('S') ? selectedWeek : `S${selectedWeek}`;
          console.log('🔍 Buscando clave de semana:', weekKey);
          
          finalRows = rows.map(row => {
            const filteredRow = { 
              ejercicio: row.ejercicio, 
              rutina: row.rutina, 
              ejercicioOriginal: row.ejercicioOriginal 
            };
            
            // Solo mantener la semana seleccionada
            if (row[weekKey] !== undefined) {
              filteredRow[weekKey] = row[weekKey];
              console.log(`🔍 Manteniendo ${weekKey} para ${row.ejercicio}:`, row[weekKey]);
            }
            return filteredRow;
          }).filter(row => {
            // Solo mantener filas que tengan datos para la semana seleccionada
            const hasData = row[weekKey] !== undefined;
            if (!hasData) {
              console.log(`🔍 Filtrando ${row.ejercicio} - no tiene datos para ${weekKey}`);
            }
            return hasData;
          });
          console.log('🔍 Datos después del filtro de semana:', finalRows);
        } else {
          console.log('🔍 NO aplicando filtro de semana - mostrando todas las semanas disponibles');
        }
        
        // Ordenar por el peso máximo de cada ejercicio (descendente) y limitar a 10
        finalRows.sort((a, b) => {
          // Obtener el peso máximo de todas las semanas para cada ejercicio
          const aMaxWeight = Math.max(...Object.keys(a).filter(key => key.startsWith('S')).map(key => a[key] || 0));
          const bMaxWeight = Math.max(...Object.keys(b).filter(key => key.startsWith('S')).map(key => b[key] || 0));
          return bMaxWeight - aMaxWeight; // Orden descendente
        });
        
        // Limitar a los primeros 10 ejercicios con más peso
        finalRows = finalRows.slice(0, 10);
        
        console.log('🔍 Top 10 ejercicios por peso máximo:', finalRows.map(r => ({
          ejercicio: r.ejercicio,
          pesoMaximo: Math.max(...Object.keys(r).filter(key => key.startsWith('S')).map(key => r[key] || 0))
        })));
        
        console.log('🔍 Datos finales que se envían al gráfico:', finalRows);
        setChartData(finalRows);
      } catch (e) {
        console.error('❌ Error generando datos:', e);
        setErrorMsg('Error generando datos');
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedRoutines, selectedExercise, selectedWeek, availableRoutines]);

  // Cargar semanas disponibles
  useEffect(() => {
    if (!selectedRoutines.length) return;
    
    // Determinar qué rutinas procesar para semanas
    const routinesToProcess = selectedRoutines.includes('ALL') 
      ? availableRoutines.map(r => String(r.id))
      : selectedRoutines;
    
    const allWeeks = new Set();
    
    routinesToProcess.forEach(rid => {
      const routine = availableRoutines.find(r => String(r.id) === String(rid));
      if (routine && routine.exercises) {
        routine.exercises.forEach(ex => {
          if (!selectedExercise || selectedExercise === 'ALL' || ex.name === selectedExercise) {
            // Buscar semanas en weeklyData
            if (ex.weeklyData) {
              Object.keys(ex.weeklyData).forEach(week => {
                allWeeks.add(week);
              });
            } else if (ex.seriesWeights) {
              // Si no hay weeklyData pero hay seriesWeights, agregar semana 1
              allWeeks.add('1');
            }
          }
        });
      }
    });
    
    const weeksList = Array.from(allWeeks)
      .map(week => ({ id: week, name: `Semana ${week}` }))
      .sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    console.log('🔍 Semanas disponibles:', weeksList);
    setAvailableWeeks(weeksList);
    
    // Mantener selección si es válida, sino resetear a ALL
    if (selectedWeek && selectedWeek !== 'ALL' && !weeksList.find(w => w.id === selectedWeek)) {
      console.log('� Semana seleccionada no está disponible, reseteando a ALL:', selectedWeek);
      setSelectedWeek('ALL');
    } else if (selectedWeek) {
      console.log('✅ Manteniendo semana seleccionada:', selectedWeek);
    }
  }, [selectedRoutines, selectedExercise, availableRoutines]);

  // Cargar días disponibles para PF/PE cuando se selecciona una rutina
  useEffect(() => {
    if (!selectedRoutineForPfpe) {
      setAvailableDays([]);
      return;
    }
    
    console.log('🔍 === CARGANDO DÍAS PARA PF/PE ===');
    console.log('🔍 selectedRoutineForPfpe:', selectedRoutineForPfpe);
    
    if (selectedRoutineForPfpe === 'ALL') {
      // Para todas las rutinas, recopilar todos los días únicos
      const allDays = new Set();
      availableRoutines.forEach(routine => {
        if (routine.dailyTracking) {
          Object.keys(routine.dailyTracking).forEach(day => allDays.add(day));
        }
      });
      const daysList = Array.from(allDays).map(day => ({ id: day, name: day }));
      console.log('🔍 Días únicos de todas las rutinas:', daysList);
      setAvailableDays(daysList);
      
    // Solo resetear a "ALL" si el día seleccionado no está disponible
    if (selectedDayForPfpe && selectedDayForPfpe !== 'ALL' && !daysList.find(d => d.id === selectedDayForPfpe)) {
      console.log('� Día seleccionado no está disponible, reseteando a ALL:', selectedDayForPfpe);
      setSelectedDayForPfpe('ALL');
    } else if (!selectedDayForPfpe) {
      // Solo establecer ALL si no hay nada seleccionado
      console.log('🔄 No hay día seleccionado, estableciendo ALL');
      setSelectedDayForPfpe('ALL');
    } else {
      console.log('✅ Manteniendo día seleccionado:', selectedDayForPfpe);
    }
    } else {
      const routine = availableRoutines.find(r => String(r.id) === selectedRoutineForPfpe);
      console.log('🔍 Rutina encontrada:', routine);
      console.log('🔍 dailyTracking completo:', routine?.dailyTracking);
      
      if (routine && routine.dailyTracking) {
        const days = Object.keys(routine.dailyTracking);
        console.log('🔍 Días disponibles:', days);
        const daysList = days.map(day => ({ id: day, name: day }));
        setAvailableDays(daysList);
        
        // Solo resetear a "ALL" si el día seleccionado no está disponible
        if (selectedDayForPfpe && selectedDayForPfpe !== 'ALL' && !daysList.find(d => d.id === selectedDayForPfpe)) {
          console.log('� Día seleccionado no está disponible, reseteando a ALL:', selectedDayForPfpe);
          setSelectedDayForPfpe('ALL');
        } else if (!selectedDayForPfpe) {
          // Solo establecer ALL si no hay nada seleccionado
          console.log('🔄 No hay día seleccionado, estableciendo ALL');
          setSelectedDayForPfpe('ALL');
        } else {
          console.log('✅ Manteniendo día seleccionado:', selectedDayForPfpe);
        }
      } else {
        console.log('❌ No se encontró rutina o dailyTracking');
        setAvailableDays([]);
      }
    }
  }, [selectedRoutineForPfpe, availableRoutines]);

  // Cargar datos de PF/PE
  useEffect(() => {
    const loadPfpeData = async () => {
      if (!selectedRoutineForPfpe) {
        setPfpeData([]);
        return;
      }
      
      try {
        console.log('🔍 === CARGANDO DATOS PF/PE ===');
        console.log('🔍 Rutina seleccionada:', selectedRoutineForPfpe);
        console.log('🔍 Día seleccionado:', selectedDayForPfpe);
        
        let allChartData = [];
        
        if (selectedRoutineForPfpe === 'ALL') {
          // Procesar todas las rutinas
          const dayAverages = {};
          
          for (const routine of availableRoutines) {
            if (!routine.dailyTracking) continue;
            
            console.log('🔍 Procesando rutina:', routine.name);
            
            if (selectedDayForPfpe === 'ALL') {
              // Todos los días de todas las rutinas - calcular promedio por día
              Object.entries(routine.dailyTracking).forEach(([dayKey, dayData]) => {
                const records = Array.isArray(dayData) ? dayData : [dayData];
                const pfpeRecords = records.filter(record => record.PFPE);
                
                if (pfpeRecords.length > 0) {
                  const key = `${routine.name} - ${dayKey}`;
                  
                  if (!dayAverages[key]) {
                    dayAverages[key] = {
                      pfSum: 0,
                      peSum: 0,
                      count: 0,
                      rutina: routine.name,
                      dia: dayKey
                    };
                  }
                  
                  pfpeRecords.forEach(record => {
                    dayAverages[key].pfSum += parseFloat(record.PFPE.pf) || 0;
                    dayAverages[key].peSum += parseFloat(record.PFPE.pe) || 0;
                    dayAverages[key].count++;
                  });
                }
              });
            } else if (selectedDayForPfpe && routine.dailyTracking[selectedDayForPfpe]) {
              // Día específico de todas las rutinas - calcular promedio por rutina
              const dayData = routine.dailyTracking[selectedDayForPfpe];
              const records = Array.isArray(dayData) ? dayData : [dayData];
              const pfpeRecords = records.filter(record => record.PFPE);
              
              if (pfpeRecords.length > 0) {
                const key = `${routine.name} - ${selectedDayForPfpe}`;
                
                if (!dayAverages[key]) {
                  dayAverages[key] = {
                    pfSum: 0,
                    peSum: 0,
                    count: 0,
                    rutina: routine.name,
                    dia: selectedDayForPfpe
                  };
                }
                
                pfpeRecords.forEach(record => {
                  dayAverages[key].pfSum += parseFloat(record.PFPE.pf) || 0;
                  dayAverages[key].peSum += parseFloat(record.PFPE.pe) || 0;
                  dayAverages[key].count++;
                });
              }
            }
          }
          
          // Convertir promedios a datos del gráfico
          Object.entries(dayAverages).forEach(([key, data]) => {
            allChartData.push({
              semana: key,
              PF: data.count > 0 ? (data.pfSum / data.count).toFixed(2) : 0,
              PE: data.count > 0 ? (data.peSum / data.count).toFixed(2) : 0,
              fecha: 'Promedio',
              dia: data.dia,
              rutina: data.rutina,
              registros: data.count
            });
          });
        } else {
          // Rutina específica
          const { data: routine, error } = await supabase
            .from('rutinas')
            .select('*')
            .eq('id', selectedRoutineForPfpe)
            .single();
            
          console.log('🔍 Rutina obtenida de BD:', routine);
          
          if (error || !routine.dailyTracking) {
            console.log('❌ Error o no hay dailyTracking');
            setPfpeData([]);
            return;
          }
          
          if (selectedDayForPfpe === 'ALL') {
            // Todos los días de rutina específica - calcular promedio por día
            const dayAverages = {};
            
            Object.entries(routine.dailyTracking).forEach(([dayKey, dayData]) => {
              console.log(`🔍 Procesando día: ${dayKey}`, dayData);
              
              const records = Array.isArray(dayData) ? dayData : [dayData];
              const pfpeRecords = records.filter(record => record.PFPE);
              
              if (pfpeRecords.length > 0) {
                if (!dayAverages[dayKey]) {
                  dayAverages[dayKey] = {
                    pfSum: 0,
                    peSum: 0,
                    count: 0
                  };
                }
                
                pfpeRecords.forEach(record => {
                  console.log('🔍 ✅ Record con PFPE encontrado:', record.PFPE);
                  dayAverages[dayKey].pfSum += parseFloat(record.PFPE.pf) || 0;
                  dayAverages[dayKey].peSum += parseFloat(record.PFPE.pe) || 0;
                  dayAverages[dayKey].count++;
                });
              }
            });
            
            // Convertir promedios a datos del gráfico
            Object.entries(dayAverages).forEach(([dayKey, data]) => {
              allChartData.push({
                semana: `${routine.name} - ${dayKey}`,
                PF: data.count > 0 ? (data.pfSum / data.count).toFixed(2) : 0,
                PE: data.count > 0 ? (data.peSum / data.count).toFixed(2) : 0,
                fecha: 'Promedio',
                dia: dayKey,
                registros: data.count
              });
            });
          } else if (selectedDayForPfpe) {
            // Día específico de rutina específica
            const dayData = routine.dailyTracking[selectedDayForPfpe];
            console.log('🔍 Datos del día seleccionado:', dayData);
            
            if (dayData) {
              const records = Array.isArray(dayData) ? dayData : [dayData];
              
              records.forEach((record, index) => {
                if (record.PFPE) {
                  allChartData.push({
                    semana: record.PFPE.week || `Registro ${index + 1}`,
                    PF: parseFloat(record.PFPE.pf) || 0,
                    PE: parseFloat(record.PFPE.pe) || 0,
                    fecha: record.PFPE.timestamp || record.PFPE.date || 'Sin fecha',
                    dia: record.PFPE.day || selectedDayForPfpe
                  });
                }
              });
            }
          }
        }
        
        // Ordenar por rutina y día
        allChartData.sort((a, b) => {
          // Si tienen rutina, ordenar por rutina primero, luego por día
          if (a.rutina && b.rutina) {
            if (a.rutina !== b.rutina) {
              return a.rutina.localeCompare(b.rutina);
            }
            // Misma rutina, ordenar por día
            if (a.dia !== b.dia) {
              return a.dia.localeCompare(b.dia);
            }
          }
          
          // Fallback: ordenar por semana como antes
          const weekA = parseInt(a.semana.replace(/\D/g, '')) || 0;
          const weekB = parseInt(b.semana.replace(/\D/g, '')) || 0;
          return weekA - weekB;
        });
          
        console.log('🔍 === DATOS FINALES PF/PE ===');
        console.log('🔍 Datos PF/PE procesados para gráfico:', allChartData);
        setPfpeData(allChartData);
      } catch (e) {
        console.error('❌ Error cargando datos PF/PE:', e);
        setPfpeData([]);
      }
    };
    
    if (activeTab === 'pfpe') {
      loadPfpeData();
    }
  }, [selectedRoutineForPfpe, selectedDayForPfpe, activeTab, availableRoutines]);

  const handleRoutineChange = (e) => {
    const value = e.target.value;
    
    if (value === 'ALL') {
      // Seleccionar todas las rutinas
      const allRoutineIds = availableRoutines.map(r => String(r.id));
      setSelectedRoutines(allRoutineIds);
    } else if (value === '') {
      // Deseleccionar todas
      setSelectedRoutines([]);
    } else {
      // Seleccionar rutina específica
      setSelectedRoutines([value]);
    }
  };

  const handleExerciseChange = (e) => {
    const value = e.target.value;
    setSelectedExercise(value);
  };

  const handleWeekChange = (e) => {
    const value = e.target.value;
    setSelectedWeek(value);
  };

  // Función para obtener todas las semanas únicas de los datos del gráfico
  const getAvailableWeeksFromData = (data) => {
    const weeks = new Set();
    console.log('🔍 Analizando datos para obtener semanas:', data);
    
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key.startsWith('S') && key.match(/^S\d+$/)) { // S1, S2, S3, etc.
          weeks.add(key);
          console.log('🔍 Semana encontrada en datos:', key);
        }
      });
    });
    
    const sortedWeeks = Array.from(weeks).sort((a, b) => {
      const numA = parseInt(a.substring(1));
      const numB = parseInt(b.substring(1));
      return numA - numB;
    });
    
    console.log('🔍 Semanas disponibles en datos:', sortedWeeks);
    return sortedWeeks;
  };

  // Gama de azules - desde azul noche hasta azul claro
  const weekColors = {
    'S1': '#0B1426',  // Azul noche muy oscuro
    'S2': '#1E3A5F',  // Azul noche
    'S3': '#2563EB',  // Azul intenso
    'S4': '#3B82F6',  // Azul medio
    'S5': '#60A5FA',  // Azul moderado
    'S6': '#7DD3FC',  // Azul cian
    'S7': '#93C5FD',  // Azul claro
    'S8': '#BFDBFE',  // Azul muy claro
    'S9': '#DBEAFE',  // Azul pastel
    'S10': '#EFF6FF', // Azul casi blanco
  };

  // Función para obtener color con fallback mejorado
  const getWeekColor = (week) => {
    return weekColors[week] || '#F1F5F9'; // Azul gris claro como fallback
  };

  const handleDayChange = (e) => {
    const value = e.target.value;
    setSelectedDayForPfpe(value);
  };

  return (
    <div className={compactView 
      ? "w-full" 
      : "w-full p-4"
    }>
      <div className={compactView 
        ? "w-full" 
        : "w-full"
      }>
        {!compactView && (
          <div className="flex justify-between items-center p-3 sm:p-5 border-b">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Dashboard de Rendimiento</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl leading-none">×</button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('weights')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'weights'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Peso Promedio por Rutina
            </button>
            <button
              onClick={() => setActiveTab('pfpe')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'pfpe'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📈 Seguimiento PF/PE Semanal
            </button>
          </div>
        </div>

        {/* Filtros para Peso Promedio */}
        {activeTab === 'weights' && (
          <div className="p-3 sm:p-5 border-b bg-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rutinas</label>
              <select 
                value={
                  selectedRoutines.length === 0 ? '' :
                  selectedRoutines.length === availableRoutines.length ? 'ALL' :
                  selectedRoutines.length === 1 ? selectedRoutines[0] : 'MULTIPLE'
                } 
                onChange={handleRoutineChange} 
                className="w-full p-2 border rounded"
              >
                <option value="">Seleccionar rutina...</option>
                <option value="ALL" className="font-bold text-blue-600">🏆 Todas las rutinas</option>
                {availableRoutines.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
                {selectedRoutines.length > 1 && selectedRoutines.length < availableRoutines.length && (
                  <option value="MULTIPLE" disabled>✓ Múltiples seleccionadas ({selectedRoutines.length})</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ejercicio</label>
              <select value={selectedExercise} onChange={handleExerciseChange} disabled={!selectedRoutines.length} className="w-full p-2 border rounded">
                <option value="ALL" className="font-bold text-green-600">🏃‍♂️ Todos los ejercicios</option>
                {availableExercises.map(ex=> <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Semana</label>
              <select value={selectedWeek} onChange={handleWeekChange} disabled={!selectedRoutines.length} className="w-full p-2 border rounded">
                <option value="ALL" className="font-bold text-blue-600">📅 Todas las semanas</option>
                {availableWeeks.map(week => <option key={week.id} value={week.id}>{week.name}</option>)}
              </select>
            </div>
            <div className="flex items-end text-sm">
              {loading && <span className="text-gray-500">Cargando...</span>}
              {!loading && errorMsg && <span className="text-red-600">{errorMsg}</span>}
            </div>
          </div>
        )}

        {/* Filtros para PF/PE */}
        {activeTab === 'pfpe' && (
          <div className="p-3 sm:p-5 border-b bg-gray-50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rutina</label>
              <select value={selectedRoutineForPfpe} onChange={e=>setSelectedRoutineForPfpe(e.target.value)} className="w-full p-2 border rounded">
                <option value="">Seleccionar rutina...</option>
                <option value="ALL" className="font-bold text-blue-600">🏆 Todas las rutinas</option>
                {availableRoutines.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Día</label>
              <select value={selectedDayForPfpe} onChange={handleDayChange} disabled={!selectedRoutineForPfpe} className="w-full p-2 border rounded">
                <option value="">Seleccionar día...</option>
                <option value="ALL" className="font-bold text-purple-600">📅 Todos los días</option>
                {availableDays.map(day=> <option key={day.id} value={day.id}>{day.name}</option>)}
              </select>
            </div>
            <div className="flex items-end text-sm">
              {loading && <span className="text-gray-500">Cargando...</span>}
              {!loading && errorMsg && <span className="text-red-600">{errorMsg}</span>}
            </div>
          </div>
        )}

        <div className={compactView ? "p-2 sm:p-3" : "p-3 sm:p-5"}>
          {/* Gráfico de Peso Promedio */}
          {activeTab === 'weights' && (
            <>
              <div className={compactView ? "mb-2 sm:mb-3 text-center" : "mb-3 sm:mb-4 text-center"}>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                  📊 Top 10 Ejercicios por Peso Máximo
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Progresión semanal de los ejercicios con mayor peso registrado
                </p>
              </div>
              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500 text-sm">Selecciona al menos una rutina y un ejercicio.</div>
              ) : (
                <>
                  {(() => {
                    const availableWeeks = getAvailableWeeksFromData(chartData);
                    console.log('🔍 Rendering gráfico con semanas:', availableWeeks);
                    console.log('🔍 Datos del gráfico:', chartData);
                    
                    return (
                      <ResponsiveContainer 
                        width="100%" 
                        height={compactView ? 
                          (window.innerWidth <= 640 ? 400 : 500) : 
                          (window.innerWidth <= 640 ? 350 : 450)
                        }
                      >
                        <BarChart 
                          data={chartData} 
                          layout="vertical" 
                          margin={compactView ? { 
                            top: 10, 
                            right: window.innerWidth <= 640 ? 5 : 10, 
                            left: 5, 
                            bottom: 10 
                          } : { 
                            top: 15, 
                            right: window.innerWidth <= 640 ? 10 : 15, 
                            left: 5, 
                            bottom: 15 
                          }}
                          barCategoryGap={compactView ? "10%" : "15%"}
                          maxBarSize={window.innerWidth <= 640 ? 15 : 20}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            type="number" 
                            label={{ value: 'Peso (kg)', position: 'insideBottom', offset: -5 }}
                            tick={{ 
                              fontSize: compactView ? 
                                (window.innerWidth <= 640 ? 8 : 9) : 
                                10
                            }}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="ejercicio" 
                            width={compactView ? 
                              (window.innerWidth <= 640 ? 70 : 100) : 
                              (window.innerWidth <= 640 ? 120 : 150)
                            }
                            tick={{ 
                              fontSize: compactView ? 
                                (window.innerWidth <= 640 ? 8 : 10) : 
                                (window.innerWidth <= 640 ? 8 : 9), 
                              textAnchor: 'end',
                              width: compactView ? 
                                (window.innerWidth <= 640 ? 95 : 95) : 
                                (window.innerWidth <= 640 ? 110 : 140)
                            }}
                            interval={0}
                          />
                          <Tooltip 
                            formatter={(v, name) => [`${v} kg`, `S${name.substring(1)}`]}
                            labelFormatter={(label) => label} // Mostrar el label tal como está
                            contentStyle={{ 
                              backgroundColor: '#ffffff', 
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              fontSize: '12px',
                              padding: '8px'
                            }}
                          />
                          <Legend 
                            verticalAlign="top" 
                            height={30}
                            iconType="rect"
                            wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                          />
                          {availableWeeks.map((week, index) => {
                            const color = getWeekColor(week);
                            console.log(`🔍 Renderizando barra para ${week} con color ${color}`);
                            return (
                              <Bar 
                                key={week}
                                dataKey={week} 
                                fill={color}
                                stroke="#E2E8F0"
                                strokeWidth={0.5}
                                radius={[0, 3, 3, 0]}
                                name={`Semana ${week.substring(1)}`}
                              />
                            );
                          })}
                        </BarChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </>
              )}
            </>
          )}

          {/* Gráfico de PF/PE */}
          {activeTab === 'pfpe' && (
            <>
              {pfpeData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                  Selecciona una rutina y un día para ver el seguimiento PF/PE.
                </div>
              ) : (
                <>
                  <div className={compactView ? "mb-2 sm:mb-3 text-center" : "mb-3 sm:mb-4 text-center"}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                      📈 Seguimiento PF/PE Semanal
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Evolución del Rendimiento Percibido (PF) y Esfuerzo Percibido (PE) por rutina y día
                    </p>
                    {window.innerWidth <= 640 && (
                      <p className="text-xs text-blue-600 mt-1 bg-blue-50 rounded px-2 py-1 inline-block">
                        💡 Toca los puntos del gráfico para ver detalles
                      </p>
                    )}
                  </div>
                  <ResponsiveContainer 
                    width="100%" 
                    height={compactView ? 
                      (window.innerWidth <= 640 ? 400 : 480) : 
                      480
                    }
                  >
                    <LineChart 
                      data={pfpeData} 
                      margin={compactView ? { 
                        top: 20, 
                        right: window.innerWidth <= 640 ? 10 : 15, 
                        left: window.innerWidth <= 640 ? 5 : 10, 
                        bottom: window.innerWidth <= 640 ? 20 : 70 
                      } : { 
                        top: 10, 
                        right: 30, 
                        left: 15, 
                        bottom: 80 
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      {window.innerWidth <= 640 ? (
                        // Versión móvil: XAxis completamente oculto
                        <XAxis 
                          dataKey="semana" 
                          hide={true}
                          axisLine={false}
                          tickLine={false}
                        />
                      ) : (
                        // Versión desktop: XAxis completo
                        <XAxis 
                          dataKey="semana" 
                          label={{ 
                            value: 'Rutina - Día', 
                            position: 'insideBottom', 
                            offset: -60 
                          }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                          fontSize={11}
                        />
                      )}
                      <YAxis 
                        domain={[0, 5]} 
                        tick={{ 
                          fontSize: compactView ? 
                            (window.innerWidth <= 640 ? 9 : 9) : 
                            11
                        }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [value, name === 'PF' ? 'Peso Forme (PF)' : 'Peso Emotionale (PE)']}
                        labelFormatter={(label) => `${label}`}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: window.innerWidth <= 640 ? '12px' : '14px'
                        }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                                <p className="font-semibold text-gray-800 mb-2">{`${label}`}</p>
                                <div className="space-y-1">
                                  <p className="text-red-600 flex items-center">
                                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                                    PF: {payload[0].value}
                                  </p>
                                  <p className="text-green-600 flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                    PE: {payload[1].value}
                                  </p>
                                </div>
                                {data.registros && (
                                  <p className="text-gray-500 text-sm mt-2 border-t pt-2">
                                    📊 Promedio de {data.registros} registro(s)
                                  </p>
                                )}
                                {data.fecha && data.fecha !== 'Promedio' && (
                                  <p className="text-gray-500 text-sm">
                                    📅 {data.fecha}
                                  </p>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="PF" stroke="#ef4444" strokeWidth={3} name="Percepción de Fuerza (PF)" />
                      <Line type="monotone" dataKey="PE" stroke="#10b981" strokeWidth={3} name="Percepción del Esfuerzo (PE)" />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
