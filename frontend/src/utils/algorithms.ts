import { CITIES } from '@/data';

export interface Edge {
  u: string;
  v: string;
  distance: number;
  time: number;
  toll: number;
}

export const GRAPH_EDGES: Edge[] = [
  { u: 'Delhi Hub', v: 'Baghpat Checkpoint', distance: 47, time: 40, toll: 60 },
  { u: 'Baghpat Checkpoint', v: 'Shamli', distance: 30, time: 25, toll: 40 },
  { u: 'Shamli', v: 'Saharanpur Grid', distance: 45, time: 35, toll: 60 },
  { u: 'Saharanpur Grid', v: 'Dehradun Terminus', distance: 70, time: 60, toll: 100 },
  { u: 'Delhi Hub', v: 'Saharanpur Grid', distance: 170, time: 130, toll: 180 },
];

const nodes = Object.keys(CITIES);

// Helper: Get adjacency list
function getAdjList() {
  const adj: Record<string, { node: string; weight: number; edge: Edge }[]> = {};
  nodes.forEach(n => (adj[n] = []));
  GRAPH_EDGES.forEach(e => {
    adj[e.u].push({ node: e.v, weight: e.distance, edge: e });
    adj[e.v].push({ node: e.u, weight: e.distance, edge: e });
  });
  return adj;
}

// 1. Dijkstra's Algorithm
export function runDijkstra(source: string, destination: string) {
  const adj = getAdjList();
  const dist: Record<string, number> = {};
  const prev: Record<string, { node: string; edge: Edge } | null> = {};
  const unvisited = new Set(nodes);

  nodes.forEach(n => {
    dist[n] = Infinity;
    prev[n] = null;
  });
  dist[source] = 0;

  while (unvisited.size > 0) {
    let curr = null;
    let minDist = Infinity;
    unvisited.forEach(n => {
      if (dist[n] < minDist) {
        minDist = dist[n];
        curr = n;
      }
    });

    if (!curr || minDist === Infinity) break;
    if (curr === destination) break;
    
    unvisited.delete(curr);

    adj[curr].forEach(neighbor => {
      if (!unvisited.has(neighbor.node)) return;
      const alt = dist[curr!] + neighbor.weight;
      if (alt < dist[neighbor.node]) {
        dist[neighbor.node] = alt;
        prev[neighbor.node] = { node: curr!, edge: neighbor.edge };
      }
    });
  }

  const pathEdges: Edge[] = [];
  let curr = destination;
  while (prev[curr]) {
    pathEdges.unshift(prev[curr]!.edge);
    curr = prev[curr]!.node;
  }

  let totalDist = 0, totalTime = 0, totalToll = 0;
  pathEdges.forEach(e => {
    totalDist += e.distance;
    totalTime += e.time;
    totalToll += e.toll;
  });

  return { pathEdges, totalDist, totalTime, totalToll };
}

// 2. Kruskal's Algorithm (MST)
class DisjointSet {
  parent: Record<string, string> = {};
  constructor(nodes: string[]) {
    nodes.forEach(n => (this.parent[n] = n));
  }
  find(i: string): string {
    if (this.parent[i] === i) return i;
    return (this.parent[i] = this.find(this.parent[i]));
  }
  union(i: string, j: string) {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootI] = rootJ;
      return true;
    }
    return false;
  }
}

export function runKruskal() {
  const edges = [...GRAPH_EDGES].sort((a, b) => a.distance - b.distance);
  const ds = new DisjointSet(nodes);
  const mst: Edge[] = [];
  let totalDist = 0;

  edges.forEach(e => {
    if (ds.union(e.u, e.v)) {
      mst.push(e);
      totalDist += e.distance;
    }
  });
  return { mst, totalDist };
}

// 3. Prim's Algorithm (MST)
export function runPrim() {
  const adj = getAdjList();
  const visited = new Set<string>();
  const mst: Edge[] = [];
  let totalDist = 0;

  visited.add(nodes[0]); // Start from any node, e.g., Delhi

  while (visited.size < nodes.length) {
    let minEdge: Edge | null = null;
    let minWeight = Infinity;
    let nextNode = '';

    visited.forEach(u => {
      adj[u].forEach(neighbor => {
        if (!visited.has(neighbor.node) && neighbor.weight < minWeight) {
          minWeight = neighbor.weight;
          minEdge = neighbor.edge;
          nextNode = neighbor.node;
        }
      });
    });

    if (minEdge) {
      visited.add(nextNode);
      mst.push(minEdge);
      totalDist += minWeight;
    } else {
      break;
    }
  }
  return { mst, totalDist };
}

// 4. Bellman-Ford Algorithm
export function runBellmanFord(source: string) {
  const dist: Record<string, number> = {};
  nodes.forEach(n => (dist[n] = Infinity));
  dist[source] = 0;

  // We test on toll to find negative cycle (arbitrage)
  // For demonstration, graph edges are treated as directed for cycle check
  for (let i = 0; i < nodes.length - 1; i++) {
    GRAPH_EDGES.forEach(e => {
      if (dist[e.u] !== Infinity && dist[e.u] + e.toll < dist[e.v]) {
        dist[e.v] = dist[e.u] + e.toll;
      }
      // Undirected graph logic
      if (dist[e.v] !== Infinity && dist[e.v] + e.toll < dist[e.u]) {
        dist[e.u] = dist[e.v] + e.toll;
      }
    });
  }

  // Check negative cycle
  let hasNegativeCycle = false;
  GRAPH_EDGES.forEach(e => {
    if (dist[e.u] !== Infinity && dist[e.u] + e.toll < dist[e.v]) {
      hasNegativeCycle = true;
    }
  });

  return { dist, hasNegativeCycle };
}
