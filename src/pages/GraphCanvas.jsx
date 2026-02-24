import { useState, useRef } from 'react';
import { Grid3X3 } from 'lucide-react';
import GlitterBackground from '../components/GlitterBackground';
import Toolbar from '../components/Toolbar';
import EditModal from '../components/EditModal';
import AdjacencyMatrix from '../components/AdjacencyMatrix';
import CanvasTour from '../components/CanvasTour';
import useGraph from '../hooks/useGraph';

function GraphCanvas() {
  const {
    graph,
    nodesArray: nodes,
    edgesArray: edges,
    addNode,
    removeNode,
    updateNode,
    moveNode,
    addEdge,
    removeEdge,
    updateEdge,
    mutateGraph
  } = useGraph();

  const [tool, setTool] = useState('add');
  
  const [selectedNode, setSelectedNode] = useState(null); 
  const [draggingNode, setDraggingNode] = useState(null);
  
  // Estado del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState('node'); // 'node' o 'edge'
  const [showMatrix, setShowMatrix] = useState(false);
  const [showTour, setShowTour] = useState(() => !CanvasTour.isDone());

  const canvasRef = useRef(null);

  // --- Manejadores de Interacción ---

  const handleCanvasClick = (e) => {
    if (e.target !== canvasRef.current && e.target.tagName !== 'svg') return;

    // Solo bola a los clicks en el fondo para agregar nodos
    if (tool === 'add') {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newId = graph.getNextId();
        addNode(newId, { 
            x, 
            y, 
            label: newId.toString(),
            color: '#06b6d4' // Cian por defecto
        });
    }
    
    // Deseleccionar
    setSelectedNode(null);
  };

  const handleNodeClick = (e, node) => {
    e.stopPropagation();

    if (tool === 'delete') {
        removeNode(node.id);
        return;
    }

    if (tool === 'connect') {
        if (!selectedNode) {
            setSelectedNode(node);
        } else {
            // Checar si la conexión ya existe (en esta dirección)
            if (!graph.hasEdge(selectedNode.id, node.id)) {
                addEdge(selectedNode.id, node.id, { 
                    weight: '', 
                    isDirected: true, 
                    color: '#a855f7' // Morado por defecto
                });
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
          removeEdge(edge.source, edge.target);
          return;
      }

      if (tool === 'edit') {
          // Buscar si hay borde inverso para editar ambos
          const reverseEdge = graph.getEdge(edge.target, edge.source);
          
          const sourceNode = graph.getNode(edge.source);
          const targetNode = graph.getNode(edge.target);

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

  // touch equivalente para mobile
  const handleNodeTouchStart = (e, node) => {
      if (tool === 'move') {
          e.stopPropagation();
          e.preventDefault();
          setDraggingNode(node.id);
          setSelectedNode(node);
      }
  };
  
  const handleMouseMove = (e) => {
      if (draggingNode && tool === 'move') {
          const rect = canvasRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          moveNode(draggingNode, x, y);
      }
  };

  const handleTouchMove = (e) => {
      if (draggingNode && tool === 'move') {
          e.preventDefault();
          const touch = e.touches[0];
          const rect = canvasRef.current.getBoundingClientRect();
          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;
          moveNode(draggingNode, x, y);
      }
  };
  
  const handleMouseUp = () => {
      setDraggingNode(null);
  };

  const handleSaveModal = (updatedData) => {
      if (modalType === 'node') {
          updateNode(updatedData.id, updatedData);
      } else {
          // operación batch: quitar aristas viejas y agregar nuevas en un solo clone
          mutateGraph(g => {
              g.removeEdge(updatedData.sourceId, updatedData.targetId);
              g.removeEdge(updatedData.targetId, updatedData.sourceId);
              
              if (updatedData.forward.active) {
                  g.addEdge(updatedData.sourceId, updatedData.targetId, {
                      weight: updatedData.forward.weight,
                      color: updatedData.forward.color,
                      isDirected: true
                  });
              }

              if (updatedData.backward.active) {
                  g.addEdge(updatedData.targetId, updatedData.sourceId, {
                      weight: updatedData.backward.weight,
                      color: updatedData.backward.color,
                      isDirected: true
                  });
              }
          });
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
          const source = graph.getNode(edge.source);
          const target = graph.getNode(edge.target);
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
          const isBidirectional = graph.hasEdge(edge.target, edge.source);
          
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
        
        const source = graph.getNode(edge.source);
        const target = graph.getNode(edge.target);
        if (!source || !target) return null;

        let x, y;

        if (edge.source === edge.target) {
            x = source.x;
            y = source.y - 50;
        } else {
            const isBidirectional = graph.hasEdge(edge.target, edge.source);
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
                className="font-bold text-xs pointer-events-none select-none"
                style={{ textShadow: `0 0 6px ${edge.color || '#a855f7'}, 0 0 12px ${edge.color || '#a855f7'}80` }}
            >
                {edge.weight}
            </text>
        );
    });
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full overflow-hidden bg-zinc-950">
      {/* Zona del canvas */}
      <div className={`relative flex-1 overflow-hidden ${showMatrix ? 'h-1/2 md:h-full' : 'h-full'}`}>
        <GlitterBackground />
        {/* Toolbar + botón matriz en un solo contenedor posicionado */}
        <div className="absolute bottom-4 right-4 md:top-4 md:left-4 md:bottom-auto md:right-auto z-10 flex flex-col gap-3">
          <Toolbar currentTool={tool} setTool={setTool} />
          <div className="bg-zinc-900/80 backdrop-blur-md p-2 rounded-xl border border-zinc-700 shadow-xl">
            <button
              data-tour="tool-matrix"
              onClick={() => setShowMatrix(!showMatrix)}
              className={`
                p-3 rounded-lg transition-all duration-200 group relative
                ${showMatrix 
                  ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
              `}
              title="Matriz de Adyacencia"
            >
              <Grid3X3 size={24} />
              <span className="absolute right-full mr-3 md:left-full md:ml-3 md:right-auto md:mr-0 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-700">
                Matriz
              </span>
            </button>
          </div>
        </div>
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
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Capa 1: Bordes (Z-0) */}
          <svg className="absolute inset-0 w-full h-full z-0">
              {renderEdges()}
          </svg>

          {/* Capa 2: Nodos (Z-10) */}
          {nodes.map(node => {
            const isConnectSelected = tool === 'connect' && selectedNode && selectedNode.id === node.id;
            const isOtherSelected = selectedNode && selectedNode.id === node.id && tool !== 'connect';
            const isDragging = draggingNode === node.id;
            return (
            <div 
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
              onTouchStart={(e) => handleNodeTouchStart(e, node)}
              onClick={(e) => handleNodeClick(e, node)}
              className={`
                absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center 
                text-xs font-bold hover:scale-110 z-10 select-none
                ${isOtherSelected ? 'ring-4 ring-white' : ''}
                ${isConnectSelected ? 'scale-110' : ''}
                ${tool === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                ${tool === 'delete' ? 'hover:ring-4 hover:ring-red-500' : ''}
              `}
              style={{
                left: node.x,
                top: node.y,
                backgroundColor: '#18181b', 
                border: `2px solid ${node.color || '#06b6d4'}`, 
                color: 'white',
                transition: isDragging ? 'none' : 'transform 150ms, box-shadow 150ms',
                boxShadow: isConnectSelected
                  ? `0 0 20px ${node.color || '#06b6d4'}, 0 0 40px ${node.color || '#06b6d4'}90, 0 0 60px ${node.color || '#06b6d4'}50`
                  : `0 0 15px ${node.color}50`,
                animation: isConnectSelected ? 'connectGlow 1.5s ease-in-out infinite' : 'none'
              }}
            >
              {node.label || node.id}
            </div>
            );
          })}

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

      {/* Panel de la matriz de adyacencia */}
      {showMatrix && (
        <div className="w-full md:w-80 h-1/2 md:h-full shrink-0">
          <AdjacencyMatrix graph={graph} onClose={() => setShowMatrix(false)} />
        </div>
      )}
      {/* Tour interactivo */}
      {showTour && <CanvasTour onFinish={() => setShowTour(false)} />}
    </div>
  );
}

export default GraphCanvas;
