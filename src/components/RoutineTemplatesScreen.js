
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import TemplateRoutineDetail from './templates/TemplateRoutineDetail';
import RoutineDetailTemplate from './templates/RoutineDetailTemplate';

// Componente principal para gestionar templates de rutinas

const RoutineTemplatesScreen = ({ clients = [], onAssignRoutine, fetchTemplates, deleteTemplate, onGoBack }) => {
  // Eliminar plantilla de la base de datos y la UI
  const handleDeleteTemplate = async (templateId) => {
    // Mostrar mensaje de confirmación
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta plantilla? Esta acción no se puede deshacer.')) {
      return; // Si el usuario cancela, no hacer nada
    }
    
    setLoading(true);
    const { error } = await supabase
      .from('rutinas_templates')
      .delete()
      .eq('id', templateId);
    setLoading(false);
    if (error) {
      alert('Error al eliminar la plantilla: ' + error.message);
    } else {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  // Estado para edición de plantilla
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  // State for add template modal
  const [showAddTemplateScreen, setShowAddTemplateScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);


  useEffect(() => {
    // Cargar templates al montar
    async function fetchTemplatesFromDB() {
      setInitialLoading(true);
      const { data, error } = await supabase.from('rutinas_templates').select('*');
      if (error) {
        console.error('Error cargando templates:', error);
        setTemplates([]);
      } else {
        console.log('Templates cargados:', data);
        setTemplates(data || []);
      }
      setInitialLoading(false);
    }
    fetchTemplatesFromDB();
  }, []);


  // Handler for creating a new template

  // Guardar plantilla en Supabase
  const handleSaveTemplate = async (templateData) => {
    // Solo validar el nombre como obligatorio
    if (!templateData.name) {
      alert('Por favor, completa el nombre de la plantilla.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('rutinas_templates')
      .insert([
        {
          ...templateData,
        },
      ])
      .select();
    setLoading(false);
    if (error) {
      alert('Error al crear la plantilla: ' + error.message);
    } else {
      console.log('Plantilla creada exitosamente:', data);
      setShowAddTemplateScreen(false);
      
      // Recargar todas las plantillas desde la base de datos para asegurar consistencia
      const { data: allTemplates, error: fetchError } = await supabase
        .from('rutinas_templates')
        .select('*');
      
      if (!fetchError && allTemplates) {
        console.log('Actualizando templates con:', allTemplates);
        setTemplates(allTemplates);
      } else if (fetchError) {
        console.error('Error recargando templates:', fetchError);
      }
    }
  };


  if (showAddTemplateScreen) {
    return (
      <TemplateRoutineDetail
        initialTemplate={{}}
        onSave={handleSaveTemplate}
        onCancel={() => setShowAddTemplateScreen(false)}
      />
    );
  }

  if (editingTemplate) {
    return (
      <RoutineDetailTemplate
        template={editingTemplate}
        onCancel={() => setEditingTemplate(null)}
        onSave={async updated => {
          // Actualiza el estado local inmediatamente para reflejar los cambios
          setEditingTemplate(updated);
          setLoading(true);
          // Actualiza en la base de datos
          const { error } = await supabase
            .from('rutinas_templates')
            .update(updated)
            .eq('id', editingTemplate.id);
          setLoading(false);
          if (error) {
            alert('Error al actualizar la plantilla: ' + error.message);
          } else {
            // Recarga la plantilla actualizada y refresca la lista
            const { data: refreshed, error: fetchError } = await supabase
              .from('rutinas_templates')
              .select('*')
              .eq('id', editingTemplate.id)
              .single();
            // Refresca la lista de templates
            const { data: allTemplates } = await supabase.from('rutinas_templates').select('*');
            setTemplates(allTemplates || []);
            // Vuelve a la pantalla principal de templates
            setEditingTemplate(null);
          }
        }}
      />
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Templates de Rutinas</h2>
        <button
          className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-colors"
          onClick={() => setShowAddTemplateScreen(true)}
          title="Crear nueva plantilla"
          disabled={loading || initialLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Indicador de carga principal */}
      {initialLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Cargando templates...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Indicador de carga para operaciones */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                <p className="text-gray-600">Procesando...</p>
              </div>
            </div>
          )}

          {/* Sección para mostrar todas las rutinas templates creadas */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-green-700">Rutinas creadas como templates</h3>
            {templates.length === 0 ? (
              <p className="text-gray-500">No hay rutinas plantilla creadas aún.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4 bg-gray-50 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-12">
                        <div className="font-semibold text-lg mb-2">{template.name}</div>
                        <div className="text-sm text-gray-600 mb-1">{template.description}</div>
                        <div className="text-xs text-gray-500">{template.startDate} - {template.endDate}</div>
                      </div>
                      <div className="flex gap-1 absolute top-4 right-4">
                        <button
                          className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors disabled:opacity-50"
                          title="Editar plantilla"
                          onClick={() => setEditingTemplate(template)}
                          disabled={loading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                        </button>
                        <button
                          className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition-colors disabled:opacity-50"
                          title="Eliminar plantilla"
                          onClick={() => handleDeleteTemplate(template.id)}
                          disabled={loading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default RoutineTemplatesScreen;
