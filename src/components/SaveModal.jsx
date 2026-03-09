import { useState, useEffect, useRef } from "react";
import { X, Save } from "lucide-react";

function SaveModal({ isOpen, onClose, onSave }) {
	const [filename, setFilename] = useState("grafo");
	const inputRef = useRef(null);

	useEffect(() => {
		if (isOpen) {
			setFilename("grafo");
			// Auto-focus y seleccionar el texto
			setTimeout(() => inputRef.current?.select(), 50);
		}
	}, [isOpen]);

	if (!isOpen) return null;

	const handleSave = () => {
		const name = filename.trim() || "grafo";
		onSave(name);
		onClose();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSave();
		if (e.key === "Escape") onClose();
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
			<div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl w-96 shadow-2xl space-y-5">
				<div className="flex justify-between items-center border-b border-zinc-800 pb-3">
					<h3 className="text-lg font-bold text-white flex items-center gap-2">
						<Save size={18} className="text-cyan-400" />
						Guardar Grafo
					</h3>
					<button
						onClick={onClose}
						className="text-zinc-400 hover:text-white transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				<div className="space-y-2">
					<label className="text-sm text-zinc-400 font-medium">
						Nombre del archivo
					</label>
					<div className="flex items-center gap-2">
						<input
							ref={inputRef}
							type="text"
							value={filename}
							onChange={(e) => setFilename(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="grafo"
							className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
						/>
						<span className="text-zinc-500 text-sm">.json</span>
					</div>
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

export default SaveModal;
