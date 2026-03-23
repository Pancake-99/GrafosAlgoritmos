import React from "react";

function AlgorithmsPanel({ 
    activeAlgorithm, 
    setActiveAlgorithm, 
    assignationType, 
    setAssignationType, 
    bipartiteData,
	assignationResult
}) {
	return (
		<div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-xl border border-zinc-700 shadow-xl flex gap-1.5">
			{/* Regular Mode */}
			<button
				onClick={() => setActiveAlgorithm("none")}
				className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
					activeAlgorithm === "none"
						? "bg-zinc-700 text-white shadow-[0_0_10px_rgba(63,63,70,0.5)]"
						: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
				}`}
				title="Modo Edición Regular (Sin algoritmos ejecutándose)"
			>
				Regular
			</button>

			{/* CPM Mode */}
			<button
				onClick={() => setActiveAlgorithm("cpm")}
				className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
					activeAlgorithm === "cpm"
						? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]"
						: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
				}`}
			>
				CPM
			</button>

			{/* Assignation Mode & Dropdown */}
			<div className="relative flex flex-col items-center">
				<button
					onClick={() => setActiveAlgorithm("assignation")}
					disabled={!bipartiteData && activeAlgorithm !== "assignation"}
					className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
						activeAlgorithm === "assignation"
							? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]"
							: !bipartiteData
							? "opacity-50 cursor-not-allowed text-zinc-600 bg-zinc-800/50"
							: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
					}`}
					title={!bipartiteData && activeAlgorithm !== "assignation" ? "El grafo debe tener solo nodos de inicio y fin (sin intermedios)" : "Método Húngaro"}
				>
					Assignation
				</button>
				
				{/* Dropdown flotante de MIN/MAX */}
				{activeAlgorithm === "assignation" && (
					<div className="absolute top-full left-0 w-full mt-2 p-1.5 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-zinc-700 shadow-xl z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-200">
						<button 
							className={`w-full px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
								assignationType === "min" 
									? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
									: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
							}`}
							onClick={() => setAssignationType("min")}
						>
							MIN
						</button>
						<button 
							className={`w-full px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
								assignationType === "max" 
									? "bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
									: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
							}`}
							onClick={() => setAssignationType("max")}
						>
							MAX
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default AlgorithmsPanel;
