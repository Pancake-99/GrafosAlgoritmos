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

  // Comprobar si es un grafo bipartito estricto (solo entradas y salidas)
  getBipartiteData() {
    const { nodeIds, labels, matrix } = this.getMatrix();
    const size = nodeIds.length;
    if (size === 0) return null;

    const inDegrees = new Array(size).fill(0);
    const outDegrees = new Array(size).fill(0);
    const rowSums = new Array(size).fill(0);
    const colSums = new Array(size).fill(0);

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (matrix[i][j] !== 0) {
                outDegrees[i]++;
                inDegrees[j]++;
                rowSums[i] += matrix[i][j];
                colSums[j] += matrix[i][j];
            }
        }
    }

    const inputs = [];
    const outputs = [];
    let hasIntermediate = false;

    for (let i = 0; i < size; i++) {
        const isInput = inDegrees[i] === 0 && outDegrees[i] > 0;
        const isOutput = outDegrees[i] === 0 && inDegrees[i] > 0;
        const isIsolated = inDegrees[i] === 0 && outDegrees[i] === 0;

        if (isIsolated) continue;
        if (!isInput && !isOutput) {
            hasIntermediate = true;
            break;
        }
        if (isInput) inputs.push(i);
        if (isOutput) outputs.push(i);
    }

    if (!hasIntermediate && inputs.length > 0 && outputs.length > 0) {
        return {
            inputs, // indices matriciales
            outputs,
            rowLabels: inputs.map(i => labels[i]),
            colLabels: outputs.map(i => labels[i]),
            subMatrix: inputs.map(i => outputs.map(j => matrix[i][j])),
            bipRowSums: inputs.map(i => rowSums[i]),
            bipColSums: outputs.map(j => colSums[j]),
            inputIds: inputs.map(i => nodeIds[i]),
            outputIds: outputs.map(j => nodeIds[j]),
        };
    }
    
    return null;
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
  solveCPM(startNodeId = null, endNodeId = null) {
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

    // Determinar múltiples inicios y finales
    const sourceNodes = [];
    const sinkNodes = [];
    for (const id of nodeIds) {
      if (predecessors.get(id).length === 0) sourceNodes.push(id);
      if (successors.get(id).length === 0) sinkNodes.push(id);
    }

    // Pedir selección si hay múltiples
    if (!startNodeId && sourceNodes.length > 1) {
      return { requiresStartSelection: true, availableStarts: sourceNodes };
    }
    if (!endNodeId && sinkNodes.length > 1) {
      return { requiresEndSelection: true, availableEnds: sinkNodes };
    }

    // Usar los nodos seleccionados o los únicos disponibles
    const actualStartId = startNodeId || sourceNodes[0];
    const actualEndId = endNodeId || sinkNodes[0];

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
      // Si es el nodo inicial elegido, empieza en 0.
      if (id === actualStartId) {
        es.set(id, 0);
      } else if (preds.length === 0) {
        // Otros nodos huérfanos también empiezan en 0 por defecto (o podríamos ignorarlos)
        es.set(id, 0);
      } else {
        es.set(id, Math.max(...preds.map(p => ef.get(p))));
      }
      ef.set(id, es.get(id) + duration.get(id));
    }

    // La duración del proyecto se basa SIEMPRE en el nodo final seleccionado
    const projectDuration = ef.has(actualEndId) ? ef.get(actualEndId) : Math.max(...topoOrder.map(id => ef.get(id)));

    // paso hacia atras
    const lf = new Map();
    const ls = new Map();
    for (const id of topoOrder.slice().reverse()) {
      const succs = successors.get(id);
      if (id === actualEndId) {
         lf.set(id, projectDuration);
      } else if (succs.length === 0) {
         // Otros nodos finales no seleccionados también terminan al final del proyecto,
         // así reflejan holgura respecto a la entrega global.
         lf.set(id, projectDuration);
      } else {
         lf.set(id, Math.min(...succs.map(s => ls.get(s))));
      }
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

  // --- Hungarian Method (Assignation) ---
  solveHungarian(mode = 'min') {
    const bip = this.getBipartiteData();
    if (!bip) return null;

    const { inputIds, outputIds, subMatrix } = bip;
    const n = inputIds.length;
    const m = outputIds.length;
    const k = Math.max(n, m);
    if (k === 0) return null;

    // We want to minimize cost always. If mode is max, we transform the matrix.
    const INF = 1e9;
    const cost = [];

    let maxVal = 0;
    if (mode === 'max') {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if (subMatrix[i][j] !== 0) {
                    maxVal = Math.max(maxVal, Number(subMatrix[i][j]));
                }
            }
        }
    }

    // Make it a square matrix K x K
    for (let i = 0; i < k; i++) {
        const row = [];
        for (let j = 0; j < k; j++) {
            if (i < n && j < m) {
                const val = subMatrix[i][j];
                if (val === 0) {
                    row.push(INF);
                } else {
                    const numVal = Number(val);
                    row.push(mode === 'max' ? (maxVal - numVal) : numVal);
                }
            } else {
                row.push(mode === 'max' ? maxVal : 0); // Dummy cost for padding
            }
        }
        cost.push(row);
    }

    // O(K^3) Hungarian Algorithm JS Implementation
    const p = new Array(k + 1).fill(0);
    const u = new Array(k + 1).fill(0);
    const v = new Array(k + 1).fill(0);

    for (let i = 1; i <= k; i++) {
        p[0] = i;
        let j0 = 0;
        const minv = new Array(k + 1).fill(Infinity);
        const used = new Array(k + 1).fill(false);
        const way = new Array(k + 1).fill(0);

        do {
            used[j0] = true;
            let i0 = p[j0], delta = Infinity, j1 = 0;

            for (let j = 1; j <= k; j++) {
                if (!used[j]) {
                    const cur = cost[i0 - 1][j - 1] - u[i0] - v[j];
                    if (cur < minv[j]) {
                        minv[j] = cur;
                        way[j] = j0;
                    }
                    if (minv[j] < delta) {
                        delta = minv[j];
                        j1 = j;
                    }
                }
            }

            for (let j = 0; j <= k; j++) {
                if (used[j]) {
                    u[p[j]] += delta;
                    v[j] -= delta;
                } else {
                    minv[j] -= delta;
                }
            }
            j0 = j1;
        } while (p[j0] !== 0);

        do {
            const j1 = way[j0];
            p[j0] = p[j1];
            j0 = j1;
        } while (j0 !== 0);
    }

    const assignedEdges = new Set();
    let totalCost = 0;

    for (let j = 1; j <= k; j++) {
        const c = j - 1; 
        const r = p[j] - 1; 
        if (c < m && r < n && cost[r][c] !== INF) {
            assignedEdges.add(`${inputIds[r]}-${outputIds[c]}`);
            totalCost += Number(subMatrix[r][c]); // Usar peso original
        }
    }

    return { assignedEdges, totalCost, mode };
  }
}
