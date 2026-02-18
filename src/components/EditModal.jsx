import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const COLORS = [
  { label: 'Cian', value: '#06b6d4', tw: 'bg-cyan-500' },
  { label: 'Zinc', value: '#71717a', tw: 'bg-zinc-500' },
  { label: 'Rojo', value: '#ef4444', tw: 'bg-red-500' },
  { label: 'Verde', value: '#22c55e', tw: 'bg-green-500' },
  { label: 'Azul', value: '#3b82f6', tw: 'bg-blue-500' },
  { label: 'Morado', value: '#a855f7', tw: 'bg-purple-500' },
  { label: 'Naranja', value: '#f97316', tw: 'bg-orange-500' },
  { label: 'Amarillo', value: '#eab308', tw: 'bg-yellow-500' },
  { label: 'Rosa', value: '#ec4899', tw: 'bg-pink-500' },
  { label: 'Lima', value: '#84cc16', tw: 'bg-lime-500' },
  { label: 'Indigo', value: '#6366f1', tw: 'bg-indigo-500' },
];

function EditModal({ isOpen, onClose, onSave, data, type }) {
  // Cosas comunes
  const [color, setColor] = useState(COLORS[0].value);
  
  // Nodo
  const [label, setLabel] = useState('');
  
  // Lógica de pares: Puede haber conexión de A->B y de B->A
  // la data del borde debe tener { sourceId, targetId, edgeForward, edgeBackward }
  const [forwardActive, setForwardActive] = useState(false);
  const [forwardWeight, setForwardWeight] = useState('');
  
  const [backwardActive, setBackwardActive] = useState(false);
  const [backwardWeight, setBackwardWeight] = useState('');

  useEffect(() => {
    if (data) {
      if (type === 'node') {
        setLabel(data.label || data.id.toString());
        setColor(data.color || COLORS[0].value);
      } else if (type === 'edge') {
        // Se espera que la data sea un "Par de Conexión" armado en GraphCanvas
        setForwardActive(!!data.edgeForward);
        setForwardWeight(data.edgeForward?.weight || '');
        
        setBackwardActive(!!data.edgeBackward);
        setBackwardWeight(data.edgeBackward?.weight || '');
        
        // Usar color del primer borde que exista o el default
        setColor(data.edgeForward?.color || data.edgeBackward?.color || COLORS[0].value);
      }
    }
  }, [data, type]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (type === 'node') {
      onSave({ 
        ...data, 
        label, 
        color 
      });
    } else {
      // Devolver la info actualizada de la conexión
      onSave({
        sourceId: data.sourceId,
        targetId: data.targetId,
        color,
        forward: { active: forwardActive, weight: forwardWeight },
        backward: { active: backwardActive, weight: backwardWeight }
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-96 shadow-2xl space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h3 className="text-lg font-bold text-white">
            Editar {type === 'node' ? 'Nodo' : 'Conexión'}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Input para el nombre del nodo */}
          {type === 'node' && (
            <div className="space-y-2">
              <label className="text-sm text-zinc-400 font-medium">Etiqueta / ID</label>
              <input 
                type="text" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Selector de color */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400 font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-6 h-6 rounded-md ${c.tw} transition-all hover:scale-110 ${color === c.value ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Controles de dirección de la conexión */}
          {type === 'edge' && (
            <div className="space-y-4 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
               {/* Dirección de ida */}
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="forward"
                      checked={forwardActive}
                      onChange={(e) => setForwardActive(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-900"
                    />
                    <label htmlFor="forward" className="text-sm text-zinc-200 select-none flex items-center gap-2">
                        {data.sourceLabel || 'A'} &rarr; {data.targetLabel || 'B'}
                        {data.sourceId === data.targetId && <span className="text-xs text-zinc-500">(Bucle)</span>}
                    </label>
                 </div>
                 {forwardActive && (
                    <input 
                      type="number" 
                      value={forwardWeight}
                      onChange={(e) => setForwardWeight(e.target.value)}
                      placeholder="Peso"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                 )}
               </div>

               {/* Solo mostrar vuelta si no es un bucle propio */}
               {data.sourceId !== data.targetId && (
                 <>
                   <div className="h-px bg-zinc-700/50 w-full" />

                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="backward"
                          checked={backwardActive}
                          onChange={(e) => setBackwardActive(e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-zinc-900"
                        />
                        <label htmlFor="backward" className="text-sm text-zinc-200 select-none flex items-center gap-2">
                            {data.targetLabel || 'B'} &rarr; {data.sourceLabel || 'A'}
                        </label>
                     </div>
                     {backwardActive && (
                        <input 
                          type="number" 
                          value={backwardWeight}
                          onChange={(e) => setBackwardWeight(e.target.value)}
                          placeholder="Peso"
                          className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                     )}
                   </div>
                 </>
               )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-lg shadow-cyan-900/20"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditModal;
