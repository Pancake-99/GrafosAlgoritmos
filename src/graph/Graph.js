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

  // exportar como objeto plano (para guardar a JSON)
  serialize() {
    return {
      nodes: this.getNodesArray(),
      edges: this.getEdgesArray()
    };
  }

  // reconstruir grafo desde objeto plano
  static deserialize(data) {
    const g = new Graph();
    for (const node of data.nodes) {
      g.addNode(node.id, node);
    }
    for (const edge of data.edges) {
      const { source, target, ...rest } = edge;
      g.addEdge(source, target, rest);
    }
    return g;
  }

  // --- CPM (Critical Path Method) ---
  solveCPM() {
    const nodeIds = Array.from(this.nodes.keys());
    if (nodeIds.length === 0) return null;

    const predecessors = new Map();
    const successors = new Map();
    for (const id of nodeIds) {
      predecessors.set(id, []);
      successors.set(id, []);
    }
    for (const [source, neighbors] of this.adjList) {
      for (const [target] of neighbors) {
        successors.get(source).push(target);
        predecessors.get(target).push(source);
      }
    }

    // orden topologico (Kahn)
    const inDegree = new Map();
    for (const id of nodeIds) {
      inDegree.set(id, predecessors.get(id).length);
    }
    const queue = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }
    const topoOrder = [];
    while (queue.length > 0) {
      const node = queue.shift();
      topoOrder.push(node);
      for (const succ of successors.get(node)) {
        inDegree.set(succ, inDegree.get(succ) - 1);
        if (inDegree.get(succ) === 0) queue.push(succ);
      }
    }

    if (topoOrder.length !== nodeIds.length) return null; // ciclo

    const duration = new Map();
    for (const id of nodeIds) {
      const nd = this.nodes.get(id);
      duration.set(id, parseFloat(nd.cpm?.duration) || 0);
    }

    // paso hacia adelante
    const es = new Map();
    const ef = new Map();
    for (const id of topoOrder) {
      const preds = predecessors.get(id);
      es.set(id, preds.length === 0 ? 0 : Math.max(...preds.map(p => ef.get(p))));
      ef.set(id, es.get(id) + duration.get(id));
    }

    const projectDuration = Math.max(...topoOrder.map(id => ef.get(id)));

    // paso hacia atras
    const lf = new Map();
    const ls = new Map();
    for (const id of topoOrder.slice().reverse()) {
      const succs = successors.get(id);
      lf.set(id, succs.length === 0 ? projectDuration : Math.min(...succs.map(s => ls.get(s))));
      ls.set(id, lf.get(id) - duration.get(id));
    }

    const float = new Map();
    for (const id of nodeIds) {
      float.set(id, ls.get(id) - es.get(id));
    }

    const criticalEdges = new Set();
    for (const [source, neighbors] of this.adjList) {
      for (const [target] of neighbors) {
        if (float.get(source) === 0 && float.get(target) === 0 && ef.get(source) === es.get(target)) {
          criticalEdges.add(`${source}-${target}`);
        }
      }
    }

    const cpmData = new Map();
    for (const id of nodeIds) {
      cpmData.set(id, {
        es: es.get(id),
        ef: ef.get(id),
        ls: ls.get(id),
        lf: lf.get(id),
        float: float.get(id),
        duration: duration.get(id),
      });
    }

    return { cpmData, criticalEdges, projectDuration };
  }
}
