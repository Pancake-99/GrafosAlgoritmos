import { useMemo } from "react";
import { X } from "lucide-react";

// panel que muestra la matriz de adyacencia con sumas y estadísticas
function AdjacencyMatrix({ graph, onClose }) {
	const { labels, matrix } = useMemo(() => graph.getMatrix(), [graph]);
	const size = labels.length;

	// sumas de filas y columnas
	const rowSums = useMemo(() => {
		return matrix.map((row) =>
			row.reduce((sum, cell) => sum + (cell !== 0 ? Number(cell) : 0), 0),
		);
	}, [matrix]);

	const colSums = useMemo(() => {
		if (size === 0) return [];
		return Array.from({ length: size }, (_, j) =>
			matrix.reduce((sum, row) => sum + (row[j] !== 0 ? Number(row[j]) : 0), 0),
		);
	}, [matrix, size]);

	// grados (salida por fila, entrada por columna)
	const outDegrees = useMemo(() => {
		return matrix.map((row) =>
			row.reduce((count, cell) => count + (cell !== 0 ? 1 : 0), 0),
		);
	}, [matrix]);

	const inDegrees = useMemo(() => {
		if (size === 0) return [];
		return Array.from({ length: size }, (_, j) =>
			matrix.reduce((count, row) => count + (row[j] !== 0 ? 1 : 0), 0),
		);
	}, [matrix, size]);

	// contar filas/columnas con al menos una conexión
	const rowsWithConnections = useMemo(
		() => rowSums.filter((s) => s > 0).length,
		[rowSums],
	);
	const colsWithConnections = useMemo(
		() => colSums.filter((s) => s > 0).length,
		[colSums],
	);

	if (size === 0) {
		return (
			<div className="h-full flex flex-col bg-zinc-900/95 backdrop-blur-md border-l border-zinc-700">
				<div className="flex items-center justify-between p-3 border-b border-zinc-700">
					<h3 className="text-sm font-bold text-white">Matriz de Adyacencia</h3>
					<button
						onClick={onClose}
						className="text-zinc-400 hover:text-white transition-colors"
					>
						<X size={18} />
					</button>
				</div>
				<div className="flex-1 flex items-center justify-center p-4">
					<p className="text-zinc-500 text-sm text-center">
						Agrega nodos para ver la matriz
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-zinc-900/95 backdrop-blur-md border-l border-t md:border-t-0 border-zinc-700">
			<div className="flex items-center justify-between p-3 border-b border-zinc-700">
				<h3 className="text-sm font-bold text-white">Matriz de Adyacencia</h3>
				<button
					onClick={onClose}
					className="text-zinc-400 hover:text-white transition-colors"
				>
					<X size={18} />
				</button>
			</div>
			<div className="flex-1 overflow-auto p-3">
				<table className="border-collapse mx-auto">
					<thead>
						<tr>
							{/* esquina vacía */}
							<th className="w-10 h-8"></th>
							{labels.map((label, j) => (
								<th
									key={j}
									className="w-10 h-8 text-xs font-bold text-cyan-400 text-center"
								>
									{label}
								</th>
							))}
							{/* header de la columna de sumas */}
							<th className="w-10 h-8 text-xs font-bold text-zinc-500 text-center pl-2 border-l-2 border-zinc-600">
								Σ
							</th>
							{/* header de la columna de grado de salida */}
							<th className="w-10 h-8 text-xs font-bold text-cyan-500 text-center">
								Δ Out
							</th>
						</tr>
					</thead>
					<tbody>
						{matrix.map((row, i) => (
							<tr key={i}>
								<td className="w-10 h-8 text-xs font-bold text-cyan-400 text-center pr-1">
									{labels[i]}
								</td>
								{row.map((cell, j) => {
									const hasConnection = cell !== 0;
									return (
										<td
											key={j}
											className={`
                        w-10 h-8 text-center text-xs font-mono border border-zinc-700/50
                        ${hasConnection ? "text-white bg-cyan-500/10" : "text-zinc-600"}
                      `}
										>
											{cell}
										</td>
									);
								})}
								{/* suma de la fila */}
								<td className="w-10 h-8 text-center text-xs font-mono font-bold border border-zinc-700/50 pl-2 border-l-2 border-l-zinc-600 text-zinc-400">
									{rowSums[i]}
								</td>
								{/* grado de salida (fila) */}
								<td className="w-10 h-8 text-center text-xs font-mono font-bold border border-zinc-700/50 text-zinc-500">
									{outDegrees[i]}
								</td>
							</tr>
						))}

						{/* fila de sumas */}
						<tr>
							<td className="w-10 h-8 text-xs font-bold text-zinc-500 text-center pr-1 pt-2 border-t-2 border-zinc-600">
								Σ
							</td>
							{colSums.map((sum, j) => (
								<td
									key={j}
									className="w-10 h-8 text-center text-xs font-mono font-bold border border-zinc-700/50 pt-2 border-t-2 border-t-zinc-600 text-zinc-400"
								>
									{sum}
								</td>
							))}
							<td className="w-10 h-8"></td>
							<td className="w-10 h-8"></td>
						</tr>

						{/* fila de grado de entrada */}
						<tr>
							<td className="w-10 h-8 text-xs font-bold text-cyan-500 text-center pr-1 pt-1">
								Δ In
							</td>
							{inDegrees.map((deg, j) => (
								<td
									key={j}
									className="w-10 h-8 text-center text-xs font-mono font-bold border border-zinc-700/50 pt-1 text-zinc-500"
								>
									{deg}
								</td>
							))}
							<td className="w-10 h-8"></td>
							<td className="w-10 h-8"></td>
						</tr>
					</tbody>
				</table>

				{/* estadísticas de conexiones */}
				<div className="mt-4 space-y-1 text-xs text-zinc-400 text-center">
					<p>
						Filas con conexión:{" "}
						<span className="text-white font-semibold">
							{rowsWithConnections}
						</span>{" "}
						/ {size}
					</p>
					<p>
						Columnas con conexión:{" "}
						<span className="text-white font-semibold">
							{colsWithConnections}
						</span>{" "}
						/ {size}
					</p>
				</div>
			</div>
		</div>
	);
}

export default AdjacencyMatrix;
