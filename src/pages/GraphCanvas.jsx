import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Grid3X3, Save, Upload } from "lucide-react";
import GlitterBackground from "../components/GlitterBackground";
import Toolbar from "../components/Toolbar";
import EditModal from "../components/EditModal";
import SaveModal from "../components/SaveModal";
import AdjacencyMatrix from "../components/AdjacencyMatrix";
import CpmNode from "../components/CpmNode";
import CanvasTour from "../components/CanvasTour";
import useGraph from "../hooks/useGraph";

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
		loadGraph,
		clearGraph,
		mutateGraph,
	} = useGraph();

	const handleClearCanvas = () => {
		if (nodes.length === 0) return;
		if (
			window.confirm(
				"¿Borrar TODO el canvas? Esta acción no se puede deshacer.",
			)
		) {
			clearGraph();
		}
	};

	const fileInputRef = useRef(null);

	const [tool, setTool] = useState("create");

	const [selectedNode, setSelectedNode] = useState(null);
	const [draggingNode, setDraggingNode] = useState(null);

	// para drag-to-connect: posición original del nodo y preview line
	const dragOriginRef = useRef(null);
	const justDraggedRef = useRef(false); // evitar que el click post-drag cree un nodo
	const [connectPreview, setConnectPreview] = useState(null); // { x1, y1, x2, y2 }

	// Estado del modal
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalData, setModalData] = useState(null);
	const [modalType, setModalType] = useState("node"); // 'node' o 'edge'
	const [modalMode, setModalMode] = useState("edit"); // 'edit' o 'create'
	const [showMatrix, setShowMatrix] = useState(false);
	const [showTour, setShowTour] = useState(() => !CanvasTour.isDone());
	const [isSaveOpen, setIsSaveOpen] = useState(false);
	const [cpmMode, setCpmMode] = useState(false);

	// resolver CPM automaticamente cuando esta activo
	const cpmResult = useMemo(() => {
		if (!cpmMode) return null;
		return graph.solveCPM();
	}, [cpmMode, graph]);

	const canvasRef = useRef(null);

	// --- Atajos de teclado ---
	useEffect(() => {
		const handleKeyDown = (e) => {
			// ignorar si hay modal abierto o estamos en un input
			if (isModalOpen || isSaveOpen) return;
			const tag = document.activeElement?.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

			const shortcuts = { g: "move", a: "create", e: "edit", x: "delete" };
			const mapped = shortcuts[e.key.toLowerCase()];
			if (mapped) {
				e.preventDefault();
				setTool(mapped);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isModalOpen, isSaveOpen]);

	// --- Guardar / Cargar Grafo ---

	const handleSaveGraph = (filename) => {
		const data = graph.serialize();
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${filename}.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleLoadGraph = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			try {
				const data = JSON.parse(ev.target.result);
				loadGraph(data);
			} catch {
				alert("Archivo inválido");
			}
		};
		reader.readAsText(file);
		e.target.value = ""; // reset para poder cargar el mismo archivo de nuevo
	};

	// --- Ayudante: buscar nodo bajo el cursor ---

	const findNodeAtPosition = useCallback((clientX, clientY) => {
		const rect = canvasRef.current.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;
		const NODE_RADIUS = 20;
		for (const node of nodes) {
			const dx = node.x - x;
			const dy = node.y - y;
			if (Math.sqrt(dx * dx + dy * dy) <= NODE_RADIUS) return node;
		}
		return null;
	}, [nodes]);

	// --- Manejadores de Interacción ---

	const handleCanvasClick = (e) => {
		if (e.target !== canvasRef.current && e.target.tagName !== "svg") return;

		// ignorar click si acabamos de hacer un drag (evita crear nodo al soltar)
		if (justDraggedRef.current) {
			justDraggedRef.current = false;
			return;
		}

		// En modo crear, clic en el fondo = nuevo nodo
		if (tool === "create") {
			const rect = canvasRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			const newId = graph.getNextId();
			setModalData({
				id: newId,
				x,
				y,
				label: newId.toString(),
				color: "#06b6d4",
			});
			setModalType("node");
			setModalMode("create");
			setIsModalOpen(true);
		}

		// Deseleccionar
		setSelectedNode(null);
	};

	// Doble clic en el fondo = crear nodo (funciona en cualquier modo)
	const handleCanvasDoubleClick = (e) => {
		if (e.target !== canvasRef.current && e.target.tagName !== "svg") return;
		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const newId = graph.getNextId();
		setModalData({
			id: newId,
			x,
			y,
			label: newId.toString(),
			color: "#06b6d4",
		});
		setModalType("node");
		setModalMode("create");
		setIsModalOpen(true);
	};

	const handleNodeClick = (e, node) => {
		e.stopPropagation();

		if (tool === "delete") {
			removeNode(node.id);
			return;
		}

		if (tool === "edit") {
			setModalData(node);
			setModalType("node");
			setModalMode("edit");
			setIsModalOpen(true);
		}
	};

	const handleEdgeClick = (e, edge) => {
		e.stopPropagation();

		if (tool === "delete") {
			// Borrar esta flecha en específico (bye)
			removeEdge(edge.source, edge.target);
			return;
		}

		if (tool === "edit") {
			// Buscar si hay borde inverso para editar ambos (no aplica a self-loops)
			const isSelfLoop = edge.source === edge.target;
			const reverseEdge = isSelfLoop
				? null
				: graph.getEdge(edge.target, edge.source);

			const sourceNode = graph.getNode(edge.source);
			const targetNode = graph.getNode(edge.target);

			setModalData({
				sourceId: edge.source,
				targetId: edge.target,
				sourceLabel: sourceNode?.label,
				targetLabel: targetNode?.label,
				edgeForward: edge,
				edgeBackward: reverseEdge,
			});
			setModalType("edge");
			setModalMode("edit");
			setIsModalOpen(true);
		}
	};

	const handleNodeMouseDown = (e, node) => {
		if (tool === "move" || tool === "create") {
			e.stopPropagation();
			setDraggingNode(node.id);
			setSelectedNode(node);
			dragOriginRef.current = { x: node.x, y: node.y };
		}
	};

	// touch equivalente para mobile
	const handleNodeTouchStart = (e, node) => {
		if (tool === "move" || tool === "create") {
			e.stopPropagation();
			e.preventDefault();
			setDraggingNode(node.id);
			setSelectedNode(node);
			dragOriginRef.current = { x: node.x, y: node.y };
		}
	};

	const handleMouseMove = (e) => {
		if (!draggingNode) return;
		const rect = canvasRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		if (tool === "move") {
			// mover el nodo
			moveNode(draggingNode, x, y);
		} else if (tool === "create") {
			// preview line desde el nodo hacia el cursor (no mover el nodo)
			const origin = dragOriginRef.current;
			if (origin) {
				setConnectPreview({ x1: origin.x, y1: origin.y, x2: x, y2: y });
			}
		}
	};

	const handleTouchMove = (e) => {
		if (!draggingNode) return;
		e.preventDefault();
		const touch = e.touches[0];
		const rect = canvasRef.current.getBoundingClientRect();
		const x = touch.clientX - rect.left;
		const y = touch.clientY - rect.top;

		if (tool === "move") {
			moveNode(draggingNode, x, y);
		} else if (tool === "create") {
			const origin = dragOriginRef.current;
			if (origin) {
				setConnectPreview({ x1: origin.x, y1: origin.y, x2: x, y2: y });
			}
		}
	};

	const handleMouseUp = (e) => {
		if (draggingNode && tool === "create") {
			justDraggedRef.current = true;
			// checar si soltamos sobre otro nodo
			const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX;
			const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY;
			const targetNode = clientX != null ? findNodeAtPosition(clientX, clientY) : null;

			if (targetNode && targetNode.id !== draggingNode) {
				// abrir modal de crear arista si no existe ya
				if (!graph.hasEdge(draggingNode, targetNode.id)) {
					const sourceNode = graph.getNode(draggingNode);
					setModalData({
						sourceId: draggingNode,
						targetId: targetNode.id,
						sourceLabel: sourceNode?.label,
						targetLabel: targetNode.label,
						edgeForward: { weight: "", color: "#a855f7" },
						edgeBackward: null,
					});
					setModalType("edge");
					setModalMode("create");
					setIsModalOpen(true);
				}
			}
		}
		setDraggingNode(null);
		setConnectPreview(null);
		dragOriginRef.current = null;
	};

	const handleSaveModal = (updatedData) => {
		if (modalType === "node") {
			if (modalMode === "create") {
				// crear nodo nuevo con los datos del modal
				addNode(updatedData.id, updatedData);
			} else {
				updateNode(updatedData.id, updatedData);
			}
		} else {
			// operación batch: quitar aristas viejas y agregar nuevas en un solo clone
			mutateGraph((g) => {
				if (modalMode === "edit") {
					g.removeEdge(updatedData.sourceId, updatedData.targetId);
					g.removeEdge(updatedData.targetId, updatedData.sourceId);
				}

				if (updatedData.forward.active) {
					g.addEdge(updatedData.sourceId, updatedData.targetId, {
						weight: updatedData.forward.weight,
						color: updatedData.forward.color,
						isDirected: true,
					});
				}

				if (
					updatedData.backward.active &&
					updatedData.sourceId !== updatedData.targetId
				) {
					g.addEdge(updatedData.targetId, updatedData.sourceId, {
						weight: updatedData.backward.weight,
						color: updatedData.backward.color,
						isDirected: true,
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

		if (!isBidirectional)
			return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };

		// Calcular vector normal unitario
		const dx = target.x - source.x;
		const dy = target.y - source.y;
		const len = Math.sqrt(dx * dx + dy * dy);
		if (len === 0)
			return { x1: source.x, y1: source.y, x2: target.x, y2: target.y };

		// Vector perpendicular (-dy, dx) normalizado * offset
		const ox = (-dy / len) * offset;
		const oy = (dx / len) * offset;

		return {
			x1: source.x + ox,
			y1: source.y + oy,
			x2: target.x + ox,
			y2: target.y + oy,
		};
	};

	// recortar linea para que la flecha toque el borde del rectangulo CPM
	const clipToRect = (sx, sy, tx, ty, hw, hh) => {
		const dx = tx - sx;
		const dy = ty - sy;
		if (dx === 0 && dy === 0) return { x: tx, y: ty };
		// escalar para tocar el borde del rectangulo
		const scaleX = hw / Math.abs(dx || 1);
		const scaleY = hh / Math.abs(dy || 1);
		const scale = Math.min(scaleX, scaleY);
		return { x: tx - dx * scale, y: ty - dy * scale };
	};

	const renderEdges = () => {
		const CPM_DARK = "#1a4a5c";
		const CPM_CRITICAL = "#22d3a0";

		return edges.map((edge, index) => {
			const source = graph.getNode(edge.source);
			const target = graph.getNode(edge.target);
			if (!source || !target) return null;

			const isCritical = cpmResult?.criticalEdges?.has(`${edge.source}-${edge.target}`);
			const edgeColor = cpmMode ? (isCritical ? CPM_CRITICAL : CPM_DARK) : (edge.color || "#a855f7");
			const edgeWidth = cpmMode && isCritical ? 3 : 2;
			const edgeFilter = cpmMode && isCritical ? `drop-shadow(0 0 6px ${CPM_CRITICAL})` : "none";

			// Manejo de auto-bucle (Cíclico)
			if (edge.source === edge.target) {
				const loopPath = `
                M ${source.x},${source.y} 
                C ${source.x - 40},${source.y - 70} 
                  ${source.x + 40},${source.y - 70} 
                  ${source.x},${source.y}
              `;

				return (
					<g
						key={`${edge.source}-${edge.target}-${index}`}
						onClick={(e) => handleEdgeClick(e, edge)}
						className="cursor-pointer group"
					>
						{/* Gatillo invisible */}
						<path
							d={loopPath}
							stroke="transparent"
							strokeWidth="15"
							fill="none"
						/>
						{/* Bucle visible */}
						<path
							d={loopPath}
							stroke={edgeColor}
							strokeWidth={edgeWidth}
							fill="none"
							className="transition-all hover:brightness-125"
							markerEnd={`url(#arrowhead-${index})`}
							style={{ filter: edgeFilter }}
						/>

						<defs>
							<marker
								id={`arrowhead-${index}`}
								markerWidth="10"
								markerHeight="7"
								refX="10"
								refY="3.5"
								orient="auto"
							>
								<polygon
									points="0 0, 10 3.5, 0 7"
									fill={edgeColor}
								/>
							</marker>
						</defs>
					</g>
				);
			}

			// Checar si es bidireccional (existe borde inverso)
			const isBidirectional = graph.hasEdge(edge.target, edge.source);

			const coords = getRenderCoords(source, target, isBidirectional);

			// en modo CPM, recortar para que la flecha toque el borde del rectangulo
			const CPM_HW = 75; // mitad del ancho del nodo CPM
			const CPM_HH = 34; // mitad del alto del nodo CPM
			if (cpmMode) {
				const srcClip = clipToRect(coords.x2, coords.y2, coords.x1, coords.y1, CPM_HW, CPM_HH);
				const tgtClip = clipToRect(coords.x1, coords.y1, coords.x2, coords.y2, CPM_HW, CPM_HH);
				coords.x1 = srcClip.x;
				coords.y1 = srcClip.y;
				coords.x2 = tgtClip.x;
				coords.y2 = tgtClip.y;
			}

			return (
				<g
					key={`${edge.source}-${edge.target}-${index}`}
					onClick={(e) => handleEdgeClick(e, edge)}
					className="cursor-pointer group"
				>
					{/* Área de gatillo invisible */}
					<line
						x1={coords.x1}
						y1={coords.y1}
						x2={coords.x2}
						y2={coords.y2}
						stroke="transparent"
						strokeWidth="15"
					/>
					{/* Línea visible */}
					<line
						x1={coords.x1}
						y1={coords.y1}
						x2={coords.x2}
						y2={coords.y2}
						stroke={edgeColor}
						strokeWidth={edgeWidth}
						className="transition-all hover:brightness-125"
						markerEnd={`url(#arrowhead-${index})`}
						style={{ filter: edgeFilter }}
					/>

					<defs>
						<marker
							id={`arrowhead-${index}`}
							markerWidth="10"
							markerHeight="7"
							refX="10"
							refY="3.5"
							orient="auto"
						>
							<polygon
								points="0 0, 10 3.5, 0 7"
								fill={edgeColor}
							/>
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
					style={{
						textShadow: `0 0 6px ${edge.color || "#a855f7"}, 0 0 12px ${edge.color || "#a855f7"}80`,
					}}
				>
					{edge.weight}
				</text>
			);
		});
	};

	return (
		<div className="flex flex-col md:flex-row w-full h-full overflow-hidden bg-zinc-950">
			{/* Zona del canvas */}
			<div
				className={`relative flex-1 overflow-hidden ${showMatrix ? "h-1/2 md:h-full" : "h-full"}`}
			>
				<GlitterBackground />
				{/* Panel de algoritmos - top center */}
				<div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-700 shadow-xl flex gap-1.5">
					<button
						onClick={() => setCpmMode(!cpmMode)}
						className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
							cpmMode
								? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]"
								: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
						}`}
					>
						CPM
					</button>
				</div>
				{/* Toolbar + botón matriz en un solo contenedor posicionado */}
				<div className="absolute bottom-4 right-4 md:top-4 md:left-4 md:bottom-auto md:right-auto z-10 flex flex-col gap-3">
					<Toolbar
						currentTool={tool}
						setTool={setTool}
						onDeleteDoubleClick={handleClearCanvas}
					/>
					<div className="bg-zinc-900/80 backdrop-blur-md p-2 rounded-xl border border-zinc-700 shadow-xl">
						<button
							data-tour="tool-matrix"
							onClick={() => setShowMatrix(!showMatrix)}
							className={`
                p-3 rounded-lg transition-all duration-200 group relative
                ${
									showMatrix
										? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]"
										: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
								}
              `}
							title="Matriz de Adyacencia"
						>
							<Grid3X3 size={24} />
							<span className="absolute right-full mr-3 md:left-full md:ml-3 md:right-auto md:mr-0 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-700">
								Matriz
							</span>
						</button>
					</div>
					<div className="bg-zinc-900/80 backdrop-blur-md p-2 rounded-xl border border-zinc-700 shadow-xl flex flex-col gap-2">
						<button
							onClick={() => setIsSaveOpen(true)}
							className="p-3 rounded-lg transition-all duration-200 group relative text-zinc-400 hover:bg-zinc-800 hover:text-white"
							title="Guardar Grafo"
						>
							<Save size={24} />
							<span className="absolute right-full mr-3 md:left-full md:ml-3 md:right-auto md:mr-0 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-700">
								Guardar
							</span>
						</button>
						<button
							onClick={() => fileInputRef.current?.click()}
							className="p-3 rounded-lg transition-all duration-200 group relative text-zinc-400 hover:bg-zinc-800 hover:text-white"
							title="Cargar Grafo"
						>
							<Upload size={24} />
							<span className="absolute right-full mr-3 md:left-full md:ml-3 md:right-auto md:mr-0 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-700">
								Cargar
							</span>
						</button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".json"
							onChange={handleLoadGraph}
							className="hidden"
						/>
					</div>
				</div>
				<EditModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSave={handleSaveModal}
					data={modalData}
					type={modalType}
					mode={modalMode}
					cpmMode={cpmMode}
				/>
				<SaveModal
					isOpen={isSaveOpen}
					onClose={() => setIsSaveOpen(false)}
					onSave={handleSaveGraph}
				/>

				{/* Área donde ocurre la magia */}
				<div
					ref={canvasRef}
					className={`w-full h-full relative ${tool === "move" ? "cursor-grab active:cursor-grabbing" : "cursor-crosshair"}`}
					onClick={handleCanvasClick}
					onDoubleClick={handleCanvasDoubleClick}
					onMouseMove={handleMouseMove}
					onMouseUp={handleMouseUp}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleMouseUp}
				>
					{/* Capa 1: Bordes (Z-0) */}
					<svg className="absolute inset-0 w-full h-full z-0">
						{renderEdges()}
						{/* Preview line mientras arrastras un nodo hacia otro */}
						{connectPreview && (
							<line
								x1={connectPreview.x1}
								y1={connectPreview.y1}
								x2={connectPreview.x2}
								y2={connectPreview.y2}
								stroke="#a855f7"
								strokeWidth="2"
								strokeDasharray="6 4"
								opacity="0.6"
								pointerEvents="none"
							/>
						)}
					</svg>

					{/* Capa 2: Nodos (Z-10) */}
					{nodes.map((node) => {
						const isOtherSelected =
							selectedNode && selectedNode.id === node.id;
						const isDragging = draggingNode === node.id;

						if (cpmMode) {
							return (
								<CpmNode
									key={node.id}
									node={node}
									cpmValues={cpmResult?.cpmData?.get(node.id)}
									isDragging={isDragging}
									isSelected={isOtherSelected}
									isDeleteHover={tool === "delete"}
									toolIsMove={tool === "move"}
									onClick={(e) => handleNodeClick(e, node)}
									onMouseDown={(e) => handleNodeMouseDown(e, node)}
									onTouchStart={(e) => handleNodeTouchStart(e, node)}
								/>
							);
						}

						return (
							<div
								key={node.id}
								onMouseDown={(e) => handleNodeMouseDown(e, node)}
								onTouchStart={(e) => handleNodeTouchStart(e, node)}
								onClick={(e) => handleNodeClick(e, node)}
									className={`
                absolute w-10 h-10 -ml-5 -mt-5 rounded-full flex items-center justify-center 
                text-xs font-bold hover:scale-110 z-10 select-none
                ${isOtherSelected ? "ring-4 ring-white" : ""}
                ${tool === "move" ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                ${tool === "delete" ? "hover:ring-4 hover:ring-red-500" : ""}
              `}
								style={{
									left: node.x,
									top: node.y,
									backgroundColor: "#18181b",
									border: `2px solid ${node.color || "#06b6d4"}`,
									color: "white",
									transition: isDragging
										? "none"
										: "transform 150ms, box-shadow 150ms",
									boxShadow: `0 0 15px ${node.color}50`,
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
							<p className="text-zinc-500 text-lg color-white text-center">
								Haz clic para agregar un nodo
							</p>
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
