import React, { useState, useRef, useEffect } from 'react';
import AddExerciseToListModal from './AddExerciseToListModal';
import exerciseService from '../services/exerciseService';

const AutoCompleteInput = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Buscar...", 
  className = "",
  id = "",
  maxResults = 10 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [allExercises, setAllExercises] = useState(options);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Cargar todos los ejercicios al inicializar
  useEffect(() => {
    const loadAllExercises = () => {
      const exercises = exerciseService.getAllExercises();
      setAllExercises(exercises);
    };

    loadAllExercises();
  }, [options]);

  // Filtrar opciones basado en el valor de entrada
  useEffect(() => {
    if (value.length > 0) {
      const filtered = allExercises
        .filter(option => 
          option.toLowerCase().includes(value.toLowerCase())
        )
        .slice(0, maxResults)
        .sort((a, b) => {
          // Priorizar coincidencias exactas al inicio
          const aStartsWith = a.toLowerCase().startsWith(value.toLowerCase());
          const bStartsWith = b.toLowerCase().startsWith(value.toLowerCase());
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          return a.localeCompare(b);
        });
      setFilteredOptions(filtered);
      // Mostrar dropdown si hay resultados O si el usuario escribió más de 2 caracteres (para mostrar opción de agregar)
      setIsOpen(filtered.length > 0 || value.length > 2);
      setHighlightedIndex(-1);
    } else {
      setFilteredOptions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [value, allExercises, maxResults]);

  // Manejar selección de opción
  const handleOptionClick = (option) => {
    onChange(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Manejar adición de ejercicio nuevo
  const handleAddNewExercise = async (exerciseName) => {
    try {
      await exerciseService.addCustomExercise(exerciseName);
      
      // Recargar la lista de ejercicios
      const updatedExercises = exerciseService.getAllExercises();
      setAllExercises(updatedExercises);
      
      // Seleccionar el ejercicio recién agregado
      onChange(exerciseName);
      setIsOpen(false);
      setHighlightedIndex(-1);
      
      return true;
    } catch (error) {
      alert(error.message);
      throw error;
    }
  };

  // Manejar eliminación de ejercicio
  const handleDeleteExercise = async (exerciseName) => {
    console.log('Intentando eliminar ejercicio:', exerciseName);
    console.log('¿Es ejercicio personalizado?', exerciseService.isCustomExercise(exerciseName));
    
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${exerciseName}" de la lista?`)) {
      try {
        console.log('Usuario confirmó eliminación');
        const success = exerciseService.removeCustomExercise(exerciseName);
        console.log('Resultado de eliminación:', success);
        
        if (success) {
          // Recargar la lista de ejercicios
          const updatedExercises = exerciseService.getAllExercises();
          console.log('Lista actualizada:', updatedExercises.length, 'ejercicios');
          setAllExercises(updatedExercises);
          
          // Si el ejercicio eliminado era el valor actual, limpiar el input
          if (value === exerciseName) {
            onChange('');
          }
          
          console.log('Ejercicio eliminado exitosamente');
        }
      } catch (error) {
        console.error('Error en handleDeleteExercise:', error);
        alert(`Error al eliminar el ejercicio: ${error.message}`);
      }
    } else {
      console.log('Usuario canceló la eliminación');
    }
  };

  // Manejar teclas de navegación
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Scroll para mantener la opción destacada visible
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        const containerTop = listRef.current.parentElement.scrollTop;
        const containerBottom = containerTop + listRef.current.parentElement.clientHeight;
        const elementTop = highlightedElement.offsetTop;
        const elementBottom = elementTop + highlightedElement.offsetHeight;

        if (elementTop < containerTop) {
          listRef.current.parentElement.scrollTop = elementTop;
        } else if (elementBottom > containerBottom) {
          listRef.current.parentElement.scrollTop = elementBottom - listRef.current.parentElement.clientHeight;
        }
      }
    }
  }, [highlightedIndex]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={inputRef}>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          setIsFocused(true);
          // Solo abrir si hay opciones disponibles o si ya se escribió texto suficiente
          if (filteredOptions.length > 0 || value.length > 2) {
            setIsOpen(true);
          }
        }}
        onBlur={() => {
          setIsFocused(false);
          // Pequeño retraso para permitir clicks en el dropdown
          setTimeout(() => setIsOpen(false), 200);
        }}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <>
              <ul ref={listRef} className="py-1">
                {filteredOptions.map((option, index) => (
                  <li
                    key={index}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-150 text-xs flex items-center justify-between group ${
                      index === highlightedIndex
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    style={{ fontSize: '12px' }}
                  >
                    <div 
                      onClick={() => handleOptionClick(option)}
                      className="flex-1 flex items-center"
                    >
                      {/* Resaltar texto coincidente */}
                      <span dangerouslySetInnerHTML={{
                        __html: option.replace(
                          new RegExp(`(${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                          '<strong class="font-semibold">$1</strong>'
                        )
                      }} />
                      {/* Indicador de ejercicio personalizado */}
                      {exerciseService.isCustomExercise(option) && (
                        <span className="ml-2 text-[10px] text-blue-600">●</span>
                      )}
                    </div>
                    
                    {/* Botón eliminar - solo para ejercicios personalizados */}
                    {exerciseService.isCustomExercise(option) && (
                      <button
                        onClick={(e) => {
                          console.log('Click en botón eliminar para:', option);
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteExercise(option);
                        }}
                        className={`ml-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-150 ${
                          index === highlightedIndex
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-red-100 text-red-600 hover:bg-red-200 opacity-70 group-hover:opacity-100'
                        }`}
                        title="Eliminar ejercicio"
                        type="button"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Mostrar contador si hay más resultados disponibles */}
              {allExercises.filter(option => 
                option.toLowerCase().includes(value.toLowerCase())
              ).length > maxResults && (
                <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50" style={{ fontSize: '11px' }}>
                  📋 Mostrando {filteredOptions.length} de {
                    allExercises.filter(option => 
                      option.toLowerCase().includes(value.toLowerCase())
                    ).length
                  } ejercicios
                </div>
              )}
            </>
          ) : (
            value.length > 2 && (
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500 mb-2" style={{ fontSize: '11px' }}>
                  No se encontró "{value}"
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  style={{ fontSize: '11px' }}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar "{value}" a la lista
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* Modal para agregar ejercicio nuevo */}
      <AddExerciseToListModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddExercise={handleAddNewExercise}
        currentSearch={value}
      />
    </div>
  );
};

export default AutoCompleteInput;
