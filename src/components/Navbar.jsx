import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Share2 } from 'lucide-react';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-md transition-colors duration-200 font-medium
    ${isActive(path) 
      ? 'text-cyan-400 bg-zinc-800' 
      : 'text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/50'}
  `;

  return (
    <nav className="w-full bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <span className="text-xl font-bold tracking-tight text-white">
              Grafos y <span className="text-cyan-500">Algoritmos</span>
            </span>
          </div>
          <div className="flex space-x-4">
            <Link to="/" className={linkClass('/')}>
              <Home size={20} />
              <span>Inicio</span>
            </Link>
            <Link to="/wiki" className={linkClass('/wiki')}>
              <BookOpen size={20} />
              <span>Wiki</span>
            </Link>
            <Link to="/graph" className={linkClass('/graph')}>
              <Share2 size={20} />
              <span>Sim</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
