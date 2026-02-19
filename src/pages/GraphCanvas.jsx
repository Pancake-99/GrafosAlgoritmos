import { useState, useRef, useEffect } from 'react';
import GlitterBackground from '../components/GlitterBackground';
import Toolbar from '../components/Toolbar';
import EditModal from '../components/EditModal';

function GraphCanvas() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tool, setTool] = useState('add');
  
  const [selectedNode, setSelectedNode] = useState(null); 
  const [draggingNode, setDraggingNode] = useState(null);
  
  // Estado del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState('node'); // 'node' o 'edge'

  const canvasRef = useRef(null);

  // --- Manejadores de Interacción ---

  const handleCanvasClick = (e) => {
    if (e.target !== canvasRef.current && e.target.tagName !== 'svg') return;

    // Solo bola a los clicks en el fondo para agregar nodos
    if (tool === 'add') {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newId = nodes.length > 0 ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
        setNodes([...nodes, { 
            id: newId, 
            x, 
            y, 
            label: newId.toString(),
            color: '#06b6d4' // Cian por defecto
        }]);
    }
    
    // Deseleccionar
    setSelectedNode(null);
  };

  const handleNodeClick = (e, node) => {
    e.stopPropagation();

    if (tool === 'delete') {
        setNodes(nodes.filter(n => n.id !== node.id));
        setEdges(edges.filter(edge => edge.source !== node.id && edge.target !== node.id));
        return;
    }

    if (tool === 'connect') {
        if (!selectedNode) {
            setSelectedNode(node);
        } else {
            // Checar si la conexión ya existe (en esta dirección)
            const exists = edges.some(edge => edge.source === selectedNode.id && edge.target === node.id);
            
            if (!exists) {
                setEdges([...edges, { 
                    source: selectedNode.id, 
                    target: node.id, 
                    weight: '', 
                    isDirected: true, 
                    color: '#a855f7' // Morado por defecto
                }]);
            }
            setSelectedNode(null); 
        }
        return;
    }

    if (tool === 'edit') {
        setModalData(node);
        setModalType('node');
        setIsModalOpen(true);
    }
  };

  const handleEdgeClick = (e, edge) => {
      e.stopPropagation();
      
      if (tool === 'delete') {
          // Borrar esta flecha en específico (bye)
          setEdges(edges.filter(e => e !== edge));
          return;
      }

      if (tool === 'edit') {
          // Buscar si hay borde inverso para editar ambos
          const reverseEdge = edges.find(e => e.source === edge.target && e.target === edge.source);
          
          const sourceNode = nodes.find(n => n.id === edge.source);
          const targetNode = nodes.find(n => n.id === edge.target);

          setModalData({
              sourceId: edge.source,
              targetId: edge.target,
              sourceLabel: sourceNode?.label,
              targetLabel: targetNode?.label,
              edgeForward: edge,
              edgeBackward: reverseEdge
          });
          setModalType('edge');
          setIsModalOpen(true);
      }
  };

  const handleNodeMouseDown = (e, node) => {
      if (tool === 'move') {
          e.stopPropagation();
          setDraggingNode(node.id);
          setSelectedNode(node); 
      }
  };
  
  const handleMouseMove = (e) => {
      if (draggingNode && tool === 'move') {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          setNodes(nodes.map(n => 
              n.id === draggingNode ? { ...n, x, y } : n
          ));
      }
  };
  
  const handleMouseUp = () => {
      setDraggingNode(null);
  };

  const handleSaveModal = (updatedData) => {
      if (modalType === 'node') {
          setNodes(nodes.map(n => n.id === updatedData.id ? updatedData : n));
      } else {
          // updatedData tiene { sourceId, targetId, color, forward: {active, weight}, backward: {active, weight} }
          
          let newEdges = edges.filter(e => 
            !((e.source === updatedData.sourceId && e.target === updatedData.targetId) || 
              (e.source === updatedData.targetId && e.target === updatedData.sourceId))
          );
          
          if (updatedData.forward.active) {
              newEdges.push({
                  source: updatedData.sourceId,
                  target: updatedData.targetId,
                  weight: updatedData.forward.weight,
                  color: updatedData.color,
                  isDirected: true
              });
          }

          if (updatedData.backward.active) {
               newEdges.push({
                  source: updatedData.targetId,
                  target: updatedData.sourceId,
                  weight: updatedData.backward.weight,
                  color: updatedData.color,
                  isDirected: true
              });
          }
          
          setEdges(newEdges);
      }
  };

  // --- Ayudantes de Renderizado ---

  // Calcular posición con offset para bordes bidireccionales
  const getRenderCoords = (source, target, isBidirectional) => {
      // Cantidad de offset (pixeles)
      const offset = 6; 

      if (!isBidirectional) return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };

      // Calcular vector normal unitario
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len === 0) return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };

      // Vector perpendicular (-dy, dx) normalizado * offset
      const ox = (-dy / len) * offset;
      const oy = (dx / len) * offset;

      return {
          x1: source.x + ox,
          y1: source.y + oy,
          x2: target.x + ox,
          y2: target.y + oy
      };
  };

  const renderEdges = () => {
      return edges.map((edge, index) => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return null;

          // Manejo de auto-bucle (Cíclico)
          if (edge.source === edge.target) {
              const loopPath = `
                M ${source.x},${source.y} 
                C ${source.x - 40},${source.y - 70} 
                  ${source.x + 40},${source.y - 70} 
                  ${source.x},${source.y}
              `;

              return (
                <g key={`${edge.source}-${edge.target}-${index}`} onClick={(e) => handleEdgeClick(e, edge)} className="cursor-pointer group">
                    {/* Gatillo invisible */}
                    <path d={loopPath} stroke="transparent" strokeWidth="15" fill="none" />
                    {/* Bucle visible */}
                    <path 
                        d={loopPath} 
                        stroke={edge.color || '#a855f7'} // Morado por si acaso
                        strokeWidth="2" 
                        fill="none"
                        className="transition-all hover:stroke-[3px] hover:brightness-125"
                        markerEnd={`url(#arrowhead-${index})`}
                    />
                    
                    <defs>
                        <marker id={`arrowhead-${index}`} markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill={edge.color || '#a855f7'} />
                        </marker>
                    </defs>
                </g>
              );
          }

          // Checar si es bidireccional (existe borde inverso)
          const isBidirectional = edges.some(e => e.source === edge.target && e.target === edge.source);
          
          const coords = getRenderCoords(source, target, isBidirectional);

          return (
            <g key={`${edge.source}-${edge.target}-${index}`} onClick={(e) => handleEdgeClick(e, edge)} className="cursor-pointer group">
              {/* Área de gatillo invisible */}
              <line 
                x1={coords.x1} y1={coords.y1}
                x2={coords.x2} y2={coords.y2}
                stroke="transparent"
                strokeWidth="15"
              />
              {/* Línea visible */}
              <line 
                x1={coords.x1} y1={coords.y1}
                x2={coords.x2} y2={coords.y2}
                stroke={edge.color || '#a855f7'} 
                strokeWidth="2"
                className="transition-all hover:stroke-[3px] hover:brightness-125"
                markerEnd={`url(#arrowhead-${index})`}
              />
              
              <defs>
                <marker id={`arrowhead-${index}`} markerWidth="10" markerHeight="7" refX="15" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={edge.color || '#a855f7'} />
                </marker>
             </defs>
            </g>
          );
      });
  };

  const renderEdgeLabels = () => {
    return edges.map((edge, index) => {
        if (!edge.weight) return null;
        
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return null;

        let x, y;

        if (edge.source === edge.target) {
            x = source.x;
            y = source.y - 50;
        } else {
            const isBidirectional = edges.some(e => e.source === edge.target && e.target === edge.source);
            const coords = getRenderCoords(source, target, isBidirectional);
            x = (coords.x1 + coords.x2) / 2;
            y = (coords.y1 + coords.y2) / 2 - 5;
        }

        return (
            <text 
                key={`label-${edge.source}-${edge.target}-${index}`}
                x={x} 
                y={y} 
                fill="white"
                textAnchor="middle" 
                className="font-bold text-xs pointer-events-none select-none drop-shadow-md shadow-black"
                style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
            >
                {edge.weight}
            </text>
        );
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <GlitterBackground />
      <Toolbar currentTool={tool} setTool={setTool} />
      <EditModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveModal}
        data={modalData}
        type={modalType}
      />

      {/* Área donde ocurre la magia */}
      <div 
        ref={canvasRef}
        className={`w-full h-full relative ${tool === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Capa 1: Bordes (Z-0) */}
        <svg className="absolute inset-0 w-full h-full z-0">
            {renderEdges()}
        </svg>

        {/* Capa 2: Nodos (Z-10) */}
        {nodes.map(node => (
          <div 
            key={node.id}
            onMouseDown={(e) => handleNodeMouseDown(e, node)}
            onClick={(e) => handleNodeClick(e, node)}
            className={`
              absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center 
              text-xs font-bold transition-transform hover:scale-110 z-10 select-none
              ${selectedNode && selectedNode.id === node.id ? 'ring-4 ring-white' : ''}
              ${tool === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
              ${tool === 'delete' ? 'hover:ring-4 hover:ring-red-500' : ''}
            `}
            style={{
              left: node.x,
              top: node.y,
              backgroundColor: '#18181b', 
              border: `2px solid ${node.color || '#06b6d4'}`, 
              color: 'white', // TEXTO BLANCO A LA FUERZA
              boxShadow: `0 0 15px ${node.color}50`
            }}
          >
            {node.label || node.id}
          </div>
        ))}

        {/* Capa 3: Etiquetas (Z-20) - Hasta arriba */}
        <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
            {renderEdgeLabels()}
        </svg>

        {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <p className="text-zinc-500 text-lg color-white text-center">Selecciona "Agregar Nodo" y haz clic para comenzar</p>
            </div>
        )}
      </div>

      <div className="absolute bottom-4 right-4 text-xs text-zinc-500 pointer-events-none select-none z-30">
        Nodos: {nodes.length} | Aristas: {edges.length}
      </div>
    </div>
  );
}

export default GraphCanvas;
