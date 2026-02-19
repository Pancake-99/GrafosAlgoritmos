import { Routes, Route } from 'react-router-dom';
import COVER from './pages/Cover';
import WIKI from './pages/Wiki';
import GRAPH_CANVAS from './pages/GraphCanvas';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="h-dvh bg-zinc-900 text-zinc-100 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/" element={<COVER />} />
          <Route path="/wiki" element={<WIKI />} />
          <Route path="/graph" element={<GRAPH_CANVAS />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
