import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Share2 } from 'lucide-react';
import logo from '../assets/Logo blanco.png';

function Cover() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative min-h-[calc(100vh-64px)] flex flex-col justify-center">
      <div className="flex flex-col items-center justify-center text-center space-y-12">
        <div className="space-y-8 flex flex-col items-center">
          <img src={logo} alt="Logo" className="w-140 h-auto drop-shadow-[0_0_15px_rgba(6,182,212,0.3)] mb-0 mt-0" />
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl mt-0">
            Grafos y <span className="text-cyan-500">Algoritmos</span>
          </h1>
        </div>
        
        <div className="flex gap-6">
          <Link to="/wiki" className="group relative inline-flex items-center gap-2 px-8 py-3 text-lg font-medium text-white bg-zinc-800 rounded-lg overflow-hidden transition-all hover:bg-zinc-700 ring-1 ring-white/10 hover:ring-cyan-500/50">
            <BookOpen className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400 transition-colors" />
            <span>Empezar a Aprender</span>
          </Link>
          <Link to="/graph" className="group relative inline-flex items-center gap-2 px-8 py-3 text-lg font-medium text-white bg-cyan-600 rounded-lg overflow-hidden transition-all hover:bg-cyan-500 shadow-lg shadow-cyan-900/20">
            <Share2 className="w-5 h-5" />
            <span>Crear Grafo</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-0 w-full text-center text-zinc-500 text-xs opacity-70">
        creado por: Alejandro Alfonso Bobarin Marquez · alejandro.a.bobarin.marquez@gmail.com · 2026
      </div>
    </div>
  );
}

export default Cover;
