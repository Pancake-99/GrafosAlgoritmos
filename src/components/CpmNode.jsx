// nodo rectangular para CPM con 9 campos
// fila 1: ES | Duración | EF
// fila 2: Label (nombre de la actividad)
// fila 3: LS | Holgura | LF

function CpmNode({ node, cpmValues, isDragging, isSelected, isDeleteHover, toolIsMove, onClick, onMouseDown, onTouchStart, style }) {
  const v = cpmValues || {};
  const dur = v.duration ?? (node.cpm?.duration || "");

  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onClick={onClick}
      className={`
        absolute z-10 select-none
        ${toolIsMove ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
        ${isSelected ? "ring-2 ring-white" : ""}
        ${isDeleteHover ? "ring-2 ring-red-500" : ""}
      `}
      style={{
        ...style,
        left: style?.left ?? node.x,
        top: style?.top ?? node.y,
        transform: "translate(-50%, -50%)",
        transition: isDragging ? "none" : "transform 150ms, box-shadow 150ms",
        filter: isDragging ? "brightness(1.1)" : "none",
      }}
    >
      <div
        className="rounded-lg overflow-hidden border-2 shadow-lg"
        style={{
          borderColor: node.color || "#06b6d4",
          boxShadow: `0 0 15px ${node.color || "#06b6d4"}40`,
          minWidth: "140px",
        }}
      >
        {/* Fila superior: ES | D | EF */}
        <div className="grid grid-cols-3 divide-x divide-zinc-700 bg-zinc-900/95 text-[10px]">
          <div className="px-2 py-1 text-center">
            <div className="text-zinc-500 font-medium leading-tight">ES</div>
            <div className="text-white font-bold">{v.es ?? ""}</div>
          </div>
          <div className="px-2 py-1 text-center">
            <div className="text-zinc-500 font-medium leading-tight">D</div>
            <div className="text-white font-bold">{dur}</div>
          </div>
          <div className="px-2 py-1 text-center">
            <div className="text-zinc-500 font-medium leading-tight">EF</div>
            <div className="text-white font-bold">{v.ef ?? ""}</div>
          </div>
        </div>

        {/* Fila central: Label */}
        <div
          className="px-3 py-1.5 text-center text-xs font-bold text-white border-y border-zinc-700"
          style={{ backgroundColor: "#18181b" }}
        >
          {node.label || node.id}
        </div>

        {/* Fila inferior: LS | H | LF */}
        <div className="grid grid-cols-3 divide-x divide-zinc-700 bg-zinc-900/95 text-[10px]">
          <div className="px-2 py-1 text-center">
            <div className="text-zinc-500 font-medium leading-tight">LS</div>
            <div className="text-white font-bold">{v.ls ?? ""}</div>
          </div>
          <div className="px-2 py-1 text-center">
            <div className="text-zinc-500 font-medium leading-tight">H</div>
            <div className="text-white font-bold">{v.float ?? ""}</div>
          </div>
          <div className="px-2 py-1 text-center">
            <div className="text-zinc-500 font-medium leading-tight">LF</div>
            <div className="text-white font-bold">{v.lf ?? ""}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CpmNode;
