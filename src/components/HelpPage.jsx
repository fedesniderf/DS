import React, { useState } from 'react';
import VisualExample from './VisualExample';

const HelpPage = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', title: 'Información General', icon: '📋' },
    { id: 'routines', title: 'Manejo de Rutinas', icon: '💪' },
    { id: 'timer', title: 'Cronómetro', icon: '⏱️' },
    { id: 'tracking', title: 'Seguimiento Semanal', icon: '📊' },
    { id: 'settings', title: 'Configuración', icon: '⚙️' },
    { id: 'tips', title: 'Consejos y Trucos', icon: '💡' }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">🏋️ Bienvenido a DS Entrenamiento</h3>
              <p className="text-gray-700 mb-4">
                DS Entrenamiento es una aplicación completa para el manejo de rutinas de ejercicio y seguimiento de progreso. 
                Diseñada tanto para entrenadores como para clientes, ofrece herramientas avanzadas para optimizar tu entrenamiento.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Características Principales:</h4>
              <ul className="space-y-2 text-blue-700">
                <li>• <strong>Gestión de Rutinas:</strong> Crea, edita y asigna rutinas personalizadas</li>
                <li>• <strong>Cronómetro Inteligente:</strong> Mide tiempos de series, descansos y ejercicios completos</li>
                <li>• <strong>Seguimiento de Progreso:</strong> Registra pesos, tiempos y notas semanales</li>
                <li>• <strong>Sistema de Dropsets:</strong> Soporte completo para entrenamientos avanzados</li>
                <li>• <strong>Interfaz Móvil:</strong> Optimizada para uso en dispositivos móviles</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">👥 Tipos de Usuario:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-800">🏃 Cliente</h5>
                  <p className="text-green-700 text-sm">
                    Acceso a rutinas asignadas, cronómetro, seguimiento de progreso y visualización de datos.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-semibold text-purple-800">👨‍🏫 Entrenador</h5>
                  <p className="text-purple-700 text-sm">
                    Gestión completa de clientes, creación de rutinas, seguimiento de progreso y panel administrativo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'routines':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">💪 Manejo de Rutinas</h3>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">📝 Visualización de Rutinas</h4>
              <p className="text-yellow-700 mb-2">
                Las rutinas se organizan por días (Día 1, Día 2, etc.) y cada ejercicio muestra:
              </p>
              <ul className="space-y-1 text-yellow-700 text-sm">
                <li>• <strong>Nombre del ejercicio</strong></li>
                <li>• <strong>Series:</strong> Número de series a realizar</li>
                <li>• <strong>Repeticiones:</strong> Repeticiones por serie</li>
                <li>• <strong>Peso:</strong> Peso recomendado en kg</li>
                <li>• <strong>Tiempo:</strong> Duración del ejercicio en segundos</li>
                <li>• <strong>Descanso:</strong> Tiempo de descanso entre series</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🎯 Botones de Acción</h4>
              
              {/* Ejemplo visual de tarjeta de ejercicio */}
              <div className="mb-4">
                <VisualExample 
                  type="exercise-card"
                  title="Tarjeta de Ejercicio"
                  description="Cada ejercicio muestra esta información y los botones de acción en la esquina superior derecha."
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">+</span>
                  </div>
                  <div>
                    <strong>Agregar Seguimiento Semanal:</strong>
                    <p className="text-sm text-green-700">Registra tus pesos y progreso semanal para cada ejercicio.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-800 rounded-lg flex flex-col items-center justify-center">
                    <span className="text-white text-xs">⏱️</span>
                  </div>
                  <div>
                    <strong>Cronómetro:</strong>
                    <p className="text-sm text-green-700">Abre el cronómetro inteligente para medir tiempos durante el ejercicio.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📊 Tabla de Seguimiento</h4>
              <p className="text-blue-700 mb-3">
                Cada ejercicio muestra una tabla con tu progreso semanal:
              </p>
              
              {/* Ejemplo visual de la tabla */}
              <div className="mb-3">
                <VisualExample 
                  type="tracking-table"
                  title="Ejemplo de Tabla de Seguimiento"
                  description="Haz clic en cualquier fila para editar los datos de esa semana."
                />
              </div>
              
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>• <strong>Semana:</strong> Número de semana del entrenamiento</li>
                <li>• <strong>Peso:</strong> Peso utilizado (puede mostrar rangos para múltiples series)</li>
                <li>• <strong>Tiempo:</strong> Tiempo total del ejercicio (si se usó cronómetro)</li>
                <li>• <strong>Notas:</strong> Observaciones personales</li>
              </ul>
              <p className="text-blue-600 text-sm mt-2">
                💡 <strong>Tip:</strong> Haz clic en cualquier fila de la tabla para editar esos datos.
              </p>
            </div>
          </div>
        );

      case 'timer':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">⏱️ Cronómetro Inteligente</h3>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🚀 Funciones Principales</h4>
              <ul className="space-y-2 text-purple-700">
                <li>• <strong>Modo Maximizado:</strong> Vista completa con todos los controles</li>
                <li>• <strong>Modo Minimizado:</strong> Vista compacta y arrastrable</li>
                <li>• <strong>Cronómetro por Series:</strong> Mide tiempo de cada serie individualmente</li>
                <li>• <strong>Cronómetro de Descanso:</strong> Controla los tiempos de recuperación</li>
                <li>• <strong>Tiempo Total:</strong> Registro automático del ejercicio completo</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">🎮 Controles del Cronómetro</h4>
              
              {/* Ejemplos visuales del cronómetro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <VisualExample 
                  type="timer"
                  title="Cronómetro Normal"
                  description="Cronómetro durante una serie regular con controles de pausa y finalización."
                />
                <VisualExample 
                  type="dropset-timer"
                  title="Cronómetro Dropset"
                  description="El cronómetro se adapta automáticamente para ejercicios con dropsets."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-semibold text-red-700 mb-2">Durante la Serie:</h5>
                  <ul className="space-y-1 text-red-600 text-sm">
                    <li>• <strong>⏸️ Pausar:</strong> Pausa el cronómetro actual</li>
                    <li>• <strong>⏹️ Terminar Serie:</strong> Finaliza la serie y guarda el tiempo</li>
                    <li>• <strong>🔄 Reiniciar:</strong> Reinicia el cronómetro de la serie</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-semibold text-red-700 mb-2">Durante el Descanso:</h5>
                  <ul className="space-y-1 text-red-600 text-sm">
                    <li>• <strong>⏸️ Pausar:</strong> Pausa el descanso</li>
                    <li>• <strong>⏭️ Saltar:</strong> Termina el descanso anticipadamente</li>
                    <li>• <strong>➡️ Siguiente:</strong> Avanza a la siguiente serie</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">📱 Modo Minimizado</h4>
              <p className="text-green-700 mb-2">
                Cuando minimizas el cronómetro, puedes:
              </p>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• <strong>Arrastrar:</strong> Mueve la ventana a cualquier posición</li>
                <li>• <strong>Ver Tiempo:</strong> Mantiene visible el tiempo actual</li>
                <li>• <strong>Controles Básicos:</strong> Pausar y terminar serie</li>
                <li>• <strong>Restaurar:</strong> Doble clic para volver al modo completo</li>
              </ul>
              <div className="mt-3 p-2 bg-green-100 rounded">
                <p className="text-green-600 text-xs">
                  💡 <strong>Protección contra recarga:</strong> Si intentas recargar la página mientras el cronómetro está activo, 
                  la aplicación te preguntará si realmente quieres salir para evitar perder el progreso.
                </p>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">🎯 Dropsets</h4>
              <p className="text-orange-700 mb-2">
                Para ejercicios con dropsets, el cronómetro automáticamente:
              </p>
              <ul className="space-y-1 text-orange-700 text-sm">
                <li>• Detecta que es un ejercicio de dropset</li>
                <li>• Cambia la terminología de "Series" a "Dropsets"</li>
                <li>• Adapta los controles para este tipo de entrenamiento</li>
                <li>• Registra cada dropset como una serie independiente</li>
              </ul>
            </div>
          </div>
        );

      case 'tracking':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">📊 Seguimiento Semanal</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Cómo Registrar Datos</h4>
              
              {/* Ejemplo visual del modal de seguimiento */}
              <div className="mb-4">
                <VisualExample 
                  type="modal-form"
                  title="Modal de Seguimiento Semanal"
                  description="Formulario que aparece al hacer clic en el botón '+' para registrar tu progreso."
                />
              </div>
              
              <ol className="space-y-2 text-blue-700">
                <li><strong>1.</strong> Haz clic en el botón negro "+" junto al ejercicio</li>
                <li><strong>2.</strong> Selecciona la semana correspondiente</li>
                <li><strong>3.</strong> Ingresa el peso utilizado para cada serie</li>
                <li><strong>4.</strong> Los tiempos se completan automáticamente si usaste el cronómetro</li>
                <li><strong>5.</strong> Agrega notas opcionales (máximo 100 caracteres)</li>
                <li><strong>6.</strong> Guarda los datos</li>
              </ol>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">⚡ Integración con Cronómetro</h4>
              <p className="text-green-700 mb-2">
                Cuando usas el cronómetro y luego guardas el seguimiento:
              </p>
              <ul className="space-y-1 text-green-700 text-sm">
                <li>• Los tiempos de cada serie se registran automáticamente</li>
                <li>• El tiempo total del ejercicio se calcula</li>
                <li>• Solo necesitas ingresar los pesos utilizados</li>
                <li>• Aparece un indicador verde mostrando "Datos del cronómetro"</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">✏️ Editar Datos Existentes</h4>
              <p className="text-yellow-700 mb-2">
                Para modificar datos ya guardados:
              </p>
              <ul className="space-y-1 text-yellow-700 text-sm">
                <li>• Haz clic en cualquier fila de la tabla de seguimiento</li>
                <li>• Se abrirá el modal con los datos existentes</li>
                <li>• Modifica los pesos o notas según necesites</li>
                <li>• Los tiempos registrados previamente se mantienen</li>
                <li>• Guarda los cambios</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">📈 Interpretación de Datos</h4>
              <div className="space-y-2 text-purple-700 text-sm">
                <p><strong>Peso mostrado en la tabla:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Peso único:</strong> "80 kg" (mismo peso en todas las series)</li>
                  <li>• <strong>Peso variable:</strong> "75-85 kg" (rango de pesos utilizados)</li>
                  <li>• <strong>Sin peso:</strong> "-" (no se registró peso)</li>
                </ul>
                <p className="mt-2"><strong>Tiempo total:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• Aparece en <span className="text-green-600 font-semibold">verde</span> cuando viene del cronómetro</li>
                  <li>• Muestra el tiempo total invertido en el ejercicio completo</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">⚙️ Panel de Configuración</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">🎛️ Acceso al Panel</h4>
              
              {/* Ejemplo visual del menú de configuración */}
              <div className="mb-4">
                <VisualExample 
                  type="settings-menu"
                  title="Menú de Configuración"
                  description="Panel desplegable que aparece al hacer clic en el ícono de usuario."
                />
              </div>
              
              <p className="text-gray-700 mb-2">
                Para acceder al panel de configuración:
              </p>
              <ol className="space-y-1 text-gray-700 text-sm">
                <li>1. Haz clic en el ícono de usuario en la esquina superior derecha</li>
                <li>2. Selecciona "Configuración" del menú desplegable</li>
                <li>3. Se abrirá el panel con todas las opciones disponibles</li>
              </ol>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">👤 Gestión de Perfil</h4>
              <ul className="space-y-2 text-blue-700">
                <li>• <strong>Cambiar Contraseña:</strong> Actualiza tu contraseña de acceso</li>
                <li>• <strong>Información Personal:</strong> Visualiza tu email y tipo de usuario</li>
                <li>• <strong>Estadísticas:</strong> Ve tu progreso y actividad reciente</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">🎓 Sistema de Ayuda</h4>
              <ul className="space-y-2 text-green-700">
                <li>• <strong>Iniciar Guía:</strong> Tutorial interactivo para nuevos usuarios</li>
                <li>• <strong>Reiniciar Guía:</strong> Vuelve a mostrar todas las instrucciones</li>
                <li>• <strong>Ayuda:</strong> Accede a esta página de documentación completa</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">🔐 Seguridad</h4>
              <ul className="space-y-2 text-red-700">
                <li>• <strong>Cierre de Sesión:</strong> Sal de forma segura de la aplicación</li>
                <li>• <strong>Logout Automático:</strong> La sesión se cierra tras 2 horas de inactividad</li>
                <li>• <strong>Advertencia de Inactividad:</strong> Recibirás un aviso 5 minutos antes del cierre automático</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">📱 Configuraciones de Aplicación</h4>
              <ul className="space-y-2 text-purple-700">
                <li>• <strong>Modo Móvil:</strong> La interfaz se adapta automáticamente a tu dispositivo</li>
                <li>• <strong>Persistencia de Datos:</strong> Tu progreso se guarda automáticamente</li>
                <li>• <strong>Navegación:</strong> Usa las pestañas superiores para moverte entre secciones</li>
              </ul>
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-blue-600 mb-4">💡 Consejos y Trucos</h3>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">🚀 Optimización del Entrenamiento</h4>
              <ul className="space-y-2 text-yellow-700">
                <li>• <strong>Usa siempre el cronómetro:</strong> Te ayuda a mantener consistencia en los tiempos</li>
                <li>• <strong>Registra cada sesión:</strong> El seguimiento semanal es clave para ver tu progreso</li>
                <li>• <strong>Aprovecha el modo minimizado:</strong> Puedes ver otras partes de la app mientras cronometras</li>
                <li>• <strong>Revisa tu historial:</strong> Los datos pasados te ayudan a planificar futuros entrenamientos</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">📱 Consejos para Móvil</h4>
              <ul className="space-y-2 text-green-700">
                <li>• <strong>Mantén la pantalla activa:</strong> La app implementa wake lock para evitar que se apague</li>
                <li>• <strong>Usa gestos táctiles:</strong> Puedes arrastrar el cronómetro minimizado con el dedo</li>
                <li>• <strong>Aprovecha la responsividad:</strong> Los botones se agrandan automáticamente en móvil</li>
                <li>• <strong>Guarda frecuentemente:</strong> Registra tu progreso después de cada ejercicio</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">⚡ Atajos y Funciones Avanzadas</h4>
              <ul className="space-y-2 text-blue-700">
                <li>• <strong>Doble clic en cronómetro minimizado:</strong> Vuelve al modo completo</li>
                <li>• <strong>Edición rápida:</strong> Clic directo en las filas de la tabla para editar</li>
                <li>• <strong>Navegación por teclado:</strong> Usa Tab para moverte entre campos</li>
                <li>• <strong>Autocompletado:</strong> Los datos del cronómetro se llenan automáticamente</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Problemas Comunes y Soluciones</h4>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-red-700">El cronómetro no guarda los datos:</p>
                  <p className="text-red-600 text-sm">• Asegúrate de hacer clic en "Guardar tiempo" antes de cerrar</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">No puedo editar mis datos:</p>
                  <p className="text-red-600 text-sm">• Haz clic directamente en la fila de la tabla, no en los espacios vacíos</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">La sesión se cierra inesperadamente:</p>
                  <p className="text-red-600 text-sm">• La app cierra sesiones tras 2 horas de inactividad por seguridad</p>
                </div>
                <div>
                  <p className="font-semibold text-red-700">El cronómetro no se minimiza:</p>
                  <p className="text-red-600 text-sm">• Busca el botón de minimizar (icono de guión) en la esquina superior</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">🏆 Mejores Prácticas</h4>
              <ul className="space-y-2 text-purple-700">
                <li>• <strong>Consistencia:</strong> Registra tus entrenamientos en la misma semana</li>
                <li>• <strong>Precisión:</strong> Anota pesos y tiempos exactos para un mejor seguimiento</li>
                <li>• <strong>Notas detalladas:</strong> Usa el campo de notas para registrar sensaciones o modificaciones</li>
                <li>• <strong>Progresión gradual:</strong> Revisa tus datos anteriores antes de aumentar cargas</li>
                <li>• <strong>Backup:</strong> Tu información se guarda automáticamente en la nube</li>
              </ul>
            </div>
          </div>
        );

      default:
        return <div>Selecciona una sección del menú</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">📚 Centro de Ayuda - DS Entrenamiento</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Cerrar ayuda"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="p-4">
              <h3 className="font-semibold text-gray-700 mb-4">Navegación</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{section.icon}</span>
                    <span className="font-medium">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 ¿Necesitas más ayuda? Contacta a tu entrenador o administrador del sistema.
            </div>
            <div className="text-xs text-gray-500">
              DS Entrenamiento v2.0 - Centro de Ayuda
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
