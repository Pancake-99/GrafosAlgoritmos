import {
	MousePointer2,
	Plus,
	Edit3,
	Trash2,
} from "lucide-react";

const tools = [
	{ id: "move", icon: MousePointer2, label: "Mover", key: "g" },
	{ id: "create", icon: Plus, label: "Crear", key: "a" },
	{ id: "edit", icon: Edit3, label: "Editar", key: "e" },
	{ id: "delete", icon: Trash2, label: "Borrar", key: "x" },
];

function Toolbar({ currentTool, setTool, onDeleteDoubleClick }) {
	return (
		<div className="flex flex-col gap-2 bg-zinc-900/80 backdrop-blur-md p-2 rounded-xl border border-zinc-700 shadow-xl">
			{tools.map((tool) => {
				const Icon = tool.icon;
				const isActive = currentTool === tool.id;

				return (
					<button
						key={tool.id}
						data-tour={`tool-${tool.id}`}
						onClick={() => setTool(tool.id)}
						onDoubleClick={
							tool.id === "delete" ? onDeleteDoubleClick : undefined
						}
						className={`
              p-3 rounded-lg transition-all duration-200 group relative
              ${
								isActive
									? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]"
									: "text-zinc-400 hover:bg-zinc-800 hover:text-white"
							}
            `}
						title={
							tool.id === "delete"
								? `${tool.label} (doble clic = borrar todo)`
								: tool.label
						}
					>
						<Icon size={24} />

						{/* Mensajito flotante */}
						<span className="absolute right-full mr-3 md:left-full md:ml-3 md:right-auto md:mr-0 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-zinc-700">
							{tool.label} <span className="text-zinc-500">({tool.key.toUpperCase()})</span>
						</span>
					</button>
				);
			})}
		</div>
	);
}

export default Toolbar;
