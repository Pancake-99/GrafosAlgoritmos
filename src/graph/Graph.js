// clase principal del grafo - almacena nodos y aristas con lista de adyacencia
// la idea es que esta clase sea el "cerebro" y luego react la envuelve con un hook

export default class Graph {
  constructor() {
    // Map<id, { id, label, color, x, y }>
    this.nodes = new Map();
    // Map<sourceId, Map<targetId, { weight, color, isDirected }>>
    this.adjList = new Map();
  }

  // --- Nodos ---

  addNode(id, data = {}) {
    if (this.nodes.has(id)) return this;
    this.nodes.set(id, { id, ...data });
    this.adjList.set(id, new Map());
    return this;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return this;
    // quitar todas las aristas que tocan este nodo
    this.adjList.delete(id);
    for (const [, neighbors] of this.adjList) {
      neighbors.delete(id);
    }
    this.nodes.delete(id);
    return this;
  }

  updateNode(id, data) {
    const node = this.nodes.get(id);
    if (!node) return this;
    this.nodes.set(id, { ...node, ...data });
    return this;
  }

  getNode(id) {
    return this.nodes.get(id) || null;
  }

  // --- Aristas ---

  addEdge(source, target, data = {}) {
    if (!this.adjList.has(source)) return this;
    if (!this.nodes.has(target)) return this;
    this.adjList.get(source).set(target, {
      weight: '',
      color: '#a855f7',
      isDirected: true,
      ...data
    });
    return this;
  }

  removeEdge(source, target) {
    const neighbors = this.adjList.get(source);
    if (neighbors) neighbors.delete(target);
    return this;
  }

  hasEdge(source, target) {
    const neighbors = this.adjList.get(source);
    return neighbors ? neighbors.has(target) : false;
  }

  getEdge(source, target) {
    const neighbors = this.adjList.get(source);
    return neighbors ? neighbors.get(target) || null : null;
  }

  updateEdge(source, target, data) {
    const edge = this.getEdge(source, target);
    if (!edge) return this;
    this.adjList.get(source).set(target, { ...edge, ...data });
    return this;
  }

  // vecinos de un nodo (a donde apuntan las flechas salientes)
  getNeighbors(id) {
    const neighbors = this.adjList.get(id);
    if (!neighbors) return [];
    return Array.from(neighbors.entries()).map(([targetId, edgeData]) => ({
      nodeId: targetId,
      ...edgeData
    }));
  }

  // --- Derivaciones para rendering y algoritmos ---

  // array plano de nodos (misma forma que el useState viejo)
  getNodesArray() {
    return Array.from(this.nodes.values());
  }

  // array plano de aristas (misma forma que el useState viejo)
  getEdgesArray() {
    const edges = [];
    for (const [source, neighbors] of this.adjList) {
      for (const [target, data] of neighbors) {
        edges.push({ source, target, ...data });
      }
    }
    return edges;
  }

  // matriz de adyacencia - para mostrar y para floyd-warshall etc
  getMatrix() {
    const nodeIds = Array.from(this.nodes.keys());
    const labels = nodeIds.map(id => this.nodes.get(id).label || id.toString());
    const size = nodeIds.length;
    const idToIndex = new Map(nodeIds.map((id, i) => [id, i]));

    // inicializar todo en 0 (sin conexión)
    const matrix = Array.from({ length: size }, () => 
      Array.from({ length: size }, () => 0)
    );

    // llenar con pesos
    for (const [source, neighbors] of this.adjList) {
      const i = idToIndex.get(source);
      for (const [target, data] of neighbors) {
        const j = idToIndex.get(target);
        if (i !== undefined && j !== undefined) {
          const w = data.weight === '' || data.weight === undefined ? 1 : Number(data.weight);
          matrix[i][j] = w;
        }
      }
    }

    return { nodeIds, labels, matrix };
  }

  // siguiente id disponible
  getNextId() {
    if (this.nodes.size === 0) return 1;
    return Math.max(...this.nodes.keys()) + 1;
  }

  // copia profunda (para inmutabilidad en react)
  clone() {
    const copy = new Graph();
    for (const [id, data] of this.nodes) {
      copy.nodes.set(id, { ...data });
    }
    for (const [source, neighbors] of this.adjList) {
      const neighborsCopy = new Map();
      for (const [target, data] of neighbors) {
        neighborsCopy.set(target, { ...data });
      }
      copy.adjList.set(source, neighborsCopy);
    }
    return copy;
  }
}
