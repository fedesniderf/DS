import React from 'react';
const PFPETable = ({ data = [], day, onEditPFPE, onDeletePFPE }) => {
  const [editIdx, setEditIdx] = React.useState(null);
  const [editValues, setEditValues] = React.useState({ week: '', day: '', pf: '', pe: '', notes: '' });
  const [showNotes, setShowNotes] = React.useState({ open: false, notes: '' });
  // Eliminar el estado local de rows, usar directamente data

  const startEdit = (row, idx) => {
    const pfpe = row.PFPE ? row.PFPE : row;
    setEditIdx(idx);
    setEditValues({
      week: pfpe.week || '',
      day: pfpe.day || '',
      pf: pfpe.pf !== undefined ? pfpe.pf : '',
      pe: pfpe.pe !== undefined ? pfpe.pe : '',
      notes: pfpe.notes || ''
    });
  };

  const saveEdit = (idx) => {
    const newPFPE = {
      week: editValues.week,
      day: editValues.day,
      pf: editValues.pf,
      pe: editValues.pe,
      notes: editValues.notes
    };
    if (typeof onEditPFPE === 'function') {
      console.log('Edit PFPE called:', { day, idx, newPFPE });
      onEditPFPE(day, idx, newPFPE);
    }
    setEditIdx(null);
  };

  const cancelEdit = () => {
    setEditIdx(null);
  };

  const handleDelete = (row, idx) => {
    if (window.confirm('¿Seguro que quieres eliminar este registro PF/PE?')) {
      if (typeof onDeletePFPE === 'function') {
        console.log('Delete PFPE called:', { day, idx });
        onDeletePFPE(day, idx);
      }
    }
  };
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full text-xs border rounded-lg overflow-hidden">
        <thead className="bg-purple-100">
          <tr>
            <th className="px-2 py-1 text-left">Semana</th>
            <th className="px-2 py-1 text-left">PF</th>
            <th className="px-2 py-1 text-left">PE</th>
            <th className="px-2 py-1 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => {
              const pfpe = row.PFPE ? row.PFPE : row;
              if (editIdx === idx) {
                return (
                  <tr key={idx} className="border-b bg-yellow-50">
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        id={`pfpe-week-${idx}`}
                        name={`pfpe-week-${idx}`}
                        className="w-16 px-1 py-0.5 border rounded"
                        value={editValues.week}
                        onChange={e => setEditValues(v => ({ ...v, week: e.target.value }))}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        id={`pfpe-day-${idx}`}
                        name={`pfpe-day-${idx}`}
                        className="w-16 px-1 py-0.5 border rounded"
                        value={editValues.day}
                        onChange={e => setEditValues(v => ({ ...v, day: e.target.value }))}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        id={`pfpe-pf-${idx}`}
                        name={`pfpe-pf-${idx}`}
                        className="w-12 px-1 py-0.5 border rounded"
                        value={editValues.pf}
                        onChange={e => setEditValues(v => ({ ...v, pf: e.target.value }))}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        id={`pfpe-pe-${idx}`}
                        name={`pfpe-pe-${idx}`}
                        className="w-12 px-1 py-0.5 border rounded"
                        value={editValues.pe}
                        onChange={e => setEditValues(v => ({ ...v, pe: e.target.value }))}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="text"
                        id={`pfpe-notes-${idx}`}
                        name={`pfpe-notes-${idx}`}
                        className="w-24 px-1 py-0.5 border rounded"
                        value={editValues.notes}
                        onChange={e => setEditValues(v => ({ ...v, notes: e.target.value }))}
                      />
                    </td>
                    <td className="px-2 py-1 flex gap-2 justify-center">
                      <button className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-700" title="Guardar" onClick={() => saveEdit(idx)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700" title="Cancelar" onClick={cancelEdit}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={idx} className="border-b">
                  <td className="px-2 py-1">{pfpe.week ? pfpe.week : '-'}</td>
                  <td className="px-2 py-1">{pfpe.pf !== undefined ? pfpe.pf : '-'}</td>
                  <td className="px-2 py-1">{pfpe.pe !== undefined ? pfpe.pe : '-'}</td>
                  <td className="px-2 py-1 flex gap-2 justify-center">
                    <button
                      className="p-1 rounded bg-purple-100 hover:bg-purple-200 text-purple-700"
                      title="Ver notas"
                      onClick={() => setShowNotes({ open: true, notes: pfpe.notes || 'Sin notas' })}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7Z" />
                      </svg>
                    </button>
                    <button
                      className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700"
                      title="Editar"
                      onClick={() => startEdit(row, idx)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </button>
                    <button
                      className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-700"
                      title="Eliminar"
                      onClick={() => handleDelete(row, idx)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No hay datos de PF/PE</td>
            </tr>
          )}
        </tbody>
      </table>
    {/* Modal para ver notas */}
    {showNotes.open && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-xs">
          <h3 className="text-base font-bold mb-2">Notas</h3>
          <div className="mb-4 text-sm text-gray-700 whitespace-pre-line">{showNotes.notes}</div>
          <button
            onClick={() => setShowNotes({ open: false, notes: '' })}
            className="w-full bg-blue-600 text-white py-1 px-2 rounded-md hover:bg-blue-700 transition-colors text-xs"
          >Cerrar</button>
        </div>
      </div>
    )}
  </div>
  );
};

export default PFPETable;
