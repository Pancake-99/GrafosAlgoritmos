import { useState, useMemo, useCallback } from 'react';
import Graph from '../graph/Graph';

// hook que envuelve la clase Graph para react
// cada mutación clona el grafo para que useState detecte el cambio
export default function useGraph() {
  const [graph, setGraph] = useState(() => new Graph());

  // helper: clonar, mutar, y setear
  // tambien expuesto como mutateGraph para operaciones batch
  const mutate = useCallback((fn) => {
    setGraph(prev => {
      const copy = prev.clone();
      fn(copy);
      return copy;
    });
  }, []);

  // --- Operaciones de nodos ---

  const addNode = useCallback((id, data) => {
    mutate(g => g.addNode(id, data));
  }, [mutate]);

  const removeNode = useCallback((id) => {
    mutate(g => g.removeNode(id));
  }, [mutate]);

  const updateNode = useCallback((id, data) => {
    mutate(g => g.updateNode(id, data));
  }, [mutate]);

  const moveNode = useCallback((id, x, y) => {
    mutate(g => g.updateNode(id, { x, y }));
  }, [mutate]);

  // --- Operaciones de aristas ---

  const addEdge = useCallback((source, target, data) => {
    mutate(g => g.addEdge(source, target, data));
  }, [mutate]);

  const removeEdge = useCallback((source, target) => {
    mutate(g => g.removeEdge(source, target));
  }, [mutate]);

  const updateEdge = useCallback((source, target, data) => {
    mutate(g => g.updateEdge(source, target, data));
  }, [mutate]);

  // --- Derivados para rendering (misma forma que antes) ---

  const nodesArray = useMemo(() => graph.getNodesArray(), [graph]);
  const edgesArray = useMemo(() => graph.getEdgesArray(), [graph]);

  return {
    graph,           // acceso directo para getMatrix(), getNeighbors(), etc.
    nodesArray,
    edgesArray,
    addNode,
    removeNode,
    updateNode,
    moveNode,
    addEdge,
    removeEdge,
    updateEdge,
    mutateGraph: mutate  // para operaciones batch (ej: editar arista en modal)
  };
}
