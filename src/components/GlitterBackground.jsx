import { useEffect, useRef } from 'react';

const GlitterBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createNoise = () => {
      const w = canvas.width;
      const h = canvas.height;
      const idata = ctx.createImageData(w, h);
      const buffer32 = new Uint32Array(idata.data.buffer);
      const len = buffer32.length;

      for (let i = 0; i < len; i++) {
        if (Math.random() < 0.35) { // Más denso (más ruido como pidió el jefe)
          const shade = Math.random();
          // Mezclita de brillo blanco y cian
          if (Math.random() > 0.8) {
             // Brillo tipo cian (formato raro ABGR)
             buffer32[i] = 0xFFD4B606; 
          } else {
             // Brillo gris/blanco normalito
             const val = Math.floor(shade * 150);
             buffer32[i] = (255 << 24) | (val << 16) | (val << 8) | val;
          }
        } else {
            // Fondo oscurito #101010
            buffer32[i] = 0xFF101010;
        }
      }
      ctx.putImageData(idata, 0, 0);
    };
    
    const draw = () => {
        createNoise();
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.25 }} // Menos brillo para que no encandile
    />
  );
};

export default GlitterBackground;
