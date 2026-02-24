import { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

// pasos del tour - target es el data-tour del elemento a resaltar
const STEPS = [
  {
    target: null, // paso de bienvenida, centrado
    title: '¡Bienvenido al Canvas!',
    desc: 'Aquí puedes crear y visualizar grafos. Te mostraré cómo usar cada herramienta.',
  },
  {
    target: 'tool-move',
    title: 'Mover',
    desc: 'Arrastra los nodos para reorganizar tu grafo.',
  },
  {
    target: 'tool-add',
    title: 'Agregar Nodo',
    desc: 'Haz clic en el canvas para crear un nuevo nodo.',
  },
  {
    target: 'tool-connect',
    title: 'Conectar',
    desc: 'Haz clic en un nodo y luego en otro para crear una arista entre ellos.',
  },
  {
    target: 'tool-edit',
    title: 'Editar',
    desc: 'Haz clic en un nodo o arista para cambiar su color, nombre o peso.',
  },
  {
    target: 'tool-delete',
    title: 'Borrar',
    desc: 'Haz clic en un nodo o arista para eliminarlo del grafo.',
  },
  {
    target: 'tool-matrix',
    title: 'Matriz de Adyacencia',
    desc: 'Muestra u oculta la matriz de adyacencia de tu grafo.',
  },
];

const STORAGE_KEY = 'grafos-tour-done';

function CanvasTour({ onFinish }) {
  const [step, setStep] = useState(0);
  const [pos, setPos] = useState(null); // { x, y, w, h } del elemento target
  const tooltipRef = useRef(null);

  const current = STEPS[step];

  // calcular posicion del elemento resaltado
  const updatePos = useCallback(() => {
    if (!current.target) {
      setPos(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (!el) {
      setPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setPos({
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
    });
  }, [current.target]);

  useEffect(() => {
    updatePos();
    window.addEventListener('resize', updatePos);
    return () => window.removeEventListener('resize', updatePos);
  }, [updatePos]);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onFinish();
  };

  // decidir donde va el tooltip relativo al target, clampeado al viewport
  const getTooltipStyle = () => {
    const tooltipW = 288; // w-72 = 18rem = 288px
    const tooltipH = 140; // altura aprox del tooltip
    const pad = 16;
    const margin = 12; // margen minimo del borde de la pantalla
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (!pos) {
      // centrado para paso de bienvenida
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    let left, top;

    // desktop (md+): toolbar arriba-izquierda -> tooltip a la derecha
    if (vw >= 768) {
      left = pos.x + pos.w + pad;
      top = pos.y + pos.h / 2 - tooltipH / 2;
      // si se sale por la derecha, ponerlo a la izquierda
      if (left + tooltipW > vw - margin) {
        left = pos.x - pad - tooltipW;
      }
    } else {
      // mobile: toolbar abajo-derecha -> tooltip a la izquierda
      left = pos.x - pad - tooltipW;
      top = pos.y + pos.h / 2 - tooltipH / 2;
      // si se sale por la izquierda, ponerlo arriba del elemento
      if (left < margin) {
        left = pos.x + pos.w / 2 - tooltipW / 2;
        top = pos.y - pad - tooltipH;
      }
    }

    // clampear: nunca salir del viewport
    left = Math.max(margin, Math.min(left, vw - tooltipW - margin));
    top = Math.max(margin, Math.min(top, vh - tooltipH - margin));

    return { position: 'fixed', left, top };
  };

  // area de recorte para el spotlight (el hueco en el overlay)
  const getClipPath = () => {
    if (!pos) return 'none';
    const inset = 6; // padding visual alrededor del boton
    const r = 12;    // border-radius
    const x = pos.x - inset;
    const y = pos.y - inset;
    const w = pos.w + inset * 2;
    const h = pos.h + inset * 2;
    // recorte: fullscreen con un hueco redondeado
    return `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
      ${x}px ${y + r}px,
      ${x + r}px ${y}px,
      ${x + w - r}px ${y}px,
      ${x + w}px ${y + r}px,
      ${x + w}px ${y + h - r}px,
      ${x + w - r}px ${y + h}px,
      ${x + r}px ${y + h}px,
      ${x}px ${y + h - r}px,
      ${x}px ${y + r}px
    )`;
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay oscuro con hueco */}
      <div
        className="absolute inset-0 bg-black/60 transition-all duration-300"
        style={{ clipPath: getClipPath() }}
        onClick={finish}
      />

      {/* borde brillante alrededor del elemento */}
      {pos && (
        <div
          className="absolute rounded-xl border-2 border-cyan-400 pointer-events-none transition-all duration-300"
          style={{
            left: pos.x - 6,
            top: pos.y - 6,
            width: pos.w + 12,
            height: pos.h + 12,
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4), 0 0 30px rgba(6, 182, 212, 0.2)',
          }}
        />
      )}

      {/* tooltip */}
      <div
        ref={tooltipRef}
        className="w-72 bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl z-50"
        style={getTooltipStyle()}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-sm">{current.title}</h3>
          <button
            onClick={finish}
            className="text-zinc-500 hover:text-white transition-colors -mt-1 -mr-1"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed mb-4">{current.desc}</p>
        
        <div className="flex items-center justify-between">
          {/* indicador de progreso */}
          <div className="flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === step ? 'bg-cyan-400' : i < step ? 'bg-cyan-700' : 'bg-zinc-600'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={prev}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            {step === 0 && (
              <button
                onClick={finish}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Saltar
              </button>
            )}
            <button
              onClick={next}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 text-white text-xs font-medium rounded-lg hover:bg-cyan-400 transition-colors"
            >
              {step < STEPS.length - 1 ? (
                <>Siguiente <ChevronRight size={14} /></>
              ) : (
                '¡Listo!'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// helper para saber si el tour ya se completó
CanvasTour.isDone = () => localStorage.getItem(STORAGE_KEY) === 'true';
CanvasTour.reset = () => localStorage.removeItem(STORAGE_KEY);

export default CanvasTour;
